
import React, { useState, useEffect } from "react";
import { useFileSystem } from "../contexts/FileSystemContext";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, Heading1, Heading2 } from "lucide-react";

const NoteEditor: React.FC = () => {
  const { activeFile, updateFile } = useFileSystem();
  const [content, setContent] = useState("");
  
  useEffect(() => {
    if (activeFile && activeFile.type === "note") {
      setContent(activeFile.content);
    }
  }, [activeFile]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (activeFile) {
      updateFile(activeFile.id, newContent);
    }
  };

  const insertMarkdown = (markdownPrefix: string, markdownSuffix: string = "") => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newContent = 
      content.substring(0, start) +
      markdownPrefix +
      selectedText +
      markdownSuffix +
      content.substring(end);
    
    setContent(newContent);
    if (activeFile) {
      updateFile(activeFile.id, newContent);
    }
    
    // Setting focus and selection after React updates the DOM
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + markdownPrefix.length,
        end + markdownPrefix.length
      );
    }, 0);
  };

  if (!activeFile || activeFile.type !== "note") {
    return <div>No note selected</div>;
  }

  const formatButtons = [
    { icon: <Bold size={16} />, action: () => insertMarkdown("**", "**"), tooltip: "Bold" },
    { icon: <Italic size={16} />, action: () => insertMarkdown("*", "*"), tooltip: "Italic" },
    { icon: <Heading1 size={16} />, action: () => insertMarkdown("# "), tooltip: "Heading 1" },
    { icon: <Heading2 size={16} />, action: () => insertMarkdown("## "), tooltip: "Heading 2" },
    { icon: <List size={16} />, action: () => insertMarkdown("- "), tooltip: "List" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="bg-app-paper rounded-t-lg border p-2 flex gap-1">
        {formatButtons.map((button, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={button.action}
            title={button.tooltip}
            className="h-8 w-8"
          >
            {button.icon}
          </Button>
        ))}
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-hidden border-x border-b rounded-b-lg bg-app-paper">
          <Textarea
            value={content}
            onChange={handleChange}
            className="h-full w-full resize-none border-0 font-mono text-sm focus-visible:ring-0"
            placeholder="Write your note here... (Markdown supported)"
          />
        </div>
        
        <div className="flex-1 overflow-auto border-r border-b rounded-br-lg bg-app-paper p-6">
          <div
            className={cn("prose max-w-full note-content", {
              "h-full flex items-center justify-center text-gray-400": !content.trim(),
            })}
          >
            {content.trim() ? (
              renderMarkdown(content)
            ) : (
              <p>Preview will appear here</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple markdown renderer - In a real app would use a library like react-markdown
const renderMarkdown = (markdown: string) => {
  // Basic processing for headings, bold, italic, and lists
  let html = markdown
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<ul><li>$1</li></ul>')
    .replace(/<\/ul><ul>/g, '');  // Combine adjacent ul elements

  // Split by newlines and wrap non-heading/list paragraphs
  const lines = html.split('\n');
  html = lines.map(line => {
    if (line.trim() === '') return '';
    if (line.startsWith('<h1>') || line.startsWith('<h2>') || line.startsWith('<ul>')) {
      return line;
    }
    return `<p>${line}</p>`;
  }).join('');
  
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default NoteEditor;
