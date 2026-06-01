import { useState, useEffect, useRef, useCallback } from "react";

// ── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg:        "#080810",
  surface:   "#0e0e1a",
  card:      "#13131f",
  border:    "#1e1e30",
  accent:    "#e8b86d",
  accentDim: "#e8b86d33",
  red:       "#e85d75",
  text:      "#f0eee8",
  muted:     "#7a7890",
};

const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap";

const GLOBAL_CSS = `
  @import url('${FONT_LINK}');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    background: ${C.bg};
    color: ${C.text};
    font-family: 'DM Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
  input, textarea, button { font-family: inherit; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }

  .fade-up { animation: fadeUp 0.45s cubic-bezier(.22,1,.36,1) both; }

  .shimmer-bg {
    background: linear-gradient(90deg, ${C.card} 25%, ${C.border} 50%, ${C.card} 75%);
    background-size: 400px 100%;
    animation: shimmer 1.4s infinite;
  }
  .glass {
    background: rgba(14,14,26,0.82);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 1px solid ${C.border};
  }
  .btn-accent {
    background: ${C.accent};
    color: #0a0806;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-accent:hover { filter: brightness(1.12); transform: translateY(-1px); }
  .btn-ghost {
    background: transparent;
    color: ${C.muted};
    border: 1px solid ${C.border};
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-ghost:hover { border-color: ${C.accent}; color: ${C.accent}; }
  .tag {
    display: inline-block;
    background: ${C.accentDim};
    color: ${C.accent};
    border: 1px solid #e8b86d44;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .dot-sep { color: ${C.muted}; margin: 0 6px; }

  /* Hide scrollbar on shelves but keep scrollable */
  .shelf-scroll {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 8px;
    scroll-snap-type: x mandatory;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .shelf-scroll::-webkit-scrollbar { display: none; }
`;

// ── TMDB ──────────────────────────────────────────────────────────────────
// TMDB anahtarı .env dosyasına koyabilirsin: VITE_TMDB_KEY=senin_anahtarın
// Yoksa aşağıdaki demo anahtar çalışır (rate limit var)
const TMDB_KEY = import.meta.env.VITE_TMDB_KEY || "3fd2be6f0c70a2a598f084ddfb75487c";
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG = (p, s = "w500") =>
  p ? `https://image.tmdb.org/t/p/${s}${p}` : null;

async function tmdb(path, params = {}) {
  const q = new URLSearchParams({ api_key: TMDB_KEY, language: "tr-TR", ...params });
  const r = await fetch(`${TMDB_BASE}${path}?${q}`);
  if (!r.ok) throw new Error(`TMDB ${r.status}: ${path}`);
  return r.json();
}

// ── LocalStorage ──────────────────────────────────────────────────────────
const LS = {
  get: (k, d = null) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }
    catch { return d; }
  },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ── SkeletonCard ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", flexShrink: 0, width: 130 }}>
      <div className="shimmer-bg" style={{ height: 195, borderRadius: 10 }} />
      <div className="shimmer-bg" style={{ height: 12, borderRadius: 4, margin: "8px 2px 4px" }} />
      <div className="shimmer-bg" style={{ height: 10, borderRadius: 4, margin: "0 2px", width: "60%" }} />
    </div>
  );
}

// ── MovieCard ─────────────────────────────────────────────────────────────
function MovieCard({ item, onClick, size = "md", watched = false }) {
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
        flexShrink: 0,
        width: w,
        cursor: "pointer",
        transform: hov ? "scale(1.04) translateY(-4px)" : "scale(1)",
        transition: "transform 0.25s cubic-bezier(.22,1,.36,1)",
      }}
    >
      <div
        style={{
          position: "relative",
          borderRadius: 10,
          overflow: "hidden",
          height: h,
          background: C.card,
          boxShadow: hov
            ? `0 16px 40px rgba(0,0,0,0.6), 0 0 0 1px ${C.accent}55`
            : "0 4px 16px rgba(0,0,0,0.4)",
          transition: "box-shadow 0.25s",
        }}
      >
        {img ? (
          <img
            src={img}
            alt={item.title || item.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
            🎬
          </div>
        )}

        {watched && (
          <div
            style={{
              position: "absolute", top: 6, left: 6,
              background: C.accent, borderRadius: 4,
              padding: "2px 5px", fontSize: 9, fontWeight: 700, color: "#0a0806",
            }}
          >
            ✓ İZLENDİ
          </div>
        )}

        <div
          style={{
            position: "absolute", inset: 0,
            background: hov
              ? "linear-gradient(to top, rgba(0,0,0,0.85) 40%, transparent 70%)"
              : "linear-gradient(to top, rgba(0,0,0,0.55) 20%, transparent 60%)",
            transition: "background 0.25s",
          }}
        >
          <div style={{ position: "absolute", bottom: 7, left: 7 }}>
            <div
              style={{
                background: `${C.accent}cc`, color: "#0a0806",
                borderRadius: 4, padding: "1px 5px",
                fontSize: 11, fontWeight: 700, display: "inline-block",
              }}
            >
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

// ── HorizontalShelf ───────────────────────────────────────────────────────
function HorizontalShelf({ title, items, onCard, loading, badge, watchedIds = new Set() }) {
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

// ── DetailModal ───────────────────────────────────────────────────────────
function DetailModal({ item, onClose, onWatch, onWatchlist, watched, inWatchlist }) {
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

  const trailer = details?.videos?.results?.find((v) => v.type === "Trailer" && v.site === "YouTube");
  const cast = details?.credits?.cast?.slice(0, 8) || [];
  const crew = details?.credits?.crew?.filter((c) => ["Director", "Creator", "Yönetmen"].includes(c.job)).slice(0, 3) || [];
  const similar = details?.similar?.results?.filter((s) => s.poster_path).slice(0, 10) || [];
  const genres = (details?.genres || []).map((g) => g.name).join(", ");
  const runtime = details?.runtime
    ? `${Math.floor(details.runtime / 60)}s ${details.runtime % 60}dk`
    : details?.episode_run_time?.[0]
    ? `~${details.episode_run_time[0]}dk/bölüm`
    : null;

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fade-up"
        style={{
          width: "100%", maxWidth: 520, maxHeight: "92vh", overflowY: "auto",
          background: C.surface, borderRadius: "20px 20px 0 0",
          border: `1px solid ${C.border}`, borderBottom: "none",
        }}
      >
        {/* Hero */}
        <div style={{ position: "relative", height: 220, overflow: "hidden", borderRadius: "20px 20px 0 0" }}>
          {backdropUrl ? (
            <img src={backdropUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ height: "100%", background: `linear-gradient(135deg,${C.card},${C.bg})` }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(14,14,26,1) 0%, rgba(14,14,26,0.15) 55%, transparent 100%)" }} />

          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 14, right: 14,
              background: "rgba(0,0,0,0.55)", border: "none", color: C.text,
              width: 32, height: 32, borderRadius: "50%", cursor: "pointer",
              fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>

          <div style={{ position: "absolute", bottom: 14, left: 14, right: 14, display: "flex", gap: 12, alignItems: "flex-end" }}>
            {posterUrl && (
              <img
                src={posterUrl} alt=""
                style={{ width: 68, height: 102, objectFit: "cover", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.6)", flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, lineHeight: 1.2, marginBottom: 5 }}>
                {title}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center", fontSize: 12, color: C.muted }}>
                <span style={{ color: C.accent, fontWeight: 700 }}>★ {rating}</span>
                <span className="dot-sep">·</span>
                <span>{year}</span>
                {runtime && <><span className="dot-sep">·</span><span>{runtime}</span></>}
                {isTV && <><span className="dot-sep">·</span><span className="tag">Dizi</span></>}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ padding: "12px 14px", display: "flex", gap: 8 }}>
          <button className="btn-accent" style={{ flex: 1 }} onClick={() => onWatch(item)}>
            {watched ? "✓ İzlendi" : "İzledim İşaretle"}
          </button>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={() => onWatchlist(item)}>
            {inWatchlist ? "✓ Listede" : "+ Listeye Ekle"}
          </button>
          {trailer && (
            <a
              href={`https://youtube.com/watch?v=${trailer.key}`}
              target="_blank" rel="noreferrer"
              style={{
                padding: "10px 12px", background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 8, color: C.text, fontSize: 13, textDecoration: "none",
                whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4,
              }}
            >
              ▶ Fragman
            </a>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, padding: "0 14px" }}>
          {[{ id: "overview", label: "Özet" }, { id: "cast", label: "Oyuncular" }, { id: "similar", label: "Benzerleri" }].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: "none", border: "none",
                color: tab === t.id ? C.accent : C.muted,
                padding: "10px 14px", fontSize: 13,
                fontWeight: tab === t.id ? 600 : 400,
                borderBottom: tab === t.id ? `2px solid ${C.accent}` : "2px solid transparent",
                cursor: "pointer", transition: "color 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: "14px", paddingBottom: 32 }}>
          {tab === "overview" && (
            <div style={{ animation: "fadeUp 0.3s both" }}>
              {genres && (
                <div style={{ marginBottom: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {genres.split(", ").map((g) => <span key={g} className="tag">{g}</span>)}
                </div>
              )}
              <p style={{ fontSize: 14, lineHeight: 1.75, color: "#c8c4bc", marginBottom: 14 }}>
                {details?.overview || item.overview || "Türkçe özet bulunamadı."}
              </p>
              {crew.length > 0 && (
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                  {crew.map((c) => (
                    <div key={c.id + c.job} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", borderBottom: `1px solid ${C.border}22` }}>
                      <span style={{ color: C.muted }}>{c.job}</span>
                      <span style={{ fontWeight: 500 }}>{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "cast" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, animation: "fadeUp 0.3s both" }}>
              {cast.length === 0 ? (
                <p style={{ color: C.muted, gridColumn: "span 2" }}>Yükleniyor…</p>
              ) : (
                cast.map((c) => (
                  <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "center", background: C.card, borderRadius: 10, padding: 10 }}>
                    {c.profile_path ? (
                      <img src={IMG(c.profile_path, "w92")} alt="" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>👤</div>
                    )}
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.character}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "similar" && (
            <div className="shelf-scroll" style={{ animation: "fadeUp 0.3s both" }}>
              {similar.length === 0 ? (
                <p style={{ color: C.muted }}>Yükleniyor…</p>
              ) : (
                similar.map((s) => <MovieCard key={s.id} item={s} onClick={() => {}} size="sm" />)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── AIChatPanel ───────────────────────────────────────────────────────────
function AIChatPanel({ history, onClose }) {
  const [msgs, setMsgs] = useState([
    {
      role: "assistant",
      content: "Merhaba! Ben CineAI 🎬\nFilm ve dizi önerileri, gizli cevherleri keşfetme veya sadece sinema sohbeti için burdayım. Ne izlemek istersin?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();
  const inputRef = useRef();

  const watched = history.map((h) => h.title || h.name).join(", ") || "henüz bir şey izlemedi";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    const systemPrompt = `Sen CineAI'sın — derin sinema kültürüne sahip, tutkulu ve zeki bir film eleştirmeni ve öneri uzmanısın. Kullanıcıyla Türkçe konuşuyorsun.

Kullanıcının izlediği filmler/diziler: ${watched}

Kurallar:
- Kısa, öz ve etkili yanıtlar ver (2-3 paragraf max)
- Gerçek film/dizi adları, yönetmen ve oyuncu isimleri kullan
- İzleme geçmişine göre kişisel önerilerde bulun
- Samimi ve hevesli bir ton kullan
- Sadece düz metin gönder, markdown kullanma`;

    // Build Gemini conversation format
    const geminiMsgs = msgs
      .filter((m, i) => i > 0) // skip initial greeting
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));
    geminiMsgs.push({ role: "user", parts: [{ text: userMsg }] });

    try {
      // Call our Vercel serverless function (keeps API key secret)
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: geminiMsgs, systemPrompt }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Sunucu hatası" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setMsgs((m) => [...m, { role: "assistant", content: data.text || "Yanıt alınamadı." }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content: `Bağlantı hatası: ${err.message}\n\nVercel'de GEMINI_API_KEY ortam değişkenini ayarladığından emin ol.`,
        },
      ]);
    }
    setLoading(false);
  }

  const suggestions = [
    "Inception tarzı akıl oyunları öner",
    "Bu gece için karanlık bilim kurgu",
    "Kısa ve komik bir dizi",
    "Gizli kalıpları keşfet",
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", flexDirection: "column", background: C.bg }}>
      {/* Header */}
      <div
        className="glass"
        style={{
          padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
          borderBottom: `1px solid ${C.border}`, flexShrink: 0,
        }}
      >
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer", padding: "4px 8px" }}>
          ←
        </button>
        <div
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: `linear-gradient(135deg,${C.accent},${C.red})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}
        >
          🎬
        </div>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 16 }}>CineAI Asistan</div>
          <div style={{ fontSize: 11, color: C.accent }}>● Çevrimiçi</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", animation: "fadeUp 0.3s both" }}>
            {m.role === "assistant" && (
              <div
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: `linear-gradient(135deg,${C.accent},${C.red})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, flexShrink: 0, marginRight: 8, marginTop: 2,
                }}
              >
                🎬
              </div>
            )}
            <div
              style={{
                maxWidth: "80%",
                background: m.role === "user" ? `linear-gradient(135deg,${C.accent}22,${C.accentDim})` : C.card,
                border: `1px solid ${m.role === "user" ? C.accent + "44" : C.border}`,
                borderRadius: m.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                padding: "10px 14px", fontSize: 14, lineHeight: 1.65, color: C.text, whiteSpace: "pre-wrap",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: `linear-gradient(135deg,${C.accent},${C.red})`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
              }}
            >
              🎬
            </div>
            <div
              style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: "4px 16px 16px 16px", padding: "12px 16px",
                display: "flex", gap: 5, alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, animation: `pulse 1.2s ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      {msgs.length < 3 && (
        <div style={{ padding: "0 16px 10px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 20, padding: "6px 12px", fontSize: 12, color: C.muted,
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.target.style.borderColor = C.accent; e.target.style.color = C.accent; }}
              onMouseLeave={(e) => { e.target.style.borderColor = C.border; e.target.style.color = C.muted; }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        style={{
          padding: "12px 16px", borderTop: `1px solid ${C.border}`,
          background: C.surface, display: "flex", gap: 10, flexShrink: 0,
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Sinema dünyasında ne arıyorsun?…"
          style={{
            flex: 1, background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "12px 14px", color: C.text, fontSize: 14, outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = C.accent)}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: input.trim() ? C.accent : C.card,
            border: `1px solid ${input.trim() ? C.accent : C.border}`,
            color: input.trim() ? "#0a0806" : C.muted,
            fontSize: 18, cursor: input.trim() ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}

// ── SearchScreen ──────────────────────────────────────────────────────────
function SearchScreen({ onCard, watchedIds }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef();

  useEffect(() => {
    clearTimeout(timer.current);
    if (!q.trim()) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const d = await tmdb("/search/multi", { query: q, include_adult: false });
        setResults((d.results || []).filter((r) => ["movie", "tv"].includes(r.media_type) && r.poster_path).slice(0, 21));
      } catch (err) {
        console.error("Search error:", err);
      }
      setLoading(false);
    }, 420);
  }, [q]);

  return (
    <div style={{ padding: "0 16px 80px" }}>
      <div style={{ position: "relative", marginBottom: 18 }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: 16 }}>🔍</span>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Film, dizi, oyuncu ara…"
          style={{
            width: "100%", background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "13px 14px 13px 42px",
            color: C.text, fontSize: 15, outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = C.accent)}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />
      </div>

      {loading && <div style={{ color: C.muted, textAlign: "center", padding: 20 }}>Aranıyor…</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {results.map((r) => (
          <MovieCard key={r.id} item={r} onClick={onCard} size="sm" watched={watchedIds.has(r.id)} />
        ))}
      </div>

      {!q && !loading && (
        <div style={{ textAlign: "center", paddingTop: 60, color: C.muted }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🎬</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>İstediğini Bul</div>
          <div style={{ fontSize: 13 }}>Film, dizi ve oyuncuları anında arat</div>
        </div>
      )}
    </div>
  );
}

// ── LibraryScreen ─────────────────────────────────────────────────────────
function LibraryScreen({ history, watchlist, onCard }) {
  const [tab, setTab] = useState("watched");
  const items = tab === "watched" ? history : watchlist;

  return (
    <div style={{ padding: "0 16px 80px" }}>
      <div style={{ display: "flex", gap: 0, marginBottom: 20, background: C.card, borderRadius: 12, padding: 4 }}>
        {[["watched", "İzlenenler"], ["watchlist", "İzleme Listesi"]].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={{
              flex: 1, padding: "9px", borderRadius: 9, border: "none",
              background: tab === k ? C.accent : "transparent",
              color: tab === k ? "#0a0806" : C.muted,
              fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            }}
          >
            {l} {tab === k ? `(${items.length})` : ""}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", paddingTop: 60, color: C.muted }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>{tab === "watched" ? "🎥" : "📋"}</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            {tab === "watched" ? "Henüz izlenen yok" : "Listeniz boş"}
          </div>
          <div style={{ fontSize: 13 }}>Yeni filmler keşfet ve buraya ekle</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {items.map((item) => (
            <MovieCard key={item.id} item={item} onClick={onCard} size="sm" watched={tab === "watched"} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── HomeScreen ────────────────────────────────────────────────────────────
function HomeScreen({ onCard, watchedIds }) {
  const [data, setData] = useState({
    trending: [], topRated: [], newMovies: [], newTV: [], scifi: [], thriller: [],
  });
  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      tmdb("/trending/all/week"),
      tmdb("/movie/top_rated"),
      tmdb("/movie/now_playing"),
      tmdb("/tv/on_the_air"),
      tmdb("/discover/movie", { with_genres: 878, sort_by: "popularity.desc" }),
      tmdb("/discover/movie", { with_genres: 53, sort_by: "vote_average.desc", "vote_count.gte": 500 }),
    ])
      .then(([t, tr, nm, ntv, sf, th]) => {
        const trending = (t.results || []).filter((i) => i.poster_path);
        setData({
          trending,
          topRated: (tr.results || []).filter((i) => i.poster_path),
          newMovies: (nm.results || []).filter((i) => i.poster_path),
          newTV: (ntv.results || []).filter((i) => i.poster_path),
          scifi: (sf.results || []).filter((i) => i.poster_path),
          thriller: (th.results || []).filter((i) => i.poster_path),
        });
        if (trending[0]) setHero(trending[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("HomeScreen error:", err);
        setError("İçerik yüklenemedi. TMDB API anahtarını kontrol et.");
        setLoading(false);
      });
  }, []);

  const heroImg = hero?.backdrop_path ? IMG(hero.backdrop_path, "original") : null;

  if (error) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: C.muted }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 15, color: C.red }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Hero banner */}
      <div style={{ position: "relative", height: 290, overflow: "hidden", marginBottom: 28 }}>
        {heroImg ? (
          <img src={heroImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ height: "100%", background: `linear-gradient(135deg,${C.surface},${C.bg})` }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,16,1) 0%, rgba(8,8,16,0.35) 55%, transparent 100%)" }} />

        {hero && (
          <div style={{ position: "absolute", bottom: 20, left: 16, right: 16 }}>
            <div className="tag" style={{ marginBottom: 8 }}>🔥 Trendlerde</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 25, fontWeight: 700, lineHeight: 1.15, marginBottom: 10, textShadow: "0 2px 16px rgba(0,0,0,0.9)" }}>
              {hero.title || hero.name}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="btn-accent" style={{ padding: "8px 18px", fontSize: 13 }} onClick={() => onCard(hero)}>
                ▶ Detaylar
              </button>
              <div style={{ fontSize: 12, color: "#d0ccc4" }}>
                ★ {hero.vote_average?.toFixed(1)} · {(hero.release_date || hero.first_air_date || "").slice(0, 4)}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "0 16px" }}>
        <HorizontalShelf title="Haftanın Trendleri" items={data.trending} onCard={onCard} loading={loading} badge="Canlı" watchedIds={watchedIds} />
        <HorizontalShelf title="Vizyondakiler" items={data.newMovies} onCard={onCard} loading={loading} watchedIds={watchedIds} />
        <HorizontalShelf title="Yeni Diziler" items={data.newTV} onCard={onCard} loading={loading} watchedIds={watchedIds} />
        <HorizontalShelf title="Tüm Zamanların En İyileri" items={data.topRated} onCard={onCard} loading={loading} watchedIds={watchedIds} />
        <HorizontalShelf title="Bilim Kurgu Evreni" items={data.scifi} onCard={onCard} loading={loading} watchedIds={watchedIds} />
        <HorizontalShelf title="Gerilim & Gerilim" items={data.thriller} onCard={onCard} loading={loading} watchedIds={watchedIds} />
      </div>
    </div>
  );
}

// ── BottomNav ─────────────────────────────────────────────────────────────
function BottomNav({ tab, setTab, onChat }) {
  const tabs = [
    { id: "home", icon: "🏠", label: "Ana Sayfa" },
    { id: "search", icon: "🔍", label: "Arama" },
    { id: "library", icon: "📚", label: "Kütüphane" },
  ];

  return (
    <div
      className="glass"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center",
        padding: "10px 16px calc(10px + env(safe-area-inset-bottom))",
        borderTop: `1px solid ${C.border}`,
        maxWidth: 520, margin: "0 auto",
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          style={{
            flex: 1, background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            color: tab === t.id ? C.accent : C.muted,
            transition: "color 0.2s", fontSize: 11, fontWeight: 600,
            padding: "4px 0",
          }}
        >
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}

      <button
        onClick={onChat}
        style={{
          width: 46, height: 46, borderRadius: "50%",
          background: `linear-gradient(135deg,${C.accent},${C.red})`,
          border: "none", color: "#0a0806", fontSize: 20, cursor: "pointer",
          boxShadow: `0 4px 20px ${C.accent}55`,
          flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        title="CineAI Asistan"
      >
        🤖
      </button>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [history, setHistory] = useState(() => LS.get("cineai_watched", []));
  const [watchlist, setWatchlist] = useState(() => LS.get("cineai_watchlist", []));

  const watchedIds = new Set(history.map((h) => h.id));
  const watchlistIds = new Set(watchlist.map((w) => w.id));

  const markWatched = useCallback((item) => {
    setHistory((h) => {
      const next = watchedIds.has(item.id) ? h.filter((x) => x.id !== item.id) : [item, ...h];
      LS.set("cineai_watched", next);
      return next;
    });
  }, [history]);

  const toggleWatchlist = useCallback((item) => {
    setWatchlist((w) => {
      const next = watchlistIds.has(item.id) ? w.filter((x) => x.id !== item.id) : [item, ...w];
      LS.set("cineai_watchlist", next);
      return next;
    });
  }, [watchlist]);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ maxWidth: 520, margin: "0 auto", minHeight: "100vh", background: C.bg, position: "relative" }}>
        {/* Top bar */}
        <div
          className="glass"
          style={{
            position: "sticky", top: 0, zIndex: 40,
            padding: "14px 16px 12px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
            <span style={{ color: C.accent }}>Cine</span>AI
          </div>
          <div style={{ fontSize: 12, color: C.muted, background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "4px 10px" }}>
            {history.length} İzlendi
          </div>
        </div>

        {/* Screens */}
        <div style={{ paddingTop: 4 }}>
          {tab === "home" && <HomeScreen onCard={setModal} watchedIds={watchedIds} />}
          {tab === "search" && <SearchScreen onCard={setModal} watchedIds={watchedIds} />}
          {tab === "library" && <LibraryScreen history={history} watchlist={watchlist} onCard={setModal} />}
        </div>

        <BottomNav tab={tab} setTab={setTab} onChat={() => setShowChat(true)} />
      </div>

      {/* Detail modal */}
      {modal && (
        <DetailModal
          item={modal}
          onClose={() => setModal(null)}
          onWatch={markWatched}
          onWatchlist={toggleWatchlist}
          watched={watchedIds.has(modal.id)}
          inWatchlist={watchlistIds.has(modal.id)}
        />
      )}

      {/* AI Chat */}
      {showChat && <AIChatPanel history={history} onClose={() => setShowChat(false)} />}
    </>
  );
}
