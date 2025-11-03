// src/components/ConfirmOverlay.js
import React, { useEffect, useRef } from "react";

export default function ConfirmOverlay({
  open,
  title,
  subtitle,
  confirmLabel = "Confirm",
  onCancel,
  onConfirm,
  confirmDestructive = false,
  confirmDisabled = false,
}) {
  const cardRef = useRef(null);

  // Close on ESC and lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onCancel?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="confirm-scrim"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="confirm-card"
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="confirm-title">{title}</h3>}
        {subtitle && <p className="confirm-subtitle">{subtitle}</p>}

        <div className="divider" />

        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>

        <div className="divider" />

        <button
          type="button"
          className={`btn-confirm ${confirmDestructive ? "destructive" : ""}`}
          disabled={confirmDisabled}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>

      <style>{`
        .confirm-scrim {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.6);
          display: grid;
          place-items: center;
          z-index: 999;
          padding: 20px;
        }
        .confirm-card {
        z-index: 1000;
          width: 100%;
          max-width: 400px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,.25);
          overflow: hidden;
          text-align: center;
        }
        .confirm-title {
          margin: 16px 16px 8px;
          font-size: 16px;
          font-weight: 700;
          color: #111;
        }
        .confirm-subtitle {
          margin: 0 16px 32px;
          font-size: 13px;
          color: #777;
        }
        .divider {
          height: 1px;
          background: #e9e9e9;
        }
        .btn-cancel,
        .btn-confirm {
          width: 100%;
          background: transparent;
          border: none;
          padding: 14px 16px;
          font-size: 15px;
          cursor: pointer;
        }
        .btn-cancel {
          font-weight: 600;
          color: #111;
        }
        .btn-confirm {
          color: #b0b0b0; /* default muted (like your mock) */
          font-weight: 500;
        }
        .btn-confirm.destructive:not(:disabled) {
          color: #C53B37; /* destructive red when enabled */
          font-weight: 600;
        }
        .btn-confirm:disabled {
          cursor: default;
          opacity: .6;
        }
      `}</style>
    </div>
  );
}
