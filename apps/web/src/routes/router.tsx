/* oxlint-disable react/only-export-components -- route-level lazy components belong with the router */
import {
  BookOpen,
  CalendarDays,
  FileText,
  ListTodo,
  Settings,
  Shapes,
} from 'lucide-react';
import { lazy, type ReactNode, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { ModulePlaceholder } from '@/components/feedback/module-placeholder';
import { PageLoader } from '@/components/feedback/page-loader';
import { AppLayout } from '@/layouts/app-layout';
import { AuthLayout } from '@/layouts/auth-layout';
import { PublicLayout } from '@/layouts/public-layout';
import { NotFoundPage } from '@/routes/not-found-page';
import { ProtectedRoute } from '@/routes/protected-route';

const HomePage = lazy(() =>
  import('@/features/welcome/home-page').then((module) => ({
    default: module.HomePage,
  })),
);
const WelcomePage = lazy(() =>
  import('@/features/welcome/welcome-page').then((module) => ({
    default: module.WelcomePage,
  })),
);
const LoginPage = lazy(() =>
  import('@/features/auth/login-page').then((module) => ({
    default: module.LoginPage,
  })),
);
const RegisterPage = lazy(() =>
  import('@/features/auth/register-page').then((module) => ({
    default: module.RegisterPage,
  })),
);
const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/forgot-password-page').then((module) => ({
    default: module.ForgotPasswordPage,
  })),
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard/dashboard-page').then((module) => ({
    default: module.DashboardPage,
  })),
);

function lazyPage(page: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{page}</Suspense>;
}

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
      { path: '/', element: lazyPage(<HomePage />) },
      { path: '/welcome', element: lazyPage(<WelcomePage />) },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: lazyPage(<LoginPage />) },
      { path: '/register', element: lazyPage(<RegisterPage />) },
      {
        path: '/forgot-password',
        element: lazyPage(<ForgotPasswordPage />),
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: lazyPage(<DashboardPage />) },
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
