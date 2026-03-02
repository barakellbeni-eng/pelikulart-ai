import { ReactNode } from "react";

interface ScrollSectionProps {
  children: ReactNode;
  className?: string;
}

const ScrollSection = ({ children, className = "" }: ScrollSectionProps) => {
  return <div className={className}>{children}</div>;
};

export default ScrollSection;
