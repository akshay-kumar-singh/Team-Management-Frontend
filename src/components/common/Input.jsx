export const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  error,
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label} {required && <span className="text-pink-300">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm transition-all"
      />
      {error && <p className="text-pink-300 text-sm mt-1">{error}</p>}
    </div>
  );
};
