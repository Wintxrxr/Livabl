import { useEffect, useMemo, useRef, useState } from "react";
import type { Neighborhood, ScoreCategory, TopbarFilters } from "./types";
import { getNeighborhoods } from "./api/neighborhoods";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import LiveMap from "./components/LiveMap";

type ThemeMode = "light" | "dark";

const DEFAULT_FILTERS: TopbarFilters = {
  minScore: 0,
  includeExcellent: true,
  includeAverage: true,
  includePoor: true,
};

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem("livabl-theme");
  if (stored === "light" || stored === "dark") return stored;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function App() {
  const [allNeighborhoods, setAllNeighborhoods] = useState<Neighborhood[]>([]);
  const [selected, setSelected] = useState<Neighborhood | null>(null);
  const [activeCategory, setActiveCategory] = useState<ScoreCategory>("all");
  const [filters, setFilters] = useState<TopbarFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [themeSwitching, setThemeSwitching] = useState(false);
  const themeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    getNeighborhoods().then(({ neighborhoods }) => {
      setAllNeighborhoods(neighborhoods);
      if (neighborhoods.length > 0) {
        const top = [...neighborhoods].sort((a, b) => b.score - a.score)[0];
        setSelected(top);
      }
      setLoading(false);
    });
  }, []);

  const neighborhoods = useMemo(() => {
    return allNeighborhoods
      .filter((n) => {
        if (n.score < filters.minScore) return false;
        if (n.score >= 75) return filters.includeExcellent;
        if (n.score >= 55) return filters.includeAverage;
        return filters.includePoor;
      })
      .sort((a, b) => b.score - a.score);
  }, [allNeighborhoods, filters]);

  useEffect(() => {
    if (neighborhoods.length === 0) {
      setSelected(null);
      return;
    }
    if (!selected || !neighborhoods.some((n) => n.id === selected.id)) {
      setSelected(neighborhoods[0]);
    }
  }, [neighborhoods, selected]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("livabl-theme", theme);
  }, [theme]);

  useEffect(() => {
    return () => {
      if (themeTimerRef.current !== null) {
        window.clearTimeout(themeTimerRef.current);
      }
    };
  }, []);

  function handleSearch(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return;
    const found =
      neighborhoods.find((n) => n.name.toLowerCase().includes(q)) ??
      allNeighborhoods.find((n) => n.name.toLowerCase().includes(q));
    if (found) setSelected(found);
  }

  function handleThemeToggle() {
    if (themeTimerRef.current !== null) {
      window.clearTimeout(themeTimerRef.current);
    }

    setThemeSwitching(true);
    setTheme((current) => (current === "light" ? "dark" : "light"));

    themeTimerRef.current = window.setTimeout(() => {
      setThemeSwitching(false);
      themeTimerRef.current = null;
    }, 1000);
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
        filters={filters}
        onFiltersChange={setFilters}
        theme={theme}
        onThemeToggle={handleThemeToggle}
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
      <div
        className={`theme-transition-screen ${themeSwitching ? "active" : ""}`}
        aria-hidden="true"
      >
        <div className={`theme-transition-core theme-${theme}`}>
          {theme === "dark" ? (
            <svg
              className="theme-transition-icon"
              width="34"
              height="34"
              viewBox="0 0 34 34"
              fill="none"
            >
              <path
                d="M24.298 20.595C19.023 20.595 14.747 16.319 14.747 11.044C14.747 8.745 15.56 6.634 16.917 4.982C10.636 5.508 5.698 10.771 5.698 17.188C5.698 23.95 11.18 29.432 17.942 29.432C24.359 29.432 29.622 24.494 30.148 18.213C28.496 19.792 26.494 20.595 24.298 20.595Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              className="theme-transition-icon"
              width="34"
              height="34"
              viewBox="0 0 34 34"
              fill="none"
            >
              <circle cx="17" cy="17" r="6" stroke="currentColor" strokeWidth="2" />
              <path
                d="M17 3.5V7.5M17 26.5V30.5M30.5 17H26.5M7.5 17H3.5M26.546 7.454L23.718 10.282M10.282 23.718L7.454 26.546M26.546 26.546L23.718 23.718M10.282 10.282L7.454 7.454"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
      </div>
    </>
  );
}
