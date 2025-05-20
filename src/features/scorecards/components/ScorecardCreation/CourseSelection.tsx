import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { useCourses } from '@/features/courses/hooks/useCourses';

interface CourseSelectionProps {
  onSelect: (courseId: string) => void;
  isLoading?: boolean;
}

export function CourseSelection({ onSelect, isLoading }: CourseSelectionProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>();
  const [search, setSearch] = useState('');
  const { courses = [], isLoading: isLoadingCourses } = useCourses();

  // Only filter courses if we have them and user has started typing
  const filteredCourses = search.trim() ? courses?.filter(course =>
    course.name.toLowerCase().includes(search.toLowerCase()) ||
    course.address.toLowerCase().includes(search.toLowerCase())
  ) || [] : courses;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => selectedCourseId && onSelect(selectedCourseId)}
          isLoading={isLoading}
          disabled={!selectedCourseId || isLoading}
          className="!py-2 !px-4 text-sm"
        >
          Next
        </Button>
      </div>

      <Input
        label="Search Courses"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search className="w-4 h-4 sm:w-5 sm:h-5" />}
        placeholder="Search by name or location..."
        className="!py-2 sm:!py-3 text-sm sm:text-base"
      />

      <div className="max-h-[400px] overflow-y-auto space-y-2">
        {isLoadingCourses ? (
          <div className="text-center py-4 text-gray-500 text-xs sm:text-sm">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-xs sm:text-sm">No courses found</div>
        ) : (
          filteredCourses.map((course) => (
            <Button
              key={course.id}
              variant={selectedCourseId === course.id ? 'primary' : 'secondary'}
              className="w-full justify-start !px-4 !py-2 sm:!py-3"
              onClick={() => setSelectedCourseId(course.id)}
            >
              <div className="text-left">
                <div className="font-medium text-sm sm:text-base">{course.name}</div>
                <div className="text-xs sm:text-sm opacity-80">{course.address}</div>
              </div>
            </Button>
          ))
        )}
      </div>
    </div>
  );
}