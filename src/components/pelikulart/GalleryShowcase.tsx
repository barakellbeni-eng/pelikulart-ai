import { motion } from "framer-motion";

const creations = [
  {
    title: "Clip Afro-Futurisme",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop",
  },
  {
    title: "VFX Spatial",
    image: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&h=400&fit=crop",
  },
  {
    title: "Animation 3D",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop",
  },
  {
    title: "Portrait Narratif",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=400&fit=crop",
  },
];

const GalleryShowcase = () => {
  return (
    <section className="py-20 md:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-display leading-tight">
            La signature <span className="text-primary">Pelikulart</span>
          </h2>
          <p className="text-white/40 text-base mt-3 max-w-lg">
            Créations originales générées par nos utilisateurs et Barakell BENI.
          </p>
        </motion.div>
      </div>

      {/* Horizontal scroll */}
      <div className="relative">
        <div className="flex gap-5 px-6 sm:px-8 overflow-x-auto no-scrollbar pb-4">
          {creations.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex-shrink-0 w-[300px] sm:w-[340px] group cursor-pointer"
            >
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-card aspect-[3/2]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white text-sm font-ui font-semibold">{item.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fade edges */}
        <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-[#080808] to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-[#080808] to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
};

export default GalleryShowcase;
