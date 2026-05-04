import React from 'react';
import './Input.css';

export default function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  label,
  maxLength,
  ...props
}) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        maxLength={maxLength}
        className={`form-input ${error ? 'error' : ''}`}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
