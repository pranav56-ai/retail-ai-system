import React, { useRef } from 'react';
import { Dialog, DialogHeader, DialogBody, DialogFooter } from './Dialog';
import { Button } from './Button';
import { Badge } from './Badge';
import { Printer, MessageCircle, CheckCircle2, ShoppingBag, Receipt, ArrowRight, X } from 'lucide-react';

export function POSReceiptModal({
  open,
  onClose,
  receipt,
  storeName,
  onNewSale,
}) {
  const receiptRef = useRef(null);

  if (!receipt) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=450,height=650');
    if (!printWindow) {
      window.print();
      return;
    }

    const itemsRows = receipt.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 6px 0; font-weight: 600;">${item.name}</td>
          <td style="padding: 6px 0; text-align: center;">${item.quantity}</td>
          <td style="padding: 6px 0; text-align: right;">₹${item.unit_price.toFixed(2)}</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 700;">₹${item.line_total.toFixed(2)}</td>
        </tr>`
      )
      .join('');

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${receipt.order_id}</title>
          <style>
            @page { margin: 0; size: 80mm auto; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
              font-size: 12px;
              color: #000;
              margin: 0;
              padding: 16px;
              width: 76mm;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #444; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { border-bottom: 1px solid #000; padding: 4px 0; text-align: left; }
          </style>
        </head>
        <body>
          <div class="center">
            <h2 style="margin: 0 0 4px; font-size: 16px;">${storeName || 'RetailAI Store'}</h2>
            <div style="font-size: 10px; color: #555;">Point of Sale Tax Invoice</div>
            <div style="font-size: 10px; margin-top: 2px;">Order: <strong>${receipt.order_id}</strong></div>
            <div style="font-size: 10px;">${new Date(receipt.timestamp).toLocaleString()}</div>
          </div>
          
          <div class="divider"></div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
          
          <div class="divider"></div>
          
          <table>
            <tr>
              <td>Subtotal (${receipt.total_quantity} items):</td>
              <td class="right">₹${receipt.subtotal.toFixed(2)}</td>
            </tr>
            ${
              receipt.discount_applied > 0
                ? `<tr>
                    <td>Discount:</td>
                    <td class="right" style="color: #000;">-₹${receipt.discount_applied.toFixed(2)}</td>
                  </tr>`
                : ''
            }
            <tr style="font-size: 14px; font-weight: bold;">
              <td style="padding-top: 6px;">TOTAL AMOUNT:</td>
              <td class="right" style="padding-top: 6px;">₹${receipt.total_amount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="font-size: 10px; color: #555;">Payment Mode:</td>
              <td class="right" style="font-size: 10px;">${receipt.payment_mode || 'CASH'}</td>
            </tr>
          </table>
          
          <div class="divider"></div>
          
          <div class="center" style="font-size: 10px; color: #444; margin-top: 10px;">
            Thank you for shopping with us!<br/>
            Powered by RetailAI Engine
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleSendWhatsApp = () => {
    const phone = receipt.customer_phone ? receipt.customer_phone.replace(/[^0-9]/g, '') : '';
    const store = storeName || 'Our Store';
    
    let itemsText = receipt.items
      .map(
        (it, idx) =>
          `${idx + 1}. *${it.name}* x ${it.quantity} @ ₹${it.unit_price} = ₹${it.line_total.toFixed(2)}`
      )
      .join('\n');

    const msg =
      `🧾 *TAX INVOICE - ${store.toUpperCase()}*\n` +
      `Order ID: *${receipt.order_id}*\n` +
      `Date: ${new Date(receipt.timestamp).toLocaleString()}\n` +
      `--------------------------------\n` +
      itemsText +
      `\n--------------------------------\n` +
      `• *Subtotal:* ₹${receipt.subtotal.toFixed(2)}\n` +
      (receipt.discount_applied > 0 ? `• *Discount:* -₹${receipt.discount_applied.toFixed(2)}\n` : '') +
      `• *TOTAL PAID:* *₹${receipt.total_amount.toFixed(2)}*\n` +
      `• *Payment Mode:* ${receipt.payment_mode || 'CASH'}\n\n` +
      `Thank you for your business! Visit again soon. 🙏`;

    const encoded = encodeURIComponent(msg);
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="480px">
      <DialogHeader
        icon={Receipt}
        title="Checkout Completed"
        description="Transaction logged atomically into multi-item ledger."
        onClose={onClose}
      />

      <DialogBody>
        {/* Receipt Paper Card */}
        <div
          ref={receiptRef}
          style={{
            backgroundColor: 'var(--bg-sunken)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sunken-md)',
            position: 'relative',
          }}
        >
          {/* Store Brand & Receipt Header */}
          <div style={{ textAlign: 'center', borderBottom: '1px dashed rgba(255, 255, 255, 0.12)', paddingBottom: '0.85rem', marginBottom: '0.85rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
              <CheckCircle2 size={16} /> Payment Verified
            </div>
            <h3 style={{ margin: '0 0 0.2rem', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {storeName || 'RetailAI Store'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                {receipt.order_id}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {new Date(receipt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <Badge variant="emerald" size="sm">
                {receipt.payment_mode || 'CASH'}
              </Badge>
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '0.85rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-faint)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'left' }}>
                  <th style={{ padding: '0.4rem 0', fontWeight: 700 }}>SKU</th>
                  <th style={{ padding: '0.4rem 0.3rem', textAlign: 'center', fontWeight: 700 }}>Qty</th>
                  <th style={{ padding: '0.4rem 0.3rem', textAlign: 'right', fontWeight: 700 }}>Rate</th>
                  <th style={{ padding: '0.4rem 0', textAlign: 'right', fontWeight: 700 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                    <td style={{ padding: '0.45rem 0', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {item.name}
                      {item.is_low_stock && (
                        <span style={{ display: 'block', fontSize: '0.65rem', color: '#f59e0b', fontWeight: 700 }}>
                          ⚠️ Low stock: {item.remaining_stock} left
                        </span>
                      )}
                    </td>
                    <td className="mono" style={{ padding: '0.45rem 0.3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {item.quantity}
                    </td>
                    <td className="mono" style={{ padding: '0.45rem 0.3rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                      ₹{item.unit_price.toFixed(2)}
                    </td>
                    <td className="mono" style={{ padding: '0.45rem 0', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 700 }}>
                      ₹{item.line_total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Summary */}
          <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.12)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Subtotal ({receipt.total_quantity} items):</span>
              <span className="mono">₹{receipt.subtotal.toFixed(2)}</span>
            </div>

            {receipt.discount_applied > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                <span>Discount Applied:</span>
                <span className="mono">-₹{receipt.discount_applied.toFixed(2)}</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '0.45rem',
                marginTop: '0.2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'var(--text-primary)',
                fontSize: '1.05rem',
                fontWeight: 800,
              }}
            >
              <span>Net Paid:</span>
              <span className="mono" style={{ color: '#34d399' }}>₹{receipt.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Low Stock Warnings Notification Banner */}
        {receipt.low_stock_warnings && receipt.low_stock_warnings.length > 0 && (
          <div
            style={{
              marginTop: '0.85rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              color: '#fcd34d',
              fontSize: '0.74rem',
              lineHeight: 1.4,
            }}
          >
            <strong>Inventory Alert:</strong> {receipt.low_stock_warnings.join(' ')}
          </div>
        )}
      </DialogBody>

      <DialogFooter>
        <div style={{ display: 'flex', gap: '0.5rem', width: '100%', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
            style={{ flex: 1 }}
          >
            Print Receipt
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={MessageCircle}
            onClick={handleSendWhatsApp}
            style={{ flex: 1 }}
          >
            WhatsApp Bill
          </Button>

          <Button
            variant="emerald"
            size="sm"
            icon={ArrowRight}
            onClick={() => {
              onClose();
              if (onNewSale) onNewSale();
            }}
            style={{ flex: 1.2 }}
          >
            New Sale
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}
