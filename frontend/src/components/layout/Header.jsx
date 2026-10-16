import React from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ThemeToggle } from '../ui/ThemeToggle';
import { 
  ScanBarcode, RefreshCw, Database, Sparkles, 
  ShieldAlert, PieChart, TrendingUp, GitBranch, ShoppingBag, FileText, ShoppingCart 
} from 'lucide-react';

export function Header({
  activeTab,
  onOpenScanner,
  onSyncTransactions,
  syncing = false,
  theme = 'dark',
  onToggleTheme,
}) {
  const getTabDetails = () => {
    switch (activeTab) {
      case 'pos':
        return { title: 'POS Checkout Register', subtitle: 'Continuous multi-item scanning & atomic basket ledger', icon: ShoppingCart };
      case 'insights':
        return { title: 'Prescriptive Decision Deck', subtitle: 'Automated restock triggers & Apriori bundles', icon: ShieldAlert };
      case 'analytics':
        return { title: 'Capital Allocation & Margins', subtitle: 'Wholesale capital distribution by category', icon: PieChart };
      case 'simulator':
        return { title: 'Price Elasticity Simulator', subtitle: 'What-If volume and net-margin projection model', icon: TrendingUp };
      case 'affinity':
        return { title: 'Market Basket Affinity Matrix', subtitle: 'Cross-SKU statistical co-purchase correlations', icon: GitBranch };
      case 'inventory':
        return { title: 'Active Inventory Catalog', subtitle: 'Real-time SKU catalog and optical intake decoder', icon: ShoppingBag };
      case 'po_generator':
        return { title: 'Automated Supplier Reorders', subtitle: 'Safety threshold dispatches and WhatsApp invoices', icon: FileText };
      default:
        return { title: 'RetailAI Operations Deck', subtitle: 'Store Operating System', icon: Sparkles };
    }
  };

  const { title, subtitle, icon: Icon } = getTabDetails();

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
        padding: '0 1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-sunken)',
            boxShadow: 'var(--shadow-sunken-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
          }}
        >
          <Icon size={18} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              {title}
            </h1>
            <Badge variant="sunken" size="sm">
              <span className="live-indicator" /> Live
            </Badge>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.2 }}>
            {subtitle}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-sunken)',
            boxShadow: 'var(--shadow-sunken-sm)',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            border: '1px solid rgba(255, 255, 255, 0.03)',
          }}
        >
          <Database size={12} style={{ color: '#38bdf8' }} />
          <span>Engine: <strong className="mono" style={{ color: 'var(--text-secondary)' }}>retail.db</strong></span>
        </div>

        <Button
          variant="emerald"
          size="sm"
          icon={ScanBarcode}
          onClick={() => onOpenScanner('pos')}
        >
          Scan Barcode POS
        </Button>

        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={syncing}
          onClick={onSyncTransactions}
        >
          {syncing ? 'Mining Rules...' : 'Sync AI Rules'}
        </Button>

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
