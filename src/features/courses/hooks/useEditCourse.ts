import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/shared/Toast/useToast';
import { Course, CourseFormData } from '../types';
import { SupabaseError } from '@/lib/supabase/error-handler';
import { isSupabaseConfigured } from '@/lib/supabase';
import { fetchCourseDetails } from '../services/courseDetailsService';
import { updateCourse as updateCourseService } from '../services/courseUpdateService';

export function useEditCourse(courseId: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function loadCourse() {
      if (!isSupabaseConfigured()) {
        setError('Database connection not configured');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchCourseDetails(courseId);
        
        if (!mounted) return;
        setCourse(data);
      } catch (error) {
        console.error('Error fetching course:', error);
        if (!mounted) return;

        const message = error instanceof SupabaseError 
          ? error.message 
          : 'Failed to load course details';
        
        setError(message);
        addToast('error', message);
        navigate('/courses');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadCourse();

    return () => {
      mounted = false;
    };
  }, [courseId, addToast, navigate]);

  const updateCourse = async (data: CourseFormData) => {
    if (!isSupabaseConfigured()) {
      addToast('error', 'Database connection not configured');
      return;
    }

    try {
      setIsLoading(true);
      await updateCourseService(courseId, data);
      addToast('success', 'Course updated successfully!');
      navigate(`/courses/${courseId}`);
    } catch (error) {
      console.error('Error updating course:', error);
      const message = error instanceof SupabaseError 
        ? error.message 
        : 'Failed to update course';
      addToast('error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    course,
    updateCourse,
    isLoading,
    error,
    refresh: () => {
      setCourse(null);
      setError(null);
      setIsLoading(true);
    }
  };
}