import { calcLogIndex } from '../data/pricing.js';
import Tooltip from './Tooltip.jsx';

const RETENTION_OPTIONS = [3, 7, 15, 30, 45, 60, 90, 180];

const TOOLTIP = 'Log events kept in a searchable hot index. Priced per million events × retention tier. Add multiple rows if you use different retention periods for different log types (e.g. 7 days for debug, 30 days for audit). You still pay the $0.10/GB ingest charge on top of indexing.';

function fmt(n) {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 }) + '/mo';
}

const colStyle = {
  header: { fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: { padding: '5px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, background: '#fff', width: '100%' },
};

export default function LogIndexTable({ rows, billingType, onAdd, onRemove, onRowChange, showPricing }) {
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
      {/* Section heading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
        <span style={{ fontWeight: 500 }}>Log Indexes (Standard)</span>
        <Tooltip text={TOOLTIP} />
      </div>

      {/* Column headers */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid #f4f4f4' }}>
        <div style={{ ...colStyle.header, flex: 1 }}>Index name</div>
        <div style={{ ...colStyle.header, width: 130 }}>M Events/mo</div>
        <div style={{ ...colStyle.header, width: 110 }}>Retention</div>
        <div style={{ ...colStyle.header, width: 110, textAlign: 'right' }}>Cost/mo</div>
        <div style={{ width: 28 }} />
      </div>

      {/* Rows */}
      {rows.map((row) => {
        const cost = calcLogIndex(+row.events || 0, +row.retention || 15, billingType);
        const hasValue = row.events !== '' && +row.events > 0;

        return (
          <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="e.g. app-logs"
                value={row.name || ''}
                onChange={e => onRowChange(row.id, 'name', e.target.value)}
                style={colStyle.input}
              />
            </div>
            <div style={{ width: 130 }}>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={row.events}
                onChange={e => onRowChange(row.id, 'events', e.target.value)}
                style={colStyle.input}
              />
            </div>
            <div style={{ width: 110 }}>
              <select
                value={row.retention}
                onChange={e => onRowChange(row.id, 'retention', +e.target.value)}
                style={{ ...colStyle.input, width: '100%' }}
              >
                {RETENTION_OPTIONS.map(d => (
                  <option key={d} value={d}>{d} days</option>
                ))}
              </select>
            </div>
            <div
              style={{ width: 110, textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#632ca6' }}
              className={!showPricing ? 'blurred' : undefined}
            >
              {hasValue ? fmt(cost) : <span style={{ color: '#ccc', fontWeight: 400 }}>—</span>}
            </div>
            <button
              onClick={() => onRemove(row.id)}
              disabled={rows.length === 1}
              title="Remove index"
              style={{
                width: 28, height: 28, flexShrink: 0,
                borderRadius: '50%',
                background: rows.length === 1 ? '#fafafa' : '#f5f5f5',
                border: '1px solid #e0e0e0',
                cursor: rows.length === 1 ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, lineHeight: 1, padding: 0,
                color: rows.length === 1 ? '#ddd' : '#aaa',
              }}
            >
              ×
            </button>
          </div>
        );
      })}

      {/* Add row */}
      <button
        onClick={onAdd}
        style={{
          marginTop: 6,
          fontSize: 13,
          color: '#632ca6',
          background: 'none',
          border: '1px dashed #c4a8e0',
          borderRadius: 6,
          padding: '5px 14px',
          cursor: 'pointer',
        }}
      >
        + Add Index
      </button>
    </div>
  );
}
