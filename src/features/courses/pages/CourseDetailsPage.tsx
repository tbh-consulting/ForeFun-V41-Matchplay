import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { CourseHeader } from '../components/CourseDetails/CourseHeader';
import { CourseDescription } from '../components/CourseDetails/CourseDescription';
import { HoleList } from '../components/CourseDetails/HoleList';
import { CourseReviews } from '../components/CourseReview/CourseReviews';
import { ConnectionRequired } from '@/components/shared/ConnectionRequired';
import { Button } from '@/components/shared/Button';
import { useCourseDetails } from '../hooks/useCourseDetails';
import { isSupabaseConfigured } from '@/lib/supabase';

export function CourseDetailsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, isLoading, error, refresh } = useCourseDetails(courseId!);

  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ConnectionRequired />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {error}
        </h3>
        <Button variant="secondary" onClick={refresh} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Course not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <CourseHeader course={course} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          <CourseDescription description={course.description} />
          <HoleList holes={course.courseHoles} />
        </div>
        <div className="space-y-8">
          <CourseReviews
            courseId={course.id}
            reviews={course.reviews || []}
            onReviewAdded={refresh}
          />
        </div>
      </div>
    </div>
  );
}