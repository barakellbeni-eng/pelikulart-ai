import { motion } from "framer-motion";

const VideoSection = () => {
  return (
    <section className="w-full bg-background relative p-0 m-0">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full"
      >
        <div className="relative w-full aspect-video bg-background overflow-hidden m-0 p-0">
          <iframe
            src="https://app.videas.fr/embed/media/2a758df7-947b-4516-a5b8-4bef8b85b428/?autoplay=1&loop=1&controls=0&muted=1"
            title="Présentation Videas"
            className="absolute top-0 left-0 w-full h-full border-none object-cover pointer-events-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            tabIndex={-1}
            loading="lazy"
          />
          <div className="absolute inset-0 z-10 bg-transparent pointer-events-none" />
        </div>
      </motion.div>
    </section>
  );
};

export default VideoSection;
