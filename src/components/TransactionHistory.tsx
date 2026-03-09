import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, ChevronDown, ChevronUp, Coins, RefreshCw, ShoppingCart, Sparkles, RotateCcw } from "lucide-react";

interface LedgerEntry {
  id: string;
  type: string;
  description: string;
  amount: number;
  balance_after: number;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Coins; color: string }> = {
  achat: { label: "Achat", icon: ShoppingCart, color: "text-green-400" },
  generation: { label: "Génération", icon: Sparkles, color: "text-orange-400" },
  remboursement: { label: "Remboursement", icon: RotateCcw, color: "text-blue-400" },
};

const TransactionHistory = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchEntries = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("cauris_ledger" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error && data) setEntries(data as unknown as LedgerEntry[]);
  };

  useEffect(() => {
    if (!user) return;
    fetchEntries().finally(() => setLoading(false));
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEntries();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="glass-card p-5 space-y-3 animate-pulse">
        <div className="h-5 w-48 bg-muted/30 rounded" />
        <div className="h-10 bg-muted/20 rounded" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="glass-card p-5 text-center space-y-2">
        <Coins className="w-8 h-8 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">Aucun mouvement de Cauris pour le moment</p>
      </div>
    );
  }

  const visible = expanded ? entries : entries.slice(0, 5);

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
      time: d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Coins className="w-5 h-5 text-primary" />
        <span className="font-semibold text-foreground">Mes Cauris 🐚</span>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {entries.length} mouvement{entries.length > 1 ? "s" : ""}
        </span>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1.5 rounded-lg hover:bg-muted/20 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
          title="Actualiser"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {visible.map((entry, i) => {
            const config = TYPE_CONFIG[entry.type] || TYPE_CONFIG.generation;
            const Icon = config.icon;
            const { date, time } = formatDateTime(entry.created_at);
            const isPositive = entry.amount > 0;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isPositive ? "bg-green-500/15" : "bg-orange-500/15"
                  }`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        entry.type === "achat" ? "bg-green-500/15 text-green-400" :
                        entry.type === "remboursement" ? "bg-blue-500/15 text-blue-400" :
                        "bg-orange-500/15 text-orange-400"
                      }`}>
                        {config.label}
                      </span>
                      {entry.description && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                          {entry.description}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {date} à {time}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className={`text-sm font-bold ${isPositive ? "text-green-400" : "text-foreground"}`}>
                    {isPositive ? "+" : ""}{entry.amount} 🐚
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    Solde : {entry.balance_after}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {entries.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
        >
          {expanded ? (
            <>Voir moins <ChevronUp className="w-3 h-3" /></>
          ) : (
            <>Voir tout ({entries.length}) <ChevronDown className="w-3 h-3" /></>
          )}
        </button>
      )}
    </div>
  );
};

export default TransactionHistory;
