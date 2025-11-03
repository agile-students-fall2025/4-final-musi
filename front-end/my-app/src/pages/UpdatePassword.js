import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UpdatePassword() {
  const navigate = useNavigate();

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [touched, setTouched] = useState({ new: false, confirm: false });

  // Requirements: 8–20 chars, at least one letter, one number, one special
  const lengthOK = newPwd.length >= 8 && newPwd.length <= 20;
  const hasLetter = /[A-Za-z]/.test(newPwd);
  const hasNumber = /\d/.test(newPwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPwd);
  const meetsPolicy = lengthOK && hasLetter && hasNumber && hasSpecial;

  const matchesConfirm = newPwd === confirmPwd;
  const differentFromCurrent = newPwd.length > 0 && newPwd !== currentPwd;

  const canSave = useMemo(
    () => currentPwd && meetsPolicy && matchesConfirm && differentFromCurrent,
    [currentPwd, meetsPolicy, matchesConfirm, differentFromCurrent]
  );

  const handleSave = () => {
    if (!canSave) return;
    // TODO: call your API to update the password here
    navigate("/settings", {
      replace: true,
      state: { passwordUpdated: true },
    });
  };

  return (
    <div className="page">
      <header className="bar">
        <button className="cancel" onClick={() => navigate(-1)}>Cancel</button>
        <h1 className="title">Change password</h1>
        <span className="spacer" />
      </header>

      <div className="field-wrap">
        {/* Current password */}
        <div className="input-row">
          <input
            type="password"
            value={currentPwd}
            onChange={(e) => setCurrentPwd(e.target.value)}
            placeholder="Current password"
            className="text-input"
          />
        </div>
        <div className="underline" />

        {/* New password */}
        <div className="input-row">
          <input
            type="password"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, new: true }))}
            placeholder="New password"
            className="text-input"
          />
        </div>
        <div className="underline" />

        {/* Confirm */}
        <div className="input-row">
          <input
            type="password"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
            placeholder="Confirm new password"
            className="text-input"
          />
        </div>
        <div className="underline" />

        <div className="hints">
          <p className="hint-title">Your password must have:</p>
          <ul className="hint-list">
            <li className={lengthOK ? "ok" : ""}>8 to 20 characters</li>
            <li className={hasLetter && hasNumber && hasSpecial ? "ok" : ""}>
              Letters, numbers, and special characters
            </li>
          </ul>
          {touched.new && !meetsPolicy && (
            <p className="hint-error">New password doesn’t meet requirements.</p>
          )}
          {touched.confirm && !matchesConfirm && (
            <p className="hint-error">Passwords do not match.</p>
          )}
          {newPwd && currentPwd && !differentFromCurrent && (
            <p className="hint-error">New password must be different from current.</p>
          )}
        </div>
      </div>

      <button className="save" disabled={!canSave} onClick={handleSave}>
        Save
      </button>

      <style>{`
        .page { font-family: system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; min-height:100vh; background:#fff; color:#111; margin:0 auto; padding-bottom:24px; }
        .bar { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; padding:14px 16px 8px; }
        .cancel { justify-self:start; background:transparent; border:none; padding:0; color:#111; font-size:16px; cursor:pointer; }
        .title { margin:24px; font-size:18px; font-weight:700; text-align:center; }
        .spacer { width:24px; }

        .field-wrap { padding:8px 16px 0; display: flex; flex-direction: column; gap: 16px;}
        .input-row { display:grid; grid-template-columns:1fr; align-items:center; }
        .text-input { width:100%; border:none; outline:none; font-size:16px; padding:10px 0 6px; background:transparent; }
        .underline { height:1px; background:#e5e5e5; margin-top:6px; }

        .hints { margin-top:16px; text-align: left; margin-bottom: 32px;}
        .hint-title { font-weight:600; font-size:14px; margin:0 0 6px; color:#333; }
        .hint-list { margin:0; padding-left:18px; color:#6b6b6b; font-size:14px; }
        .hint-list li.ok { color:#2f7a3e; } /* "ok" turns green-ish */
        .hint-error { margin:8px 0 0; color:#c53b37; font-size:13px; }

        .save { width:calc(100% - 32px); border:none; border-radius:14px; padding:14px 18px; font-weight:600; font-size:16px; background:#000; color:#fff; cursor:pointer; }
        .save:disabled { opacity:.35; cursor:default; }
      `}</style>
    </div>
  );
}
