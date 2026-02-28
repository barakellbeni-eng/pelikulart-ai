import { motion } from "framer-motion";

const videos = [
  { id: 1, title: "Clips IA & Vidéos Courtes", url: "https://app.videas.fr/embed/media/2a758df7-947b-4516-a5b8-4bef8b85b428/" },
  { id: 2, title: "Portraits IA & Formats Longs", url: "https://app.videas.fr/embed/media/058a2bc1-94d3-42f2-a41c-e2ce2535a5be/" },
  { id: 3, title: "Publicité IA & Voix Off", url: "https://app.videas.fr/embed/media/51fa1a49-743e-4563-aefd-50c471390ad6/" },
  { id: 4, title: "Formations & Sur-Mesure", url: "https://app.videas.fr/embed/media/53737934-33e4-4134-8f9c-2545b7ccbd61/" },
];

const VideoGallery = () => {
  return (
    <section id="gallery" className="py-24 bg-black relative">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-lime/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter">
            <span className="text-white">NOS</span>{" "}
            <span className="text-lime">CRÉATIONS</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Immersion dans nos univers visuels générés par intelligence artificielle
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <div className="relative rounded-xl border-2 border-lime overflow-hidden bg-black shadow-[0_0_20px_rgba(204,255,0,0.1)] group-hover:shadow-[0_0_30px_rgba(204,255,0,0.3)] transition-all duration-300">
                <div className="aspect-video w-full">
                  <iframe
                    src={`${video.url}?autoplay=1&muted=1&loop=1&controls=0&showinfo=0`}
                    title={video.title}
                    className="w-full h-full pointer-events-none"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    tabIndex={-1}
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-12 pointer-events-none">
                  <h3 className="text-xl font-bold text-white group-hover:text-lime transition-colors duration-300">
                    {video.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoGallery;
