
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFileSystem } from "../contexts/FileSystemContext";
import { toast } from "sonner";
import { Send } from "lucide-react";

type AIProvider = "openai" | "gemini" | "mistral";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIAssistant: React.FC = () => {
  const { activeFile, updateFile } = useFileSystem();
  const [provider, setProvider] = useState<AIProvider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your AI assistant. How can I help you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendPrompt = async () => {
    if (!prompt.trim() || !apiKey.trim()) {
      toast.error("Please enter a prompt and API key");
      return;
    }

    const newMessage: Message = { role: "user", content: prompt };
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      let response;
      
      // In a real implementation, these would make actual API calls
      if (provider === "openai") {
        response = await mockOpenAIResponse(prompt);
      } else if (provider === "gemini") {
        response = await mockGeminiResponse(prompt);
      } else {
        response = await mockMistralResponse(prompt);
      }
      
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      toast.error("Failed to get AI response");
      console.error("AI response error:", error);
    } finally {
      setIsLoading(false);
      setPrompt("");
    }
  };

  // Mock API responses - in real implementation these would call actual APIs
  const mockOpenAIResponse = async (prompt: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return `This is a simulated OpenAI response to: "${prompt}"\n\nIn a real implementation, this would connect to the OpenAI API using your API key.`;
  };

  const mockGeminiResponse = async (prompt: string) => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    return `This is a simulated Google Gemini response to: "${prompt}"\n\nIn a real implementation, this would connect to the Gemini API using your API key.`;
  };

  const mockMistralResponse = async (prompt: string) => {
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network delay
    return `This is a simulated Mistral AI response to: "${prompt}"\n\nIn a real implementation, this would connect to the Mistral API using your API key.`;
  };

  const insertTextToActiveFile = (text: string) => {
    if (!activeFile || activeFile.type !== "note") {
      toast.error("Can only insert text into notes");
      return;
    }
    
    const updatedContent = activeFile.content + "\n\n" + text;
    updateFile(activeFile.id, updatedContent);
    toast.success("Text inserted into note");
  };

  return (
    <div className="h-full flex flex-col p-4">
      <h3 className="font-semibold mb-4">AI Assistant</h3>
      
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="mb-4">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto mb-4 border rounded p-2 bg-white">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-3 p-2 rounded-lg ${
                  message.role === "assistant"
                    ? "bg-gray-100 mr-6"
                    : "bg-app-primary text-white ml-6"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.role === "assistant" && message.content.length > 10 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertTextToActiveFile(message.content)}
                    className="mt-1 text-xs"
                  >
                    Insert into note
                  </Button>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-100 p-2 rounded-lg mb-3 mr-6">
                <div className="flex space-x-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask the AI assistant..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendPrompt();
                }
              }}
            />
            <Button onClick={sendPrompt} disabled={isLoading}>
              <Send size={16} />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select AI Provider</label>
            <Select value={provider} onValueChange={(value) => setProvider(value as AIProvider)}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="mistral">Mistral AI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">API Key</label>
            <Input
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>
          
          <Button 
            onClick={() => toast.success("Settings saved")} 
            className="w-full bg-app-primary hover:bg-app-primary/90"
          >
            Save Settings
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistant;
