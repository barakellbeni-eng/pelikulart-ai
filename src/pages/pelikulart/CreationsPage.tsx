import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import VideoModal from "@/components/pelikulart/VideoModal";

const VIDEO_IDS = [
  "6dd0416f-13cf-4e47-b1e3-57bfe7eda01a",
  "e0df8d05-8486-4f27-b0c2-886694c1f48a",
  "4a3ef18d-9c31-44f6-91ec-6c7304fb0050",
  "fda5d033-fb04-48e8-a34b-0f6e174be155",
  "bb0515a0-03ce-4a58-9245-2d508d15bf83",
  "1e3e8bb0-1117-486c-bd67-52d1e4c34e20",
  "38d14d9b-b6a0-44e5-b103-5ff7cde4063c",
  "4602ba18-fc5d-44e8-aa0e-f7526fecfd97",
  "07beb1d3-5426-4e68-ae28-dc09a0428de3",
  "f825208f-4945-427c-9ff7-5997b5603f79",
  "4d526b01-7b19-44b6-b561-c7b54f6f4ad2",
  "53b0bcd8-6afa-4cfa-9dc6-6136607725fb",
  "7b4c6ec6-e670-4f09-befe-66b50d994473",
  "beffb60e-b2d4-4293-9d79-3f6480030796",
  "e170162d-9800-470f-abd9-12d37a1ec691",
  "512b2e49-a5ed-4684-989b-92964d71413c",
  "d021ee7e-a30c-4ea8-8d51-80b39f8753f0",
  "e0c9da46-6cfc-4d7b-8763-5d721831a2d8",
];

const CreationsPage = () => {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-bold text-white mb-4"
        >
          NOS CRÉATIONS
        </motion.h1>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {VIDEO_IDS.map((id, index) => (
          <motion.div
            key={id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="w-full h-full group cursor-pointer"
            onClick={() => setSelectedVideoId(id)}
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-900 border border-white/5">
              <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <div className="bg-lime text-black rounded-full p-4 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-lg shadow-lime/20">
                  <Play size={32} className="fill-current ml-1" />
                </div>
              </div>
              <iframe
                src={`https://app.videas.fr/embed/media/${id}/?title=false&logo=false`}
                title={`Creation ${index + 1}`}
                className="w-full h-full border-0 pointer-events-none"
                loading="lazy"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <VideoModal
        isOpen={!!selectedVideoId}
        onClose={() => setSelectedVideoId(null)}
        videoId={selectedVideoId}
      />
    </div>
  );
};

export default CreationsPage;
