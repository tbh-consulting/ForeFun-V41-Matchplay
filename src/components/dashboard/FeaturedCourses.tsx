import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '@/features/courses/hooks/useCourses';
import { CourseCard } from '@/features/courses/components/CourseList/CourseCard';
import { LoadingCourseCard } from './LoadingCourseCard';
import { ConnectionRequired } from '@/components/shared/ConnectionRequired';
import { isSupabaseConfigured } from '@/lib/supabase';

export function FeaturedCourses() {
  const navigate = useNavigate();
  const { courses, isLoading } = useCourses({
    sort: { field: 'created_at', direction: 'desc' },
    limit: 10
  });

  if (!isSupabaseConfigured()) {
    return <ConnectionRequired />;
  }

  return (
    <section className="py-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <LoadingCourseCard />
            <LoadingCourseCard />
          </>
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={(id) => navigate(`/courses/${id}`)}
            />
          ))
        ) : (
          <div className="col-span-2 bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">No courses available yet</p>
          </div>
        )}
      </div>
    </section>
  );
}