export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  description: string;
  allowQuantity: boolean;
}

export interface ServiceCategory {
  category: string;
  items: ServiceItem[];
}

export const servicePrices: ServiceCategory[] = [
  {
    category: "PRODUCTION VIDÉO (IA)",
    items: [
      { id: "video_clip", name: "Clip Musical Complet", price: 250000, description: "Production complète de clip vidéo assistée par IA.", allowQuantity: true },
      { id: "video_visualizer", name: "Visualiseur / Clip avec paroles", price: 100000, description: "Animation rythmique et affichage des paroles.", allowQuantity: true },
      { id: "video_trailer", name: "Bande-annonce (Format vertical)", price: 50000, description: "Format vertical optimisé pour les réseaux sociaux (Reels/TikTok).", allowQuantity: true },
      { id: "video_trailer_pack", name: "Pack 5 Bandes-annonces", price: 150000, description: "Offre spéciale : 5 vidéos format vertical pour vos réseaux.", allowQuantity: true },
      { id: "video_vjing", name: "Visuels de spectacles / VJing", price: 75000, description: "Boucles vidéo immersives pour concerts et événements.", allowQuantity: true },
      { id: "video_ads", name: "Publicité et contenu de marque", price: 100000, description: "Contenu promotionnel impactant pour votre marque.", allowQuantity: true },
      { id: "video_docu", name: "Documentaire / Fiction (10 min)", price: 200000, description: "Narration longue durée et réalisation cinématographique.", allowQuantity: true }
    ]
  },
  {
    category: "SERVICES AUDIO (IA)",
    items: [
      { id: "audio_voice", name: "Voix IA et clonage vocal", price: 30000, description: "Synthèse vocale ultra-réaliste et clonage de voix.", allowQuantity: true },
      { id: "audio_mix", name: "Mixage & Mastering IA", price: 40000, description: "Traitement audio professionnel assisté par IA.", allowQuantity: true }
    ]
  },
  {
    category: "DIRECTION CRÉATIVE (IA)",
    items: [
      { id: "art_direction", name: "Direction Artistique & Storyboarding", price: 40000, description: "Conception visuelle et planches de storyboard.", allowQuantity: false },
      { id: "prompt_engineering", name: "Consulting Prompt Engineering", price: 50000, description: "Optimisation de vos prompts pour générateurs d'images/vidéos.", allowQuantity: false }
    ]
  },
  {
    category: "FORMATIONS (IA)",
    items: [
      { id: "training_starter", name: "STARTER – FORMATION + GROUPE PRIVÉ", price: 25000, description: "Formation initiale et accès à la communauté.", allowQuantity: true },
      { id: "training_pro", name: "PRO IA – ABONNEMENT ANNUEL", price: 50000, description: "Accès illimité aux outils et ressources avancées.", allowQuantity: true },
      { id: "training_elite", name: "ELITE COACHING – CINÉMA / CLIP / PROD", price: 100000, description: "Accompagnement personnalisé haut de gamme.", allowQuantity: false }
    ]
  }
];
