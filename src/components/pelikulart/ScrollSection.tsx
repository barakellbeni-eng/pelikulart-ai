import { useRef, ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ScrollSectionProps {
  children: ReactNode;
  className?: string;
}

const ScrollSection = ({ children, className = "" }: ScrollSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // When section enters from bottom: scale up + fade in
  // When section exits to top: scale down + fade out + push back in Z
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.88, 1, 1, 0.88]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [60, 0, 0, -60]);
  const rotateX = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [6, 0, 0, -6]);

  return (
    <div ref={ref} className={className} style={{ perspective: "1200px" }}>
      <motion.div
        style={{ opacity, scale, y, rotateX, transformOrigin: "center center" }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ScrollSection;
