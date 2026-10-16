import React from 'react';

export function Badge({
  children,
  variant = 'default', // 'default' | 'secondary' | 'success' | 'destructive' | 'warning' | 'info' | 'sunken' | 'outline'
  size = 'md', // 'sm' | 'md'
  icon: Icon,
  className = '',
  style = {},
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.14)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.28)',
          boxShadow: 'var(--shadow-raised-xs)',
        };
      case 'destructive':
        return {
          backgroundColor: 'rgba(244, 63, 94, 0.14)',
          color: '#fda4af',
          border: '1px solid rgba(244, 63, 94, 0.28)',
          boxShadow: 'var(--shadow-raised-xs)',
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.14)',
          color: '#fcd34d',
          border: '1px solid rgba(245, 158, 11, 0.28)',
          boxShadow: 'var(--shadow-raised-xs)',
        };
      case 'info':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.14)',
          color: '#60a5fa',
          border: '1px solid rgba(59, 130, 246, 0.28)',
          boxShadow: 'var(--shadow-raised-xs)',
        };
      case 'sunken':
        return {
          backgroundColor: 'var(--bg-sunken)',
          color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-sunken-sm)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--bg-card-raised)',
          color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-raised-xs)',
          border: 'var(--border-subtle)',
        };
      case 'default':
      default:
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          color: '#93c5fd',
          border: '1px solid rgba(59, 130, 246, 0.35)',
          boxShadow: 'var(--shadow-raised-xs)',
        };
    }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: size === 'sm' ? '1px 6px' : '3px 9px',
        fontSize: size === 'sm' ? '0.68rem' : '0.74rem',
        fontWeight: 700,
        borderRadius: 'var(--radius-full)',
        letterSpacing: '0.015em',
        lineHeight: 1.2,
        ...getVariantStyles(),
        ...style,
      }}
      className={`neu-badge ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 10 : 12} />}
      {children}
    </span>
  );
}
