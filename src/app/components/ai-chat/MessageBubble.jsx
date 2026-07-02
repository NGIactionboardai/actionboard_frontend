'use client';

import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function TypingIndicator() {
  return (
    <div className="flex gap-1 py-1">
      <motion.span
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="w-2 h-2 bg-gray-400 rounded-full"
      />
      <motion.span
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 0.8, delay: 0.2, repeat: Infinity }}
        className="w-2 h-2 bg-gray-400 rounded-full"
      />
      <motion.span
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 0.8, delay: 0.4, repeat: Infinity }}
        className="w-2 h-2 bg-gray-400 rounded-full"
      />
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-start gap-3 justify-end"
      >
        <div className="max-w-[85%] sm:max-w-lg px-3 sm:px-4 py-2 rounded-2xl shadow-sm leading-relaxed bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white">
          {message.text}
        </div>
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-300 rounded-full flex items-center justify-center shrink-0">
          <User size={16} className="text-gray-700" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] rounded-full flex items-center justify-center text-white shrink-0">
          <Bot size={14} />
        </div>
        <span className="text-sm font-medium text-gray-700">AI Assistant</span>
      </div>

      {message.typing ? (
        <TypingIndicator />
      ) : (
        <div
          className="prose prose-base sm:prose-lg max-w-none break-words text-gray-800
            prose-headings:font-semibold prose-headings:text-gray-900
            prose-h2:mt-6 prose-h2:mb-2 prose-h2:pb-1 prose-h2:border-b prose-h2:border-gray-100 prose-h2:text-lg sm:prose-h2:text-xl
            prose-h3:mt-4 prose-h3:mb-1.5 prose-h3:text-base sm:prose-h3:text-lg
            prose-p:my-2.5 prose-p:leading-relaxed
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-ul:my-2.5 prose-ol:my-2.5 prose-li:my-1 prose-li:leading-relaxed
            prose-hr:my-4"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
        </div>
      )}
    </motion.div>
  );
}
