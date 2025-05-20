import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { useCourses } from '@/features/courses/hooks/useCourses';

interface CourseSelectionProps {
  selectedCourseId?: string;
  onSelect: (courseId: string) => void;
}

export function CourseSelection({ selectedCourseId, onSelect }: CourseSelectionProps) {
  const [search, setSearch] = React.useState('');
  const { courses, isLoading } = useCourses();

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(search.toLowerCase()) ||
    course.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        label="Search Courses"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search className="w-5 h-5" />}
        placeholder="Search by name or location..."
      />

      <div className="max-h-[400px] overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No courses found</div>
        ) : (
          filteredCourses.map((course) => (
            <Button
              key={course.id}
              variant={selectedCourseId === course.id ? 'primary' : 'secondary'}
              className="w-full justify-start !px-4"
              onClick={() => onSelect(course.id)}
            >
              <div className="text-left">
                <div className="font-medium">{course.name}</div>
                <div className="text-sm opacity-80">{course.address}</div>
              </div>
            </Button>
          ))
        )}
      </div>
    </div>
  );
}