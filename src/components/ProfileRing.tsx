import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCauris } from "@/hooks/useCauris";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const MAX_CAURIS = 500;

const ProfileRing = () => {
  const { user } = useAuth();
  const { balance } = useCauris();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setAvatarUrl(data.avatar_url);
        setDisplayName(data.display_name || user.email?.split("@")[0] || "U");
      }
    };
    fetchProfile();
  }, [user]);

  const percent = Math.min(balance / MAX_CAURIS, 1);
  // Green (120) when full, Red (0) when empty
  const hue = Math.round(percent * 120);
  const ringColor = `hsl(${hue}, 80%, 50%)`;

  const size = 36;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percent);

  return (
    <button
      onClick={() => navigate("/profile")}
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-label="Profil"
    >
      {/* SVG ring */}
      <svg
        className="absolute inset-0"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-700"
        />
      </svg>
      {/* Avatar */}
      <div className="w-[28px] h-[28px] rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-primary-foreground">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </button>
  );
};

export default ProfileRing;
