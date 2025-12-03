// src/pages/UpdateEmail.js
import React, { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function UpdateEmail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const incomingEmail = state?.email ?? "";

  const [value, setValue] = useState(incomingEmail);
  const [touched, setTouched] = useState(false);

  const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    [value]
  );
  const isDirty = value.trim() !== incomingEmail.trim();
  const canSave = isValidEmail && isDirty;

  const handleSave = async () => {
    if (!canSave) return;
    try {
      await axios.put("/api/auth/email", { email: value.trim() });
      navigate("/app/settings", {
        replace: true,
        state: { updatedEmail: value.trim() },
      });
    } catch (e) {
      alert("Failed to update email. Please try again.");
    }
  };

  return (
    <div className="page">
      <header className="bar">
        <button className="cancel" onClick={() => navigate(-1)}>Cancel</button>
        <h1 className="title">Update email</h1>
        <span className="spacer" />
      </header>

      <div className="field-wrap">
        <div className="input-row">
          <input
            type="email"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="name@email.com"
            className="email-input"
          />
          {!!value && (
            <button className="clear" aria-label="Clear email" onClick={() => setValue("")}>
              <X size={18} />
            </button>
          )}
        </div>
        <div className="underline" />
        {touched && !isValidEmail && (
          <p className="hint">Please enter a valid email address.</p>
        )}
      </div>

      <button className="save" disabled={!canSave} onClick={handleSave}>
        Save
      </button>

      <style>{`
        .page { font-family: system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; min-height:100vh; background:#fff; color:#111; margin:0 auto; padding-bottom:24px; }
        .bar { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; padding:14px 16px 8px; }
        .cancel { justify-self:start; background:transparent; border:none; padding:0; color:#111; font-size:16px; cursor:pointer; }
        .title { margin:24px 0; font-size:18px; font-weight:700; text-align:center; }
        .spacer { width:24px; }
        .field-wrap { padding:8px 16px 0; }
        .input-row { display:grid; grid-template-columns:1fr auto; align-items:center; gap:8px; }
        .email-input { width:100%; border:none; outline:none; font-size:16px; padding:10px 0 6px; background:transparent; }
        .clear { border:none; background:transparent; padding:4px; color:#8a8a8a; cursor:pointer; }
        .underline { height:1px; background:#e5e5e5; margin-top:6px; }
        .hint { color:#c53b37; font-size:13px; margin:6px 0 0; }
        .save { position:fixed; left:50%; transform:translateX(-50%); bottom:32px; width:calc(100% - 32px);  border:none; border-radius:14px; padding:14px 18px; font-weight:600; font-size:16px; background:#000; color:#fff; cursor:pointer; }
        .save:disabled { opacity:.35; cursor:default; }
      `}</style>
    </div>
  );
}
