import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type FAQCategory = "all" | "demarrer" | "paiement" | "credits" | "generation" | "compte";

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

interface FAQSection {
  id: FAQCategory;
  label: string;
  items: FAQItem[];
}

const faqSections: FAQSection[] = [
  {
    id: "demarrer",
    label: "Démarrer",
    items: [
      {
        question: "C'est quoi Pelikulart AI exactement ?",
        answer: (
          <>
            <p>Pelikulart AI est la première plateforme IA créative conçue pour l'Afrique francophone. En un seul endroit, tu génères des images, vidéos, musique et lip-sync grâce à l'intelligence artificielle — sans abonnement complexe, sans carte Visa internationale obligatoire, et sans attendre des heures.</p>
            <p className="mt-3">Tu paies en <strong>FCFA</strong> via Wave, Orange Money ou MTN. L'interface est 100% en français. Les crédits n'expirent jamais.</p>
          </>
        ),
      },
      {
        question: "Comment créer mon compte ?",
        answer: (
          <>
            <p>C'est simple et rapide :</p>
            <ul>
              <li>Va sur pelikulart.ai et clique sur "Créer mon compte"</li>
              <li>Entre ton email et crée un mot de passe</li>
              <li>Vérifie ton email (lien envoyé en moins de 2 minutes)</li>
              <li>Tu reçois automatiquement des crédits gratuits pour tester</li>
            </ul>
            <p className="mt-3">Aucune carte bancaire requise pour s'inscrire.</p>
          </>
        ),
      },
      {
        question: "Est-ce disponible sur mobile ?",
        answer: (
          <>
            <p>Oui ! Pelikulart AI est une Progressive Web App (PWA) — tu peux l'installer directement depuis ton navigateur sur Android ou iPhone, sans passer par le Play Store. Ça fonctionne comme une vraie application : icône sur l'écran d'accueil, notifications, mode hors-ligne partiel.</p>
            <p className="mt-3">Une application native Android est prévue dans les prochains mois.</p>
          </>
        ),
      },
      {
        question: "Quelle différence avec Freepik, Kling ou Higgsfield ?",
        answer: (
          <>
            <p>Ces plateformes sont excellentes — mais elles ne sont pas faites pour nous :</p>
            <ul>
              <li><strong>Prix en FCFA</strong> — pas de conversion mystérieuse ni de frais cachés</li>
              <li><strong>Mobile Money accepté</strong> — Wave, Orange, MTN. Pas besoin de Visa internationale</li>
              <li><strong>Interface en français</strong> — conçue pour les créateurs francophones</li>
              <li><strong>Crédits sans expiration</strong> — chez Higgsfield ils expirent en 90 jours</li>
              <li><strong>Support WhatsApp</strong> — tu parles à une vraie personne, pas un bot en anglais</li>
            </ul>
          </>
        ),
      },
    ],
  },
  {
    id: "paiement",
    label: "Paiement",
    items: [
      {
        question: "Quels moyens de paiement acceptez-vous ?",
        answer: (
          <>
            <p>Nous acceptons tous les principaux Mobile Money d'Afrique de l'Ouest :</p>
            <ul>
              <li>Wave (Bénin, Côte d'Ivoire, Sénégal...)</li>
              <li>Orange Money</li>
              <li>MTN MoMo</li>
              <li>Moov Money</li>
              <li>Cartes Visa/Mastercard (pour ceux qui en ont)</li>
            </ul>
            <p className="mt-3">Aucune carte internationale requise. Tu paies depuis ton téléphone en quelques secondes.</p>
          </>
        ),
      },
      {
        question: "Quels sont les tarifs ?",
        answer: (
          <>
            <p>Nous proposons 4 plans mensuels, tous payables en FCFA :</p>
            <ul>
              <li><strong>Starter</strong> — 3 500 FCFA/mois : 200 images + 5 vidéos 5s</li>
              <li><strong>Créateur</strong> — 7 500 FCFA/mois : images "illimitées" + 20 vidéos</li>
              <li><strong>Pro</strong> — 15 000 FCFA/mois : images "illimitées" + 50 vidéos + lip-sync</li>
              <li><strong>Agence</strong> — 35 000 FCFA/mois : tout illimité + équipe + priorité</li>
            </ul>
            <p className="mt-3">Un plan gratuit est aussi disponible avec 20 images/mois pour tester.</p>
          </>
        ),
      },
      {
        question: "Est-ce que je peux annuler à tout moment ?",
        answer: (
          <p>Oui, sans condition. Tu peux annuler ton abonnement à tout moment depuis ton compte. Aucun engagement, aucun frais d'annulation. Tes crédits restants sont conservés même après l'annulation — ils n'expirent jamais.</p>
        ),
      },
      {
        question: "Y a-t-il des remboursements ?",
        answer: (
          <p>Si tu rencontres un problème technique qui empêche une génération (erreur de notre côté), les crédits utilisés sont automatiquement remboursés sur ton compte. Pour toute autre demande, contacte-nous via WhatsApp dans les 48h suivant le paiement.</p>
        ),
      },
    ],
  },
  {
    id: "credits",
    label: "Crédits",
    items: [
      {
        question: "Est-ce que mes crédits expirent ?",
        answer: (
          <p><strong>Non, jamais.</strong> C'est l'une de nos différences majeures avec la concurrence. Chez Higgsfield ou Freepik, les crédits expirent en 90 jours. Chez Pelikulart AI, les crédits que tu achètes restent sur ton compte indéfiniment, même si tu arrêtes ton abonnement.</p>
        ),
      },
      {
        question: "Combien de crédits coûte chaque génération ?",
        answer: (
          <>
            <p>Le coût varie selon le type de contenu :</p>
            <ul>
              <li>Image 2K — <strong>1 crédit</strong></li>
              <li>Vidéo 5 secondes standard — <strong>10 crédits</strong></li>
              <li>Vidéo 5 secondes pro — <strong>20 crédits</strong></li>
              <li>Lip-sync 5 secondes — <strong>15 crédits</strong></li>
              <li>Musique 30 secondes — <strong>8 crédits</strong></li>
            </ul>
            <p className="mt-3">Les abonnés bénéficient de crédits inclus chaque mois. Tu peux aussi acheter des packs supplémentaires à tout moment.</p>
          </>
        ),
      },
      {
        question: "Que se passe-t-il si une génération échoue ?",
        answer: (
          <p>Si une génération échoue pour une raison technique (serveur, délai d'attente, modèle indisponible), tes crédits sont intégralement remboursés automatiquement. Tu ne paies jamais pour un résultat que tu n'as pas reçu.</p>
        ),
      },
    ],
  },
  {
    id: "generation",
    label: "Génération",
    items: [
      {
        question: "Combien de temps prend une génération ?",
        answer: (
          <>
            <p>Les temps varient selon le type de contenu :</p>
            <ul>
              <li>Image — <strong>3 à 10 secondes</strong></li>
              <li>Vidéo 5s — <strong>1 à 4 minutes</strong></li>
              <li>Lip-sync — <strong>2 à 5 minutes</strong></li>
              <li>Musique — <strong>30 à 60 secondes</strong></li>
            </ul>
            <p className="mt-3">Tu reçois une notification quand c'est prêt — pas besoin de rester sur la page.</p>
          </>
        ),
      },
      {
        question: "Je ne parle pas bien anglais, comment écrire mes prompts ?",
        answer: (
          <p>Pas de problème ! Notre assistant IA intégré traduit et optimise automatiquement tes prompts en français vers l'anglais technique requis par les modèles. Tu décris ce que tu veux en français — même en bambara, fon ou dioula — et le système s'occupe du reste.</p>
        ),
      },
      {
        question: "Puis-je utiliser les images et vidéos pour un usage commercial ?",
        answer: (
          <>
            <p><strong>Oui.</strong> Tout ce que tu crées avec Pelikulart AI t'appartient. Tu peux utiliser tes créations pour des campagnes publicitaires, des clips, des posts commerciaux, des formations — sans restriction.</p>
            <p className="mt-3">Note : certains modèles tiers peuvent avoir leurs propres conditions. Nous t'informons dans ce cas.</p>
          </>
        ),
      },
      {
        question: "Quels modèles IA utilisez-vous ?",
        answer: (
          <>
            <p>Nous utilisons les meilleurs modèles du marché :</p>
            <ul>
              <li><strong>Images</strong> — Google Nano Banana (Gemini Image)</li>
              <li><strong>Vidéos</strong> — Kling AI par Kuaishou (standard et pro)</li>
              <li><strong>Lip-sync</strong> — Kling Lip-sync</li>
              <li><strong>Musique</strong> — Suno / Mubert</li>
              <li><strong>Voix</strong> — ElevenLabs</li>
            </ul>
            <p className="mt-3">Nous mettons à jour régulièrement avec les dernières versions disponibles.</p>
          </>
        ),
      },
      {
        question: "Combien de temps mes créations sont-elles stockées ?",
        answer: (
          <>
            <p>La durée de stockage dépend de ton plan :</p>
            <ul>
              <li>Gratuit — <strong>24 heures</strong></li>
              <li>Starter — <strong>7 jours</strong></li>
              <li>Créateur — <strong>30 jours</strong></li>
              <li>Pro — <strong>6 mois</strong></li>
              <li>Agence — <strong>1 an</strong></li>
            </ul>
            <p className="mt-3">Nous te rappelons avant l'expiration pour que tu puisses télécharger tes fichiers.</p>
          </>
        ),
      },
    ],
  },
  {
    id: "compte",
    label: "Compte",
    items: [
      {
        question: "Comment contacter le support ?",
        answer: (
          <p>Notre support est disponible via <strong>WhatsApp</strong> — le moyen le plus rapide et le plus naturel pour nous. Réponse généralement en moins de 2 heures pendant les heures ouvrées (8h-20h WAT). Tu peux aussi nous écrire par email à <strong>support@pelikulart.ai</strong>.</p>
        ),
      },
      {
        question: "Puis-je partager mon compte avec mon équipe ?",
        answer: (
          <p>Le partage de compte entre plusieurs personnes n'est pas autorisé sur les plans individuels. Pour les équipes, le plan <strong>Agence</strong> inclut plusieurs sièges utilisateurs et une gestion centralisée des crédits. Contacte-nous pour un devis personnalisé si tu as plus de 5 utilisateurs.</p>
        ),
      },
      {
        question: "Comment supprimer mon compte ?",
        answer: (
          <p>Tu peux supprimer ton compte à tout moment depuis les <strong>Paramètres → Compte → Supprimer mon compte</strong>. Cette action est irréversible — toutes tes créations et crédits restants seront effacés. Pense à télécharger tes fichiers avant.</p>
        ),
      },
      {
        question: "Pelikulart AI est-il disponible dans tout l'Afrique ?",
        answer: (
          <>
            <p>La plateforme est accessible depuis n'importe quel pays avec une connexion internet. Le paiement Mobile Money est actuellement disponible dans les pays UEMOA principalement (Bénin, Côte d'Ivoire, Sénégal, Togo, Mali, Burkina Faso, Niger, Guinée-Bissau).</p>
            <p className="mt-3">Nous travaillons à étendre la couverture à l'Afrique centrale et de l'Est. Le paiement par carte bancaire est disponible partout dans le monde.</p>
          </>
        ),
      },
    ],
  },
];

const categoryButtons: { id: FAQCategory; label: string }[] = [
  
  { id: "demarrer", label: "Démarrer" },
  { id: "paiement", label: "Paiement" },
  { id: "credits", label: "Crédits" },
  { id: "generation", label: "Génération" },
  { id: "compte", label: "Compte" },
];

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>("all");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const filteredSections = activeCategory === "all"
    ? faqSections
    : faqSections.filter((s) => s.id === activeCategory);

  const toggleItem = (key: string) => {
    setOpenKey(openKey === key ? null : key);
  };

  return (
    <section id="faq" className="py-16 md:py-24 relative">
      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-[1000px] mx-auto px-[5vw] relative z-10">
        {/* Hero */}
        <div className="mb-12 md:mb-16">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-lime opacity-80 mb-5">
            // Centre d'aide
          </p>
          <h2 className="text-[clamp(42px,7vw,90px)] font-extrabold leading-[0.95] tracking-[-0.03em] text-white mb-6 font-display">
            Questions
            <span className="text-lime block">fréquentes</span>
          </h2>
          <p className="text-base text-white/50 max-w-[480px] leading-relaxed">
            Tout ce que tu dois savoir sur la première plateforme IA créative d'Afrique francophone.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex gap-3 flex-wrap mb-12">
          {categoryButtons.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setOpenKey(null); }}
              className={`font-mono text-[11px] tracking-[0.15em] uppercase px-4 py-2 border transition-all duration-200 ${
                activeCategory === cat.id
                  ? "border-lime text-lime bg-lime/5"
                  : "border-white/10 text-white/40 hover:border-lime hover:text-lime hover:bg-lime/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ sections */}
        <div className="space-y-16">
          {filteredSections.map((section, sIdx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: sIdx * 0.1 }}
            >
              {/* Section label */}
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-lime">
                  {section.label}
                </span>
                <div className="flex-1 h-px bg-white/10 max-w-[200px]" />
              </div>

              {/* Items */}
              <div>
                {section.items.map((item, iIdx) => {
                  const key = `${section.id}-${iIdx}`;
                  const isOpen = openKey === key;

                  return (
                    <div
                      key={key}
                      className={`border-t border-white/10 ${iIdx === section.items.length - 1 ? "border-b" : ""}`}
                    >
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full py-6 flex items-center justify-between gap-6 text-left group"
                      >
                        <span className={`text-[17px] font-semibold leading-[1.4] transition-colors duration-200 ${isOpen ? "text-lime" : "text-white group-hover:text-lime"}`}>
                          {item.question}
                        </span>
                        <div
                          className={`w-7 h-7 min-w-[28px] border flex items-center justify-center transition-all duration-300 ${
                            isOpen ? "border-lime bg-lime/10 rotate-45" : "border-white/10"
                          }`}
                        >
                          <div className="relative w-[10px] h-[10px]">
                            <div className={`absolute top-1/2 left-0 w-full h-[1.5px] -translate-y-1/2 ${isOpen ? "bg-lime" : "bg-lime"}`} />
                            <div className={`absolute left-1/2 top-0 w-[1.5px] h-full -translate-x-1/2 ${isOpen ? "bg-lime" : "bg-lime"}`} />
                          </div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pb-7 text-white/50 text-[15px] leading-[1.75] font-normal [&_strong]:text-lime [&_strong]:font-semibold [&_ul]:mt-3 [&_ul]:list-none [&_ul]:pl-0 [&_li]:py-1 [&_li]:pl-5 [&_li]:relative [&_li]:before:content-['→'] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-lime [&_li]:before:text-xs">
                              {item.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Block */}
        <div className="mt-20 p-12 md:p-16 border border-white/10 bg-dark-lighter relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="absolute top-0 left-0 right-1/2 bottom-0 bg-gradient-to-r from-lime/[0.04] to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-2xl md:text-[28px] font-extrabold text-white mb-2">
              Tu as encore des questions ?
            </h3>
            <p className="text-white/40 text-sm">
              Notre équipe répond sur WhatsApp en moins de 2 heures.
            </p>
          </div>
          <a
            href="https://wa.me/22960telepon"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 font-mono text-xs tracking-[0.1em] uppercase px-8 py-4 bg-lime text-black font-bold hover:bg-white hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
          >
            Contacter le support →
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
