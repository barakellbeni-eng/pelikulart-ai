import { useState, useMemo } from 'react';
import { Send, Loader2, Check, Mail, User, Phone, MessageSquare, Plus, Minus, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice } from '@/lib/formatPrice';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyFWlPli6vwIWKnT4rX9U79npcbo3qEeFf6Ea67-T1GXnx03phh055XQqNTTXStcvTnzg/exec';

const SERVICES_DATA = [
  {
    id: 'video',
    title: 'PRODUCTION VIDÉO (IA)',
    items: [
      { id: 'clip_complet', name: 'Clip musical complet', price: 250000, description: 'Réalisation complète par IA' },
      { id: 'visualizer', name: 'Visualiseur/Clip avec paroles', price: 100000, description: 'Animation rythmique sur les paroles' },
      { id: 'trailer', name: 'Bande-annonce et extraits verticaux', price: 50000, hasQuantity: true, packPrice: 150000, packSize: 5, description: 'Format optimisé pour réseaux sociaux (Pack de 5 à 150 000 FCFA)' },
      { id: 'vjing', name: 'Visuels de lunettes/VJing', price: 75000, description: 'Boucles visuelles pour spectacles' },
      { id: 'ads', name: 'Publicité et contenu de marque', price: 100000, description: 'Spot publicitaire impactant' },
      { id: 'docu', name: 'Documentaire/Fiction 10 minutes', price: 200000, description: 'Narratif court format' },
    ],
  },
  {
    id: 'audio',
    title: 'SERVICES AUDIO (IA)',
    items: [
      { id: 'voice_cloning', name: 'Voix IA et clonage vocal', price: 30000, description: 'Narration ou chant par IA' },
    ],
  },
  {
    id: 'creative',
    title: 'DIRECTION CRÉATIVE (IA)',
    items: [
      { id: 'art_direction', name: 'Direction Artistique & Storyboarding', price: 40000, description: 'Concept et planche de tendance' },
    ],
  },
  {
    id: 'training',
    title: 'FORMATIONS (IA)',
    items: [
      { id: 'starter', name: 'STARTER – FORMATION + GROUPE PRIVÉ', price: 25000, description: 'Initiation et communauté' },
      { id: 'pro_ia', name: 'PRO IA – ABONNEMENT ANNUEL', price: 50000, description: 'Accès expert pendant 1 an' },
      { id: 'elite', name: 'ELITE COACHING – CINÉMA/CLIP/PROD', price: 100000, description: 'Accompagnement personnalisé' },
    ],
  },
];

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  description: string;
  hasQuantity?: boolean;
  packPrice?: number;
  packSize?: number;
}

const QuoteForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>({ trailer: 1 });
  const [formData, setFormData] = useState({ nom: '', email: '', phone: '', message: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = {
    nom: !formData.nom.trim() ? "Le nom est requis" : null,
    email: !formData.email.trim() ? "L'email est requis" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? "Email invalide" : null,
    phone: !formData.phone.trim() ? "Le téléphone est requis" : null,
  };

  const toggleService = (id: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedServices(newSelected);
  };

  const updateQuantity = (id: string, delta: number) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) + delta) }));
  };

  const handleBlur = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  const { total, cartItems } = useMemo(() => {
    let sum = 0;
    const items: { name: string; price: number; quantity: number; unitPrice: number }[] = [];

    SERVICES_DATA.forEach(category => {
      category.items.forEach((item: ServiceItem) => {
        if (selectedServices.has(item.id)) {
          let price = item.price;
          let qty = 1;

          if (item.hasQuantity) {
            qty = quantities[item.id] || 1;
            if (item.packPrice && item.packSize) {
              const packs = Math.floor(qty / item.packSize);
              const remainder = qty % item.packSize;
              price = (packs * item.packPrice) + (remainder * item.price);
            } else {
              price = qty * item.price;
            }
          }

          sum += price;
          items.push({ name: item.name, price, quantity: qty, unitPrice: item.price });
        }
      });
    });

    return { total: sum, cartItems: items };
  }, [selectedServices, quantities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ nom: true, email: true, phone: true, message: true });

    if (errors.nom || errors.email || errors.phone) {
      toast({ variant: "destructive", title: "Formulaire incomplet", description: "Veuillez vérifier les champs rouges." });
      return;
    }

    if (selectedServices.size === 0) {
      toast({ variant: "destructive", title: "Aucun service", description: "Veuillez sélectionner au moins un service." });
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.nom);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('message', formData.message || "Aucun message");
      data.append('cart', JSON.stringify(cartItems.map(s => `${s.name} x${s.quantity} (${formatPrice(s.price)})`)));
      data.append('totalPriceRaw', total.toString());
      data.append('selectedServices', JSON.stringify(cartItems));

      await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: data });

      toast({
        title: "Devis envoyé avec succès !",
        description: "Vérifiez votre boîte mail pour la confirmation.",
        className: "bg-primary text-primary-foreground border-none",
      });

      setFormData({ nom: '', email: '', phone: '', message: '' });
      setSelectedServices(new Set());
      setQuantities({ trailer: 1 });
      setTouched({});
    } catch (error) {
      console.error("Erreur d'envoi:", error);
      toast({ variant: "destructive", title: "Erreur d'envoi", description: "Vérifiez votre connexion internet ou réessayez." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 p-0 md:p-4">
      {/* Service Selection */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 md:p-8 bg-gradient-to-r from-muted/50 to-transparent border-b border-border">
          <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-3">
            <span className="bg-primary text-primary-foreground text-xs md:text-sm px-3 py-1 rounded-full font-black uppercase tracking-wider">Étape 1</span>
            Sélectionnez vos services
          </h2>
        </div>

        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
          {SERVICES_DATA.map((category) => (
            <div key={category.id} className="space-y-4">
              <h3 className="text-primary font-bold uppercase tracking-widest text-xs md:text-sm border-l-2 border-primary pl-3">
                {category.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {category.items.map((item) => {
                  const isSelected = selectedServices.has(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => !item.hasQuantity && toggleService(item.id)}
                      className={`
                        relative group rounded-xl p-4 border transition-all duration-300 cursor-pointer min-h-[100px]
                        ${isSelected
                          ? 'bg-primary/10 border-primary shadow-[0_0_15px_hsl(var(--primary)/0.1)]'
                          : 'bg-muted/30 border-border hover:border-muted-foreground/30 hover:bg-muted/50'}
                      `}
                    >
                      <div className="flex items-start gap-4 h-full">
                        <div
                          onClick={(e) => { e.stopPropagation(); toggleService(item.id); }}
                          className={`
                            mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all
                            ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30 text-transparent'}
                          `}
                        >
                          <Check size={14} strokeWidth={4} />
                        </div>

                        <div className="flex-1 space-y-2 flex flex-col h-full">
                          <h4 className={`font-bold text-sm ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>{item.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-3 flex-grow">{item.description}</p>
                          <div className="pt-2 flex items-center justify-between mt-auto">
                            <span className="text-primary font-mono font-bold text-sm md:text-base">{formatPrice(item.price)}</span>
                            {item.hasQuantity && isSelected && (
                              <div className="flex items-center gap-3 bg-background/40 rounded-lg p-1 border border-border" onClick={e => e.stopPropagation()}>
                                <button type="button" onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted text-foreground">
                                  <Minus size={14} />
                                </button>
                                <span className="text-sm font-mono text-foreground w-4 text-center">{quantities[item.id] || 1}</span>
                                <button type="button" onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted text-foreground">
                                  <Plus size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                          {item.id === 'trailer' && isSelected && (
                            <div className="text-[10px] text-green-400 mt-1 flex items-center gap-1">
                              <Info size={10} /> Offre Pack: 5 pour {formatPrice(150000)}
                            </div>
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

      {/* Form & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
        {/* Form Fields */}
        <div className="md:col-span-2 glass-card overflow-hidden order-2 md:order-1">
          <div className="p-5 md:p-8 bg-gradient-to-r from-muted/50 to-transparent border-b border-border">
            <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-3">
              <span className="bg-foreground text-background text-xs md:text-sm px-3 py-1 rounded-full font-black uppercase tracking-wider">Étape 2</span>
              Vos Informations
            </h2>
          </div>

          <form className="p-5 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { name: 'nom', label: 'Nom Complet', icon: User, type: 'text', placeholder: 'Votre nom' },
                { name: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'contact@exemple.com' },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">{field.label}</label>
                  <div className="relative">
                    <field.icon className="absolute left-3 top-3.5 text-muted-foreground/30" size={18} />
                    <input
                      type={field.type}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                      onBlur={() => handleBlur(field.name)}
                      placeholder={field.placeholder}
                      className={`
                        w-full bg-background/50 border rounded-xl pl-10 pr-4 py-3.5 text-base text-foreground placeholder-muted-foreground/30
                        focus:outline-none focus:ring-1 transition-all min-h-[44px]
                        ${touched[field.name] && errors[field.name as keyof typeof errors] ? 'border-destructive/50 focus:border-destructive' : 'border-border focus:border-primary'}
                      `}
                    />
                  </div>
                </div>
              ))}

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Téléphone (WhatsApp)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 text-muted-foreground/30" size={18} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    onBlur={() => handleBlur('phone')}
                    placeholder="+225 07..."
                    className={`
                      w-full bg-background/50 border rounded-xl pl-10 pr-4 py-3.5 text-base text-foreground placeholder-muted-foreground/30
                      focus:outline-none focus:ring-1 transition-all min-h-[44px]
                      ${touched.phone && errors.phone ? 'border-destructive/50 focus:border-destructive' : 'border-border focus:border-primary'}
                    `}
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Message (Optionnel)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3.5 text-muted-foreground/30" size={18} />
                  <textarea
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    placeholder="Détails de votre projet..."
                    className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-3.5 text-base text-foreground placeholder-muted-foreground/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Summary */}
        <div className="md:col-span-1 space-y-6 md:sticky md:top-24 order-1 md:order-2">
          <div className="bg-primary rounded-2xl md:rounded-3xl p-6 shadow-[0_0_30px_hsl(var(--primary)/0.15)] text-primary-foreground relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold uppercase tracking-widest text-xs mb-4 opacity-70 border-b border-primary-foreground/10 pb-2">Total Estimé</h3>
              <div className="text-3xl md:text-4xl font-black mb-1 tracking-tight">{formatPrice(total)}</div>
              <p className="text-xs opacity-70 mb-6">{cartItems.length} service(s) sélectionné(s)</p>

              <div className="space-y-2 mb-6">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-medium border-b border-primary-foreground/5 pb-1 last:border-0">
                    <span className="truncate pr-2">{item.name} {item.quantity > 1 && `(x${item.quantity})`}</span>
                    <span className="opacity-60 whitespace-nowrap">{formatPrice(item.price)}</span>
                  </div>
                ))}
                {cartItems.length === 0 && <span className="text-xs opacity-40 italic">Aucun service</span>}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`
                  w-full py-4 rounded-xl font-black uppercase tracking-wider text-sm
                  flex items-center justify-center gap-2 transition-all shadow-lg min-h-[50px]
                  ${loading
                    ? 'bg-primary-foreground/10 text-primary-foreground/40 cursor-not-allowed'
                    : 'bg-primary-foreground text-primary hover:bg-background hover:text-foreground hover:scale-[1.02]'}
                `}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Envoyer le Devis <Send size={20} /></>}
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-foreground/20 rounded-full blur-2xl pointer-events-none" />
          </div>

          <div className="text-[10px] text-center text-muted-foreground max-w-[250px] mx-auto">
            En cliquant sur envoyer, vous acceptez de recevoir une estimation par email.
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteForm;
