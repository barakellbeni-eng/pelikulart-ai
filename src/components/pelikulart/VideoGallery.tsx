import { motion } from "framer-motion";

const videos = [
  { id: 1, title: "Clips IA", url: "https://app.videas.fr/embed/media/2a758df7-947b-4516-a5b8-4bef8b85b428/" },
  { id: 2, title: "Portraits IA", url: "https://app.videas.fr/embed/media/058a2bc1-94d3-42f2-a41c-e2ce2535a5be/" },
  { id: 3, title: "Publicité IA", url: "https://app.videas.fr/embed/media/51fa1a49-743e-4563-aefd-50c471390ad6/" },
  { id: 4, title: "Sur-Mesure", url: "https://app.videas.fr/embed/media/53737934-33e4-4134-8f9c-2545b7ccbd61/" },
];

const VideoGallery = () => {
  return (
    <section className="py-32" style={{ backgroundColor: "#0A0A0A" }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.3em] text-white/40 font-medium mb-12 text-center"
        >
          Nos créations
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group relative"
            >
              <div className="relative rounded-lg overflow-hidden bg-white/[0.02]">
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
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm font-medium text-white">{video.title}</span>
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
