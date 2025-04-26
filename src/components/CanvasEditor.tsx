
import React, { useRef, useEffect, useState } from "react";
import { useFileSystem } from "../contexts/FileSystemContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Pen,
  Square,
  Circle as CircleIcon,
  Eraser,
  Save,
  FileText,
  Undo,
  Redo,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Tool = "pen" | "rectangle" | "circle" | "eraser";

const CanvasEditor: React.FC = () => {
  const { activeFile, updateFile } = useFileSystem();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [tool, setTool] = useState<Tool>("pen");
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Set initial canvas styling
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    setContext(ctx);

    // Load saved canvas data if available
    if (activeFile?.content) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // Initialize history with the loaded state
        saveToHistory();
      };
      img.src = activeFile.content;
    } else {
      // Initialize with blank canvas
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    }
    
    // Handle window resize
    const handleResize = () => {
      if (!canvas || !ctx) return;
      
      // Save current canvas state
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx?.drawImage(canvas, 0, 0);
      
      // Resize canvas
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Restore drawing with white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tempCanvas, 0, 0);
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeFile]);

  // Save current state to history
  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL("image/png");
    
    // If we're not at the end of the history, remove everything after current index
    if (historyIndex !== history.length - 1) {
      setHistory(prev => prev.slice(0, historyIndex + 1));
    }
    
    setHistory(prev => [...prev, dataURL]);
    setHistoryIndex(prev => prev + 1);
  };

  // Handle undo
  const handleUndo = () => {
    if (historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    
    const canvas = canvasRef.current;
    const ctx = context;
    if (!canvas || !ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = history[newIndex];
  };

  // Handle redo
  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    
    const canvas = canvasRef.current;
    const ctx = context;
    if (!canvas || !ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = history[newIndex];
  };

  // Save canvas to file
  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !activeFile) return;
    
    const dataURL = canvas.toDataURL("image/png");
    updateFile(activeFile.id, dataURL);
    toast.success("Canvas saved");
  };

  // Start drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!context || !canvasRef.current) return;
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    if ("touches" in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    setStartPos({ x, y });
    
    if (tool === "pen" || tool === "eraser") {
      context.beginPath();
      context.moveTo(x, y);
      context.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      context.lineWidth = tool === "eraser" ? size * 2 : size;
    }
  };

  // Draw
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || !canvasRef.current) return;
    
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    if ("touches" in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    if (tool === "pen" || tool === "eraser") {
      context.lineTo(x, y);
      context.stroke();
    } else {
      // For rectangle and circle, we need to redraw on each movement
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      
      if (tempCtx) {
        // Copy the current canvas state
        tempCtx.drawImage(canvas, 0, 0);
        
        // Draw the shape
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(tempCanvas, 0, 0);
        
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = size;
        
        if (tool === "rectangle") {
          const width = x - startPos.x;
          const height = y - startPos.y;
          context.rect(startPos.x, startPos.y, width, height);
        } else if (tool === "circle") {
          const radius = Math.sqrt(
            Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2)
          );
          context.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        }
        
        context.stroke();
      }
    }
  };

  // End drawing
  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (tool === "rectangle" || tool === "circle") {
      const canvas = canvasRef.current;
      if (!canvas || !context) return;
      
      context.beginPath();
      context.strokeStyle = color;
      context.lineWidth = size;
      
      if (tool === "rectangle") {
        // No need to redraw, already drawn in the move handler
      } else if (tool === "circle") {
        // No need to redraw, already drawn in the move handler
      }
      
      context.stroke();
    }
    
    // Save state to history
    saveToHistory();
  };

  if (!activeFile || activeFile.type !== "canvas") {
    return <div>No canvas selected</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-app-paper rounded-t-lg border p-2 flex gap-1 flex-wrap items-center">
        <TooltipProvider>
          {/* Drawing Tools */}
          <div className="flex gap-1 mr-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "pen" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("pen")}
                  className="h-9 w-9"
                >
                  <Pen size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Pen</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "rectangle" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("rectangle")}
                  className="h-9 w-9"
                >
                  <Square size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rectangle</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "circle" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("circle")}
                  className="h-9 w-9"
                >
                  <CircleIcon size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Circle</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "eraser" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTool("eraser")}
                  className="h-9 w-9"
                >
                  <Eraser size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Eraser</TooltipContent>
            </Tooltip>
          </div>
          
          {/* Color picker */}
          <div className="flex items-center mr-4">
            <span className="text-sm text-gray-500 mr-2">Color:</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
          </div>
          
          {/* Size slider */}
          <div className="flex items-center mr-4">
            <span className="text-sm text-gray-500 mr-2">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-24"
            />
          </div>
          
          {/* History controls */}
          <div className="flex gap-1 mr-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="h-9 w-9"
                >
                  <Undo size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="h-9 w-9"
                >
                  <Redo size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </div>
          
          {/* Save button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={saveCanvas}
                className="h-9 w-9"
              >
                <Save size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save Canvas</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex-1 border p-0 overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="w-full h-full drawing-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseOut={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>
    </div>
  );
};

export default CanvasEditor;
