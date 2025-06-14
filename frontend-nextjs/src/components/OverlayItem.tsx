"use client";

import { useRef, useState } from "react";
import Moveable from "react-moveable";
import Image from "next/image";

const OverlayItem = ({
  overlay,
  onUpdate,
  onDelete,
}: {
  overlay: {
    _id: string;
    type: string;
    content: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
  };
  onUpdate: (
    id: string,
    updates: Partial<{
      position: { x: number; y: number };
      size: { width: number; height: number };
      content: string;
    }>
  ) => void;
  onDelete: (id: string) => void;
}) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({
    translate: [overlay.position.x, overlay.position.y],
    width: overlay.size.width,
    height: overlay.size.height,
  });

  const [showControls, setShowControls] = useState(false);

  return (
    <>
      <div
        ref={targetRef}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        className="group absolute border border-gray-300 rounded shadow text-black"
        style={{
          width: `${frame.width}px`,
          height: `${frame.height}px`,
          transform: `translate(${frame.translate[0]}px, ${frame.translate[1]}px)`,
          zIndex: 10,
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {overlay.type === "text" ? (
            <div
              contentEditable
              suppressContentEditableWarning
              className="outline-none bg-transparent w-full h-full flex items-center justify-center text-center p-1"
              onBlur={(e) => {
                const newText = e.currentTarget.textContent ?? "";
                if (newText !== overlay.content) {
                  onUpdate(overlay._id, { content: newText });
                }
              }}
            >
              {overlay.content}
            </div>
          ) : (
            <Image
              src={overlay.content}
              alt="overlay"
              fill
              style={{ objectFit: "contain" }}
            />
          )}

          {/* Delete button */}
          <button
            onClick={() => onDelete(overlay._id)}
            className={`absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition-colors ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
            style={{
              zIndex: 20,
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      <Moveable
        target={targetRef}
        draggable
        resizable={true}
        origin={false}
        edge={false}
        renderDirections={showControls ? ["nw", "ne", "sw", "se"] : []}
        onDrag={({ beforeTranslate }) => {
          setFrame((prev) => ({
            ...prev,
            translate: beforeTranslate,
          }));
        }}
        onDragEnd={({ lastEvent }) => {
          if (lastEvent) {
            onUpdate(overlay._id, {
              position: {
                x: lastEvent.beforeTranslate[0],
                y: lastEvent.beforeTranslate[1],
              },
            });
          }
        }}
        onResize={({ width, height, drag }) => {
          setFrame({
            width,
            height,
            translate: drag.beforeTranslate,
          });
        }}
        onResizeEnd={({ lastEvent }) => {
          if (lastEvent) {
            onUpdate(overlay._id, {
              size: {
                width: lastEvent.width,
                height: lastEvent.height,
              },
              position: {
                x: lastEvent.drag.beforeTranslate[0],
                y: lastEvent.drag.beforeTranslate[1],
              },
            });
          }
        }}
      />
    </>
  );
};

export default OverlayItem;
