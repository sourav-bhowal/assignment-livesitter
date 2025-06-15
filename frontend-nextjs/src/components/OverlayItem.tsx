"use client";

import { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import Image from "next/image";
import { X, Edit3 } from "lucide-react";
import { overlay } from "@/lib/utils";

interface OverlayItemProps {
  overlay: overlay;
  onUpdate: (id: string, updates: Partial<overlay>) => void;
  onDelete: (id: string) => void;
}

const OverlayItem = ({ overlay, onUpdate, onDelete }: OverlayItemProps) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef({
    translate: [overlay.position.x, overlay.position.y],
    width: overlay.size.width,
    height: overlay.size.height,
  });

  const [showControls, setShowControls] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Sync position and size from backend
    const frame = frameRef.current;
    frame.translate = [overlay.position.x, overlay.position.y];
    frame.width = overlay.size.width;
    frame.height = overlay.size.height;
    updateTargetStyle();
  }, [overlay]);

  const updateTargetStyle = () => {
    const el = targetRef.current;
    const frame = frameRef.current;
    if (el) {
      el.style.transform = `translate(${frame.translate[0]}px, ${frame.translate[1]}px)`;
      el.style.width = `${frame.width}px`;
      el.style.height = `${frame.height}px`;
    }
  };

  return (
    <>
      <div
        ref={targetRef}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        className="absolute border border-dashed border-transparent hover:border-blue-500 rounded-lg cursor-move"
        style={{
          zIndex: 10,
          transform: `translate(${overlay.position.x}px, ${overlay.position.y}px)`,
          width: overlay.size.width,
          height: overlay.size.height,
        }}
      >
        <div className="w-full h-full relative bg-white/10 backdrop-blur-sm flex items-center justify-center rounded-lg">
          {overlay.type === "text" ? (
            <div
              contentEditable
              suppressContentEditableWarning
              className="w-full h-full text-center text-black outline-none p-1 cursor-text"
              onFocus={() => setIsEditing(true)}
              onBlur={(e) => {
                setIsEditing(false);
                const newText = e.currentTarget.textContent?.trim() || "";
                if (newText && newText !== overlay.content) {
                  onUpdate(overlay._id, { content: newText });
                }
              }}
              style={{
                fontSize: `${Math.min(
                  frameRef.current.width / 8,
                  frameRef.current.height / 3,
                  24
                )}px`,
              }}
            >
              {overlay.content}
            </div>
          ) : (
            <Image
              src={overlay.content}
              alt="Overlay"
              fill
              className="object-contain rounded"
            />
          )}

          {showControls && (
            <button
              onClick={() => onDelete(overlay._id)}
              className="absolute top-0 right-1 bg-red-500 text-white rounded-full p-1"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <Moveable
        target={targetRef}
        draggable
        resizable
        origin={false}
        onDrag={({ beforeTranslate }) => {
          frameRef.current.translate = beforeTranslate;
          updateTargetStyle();
        }}
        onDragEnd={() => {
          const [x, y] = frameRef.current.translate;
          onUpdate(overlay._id, { position: { x, y } });
        }}
        onResize={({ width, height, drag }) => {
          frameRef.current.width = width;
          frameRef.current.height = height;
          frameRef.current.translate = drag.beforeTranslate;
          updateTargetStyle();
        }}
        onResizeEnd={() => {
          const frame = frameRef.current;
          onUpdate(overlay._id, {
            size: { width: frame.width, height: frame.height },
            position: { x: frame.translate[0], y: frame.translate[1] },
          });
        }}
      />
    </>
  );
};

export default OverlayItem;
