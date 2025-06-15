"use client"
import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Plus, Loader2, Type, ImageIcon, AlertCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Label } from "@/components/ui/label"
// import { ScrollArea } from "@/components/ui/scroll-area"
import { overlay } from "@/lib/utils"

const OverlayControls = () => {
  const [overlays, setOverlays] = useState<overlay[]>([])
  const [newText, setNewText] = useState("")
  const [newImageUrl, setNewImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState("")

  // Load overlays
  const loadOverlays = useCallback(async () => {
    try {
      setError("")
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/overlays`)
      setOverlays(res.data)
    } catch (err) {
      console.error("Failed to load overlays", err)
      setError("Failed to load overlays")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Add text overlay
  const addTextOverlay = async () => {
    if (!newText.trim()) return

    setIsAdding(true)
    setError("")

    try {
      const newOverlay = {
        type: "text",
        content: newText.trim(),
        position: { x: 50, y: 50 },
        size: { width: 200, height: 60 },
      }

      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/overlays`, newOverlay)
      setNewText("")
      await loadOverlays()
    } catch (err) {
      console.error("Failed to add text overlay", err)
      setError("Failed to add overlay")
    } finally {
      setIsAdding(false)
    }
  }

  // Add image overlay
  const addImageOverlay = async () => {
    if (!newImageUrl.trim()) return

    setIsAdding(true)
    setError("")

    try {
      const newOverlay = {
        type: "image",
        content: newImageUrl.trim(),
        position: { x: 100, y: 100 },
        size: { width: 150, height: 150 },
      }

      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/overlays`, newOverlay)
      setNewImageUrl("")
      await loadOverlays()
    } catch (err) {
      console.error("Failed to add image overlay", err)
      setError("Failed to add overlay")
    } finally {
      setIsAdding(false)
    }
  }

  // Delete overlay
  // const deleteOverlay = async (id: string) => {
  //   try {
  //     setError("")
  //     await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/overlays/${id}`)
  //     await loadOverlays()
  //   } catch (err) {
  //     console.error("Failed to delete overlay", err)
  //     setError("Failed to delete overlay")
  //   }
  // }

  useEffect(() => {
    loadOverlays()
  }, [loadOverlays])

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg mt-5">Overlays</CardTitle>
          {/* <Badge variant="secondary" className="text-xs">
            {overlays.length}
          </Badge> */}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Add Overlay Controls */}
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="text" className="text-xs data-[state=active]:bg-purple-600">
              <Type className="h-3 w-3 mr-1" />
              Text
            </TabsTrigger>
            <TabsTrigger value="image" className="text-xs data-[state=active]:bg-purple-600">
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
              {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            </Button>
          </TabsContent>

          <TabsContent value="image" className="space-y-2 mt-3">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Image URL..."
              className="bg-slate-800/50 border-slate-600 text-white text-sm"
              disabled={isAdding}
            />
            <Button
              onClick={addImageOverlay}
              disabled={!newImageUrl.trim() || isAdding}
              size="sm"
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
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

        {/* Overlay List */}
        {/* <div className="space-y-2">
          <Label className="text-slate-300 text-sm">Active Overlays</Label>
          <ScrollArea className="h-48">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              </div>
            ) : overlays.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-400 text-xs">No overlays</p>
              </div>
            ) : (
              <div className="space-y-2">
                {overlays.map((overlay, index) => (
                  <div
                    key={overlay._id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-600/20 text-purple-400 text-xs">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          {overlay.type === "text" ? (
                            <Type className="h-3 w-3 text-slate-400" />
                          ) : (
                            <ImageIcon className="h-3 w-3 text-slate-400" />
                          )}
                          <span className="text-white text-xs truncate">
                            {overlay.type === "text"
                              ? overlay.content.length > 15
                                ? `${overlay.content.substring(0, 15)}...`
                                : overlay.content
                              : "Image"}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {overlay.position.x},{overlay.position.y}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteOverlay(overlay._id)}
                      className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div> */}

        {/* Instructions */}
        <div className="text-xs text-slate-400 space-y-1 mb-2 pt-2 border-t border-slate-700/50">
          <p>• Overlays appear on the video</p>
          <p>• Drag to move, resize handles to scale</p>
          <p>• Click text overlays to edit</p>
        </div>
      </CardContent>
    </div>
  )
}

export default OverlayControls
