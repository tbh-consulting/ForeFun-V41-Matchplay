import React from 'react';
import { MapPin, Calendar, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CourseRating } from '../shared/CourseRating';
import { DogPolicyBadge } from '../shared/DogPolicyBadge';
import { formatCourseDate } from '../../utils/dateUtils';
import { Course } from '../../types';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface CourseHeaderProps {
  course: Course;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative">
      <div className="h-64 w-full rounded-xl overflow-hidden">
        <img
          src={course.imageUrl || 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1200&h=400'}
          alt={course.name}
          className="w-full h-full object-cover"
        />
        {course.dogPolicy === 'yes' && (
          <div className="absolute top-4 right-4">
            <DogPolicyBadge 
              policy="yes" 
              size="md" 
              className="shadow-lg !bg-white !text-green-700 !border-green-200" 
            />
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{course.name}</h1>
            <div className="flex items-center text-white/90 space-x-4">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{course.address}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Added {formatCourseDate(course.createdAt)}</span>
              </div>
              <CourseRating courseId={course.id} showCount className="text-white" />
            </div>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => navigate(`/courses/${course.id}/edit`)}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors duration-200"
              aria-label="Edit course"
            >
              <Pencil className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}