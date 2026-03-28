import { useEffect, useState } from "react";
import type { Neighborhood, ScoreCategory } from "./types";
import { getNeighborhoods, searchNeighborhoods } from "./api/neighborhoods";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import LiveMap from "./components/LiveMap";

type ThemeMode = "light" | "dark";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem("livabl-theme");
  if (stored === "light" || stored === "dark") return stored;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function App() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [selected, setSelected] = useState<Neighborhood | null>(null);
  const [activeCategory, setActiveCategory] = useState<ScoreCategory>("all");
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    getNeighborhoods().then(({ neighborhoods }) => {
      setNeighborhoods(neighborhoods);
      if (neighborhoods.length > 0) {
        const top = [...neighborhoods].sort((a, b) => b.score - a.score)[0];
        setSelected(top);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("livabl-theme", theme);
  }, [theme]);

  async function handleSearch(query: string) {
    const { results } = await searchNeighborhoods(query);
    if (results.length > 0) setSelected(results[0]);
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "'DM Sans', sans-serif",
          color: "#6b6b64",
          fontSize: 14,
        }}
      >
        Loading neighborhoods…
      </div>
    );
  }

  return (
    <>
      <Header
        onSearch={handleSearch}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        theme={theme}
        onThemeToggle={() =>
          setTheme((current) => (current === "light" ? "dark" : "light"))
        }
      />
      <div className="app-body">
        <Sidebar
          neighborhoods={neighborhoods}
          selected={selected}
          onSelect={setSelected}
          activeCategory={activeCategory}
        />
        <LiveMap
          neighborhoods={neighborhoods}
          selected={selected}
          onSelect={setSelected}
          theme={theme}
        />
      </div>
    </>
  );
}
