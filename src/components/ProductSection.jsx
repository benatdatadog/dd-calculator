import { useState } from "react";
import SkuInput from "./SkuInput";

export default function ProductSection({
  group,
  values,
  onChange,
  costs,
  groupTotal,
  showPricing,
  defaultOpen,
  skuExtras,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const formatTotal = () => {
    if (showPricing && groupTotal > 0) {
      return (
        <span style={{ color: "#7c3aed", fontWeight: 600 }}>
          ${groupTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo
        </span>
      );
    }
    if (showPricing) {
      return <span style={{ color: "#6b7280" }}>—</span>;
    }
    return (
      <span
        style={{
          filter: "blur(4px)",
          userSelect: "none",
          color: "#7c3aed",
          fontWeight: 600,
        }}
      >
        $XXX/mo
      </span>
    );
  };

  return (
    <div className="product-section" data-open={isOpen}>
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          padding: "12px 16px",
          userSelect: "none",
        }}
      >
        <span
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: group.color,
            flexShrink: 0,
          }}
        />
        <span style={{ fontWeight: 600, fontSize: "16px" }}>
          {group.icon} {group.label}
        </span>
        <span style={{ flexGrow: 1 }} />
        {formatTotal()}
        <span
          style={{
            display: "inline-block",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            fontSize: "12px",
            color: "#6b7280",
            marginLeft: "8px",
          }}
        >
          ▾
        </span>
      </div>
      <div
        style={{
          overflow: "hidden",
          maxHeight: isOpen ? "2000px" : "0",
          transition: "max-height 0.3s ease",
        }}
      >
        {isOpen &&
          group.skus.map((sku) => (
            <SkuInput
              key={sku.id}
              sku={sku}
              value={values[sku.id] ?? ""}
              onChange={(value) => onChange(sku.id, value)}
              monthlyCost={costs[sku.id]}
              showPricing={showPricing}
              extras={skuExtras?.[sku.id]}
            />
          ))}
      </div>
    </div>
  );
}
