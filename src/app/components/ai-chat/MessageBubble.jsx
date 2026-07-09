'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';

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

// Copies rich HTML (so bold/headings/bullets survive pasting into Docs, Slack,
// Gmail, etc.) alongside a plain-text fallback for markdown-only targets.
async function copyRichText(text, html) {
  try {
    if (html && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([text], { type: 'text/plain' }),
          'text/html': new Blob([html], { type: 'text/html' }),
        }),
      ]);
      return true;
    }
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
}

function CopyButton({ getPayload, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    const { text, html } = getPayload();
    if (!text) return;
    const ok = await copyRichText(text, html);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error('Failed to copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition ${className}`}
      title="Copy"
    >
      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
    </button>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.sender === 'user';
  const contentRef = useRef(null);

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="group flex items-start gap-3 justify-end"
      >
        <div className="flex flex-col items-end gap-1 max-w-[85%] sm:max-w-lg">
          <div className="px-3 sm:px-4 py-2 rounded-2xl shadow-sm leading-relaxed bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white">
            {message.text}
          </div>
          <CopyButton
            getPayload={() => ({ text: message.text })}
            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 pr-1"
          />
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
      className="group w-full"
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
        <>
          <div
            ref={contentRef}
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
          <CopyButton
            getPayload={() => ({ text: message.text, html: contentRef.current?.innerHTML })}
            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 mt-1"
          />
        </>
      )}
    </motion.div>
  );
}
