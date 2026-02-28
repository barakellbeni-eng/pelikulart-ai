import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info, Loader2, Send, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { servicePrices } from "@/data/servicePrices";
import { generateClientEmail, generateAdminEmail, formatPrice } from "@/utils/emailTemplates";

const PremiumServiceSelector = () => {
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = useState<Array<{ id: string; name: string; price: number }>>([]);
  const [formData, setFormData] = useState({ nom: "", email: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRgpd, setShowRgpd] = useState(false);

  const toggleService = (service: { id: string; name: string; price: number }) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id);
      return exists ? prev.filter((s) => s.id !== service.id) : [...prev, service];
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculateTotal = () => selectedServices.reduce((sum, item) => sum + item.price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      toast({ variant: "destructive", title: "Aucune sélection", description: "Veuillez sélectionner au moins un service." });
      return;
    }
    if (!formData.nom || !formData.email || !formData.description) {
      toast({ variant: "destructive", title: "Champs manquants", description: "Veuillez remplir tous les champs." });
      return;
    }

    setIsSubmitting(true);
    const totalPrice = calculateTotal();
    const whatsappLink = "https://wa.me/2250799332338";

    const clientEmailHtml = generateClientEmail({ nom: formData.nom, selectedServices, totalPrice, whatsappLink, description: formData.description });
    const adminEmailHtml = generateAdminEmail({ nom: formData.nom, email: formData.email, description: formData.description, selectedServices, totalPrice });

    const cart = selectedServices.map((s) => `${s.name} (${formatPrice(s.price)})`);

    try {
      await fetch("https://script.google.com/macros/s/AKfycby7ANDyGdME3TLiVT1qo7fGkp9b38PmMvRP4j96OcpeURFZV495XmHrGlCayEn0VM_LAA/exec", {
        method: "POST",
        body: JSON.stringify({
          name: formData.nom, email: formData.email, message: formData.description,
          cart, nom: formData.nom, description: formData.description,
          selectedServices: selectedServices.map((s) => ({ name: s.name, price: s.price })),
          totalPriceRaw: totalPrice, whatsapp_link: whatsappLink,
          client_email_html: clientEmailHtml, admin_email_html: adminEmailHtml,
          date: new Date().toISOString(),
        }),
        headers: { "Content-Type": "application/json" },
      });

      toast({ title: "Demande envoyée !", description: "Votre devis a été envoyé. Vérifiez votre email.", className: "bg-lime text-black border-none" });
      setFormData({ nom: "", email: "", description: "" });
      setSelectedServices([]);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Une erreur est survenue lors de l'envoi." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="devis" className="py-24 bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-lime/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/10 border border-lime/20 text-lime text-sm font-medium mb-4">
            <Sparkles size={14} /><span>Configurateur de Projet</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">
            CRÉEZ VOTRE <span className="text-lime">OFFRE SUR MESURE</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">Sélectionnez les services dont vous avez besoin pour construire votre projet idéal.</p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          <div className="xl:col-span-2 space-y-12">
            {servicePrices.map((category, catIndex) => (
              <motion.div key={catIndex} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: catIndex * 0.1 }}>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-lime rounded-full"></span>
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((service) => {
                    const isSelected = selectedServices.some((s) => s.id === service.id);
                    return (
                      <motion.div key={service.id} onClick={() => toggleService(service)} whileHover={{ y: -5 }}
                        className={`relative p-6 rounded-xl border cursor-pointer group overflow-hidden transition-all duration-300 ${
                          isSelected ? "bg-black border-lime shadow-[0_0_20px_rgba(204,255,0,0.3)]" : "bg-white/[0.03] border-white/10 hover:border-lime/30 hover:bg-white/5"
                        }`}>
                        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                          isSelected ? "bg-lime border-lime" : "border-white/20"}`}>
                          {isSelected && <Check size={14} className="text-black" strokeWidth={3} />}
                        </div>
                        <div className="pr-8">
                          <h4 className={`font-bold mb-2 transition-colors ${isSelected ? "text-white" : "text-white/90"}`}>{service.name}</h4>
                          <p className="text-xs text-white/50 leading-relaxed">{service.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="xl:col-span-1">
            <div className="sticky top-8">
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="bg-dark-lighter border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-lime to-transparent opacity-50" />
                <div className="mb-8 pb-8 border-b border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60">Services sélectionnés</span>
                    <span className="bg-lime text-black text-xs font-bold px-2 py-1 rounded-md">{selectedServices.length}</span>
                  </div>
                  {selectedServices.length > 0 ? (
                    <ul className="space-y-2 mt-4 max-h-[200px] overflow-y-auto pr-2">
                      {selectedServices.map((s) => (
                        <li key={s.id} className="text-sm text-white flex items-start gap-2">
                          <Check size={14} className="text-lime mt-1 shrink-0" />
                          <span className="line-clamp-1">{s.name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-white/30 italic mt-4">Aucun service sélectionné</p>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-lime mb-1.5 uppercase tracking-wide">Nom Complet</label>
                    <input type="text" name="nom" value={formData.nom} onChange={handleChange} required
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime transition-all text-sm" placeholder="Votre nom" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-lime mb-1.5 uppercase tracking-wide">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime transition-all text-sm" placeholder="exemple@email.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-lime mb-1.5 uppercase tracking-wide">Message</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required rows={3}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime transition-all text-sm resize-none" placeholder="Détails de votre projet..." />
                  </div>
                  <div className="flex items-start gap-2 mt-2">
                    <Info size={14} className="text-white/40 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-white/40 leading-tight">
                      En soumettant ce formulaire, vous acceptez notre <button type="button" onClick={() => setShowRgpd(true)} className="text-lime hover:underline">politique de confidentialité</button>.
                    </p>
                  </div>
                  <button type="submit" disabled={isSubmitting}
                    className="w-full bg-lime text-black font-bold py-4 rounded-xl uppercase tracking-wider hover:bg-white transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(204,255,0,0.2)] flex items-center justify-center gap-2 mt-4">
                    {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Envoi...</> : <>Envoyer la demande <Send size={18} /></>}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showRgpd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowRgpd(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()} className="bg-dark-lighter border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 md:p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Politique de Confidentialité</h3>
              <div className="text-white/70 text-sm space-y-3">
                <p>Vos données sont collectées uniquement pour répondre à votre demande de devis.</p>
                <p>Elles ne seront jamais vendues à des tiers.</p>
                <p>Vous disposez d'un droit d'accès, de modification et de suppression sur simple demande.</p>
              </div>
              <button onClick={() => setShowRgpd(false)} className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm">Fermer</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PremiumServiceSelector;
