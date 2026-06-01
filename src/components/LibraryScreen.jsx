import React, { useState } from "react";
import { C } from "../utils/theme";
import MovieCard from "./MovieCard";

export default function LibraryScreen({ history, watchlist, onCard }) {
  const [activeTab, setActiveTab] = useState("history");

  const items = activeTab === "history" ? history : watchlist;

  return (
    <div style={{ padding: "20px 20px 100px" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button 
          onClick={() => setActiveTab("history")}
          style={{ 
            flex: 1, padding: "12px", borderRadius: 12, border: "none", 
            background: activeTab === "history" ? C.accent : C.card, 
            color: activeTab === "history" ? "#000" : C.muted, 
            fontWeight: 600, cursor: "pointer", transition: "all 0.2s" 
          }}
        >
          İzlediklerim ({history.length})
        </button>
        <button 
          onClick={() => setActiveTab("watchlist")}
          style={{ 
            flex: 1, padding: "12px", borderRadius: 12, border: "none", 
            background: activeTab === "watchlist" ? C.accent : C.card, 
            color: activeTab === "watchlist" ? "#000" : C.muted, 
            fontWeight: 600, cursor: "pointer", transition: "all 0.2s" 
          }}
        >
          Listem ({watchlist.length})
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {items.length === 0 ? (
           <div style={{ color: C.muted, textAlign: "center", width: "100%", marginTop: 40 }}>
             {activeTab === "history" ? "Henüz bir şey izlemediniz." : "Listeniz boş."}
           </div>
        ) : (
          items.map(item => (
            <MovieCard 
              key={item.id} 
              item={item} 
              size="sm" 
              onClick={onCard} 
              watched={activeTab === "history"} 
            />
          ))
        )}
      </div>
    </div>
  );
}
