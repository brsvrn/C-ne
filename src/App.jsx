import React, { useState, useEffect, useRef } from "react";
import { C } from "./utils/theme";
import { LS } from "./utils/storage";

// Bileşenlerimiz
import HomeScreen from "./components/HomeScreen";
import SearchScreen from "./components/SearchScreen";
import LibraryScreen from "./components/LibraryScreen";
import BottomNav from "./components/BottomNav";
import DetailModal from "./components/DetailModal";

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

export default function App() {
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const [history, setHistory] = useState(() => LS.get("cineai_history", []));
  const [watchlist, setWatchlist] = useState(() => LS.get("cineai_watchlist", []));

  useEffect(() => { LS.set("cineai_history", history); }, [history]);
  useEffect(() => { LS.set("cineai_watchlist", watchlist); }, [watchlist]);

  const watchedIds = new Set(history.map(x => x.id));
  const watchlistIds = new Set(watchlist.map(x => x.id));

  const markWatched = (item) => {
    if (watchedIds.has(item.id)) {
      setHistory(prev => prev.filter(x => x.id !== item.id));
    } else {
      setHistory(prev => [{ ...item, addedAt: Date.now() }, ...prev]);
    }
  };

  const toggleWatchlist = (item) => {
    if (watchlistIds.has(item.id)) {
      setWatchlist(prev => prev.filter(x => x.id !== item.id));
    } else {
      setWatchlist(prev => [{ ...item, addedAt: Date.now() }, ...prev]);
    }
  };

  // Chat States
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Merhaba! Bugün ne izlemek istersin? Dizi mi, film mi arıyorsun?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatLoading]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput("");
    const newMessages = [...chatMessages, { role: "
