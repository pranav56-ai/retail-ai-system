import React from 'react';
import { 
  FileText, MessageCircle, AlertTriangle, CheckCircle2, 
  Printer, Phone, ShieldCheck, ArrowRight, DollarSign, PackageCheck 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';

export function PurchaseOrdersView({
  inventory,
  supplierPhone,
  setSupplierPhone,
  onSendWhatsApp,
  onSelectPO,
}) {
  const stockShortages = inventory.filter((i) => i.current_stock <= i.min_stock_level);

  const totalRestockCost = stockShortages.reduce((acc, item) => {
    const qty = Math.max((item.min_stock_level * 2) - item.current_stock, 10);
    return acc + (qty * item.cost_price);
  }, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Wholesaler Configuration Strip */}
      <Card variant="raised" style={{ padding: '1.25rem 1.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(37, 211, 102, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#25D366',
              }}
            >
              <MessageCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Supplier Restock Gateway
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Purchase orders are automatically structured into official vendor messages.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Target WhatsApp Number:
            </span>
            <div style={{ width: '180px' }}>
              <Input
                type="text"
                placeholder="e.g. 919876543210"
                value={supplierPhone}
                onChange={(e) => {
                  setSupplierPhone(e.target.value);
                  localStorage.setItem('supplier_phone', e.target.value);
                }}
                style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Main Stockout Shortage & Restock Deck */}
      <Card variant="raised">
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CardTitle icon={FileText}>Threshold Restock Orders</CardTitle>
              {stockShortages.length > 0 ? (
                <Badge variant="warning" size="sm">
                  {stockShortages.length} Restocks Required
                </Badge>
              ) : (
                <Badge variant="success" size="sm">
                  Catalog Fully Stocked
                </Badge>
              )}
            </div>

            {stockShortages.length > 0 && (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Total Order Requirement Basis: <strong className="mono" style={{ color: '#38bdf8' }}>₹{totalRestockCost.toLocaleString()}</strong>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {stockShortages.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1rem',
              }}
            >
              {stockShortages.map((item) => {
                const recommendedPO = Math.max((item.min_stock_level * 2) - item.current_stock, 10);
                const estimatedCost = recommendedPO * item.cost_price;

                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: 'var(--bg-sunken)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-sunken-sm)',
                      padding: '1.25rem',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderLeft: '4px solid #f59e0b',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {item.name}
                        </span>
                        <Badge variant="destructive" size="sm">
                          {item.current_stock} / {item.min_stock_level}
                        </Badge>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 8px' }}>
                        Category: {item.category} • UPC: {item.barcode || 'N/A'}
                      </div>

                      <div
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          boxShadow: 'var(--shadow-raised-xs)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.65rem 0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: '1px solid rgba(255, 255, 255, 0.04)',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                            RECOMMENDED UNITS
                          </span>
                          <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {recommendedPO} units
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                            EST. CAPITAL
                          </span>
                          <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>
                            ₹{estimatedCost.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      <Button
                        variant="emerald"
                        size="sm"
                        icon={MessageCircle}
                        fullWidth
                        onClick={() => onSendWhatsApp(item, recommendedPO)}
                      >
                        Dispatch via WhatsApp
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Printer}
                        fullWidth
                        onClick={() => onSelectPO({ item, recommendedPO, estimatedCost })}
                      >
                        View Official Invoice
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                padding: '3rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-sunken)',
                boxShadow: 'var(--shadow-sunken-sm)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)',
                fontSize: '0.84rem',
              }}
            >
              <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                No Urgent Purchase Orders Required
              </div>
              <div style={{ marginTop: '4px' }}>
                All inventory quantities currently exceed their configured minimum stock thresholds.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
