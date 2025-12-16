import React from 'react';

interface PanelProps {
  title: string;
  info?: string;
  children: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({ title, info, children, className = "" }) => {
  return (
    <div className={`bg-[#1e0a1a] rounded border border-gray-700 flex flex-col ${className} overflow-hidden shadow-sm`}>
      <div className="bg-gray-800 text-gray-300 px-3 py-1.5 text-xs border-b border-gray-700 flex justify-between items-center select-none font-medium">
        <span>{title}</span>
        {info && <span className="text-gray-500 font-normal">{info}</span>}
      </div>
      <div className="p-3 overflow-auto text-xs font-mono flex-1 custom-scrollbar">
        {children}
      </div>
    </div>
  );
};