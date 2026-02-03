import { Bell, Settings, MoreVertical, Inbox } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  type: "system" | "user" | "task" | "alert";
  sender: string;
  preview: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
}

interface InboxDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
  onUnreadCountChange?: (count: number) => void;
}

const mockMessages: Message[] = [
  {
    id: "1",
    type: "system",
    sender: "Système Oryem",
    preview: "Votre avis de valeur pour 'Bureaux Quartier Affaires' est prêt à être téléchargé",
    timestamp: "Il y a 2h",
    read: false,
  },
  {
    id: "2",
    type: "user",
    sender: "Marie Dupont",
    preview: "Marie Dupont a commenté votre projet 'Local Commercial Centre-Ville'",
    timestamp: "Il y a 5h",
    read: false,
  },
  {
    id: "3",
    type: "task",
    sender: "Tâche automatisée",
    preview: "Analyse SWOT terminée pour le projet 'Entrepôt Logistique'",
    timestamp: "Hier",
    read: false,
  },
  {
    id: "4",
    type: "alert",
    sender: "Alerte système",
    preview: "Document manquant pour finaliser l'évaluation du 'Terrain Constructible'",
    timestamp: "Hier",
    read: true,
  },
  {
    id: "5",
    type: "system",
    sender: "Système Oryem",
    preview: "Mise à jour de sécurité disponible. Veuillez actualiser l'application",
    timestamp: "15/01/2026",
    read: true,
  },
];

const messageIcons = {
  system: "🤖",
  user: "👤",
  task: "✅",
  alert: "⚠️",
};

export function InboxDropdown({ isOpen, onClose, unreadCount, onUnreadCountChange }: InboxDropdownProps) {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update unread count when messages change
  useEffect(() => {
    const count = messages.filter(m => !m.read).length;
    onUnreadCountChange?.(count);
  }, [messages, onUnreadCountChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Also check if click is on the parent button (bell icon)
        const target = event.target as HTMLElement;
        if (!target.closest('button[aria-label="inbox"]')) {
          onClose();
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayedMessages = activeTab === "unread" 
    ? messages.filter(m => !m.read) 
    : messages;

  const markAllAsRead = () => {
    setMessages(messages.map(m => ({ ...m, read: true })));
  };

  const toggleRead = (id: string) => {
    setMessages(messages.map(m => 
      m.id === id ? { ...m, read: !m.read } : m
    ));
  };

  const handleMessageClick = (message: Message) => {
    // Mark as read when clicked
    if (!message.read) {
      toggleRead(message.id);
    }
    // Here you would navigate to message detail or expand inline
    console.log("Message clicked:", message);
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-[400px] bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-[1000] animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">Boîte de réception</h3>
          <button className="p-1 hover:bg-gray-100 rounded transition-colors">
            <Settings className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-2 text-sm font-medium transition-colors relative ${
              activeTab === "all"
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Tout
            {activeTab === "all" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`pb-2 text-sm font-medium transition-colors relative flex items-center gap-1 ${
              activeTab === "unread"
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Non lus
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
            {activeTab === "unread" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {displayedMessages.length === 0 ? (
          // Empty state
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Inbox className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 mb-1">Aucun message</p>
            <p className="text-sm text-gray-500">Vous êtes à jour !</p>
          </div>
        ) : (
          displayedMessages.map((message) => (
            <div
              key={message.id}
              onClick={() => handleMessageClick(message)}
              className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0 group"
            >
              {/* Avatar/Icon */}
              <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                {messageIcons[message.type]}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm mb-1 ${!message.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                  {message.sender}
                </p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {message.preview}
                </p>
                <p className="text-xs text-gray-500 mt-1">{message.timestamp}</p>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!message.read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRead(message.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                  title={message.read ? "Marquer comme non lu" : "Marquer comme lu"}
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {displayedMessages.length > 0 && (
        <div className="p-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <button 
            onClick={markAllAsRead}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Tout marquer comme lu
          </button>
          <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium">
            Voir tous les messages
          </button>
        </div>
      )}
    </div>
  );
}