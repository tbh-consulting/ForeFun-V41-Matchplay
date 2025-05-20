import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { CourseCard } from '../components/CourseList/CourseCard';
import { CourseFilters } from '../components/CourseList/CourseFilters';
import { CourseSort } from '../components/CourseList/CourseSort';
import { CourseSearch } from '../components/CourseList/CourseSearch';
import { DogPolicyFilter } from '../components/CourseList/DogPolicyFilter';
import { Button } from '@/components/shared/Button';
import { ConnectionRequired } from '@/components/shared/ConnectionRequired';
import { useCourses } from '../hooks/useCourses';
import { CourseFilters as FilterType, CourseSortOption } from '../types';
import { isSupabaseConfigured } from '@/lib/supabase';

export function CourseListPage() {
  const navigate = useNavigate();
  const { courses, isLoading, error, fetchCourses } = useCourses();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterType>({});
  const [sort, setSort] = useState<CourseSortOption>({
    field: 'created_at',
    direction: 'desc'
  });

  useEffect(() => {
    fetchCourses(search, filters, sort);
  }, [search, filters, sort, fetchCourses]);

  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ConnectionRequired />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Golf Courses</h1>
          <p className="mt-1 text-gray-500 text-sm sm:text-base">Discover amazing golf courses near you</p>
        </div>
        <Button
          onClick={() => navigate('/courses/new')}
          className="flex items-center gap-2 !py-2 sm:!py-3 !px-4 sm:!px-6 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Add Course</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-6">
        <div className="space-y-3 sm:space-y-4">
          <CourseSearch onSearch={setSearch} />
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <CourseFilters
              filters={filters}
              onChange={setFilters}
            />
            <DogPolicyFilter
              showDogFriendly={filters.dogFriendly || false}
              onChange={(value) => setFilters(prev => ({ ...prev, dogFriendly: value }))}
            />
            <div className="ml-auto">
              <CourseSort
                sort={sort}
                onSort={setSort}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm h-[300px] sm:h-[400px] animate-pulse"
            >
              <div className="h-36 sm:h-48 bg-gray-200 rounded-t-lg" />
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 sm:py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error loading courses
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button variant="secondary" onClick={() => fetchCourses()}>
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={(id) => navigate(`/courses/${id}`)}
              />
            ))}
          </div>
          
          {courses.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or add a new course
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}