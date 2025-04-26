
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
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-app-paper shadow-lg transition-all duration-300 z-10 overflow-hidden`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-app-paper border-b flex items-center px-4 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="mr-4"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>

          <h1 className="text-lg font-semibold flex-1 truncate">
            {activeFile?.name || "ScribeCanvas"}
          </h1>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAI}
              className={aiOpen ? "bg-app-primary text-white" : ""}
            >
              AI Assistant {aiOpen ? "↓" : "↑"}
            </Button>
          </div>
        </header>

        {/* Content Area with AI Assistant */}
        <div className="flex-1 flex">
          {/* Main Editor */}
          <div className="flex-1 p-4 overflow-auto">
            {activeFile ? (
              activeFile.type === "note" ? (
                <NoteEditor />
              ) : (
                <CanvasEditor />
              )
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Welcome to ScribeCanvas</h2>
                  <p className="text-muted-foreground mb-6">Create a new file to get started</p>
                  <div className="flex justify-center gap-4">
                    <Tabs defaultValue="note">
                      <TabsList>
                        <TabsTrigger value="note"><FileText className="mr-2" size={16} />Note</TabsTrigger>
                        <TabsTrigger value="canvas"><Pen className="mr-2" size={16} />Canvas</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Assistant Panel */}
          {aiOpen && (
            <div className="w-80 border-l bg-app-paper animate-fade-in">
              <AIAssistant />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
