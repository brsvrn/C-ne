import React, { useState, useEffect } from "react";
import HorizontalShelf from "./HorizontalShelf";
import { tmdb } from "../utils/tmdb";

export default function HomeScreen({ onCard, watchedIds }) {
  const [trending, setTrending] = useState([]);
  const [popularTV, setPopularTV] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      tmdb("/trending/all/week"),
      tmdb("/tv/popular")
    ])
    .then(([trendRes, tvRes]) => {
      setTrending(trendRes.results || []);
      setPopularTV(tvRes.results || []);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "20px 20px 100px" }}>
      <HorizontalShelf 
        title="Haftanın Trendleri" 
        badge="Popüler" 
        items={trending} 
        onCard={onCard} 
        loading={loading} 
        watchedIds={watchedIds} 
      />
      <HorizontalShelf 
        title="Popüler Diziler" 
        items={popularTV} 
        onCard={onCard} 
        loading={loading} 
        watchedIds={watchedIds} 
      />
    </div>
  );
}
