import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/shared/Toast/useToast';
import { Course, CourseFilters, CourseSortOption } from '../types';
import { SupabaseError } from '@/lib/supabase/error-handler';
import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabase';

interface UseCoursesOptions {
  sort?: CourseSortOption;
  limit?: number;
}

export function useCourses(options?: UseCoursesOptions) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchCourses = useCallback(async (
    search?: string,
    filters?: CourseFilters,
    sort?: CourseSortOption,
    limit?: number
  ) => {
    if (!isSupabaseConfigured()) {
      setError('Database connection not configured');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('courses')
        .select(`
          id,
          name,
          address,
          country,
          description,
          holes,
          image_url,
          dog_policy,
          created_by,
          created_at,
          updated_at
        `);

      // Apply search filter
      if (search) {
        query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
      }

      // Apply filters
      if (filters?.dogFriendly) {
        query = query.eq('dog_policy', 'yes');
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      setCourses(data?.map(course => ({
        id: course.id,
        name: course.name,
        address: course.address,
        country: course.country,
        description: course.description,
        holes: course.holes,
        imageUrl: course.image_url,
        dogPolicy: course.dog_policy,
        createdBy: course.created_by,
        createdAt: course.created_at,
        updatedAt: course.updated_at
      })) || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      const message = error instanceof SupabaseError 
        ? error.message 
        : 'Failed to load courses';
      setError(message);
      addToast('error', message);
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchCourses(undefined, undefined, options?.sort, options?.limit);
  }, [fetchCourses, options?.sort, options?.limit]);

  return {
    courses,
    isLoading,
    error,
    fetchCourses,
    refresh: () => fetchCourses(undefined, undefined, options?.sort, options?.limit)
  };
}