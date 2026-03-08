import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { CgClose } from "react-icons/cg";
import { TbFlipVertical, TbFlipHorizontal } from "react-icons/tb";

interface ImageEditorModalProps {
  open: boolean;
  image: string;
  outputSize: { w: number; h: number };
  onClose: () => void;
  onSave: (image: string) => void;
}

const EXPORT_SCALE_MULTIPLIER = 2;
const ZOOM_LEVEL_MIN = 1;
const ZOOM_LEVEL_MAX = 10;
const SCALE_MIN = 0.5;
const SCALE_MAX = 3;

export default function ImageEditorModal({
  open,
  image,
  outputSize,
  onClose,
  onSave,
}: ImageEditorModalProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(3);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(1);
  const [flipY, setFlipY] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [imageSize, setImageSize] = useState({ w: 1, h: 1 });

  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPosition({ x: 0, y: 0 });
      setZoomLevel(3);
      setRotation(0);
      setFlipX(1);
      setFlipY(1);
    }
  }, [open, image]);

  useEffect(() => {
    if (!open || !image) return;

    const img = new Image();
    img.onload = () => {
      setImageSize({
        w: img.naturalWidth || img.width || 1,
        h: img.naturalHeight || img.height || 1,
      });
    };
    img.src = image;
  }, [open, image]);

  if (!open) return null;

  const scale =
    SCALE_MIN +
    ((zoomLevel - ZOOM_LEVEL_MIN) / (ZOOM_LEVEL_MAX - ZOOM_LEVEL_MIN)) *
      (SCALE_MAX - SCALE_MIN);

  const baseScale = Math.max(
    outputSize.w / imageSize.w,
    outputSize.h / imageSize.h,
  );
  const totalScale = baseScale * scale;

  const onMouseDown = (e: MouseEvent) => {
    setDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const stopDrag = () => setDragging(false);

  const handleSave = async () => {
    const img = new Image();
    img.src = image;
    await img.decode();

    const srcW = img.naturalWidth || img.width || 1;
    const srcH = img.naturalHeight || img.height || 1;
    const baseExportScale = Math.max(outputSize.w / srcW, outputSize.h / srcH);
    const totalExportScale = baseExportScale * scale;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(outputSize.w * EXPORT_SCALE_MULTIPLIER);
    canvas.height = Math.round(outputSize.h * EXPORT_SCALE_MULTIPLIER);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.scale(EXPORT_SCALE_MULTIPLIER, EXPORT_SCALE_MULTIPLIER);
    ctx.translate(outputSize.w / 2 + position.x, outputSize.h / 2 + position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(totalExportScale * flipX, totalExportScale * flipY);
    ctx.drawImage(img, -srcW / 2, -srcH / 2);

    const result = canvas.toDataURL("image/jpeg", 0.95);
    onSave(result);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[min(96vw,1120px)] overflow-x-hidden rounded-2xl bg-white p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Adjust Image</h2>
          <Button
            onClick={onClose}
            aria-label="Close image editor"
            className="rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <CgClose className="h-7 w-7" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0">
            <div className="flex items-center justify-center">
              <div
                className="relative overflow-hidden rounded-xl bg-slate-100"
                style={{
                  width: outputSize.w,
                  height: outputSize.h,
                }}
                onMouseMove={onMouseMove}
                onMouseUp={stopDrag}
                onMouseLeave={stopDrag}
              >
                <img
                  ref={imgRef}
                  src={image}
                  draggable={false}
                  onMouseDown={onMouseDown}
                  className="absolute cursor-move select-none"
                  style={{
                    top: "50%",
                    left: "50%",
                    width: imageSize.w,
                    height: imageSize.h,
                    maxWidth: "none",
                    maxHeight: "none",
                    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${totalScale * flipX}, ${totalScale * flipY})`,
                    transformOrigin: "center",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Zoom
                  </label>
                  <span className="text-xs font-semibold text-slate-500">
                    {zoomLevel}/10
                  </span>
                </div>
                <input
                  type="range"
                  min={ZOOM_LEVEL_MIN}
                  max={ZOOM_LEVEL_MAX}
                  step={1}
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(Number(e.target.value))}
                  className="mt-2 w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFlipX((prev) => prev * -1)}
                  className="flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50"
                  aria-label="Flip Left Right"
                >
                  <TbFlipVertical className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setFlipY((prev) => prev * -1)}
                  className="flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50"
                  aria-label="Flip Up Down"
                >
                  <TbFlipHorizontal className="h-5 w-5" />
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Rotate
                  </label>
                  <span className="text-xs font-semibold text-slate-500">
                    {rotation} deg
                  </span>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="mt-2 w-full"
                />
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>-180</span>
                  <span>0</span>
                  <span>180</span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <button
                onClick={handleSave}
                className="w-full rounded-full bg-main px-4 py-2 text-sm font-medium text-white hover:bg-main/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

