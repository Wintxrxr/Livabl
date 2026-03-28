import { useState } from 'react';
import type { ScoreCategory } from '../types';

interface HeaderProps {
  onSearch: (query: string) => void;
  activeCategory: ScoreCategory;
  onCategoryChange: (cat: ScoreCategory) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const CATEGORIES: { key: ScoreCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'safety', label: 'Safety' },
  { key: 'walkability', label: 'Walkability' },
  { key: 'transit', label: 'Transit' },
  { key: 'schools', label: 'Schools' },
  { key: 'greenery', label: 'Greenery' },
];

export default function Header({
  onSearch,
  activeCategory,
  onCategoryChange,
  theme,
  onThemeToggle,
}: HeaderProps) {
  const [query, setQuery] = useState('Connaught Place, New Delhi');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

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
        <button className="pill-btn">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 3h10M3 6h6M5 9h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Filters
        </button>
        <div className="avatar">R</div>
      </div>
    </header>
  );
}
