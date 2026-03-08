import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, RotateCcw, Sparkles, Lock, Unlock, X, ImagePlus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import CameraScene from "@/components/camera/CameraScene";

const CameraControl = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [rotate, setRotate] = useState(0);
  const [vertical, setVertical] = useState(0);
  const [zoom, setZoom] = useState(5);
  const [cameras, setCameras] = useState(1);
  const [locked, setLocked] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleGenerate = () => {
    if (!uploadedImage) {
      toast.error("Veuillez d'abord ajouter une image");
      return;
    }
    setIsGenerating(true);
    toast.info("Fonctionnalité en cours de développement");
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const resetParams = () => {
    setRotate(0);
    setVertical(0);
    setZoom(5);
    setCameras(1);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel – controls */}
      <div className="w-[340px] shrink-0 border-r border-border flex flex-col overflow-y-auto" style={{ background: "hsl(var(--background))" }}>
        <div className="p-4 space-y-4 flex-1">
          {/* Header */}
          <div>
            <h1 className="text-base font-bold text-foreground flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" />
              Camera Control
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Contrôlez l'angle de caméra pour générer une nouvelle vue
            </p>
          </div>

          {/* Change Camera button */}
          <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl glass text-sm text-foreground hover:bg-muted/30 transition-colors">
            <Camera className="w-4 h-4 text-primary" />
            <span className="flex-1 text-left font-medium">Change Camera</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Upload zone */}
          {uploadedImage ? (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img src={uploadedImage} alt="Upload" className="w-full aspect-[4/3] object-cover" />
              <button
                onClick={() => setUploadedImage(null)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
              >
                <X className="w-3.5 h-3.5 text-foreground" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur text-[11px] text-foreground hover:bg-background transition-colors"
              >
                <Upload className="w-3 h-3" />
                Change upload
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-border rounded-xl aspect-[4/3] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors bg-muted/10"
            >
              <ImagePlus className="w-8 h-8 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Glissez ou cliquez pour ajouter</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          {/* Camera Preview label */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Camera Preview</span>
            <button className="text-[11px] text-primary flex items-center gap-1 hover:underline" onClick={resetParams}>
              <RotateCcw className="w-3 h-3" /> Réinitialiser
            </button>
          </div>

          {/* Controls */}
          <div className="space-y-2.5">
            {/* Cameras */}
            <div className="flex items-center gap-3 glass rounded-xl px-3 py-2.5">
              <span className="text-sm font-medium text-primary flex-1">Cameras</span>
              <span className="text-sm font-bold text-foreground">{cameras}</span>
              <button
                onClick={() => setLocked(!locked)}
                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
              >
                {locked ? <Lock className="w-3.5 h-3.5 text-muted-foreground" /> : <Unlock className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
            </div>

            {/* Rotate */}
            <div className="glass rounded-xl px-3 py-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">Rotate</span>
                <span className="text-sm font-bold text-foreground">{rotate}°</span>
              </div>
              <Slider value={[rotate]} onValueChange={(v) => !locked && setRotate(v[0])} min={-180} max={180} step={1} disabled={locked} />
            </div>

            {/* Vertical */}
            <div className="glass rounded-xl px-3 py-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">Vertical</span>
                <span className="text-sm font-bold text-foreground">{vertical}°</span>
              </div>
              <Slider value={[vertical]} onValueChange={(v) => !locked && setVertical(v[0])} min={-90} max={90} step={1} disabled={locked} />
            </div>

            {/* Zoom */}
            <div className="glass rounded-xl px-3 py-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">Zoom</span>
                <span className="text-sm font-bold text-foreground">{zoom}</span>
              </div>
              <Slider value={[zoom]} onValueChange={(v) => !locked && setZoom(v[0])} min={1} max={10} step={1} disabled={locked} />
            </div>
          </div>
        </div>

        {/* Generate button pinned at bottom */}
        <div className="p-4 border-t border-border">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !uploadedImage}
            className="w-full h-11 rounded-xl text-sm font-semibold gap-2"
          >
            {isGenerating ? "Génération..." : "Generate"}
            <Sparkles className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Right panel – 3D Scene */}
      <div className="flex-1 min-w-0 relative" style={{ background: "hsl(240, 15%, 6%)" }}>
        <CameraScene
          imageUrl={uploadedImage}
          rotate={rotate}
          vertical={vertical}
          zoom={zoom}
        />
      </div>
    </div>
  );
};

export default CameraControl;
