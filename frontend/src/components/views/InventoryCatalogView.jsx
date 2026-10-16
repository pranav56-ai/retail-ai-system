import React, { useState } from 'react';
import {
  ShoppingBag, PlusCircle, Search, Trash2, Camera,
  Tag, AlertTriangle, CheckCircle2, ChevronDown, Filter, DollarSign,
  FileSpreadsheet, Upload, Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { TooltipText } from '../ui/Tooltip';
import { FileUploadModal } from '../ui/FileUploadModal';

export function InventoryCatalogView({
  inventory,
  newItem,
  setNewItem,
  onAddProduct,
  onDeleteProduct,
  onOpenScanner,
  onReloadCatalog,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const categories = ['All', ...new Set(inventory.map((p) => p.category))];

  const filteredItems = inventory.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoadingAdd(true);
    try {
      await onAddProduct(e);
    } finally {
      setLoadingAdd(false);
    }
  };

  const calculatedMargin =
    newItem.cost_price && newItem.selling_price && Number(newItem.selling_price) > 0
      ? (((Number(newItem.selling_price) - Number(newItem.cost_price)) / Number(newItem.selling_price)) * 100).toFixed(1)
      : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', alignItems: 'start' }}>

      {/* Deploy SKU Intake Form Card */}
      <Card variant="raised">
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <CardTitle icon={PlusCircle}>Deploy SKU</CardTitle>
            <Button
              variant="outline"
              size="xs"
              icon={FileSpreadsheet}
              onClick={() => setUploadModalOpen(true)}
            >
              Bulk Import
            </Button>
          </div>
          <CardDescription>
            Insert or update products with barcode tracking and margin thresholds.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Product Title"
              placeholder="e.g. Britannia Multigrain Bread 400g"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Input
                label="Category"
                placeholder="Dairy, Bakery..."
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                required
              />
              <Input
                label="Initial Stock"
                type="number"
                placeholder="10"
                value={newItem.current_stock}
                onChange={(e) => setNewItem({ ...newItem, current_stock: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Input
                label="Cost Price (₹)"
                type="number"
                step="0.01"
                placeholder="28.00"
                value={newItem.cost_price}
                onChange={(e) => setNewItem({ ...newItem, cost_price: e.target.value })}
                required
              />
              <Input
                label="Selling Price (₹)"
                type="number"
                step="0.01"
                placeholder="45.00"
                value={newItem.selling_price}
                onChange={(e) => setNewItem({ ...newItem, selling_price: e.target.value })}
                required
              />
            </div>

            {calculatedMargin !== null && (
              <div
                style={{
                  backgroundColor: 'var(--bg-sunken)',
                  boxShadow: 'var(--shadow-sunken-sm)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.76rem',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>Estimated Markup Return:</span>
                <span className="mono" style={{ fontWeight: 800, color: Number(calculatedMargin) >= 20 ? '#34d399' : '#f59e0b' }}>
                  {calculatedMargin}%
                </span>
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Barcode / UPC Code
                </label>
                <button
                  type="button"
                  onClick={() => onOpenScanner('intake')}
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#60a5fa',
                    borderRadius: 'var(--radius-xs)',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Camera size={12} /> Optical Scan
                </button>
              </div>
              <Input
                placeholder="Scan or key-in (e.g. 890103000001)"
                value={newItem.barcode}
                onChange={(e) => setNewItem({ ...newItem, barcode: e.target.value })}
              />
            </div>

            <Input
              label="Safety Reorder Threshold"
              type="number"
              value={newItem.min_stock_level}
              onChange={(e) => setNewItem({ ...newItem, min_stock_level: e.target.value })}
              required
              helperText="Alert triggers when stock hits this buffer"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loadingAdd}
              fullWidth
              style={{ marginTop: '0.25rem' }}
            >
              Commit SKU to Database
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* SKU Catalog Table Card */}
      <Card variant="raised">
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CardTitle icon={ShoppingBag}>Active SKU Catalog</CardTitle>
              <Badge variant="sunken" size="sm" className="mono">
                {filteredItems.length} SKUs
              </Badge>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: selectedCategory === cat ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                      backgroundColor: selectedCategory === cat ? 'var(--bg-sunken)' : 'transparent',
                      color: selectedCategory === cat ? 'var(--primary)' : 'var(--text-muted)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Import Excel / CSV Button */}
              <Button
                variant="secondary"
                size="xs"
                icon={FileSpreadsheet}
                onClick={() => setUploadModalOpen(true)}
              >
                Import Excel / CSV
              </Button>

              {/* Search Bar */}
              <div style={{ width: '170px' }}>
                <Input
                  placeholder="Search catalog..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={Search}
                  style={{ padding: '0.35rem 0.6rem 0.35rem 0.4rem', fontSize: '0.78rem' }}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.07)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>SKU Name</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>UPC / Barcode</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, textAlign: 'right' }}>Cost Basis</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, textAlign: 'right' }}>Retail Price</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, textAlign: 'center' }}>Stock</th>
                  <th style={{ padding: '0.6rem 0.75rem', fontWeight: 600, textAlign: 'right' }}>Margin</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No matching inventory records found.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const margin = ((item.selling_price - item.cost_price) / item.selling_price * 100).toFixed(1);
                    const isLow = item.current_stock <= item.min_stock_level;

                    return (
                      <tr
                        key={item.id}
                        className="neu-table-row"
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                      >
                        <td style={{ padding: '0.75rem', maxWidth: '240px' }}>
                          <TooltipText
                            text={item.name}
                            badge={item.category}
                            subtext={`Barcode: ${item.barcode || 'N/A'} | Cost: ₹${item.cost_price} | Price: ₹${item.selling_price}`}
                            textStyle={{ fontWeight: 700, color: 'var(--text-primary)' }}
                          />
                          {isLow && (
                            <Badge variant="destructive" size="sm" style={{ marginTop: '2px' }}>
                              Low Stock ({item.current_stock}/{item.min_stock_level})
                            </Badge>
                          )}
                        </td>

                        <td className="mono" style={{ padding: '0.75rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          {item.barcode || '—'}
                        </td>

                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                          {item.category}
                        </td>

                        <td className="mono" style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                          ₹{item.cost_price.toFixed(2)}
                        </td>

                        <td className="mono" style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 700 }}>
                          ₹{item.selling_price.toFixed(2)}
                        </td>

                        <td className="mono" style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 800, color: isLow ? '#f43f5e' : 'var(--text-primary)' }}>
                          {item.current_stock}
                        </td>

                        <td className="mono" style={{ padding: '0.75rem', textAlign: 'right', color: '#34d399', fontWeight: 700 }}>
                          {margin}%
                        </td>

                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(item.id, item.name)}
                            title="Remove SKU from database"
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: 'var(--radius-xs)',
                              transition: 'color var(--transition-fast)',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#f43f5e')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Excel/CSV Upload Modal */}
      <FileUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={() => {
          if (onReloadCatalog) {
            onReloadCatalog();
          }
        }}
      />
    </div>
  );
}
