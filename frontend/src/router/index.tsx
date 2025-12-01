import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import InterviewLayout from '../layouts/InterviewLayout';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import AcceptInvitationPage from '../pages/AcceptInvitationPage';
import DashboardPage from '../pages/DashboardPage';
import TeamManagementPage from '../pages/TeamManagementPage';
import InterviewPage from '../pages/InterviewPage';
import NotFoundPage from '../pages/NotFoundPage';

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
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: 'auth/accept-invitation',
        element: <AcceptInvitationPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
        ],
      },
      {
        path: 'teams',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <TeamManagementPage />,
          },
        ],
      },
      {
        path: 'interview/:interviewId',
        element: <InterviewLayout />,
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
