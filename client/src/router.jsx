import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Farms } from './pages/Farms';
import { AdvisoryNew } from './pages/AdvisoryNew';
import { AdvisoryForm } from './pages/AdvisoryForm';
import { AdvisoryDetail } from './pages/AdvisoryDetail';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password', element: <ResetPassword /> },

      // Protected Routes
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'farms',
        element: (
          <ProtectedRoute>
            <Farms />
          </ProtectedRoute>
        )
      },
      {
        path: 'advisory/new',
        element: (
          <ProtectedRoute>
            <AdvisoryNew />
          </ProtectedRoute>
        )
      },
      {
        path: 'advisory/new/:module',
        element: (
          <ProtectedRoute>
            <AdvisoryForm />
          </ProtectedRoute>
        )
      },
      {
        path: 'advisory/:id',
        element: (
          <ProtectedRoute>
            <AdvisoryDetail />
          </ProtectedRoute>
        )
      },
      {
        path: 'history',
        element: (
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        )
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )
      },
      { path: '*', element: <NotFound /> }
    ]
  }
]);
