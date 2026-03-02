import { motion } from "framer-motion";

const roles = [
  "Réalisateur",
  "Agence créative",
  "Freelance",
  "Influenceur",
  "Musicien",
  "Marketeur",
  "Photographe",
  "Vidéaste",
  "Designer",
  "Créateur de contenu",
];

// Duplicate for seamless infinite loop
const loopRoles = [...roles, ...roles];

const ForWho = () => {
  return (
    <section className="py-20 md:py-28 overflow-hidden" style={{ backgroundColor: "#0A0A0A" }}>
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight text-center mb-16"
        >
          Fait pour les <span className="text-lime">créateurs africains</span>
        </motion.h2>

        {/* Sliding roles marquee — vertical slide up */}
        <div className="relative h-[280px] flex items-center justify-center">
          {/* Fade masks top & bottom */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex flex-col items-center gap-5"
            animate={{ y: [0, -(roles.length * 68)] }}
            transition={{
              y: {
                duration: roles.length * 2.5,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          >
            {loopRoles.map((role, i) => (
              <span
                key={`${role}-${i}`}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white/15 hover:text-lime transition-colors duration-500 cursor-default whitespace-nowrap select-none"
                style={{ lineHeight: "48px" }}
              >
                {role}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ForWho;
