'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import MessageBubble from '@/app/components/ai-chat/MessageBubble';

export default function MessageList({ messages }) {
  const chatEndRef = useRef(null);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!initialLoadDone.current) {
      chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
      initialLoadDone.current = true;
    } else {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-h-0">
      <div className="max-w-[760px] mx-auto space-y-6">
        <AnimatePresence>
          {messages.map((msg) => (
            <MessageBubble key={msg.id ?? `${msg.sender}-${msg.created_at}`} message={msg} />
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}
