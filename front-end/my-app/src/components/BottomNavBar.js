import React, { useState } from "react";
import "./BottomNavBar.css";

const navItems = ["Feed", "Your lists", "Search", "Leaderboard", "Profile"];

const BottomNavBar = () => {
  const [active, setActive] = useState("Feed");

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item}
          onClick={() => setActive(item)}
          className={active === item ? "nav-button active" : "nav-button"}
        >
          {item}
        </button>
      ))}
    </nav>
  );
};


export default BottomNavBar;
