import { MessageSquare, Send, Smile } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../../types/game';
import { COLOR_THEMES } from './boardCoords';

interface GameChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUserId?: string;
  currentUserName?: string;
}

const QUICK_EMOTES = ['👑', '🔥', '🎲', '😂', '😈', '😱', '👏', '💥'];

export const GameChat: React.FC<GameChatProps> = ({
  messages,
  onSendMessage,
  currentUserId,
  currentUserName = 'You',
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmotes, setShowEmotes] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    setShowEmotes(false);
  };

  const handleEmoteClick = (emote: string) => {
    onSendMessage(emote);
    setShowEmotes(false);
  };

  return (
    <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl h-[320px]">
      {/* Chat Header */}
      <div className="p-3.5 px-4 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
          Live Chat
        </span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-6">
            <Smile className="w-6 h-6 mb-1 text-slate-600" />
            <p className="text-[11px]">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderName === currentUserName || (currentUserId && msg.senderId === currentUserId);
            const theme = msg.senderColor ? COLOR_THEMES[msg.senderColor] : null;

            return (
              <div key={msg.id} className={`space-y-1 ${isMe ? 'text-right' : 'text-left'}`}>
                <p
                  className={`text-[10px] font-bold ${
                    isMe ? 'text-indigo-400' : theme ? theme.text : 'text-slate-400'
                  }`}
                >
                  {isMe ? 'You' : msg.senderName}
                </p>
                <div
                  className={`p-2.5 rounded-xl text-xs max-w-[90%] break-words inline-block text-left ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-950/40'
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Emotes Bar */}
      {showEmotes && (
        <div className="p-2 bg-slate-850 border-t border-slate-800 grid grid-cols-8 gap-1 animate-fadeIn">
          {QUICK_EMOTES.map((emote) => (
            <button
              key={emote}
              type="button"
              onClick={() => handleEmoteClick(emote)}
              className="text-base hover:scale-125 transition-transform p-1 rounded hover:bg-slate-800 flex items-center justify-center cursor-pointer"
            >
              {emote}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => setShowEmotes(!showEmotes)}
          className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Smile className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          maxLength={80}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-900/30 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
