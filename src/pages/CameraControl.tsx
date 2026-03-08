import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, RotateCcw, Sparkles, Lock, Unlock, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const CameraControl = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [rotate, setRotate] = useState(0);
  const [vertical, setVertical] = useState(0);
  const [zoom, setZoom] = useState(5);
  const [cameras, setCameras] = useState(1);
  const [locked, setLocked] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    toast.info("Fonctionnalité en cours de développement – UI uniquement pour le moment");
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const resetParams = () => {
    setRotate(0);
    setVertical(0);
    setZoom(5);
    setCameras(1);
  };

  // Draw 3D camera preview on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background gradient
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
    bgGrad.addColorStop(0, "hsl(240, 15%, 12%)");
    bgGrad.addColorStop(1, "hsl(240, 15%, 6%)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Grid floor
    const centerX = w / 2;
    const centerY = h * 0.6;
    ctx.strokeStyle = "hsla(240, 20%, 30%, 0.3)";
    ctx.lineWidth = 0.5;
    const gridSize = 30;
    const gridCount = 12;
    for (let i = -gridCount; i <= gridCount; i++) {
      // horizontal lines with perspective
      const yOff = i * gridSize * 0.4;
      const spread = 1 + Math.abs(i) * 0.05;
      ctx.beginPath();
      ctx.moveTo(centerX - gridCount * gridSize * spread * 0.3, centerY + yOff);
      ctx.lineTo(centerX + gridCount * gridSize * spread * 0.3, centerY + yOff);
      ctx.stroke();
      // vertical lines
      const xOff = i * gridSize * 0.5;
      ctx.beginPath();
      ctx.moveTo(centerX + xOff, centerY - gridCount * 8);
      ctx.lineTo(centerX + xOff, centerY + gridCount * 8);
      ctx.stroke();
    }

    // Orbit ring
    const orbitRadiusX = 100 + zoom * 8;
    const orbitRadiusY = 40 + zoom * 3;
    const rotRad = (rotate * Math.PI) / 180;
    const vertRad = (vertical * Math.PI) / 180;

    ctx.strokeStyle = "hsl(230, 80%, 60%)";
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "hsl(230, 80%, 60%)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + vertRad * 2, orbitRadiusX, orbitRadiusY, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Camera dot on orbit
    const camX = centerX + Math.cos(rotRad) * orbitRadiusX;
    const camY = centerY + vertRad * 2 + Math.sin(rotRad) * orbitRadiusY;

    // Camera dot glow
    const camGrad = ctx.createRadialGradient(camX, camY, 0, camX, camY, 14);
    camGrad.addColorStop(0, "hsl(260, 80%, 65%)");
    camGrad.addColorStop(1, "hsla(260, 80%, 65%, 0)");
    ctx.fillStyle = camGrad;
    ctx.beginPath();
    ctx.arc(camX, camY, 14, 0, Math.PI * 2);
    ctx.fill();

    // Camera dot solid
    ctx.fillStyle = "hsl(260, 80%, 60%)";
    ctx.beginPath();
    ctx.arc(camX, camY, 7, 0, Math.PI * 2);
    ctx.fill();

    // Second dot (opposite side)
    const cam2X = centerX + Math.cos(rotRad + Math.PI) * orbitRadiusX;
    const cam2Y = centerY + vertRad * 2 + Math.sin(rotRad + Math.PI) * orbitRadiusY;
    const cam2Grad = ctx.createRadialGradient(cam2X, cam2Y, 0, cam2X, cam2Y, 14);
    cam2Grad.addColorStop(0, "hsl(210, 80%, 55%)");
    cam2Grad.addColorStop(1, "hsla(210, 80%, 55%, 0)");
    ctx.fillStyle = cam2Grad;
    ctx.beginPath();
    ctx.arc(cam2X, cam2Y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "hsl(210, 80%, 50%)";
    ctx.beginPath();
    ctx.arc(cam2X, cam2Y, 7, 0, Math.PI * 2);
    ctx.fill();

    // Center image thumbnail
    if (uploadedImage) {
      const img = new Image();
      img.src = uploadedImage;
      const thumbW = 60;
      const thumbH = 60;
      ctx.save();
      // Tilt effect
      ctx.translate(centerX, centerY - 10);
      ctx.rotate(-0.15 + rotRad * 0.05);
      ctx.drawImage(img, -thumbW / 2, -thumbH / 2, thumbW, thumbH);
      ctx.strokeStyle = "hsla(0,0%,100%,0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(-thumbW / 2, -thumbH / 2, thumbW, thumbH);
      ctx.restore();
    } else {
      // Placeholder cube
      ctx.fillStyle = "hsla(0,0%,100%,0.1)";
      ctx.fillRect(centerX - 25, centerY - 35, 50, 50);
      ctx.strokeStyle = "hsla(0,0%,100%,0.2)";
      ctx.lineWidth = 1;
      ctx.strokeRect(centerX - 25, centerY - 35, 50, 50);
    }
  }, [rotate, vertical, zoom, uploadedImage]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Camera Control
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Contrôlez l'angle de caméra pour générer une nouvelle vue de votre image
          </p>
        </motion.div>

        {/* Upload zone */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          {uploadedImage ? (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img src={uploadedImage} alt="Upload" className="w-full aspect-[4/3] object-cover" />
              <button
                onClick={() => setUploadedImage(null)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur text-xs text-foreground hover:bg-background transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Changer l'image
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-border rounded-xl aspect-[4/3] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-colors bg-muted/20"
            >
              <ImagePlus className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Glissez ou cliquez pour ajouter une image</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </motion.div>

        {/* Camera Preview (Canvas 3D) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Camera Preview</span>
            <button className="text-xs text-primary flex items-center gap-1 hover:underline" onClick={resetParams}>
              <RotateCcw className="w-3 h-3" /> Réinitialiser
            </button>
          </div>
          <div className="rounded-xl overflow-hidden border border-border bg-background">
            <canvas
              ref={canvasRef}
              width={400}
              height={280}
              className="w-full h-auto"
            />
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
          {/* Cameras */}
          <div className="flex items-center gap-3 glass rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-primary w-20">Cameras</span>
            <div className="flex-1 flex items-center justify-end gap-2">
              <span className="text-sm font-bold text-foreground">{cameras}</span>
              <button
                onClick={() => setLocked(!locked)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
              >
                {locked ? <Lock className="w-4 h-4 text-muted-foreground" /> : <Unlock className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>
          </div>

          {/* Rotate */}
          <div className="glass rounded-xl px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">Rotate</span>
              <span className="text-sm font-bold text-foreground">{rotate}°</span>
            </div>
            <Slider
              value={[rotate]}
              onValueChange={(v) => !locked && setRotate(v[0])}
              min={-180}
              max={180}
              step={1}
              disabled={locked}
            />
          </div>

          {/* Vertical */}
          <div className="glass rounded-xl px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">Vertical</span>
              <span className="text-sm font-bold text-foreground">{vertical}°</span>
            </div>
            <Slider
              value={[vertical]}
              onValueChange={(v) => !locked && setVertical(v[0])}
              min={-90}
              max={90}
              step={1}
              disabled={locked}
            />
          </div>

          {/* Zoom */}
          <div className="glass rounded-xl px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">Zoom</span>
              <span className="text-sm font-bold text-foreground">{zoom}</span>
            </div>
            <Slider
              value={[zoom]}
              onValueChange={(v) => !locked && setZoom(v[0])}
              min={1}
              max={10}
              step={1}
              disabled={locked}
            />
          </div>
        </motion.div>

        {/* Generate button */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !uploadedImage}
            className="w-full h-12 rounded-xl text-base font-semibold gap-2"
          >
            {isGenerating ? "Génération..." : "Generate"}
            <Sparkles className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default CameraControl;
