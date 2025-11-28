import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import InterviewLayout from '../layouts/InterviewLayout';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import DashboardPage from '../pages/DashboardPage';
import InterviewPage from '../pages/InterviewPage';
import NotFoundPage from '../pages/NotFoundPage';
import PrivateRoute from '../components/auth/PrivateRoute';

const routes = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'signup',
        element: <SignupPage />,
      },
      {
        path: 'dashboard',
        element: (
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
        ],
      },
      {
        path: 'interview/:interviewId',
        element: (
          <PrivateRoute>
            <InterviewLayout />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <InterviewPage />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
