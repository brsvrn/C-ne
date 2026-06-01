import React from "react";
import { C } from "../utils/theme";

export default function BottomNav({ tab, setTab, onChat }) {
  const navItems = [
    { id: "home", icon: "🏠", label: "Ana Sayfa" },
    { id: "search", icon: "🔍", label: "Keşfet" },
    { id: "library", icon: "📚", label: "Kütüphane" }
  ];

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: `linear-gradient(to top, ${C.bg} 80%, transparent)`,
      padding: "20px 20px 30px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      zIndex: 50
    }}>
      <div className="glass" style={{
        display: "flex",
        gap: 8,
        padding: "8px",
        borderRadius: 24,
        width: "100%",
        maxWidth: 320,
        margin: "0 auto"
      }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            style={{
              flex: 1,
              background: tab === item.id ? `${C.accent}22` : "transparent",
              color: tab === item.id ? C.accent : C.muted,
              border: "none",
              padding: "10px 0",
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600 }}>{item.label}</span>
          </button>
        ))}
        
        {/* AI Chat Button */}
        <button
          onClick={onChat}
          style={{
            flex: 1,
            background: `linear-gradient(135deg, ${C.accent}, #e85d75)`,
            color: "#fff",
            border: "none",
            padding: "10px 0",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: `0 4px 12px ${C.accent}44`
          }}
        >
          <span style={{ fontSize: 20 }}>✨</span>
          <span style={{ fontSize: 10, fontWeight: 700 }}>CineAI</span>
        </button>
      </div>
    </div>
  );
}
