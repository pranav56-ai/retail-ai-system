import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'secondary', // 'primary' | 'emerald' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'sunken'
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'icon'
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  style = {},
  onClick,
  type = 'button',
  ...props
}) {
  const [isPressed, setIsPressed] = React.useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          boxShadow: isPressed 
            ? 'inset 3px 3px 6px #1d4ed8, inset -2px -2px 5px #60a5fa' 
            : 'var(--shadow-glow-blue)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          fontWeight: 700,
        };
      case 'emerald':
        return {
          backgroundColor: '#10b981',
          color: '#ffffff',
          boxShadow: isPressed
            ? 'inset 3px 3px 6px #047857, inset -2px -2px 5px #34d399'
            : 'var(--shadow-glow-emerald)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          fontWeight: 700,
        };
      case 'destructive':
        return {
          backgroundColor: 'rgba(244, 63, 94, 0.15)',
          color: '#fda4af',
          boxShadow: isPressed ? 'var(--shadow-sunken-sm)' : 'var(--shadow-raised-sm)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          fontWeight: 600,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          boxShadow: isPressed ? 'var(--shadow-sunken-sm)' : 'var(--shadow-raised-xs)',
          border: 'var(--border-light)',
          fontWeight: 600,
        };
      case 'ghost':
        return {
          backgroundColor: isPressed ? 'var(--bg-sunken)' : 'transparent',
          color: 'var(--text-secondary)',
          boxShadow: isPressed ? 'var(--shadow-sunken-sm)' : 'none',
          border: '1px solid transparent',
          fontWeight: 500,
        };
      case 'sunken':
        return {
          backgroundColor: 'var(--bg-sunken)',
          color: 'var(--primary)',
          boxShadow: 'var(--shadow-sunken)',
          border: 'var(--border-subtle)',
          fontWeight: 600,
        };
      case 'secondary':
      default:
        return {
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          boxShadow: isPressed ? 'var(--shadow-sunken-sm)' : 'var(--shadow-raised-sm)',
          border: 'var(--border-subtle)',
          fontWeight: 600,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return {
          padding: '0.3rem 0.55rem',
          fontSize: '0.72rem',
          borderRadius: 'var(--radius-xs)',
          gap: '0.3rem',
        };
      case 'sm':
        return {
          padding: '0.45rem 0.8rem',
          fontSize: '0.78rem',
          borderRadius: 'var(--radius-sm)',
          gap: '0.4rem',
        };
      case 'lg':
        return {
          padding: '0.75rem 1.4rem',
          fontSize: '0.92rem',
          borderRadius: 'var(--radius-md)',
          gap: '0.55rem',
        };
      case 'icon':
        return {
          padding: '0.55rem',
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-sm)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        };
      case 'md':
      default:
        return {
          padding: '0.55rem 1rem',
          fontSize: '0.84rem',
          borderRadius: 'var(--radius-sm)',
          gap: '0.45rem',
        };
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'all var(--transition-fast)',
        userSelect: 'none',
        outline: 'none',
        position: 'relative',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      className={`neu-button ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'xs' ? 12 : 15} className="animate-spin" />
      ) : (
        Icon && <Icon size={size === 'xs' ? 12 : size === 'lg' ? 18 : 15} style={{ flexShrink: 0 }} />
      )}
      {children && <span>{children}</span>}
      {!loading && IconRight && (
        <IconRight size={size === 'xs' ? 12 : size === 'lg' ? 18 : 15} style={{ flexShrink: 0 }} />
      )}
    </button>
  );
}
