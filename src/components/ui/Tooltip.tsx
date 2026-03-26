import React from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
}) => {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-gray-800 dark:border-t-gray-600 border-l-transparent border-r-transparent border-b-transparent",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 dark:border-b-gray-600 border-l-transparent border-r-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-gray-800 dark:border-l-gray-600 border-t-transparent border-b-transparent border-r-transparent",
    right:
      "right-full top-1/2 -translate-y-1/2 border-r-gray-800 dark:border-r-gray-600 border-t-transparent border-b-transparent border-l-transparent",
  };

  return (
    <div className="relative group inline-flex items-center">
      {children}
      <div
        className={`absolute hidden group-hover:block ${positionClasses[position]}
          px-3 py-2 text-xs text-white bg-gray-800 dark:bg-gray-600
          rounded-lg w-64 max-w-xs whitespace-normal leading-relaxed
          shadow-xl pointer-events-none`}
        style={{ zIndex: 9999 }}
      >
        {content}
        <div className={`absolute border-4 ${arrowClasses[position]}`} />
      </div>
    </div>
  );
};
