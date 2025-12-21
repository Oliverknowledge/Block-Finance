import { useState } from 'react';
import Button from './Button';

interface SearchBarProps {
  Search: (coin: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ Search }) => { 
  const [query, setQuery] = useState("");
 
  const handleClick = () => {
    if (!query.trim()) return;
    Search(query.trim());
  };

  return (
    <>    
 
    <form
      className="max-w-md mx-auto"
      onSubmit={(e) => {
        e.preventDefault(); // prevents page reload
        handleClick();
      }}
    >
      <label htmlFor="search" className="block mb-2.5 text-sm font-medium text-heading sr-only">
        Search
      </label>
  
      <div className="relative">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-body"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
          </svg>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full p-3 ps-9 bg-neutral-secondary-medium  text-heading text-sm rounded-base  shadow-xs placeholder:text-body"
          placeholder="Search"
          required
        />

        <Button
          variant =  "secondary"
          size = "sm"
          type="submit"
          className="absolute end-0 bottom-0    border border-transparent focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded text-xs px-3 py-1.5"
        >
          Search
        </Button>
      </div>
    </form></>

  );
};

export default SearchBar;
