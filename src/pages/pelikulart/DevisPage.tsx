import { useState, useMemo } from "react";
import { Send, Loader2, Check, Mail, User, Phone, MessageSquare, Plus, Minus, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatPrice, generateClientEmail, generateAdminEmail } from "@/utils/emailTemplates";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyFWlPli6vwIWKnT4rX9U79npcbo3qEeFf6Ea67-T1GXnx03phh055XQqNTTXStcvTnzg/exec";

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  description: string;
  hasQuantity?: boolean;
  packPrice?: number;
  packSize?: number;
}

const SERVICES_DATA = [
  {
    id: "video", title: "PRODUCTION VIDÉO (IA)", items: [
      { id: "clip_complet", name: "Clip musical complet", price: 250000, description: "Réalisation complète par IA" },
      { id: "visualizer", name: "Visualiseur/Clip avec paroles", price: 100000, description: "Animation rythmique sur les paroles" },
      { id: "trailer", name: "Bande-annonce et extraits verticaux", price: 50000, hasQuantity: true, packPrice: 150000, packSize: 5, description: "Format optimisé pour réseaux sociaux (Pack de 5 à 150 000 FCFA)" },
      { id: "vjing", name: "Visuels de lunettes/VJing", price: 75000, description: "Boucles visuelles pour spectacles" },
      { id: "ads", name: "Publicité et contenu de marque", price: 100000, description: "Spot publicitaire impactant" },
      { id: "docu", name: "Documentaire/Fiction 10 minutes", price: 200000, description: "Narratif court format" },
    ] as ServiceItem[]
  },
  { id: "audio", title: "SERVICES AUDIO (IA)", items: [{ id: "voice_cloning", name: "Voix IA et clonage vocal", price: 30000, description: "Narration ou chant par IA" }] as ServiceItem[] },
  { id: "creative", title: "DIRECTION CRÉATIVE (IA)", items: [{ id: "art_direction", name: "Direction Artistique & Storyboarding", price: 40000, description: "Concept et planche de tendance" }] as ServiceItem[] },
  {
    id: "training", title: "FORMATIONS (IA)", items: [
      { id: "starter", name: "STARTER – FORMATION + GROUPE PRIVÉ", price: 25000, description: "Initiation et communauté" },
      { id: "pro_ia", name: "PRO IA – ABONNEMENT ANNUEL", price: 50000, description: "Accès expert pendant 1 an" },
      { id: "elite", name: "ELITE COACHING – CINÉMA/CLIP/PROD", price: 100000, description: "Accompagnement personnalisé" },
    ] as ServiceItem[]
  },
];

const DevisPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState(new Set<string>());
  const [quantities, setQuantities] = useState<Record<string, number>>({ trailer: 1 });
  const [formData, setFormData] = useState({ nom: "", email: "", phone: "", message: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = {
    nom: !formData.nom.trim() ? "Requis" : null,
    email: !formData.email.trim() ? "Requis" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? "Email invalide" : null,
    phone: !formData.phone.trim() ? "Requis" : null,
  };

  const toggleService = (id: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(id)) newSelected.delete(id); else newSelected.add(id);
    setSelectedServices(newSelected);
  };

  const updateQuantity = (id: string, delta: number) => setQuantities((prev) => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) + delta) }));

  const { total, cartItems } = useMemo(() => {
    let sum = 0;
    const items: Array<{ name: string; price: number; quantity: number }> = [];
    SERVICES_DATA.forEach((cat) => cat.items.forEach((item) => {
      if (selectedServices.has(item.id)) {
        let price = item.price;
        let qty = 1;
        if (item.hasQuantity) {
          qty = quantities[item.id] || 1;
          if (item.packPrice && item.packSize) {
            const packs = Math.floor(qty / item.packSize);
            const remainder = qty % item.packSize;
            price = packs * item.packPrice + remainder * item.price;
          } else { price = qty * item.price; }
        }
        sum += price;
        items.push({ name: item.name, price, quantity: qty });
      }
    }));
    return { total: sum, cartItems: items };
  }, [selectedServices, quantities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ nom: true, email: true, phone: true, message: true });
    if (errors.nom || errors.email || errors.phone) { toast({ variant: "destructive", title: "Formulaire incomplet" }); return; }
    if (selectedServices.size === 0) { toast({ variant: "destructive", title: "Aucun service sélectionné" }); return; }
    setLoading(true);
    try {
      const whatsappLink = `https://wa.me/2250799332338?text=${encodeURIComponent(`Bonjour, je suis ${formData.nom}. Je souhaite discuter de mon devis pour : ${cartItems.map((i) => i.name).join(", ")}`)}`;
      const clientEmailHtml = generateClientEmail({ nom: formData.nom, selectedServices: cartItems, totalPrice: total, whatsappLink, description: formData.message });
      const adminEmailHtml = generateAdminEmail({ nom: formData.nom, email: formData.email, description: `Tel: ${formData.phone}\n\n${formData.message}`, selectedServices: cartItems, totalPrice: total });
      const data = new FormData();
      data.append("name", formData.nom); data.append("email", formData.email); data.append("phone", formData.phone);
      data.append("message", formData.message || "Aucun message"); data.append("totalPriceRaw", total.toString());
      data.append("whatsapp_link", whatsappLink); data.append("client_email_html", clientEmailHtml); data.append("admin_email_html", adminEmailHtml);
      data.append("selectedServices", JSON.stringify(cartItems));
      await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: data });
      toast({ title: "Devis envoyé avec succès !", description: "Vérifiez votre boîte mail.", className: "bg-lime text-black border-none" });
      setFormData({ nom: "", email: "", phone: "", message: "" }); setSelectedServices(new Set()); setQuantities({ trailer: 1 }); setTouched({});
    } catch { toast({ variant: "destructive", title: "Erreur d'envoi" }); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 space-y-6 md:space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Demande de <span className="text-lime">Devis</span></h1>
          <p className="text-white/60">Sélectionnez vos services et recevez une estimation personnalisée.</p>
        </div>

        {/* Service Selection */}
        <div className="bg-dark-lighter border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-5 md:p-8 bg-gradient-to-r from-white/5 to-transparent border-b border-white/10">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <span className="bg-lime text-black text-xs px-3 py-1 rounded-full font-black uppercase">Étape 1</span>
              Sélectionnez vos services
            </h2>
          </div>
          <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            {SERVICES_DATA.map((category) => (
              <div key={category.id} className="space-y-4">
                <h3 className="text-lime font-bold uppercase tracking-widest text-xs border-l-2 border-lime pl-3">{category.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {category.items.map((item) => {
                    const isSelected = selectedServices.has(item.id);
                    return (
                      <div key={item.id} onClick={() => !item.hasQuantity && toggleService(item.id)}
                        className={`relative group rounded-xl p-4 border transition-all cursor-pointer ${isSelected ? "bg-lime/10 border-lime shadow-[0_0_15px_rgba(204,255,0,0.1)]" : "bg-white/5 border-white/5 hover:border-white/20"}`}>
                        <div className="flex items-start gap-4">
                          <div onClick={(e) => { e.stopPropagation(); toggleService(item.id); }}
                            className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? "bg-lime border-lime text-black" : "border-white/30 text-transparent"}`}>
                            <Check size={14} strokeWidth={4} />
                          </div>
                          <div className="flex-1 space-y-2">
                            <h4 className={`font-bold text-sm ${isSelected ? "text-white" : "text-gray-300"}`}>{item.name}</h4>
                            <p className="text-xs text-gray-500">{item.description}</p>
                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-lime font-mono font-bold text-sm">{formatPrice(item.price)}</span>
                              {item.hasQuantity && isSelected && (
                                <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1 border border-white/10" onClick={(e) => e.stopPropagation()}>
                                  <button type="button" onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-white"><Minus size={14} /></button>
                                  <span className="text-sm font-mono text-white w-4 text-center">{quantities[item.id] || 1}</span>
                                  <button type="button" onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-white"><Plus size={14} /></button>
                                </div>
                              )}
                            </div>
                            {item.id === "trailer" && isSelected && (
                              <div className="text-[10px] text-green-400 mt-1 flex items-center gap-1"><Info size={10} /> Offre Pack: 5 pour {formatPrice(150000)}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form + Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 bg-dark-lighter border border-white/10 rounded-2xl overflow-hidden shadow-2xl order-2 md:order-1">
            <div className="p-5 md:p-8 bg-gradient-to-r from-white/5 to-transparent border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-3">
                <span className="bg-white text-black text-xs px-3 py-1 rounded-full font-black uppercase">Étape 2</span>
                Vos Informations
              </h2>
            </div>
            <form className="p-5 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { key: "nom", label: "Nom Complet", icon: User, type: "text", placeholder: "Votre nom" },
                  { key: "email", label: "Email", icon: Mail, type: "email", placeholder: "contact@exemple.com" },
                ].map(({ key, label, icon: Icon, type, placeholder }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-3.5 text-white/20" size={18} />
                      <input type={type} value={formData[key as keyof typeof formData]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} onBlur={() => setTouched((p) => ({ ...p, [key]: true }))} placeholder={placeholder}
                        className={`w-full bg-black/50 border rounded-xl pl-10 pr-4 py-3.5 text-base text-white placeholder-white/20 focus:outline-none focus:ring-1 transition-all ${touched[key] && errors[key as keyof typeof errors] ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-lime"}`} />
                    </div>
                  </div>
                ))}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Téléphone (WhatsApp)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 text-white/20" size={18} />
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} onBlur={() => setTouched((p) => ({ ...p, phone: true }))} placeholder="+225 07..."
                      className={`w-full bg-black/50 border rounded-xl pl-10 pr-4 py-3.5 text-base text-white placeholder-white/20 focus:outline-none focus:ring-1 ${touched.phone && errors.phone ? "border-red-500/50" : "border-white/10 focus:border-lime"}`} />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Message (Optionnel)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3.5 text-white/20" size={18} />
                    <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={4} placeholder="Détails de votre projet..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-base text-white placeholder-white/20 focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime/20 resize-none" />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="md:col-span-1 space-y-6 md:sticky md:top-24 order-1 md:order-2">
            <div className="bg-lime rounded-2xl p-6 shadow-[0_0_30px_rgba(204,255,0,0.15)] text-black relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold uppercase tracking-widest text-xs mb-4 opacity-70 border-b border-black/10 pb-2">Total Estimé</h3>
                <div className="text-3xl md:text-4xl font-black mb-1">{formatPrice(total)}</div>
                <p className="text-xs opacity-70 mb-6">{cartItems.length} service(s)</p>
                <div className="space-y-2 mb-6">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs font-medium border-b border-black/5 pb-1 last:border-0">
                      <span className="truncate pr-2">{item.name} {item.quantity > 1 && `(x${item.quantity})`}</span>
                      <span className="opacity-60 whitespace-nowrap">{formatPrice(item.price)}</span>
                    </div>
                  ))}
                  {cartItems.length === 0 && <span className="text-xs opacity-40 italic">Aucun service</span>}
                </div>
                <button onClick={handleSubmit} disabled={loading}
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all shadow-lg min-h-[50px] ${loading ? "bg-black/10 text-black/40 cursor-not-allowed" : "bg-black text-white hover:bg-white hover:text-black hover:scale-[1.02]"}`}>
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <>Envoyer le Devis <Send size={20} /></>}
                </button>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-2xl pointer-events-none" />
            </div>
            <div className="text-[10px] text-center text-gray-500 max-w-[250px] mx-auto">En cliquant sur envoyer, vous acceptez de recevoir une estimation par email.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevisPage;
