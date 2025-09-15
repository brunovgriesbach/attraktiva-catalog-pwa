import styles from './SearchBar.module.css';

interface SearchBarProps {
  searchTerm: string;
  filter: string;
  onSearchTermChange: (value: string) => void;
  onFilterChange: (value: string) => void;
}

export default function SearchBar({
  searchTerm,
  filter,
  onSearchTermChange,
  onFilterChange,
}: SearchBarProps) {
  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder="Search products"
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
      />
      <select value={filter} onChange={(e) => onFilterChange(e.target.value)}>
        <option value="all">All Prices</option>
        <option value="under-10">Under $10</option>
        <option value="10-20">$10 to $20</option>
        <option value="over-20">Over $20</option>
      </select>
    </div>
  );
}
