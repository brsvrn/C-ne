import React, { useState, useEffect } from "react";
import { C } from "./utils/theme";
import { LS } from "./utils/storage";

import HomeScreen from "./components/HomeScreen";
import SearchScreen from "./components/SearchScreen";
import LibraryScreen from "./components/LibraryScreen";
import BottomNav from "./components/BottomNav";
import DetailModal from "./components/DetailModal";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap";

const GLOBAL_CSS = `
  @import url('${FONT_LINK}');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
  .shelf-scroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; scroll-snap-type: x mandatory; scrollbar-width: none; }
  .shelf-scroll::-webkit-scrollbar { display: none; }
`;

export default function App() {
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [history, setHistory] = useState(() => LS.get("cineai_history", []));
  const [watchlist, setWatchlist] = useState(() => LS.get("cineai_watchlist", []));

  useEffect(() => { LS.set("cineai_history", history); }, [history]);
  useEffect(() => { LS.set("cineai_watchlist", watchlist); }, [watchlist]);

  const watchedIds = new Set(history.map(item => item.id));
  const watchlistIds = new Set(watchlist.map(item => item.id));

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ maxWidth: 520, margin: "0 auto", background: C.bg, minHeight: "100vh" }}>
        <div style={{ padding: "20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}><span style={{ color: C.accent }}>Cine</span>AI</div>
        </div>
        
        {tab === "home" && <HomeScreen onCard={setModal} watchedIds={watchedIds} />}
        {tab === "search" && <SearchScreen onCard={setModal} watchedIds={watchedIds} />}
        {tab === "library" && <LibraryScreen history={history} watchlist={watchlist} onCard={setModal} />}
        
        <BottomNav tab={tab} setTab={setTab} />
      </div>

      {modal && (
        <DetailModal
          item={modal}
          onClose={() => setModal(null)}
          onWatch={(item) => setHistory(prev => [item, ...prev])}
          onWatchlist={(item) => setWatchlist(prev => [item, ...prev])}
          watched={watchedIds.has(modal.id)}
          inWatchlist={watchlistIds.has(modal.id)}
        />
      )}
    </>
  );
}
