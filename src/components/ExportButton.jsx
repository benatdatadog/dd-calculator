import React from 'react';
import { calcLogIndex } from '../data/pricing.js';

function ExportButton({ groups, values, costs, billingType, priceLevel, logIndexes = [], customerName = '' }) {
  const handleExport = () => {
    const today = new Date();
    const dateLabel = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const dateFilename = today.toISOString().slice(0, 10);
    const slug = customerName ? `-${customerName.toLowerCase().replace(/\s+/g, '-')}` : '';

    const billingLabel = billingType === 'annual' ? 'Annual' : 'M2M';
    const priceLevelLabel = { rep: 'Rep', manager: 'Manager', director: 'Director' }[priceLevel] ?? priceLevel;

    const esc = (val) => {
      const str = String(val ?? '');
      return (str.includes(',') || str.includes('"') || str.includes('\n'))
        ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const row = (cells) => cells.map(esc).join(',');

    const lines = [];
    lines.push(row([customerName ? `${customerName} — Datadog Pricing Estimate — ${dateLabel}` : `Datadog Pricing Estimate — Generated ${dateLabel}`]));
    lines.push(row([`Billing Type: ${billingLabel} | Price Level: ${priceLevelLabel}`]));
    lines.push('');
    lines.push(row(['Product Group', 'SKU', 'Quantity', 'Unit', 'Monthly Cost ($)', 'Annual Cost ($)']));

    let totalMonthly = 0;

    for (const group of groups) {
      for (const sku of group.skus) {
        // Log index table: expand each row individually
        if (sku.inputType === 'log-index-table') {
          for (const idx of logIndexes) {
            if (!idx.events || +idx.events <= 0) continue;
            const monthly = calcLogIndex(+idx.events, +idx.retention || 15, billingType);
            if (monthly === 0) continue;
            totalMonthly += monthly;
            const name = idx.name ? `Log Index: ${idx.name}` : 'Log Index';
            lines.push(row([group.label, name, idx.events, `M events (${idx.retention}d retention)`, monthly.toFixed(2), (monthly * 12).toFixed(2)]));
          }
          continue;
        }

        const qty = values[sku.id];
        if (qty === undefined || qty === null || qty === '' || Number(qty) <= 0) continue;
        const monthly = costs[sku.id] ?? 0;
        if (monthly === 0) continue;
        totalMonthly += monthly;
        lines.push(row([group.label, sku.label, qty, sku.unit ?? '', monthly.toFixed(2), (monthly * 12).toFixed(2)]));
      }
    }

    lines.push('');
    lines.push(row(['TOTAL MONTHLY', '', '', '', totalMonthly.toFixed(2), (totalMonthly * 12).toFixed(2)]));

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `datadog-pricing-estimate${slug}-${dateFilename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4em',
        padding: '0.5em 1.1em',
        border: '1.5px solid currentColor',
        borderRadius: '4px',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: 500,
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Export to CSV
    </button>
  );
}

export default ExportButton;
