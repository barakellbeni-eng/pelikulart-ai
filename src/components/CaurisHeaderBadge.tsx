import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCauris } from "@/hooks/useCauris";

export default function CaurisHeaderBadge() {
  const { user } = useAuth();
  const { balance } = useCauris();

  if (!user) return null;

  return (
    <Link
      to="/pricing"
      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full glass hover:bg-white/[0.08] transition-colors"
      title="Recharger mes cauris"
    >
      <span className="text-primary font-bold text-[10px]">C</span>
      <span className="font-bold text-foreground">{balance}</span>
      <span className="text-muted-foreground hidden sm:inline">cauris</span>
    </Link>
  );
}
