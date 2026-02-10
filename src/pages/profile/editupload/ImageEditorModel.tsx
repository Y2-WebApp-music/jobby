import { useEffect, useRef, useState } from "react";

interface ImageEditorModalProps {
    open: boolean;
    image: string;
    outputSize: { w: number; h: number };
    onClose: () => void;
    onSave: (image: string) => void;
}

export default function ImageEditorModal({
    open,
    image,
    outputSize,
    onClose,
    onSave,
}: ImageEditorModalProps) {
    const imgRef = useRef<HTMLImageElement | null>(null);

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [dragging, setDragging] = useState(false);

    const dragStart = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPosition({ x: 0, y: 0 });
            setScale(1);
            setRotation(0);
        }
    }, [open, image]);

    if (!open) return null;

    /* ---------------- drag logic ---------------- */

    const onMouseDown = (e: React.MouseEvent) => {
        setDragging(true);
        dragStart.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!dragging) return;
        setPosition({
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y,
        });
    };

    const stopDrag = () => setDragging(false);

    /* ---------------- export canvas ---------------- */

    const handleSave = async () => {
        const img = new Image();
        img.src = image;
        await img.decode();

        const canvas = document.createElement("canvas");
        canvas.width = outputSize.w;
        canvas.height = outputSize.h;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);

        ctx.drawImage(
            img,
            -canvas.width / 2 - position.x,
            -canvas.height / 2 - position.y
        );

        const result = canvas.toDataURL("image/jpeg", 0.9);
        onSave(result);
        onClose();
    };

    /* ---------------- UI ---------------- */

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-slate-800">
                    Adjust Image
                </h2>

                {/* Crop Area */}
                <div
                    className="relative mx-auto overflow-hidden rounded-xl bg-slate-100"
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
                            transform: `
                                translate(${position.x}px, ${position.y}px)
                                scale(${scale})
                                rotate(${rotation}deg)
                            `,
                            transformOrigin: "center",
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="mt-4 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Zoom
                        </label>
                        <input
                            type="range"
                            min={0.5}
                            max={3}
                            step={0.01}
                            value={scale}
                            onChange={(e) =>
                                setScale(Number(e.target.value))
                            }
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Rotate
                        </label>
                        <input
                            type="range"
                            min={-180}
                            max={180}
                            step={1}
                            value={rotation}
                            onChange={(e) =>
                                setRotation(Number(e.target.value))
                            }
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="rounded-full bg-[#FF8E00] px-4 py-2 text-sm font-medium text-white hover:bg-[#e97f00]"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
