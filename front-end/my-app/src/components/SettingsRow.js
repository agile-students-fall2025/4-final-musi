// SettingsRow.js
import React from "react";
import { ChevronRight } from "lucide-react";

const SettingsRow = ({
  icon: Icon,
  title,
  value,
  onClick,
  destructive = false,
  showChevron = true,
  bold = true,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="row"
      style={{
        color: destructive ? "#C53B37" : "inherit",
      }}
    >
      <div className="row-left">
        {Icon && <Icon size={20} strokeWidth={2} />}
        <span
          className="row-title"
          style={{ fontWeight: bold ? 600 : 400 }} // control font weight
        >
          {title}
        </span>
      </div>

      <div className="row-right">
        {value && <span className="row-value">{value}</span>}
        {showChevron && <ChevronRight className="chev" size={20} />}
      </div>
    </button>
  );
};

export default SettingsRow;
