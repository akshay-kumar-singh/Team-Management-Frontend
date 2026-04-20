export const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  error,
  variant = "glass",
}) => {
  const isGlass = variant === "glass";
  
  const labelClass = isGlass 
    ? "block text-sm font-medium text-white mb-2" 
    : "block text-sm font-medium text-gray-700 mb-2";

  const inputClass = isGlass
    ? "w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm transition-all"
    : "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all";

  const errorClass = isGlass ? "text-pink-300" : "text-red-500";
  return (
    <div className="mb-4">
      {label && (
        <label className={labelClass}>
          {label} {required && <span className={errorClass}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />
      {error && <p className={`${errorClass} text-sm mt-1`}>{error}</p>}
    </div>
  );
};
