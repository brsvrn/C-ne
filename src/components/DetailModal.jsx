import React, { useState, useEffect } from "react";
import { C } from "../utils/theme";
import { IMG, tmdb } from "../utils/tmdb";
import MovieCard from "./MovieCard";

export default function DetailModal({ item, onClose, onWatch, onWatchlist, watched, inWatchlist }) {
  const [details, setDetails] = useState(null);
  const [tab, setTab] = useState("overview");
  const isTV = !!item.first_air_date || item.media_type === "tv";

  useEffect(() => {
    const type = isTV ? "tv" : "movie";
    tmdb(`/${type}/${item.id}`, { append_to_response: "credits,videos,similar" })
      .then(setDetails)
      .catch(console.error);
  }, [item.id, isTV]);

  const backdropUrl = item.backdrop_path ? IMG(item.backdrop_path, "original") : null;
  const posterUrl = IMG(item.poster_path);
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const rating = item.vote_average?.toFixed(1);
  const genres = (details?.genres || []).map((g) => g.name).join(", ");
  const runtime = details?.runtime ? `${Math.floor(details.runtime / 60)}s ${details.runtime % 60}dk` : details?.episode_run_time?.[0] ? `~${details.episode_run_time[0]}dk/bölüm` : null;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(8px)"
    }}>
      <div onClick={(e) => e.stopPropagation()} className="fade-up" style={{
        width: "100%", maxWidth: 520, maxHeight: "92vh", overflowY: "auto",
        background: C.surface, borderRadius: "20px 20px 0 0", border: `1px solid ${C.border}`, borderBottom: "none", paddingBottom: 80
      }}>
        {/* Kapak Görseli (Hero) */}
        <div style={{ position: "relative", height: 220, overflow: "hidden", borderRadius: "20px 20px 0 0" }}>
          {backdropUrl ? (
            <img src={backdropUrl} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} alt="Backdrop" />
          ) : <div style={{ width: "100%", height: "100%", background: C.border }} />}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${C.surface} 5%, transparent 90%)` }} />
          <button onClick={onClose} style={{
            position: "absolute", top: 14, right: 14, background: "rgba(0,0,0,0.5)", color: "#fff",
            border: "none", width: 32, height: 32, borderRadius: 16, cursor: "pointer", backdropFilter: "blur(4px)"
          }}>✕</button>
        </div>

        {/* Detay Bilgileri */}
        <div style={{ padding: "0 20px", marginTop: -60, position: "relative" }}>
          <div style={{ display: "flex", gap: 16 }}>
            <img src={posterUrl} style={{ width: 100, height: 150, borderRadius: 12, objectFit: "cover", boxShadow: "0 8px 24px rgba(0,0,0,0.6)" }} alt="Poster" />
            <div style={{ paddingTop: 60 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>{title}</h2>
              <div style={{ fontSize: 13, color: C.muted, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span>{year}</span>
                {runtime && <><span className="dot-sep">•</span><span>{runtime}</span></>}
                <><span className="dot-sep">•</span><span style={{ color: C.accent, fontWeight: 700 }}>★ {rating}</span></>
              </div>
            </div>
          </div>

          {/* Butonlar */}
          <div style={{ display: "flex", gap: 10, marginTop: 24, marginBottom: 24 }}>
            <button onClick={() => onWatch(item)} className={watched ? "btn-ghost" : "btn-accent"} style={{ flex: 1, display: "flex", justifyContent: "center", gap: 8 }}>
              {watched ? "✓ İzlendi" : "▶ İzledim"}
            </button>
            <button onClick={() => onWatchlist(item)} className="btn-ghost" style={{ flex: 1, display: "flex", justifyContent: "center", gap: 8, borderColor: inWatchlist ? C.accent : C.border, color: inWatchlist ? C.accent : C.muted }}>
              {inWatchlist ? "✓ Listede" : "+ Listeye Ekle"}
            </button>
          </div>

          {/* Konu Özeti */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 8, color: C.accent }}>Özet</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: C.text, opacity: 0.9 }}>
              {item.overview ? item.overview : "Bu içerik için henüz Türkçe özet bulunmuyor."}
            </p>
            {genres && <div style={{ marginTop: 12, fontSize: 12, color: C.muted }}><strong>Tür:</strong> {genres}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
