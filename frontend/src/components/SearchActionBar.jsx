
import { Search } from 'lucide-react';

 const SearchActionBar = ({ 
  searchValue, 
  onSearchChange, 
  placeholder = "Search..."
}) => {
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={onSearchChange}
        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
      />
    </div>
  );
};

export default SearchActionBar;
