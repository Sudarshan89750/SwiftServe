import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { Message } from '../../context/SocketContext';

interface ChatInterfaceProps {
  recipientId: string;
  recipientName: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ recipientId, recipientName }) => {
  const { messages, sendMessage } = useSocket();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for this conversation
  const conversationMessages = messages.filter(
    msg => (msg.from === recipientId && msg.to === user?.id) || 
           (msg.from === user?.id && msg.to === recipientId)
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      sendMessage(recipientId, newMessage);
      setNewMessage('');
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* Chat header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-800">{recipientName}</h3>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto">
        {conversationMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          conversationMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`mb-3 ${msg.from === user?.id ? 'text-right' : 'text-left'}`}
            >
              <div 
                className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                  msg.from === user?.id 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {formatTime(msg.timestamp)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="p-3 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};