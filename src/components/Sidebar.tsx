
import React, { useState } from "react";
import { useFileSystem, File } from "../contexts/FileSystemContext";
import { Button } from "./ui/button";
import {
  FileText,
  Pen,
  Plus,
  Trash2,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const { files, activeFile, setActiveFile, createFile, deleteFile } = useFileSystem();
  const [searchTerm, setSearchTerm] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileType, setNewFileType] = useState<"note" | "canvas">("note");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      createFile(newFileName, newFileType);
      setNewFileName("");
      setDialogOpen(false);
    }
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    return b.lastModified.getTime() - a.lastModified.getTime();
  });

  const handleFileClick = (file: File) => {
    setActiveFile(file.id);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-4 text-app-primary">ScribeCanvas</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search files..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4 flex-1 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-sm text-gray-500 uppercase">Files</h3>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-7 w-7">
                <Plus size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New File</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="File name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="mb-4"
                autoFocus
              />
              <Tabs defaultValue="note" onValueChange={(v) => setNewFileType(v as "note" | "canvas")}>
                <TabsList className="w-full">
                  <TabsTrigger value="note" className="flex-1">
                    <FileText className="mr-2" size={16} />
                    Note
                  </TabsTrigger>
                  <TabsTrigger value="canvas" className="flex-1">
                    <Pen className="mr-2" size={16} />
                    Canvas
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button onClick={handleCreateFile} className="w-full bg-app-primary hover:bg-app-primary/90">
                Create
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-1">
          {sortedFiles.map((file) => (
            <div
              key={file.id}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 cursor-pointer group",
                activeFile?.id === file.id 
                  ? "bg-app-primary text-white" 
                  : "hover:bg-gray-100"
              )}
              onClick={() => handleFileClick(file)}
            >
              <div className="flex items-center overflow-hidden">
                {file.type === "note" ? (
                  <FileText size={16} className="flex-shrink-0 mr-2" />
                ) : (
                  <Pen size={16} className="flex-shrink-0 mr-2" />
                )}
                <span className="truncate">{file.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6 opacity-0 group-hover:opacity-100",
                  activeFile?.id === file.id ? "text-white hover:text-white/80" : ""
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFile(file.id);
                }}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
