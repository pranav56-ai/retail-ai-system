import {
  Store, ShieldAlert, PieChart, TrendingUp, GitBranch,
  ShoppingBag, FileText, LogOut, Sun, Moon, Sparkles, Check,
  ShoppingCart, ScanBarcode
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { ThemeToggle } from '../ui/ThemeToggle';

export function Sidebar({
  activeTab,
  setActiveTab,
  storeName,
  onLogout,
  inventoryCount = 0,
  urgentActionsCount = 0,
  stockShortagesCount = 0,
  theme = 'dark',
  onToggleTheme,
}) {
  const navItems = [
    {
      group: 'REGISTER & SALES',
      items: [
        {
          id: 'pos',
          label: 'POS Checkout Register',
          icon: ShoppingCart,
          badge: 'LIVE',
          badgeVariant: 'emerald',
        },
      ],
    },
    {
      group: 'INTELLIGENCE',
      items: [
        {
          id: 'insights',
          label: 'Prescriptive Action',
          icon: ShieldAlert,
          badge: urgentActionsCount > 0 ? urgentActionsCount : null,
          badgeVariant: 'destructive',
        },
        {
          id: 'analytics',
          label: 'Capital Allocation',
          icon: PieChart,
        },
        {
          id: 'simulator',
          label: 'Price Elasticity',
          icon: TrendingUp,
        },
        {
          id: 'affinity',
          label: 'Basket Affinity',
          icon: GitBranch,
        },
      ],
    },
    {
      group: 'OPERATIONS',
      items: [
        {
          id: 'inventory',
          label: 'Inventory Catalog',
          icon: ShoppingBag,
          badge: inventoryCount > 0 ? inventoryCount : null,
          badgeVariant: 'secondary',
        },
        {
          id: 'po_generator',
          label: 'Restock Orders (PO)',
          icon: FileText,
          badge: stockShortagesCount > 0 ? stockShortagesCount : null,
          badgeVariant: 'warning',
        },
      ],
    },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: 'var(--shadow-raised-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      <div>
        {/* Brand Header */}
        <div
          style={{
            padding: '1.4rem 1.25rem 1.15rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-sunken)',
                boxShadow: 'var(--shadow-sunken-sm)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <Store size={20} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.03em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                RetailAI <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>OS</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              </div>
            </div>
          </div>

          {/* Theme Quick Toggle */}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>

        {/* Nav Links */}
        <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {navItems.map((group, gIdx) => (
            <div key={gIdx}>
              <div
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  color: 'var(--text-faint)',
                  letterSpacing: '0.08em',
                  padding: '0 0.65rem 0.4rem',
                }}
              >
                {group.group}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.7rem',
                        width: '100%',
                        padding: '0.6rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: isActive ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid transparent',
                        backgroundColor: isActive ? 'var(--bg-sunken)' : 'transparent',
                        boxShadow: isActive ? 'var(--shadow-sunken-sm)' : 'none',
                        color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                        fontSize: '0.82rem',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all var(--transition-fast)',
                        outline: 'none',
                        userSelect: 'none',
                      }}
                      className="neu-nav-item"
                    >
                      <Icon
                        size={17}
                        style={{
                          color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                          flexShrink: 0,
                          transition: 'color var(--transition-fast)',
                        }}
                      />
                      <span style={{ flex: 1 }}>{item.label}</span>

                      {item.badge && (
                        <Badge variant={item.badgeVariant || 'default'} size="sm">
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Store Node Profile & Signout */}
      <div style={{ padding: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div
          style={{
            backgroundColor: 'var(--bg-sunken)',
            boxShadow: 'var(--shadow-sunken-sm)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 0.75rem',
            marginBottom: '0.65rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            border: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-card-raised)',
              boxShadow: 'var(--shadow-raised-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
              color: 'var(--primary)',
            }}
          >
            {storeName ? storeName[0].toUpperCase() : 'R'}
          </div>

          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {storeName || 'Terminal Node'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="live-indicator" /> Online • SQLite
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-card)',
            boxShadow: 'var(--shadow-raised-xs)',
            border: 'var(--border-subtle)',
            color: 'var(--text-muted)',
            fontSize: '0.76rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          className="neu-interactive"
        >
          <LogOut size={13} /> Exit Session
        </button>
      </div>
    </aside>
  );
}
