import { Bot, Send } from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  text: string;
  sender: "ai" | "user";
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider avec votre évaluation ?",
      sender: "ai",
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
    };

    setMessages([...messages, newMessage]);
    setInputValue("");

    // Simuler une réponse de l'IA
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Je traite votre demande. En quoi puis-je vous assister davantage ?",
        sender: "ai",
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div
      className="fixed h-screen flex flex-col bg-white border-l border-gray-200 min-h-[500px]
  max-h-[1000px]"
    >
      {/* En-tête */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-blue-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-base text-gray-900">
              Assistant IA
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>En ligne</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zone de conversation */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                  max-w-[85%] px-4 py-3 rounded-2xl text-sm
                  ${
                    message.sender === "ai"
                      ? "bg-gray-100 text-gray-900 rounded-tl-sm"
                      : "bg-blue-600 text-white rounded-tr-sm"
                  }
                `}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Champ de saisie */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Posez votre question à l'assistant IA..."
            className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            onClick={handleSend}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}