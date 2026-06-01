import React, { useState, useEffect } from "react";
import { C } from "../utils/theme";
import { tmdb } from "../utils/tmdb";
import MovieCard from "./MovieCard";
import SkeletonCard from "./SkeletonCard";

export default function SearchScreen({ onCard, watchedIds }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      tmdb("/search/multi", { query })
        .then(res => {
          const filtered = (res.results || []).filter(item => item.poster_path && (item.media_type === "movie" || item.media_type === "tv"));
          setResults(filtered);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div style={{ padding: "20px 20px 100px" }}>
      <input
        type="text"
        placeholder="Film veya dizi ara..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%", padding: "14px 16px", borderRadius: 12, border: `1px solid ${C.border}`,
          background: C.card, color: C.text, fontSize: 16, marginBottom: 20, outline: "none"
        }}
      />
      
      {loading ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {results.map(item => (
            <MovieCard key={item.id} item={item} size="sm" onClick={onCard} watched={watchedIds.has(item.id)} />
          ))}
          {query.length >= 3 && results.length === 0 && (
             <div style={{ color: C.muted, textAlign: "center", width: "100%", marginTop: 40 }}>Sonuç bulunamadı.</div>
          )}
        </div>
      )}
    </div>
  );
}
