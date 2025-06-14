import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import OverlayItem from "./OverlayItem";

const OverlayControls = ({ streamId }) => {
  const [overlays, setOverlays] = useState([]);
  const [newText, setNewText] = useState("");

  // useCallback ensures stable reference
  const loadOverlays = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/overlays");
      setOverlays(res.data);
    } catch (err) {
      console.error("Failed to load overlays", err);
    }
  }, []);

  const addOverlay = async () => {
    const newOverlay = {
      type: "text",
      content: newText,
      position: { x: 50, y: 50 },
      size: { width: 150, height: 50 },
    };
    const res = await axios.post(
      "http://localhost:5000/api/overlays",
      newOverlay
    );
    setNewText("");
    loadOverlays(); // reload after adding
  };

  const updateOverlay = async (id, changes) => {
    console.log("Updating", id, changes);
    await axios.put(`http://localhost:5000/api/overlays/${id}`, changes);
    loadOverlays(); // reload after updating
  };

  const deleteOverlay = async (id) => {
    await axios.delete(`http://localhost:5000/api/overlays/${id}`);
    loadOverlays(); // reload after deleting
  };

  useEffect(() => {
    loadOverlays();
  }, []);

  return (
    <>
      <div className="p-4 bg-white shadow-md rounded-lg mb-4 mt-4">
        <h2 className="text-lg font-semibold mb-2">Overlay Controls</h2>
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Overlay text"
          className="mb-4 p-2 border border-gray-300 rounded-lg w-full max-w-md"
        />
        <button
          onClick={addOverlay}
          className="bg-blue-500 text-white ml-1 px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Add Text Overlay
        </button>
      </div>

      {overlays.map((overlay) => (
        <OverlayItem
          key={overlay._id}
          overlay={overlay}
          onUpdate={updateOverlay}
          onDelete={deleteOverlay}
        />
      ))}
    </>
  );
};

export default OverlayControls;
