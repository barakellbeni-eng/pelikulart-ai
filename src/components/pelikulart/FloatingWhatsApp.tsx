import { motion } from "framer-motion";

const FloatingWhatsApp = () => {
  return (
    <motion.a
      href="https://wa.me/2250799332338"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 flex items-center justify-center cursor-pointer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-[#25D366] rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
        <img
          src="https://i.postimg.cc/bNn3QVkh/pngtree-whatsapp-phone-icon-png-image-6315989.png"
          alt="Contact us on WhatsApp"
          className="w-12 h-12 md:w-14 md:h-14 relative z-10 drop-shadow-xl"
        />
      </div>
    </motion.a>
  );
};

export default FloatingWhatsApp;
