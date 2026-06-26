import Tooltip from './Tooltip.jsx';
import LogIndexTable from './LogIndexTable.jsx';

function formatCurrency(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + '/mo';
}

export default function SkuInput({ sku, value, onChange, monthlyCost, showPricing, extras }) {
  const { id, label, unit, inputType, options, placeholder, tooltip, pricingNote } = sku;

  // Computed (read-only display): derived from other inputs, no user entry
  if (inputType === 'computed') {
    if (!monthlyCost || monthlyCost <= 0) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ flexGrow: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontWeight: 500 }}>{label}</span>
            {tooltip && <Tooltip text={tooltip} />}
          </div>
        </div>
        <div style={{ width: 160 }} />
        <div style={{ width: 120, color: '#6b6b6b', fontSize: 13 }}>{unit}</div>
        <div
          style={{ width: 140, textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
          className={!showPricing ? 'blurred' : undefined}
        >
          {formatCurrency(monthlyCost)}
        </div>
      </div>
    );
  }

  // Log index table: special multi-row UI
  if (inputType === 'log-index-table') {
    return (
      <LogIndexTable
        rows={extras?.rows || [{ id: 1, name: '', events: '', retention: 15 }]}
        billingType={extras?.billingType || 'annual'}
        onAdd={extras?.onAdd || (() => {})}
        onRemove={extras?.onRemove || (() => {})}
        onRowChange={extras?.onRowChange || (() => {})}
        showPricing={showPricing}
      />
    );
  }

  function handleChange(e) {
    onChange(e.target.value);
  }

  function renderPrice() {
    let content;
    if (monthlyCost !== null && monthlyCost > 0 && value !== '' && value !== null && value !== undefined) {
      content = formatCurrency(monthlyCost);
    } else {
      content = '—';
    }

    return (
      <div
        style={{
          width: 140,
          textAlign: 'right',
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
        }}
        className={!showPricing ? 'blurred' : undefined}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 0',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      {/* Label area */}
      <div style={{ flexGrow: 1, minWidth: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontWeight: 500 }}>{label}</span>
          {tooltip && <Tooltip text={tooltip} />}
        </div>
        {pricingNote && (
          <div style={{ fontSize: 12, color: '#9b9b9b', marginTop: 2 }}>{pricingNote}</div>
        )}
      </div>

      {/* Input area */}
      <div style={{ width: 160 }}>
        {inputType === 'select' ? (
          <select value={value} onChange={handleChange} style={{ width: '100%' }}>
            {options &&
              options.map((opt) => (
                <option key={opt.value ?? opt} value={opt.value ?? opt}>
                  {opt.label ?? opt}
                </option>
              ))}
          </select>
        ) : (
          <input
            type="number"
            min="0"
            step="1"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            style={{ width: '100%' }}
          />
        )}
      </div>

      {/* Unit label */}
      <div style={{ width: 120, color: '#6b6b6b', fontSize: 13 }}>{unit}</div>

      {/* Price display */}
      {renderPrice()}
    </div>
  );
}
