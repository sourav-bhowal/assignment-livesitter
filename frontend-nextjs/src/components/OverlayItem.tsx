"use client";
import { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import Image from "next/image";
import { overlay } from "@/lib/utils";

// Props for the OverlayItem component
interface OverlayItemProps {
  overlay: overlay;
  onUpdate: (id: string, updates: Partial<overlay>) => void;
}

// Component to render an individual overlay item with moveable controls
const OverlayItem = ({ overlay, onUpdate }: OverlayItemProps) => {
  // Ref to manage the target element 
  const targetRef = useRef<HTMLDivElement>(null);

  // Ref to manage the frame state (position and size)
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

  // UseEffect to initialize the target element style based on overlay data
  useEffect(() => {
    // Set initial styles for the target element based on overlay data
    const frame = frameRef.current;
    frame.translate = [overlay.position.x, overlay.position.y];
    frame.width = overlay.size.width;
    frame.height = overlay.size.height;
    updateTargetStyle();  // Update the target element style immediately
  }, [overlay]);

  // Function to update the target element's style based on the frame state
  // This function applies the current position and size to the target element
  const updateTargetStyle = () => {
    const el = targetRef.current; // get the current target element
    const frame = frameRef.current; // get the current frame state
    if (el) { // If the target element exists apply styles
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
    // Delay hiding so it doesn't flicker during interaction
    hideTimeout.current = setTimeout(() => {
      if (!isInteracting) setShowControls(false);
    }, 300);
  };

  // Render Component
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
              className="w-full h-full text-center text-black outline-none p-1"
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
        </div>
      </div>

      {showControls && (
        <Moveable
          target={targetRef}
          draggable
          resizable
          origin={false}
          onDragStart={() => setIsInteracting(true)}
          onDrag={({ beforeTranslate }) => {
            frameRef.current.translate = beforeTranslate; // Update the frame position
            updateTargetStyle();  
          }}
          onDragEnd={() => {
            const [x, y] = frameRef.current.translate;  // Get the updated position
            onUpdate(overlay._id, { position: { x, y } });  // Update position in the parent component
            setIsInteracting(false);
          }}
          onResizeStart={() => setIsInteracting(true)}
          onResize={({ width, height, drag }) => {  // Handle resizing
            // Update the frame size and position based on resize
            frameRef.current.width = width;
            frameRef.current.height = height;
            frameRef.current.translate = drag.beforeTranslate;
            updateTargetStyle();
          }}
          onResizeEnd={() => {  // Handle resize end 
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

export default OverlayItem;
