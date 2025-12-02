import React, { useEffect, useState, useContext } from "react";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import SettingsRow from "../components/SettingsRow";
import ConfirmOverlay from "../components/ConfirmOverlay";
import { AuthContext } from "../context/AuthContext"; 

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();

  const { logout, deleteAccount } = useContext(AuthContext);

  const [email, setEmail] = useState("andy.cabindol@gmail.com");
  const [showDelete, setShowDelete] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    if (location.state?.updatedEmail) {
      setEmail(location.state.updatedEmail);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  const handleChangeEmail = () =>
    navigate("/app/settings/email", { state: { email } });

  const handleChangePassword = () => navigate("/app/settings/password");
  
  const handleConfirmDelete = async () => {
    try {
      await deleteAccount(); 
      setShowDelete(false);
      navigate('/'); 
      console.log("Account deleted");
    } catch (error) {
      alert("Failed to delete account: " + error);
    }
  };

  const handleConfirmLogout = () => {
    setShowLogout(false);
    
    logout(); 
    navigate('/'); 
  };

  return (
    <div className="page">
      <header className="topbar">
        <button className="back" aria-label="Back" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="title">Settings</h1>
        <span className="spacer" />
      </header>

      <div className="list">
        <SettingsRow
          icon={Mail}
          title="Change email"
          value={email}
          onClick={handleChangeEmail}
        />
        <SettingsRow
          icon={Lock}
          title="Change password"
          onClick={handleChangePassword}
        />
      </div>

      <div className="list">
        <SettingsRow
          title="Delete my account"
          destructive
          bold={false}
          showChevron={false}
          onClick={() => setShowDelete(true)}  
        />
        <SettingsRow
          title="Logout"
          destructive
          showChevron={false}
          onClick={() => setShowLogout(true)}
        />
      </div>

      <ConfirmOverlay
        open={showDelete}
        title="Are you sure you want to delete your account?"
        subtitle="Your account cannot be recovered once deleted"
        confirmLabel="Delete my account"
        confirmDestructive
        confirmDisabled={false}
        onCancel={() => setShowDelete(false)}
        onConfirm={handleConfirmDelete}
      />

      <ConfirmOverlay
        open={showLogout}
        title="Are you sure you want to logout?"
        confirmLabel="Logout of my account"
        confirmDestructive={false}
        confirmDisabled={false}
        onCancel={() => setShowLogout(false)}
        onConfirm={handleConfirmLogout}
      />

      <style>{`
        :root { --text:#111; --muted:#6b6b6b; }
        .page { font-family: system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; background:#fff; color:var(--text); min-height:100vh; margin:0 auto; }
        .topbar { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; }
        .title { font-size:18px; font-weight:700; }
        .back { display:grid; place-items:center; border:none; background:transparent; cursor:pointer; }
        .list { background:#fff; margin-top:8px; }
        .row { width:100%; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 16px; background:#fff; border:none; cursor:pointer; text-align:left; }
        .row-left { display:flex; align-items:center; gap:12px; }
        .row-title { font-size:16px; }
        .row-right { display:flex; align-items:center; gap:8px; }
        .row-value { color:var(--muted); font-size:14px; max-width:52vw; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      `}</style>
    </div>
  );
}