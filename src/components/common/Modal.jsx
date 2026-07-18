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
        className="absolute inset-0 bg-black/55"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-lg z-10 border border-line flex flex-col max-h-[90vh] animate-scaleIn">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-line flex-shrink-0">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="text-ink-subtle hover:text-ink p-1.5 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
