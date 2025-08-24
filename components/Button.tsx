import React from "react";

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, onClick, ...props }) => {
  return (
    <button
      className={`text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-3 rounded-2xl disabled:opacity-50 h-fit font-bold transition-all duration-300 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 hover:from-gray-700 hover:via-gray-800 hover:to-gray-900 text-white border-2 border-gray-500/50 hover:border-gray-400/50 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-rotate-1 ${className}`}
      onClick={props.disabled ? undefined : onClick}
      {...props}
    >
      {children}
    </button>
  );
};
