import { useEffect, useMemo, useState } from 'react';
import type { Neighborhood, ScoreCategory } from '../types';
import { getBadgeStyle } from '../utils';
import ScoreBar from './ScoreBar';

interface SidebarProps {
  neighborhoods: Neighborhood[];
  selected: Neighborhood | null;
  onSelect: (n: Neighborhood) => void;
  activeCategory: ScoreCategory;
}

const BREAKDOWN_LABELS: { key: keyof Neighborhood['breakdown']; label: string }[] = [
  { key: 'safety', label: 'Safety' },
  { key: 'walkability', label: 'Walkability' },
  { key: 'transit', label: 'Transit' },
  { key: 'schools', label: 'Schools' },
  { key: 'greenery', label: 'Greenery' },
  { key: 'noise', label: 'Noise' },
];

type SidebarTab = 'Overview' | 'Compare' | 'Trends' | 'Reports';

function getDisplayScore(n: Neighborhood, cat: ScoreCategory): number {
  if (cat === 'all') return n.score;
  if (cat in n.breakdown) return n.breakdown[cat as keyof Neighborhood['breakdown']];
  return n.score;
}

export default function Sidebar({ neighborhoods, selected, onSelect, activeCategory }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('Overview');
  const [compareWithId, setCompareWithId] = useState<string>('');

  const sorted = [...neighborhoods].sort(
    (a, b) => getDisplayScore(b, activeCategory) - getDisplayScore(a, activeCategory)
  );
  const compareOptions = useMemo(
    () => neighborhoods.filter((n) => n.id !== selected?.id),
    [neighborhoods, selected?.id]
  );
  const compareWith =
    compareOptions.find((n) => n.id === compareWithId) ?? compareOptions[0] ?? null;

  useEffect(() => {
    if (!compareWith && compareOptions.length > 0) {
      setCompareWithId(compareOptions[0].id);
      return;
    }
    if (compareWith && !compareOptions.some((n) => n.id === compareWith.id)) {
      setCompareWithId(compareOptions[0]?.id ?? '');
    }
  }, [compareOptions, compareWith]);

  const compareDelta =
    selected && compareWith ? getDisplayScore(selected, activeCategory) - getDisplayScore(compareWith, activeCategory) : 0;

  return (
    <aside className="sidebar">
      <div className="sidebar-tabs">
        {(['Overview', 'Compare', 'Trends', 'Reports'] as SidebarTab[]).map((t) => (
          <button
            key={t}
            className={`tab ${t === activeTab ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
            type="button"
          >
            {t}
          </button>
        ))}
      </div>

      <div className="sidebar-content">
        {selected && activeTab === 'Overview' && (
          <div className="score-hero">
            <div className="score-hero-location">{selected.city}, {selected.region}</div>
            <div className="score-hero-name">{selected.name}</div>
            <div className="score-hero-big">
              <div
                className="score-num"
                style={{ color: selected.score >= 75 ? '#4ade80' : selected.score >= 55 ? '#fbbf24' : '#f87171' }}
              >
                {selected.score}
              </div>
              <div className="score-label">Livability<br />Score</div>
            </div>
            <div className="score-bar-row">
              {BREAKDOWN_LABELS.map(({ key, label }, i) => (
                <ScoreBar key={key} label={label} value={selected.breakdown[key]} delay={i * 60} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Compare' && selected && (
          <div className="score-hero compare-panel">
            <div className="score-hero-location">Compare Neighborhoods</div>
            <div className="score-hero-name">Side-by-side livability insights</div>

            <div className="compare-selector-row">
              <div className="compare-item">
                <div className="compare-item-label">Selected</div>
                <div className="compare-item-name">{selected.name}</div>
                <div className="compare-item-score">{getDisplayScore(selected, activeCategory)}</div>
              </div>

              <div className={`compare-delta ${compareDelta >= 0 ? 'up' : 'down'}`}>
                {compareDelta >= 0 ? '+' : ''}
                {compareDelta.toFixed(1)}
              </div>

              <div className="compare-item">
                <div className="compare-item-label">Compared With</div>
                <select
                  className="compare-select"
                  value={compareWith?.id ?? ''}
                  onChange={(e) => setCompareWithId(e.target.value)}
                >
                  {compareOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <div className="compare-item-score">{compareWith ? getDisplayScore(compareWith, activeCategory) : '--'}</div>
              </div>
            </div>

            {compareWith ? (
              <div className="score-bar-row">
                {BREAKDOWN_LABELS.map(({ key, label }, i) => (
                  <div key={key} className="compare-metric-row">
                    <div className="compare-metric-top">
                      <span>{label}</span>
                      <span>
                        {selected.breakdown[key]} vs {compareWith.breakdown[key]}
                      </span>
                    </div>
                    <ScoreBar
                      label="Selected"
                      value={selected.breakdown[key]}
                      delay={i * 70}
                    />
                    <ScoreBar
                      label="Compared"
                      value={compareWith.breakdown[key]}
                      delay={i * 70 + 40}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="compare-empty">Select another neighborhood to compare.</div>
            )}
          </div>
        )}

        {(activeTab === 'Trends' || activeTab === 'Reports') && (
          <div className="score-hero compare-panel">
            <div className="score-hero-location">{activeTab}</div>
            <div className="score-hero-name">Coming soon</div>
            <div className="compare-empty">
              We will surface historical trends and downloadable reports here.
            </div>
          </div>
        )}

        <div className="section-label">
          {activeTab === 'Compare' ? 'Choose Main Neighborhood' : 'Nearby Neighborhoods'}
        </div>

        {sorted.map((n, i) => {
          const displayScore = getDisplayScore(n, activeCategory);
          const badge = getBadgeStyle(displayScore);
          return (
            <div
              key={n.id}
              className={`hood-card ${selected?.id === n.id ? 'selected' : ''}`}
              onClick={() => onSelect(n)}
            >
              <div className="hood-rank">{i + 1}</div>
              <div className="hood-info">
                <div className="hood-name">{n.name}</div>
                <div className="hood-sub">{n.region} · {n.area_km2}km²</div>
              </div>
              <div className="score-badge" style={{ background: badge.background, color: badge.color }}>
                {displayScore}
              </div>
              {activeTab === 'Compare' && selected?.id !== n.id && (
                <button
                  className="compare-inline-btn"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCompareWithId(n.id);
                  }}
                >
                  Compare
                </button>
              )}
            </div>
          );
        })}

        <div style={{ height: 16 }} />
      </div>
    </aside>
  );
}
