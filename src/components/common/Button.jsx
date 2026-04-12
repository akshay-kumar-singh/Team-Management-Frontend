export const Button = ({
  children,
  variant = "primary",
  type = "button",
  onClick,
  disabled,
  className = "",
}) => {
  const baseStyles =
    "inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 text-sm";

  const variants = {
    primary:
      "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl",
    secondary:
      "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200",
    danger:
      "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-lg",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    outline:
      "bg-transparent border-2 border-purple-500 text-purple-600 hover:bg-purple-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
};
