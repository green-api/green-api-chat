import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';

import AuthLayout from 'components/layouts/auth-layout.component';
import BaseLayout from 'components/layouts/base-layout.component';
import { Routes } from 'configs';
import Auth from 'pages/auth.page';
import Main from 'pages/main.page';

export const routerConfig: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      {
        path: Routes.auth,
        element: <Auth />,
      },
    ],
  },
  {
    element: <BaseLayout />,
    children: [{ path: Routes.main, element: <Main /> }],
  },
  {
    path: '*',
    element: <Navigate to={Routes.main} />,
  },
];

const router = createBrowserRouter(routerConfig, {
  basename: Routes.baseUrl,
});

export default router;
