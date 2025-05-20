export interface Profile {
  id: string;
  username: string;
  email: string;
  fullName?: string | null;
  handicap?: number | null;
  homeClub?: string | null;
  language?: string | null;
  phone?: string | null;
  address?: string | null;
  country?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileFormData {
  username: string;
  email: string;
  fullName?: string | null;
  handicap?: number | null;
  homeClub?: string | null;
  language?: string | null;
  phone?: string | null;
  address?: string | null;
  country?: string | null;
  avatarUrl?: string | null;
}