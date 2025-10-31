import "./TabButton.css";

function TabButton({ title, count, isActive, onClick }) {
  const className = `tab-button ${isActive ? 'active' : ''}`;
  return (
    <button
      onClick={onClick}
      className={className}
    >
      <span className="tab-count">{count}</span>
      {title}
    </button>
  );
}

export default TabButton;