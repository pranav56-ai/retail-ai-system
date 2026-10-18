import React from 'react';
import { ProductCard } from './ProductCard';

/**
 * ProductGrid Component for POS Checkout Register
 * 
 * Provides:
 * - Responsive auto-filling grid layout
 * - Generous top padding (12px) ensuring top-row floating tooltips do not get clipped
 * - overflow-x: visible & overflow-y: auto for smooth scroll without clipping
 * - Empty state feedback when filters return zero items
 */
export function ProductGrid({
  products = [],
  cart = [],
  onAddToCart,
  emptyMessage = 'No matching products found in catalog.',
  className = '',
  style = {},
}) {
  if (products.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 1.5rem',
          color: 'var(--text-muted, #64748b)',
          textAlign: 'center',
          ...style,
        }}
        className={className}
      >
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)' }}>
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'visible',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))',
        gap: '0.85rem',
        padding: '12px 6px 20px 6px', // Top padding prevents top-row tooltip clipping
        position: 'relative',
        ...style,
      }}
      className={`pos-product-grid ${className}`}
    >
      {products.map((prod) => {
        const inCartItem = cart.find((it) => it.product_id === prod.id);
        return (
          <ProductCard
            key={prod.id}
            product={prod}
            inCartItem={inCartItem}
            onAddToCart={onAddToCart}
          />
        );
      })}
    </div>
  );
}

export { ProductCard };
export default ProductGrid;
