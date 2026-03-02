import { motion } from "framer-motion";
import { Users } from "lucide-react";

const ForWho = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <Users className="w-5 h-5 text-primary" />
          <span className="text-xs uppercase tracking-[0.3em] text-primary/80 font-mono">Pour qui</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white/70 leading-relaxed"
        >
          Que tu sois artiste, réalisateur, entrepreneur ou simple créatif — si tu as une vision,{" "}
          <span className="text-primary">Studio Pelikulart AI</span> est fait pour toi.
        </motion.p>
      </div>
    </section>
  );
};

export default ForWho;
