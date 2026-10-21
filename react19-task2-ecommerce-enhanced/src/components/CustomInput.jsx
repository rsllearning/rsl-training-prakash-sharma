// In React 19, `ref` is passed directly as a prop to function components!
// `forwardRef()` is no longer needed.
export default function CustomInput({ label, ref, helperText, icon, ...props }) {
  return (
    <div className="custom-input-wrapper">
      {label && <label className="custom-input-label">{label}</label>}
      <div className="input-with-icon">
        {icon && <span className="input-icon-prefix">{icon}</span>}
        <input
          ref={ref}
          className="custom-input-field"
          {...props}
        />
      </div>
      {helperText && <span className="custom-input-helper">{helperText}</span>}
    </div>
  );
}
