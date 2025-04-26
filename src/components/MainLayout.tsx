
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import NoteEditor from "./NoteEditor";
import CanvasEditor from "./CanvasEditor";
import AIAssistant from "./AIAssistant";
import { useFileSystem } from "../contexts/FileSystemContext";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pen,
  FileText,
  Menu,
  X,
  Sparkles
} from "lucide-react";

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiOpen, setAIOpen] = useState(false);
  const { activeFile } = useFileSystem();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleAI = () => {
    setAIOpen(!aiOpen);
  };

  return (
    <div className="flex h-screen bg-app-background">
      {/* Sidebar with smooth transition */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-app-paper shadow-lg transition-all duration-300 ease-in-out z-10 overflow-hidden border-r border-gray-200`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Top Bar */}
        <header className="h-14 bg-app-paper border-b flex items-center px-4 shadow-sm backdrop-blur-sm bg-white/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="mr-4 hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>

          <h1 className="text-lg font-semibold flex-1 truncate text-app-primary">
            {activeFile?.name || "ScribeCanvas"}
          </h1>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAI}
              className={`transition-all duration-200 gap-2 ${
                aiOpen 
                ? "bg-app-primary text-white hover:bg-app-primary/90" 
                : "hover:bg-gray-100"
              }`}
            >
              <Sparkles size={16} />
              AI Assistant {aiOpen ? "↓" : "↑"}
            </Button>
          </div>
        </header>

        {/* Content Area with AI Assistant */}
        <div className="flex-1 flex">
          {/* Main Editor Area */}
          <div className="flex-1 p-6 overflow-auto">
            {activeFile ? (
              activeFile.type === "note" ? (
                <NoteEditor />
              ) : (
                <CanvasEditor />
              )
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8 rounded-lg bg-white shadow-sm">
                  <h2 className="text-2xl font-bold mb-4 text-app-primary">Welcome to ScribeCanvas</h2>
                  <p className="text-gray-600 mb-8">Create a new file to start your creative journey</p>
                  <div className="flex justify-center">
                    <Tabs defaultValue="note" className="w-full max-w-xs">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="note" className="gap-2">
                          <FileText className="w-4 h-4" />
                          Note
                        </TabsTrigger>
                        <TabsTrigger value="canvas" className="gap-2">
                          <Pen className="w-4 h-4" />
                          Canvas
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Assistant Panel with smooth transition */}
          <div 
            className={`
              w-80 border-l bg-app-paper transition-all duration-300 ease-in-out
              ${aiOpen ? 'translate-x-0' : 'translate-x-full'}
              ${aiOpen ? 'opacity-100' : 'opacity-0'}
            `}
          >
            {aiOpen && <AIAssistant />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
