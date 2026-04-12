import { X } from "lucide-react";
import { useEffect } from "react";

export const Modal = ({ isOpen, onClose, title, children }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg z-10 border border-gray-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-6 pt-4">
          {children}
        </div>
      </div>
    </div>
  );
};
