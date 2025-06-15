"use client";
import { useState } from "react";
import axios from "axios";
import { Plus, Loader2, Type, ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OverlayControls = ({ streamId }: { streamId: string }) => {
  const [newText, setNewText] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  // Add text overlay
  const addTextOverlay = async () => {
    if (!newText.trim()) return;
    setIsAdding(true);
    setError("");
    try {
      const newOverlay = {
        type: "text",
        content: newText.trim(),
        position: { x: 50, y: 50 },
        size: { width: 200, height: 60 },
        stream_id: streamId, // Ensure stream_id is set
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/overlays`,
        newOverlay
      );
      setNewText("");
      // await loadOverlays();
    } catch (err) {
      console.error("Failed to add text overlay", err);
      setError("Failed to add overlay");
    } finally {
      setIsAdding(false);
    }
  };

  // Add image overlay
  const addImageOverlay = async () => {
    if (!newImageUrl.trim()) return;

    setIsAdding(true);
    setError("");

    try {
      const newOverlay = {
        type: "image",
        content: newImageUrl.trim(),
        position: { x: 100, y: 100 },
        size: { width: 150, height: 150 },
        stream_id: streamId, // Ensure stream_id is set
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/overlays`,
        newOverlay
      );
      setNewImageUrl("");
      // await loadOverlays();
    } catch (err) {
      console.error("Failed to add image overlay", err);
      setError("Failed to add overlay");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg mt-5">Overlays</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Add Overlay Controls */}
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger
              value="text"
              className="text-xs data-[state=active]:bg-purple-600"
            >
              <Type className="h-3 w-3 mr-1" />
              Text
            </TabsTrigger>
            <TabsTrigger
              value="image"
              className="text-xs data-[state=active]:bg-purple-600"
            >
              <ImageIcon className="h-3 w-3 mr-1" />
              Image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-2 mt-3">
            <Input
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Enter text..."
              className="bg-slate-800/50 border-slate-600 text-white text-sm"
              disabled={isAdding}
            />
            <Button
              onClick={addTextOverlay}
              disabled={!newText.trim() || isAdding}
              size="sm"
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isAdding ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
            </Button>
          </TabsContent>

          <TabsContent value="image" className="space-y-2 mt-3">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Unsplash image URL..."
              className="bg-slate-800/50 border-slate-600 text-white text-sm"
              disabled={isAdding}
            />
            <Button
              onClick={addImageOverlay}
              disabled={!newImageUrl.trim() || isAdding}
              size="sm"
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isAdding ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <div className="text-xs text-slate-400 space-y-1 mb-2 pt-2 border-t border-slate-700/50">
          <p>• Overlays appear on the video</p>
          <p>• Drag to move, resize handles to scale</p>
          <p>• Click text overlays to edit</p>
        </div>
      </CardContent>
    </div>
  );
};

export default OverlayControls;
