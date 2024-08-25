import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import  Draggable  from 'react-draggable';
import { ResizableBox } from 'react-resizable';

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

  return (
    <div className="container">
      <div className="controls">
        <label>
          Brush Color:
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
          />
        </label>
        <label>
          Brush Size:
          <input
            type="number"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
        </label>
        <button onClick={() => setIsTextMode(!isTextMode)}>
          {isTextMode ? "Draw Mode" : "Text Mode"}
        </button>
        {isTextMode && (
          <div>
            <input
              type="text"
              value={text}
              onChange={handleTextChange}
              placeholder="Enter text"
            />
            <button onClick={addText}>Add Text</button>
          </div>
        )}
        <button onClick={handleClear}>Clear</button>
        <button onClick={handleUndo}>Undo</button>
        <div>
          <label>
            <input
              type="radio"
              name="shape"
              checked={selectedShape === null}
              onChange={() => setSelectedShape(null)}
            />
            Pen
          </label>
          <label>
            <input
              type="radio"
              name="shape"
              checked={selectedShape === "line"}
              onChange={() => setSelectedShape("line")}
            />
            Line
          </label>
          <label>
            <input
              type="radio"
              name="shape"
              checked={selectedShape === "rectangle"}
              onChange={() => setSelectedShape("rectangle")}
            />
            Rectangle
          </label>
          <label>
            <input
              type="radio"
              name="shape"
              checked={selectedShape === "circle"}
              onChange={() => setSelectedShape("circle")}
            />
            Circle
          </label>
        </div>
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
      </div>
      
      <canvas
        className="canvas"
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