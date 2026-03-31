import { useEffect, useRef, useState } from 'react';
import type { ScoreCategory, TopbarFilters } from '../types';

interface HeaderProps {
  onSearch: (query: string) => void;
  activeCategory: ScoreCategory;
  onCategoryChange: (cat: ScoreCategory) => void;
  filters: TopbarFilters;
  onFiltersChange: React.Dispatch<React.SetStateAction<TopbarFilters>>;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const CATEGORIES: { key: ScoreCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'hospital_score', label: 'Hospital Score' },
  { key: 'school_score', label: 'School Score' },
  { key: 'pollution_score', label: 'Pollution Score' },
];

export default function Header({
  onSearch,
  activeCategory,
  onCategoryChange,
  filters,
  onFiltersChange,
  theme,
  onThemeToggle,
}: HeaderProps) {
  const [query, setQuery] = useState('Connaught Place, New Delhi');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (!filtersRef.current?.contains(target)) {
        setFiltersOpen(false);
      }
    }

    if (filtersOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
    }
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [filtersOpen]);

  const activeFilterCount =
    Number(filters.minScore > 0) +
    Number(!filters.includeExcellent) +
    Number(!filters.includeAverage) +
    Number(!filters.includePoor);

  return (
    <header className="livabl-header">
      <div className="logo">
        <div className="logo-mark">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2C5.24 2 3 4.24 3 7C3 10.5 8 14 8 14C8 14 13 10.5 13 7C13 4.24 10.76 2 8 2Z" fill="white" />
            <circle cx="8" cy="7" r="2" fill="var(--logo-mark-dot)" />
          </svg>
        </div>
        <span className="logo-name">Liv<span>abl</span></span>
      </div>

      <div className="header-center">
        <form className="search-box" onSubmit={handleSearch}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="#a0a099" strokeWidth="1.2" />
            <path d="M9.5 9.5L12 12" stroke="#a0a099" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search a neighborhood, city, or ward…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <div className="filter-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`pill-btn ${activeCategory === cat.key ? 'active' : ''}`}
              type="button"
              onClick={() => onCategoryChange(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="header-actions">
        <button
          className="pill-btn theme-toggle"
          onClick={onThemeToggle}
          type="button"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 1.25V2.25M6 9.75V10.75M10.75 6H9.75M2.25 6H1.25M9.712 2.288L9.005 2.995M2.995 9.005L2.288 9.712M9.712 9.712L9.005 9.005M2.995 2.995L2.288 2.288M8 6A2 2 0 1 1 4 6A2 2 0 0 1 8 6Z"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M8.941 7.588C7.079 7.588 5.569 6.078 5.569 4.216C5.569 3.404 5.856 2.659 6.335 2.076C4.118 2.261 2.375 4.117 2.375 6.381C2.375 8.768 4.311 10.704 6.698 10.704C8.962 10.704 10.818 8.961 11.003 6.744C10.42 7.301 9.714 7.588 8.941 7.588Z"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <div className="filters-wrap" ref={filtersRef}>
          <button
            className={`pill-btn ${filtersOpen ? 'active' : ''}`}
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 3h10M3 6h6M5 9h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
          {filtersOpen && (
            <div className="filters-popover">
              <div className="filters-title">Neighborhood Filters</div>

              <label className="filters-label" htmlFor="min-score-range">
                Minimum Score: <span>{filters.minScore}</span>
              </label>
              <input
                id="min-score-range"
                className="filters-range"
                type="range"
                min={0}
                max={100}
                step={1}
                value={filters.minScore}
                onChange={(e) =>
                  onFiltersChange((prev) => ({
                    ...prev,
                    minScore: Number(e.target.value),
                  }))}
              />

              <div className="filters-label">Show Score Bands</div>
              <label className="filters-check">
                <input
                  type="checkbox"
                  checked={filters.includeExcellent}
                  onChange={(e) =>
                    onFiltersChange((prev) => ({
                      ...prev,
                      includeExcellent: e.target.checked,
                    }))}
                />
                Excellent (75-100)
              </label>
              <label className="filters-check">
                <input
                  type="checkbox"
                  checked={filters.includeAverage}
                  onChange={(e) =>
                    onFiltersChange((prev) => ({
                      ...prev,
                      includeAverage: e.target.checked,
                    }))}
                />
                Average (55-74)
              </label>
              <label className="filters-check">
                <input
                  type="checkbox"
                  checked={filters.includePoor}
                  onChange={(e) =>
                    onFiltersChange((prev) => ({
                      ...prev,
                      includePoor: e.target.checked,
                    }))}
                />
                Poor (0-54)
              </label>

              <button
                className="filters-reset"
                type="button"
                onClick={() =>
                  onFiltersChange({
                    minScore: 0,
                    includeExcellent: true,
                    includeAverage: true,
                    includePoor: true,
                  })}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
        <div className="avatar">R</div>
      </div>
    </header>
  );
}
