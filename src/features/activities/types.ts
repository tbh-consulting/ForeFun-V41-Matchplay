export interface Activity {
  id: string;
  userId: string;
  type: 'course_created' | 'scorecard_created' | 'friend_added' | 'course_reviewed';
  data: {
    courseId?: string;
    courseName?: string;
    scorecardId?: string;
    friendId?: string;
    friendName?: string;
    rating?: number;
    review?: string;
  };
  createdAt: string;
}