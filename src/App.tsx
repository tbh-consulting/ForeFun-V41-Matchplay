import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { ProfilePage } from './features/profile/pages/ProfilePage';
import { UserProfilePage } from './features/profile/pages/UserProfilePage';
import { StatsPage } from './features/stats/pages/StatsPage';
import { RankingPage } from './features/ranking/pages/RankingPage';
import { FriendsPage } from './features/friends/pages/FriendsPage';
import { NotificationsPage } from './features/friends/pages/NotificationsPage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { LandingPage } from './features/landing/pages/LandingPage';
import { CourseListPage } from './features/courses/pages/CourseListPage';
import { NewCoursePage } from './features/courses/pages/NewCoursePage';
import { CourseDetailsPage } from './features/courses/pages/CourseDetailsPage';
import { EditCoursePage } from './features/courses/pages/EditCoursePage';
import { ScorecardListPage } from './features/scorecards/pages/ScorecardListPage';
import { NewScorecardPage } from './features/scorecards/pages/NewScorecardPage';
import { ScorecardDetailsPage } from './features/scorecards/pages/ScorecardDetailsPage';
import { ScorecardSetupPage } from './features/scorecards/pages/ScorecardSetupPage';
import { TermsPage } from './features/legal/pages/TermsPage';
import { AboutPage } from './features/legal/pages/AboutPage';
import { PrivacyPage } from './features/legal/pages/PrivacyPage';
import { PrivateRoute } from './components/shared/PrivateRoute';
import { useAuth } from './features/auth/hooks/useAuth';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/profile/:userId" element={<PrivateRoute><UserProfilePage /></PrivateRoute>} />
        <Route path="/stats" element={<PrivateRoute><StatsPage /></PrivateRoute>} />
        <Route path="/ranking" element={<PrivateRoute><RankingPage /></PrivateRoute>} />
        <Route path="/friends" element={<PrivateRoute><FriendsPage /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
        
        {/* Course routes */}
        <Route path="/courses" element={<PrivateRoute><CourseListPage /></PrivateRoute>} />
        <Route path="/courses/new" element={<PrivateRoute><NewCoursePage /></PrivateRoute>} />
        <Route path="/courses/:courseId" element={<PrivateRoute><CourseDetailsPage /></PrivateRoute>} />
        <Route path="/courses/:courseId/edit" element={<PrivateRoute><EditCoursePage /></PrivateRoute>} />

        {/* Scorecard routes */}
        <Route path="/scorecards" element={<PrivateRoute><ScorecardListPage /></PrivateRoute>} />
        <Route path="/scorecards/new" element={<PrivateRoute><NewScorecardPage /></PrivateRoute>} />
        <Route path="/scorecards/:scorecardId" element={<PrivateRoute><ScorecardDetailsPage /></PrivateRoute>} />
        <Route path="/scorecards/:scorecardId/setup" element={<PrivateRoute><ScorecardSetupPage /></PrivateRoute>} />
      </Routes>
    </Layout>
  );
}