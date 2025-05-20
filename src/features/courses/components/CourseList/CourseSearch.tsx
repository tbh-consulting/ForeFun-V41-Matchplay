import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/shared/Input';
import { useDebounce } from '@/hooks/useDebounce';

interface CourseSearchProps {
  onSearch: (query: string) => void;
}

export function CourseSearch({ onSearch }: CourseSearchProps) {
  const [query, setQuery] = React.useState('');
  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  return (
    <Input
      label=""
      placeholder="Search courses by name or location..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      icon={<Search className="w-4 h-4 sm:w-5 sm:h-5" />}
      className="!py-2 sm:!py-3 text-sm sm:text-base"
    />
  );
}