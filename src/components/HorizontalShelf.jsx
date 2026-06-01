import React from "react";
import SkeletonCard from "./SkeletonCard";
import MovieCard from "./MovieCard";

export default function HorizontalShelf({ title, items, onCard, loading, badge, watchedIds = new Set() }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700 }}>{title}</h2>
        {badge && <span className="tag">{badge}</span>}
      </div>
      <div className="shelf-scroll">
        {loading
          ? Array.from({ length: 7 }, (_, i) => <SkeletonCard key={i} />)
          : items.map((item) => (
              <div key={item.id} style={{ scrollSnapAlign: "start" }}>
                <MovieCard item={item} onClick={onCard} watched={watchedIds.has(item.id)} />
              </div>
            ))}
      </div>
    </section>
  );
}
