import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { CourseForm } from '../components/CourseForm/CourseForm';
import { useCreateCourse } from '../hooks/useCreateCourse';

export function NewCoursePage() {
  const navigate = useNavigate();
  const { createCourse, isLoading } = useCreateCourse();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="secondary"
          className="mr-4"
          onClick={() => navigate('/courses')}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Courses
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Course</h1>
      </div>

      <CourseForm
        onSubmit={createCourse}
        isLoading={isLoading}
      />
    </div>
  );
}