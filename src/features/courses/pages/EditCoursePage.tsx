import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { CourseForm } from '../components/CourseForm/CourseForm';
import { ConnectionRequired } from '@/components/shared/ConnectionRequired';
import { useEditCourse } from '../hooks/useEditCourse';
import { isSupabaseConfigured } from '@/lib/supabase';

export function EditCoursePage() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { course, updateCourse, isLoading, error, refresh } = useEditCourse(courseId!);

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

  const formData = {
    course: {
      name: course.name,
      address: course.address,
      country: course.country,
      description: course.description,
      holes: course.holes as 9 | 18,
      imageUrl: course.imageUrl,
      dogPolicy: course.dogPolicy,
    },
    holes: course.courseHoles?.map(hole => ({
      holeNumber: hole.holeNumber,
      par: Number(hole.par),
      handicap: hole.handicap,
      distanceBlackMeters: hole.distanceBlackMeters,
      distanceWhiteMeters: hole.distanceWhiteMeters,
      distanceYellowMeters: hole.distanceYellowMeters,
      distanceBlueMeters: hole.distanceBlueMeters,
      distanceRedMeters: hole.distanceRedMeters,
    })) || [],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="secondary"
          className="mr-4"
          onClick={() => navigate(`/courses/${courseId}`)}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Course
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
      </div>

      <CourseForm
        initialData={formData}
        onSubmit={updateCourse}
        isLoading={isLoading}
        mode="edit"
      />
    </div>
  );
}