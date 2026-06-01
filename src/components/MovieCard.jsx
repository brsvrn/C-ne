import React, { useState } from "react";
import { C } from "../utils/theme";
import { IMG } from "../utils/tmdb";

export default function MovieCard({ item, onClick, size = "md", watched = false }) {
  const [hov, setHov] = useState(false);
  const w = size === "sm" ? 110 : size === "lg" ? 170 : 130;
  const h = Math.round(w * 1.5);
  const img = IMG(item.poster_path);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "?";
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);

  return (
    <div
      onClick={() => onClick?.(item)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flexShrink: 0, width: w, cursor: "pointer",
        transform: hov ? "scale(1.04) translateY(-4px)" : "scale(1)",
        transition: "transform 0.25s cubic-bezier(.22,1,.36,1)",
      }}
    >
      <div style={{
          position: "relative", borderRadius: 10, overflow: "hidden", height: h, background: C.card,
          boxShadow: hov ? `0 16px 40px rgba(0,0,0,0.6), 0 0 0 1px ${C.accent}55` : "0 4px 16px rgba(0,0,0,0.4)",
          transition: "box-shadow 0.25s",
        }}
      >
        {img ? (
          <img src={img} alt={item.title || item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🎬</div>
        )}

        {watched && (
          <div style={{ position: "absolute", top: 6, left: 6, background: C.accent, borderRadius: 4, padding: "2px 5px", fontSize: 9, fontWeight: 700, color: "#0a0806" }}>
            ✓ İZLENDİ
          </div>
        )}

        <div style={{ position: "absolute", inset: 0, background: hov ? "linear-gradient(to top, rgba(0,0,0,0.85) 40%, transparent 70%)" : "linear-gradient(to top, rgba(0,0,0,0.55) 20%, transparent 60%)", transition: "background 0.25s" }}>
          <div style={{ position: "absolute", bottom: 7, left: 7 }}>
            <div style={{ background: `${C.accent}cc`, color: "#0a0806", borderRadius: 4, padding: "1px 5px", fontSize: 11, fontWeight: 700, display: "inline-block" }}>
              ★ {rating}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "6px 2px 0" }}>
        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.title || item.name}
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{year}</div>
      </div>
    </div>
  );
}
