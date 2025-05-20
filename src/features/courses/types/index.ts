export interface CourseReview {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: {
    username: string;
    avatarUrl?: string;
  };
}

// ... rest of the types remain unchanged