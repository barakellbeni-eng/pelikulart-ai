import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Behanzin = () => {
  const { toast } = useToast();

  const handleNotify = () => {
    toast({
      title: "Merci de votre intérêt !",
      description: "Nous vous tiendrons informé de l'avancement du projet Béhanzin.",
    });
  };

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1682185009260-31140871eebc"
          alt="Béhanzin Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-3xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <span className="px-6 py-2 bg-gradient-to-r from-[#00D9FF] to-[#00B8D4] text-white font-bold rounded-full text-sm tracking-wider shadow-lg shadow-[#00D9FF]/50">
              PROJET SPÉCIAL
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] bg-clip-text text-transparent">
              BÉHANZIN
            </span>
            <br />
            <span className="text-white">LE DERNIER RUGISSEMENT</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="space-y-4 mb-8"
          >
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Plongez dans l'épopée d'un roi guerrier dont le courage a défié les empires. Ce documentaire cinématographique révolutionnaire fusionne intelligence artificielle et narration historique pour faire revivre l'héroïsme de Béhanzin.
            </p>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Ce n'est pas simplement un documentaire—c'est une résurrection visuelle, un cri de mémoire, un rugissement qui résonne à travers les générations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="inline-block mb-8"
          >
            <span className="px-8 py-3 bg-[#00D9FF]/20 backdrop-blur-sm border-2 border-[#00D9FF] text-[#00D9FF] font-bold rounded-lg text-xl tracking-wider animate-pulse">
              COMING SOON
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <motion.button
              onClick={handleNotify}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#0A0E27] font-bold rounded-lg text-lg hover:shadow-2xl hover:shadow-[#D4AF37]/50 transition-all duration-300 flex items-center gap-3"
            >
              <Bell size={24} />
              Rester Informé
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Behanzin;
