import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, ChevronDown, ChevronUp, Coins } from "lucide-react";

interface Transaction {
  id: string;
  transaction_id: string;
  amount: number;
  cauris_added: number;
  processed_at: string;
}

const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("processed_at", { ascending: false })
        .limit(20);
      if (!error && data) setTransactions(data);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) {
    return (
      <div className="glass-card p-5 space-y-3 animate-pulse">
        <div className="h-5 w-48 bg-muted/30 rounded" />
        <div className="h-10 bg-muted/20 rounded" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="glass-card p-5 text-center space-y-2">
        <Receipt className="w-8 h-8 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">Aucune transaction pour le moment</p>
      </div>
    );
  }

  const visible = expanded ? transactions : transactions.slice(0, 3);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Receipt className="w-5 h-5 text-primary" />
        <span className="font-semibold text-foreground">Historique des transactions</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{transactions.length} transaction{transactions.length > 1 ? "s" : ""}</span>
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {visible.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/30"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Coins className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    +{tx.cauris_added} Cauris 🐚
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDate(tx.processed_at)} à {formatTime(tx.processed_at)}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-sm font-bold text-foreground">
                  {tx.amount.toLocaleString("fr-FR")} <span className="text-[10px] text-muted-foreground">FCFA</span>
                </p>
                <p className="text-[9px] text-green-400 font-medium">Confirmé ✓</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {transactions.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
        >
          {expanded ? (
            <>Voir moins <ChevronUp className="w-3 h-3" /></>
          ) : (
            <>Voir tout ({transactions.length}) <ChevronDown className="w-3 h-3" /></>
          )}
        </button>
      )}
    </div>
  );
};

export default TransactionHistory;
