import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Star, Crown, GraduationCap, ShieldCheck, Clock, Gem, Layers, Quote, Check, Hourglass } from "lucide-react";
import paymentMethodsImg from "@/assets/payment-methods.png";
import { Button } from "@/components/ui/button";
import PaymentModal from "@/components/pelikulart/PaymentModal";
import TrainingFAQ from "@/components/pelikulart/TrainingFAQ";
import PromotionalBanner from "@/components/pelikulart/PromotionalBanner";
import FloatingPricingBar from "@/components/pelikulart/FloatingPricingBar";
import type { LucideIcon } from "lucide-react";

interface PricingOption {
  id: string;
  shortTitle: string;
  title: string;
  price: string;
  amount: number;
  tagline: string;
  clientResult: string;
  icon: LucideIcon;
  features: string[];
  highlight: boolean;
  period?: string;
  styles: { text: string; bg: string; check: string; marker: string };
}

const TrainingPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<PricingOption | null>(null);

  const pricingOptions: PricingOption[] = [
    {
      id: "starter", shortTitle: "STARTER", title: "STARTER", price: "25 000", amount: 25000,
      tagline: "Pour poser des bases solides.", clientResult: "Maîtrise les fondamentaux de la création visuelle IA pour être autonome à vie.",
      icon: Zap, features: ["Vidéos de formation : Accès illimité et à vie", "Contenu : Maîtrise complète des images et vidéos IA", "Support : Accès au groupe WhatsApp d'entraide (3 mois)"],
      highlight: false, styles: { text: "text-lime", bg: "bg-lime/10", check: "text-lime", marker: "bg-lime" },
    },
    {
      id: "pro", shortTitle: "PRO IA", title: "PRO IA", price: "50 000", amount: 50000, period: "/ AN",
      tagline: "Pour évoluer avec la technologie.", clientResult: "Reste toujours compétitif grâce aux mises à jour constantes sur les outils IA.",
      icon: Star, features: ["Vidéos de formation : Accès illimité et à vie", "Mises à jour IA : Nouvelles leçons incluses (1 an)", "Support : Assistance réactive WhatsApp (1 an)"],
      highlight: true, styles: { text: "text-blue-500", bg: "bg-blue-500/10", check: "text-blue-500", marker: "bg-blue-500" },
    },
    {
      id: "elite", shortTitle: "COACHING ELITE", title: "COACHING ELITE", price: "100 000", amount: 100000,
      tagline: "L'excellence pour devenir un pro rentable.", clientResult: "Transforme ta passion en business rentable avec un accompagnement stratégique.",
      icon: Crown, features: ["Coaching Direct : 3 mois de suivi personnalisé", "Vidéos de formation : Accès illimité et à vie", "Bonus PRO : 1 an de mises à jour technologiques", "Business : Stratégie de monétisation & DA pro"],
      highlight: false, styles: { text: "text-red-500", bg: "bg-red-500/10", check: "text-red-500", marker: "bg-red-500" },
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState(pricingOptions[1]);

  const handlePaymentClick = (plan: PricingOption) => {
    setSelectedPlanForPayment(plan);
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = (customerData: { email: string; name: string; trainingName: string }) => {
    navigate("/secret-page", {
      state: { email: customerData.email, name: customerData.name, trainingName: selectedPlanForPayment?.title, code: "MINORITE" },
    });
  };

  const mappedPlans = pricingOptions.map((opt) => ({
    id: opt.id, name: opt.shortTitle, title: opt.title, price: opt.price, amount: opt.amount,
    icon: opt.icon, description: opt.tagline, tagline: opt.tagline, highlight: opt.highlight,
  }));

  const courseModules = ["Introduction & Prise en main", "Génération d'Images", "L'Art du Mouvement", "Contrôle Créatif Avancé", "Post-Production IA", "Audio & Musique"];

  return (
    <>
      <PaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} trainingPlan={selectedPlanForPayment ? { name: selectedPlanForPayment.title, amount: selectedPlanForPayment.amount } : null} onSuccess={handlePaymentSuccess} />

      <div className="pt-20 min-h-screen bg-black text-white pb-[220px] md:pb-0">
        <div className="mb-0"><PromotionalBanner /></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-12 relative">
            {/* LEFT COLUMN */}
            <div className="w-full lg:w-[70%] space-y-16">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-lime/10 text-lime rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap size={14} /> Formation
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                  MAÎTRISEZ LA RÉVOLUTION VISUELLE : <span className="text-lime">FORMATION COMPLÈTE</span>
                </h1>
                <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-3xl">
                  Ne regardez plus le futur, créez-le. Choisissez votre niveau d'accompagnement et commencez dès maintenant.
                </p>
              </div>

              <div className="w-full px-4 md:px-8 lg:px-12">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/50 group">
                  <img src="https://horizons-cdn.hostinger.com/d31bf9b1-67d6-4ebd-ba27-4c85d5d4bb06/freepik__tu-ajoute-titre-matrisez-la-rvolution-visuelle-for__35272-copie-aOC9X.jpg" alt="Formation Réalisateur IA 2.0" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                </div>
              </div>

              <div className="bg-lime/5 rounded-xl p-6 flex items-start md:items-center gap-4">
                <div className="bg-lime/10 p-3 rounded-full"><Hourglass size={24} className="text-lime" /></div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">3 heures de cours intensifs</h3>
                  <p className="text-white/70">Un programme séquencé et optimisé qui explique tout le processus de A à Z.</p>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Programme de la <span className="text-lime">Formation</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courseModules.map((moduleName, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-lime/10 text-lime font-bold text-xs shrink-0">{index + 1}</span>
                      <h3 className="text-white font-medium">{moduleName}</h3>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Pourquoi nous choisir ?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[{ title: "Gain de temps", icon: Clock, desc: "Automatisez votre workflow" }, { title: "Qualité Premium", icon: Gem, desc: "Résultats studio pro" }, { title: "Polyvalence", icon: Layers, desc: "Image, vidéo & son" }].map((item, idx) => (
                    <div key={idx} className="p-6 rounded-xl bg-white/5 text-center">
                      <div className="w-12 h-12 rounded-full bg-lime/10 text-lime flex items-center justify-center mx-auto mb-4"><item.icon size={24} /></div>
                      <h3 className="font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-white/50 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative p-8 rounded-2xl bg-white/5">
                <Quote className="absolute top-4 left-4 text-lime/20" size={40} />
                <blockquote className="relative z-10 text-center">
                  <p className="text-xl font-bold text-white italic mb-4">"L'IA ne remplacera pas les créateurs, mais les créateurs qui utilisent l'IA remplaceront ceux qui ne le font pas."</p>
                  <cite className="text-lime font-bold not-italic tracking-widest text-sm uppercase">- Barakell Beni</cite>
                </blockquote>
              </div>

              <div className="pt-8"><TrainingFAQ /></div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="hidden md:block w-full lg:w-[30%] relative">
              <div className="lg:sticky lg:top-4 space-y-3">
                <div className="bg-[#0F0F0F] rounded-xl overflow-hidden shadow-lg">
                  <div className="p-3 bg-white/5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2"><ShieldCheck size={14} className="text-lime" />Choisir votre plan</h3>
                  </div>
                  <div className="p-2 space-y-1">
                    {pricingOptions.map((option) => {
                      const isSelected = selectedPlan.id === option.id;
                      return (
                        <div key={option.id} onClick={() => setSelectedPlan(option)}
                          className={`cursor-pointer p-2.5 rounded-lg transition-all flex items-center justify-between ${isSelected ? "bg-white/10" : "bg-transparent hover:bg-white/5"}`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${isSelected ? `${option.styles.text} ring-1 ring-current` : "bg-white/10"}`}>
                              {isSelected && <div className={`w-1.5 h-1.5 rounded-full ${option.styles.marker}`} />}
                            </div>
                            <span className={`font-bold text-xs ${isSelected ? "text-white" : "text-white/60"}`}>{option.title}</span>
                          </div>
                          <span className={`text-xs font-bold ${isSelected ? option.styles.text : "text-white/40"}`}>{option.price} F</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#0F0F0F] rounded-xl p-4 shadow-xl">
                  <div className="mb-4 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mb-2 ${selectedPlan.styles.bg} ${selectedPlan.styles.text}`}>{selectedPlan.shortTitle}</span>
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-white mb-1">
                      {selectedPlan.price} <span className="text-sm text-white/50 font-normal">FCFA{selectedPlan.period}</span>
                    </div>
                    <p className="text-white/60 text-xs">{selectedPlan.tagline}</p>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="text-xs italic text-white/80 text-center px-2">"{selectedPlan.clientResult}"</div>
                    <div className="h-px w-full bg-white/10" />
                    <ul className="space-y-2">
                      {selectedPlan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                          <Check size={14} className={`${selectedPlan.styles.check} shrink-0 mt-0.5`} /><span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button onClick={() => handlePaymentClick(selectedPlan)}
                    className="w-full bg-[#ec4899] text-white hover:bg-[#db2777] font-bold py-2.5 text-sm rounded-lg shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                    PAYER MAINTENANT
                  </Button>
                  <div className="flex items-center justify-center gap-1.5 text-[9px] text-white/40 uppercase tracking-wider mt-2">
                    <ShieldCheck size={10} />Paiement sécurisé Kkiapay
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <img src={paymentMethodsImg} alt="Moyens de paiement : MTN, Moov, Wave, Mixx, Visa, Mastercard" className="w-full h-auto opacity-70" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FloatingPricingBar
          plans={mappedPlans}
          selectedPlanId={selectedPlan.id}
          onSelectPlan={(plan) => {
            const original = pricingOptions.find((p) => p.id === plan.id);
            if (original) setSelectedPlan(original);
          }}
          onBuy={(plan) => {
            const original = pricingOptions.find((p) => p.id === plan.id);
            if (original) handlePaymentClick(original);
          }}
          isVisible={!isModalOpen}
        />
      </div>
    </>
  );
};

export default TrainingPage;
