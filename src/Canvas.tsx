import React, { useEffect, useRef, useState } from "react";
import "./App.css";


const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("black");
  const [brushSize, setBrushSize] = useState(5);
  const [text, setText] = useState("");
  const [isTextMode, setIsTextMode] = useState(false);
  const [drawings, setDrawings] = useState<any[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<any[]>([]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePosition, setImagePosition] = useState<{ x: number; y: number } | null>(null);
  const [imageSize, setImageSize] = useState({ width: 100, height: 100 }); // Default image size
  const [draggableItems, setDraggableItems] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    contextRef.current = ctx;
  }, [brushColor, brushSize]);

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const newDrawing:any[] = [];
    draw(event, newDrawing);
    setCurrentDrawing(newDrawing);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>, drawing: any[]) => {
    if (!isDrawing || !contextRef.current) return;
  
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const ctx = contextRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left; // No scaling needed for fixed size
    const y = event.clientY - rect.top;
  
    // Check if we're dragging an item
   
  
    // Drawing shapes or text
    if (selectedShape === "line") {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();
      drawing.push({ type: "line", x, y, color: brushColor, size: brushSize });
    } else if (selectedShape === "rectangle") {
      ctx.beginPath();
      ctx.rect(x - 50, y - 50, 100, 100); // Fixed size for rectangle
      ctx.stroke();
      drawing.push({ type: "rectangle", x: x - 50, y: y - 50, width: 100, height: 100, color: brushColor, size: brushSize });
      setSelectedShape(null); // Reset shape selection after drawing
    } else if (selectedShape === "circle") {
      ctx.beginPath();
      ctx.arc(x, y, 50, 0, 2 * Math.PI); // Fixed radius for circle
      ctx.stroke();
      drawing.push({ type: "circle", x, y, radius: 50, color: brushColor, size: brushSize });
      setSelectedShape(null); // Reset shape selection after drawing
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const handleDragStop = (index:any, e:any, data:any) => {
    const updatedItems:any = [...draggableItems];
    updatedItems[index] = {
      ...updatedItems[index],
      x: data.x,
      y: data.y,
    };
    setDraggableItems(updatedItems);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    contextRef.current?.beginPath(); // Reset the path
    setDrawings([...drawings, currentDrawing]); // Store the current drawing
    setCurrentDrawing([]); // Reset current drawing
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const addText = () => {
    if (!contextRef.current || !text) return;

    const ctx = contextRef.current;
    ctx.fillStyle = brushColor; // Use the brush color for text
    ctx.font = "20px Arial"; // Set font size and family
    ctx.fillText(text, 50, 50); // Draw text at a fixed position
    setText(""); // Clear the input after adding text
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setDrawings([]); // Clear the drawings state
      setImagePosition(null); // Reset image position
    }
  };

  const handleUndo = () => {
    if (drawings.length === 0) return;
    const lastDrawing = drawings[drawings.length - 1];
    setDrawings(drawings.slice(0, -1)); // Remove the last drawing
    redraw(lastDrawing); // Redraw the remaining drawings
  };

  const redraw = (drawing: any[]) => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawing.forEach(({ type, x, y, width, height, radius, color, size }) => {
      ctx.strokeStyle = color; 
      ctx.lineWidth = size;
      if (type === "line") {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (type === "rectangle") {
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.stroke();
      } else if (type === "circle") {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        setImagePosition({ x: 250, y: 250 }); // Center image on canvas
        setImageSize({ width: 100, height: 100 }); // Default image size
      };
    }
  };

  const drawImage = () => {
    if (!imageFile || !imagePosition) return;

    const img = new Image();
    img.src = URL.createObjectURL(imageFile);
    img.onload = () => {
      const ctx = contextRef.current;
      if (ctx) {
        ctx.drawImage(img, imagePosition.x - imageSize.width / 2, imagePosition.y - imageSize.height / 2, imageSize.width, imageSize.height);
      }
    };
  };

  useEffect(() => {
    if (imagePosition) {
      drawImage();
    }
  }, [imageFile, imagePosition]);

  const handleDownloadCanvas = () => {
    const canvas = canvasRef.current;
    
    // Check if canvas is not null
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'drawing.png';
      link.href = canvas.toDataURL();
      link.click();
    } else {
      console.error("Canvas is not available.");
    }
  };

  const copySessionId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionId');
    console.log(sessionId)
    if (sessionId) {
      navigator.clipboard.writeText(sessionId).then(() => {
        alert('Session ID copied to clipboard: ' + sessionId);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    } else {
      alert('No session ID found in the URL.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 h-full w-full ">
  <div className="controls bg-white flex flex-col md:flex-row rounded-lg shadow-lg p-6 mb-6">
    <div className="flex items-center mb-4">
      <label className="mx-4">Brush Color:</label>
      <input
        type="color"
        value={brushColor}
        onChange={(e) => setBrushColor(e.target.value)}
        className="w-12 h-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div className="flex items-center mb-4 mx-4">
      <label className="mr-2">Brush Size:</label>
      <input
        type="number"
        min="1"
        max="50"
        value={brushSize}
        onChange={(e) => setBrushSize(Number(e.target.value))}
        className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div className="flex items-center mb-4">
      <button
        onClick={() => setIsTextMode(!isTextMode)}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mr-2"
      >
        {isTextMode ? "Draw Mode" : "Text Mode"}
      </button>
      {isTextMode && (
        <div className="flex items-center">
          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            placeholder="Enter text"
            className="w-40 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
          />
          <button
            onClick={addText}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Add Text
          </button>
        </div>
      )}
    </div>
    <div className="flex items-center mb-4">
      <button
        onClick={handleClear}
        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded mr-2"
      >
        Clear
      </button>
      <button
        onClick={handleUndo}
        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
      >
        Undo
      </button>
    </div>
    <div className="flex items-center mb-4 mx-2">
      <label className="mr-2">
        <input
          type="radio"
          name="shape"
          checked={selectedShape === null}
          onChange={() => setSelectedShape(null)}
          className="mr-1"
        />
        Pen
      </label>
      <label className="mr-2 ">
        <input
          type="radio"
          name="shape"
          checked={selectedShape === "line"}
          onChange={() => setSelectedShape("line")}
          className="mr-1"
        />
        Line
      </label>
      <label className="mr-2">
        <input
          type="radio"
          name="shape"
          checked={selectedShape === "rectangle"}
          onChange={() => setSelectedShape("rectangle")}
          className="mr-1"
        />
        Rectangle
      </label>
      <label className="mr-2">
        <input
          type="radio"
          name="shape"
          checked={selectedShape === "circle"}
          onChange={() => setSelectedShape("circle")}
          className="mr-1"
        />
        Circle
      </label>
    </div>
    <div className="flex items-center mb-4">
      <label className="mr-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <span className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded cursor-pointer">
          Upload Image
        </span>
      </label>
      <button
        onClick={handleDownloadCanvas}
        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
      >
        Download as PNG
      </button>
      <button
            onClick={copySessionId}
            className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded mr-2"
          >
            Copy Session ID
          </button>
    </div>
  </div>
  
  <canvas
    className="canvas border rounded-lg shadow-lg justify-center items-center bg-white"
    onMouseDown={startDrawing}
    onMouseMove={(e) => draw(e, currentDrawing)}
    onMouseUp={stopDrawing}
    onMouseLeave={stopDrawing}
    ref={canvasRef}
    
  />
  
</div>
  );
};

export default Canvas;