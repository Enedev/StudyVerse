/* oxlint-disable react/only-export-components -- route-level lazy components belong with the router */
import { lazy, type ReactNode, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

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
const TasksPage = lazy(() =>
  import('@/features/tasks/tasks-page').then((module) => ({
    default: module.TasksPage,
  })),
);
const CalendarPage = lazy(() =>
  import('@/features/calendar/calendar-page').then((module) => ({
    default: module.CalendarPage,
  })),
);
const WhiteboardsPage = lazy(() =>
  import('@/features/whiteboards/whiteboards-page').then((module) => ({
    default: module.WhiteboardsPage,
  })),
);
const WhiteboardDetailPage = lazy(() =>
  import('@/features/whiteboards/whiteboard-detail-page').then((module) => ({
    default: module.WhiteboardDetailPage,
  })),
);
const LibraryPage = lazy(() =>
  import('@/features/library/library-page').then((module) => ({
    default: module.LibraryPage,
  })),
);
const LibraryDetailPage = lazy(() =>
  import('@/features/library/library-detail-page').then((module) => ({
    default: module.LibraryDetailPage,
  })),
);
const DocumentsPage = lazy(() =>
  import('@/features/documents/documents-page').then((module) => ({
    default: module.DocumentsPage,
  })),
);
const DocumentDetailPage = lazy(() =>
  import('@/features/documents/document-detail-page').then((module) => ({
    default: module.DocumentDetailPage,
  })),
);
const SettingsPage = lazy(() =>
  import('@/features/settings/settings-page').then((module) => ({
    default: module.SettingsPage,
  })),
);

function lazyPage(page: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{page}</Suspense>;
}

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
          { path: '/tasks', element: lazyPage(<TasksPage />) },
          { path: '/calendar', element: lazyPage(<CalendarPage />) },
          { path: '/whiteboards', element: lazyPage(<WhiteboardsPage />) },
          {
            path: '/whiteboards/:id',
            element: lazyPage(<WhiteboardDetailPage />),
          },
          { path: '/library', element: lazyPage(<LibraryPage />) },
          {
            path: '/library/:id',
            element: lazyPage(<LibraryDetailPage />),
          },
          { path: '/documents', element: lazyPage(<DocumentsPage />) },
          {
            path: '/documents/:id',
            element: lazyPage(<DocumentDetailPage />),
          },
          { path: '/settings', element: lazyPage(<SettingsPage />) },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
