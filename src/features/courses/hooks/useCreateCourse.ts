import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/shared/Toast/useToast';
import { CourseFormData } from '../types';
import * as courseService from '../services/courseService';

export function useCreateCourse() {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const createCourse = async (data: CourseFormData) => {
    try {
      setIsLoading(true);
      await courseService.createCourse(data);
      addToast('success', 'Course created successfully!');
      navigate('/courses'); // Redirect to course list
    } catch (error) {
      console.error('Error creating course:', error);
      addToast('error', 'Failed to create course');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCourse,
    isLoading
  };
}