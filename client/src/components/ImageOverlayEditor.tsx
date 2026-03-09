import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: "normal" | "bold";
}

interface ImageOverlayEditorProps {
  imageUrl: string;
  caption?: string;
  open: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

export default function ImageOverlayEditor({ imageUrl, caption, open, onClose, onSave }: ImageOverlayEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [overlays, setOverlays] = useState<TextOverlay[]>([]);
  const [currentText, setCurrentText] = useState(caption || "");
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState("#000000");
  const [fontWeight, setFontWeight] = useState<"normal" | "bold">("bold");
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load image
  useEffect(() => {
    if (!open) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
      drawCanvas();
    };
    img.src = imageUrl;
  }, [imageUrl, open]);

  // Redraw when overlays change
  useEffect(() => {
    if (imgLoaded) drawCanvas();
  }, [overlays, imgLoaded, selectedOverlay]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    overlays.forEach((overlay) => {
      ctx.font = `${overlay.fontWeight} ${overlay.fontSize}px 'Amiri', 'Arial', serif`;
      ctx.fillStyle = overlay.color;
      ctx.textAlign = "center";
      ctx.direction = "rtl";

      // Draw background for readability
      const metrics = ctx.measureText(overlay.text);
      const textWidth = metrics.width;
      const textHeight = overlay.fontSize * 1.2;
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(
        overlay.x - textWidth / 2 - 8,
        overlay.y - textHeight + 4,
        textWidth + 16,
        textHeight + 8
      );

      // Draw text
      ctx.fillStyle = overlay.color;
      ctx.fillText(overlay.text, overlay.x, overlay.y);

      // Draw selection border
      if (selectedOverlay === overlay.id) {
        ctx.strokeStyle = "#6366f1";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(
          overlay.x - textWidth / 2 - 10,
          overlay.y - textHeight + 2,
          textWidth + 20,
          textHeight + 12
        );
        ctx.setLineDash([]);
      }
    });
  };

  const addOverlay = () => {
    if (!currentText.trim() || !canvasRef.current) return;
    const newOverlay: TextOverlay = {
      id: Date.now().toString(),
      text: currentText.trim(),
      x: canvasRef.current.width / 2,
      y: canvasRef.current.height / 2,
      fontSize,
      color,
      fontWeight,
    };
    setOverlays((prev) => [...prev, newOverlay]);
    setSelectedOverlay(newOverlay.id);
    setCurrentText("");
  };

  const removeOverlay = (id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
    if (selectedOverlay === id) setSelectedOverlay(null);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicking on an overlay
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    for (let i = overlays.length - 1; i >= 0; i--) {
      const overlay = overlays[i];
      ctx.font = `${overlay.fontWeight} ${overlay.fontSize}px 'Amiri', 'Arial', serif`;
      const metrics = ctx.measureText(overlay.text);
      const textWidth = metrics.width;
      const textHeight = overlay.fontSize * 1.2;

      if (
        x >= overlay.x - textWidth / 2 - 10 &&
        x <= overlay.x + textWidth / 2 + 10 &&
        y >= overlay.y - textHeight &&
        y <= overlay.y + 10
      ) {
        setSelectedOverlay(overlay.id);
        setDragging(overlay.id);
        setDragOffset({ x: x - overlay.x, y: y - overlay.y });
        return;
      }
    }
    setSelectedOverlay(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX - dragOffset.x;
    const y = (e.clientY - rect.top) * scaleY - dragOffset.y;

    setOverlays((prev) =>
      prev.map((o) => (o.id === dragging ? { ...o, x, y } : o))
    );
  };

  const handleCanvasMouseUp = () => {
    setDragging(null);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Redraw without selection border
    setSelectedOverlay(null);
    setTimeout(() => {
      const dataUrl = canvas.toDataURL("image/png");
      onSave(dataUrl);
      onClose();
    }, 50);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/20 text-white max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            ✏️ إضافة تسميات عربية على الصورة
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Canvas */}
          <div className="border border-white/20 rounded-lg overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              className="w-full cursor-move"
              style={{ maxHeight: "400px", objectFit: "contain" }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
          </div>

          {/* Add text controls */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-2">
              <Label className="text-xs text-white/70 mb-1 block">النص العربي</Label>
              <Input
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder="أدخل التسمية..."
                className="bg-white/10 border-white/20 text-white text-sm"
                dir="rtl"
              />
            </div>
            <div>
              <Label className="text-xs text-white/70 mb-1 block">الحجم</Label>
              <Select value={fontSize.toString()} onValueChange={(v) => setFontSize(Number(v))}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[14, 18, 22, 24, 28, 32, 36, 42, 48].map((s) => (
                    <SelectItem key={s} value={s.toString()}>
                      {s}px
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 items-end">
              <div>
                <Label className="text-xs text-white/70 mb-1 block">اللون</Label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-9 rounded border border-white/20 cursor-pointer"
                />
              </div>
              <Button
                size="sm"
                onClick={addOverlay}
                disabled={!currentText.trim()}
                className="bg-violet-700 hover:bg-violet-600 text-white text-xs h-9"
              >
                + إضافة
              </Button>
            </div>
          </div>

          {/* Font weight toggle */}
          <div className="flex gap-2 items-center">
            <Label className="text-xs text-white/70">سمك الخط:</Label>
            <Button
              size="sm"
              variant={fontWeight === "bold" ? "default" : "outline"}
              onClick={() => setFontWeight("bold")}
              className="text-xs h-7 px-3"
            >
              عريض
            </Button>
            <Button
              size="sm"
              variant={fontWeight === "normal" ? "default" : "outline"}
              onClick={() => setFontWeight("normal")}
              className="text-xs h-7 px-3"
            >
              عادي
            </Button>
          </div>

          {/* Overlays list */}
          {overlays.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs text-white/70">التسميات المضافة:</Label>
              {overlays.map((o) => (
                <div
                  key={o.id}
                  className={`flex items-center justify-between p-2 rounded text-sm ${
                    selectedOverlay === o.id
                      ? "bg-violet-800/40 border border-violet-400/50"
                      : "bg-white/5 border border-white/10"
                  }`}
                  onClick={() => setSelectedOverlay(o.id)}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-white/30"
                      style={{ backgroundColor: o.color }}
                    />
                    <span>{o.text}</span>
                    <span className="text-white/40 text-xs">({o.fontSize}px)</span>
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOverlay(o.id);
                    }}
                    className="text-red-400 hover:text-red-300 text-xs h-6 px-2"
                  >
                    حذف
                  </Button>
                </div>
              ))}
            </div>
          )}

          <p className="text-[10px] text-white/40">
            اسحب التسميات على الصورة لتحريكها. اضغط على تسمية لتحديدها.
          </p>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} className="border-white/20 text-white text-sm">
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              disabled={overlays.length === 0}
              className="bg-green-700 hover:bg-green-600 text-white text-sm"
            >
              💾 حفظ الصورة مع التسميات
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
