import React, { useState, useRef } from "react";

const PURPLE = "#632CA6";

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    backgroundColor: PURPLE,
    color: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    padding: "12px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logo: {
    width: 40,
    height: 40,
    flexShrink: 0,
  },
  titleBlock: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    lineHeight: 1.2,
  },
  subtitle: {
    margin: 0,
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    fontWeight: 400,
    lineHeight: 1.4,
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  buttonGroup: {
    display: "flex",
    borderRadius: 6,
    overflow: "hidden",
    border: "1px solid #fff",
  },
  groupBtn: (active) => ({
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    border: "none",
    outline: "none",
    backgroundColor: active ? "#fff" : "transparent",
    color: active ? PURPLE : "#fff",
    transition: "background-color 0.15s, color 0.15s",
    lineHeight: 1.4,
  }),
  revealBtn: {
    padding: "6px 16px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    borderRadius: 6,
    border: "1px solid #fff",
    backgroundColor: "transparent",
    color: "#fff",
    transition: "background-color 0.15s, color 0.15s",
    lineHeight: 1.4,
  },
};

const DogLogo = () => (
  <svg
    style={styles.logo}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Datadog logo"
  >
    {/* Simple stylised dog head */}
    <circle cx="20" cy="19" r="12" fill="white" />
    {/* Left ear */}
    <ellipse cx="11" cy="11" rx="5" ry="7" fill="white" transform="rotate(-20 11 11)" />
    {/* Right ear */}
    <ellipse cx="29" cy="11" rx="5" ry="7" fill="white" transform="rotate(20 29 11)" />
    {/* Eyes */}
    <circle cx="16" cy="18" r="2" fill={PURPLE} />
    <circle cx="24" cy="18" r="2" fill={PURPLE} />
    {/* Nose */}
    <ellipse cx="20" cy="23" rx="2.5" ry="1.5" fill={PURPLE} />
  </svg>
);

const ButtonGroup = ({ options, value, onChange }) => (
  <div style={styles.buttonGroup}>
    {options.map((opt) => (
      <button
        key={opt.value}
        style={styles.groupBtn(value === opt.value)}
        onClick={() => onChange(opt.value)}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const BILLING_OPTIONS = [
  { label: "Annual", value: "annual" },
  { label: "M2M",    value: "m2m" },
];

const PRICE_LEVEL_OPTIONS = [
  { label: "Rep",      value: "rep" },
  { label: "Manager",  value: "manager" },
  { label: "Director", value: "director" },
];

const Header = ({
  billingType,
  onBillingTypeChange,
  priceLevel,
  onPriceLevelChange,
  showPricing,
  onReveal,
  onHide,
  onCopyLink,
  copied,
  onReset,
  ap2,
  onAp2Change,
}) => {
  const [confirming, setConfirming] = useState(false)
  const cancelTimer = useRef(null)

  const handleResetClick = () => {
    if (confirming) {
      clearTimeout(cancelTimer.current)
      setConfirming(false)
      onReset()
    } else {
      setConfirming(true)
      cancelTimer.current = setTimeout(() => setConfirming(false), 3000)
    }
  }

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <DogLogo />
        <div style={styles.titleBlock}>
          <h1 style={styles.title}>Datadog Pricing Calculator</h1>
          <p style={styles.subtitle}>Estimate your monthly Datadog spend</p>
        </div>
      </div>

      <div style={styles.right}>
        <ButtonGroup
          options={BILLING_OPTIONS}
          value={billingType}
          onChange={onBillingTypeChange}
        />
        <ButtonGroup
          options={PRICE_LEVEL_OPTIONS}
          value={priceLevel}
          onChange={onPriceLevelChange}
        />
        <button
          style={{
            ...styles.revealBtn,
            backgroundColor: ap2 ? "#fff" : "transparent",
            color: ap2 ? PURPLE : "#fff",
            fontWeight: ap2 ? 700 : 500,
          }}
          onClick={() => onAp2Change(!ap2)}
          title="Apply 1.20× AP2 (Australia / UK) pricing"
        >
          AP2
        </button>
        <button
          style={styles.revealBtn}
          onClick={onCopyLink}
          title="Copy a shareable link to this estimate"
        >
          {copied ? "✓ Copied!" : "Share"}
        </button>
        <button style={styles.revealBtn} onClick={showPricing ? onHide : onReveal}>
          {showPricing ? "Hide Pricing" : "Reveal Pricing"}
        </button>
        <button
          style={{
            ...styles.revealBtn,
            borderColor: confirming ? "#ff6b6b" : "rgba(255,255,255,0.5)",
            color: confirming ? "#ff6b6b" : "rgba(255,255,255,0.75)",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onClick={handleResetClick}
          title="Clear all values and start fresh"
        >
          {confirming ? "Confirm reset?" : "Reset"}
        </button>
      </div>
    </header>
  );
};

export default Header;
