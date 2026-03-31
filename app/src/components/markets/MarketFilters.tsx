import type { StatusFilter, CategoryFilter, SortOption } from './constants';

interface MarketFiltersProps {
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;
  categoryFilter: CategoryFilter;
  setCategoryFilter: (filter: CategoryFilter) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  statusCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
}

export function MarketFilters({
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  sortOption,
  setSortOption,
  statusCounts,
  categoryCounts,
}: MarketFiltersProps) {
  return (
    <div className="market-filters">
      {/* Status Filter */}
      <div className="filter-group">
        <label className="filter-label">Status:</label>
        <div className="filter-buttons">
          {[
            { key: 'all', label: 'All' },
            { key: 'open', label: 'Open' },
            { key: 'waiting', label: 'Waiting' },
            { key: 'proposed', label: 'Proposed' },
            { key: 'challenged', label: 'Challenged' },
            { key: 'voting', label: 'DAO Veto' },
            { key: 'resolved', label: 'Resolved' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`filter-btn ${statusFilter === key ? 'active' : ''}`}
              onClick={() => setStatusFilter(key as StatusFilter)}
            >
              {label}
              {statusCounts[key] !== undefined && (
                <span className="filter-count">{statusCounts[key] || 0}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="filter-group">
        <label className="filter-label">Category:</label>
        <div className="filter-buttons">
          {[
            { key: 'all', label: 'All', icon: '🌐' },
            { key: 'cricket', label: 'Cricket', icon: '🏏' },
            { key: 'champions_league', label: 'Champions League', icon: '⚽' },
            { key: 'soccer_world_cup', label: 'Soccer World Cup', icon: '🏆' },
            { key: 'winter_olympics', label: 'Winter Olympics', icon: '⛷️' },
            { key: 'other', label: 'Other', icon: '📊' },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              className={`filter-btn category-btn ${categoryFilter === key ? 'active' : ''}`}
              onClick={() => setCategoryFilter(key as CategoryFilter)}
            >
              <span className="filter-icon">{icon}</span>
              {label}
              {categoryCounts[key] !== undefined && (
                <span className="filter-count">{categoryCounts[key] || 0}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="filter-group sort-group">
        <label className="filter-label">Sort by:</label>
        <div className="sort-select-wrapper">
          <select
            className="sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="deadline-soon">Deadline (Soonest)</option>
            <option value="deadline-late">Deadline (Latest)</option>
            <option value="status">Status (Most Urgent)</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
          </select>
          <span className="sort-icon">↕</span>
        </div>
      </div>
    </div>
  );
}
