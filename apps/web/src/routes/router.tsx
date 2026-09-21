import {
  BookOpen,
  CalendarDays,
  FileText,
  ListTodo,
  Settings,
  Shapes,
} from 'lucide-react';
import { createBrowserRouter } from 'react-router-dom';

import { ModulePlaceholder } from '@/components/feedback/module-placeholder';
import { DashboardPage } from '@/features/dashboard/dashboard-page';
import { ForgotPasswordPage } from '@/features/auth/forgot-password-page';
import { LoginPage } from '@/features/auth/login-page';
import { RegisterPage } from '@/features/auth/register-page';
import { HomePage } from '@/features/welcome/home-page';
import { WelcomePage } from '@/features/welcome/welcome-page';
import { AppLayout } from '@/layouts/app-layout';
import { AuthLayout } from '@/layouts/auth-layout';
import { PublicLayout } from '@/layouts/public-layout';
import { NotFoundPage } from '@/routes/not-found-page';
import { ProtectedRoute } from '@/routes/protected-route';

const modulePages = {
  tasks: (
    <ModulePlaceholder
      icon={ListTodo}
      eyebrow="Plan"
      title="Tasks"
      description="A focused home for assignments, subtasks, priorities, and the small steps that create momentum."
      plannedFeatures={[
        'Tasks and subtasks',
        'Priorities and due dates',
        'Subjects and tags',
        'Filters and sorting',
      ]}
    />
  ),
  calendar: (
    <ModulePlaceholder
      icon={CalendarDays}
      eyebrow="Schedule"
      title="Calendar"
      description="A clear view of deadlines, study sessions, and the academic rhythm ahead."
      plannedFeatures={[
        'Month, week, and day views',
        'Events and deadlines',
        'Recurring events',
        'Subject colors',
      ]}
    />
  ),
  whiteboards: (
    <ModulePlaceholder
      icon={Shapes}
      eyebrow="Explore"
      title="Whiteboards"
      description="An infinite canvas for visual thinking, explanation, and collaboration powered by tldraw."
      plannedFeatures={[
        'Infinite tldraw canvas',
        'Pages and persistence',
        'Sharing permissions',
        'Realtime collaboration',
      ]}
    />
  ),
  library: (
    <ModulePlaceholder
      icon={BookOpen}
      eyebrow="Collect"
      title="Library"
      description="A personal collection of books and readings that remembers where you left off."
      plannedFeatures={[
        'Book metadata and covers',
        'Reading progress',
        'Favorites',
        'Search and filters',
      ]}
    />
  ),
  documents: (
    <ModulePlaceholder
      icon={FileText}
      eyebrow="Read"
      title="Documents"
      description="A purposeful PDF reading space for searching, annotating, and learning."
      plannedFeatures={[
        'Private PDF uploads',
        'Page navigation and zoom',
        'Search and thumbnails',
        'Annotations and bookmarks',
      ]}
    />
  ),
  settings: (
    <ModulePlaceholder
      icon={Settings}
      eyebrow="Personalize"
      title="Settings"
      description="Manage your profile, preferences, and account security."
      plannedFeatures={[
        'Profile details',
        'Appearance preferences',
        'Timezone settings',
        'Account security',
      ]}
    />
  ),
};

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/welcome', element: <WelcomePage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/tasks', element: modulePages.tasks },
          { path: '/calendar', element: modulePages.calendar },
          { path: '/whiteboards', element: modulePages.whiteboards },
          { path: '/whiteboards/:id', element: modulePages.whiteboards },
          { path: '/library', element: modulePages.library },
          { path: '/library/:id', element: modulePages.library },
          { path: '/documents', element: modulePages.documents },
          { path: '/documents/:id', element: modulePages.documents },
          { path: '/settings', element: modulePages.settings },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
