import React, { useState } from 'react';
import { Store, ShieldAlert, ScanBarcode, ArrowRight, Lock, Mail, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ThemeToggle } from '../ui/ThemeToggle';
import api from '../../api';

export function AuthScreen({ onLoginSuccess, theme = 'dark', onToggleTheme }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ store_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Stripped duplicate '/api' prefix so Axios resolves against baseURL correctly
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister
        ? { store_name: form.store_name.trim(), email: form.email.trim(), password: form.password }
        : { email: form.email.trim(), password: form.password };

      const res = await api.post(endpoint, payload);

      localStorage.setItem('retail_token', res.data.token);
      localStorage.setItem('store_name', res.data.store_name);
      onLoginSuccess(res.data.token, res.data.store_name);
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top Floating Theme Switcher */}
      <div
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '2rem',
          zIndex: 50,
        }}
      >
        <ThemeToggle theme={theme} onToggle={onToggleTheme} variant="switch" />
      </div>

      {/* Left Editorial Branding Hero */}
      <div
        style={{
          flex: 1.25,
          padding: '4rem 4.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          backgroundColor: 'var(--bg-surface)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative radial glow */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Brand Logo Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-sunken)',
              boxShadow: 'var(--shadow-sunken-sm)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <Store size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              RetailAI <span style={{ color: 'var(--primary)' }}>OS</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Autonomous Merchant Operating System
            </div>
          </div>
        </div>

        {/* Main Pitch */}
        <div style={{ maxWidth: '540px', position: 'relative', zIndex: 2 }}>
          <Badge variant="info" size="md" style={{ marginBottom: '1.25rem' }}>
            <span className="live-indicator" /> Neumorphic High-Reliability Node
          </Badge>

          <h1
            style={{
              fontSize: '2.6rem',
              fontWeight: 800,
              lineHeight: '1.18',
              letterSpacing: '-0.035em',
              color: 'var(--text-primary)',
              marginBottom: '1.15rem',
            }}
          >
            Intelligent retail operations designed with precision.
          </h1>

          <p
            style={{
              fontSize: '0.96rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              margin: 0,
            }}
          >
            Real-time catalog synchronization, camera-native optical barcode deduction, automated supplier restock purchase orders, and Apriori association mining.
          </p>

          {/* Neumorphic Feature Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.25rem',
              marginTop: '2.5rem',
            }}
          >
            <div
              style={{
                padding: '1.15rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-card)',
                boxShadow: 'var(--shadow-raised-sm)',
                border: 'var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <ScanBarcode size={16} color="#38bdf8" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  HARDWARE INTEGRATION
                </span>
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>Zero-Dongle POS</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Camera-native 1D/2D optical barcode reader with instant inventory ledger deduction.
              </div>
            </div>

            <div
              style={{
                padding: '1.15rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-card)',
                boxShadow: 'var(--shadow-raised-sm)',
                border: 'var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Sparkles size={16} color="#34d399" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  DECISION ENGINE
                </span>
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>Prescriptive AI</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Stockout early-warning buffers, trapped capital clearance, and WhatsApp PO generation.
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 2 }}>
          <span>© 2026 RetailAI Platform</span>
          <span>•</span>
          <span>SQLite High-Speed Engine</span>
          <span>•</span>
          <span>shadcn/ui + Neumorphism</span>
        </div>
      </div>

      {/* Right Form Card Section */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem',
          backgroundColor: 'var(--bg-app)',
        }}
      >
        <Card
          variant="raised-lg"
          style={{
            width: '100%',
            maxWidth: '420px',
            padding: '2.25rem',
          }}
        >
          <div style={{ marginBottom: '1.75rem' }}>
            <h2
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.025em',
                margin: 0,
              }}
            >
              {isRegister ? 'Register Store Terminal' : 'Authenticate Terminal'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px', margin: '4px 0 0' }}>
              {isRegister ? 'Set up a dedicated merchant database node' : 'Enter credentials to access live catalog and metrics'}
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fda4af',
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {isRegister && (
              <Input
                label="Store Name"
                placeholder="e.g. Metro Supermarket"
                value={form.store_name}
                onChange={(e) => setForm({ ...form, store_name: e.target.value })}
                required
                icon={Store}
              />
            )}

            <Input
              label="Terminal Account / Email"
              type="email"
              placeholder="admin@store.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              icon={Mail}
            />

            <Input
              label="Security Key / Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              icon={Lock}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              fullWidth
              style={{ marginTop: '0.5rem' }}
            >
              {isRegister ? 'Initialize Store Platform' : 'Sign in to Terminal'}
            </Button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}
          >
            {isRegister ? 'Already registered?' : 'Need a new store node?'}{' '}
            <span
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              style={{
                color: 'var(--primary)',
                cursor: 'pointer',
                fontWeight: 700,
                marginLeft: '3px',
              }}
            >
              {isRegister ? 'Sign in instead' : 'Create store record'}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}