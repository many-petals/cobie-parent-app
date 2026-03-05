import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Undo, Trash2 } from 'lucide-react';

interface DrawingCanvasProps {
  onDrawingChange?: (dataUrl: string) => void;
  initialDrawing?: string;
  width?: number;
  height?: number;
  className?: string;
}

const colors = [
  { name: 'Black', value: '#1a1a1a' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Brown', value: '#92400e' },
];

const brushSizes = [
  { name: 'Small', value: 4 },
  { name: 'Medium', value: 8 },
  { name: 'Large', value: 16 },
];

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  onDrawingChange,
  initialDrawing,
  width = 400,
  height = 300,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(colors[0].value);
  const [brushSize, setBrushSize] = useState(brushSizes[1].value);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load initial drawing if provided
    if (initialDrawing) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        saveToHistory();
      };
      img.src = initialDrawing;
    } else {
      saveToHistory();
    }
  }, []);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL();
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, dataUrl];
    });
    setHistoryIndex(prev => prev + 1);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = isEraser ? '#ffffff' : currentColor;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
      
      // Notify parent of drawing change
      const canvas = canvasRef.current;
      if (canvas && onDrawingChange) {
        onDrawingChange(canvas.toDataURL());
      }
    }
  };

  const undo = () => {
    if (historyIndex <= 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const newIndex = historyIndex - 1;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx.drawImage(img, 0, 0);
      setHistoryIndex(newIndex);
      
      if (onDrawingChange) {
        onDrawingChange(history[newIndex]);
      }
    };
    img.src = history[newIndex];
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas!.width, canvas!.height);
    saveToHistory();

    if (onDrawingChange) {
      onDrawingChange(canvas!.toDataURL());
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-4 border-gray-200 bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="touch-none cursor-crosshair w-full"
          style={{ aspectRatio: `${width}/${height}` }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Tools */}
      <div className="mt-4 space-y-3">
        {/* Colors */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => {
                setCurrentColor(color.value);
                setIsEraser(false);
              }}
              className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                currentColor === color.value && !isEraser
                  ? 'ring-4 ring-offset-2 ring-gray-400 scale-110'
                  : ''
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>

        {/* Brush sizes and tools */}
        <div className="flex items-center justify-center gap-3">
          {/* Brush sizes */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
            {brushSizes.map((size) => (
              <button
                key={size.value}
                onClick={() => setBrushSize(size.value)}
                className={`rounded-full bg-gray-800 transition-all ${
                  brushSize === size.value ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{ width: size.value + 8, height: size.value + 8 }}
                title={size.name}
              />
            ))}
          </div>

          {/* Eraser */}
          <button
            onClick={() => setIsEraser(!isEraser)}
            className={`p-2.5 rounded-xl transition-colors ${
              isEraser
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Eraser"
          >
            <Eraser className="w-5 h-5" />
          </button>

          {/* Undo */}
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Undo"
          >
            <Undo className="w-5 h-5" />
          </button>

          {/* Clear */}
          <button
            onClick={clearCanvas}
            className="p-2.5 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            title="Clear all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingCanvas;
