import React from 'react';
import { MapPin, Flag } from 'lucide-react';
import { Course } from '../../types';
import { CourseRating } from '../shared/CourseRating';
import { DogPolicyBadge } from '../shared/DogPolicyBadge';

interface CourseCardProps {
  course: Course;
  onClick: (courseId: string) => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
      onClick={() => onClick(course.id)}
    >
      <div className="relative">
        <img
          src={course.imageUrl || 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=800&h=400'}
          alt={course.name}
          className="w-full h-36 sm:h-48 object-cover"
        />
        {course.dogPolicy === 'yes' && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
            <DogPolicyBadge policy="yes" size="sm" className="shadow-lg" />
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-1">{course.name}</h3>
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
          <span className="text-xs sm:text-sm line-clamp-1">{course.address}</span>
        </div>
        <div className="flex items-center justify-between">
          <CourseRating courseId={course.id} showCount />
          <div className="flex items-center text-accent">
            <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            <span className="text-xs sm:text-sm font-medium">{course.holes} holes</span>
          </div>
        </div>
      </div>
    </div>
  );
}