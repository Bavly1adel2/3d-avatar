import React from "react";

interface InputProps {
  value: string | undefined | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  id?: string;
  type?: string;
  disabled?: boolean;
}

export const Input = (props: InputProps) => {
  return (
    <input
      className={`w-full text-white text-xs sm:text-sm bg-gray-800/80 py-3 px-4 sm:px-6 rounded-2xl outline-none border-2 border-gray-600/50 focus:border-gray-400 focus:ring-2 focus:ring-gray-400/30 transition-all duration-300 placeholder-gray-400/60 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 ${props.className}`}
      placeholder={props.placeholder}
      type={props.type || "text"}
      value={props.value || ""}
      onChange={(e) => props.onChange(e.target.value)}
      onKeyPress={props.onKeyPress}
      id={props.id}
      disabled={props.disabled}
    />
  );
};
