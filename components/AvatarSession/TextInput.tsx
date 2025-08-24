import React from "react";
import { StartAvatarRequest } from "@heygen/streaming-avatar";

import { useConversationState } from "../logic/useConversationState";
import { useTextChat } from "../logic/useTextChat";
import { Button } from "../Button";
import { Input } from "../Input";
import { Select } from "../Select";
import { useStreamingAvatarContext } from "../logic/context";

interface TextInputProps {
  config: StartAvatarRequest;
}

export const TextInput: React.FC<TextInputProps> = ({ config }) => {
  const { sendMessage } = useTextChat();
  const { isAvatarListening } = useConversationState();
  const { isListening } = useStreamingAvatarContext();
  const [message, setMessage] = React.useState("");
  const [taskType, setTaskType] = React.useState("chat");
  const [mode, setMode] = React.useState("conversation");

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      {/* Language Support Notice */}
      {config?.language === "ar" && (
        <div className="w-full p-2 bg-blue-900/20 border border-blue-500/50 rounded-lg mb-2">
          <p className="text-blue-300 text-xs text-center">
            🇸🇦 <strong>Arabic Language Active:</strong> You can type in Arabic (العربية) and the avatar will understand and respond in Arabic
          </p>
        </div>
      )}
      
      {/* Select Components Grouped */}
      <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
        <Select
          isSelected={(option) => option.value === taskType}
          options={[
            { label: "💬 Chat", value: "chat" },
            { label: "📝 Task", value: "task" },
            { label: "❓ Question", value: "question" },
          ]}
          renderOption={(option) => option.label}
          value={taskType}
          onSelect={(option) => setTaskType(option.value)}
        />
        <Select
          isSelected={(option) => option.value === mode}
          options={[
            { label: "🗣️ Conversation", value: "conversation" },
            { label: "📚 Learning", value: "learning" },
            { label: "💼 Professional", value: "professional" },
          ]}
          renderOption={(option) => option.label}
          value={mode}
          onSelect={(option) => setMode(option.value)}
        />
      </div>
      
      {/* Input and Button Grouped */}
      <div className="flex flex-1 min-w-0 gap-2">
        <Input
          placeholder={
            config?.language === "ar" 
              ? "اكتب رسالتك هنا... (Type your message here...)" 
              : "Type your message here..."
          }
          value={message}
          onChange={setMessage}
          onKeyPress={handleKeyPress}
          className="flex-1 min-w-0"
        />
        <Button
          className="flex-shrink-0"
          onClick={handleSend}
          disabled={!message.trim()}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </Button>
      </div>
    </div>
  );
};
