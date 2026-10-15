import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';

// Public & Landing
import { LandingPageView } from '@/features/landing/LandingPageView';
import { PublicPortalView } from '@/features/public-portal/PublicPortalView';
import { PublicProjectDetailView } from '@/features/public-portal/PublicProjectDetailView';

// Auth
import { LoginView } from '@/features/auth/LoginView';
import { AcceptInviteView } from '@/features/auth/AcceptInviteView';

// App Views
import { PortfolioDashboardView } from '@/features/portfolio/PortfolioDashboardView';
import { ProjectsRegistryView } from '@/features/projects/ProjectsRegistryView';
import { NewProjectView } from '@/features/projects/NewProjectView';
import { ProjectDetailView } from '@/features/projects/ProjectDetailView';
import { CsvImportView } from '@/features/imports/CsvImportView';
import { InterventionsHubView } from '@/features/interventions/InterventionsHubView';
import { AlertsView } from '@/features/alerts/AlertsView';

// Admin Views
import { UsersView } from '@/features/administration/UsersView';
import { ModelRegistryView } from '@/features/administration/ModelRegistryView';
import { RiskPolicyView } from '@/features/administration/RiskPolicyView';
import { AuditTrailView } from '@/features/administration/AuditTrailView';
import { SystemHealthView } from '@/features/administration/SystemHealthView';

export const router = createBrowserRouter([
  // Public Marketing & Citizen Portal
  {
    path: '/',
    element: <LandingPageView />,
  },
  {
    path: '/public',
    element: <PublicPortalView />,
  },
  {
    path: '/public/projects',
    element: <PublicPortalView />,
  },
  {
    path: '/public/projects/:projectId',
    element: <PublicProjectDetailView />,
  },

  // Auth Routes
  {
    path: '/login',
    element: <LoginView />,
  },
  {
    path: '/accept-invite',
    element: <AcceptInviteView />,
  },
  {
    path: '/forgot-password',
    element: <LoginView />,
  },

  // Authenticated Operations Shell
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <PortfolioDashboardView />,
      },
      {
        path: 'projects',
        element: <ProjectsRegistryView />,
      },
      {
        path: 'projects/new',
        element: <NewProjectView />,
      },
      {
        path: 'projects/:projectId',
        element: <ProjectDetailView />,
      },
      {
        path: 'imports',
        element: <CsvImportView />,
      },
      {
        path: 'interventions',
        element: <InterventionsHubView />,
      },
      {
        path: 'reviews',
        element: <InterventionsHubView />,
      },
      {
        path: 'alerts',
        element: <AlertsView />,
      },
      {
        path: 'reports',
        element: <ProjectsRegistryView />,
      },
      {
        path: 'settings',
        element: <SystemHealthView />,
      },

      // Admin & Governance Sub-routes
      {
        path: 'admin/users',
        element: <UsersView />,
      },
      {
        path: 'admin/organizations',
        element: <UsersView />,
      },
      {
        path: 'admin/models',
        element: <ModelRegistryView />,
      },
      {
        path: 'admin/risk-policies',
        element: <RiskPolicyView />,
      },
      {
        path: 'admin/audit',
        element: <AuditTrailView />,
      },
      {
        path: 'admin/system-health',
        element: <SystemHealthView />,
      },
    ],
  },

  // Catch-all redirect
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
