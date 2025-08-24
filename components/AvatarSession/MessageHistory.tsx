import React, { useEffect, useRef } from "react";

import { useMessageHistory, MessageSender } from "../logic";

export const MessageHistory: React.FC = () => {
  const { messages } = useMessageHistory();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || messages.length === 0) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-y-auto flex flex-col gap-2 px-2 sm:px-4 py-2 text-white max-h-full"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[80%] ${
            message.sender === MessageSender.CLIENT
              ? "self-end items-end"
              : "self-start items-start"
          }`}
        >
          <p className="text-xs text-zinc-400">
            {message.sender === MessageSender.AVATAR ? "Avatar" : "You"}
          </p>
          <div className={`text-xs sm:text-sm p-2 sm:p-3 rounded-lg ${
            message.sender === MessageSender.CLIENT
              ? "bg-blue-600 text-white"
              : "bg-zinc-700 text-zinc-100"
          }`}>
            {message.content}
          </div>
        </div>
      ))}
    </div>
  );
};
