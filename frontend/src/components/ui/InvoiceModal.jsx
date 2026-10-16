import React from 'react';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from './Dialog';
import { Button } from './Button';
import { FileText, Printer, MessageCircle, Building, Calendar, Phone, Hash } from 'lucide-react';

export function InvoiceModal({
  open,
  onClose,
  purchaseOrder,
  storeName,
  supplierPhone,
  onSendWhatsApp,
}) {
  if (!purchaseOrder) return null;

  const { item, recommendedPO, estimatedCost, poNumber } = purchaseOrder;
  const currentPONumber = poNumber || `PO-${Math.floor(1000 + Math.random() * 9000)}`;
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="600px">
      <DialogHeader
        icon={FileText}
        title="Purchase Order Invoice"
        description="Official inventory replenishment documentation for vendor reconciliation."
        onClose={onClose}
      />

      <DialogBody>
        <div
          id="printable-po"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'var(--shadow-raised-sm)',
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              paddingBottom: '1.25rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                AUTOMATED REPLENISHMENT DRAFT
              </span>
              <div
                className="mono"
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginTop: '2px',
                }}
              >
                {currentPONumber}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {storeName || 'Retail Hub Terminal'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Store ID: #NODE-2026-X
              </div>
            </div>
          </div>

          {/* Meta Information Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              padding: '1rem 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                <Calendar size={13} />
                <span>Issue Date: <strong style={{ color: 'var(--text-primary)' }}>{currentDate}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                <Building size={13} />
                <span>Issuer: <strong style={{ color: 'var(--text-primary)' }}>{storeName || 'Merchant'}</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                <Phone size={13} />
                <span>Wholesaler: <strong style={{ color: 'var(--text-primary)' }}>+{supplierPhone}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                <Hash size={13} />
                <span>Condition: <strong style={{ color: '#34d399' }}>Low Stock Trigger</strong></span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.5rem 0.4rem', fontWeight: 600 }}>Item Description</th>
                  <th style={{ padding: '0.5rem 0.4rem', fontWeight: 600, textAlign: 'center' }}>Units</th>
                  <th style={{ padding: '0.5rem 0.4rem', fontWeight: 600, textAlign: 'right' }}>Wholesale Rate</th>
                  <th style={{ padding: '0.5rem 0.4rem', fontWeight: 600, textAlign: 'right' }}>Line Total</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '0.75rem 0.4rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Category: {item.category} | UPC: {item.barcode || 'N/A'}</div>
                  </td>
                  <td className="mono" style={{ padding: '0.75rem 0.4rem', textAlign: 'center', fontWeight: 700 }}>
                    {recommendedPO}
                  </td>
                  <td className="mono" style={{ padding: '0.75rem 0.4rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                    ₹{item.cost_price.toFixed(2)}
                  </td>
                  <td className="mono" style={{ padding: '0.75rem 0.4rem', textAlign: 'right', color: 'var(--primary)', fontWeight: 800 }}>
                    ₹{estimatedCost.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grand Total Summary */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--bg-sunken)',
              boxShadow: 'var(--shadow-sunken-sm)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Estimated Order Value (Wholesale Basis)
              </span>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Standard net-30 dispatch terms</div>
            </div>
            <div className="mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>
              ₹{estimatedCost.toLocaleString()}
            </div>
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Dismiss
        </Button>
        <Button variant="secondary" size="sm" icon={Printer} onClick={handlePrint}>
          Print PDF
        </Button>
        <Button
          variant="emerald"
          size="sm"
          icon={MessageCircle}
          onClick={() => {
            onSendWhatsApp(item, recommendedPO);
            onClose();
          }}
        >
          Send WhatsApp Order
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
