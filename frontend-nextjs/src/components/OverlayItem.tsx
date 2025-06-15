"use client";
import { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import Image from "next/image";
import { X } from "lucide-react";
import { overlay } from "@/lib/utils";

// Define the props for the OverlayItem component
interface OverlayItemProps {
  overlay: overlay;
  onUpdate: (id: string, updates: Partial<overlay>) => void;
  onDelete: (id: string) => void;
}

// OverlayItem component to render and manage individual overlays
export const OverlayItem = ({ overlay, onUpdate, onDelete }: OverlayItemProps) => {
  // Ref to the target element for Moveable
  const targetRef = useRef<HTMLDivElement>(null);

  // Ref to store the current frame state
  const frameRef = useRef({
    translate: [overlay.position.x, overlay.position.y],
    width: overlay.size.width,
    height: overlay.size.height,
  });

  // State to manage visibility of controls and interaction state
  const [showControls, setShowControls] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  // Ref to manage hide timeout
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  // Effect to update the frame when overlay changes
  useEffect(() => {
    const frame = frameRef.current;
    frame.translate = [overlay.position.x, overlay.position.y];
    frame.width = overlay.size.width;
    frame.height = overlay.size.height;
    updateTargetStyle();
  }, [overlay]);

  // Function to update the target element's style based on the frame state
  const updateTargetStyle = () => {
    const el = targetRef.current;
    const frame = frameRef.current;
    if (el) {
      el.style.transform = `translate(${frame.translate[0]}px, ${frame.translate[1]}px)`;
      el.style.width = `${frame.width}px`;
      el.style.height = `${frame.height}px`;
    }
  };

  // Handlers for mouse enter and leave events to show/hide controls
  const handleMouseEnter = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setShowControls(true);
  };

  // Handler for mouse leave event with a delay to prevent flicker
  const handleMouseLeave = () => {
    // Delay hiding so it doesn’t flicker during interaction
    hideTimeout.current = setTimeout(() => {
      if (!isInteracting) setShowControls(false);
    }, 300);
  };

  return (
    <>
      <div
        ref={targetRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
              onBlur={(e) => {
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
              className="absolute top-0 right-1 bg-red-500 text-white rounded-full p-1 cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Moveable controls */}
      {showControls && (
        <Moveable
          target={targetRef}
          draggable
          resizable
          origin={false}
          onDragStart={() => setIsInteracting(true)}
          onDrag={({ beforeTranslate }) => {
            frameRef.current.translate = beforeTranslate;
            updateTargetStyle();
          }}
          onDragEnd={() => {
            const [x, y] = frameRef.current.translate;
            onUpdate(overlay._id, { position: { x, y } });
            setIsInteracting(false);
          }}
          onResizeStart={() => setIsInteracting(true)}
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
            setIsInteracting(false);
          }}
        />
      )}
    </>
  );
};

