import React from 'react';

export function TabsList({ children, className = '', style = {}, ...props }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px',
        backgroundColor: 'var(--bg-sunken)',
        boxShadow: 'var(--shadow-sunken-sm)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        gap: '4px',
        ...style,
      }}
      className={`neu-tabs-list ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  active = false,
  onClick,
  children,
  icon: Icon,
  badge,
  className = '',
  style = {},
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.45rem 0.9rem',
        fontSize: '0.8rem',
        fontWeight: active ? 700 : 500,
        color: active ? 'var(--text-primary)' : 'var(--text-muted)',
        backgroundColor: active ? 'var(--bg-card-raised)' : 'transparent',
        boxShadow: active ? 'var(--shadow-raised-sm)' : 'none',
        borderRadius: 'var(--radius-sm)',
        border: active ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        userSelect: 'none',
        outline: 'none',
        ...style,
      }}
      className={`neu-tabs-trigger ${active ? 'active' : ''} ${className}`}
      {...props}
    >
      {Icon && <Icon size={15} style={{ color: active ? 'var(--primary)' : 'inherit' }} />}
      <span>{children}</span>
      {badge !== undefined && (
        <span
          style={{
            marginLeft: '0.2rem',
            padding: '1px 6px',
            fontSize: '0.68rem',
            fontWeight: 800,
            borderRadius: 'var(--radius-full)',
            backgroundColor: active ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.06)',
            color: active ? '#60a5fa' : 'var(--text-muted)',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
