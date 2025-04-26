
import React, { createContext, useState, useContext } from "react";
import { toast } from "sonner";

export interface File {
  id: string;
  name: string;
  content: string;
  type: "note" | "canvas";
  lastModified: Date;
}

interface FileSystemContextType {
  files: File[];
  activeFile: File | null;
  createFile: (name: string, type: "note" | "canvas") => void;
  deleteFile: (id: string) => void;
  updateFile: (id: string, content: string) => void;
  setActiveFile: (id: string | null) => void;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error("useFileSystem must be used within a FileSystemProvider");
  }
  return context;
};

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<File[]>([
    {
      id: "welcome-note",
      name: "Welcome to ScribeCanvas",
      content: "# Welcome to ScribeCanvas\n\nCreate notes, drawings, and get AI assistance all in one place.\n\n## Getting Started\n\n- Use the sidebar to create new files\n- Switch between Note and Canvas modes\n- Ask the AI assistant for help",
      type: "note",
      lastModified: new Date()
    }
  ]);
  const [activeFile, setActiveFileState] = useState<File | null>(files[0]);

  const createFile = (name: string, type: "note" | "canvas") => {
    const newFile: File = {
      id: `file-${Date.now()}`,
      name,
      content: type === "note" ? "# New Note" : "",
      type,
      lastModified: new Date()
    };
    
    setFiles([...files, newFile]);
    setActiveFileState(newFile);
    toast.success(`Created new ${type}`);
  };

  const deleteFile = (id: string) => {
    const fileToDelete = files.find(file => file.id === id);
    if (!fileToDelete) return;
    
    setFiles(files.filter(file => file.id !== id));
    
    if (activeFile?.id === id) {
      setActiveFileState(files.length > 1 ? files.filter(file => file.id !== id)[0] : null);
    }
    
    toast.success(`Deleted ${fileToDelete.name}`);
  };

  const updateFile = (id: string, content: string) => {
    setFiles(files.map(file => 
      file.id === id 
        ? { ...file, content, lastModified: new Date() } 
        : file
    ));
  };

  const setActiveFile = (id: string | null) => {
    if (id === null) {
      setActiveFileState(null);
      return;
    }
    
    const file = files.find(file => file.id === id);
    if (file) {
      setActiveFileState(file);
    }
  };

  return (
    <FileSystemContext.Provider
      value={{
        files,
        activeFile,
        createFile,
        deleteFile,
        updateFile,
        setActiveFile
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
};
