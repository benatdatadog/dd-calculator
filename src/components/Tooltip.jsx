import React, { useState, useRef, useId } from "react";

export default function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);
  const [flipLeft, setFlipLeft] = useState(false);
  const wrapperRef = useRef(null);
  const tooltipId = useId();

  function show() {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const spaceOnRight = window.innerWidth - rect.right;
      setFlipLeft(spaceOnRight < 340);
    }
    setVisible(true);
  }

  function hide() {
    setVisible(false);
  }

  const wrapperStyle = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
  };

  const popupStyle = {
    position: "absolute",
    top: "calc(100% + 10px)",
    ...(flipLeft
      ? { right: 0 }
      : { left: 0 }),
    minWidth: 240,
    maxWidth: 320,
    background: "#fff",
    boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
    borderRadius: 6,
    padding: "10px 12px",
    fontSize: 13,
    lineHeight: 1.5,
    zIndex: 1000,
    color: "#1a1a2e",
    pointerEvents: "none",
    whiteSpace: "normal",
    wordBreak: "break-word",
  };

  const arrowStyle = {
    position: "absolute",
    top: -6,
    ...(flipLeft
      ? { right: 10 }
      : { left: 10 }),
    width: 0,
    height: 0,
    borderLeft: "6px solid transparent",
    borderRight: "6px solid transparent",
    borderBottom: "6px solid #fff",
    filter: "drop-shadow(0 -1px 1px rgba(0,0,0,0.08))",
  };

  const trigger = children ?? (
    <button
      type="button"
      className="tooltip-icon"
      aria-label="More information"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: "#7c3aed",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1,
        padding: 0,
        flexShrink: 0,
      }}
    >
      ?
    </button>
  );

  return (
    <div
      ref={wrapperRef}
      style={wrapperStyle}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      aria-describedby={visible ? tooltipId : undefined}
    >
      {trigger}
      {visible && (
        <div id={tooltipId} role="tooltip" style={popupStyle}>
          <div style={arrowStyle} />
          {text}
        </div>
      )}
    </div>
  );
}
