import React from 'react';
import ExportButton from './ExportButton';

const PURPLE = '#632CA6';

// Lock SVG icon
const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

function formatCurrency(amount) {
  if (amount === 0) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function PricingSummary({ groups, costs, showPricing, onReveal, onHide, billingType, priceLevel, values = {}, logIndexes = [], customerName = '' }) {
  // Compute total monthly cost
  const totalMonthly = Object.values(costs).reduce((sum, v) => sum + (v || 0), 0);
  const totalAnnual = totalMonthly * 12;

  // --- Hidden state: centered reveal button ---
  if (!showPricing) {
    return (
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 200,
          background: 'linear-gradient(to top, rgba(255,255,255,1) 60%, rgba(255,255,255,0))',
          padding: '20px 24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          pointerEvents: 'none',
        }}
      >
        <button
          onClick={onReveal}
          style={{
            pointerEvents: 'all',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 24px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#fff',
            background: PURPLE,
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(99,44,166,0.35)',
            transition: 'opacity 0.15s, transform 0.1s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <LockIcon />
          Reveal Pricing
        </button>
        <p
          style={{
            pointerEvents: 'none',
            margin: 0,
            fontSize: '11px',
            color: '#aaa',
          }}
        >
          Prices hidden
        </p>
      </div>
    );
  }

  // --- Shown state: fixed right panel ---
  // Build line items: groups with at least one SKU cost > 0
  const lineItems = groups
    .map((group) => {
      const skusWithCost = group.skus.filter((sku) => (costs[sku.id] || 0) > 0);
      const groupTotal = skusWithCost.reduce((sum, sku) => sum + (costs[sku.id] || 0), 0);
      return { group, skusWithCost, groupTotal };
    })
    .filter(({ groupTotal }) => groupTotal > 0);

  return (
    <div
      style={{
        position: 'fixed',
        top: 64,
        right: 0,
        bottom: 0,
        width: '320px',
        background: '#fff',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        zIndex: 150,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #eee',
        }}
      >
        <p
          style={{
            margin: '0 0 4px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#888',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Estimated Monthly Cost
        </p>
        <p
          style={{
            margin: '0 0 4px',
            fontSize: '32px',
            fontWeight: 800,
            color: PURPLE,
            lineHeight: 1.1,
          }}
        >
          {formatCurrency(totalMonthly)}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: '#888',
          }}
        >
          {formatCurrency(totalAnnual)} per year
        </p>
      </div>

      {/* Line items */}
      <div style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {lineItems.length === 0 ? (
          <p
            style={{
              margin: '24px 20px',
              fontSize: '13px',
              color: '#aaa',
              textAlign: 'center',
            }}
          >
            No products configured yet.
          </p>
        ) : (
          lineItems.map(({ group, skusWithCost, groupTotal }) => (
            <div key={group.id} style={{ marginBottom: '4px' }}>
              {/* Group row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 20px',
                  background: '#fafafa',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#333',
                  }}
                >
                  <span aria-hidden="true">{group.icon}</span>
                  {group.label}
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#333',
                  }}
                >
                  {formatCurrency(groupTotal)}
                </span>
              </div>

              {/* SKU sub-lines */}
              {skusWithCost.map((sku) => (
                <div
                  key={sku.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 20px 5px 40px',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#666' }}>{sku.label}</span>
                  <span style={{ fontSize: '12px', color: '#555', fontWeight: 500 }}>
                    {formatCurrency(costs[sku.id])}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid #eee',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* Disclaimer */}
        <p
          style={{
            margin: 0,
            fontSize: '11px',
            color: '#aaa',
            lineHeight: 1.5,
          }}
        >
          Estimates based on list pricing ({billingType}/{priceLevel} level). Actual costs depend on
          negotiated rates, commitment discounts, and usage patterns. Contact your Datadog account
          team for a formal quote.
        </p>

        {/* Export CSV */}
        <div style={{ color: PURPLE }}>
          <ExportButton
            groups={groups}
            values={values}
            costs={costs}
            billingType={billingType}
            priceLevel={priceLevel}
            logIndexes={logIndexes}
            customerName={customerName}
          />
        </div>

        {/* Hide Prices */}
        <button
          onClick={onHide}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontSize: '13px',
            color: '#888',
            textDecoration: 'underline',
            textAlign: 'left',
          }}
        >
          Hide Prices
        </button>
      </div>
    </div>
  );
}

export default PricingSummary;
