const TMDB_KEY = import.meta.env.VITE_TMDB_KEY || "3fd2be6f0c70a2a598f084ddfb75487c";
const TMDB_BASE = "https://api.themoviedb.org/3";

export const IMG = (p, s = "w500") =>
  p ? `https://image.tmdb.org/t/p/${s}${p}` : null;

export async function tmdb(path, params = {}) {
  const q = new URLSearchParams({ api_key: TMDB_KEY, language: "tr-TR", ...params });
  const r = await fetch(`${TMDB_BASE}${path}?${q}`);
  if (!r.ok) throw new Error(`TMDB ${r.status}: ${path}`);
  return r.json();
}
