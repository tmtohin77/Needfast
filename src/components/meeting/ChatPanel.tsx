import React, { useState, useRef, useEffect } from 'react';
import { useMeeting } from '@/contexts/MeetingContext';
import { XIcon, SendIcon, PaperclipIcon, SmileIcon } from '@/components/icons/Icons';

const EMOJI_LIST = ['😀', '😂', '😍', '🤔', '👍', '👎', '🎉', '🔥', '💯', '❤️', '👏', '🙌', '😊', '😎', '🤝', '✨'];

const ChatPanel: React.FC = () => {
  const { messages, sendMessage, toggleChat, currentUser } = useMeeting();
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() && !selectedFile) return;

    await sendMessage(message.trim(), selectedFile || undefined);
    setMessage('');
    setSelectedFile(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      setSelectedFile(file);
    } else {
      alert('File size must be less than 10MB');
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // সেফটি চেক: type null হতে পারে
  const isImageFile = (type: string | null | undefined) => type?.startsWith('image/');

  return (
    <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col animate-slide-in border-l border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat</h2>
        <button
          onClick={toggleChat}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <XIcon size={20} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {(!messages || messages.length === 0) ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8 flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <SendIcon size={24} className="text-gray-400" />
            </div>
            <p className="font-medium">No messages yet</p>
            <p className="text-sm mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.user_id === currentUser?.id;
            // --- FIX: চ্যাটেও নামের সেফটি চেক ---
            const senderName = msg.sender_name || 'Guest';

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                    isOwn
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-1">
                      {senderName}
                    </p>
                  )}
                  {msg.message && <p className="text-sm break-words leading-relaxed">{msg.message}</p>}
                  {msg.file_url && (
                    <div className="mt-2">
                      {isImageFile(msg.file_type) ? (
                        <img
                          src={msg.file_url}
                          alt={msg.file_name || 'Image'}
                          className="max-w-full rounded-lg cursor-pointer hover:opacity-90 border border-white/10"
                          onClick={() => window.open(msg.file_url || '', '_blank')}
                        />
                      ) : (
                        <a
                          href={msg.file_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 p-2 rounded-lg ${
                            isOwn ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <PaperclipIcon size={16} />
                          <span className="text-sm truncate max-w-[150px]">{msg.file_name}</span>
                        </a>
                      )}
                    </div>
                  )}
                  <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex flex-wrap gap-2">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setMessage((prev) => prev + emoji);
                  setShowEmoji(false);
                }}
                className="text-xl hover:scale-125 transition-transform p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected file preview */}
      {selectedFile && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/20">
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-2 border border-indigo-100 dark:border-indigo-800">
            <div className="flex items-center gap-2 truncate">
              <PaperclipIcon size={16} className="text-indigo-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {selectedFile.name}
              </span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            >
              <XIcon size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
          >
            <SmileIcon size={20} />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
          >
            <PaperclipIcon size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() && !selectedFile}
            className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full transition-colors text-white shadow-md"
          >
            <SendIcon size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;