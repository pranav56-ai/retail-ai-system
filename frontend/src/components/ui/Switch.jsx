import React from 'react';

export function Switch({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
  style = {},
}) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      className={`neu-switch ${className}`}
    >
      {(label || description) && (
        <div>
          {label && <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>}
          {description && <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{description}</div>}
        </div>
      )}

      <div
        onClick={() => !disabled && onChange && onChange(!checked)}
        style={{
          width: '44px',
          height: '24px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: checked ? 'rgba(59, 130, 246, 0.25)' : 'var(--bg-sunken)',
          boxShadow: checked ? 'var(--shadow-sunken-sm), 0 0 12px rgba(59, 130, 246, 0.3)' : 'var(--shadow-sunken-sm)',
          border: checked ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
          padding: '2px',
          position: 'relative',
          transition: 'all var(--transition-fast)',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: checked ? '#3b82f6' : 'var(--bg-card-raised)',
            boxShadow: checked ? '0 0 8px #3b82f6, var(--shadow-raised-xs)' : 'var(--shadow-raised-xs)',
            transform: checked ? 'translateX(20px)' : 'translateX(0px)',
            transition: 'transform var(--transition-fast), background-color var(--transition-fast)',
          }}
        />
      </div>
    </label>
  );
}
