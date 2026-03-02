import { motion } from "framer-motion";

const tickerItems = [
  { id: 1, url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop", aspect: "9/16" },
  { id: 2, url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=340&fit=crop", aspect: "16/9" },
  { id: 3, url: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=600&fit=crop", aspect: "9/16" },
  { id: 4, url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=340&fit=crop", aspect: "16/9" },
  { id: 5, url: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop", aspect: "9/16" },
  { id: 6, url: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=600&h=340&fit=crop", aspect: "16/9" },
  { id: 7, url: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop", aspect: "9/16" },
  { id: 8, url: "https://images.unsplash.com/photo-1518676590747-1e3dcf5a4e22?w=600&h=340&fit=crop", aspect: "16/9" },
  { id: 9, url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=600&fit=crop", aspect: "9/16" },
  { id: 10, url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=340&fit=crop", aspect: "16/9" },
];

const MediaTicker = () => {
  // Triple the items for seamless loop
  const tripled = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <section className="w-full overflow-hidden py-6" style={{ backgroundColor: "#080808" }}>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-[#080808] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-[#080808] to-transparent pointer-events-none" />

        <motion.div
          className="flex gap-3 w-max"
          animate={{ x: [0, `-${100 / 3}%`] }}
          transition={{
            x: {
              duration: 60,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          {tripled.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              className="flex-shrink-0 rounded-lg overflow-hidden"
              style={{
                width: item.aspect === "9/16" ? "160px" : "280px",
                height: "240px",
              }}
            >
              <img
                src={item.url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default MediaTicker;
