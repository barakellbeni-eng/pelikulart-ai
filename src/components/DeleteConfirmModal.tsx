import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DeleteConfirmModal({ open, onConfirm, onCancel, loading }: DeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-background/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Supprimer cette génération ?</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Cette action est irréversible.</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2.5 text-sm bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition-colors font-medium"
            >
              {loading ? "Suppression..." : "Supprimer définitivement"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
