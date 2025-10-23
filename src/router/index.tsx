import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';

import ErrorBoundary from 'components/error-boundary.component';
import BaseLayout from 'components/layouts/base-layout.component';
import { Routes } from 'configs';
import Main from 'pages/main.page';

export const routerConfig: RouteObject[] = [
  {
    element: (
      <ErrorBoundary>
        <BaseLayout />
      </ErrorBoundary>
    ),
    children: [{ path: Routes.main, element: <Main /> }],
  },
  {
    path: '*',
    element: <Navigate to={Routes.main} />,
  },
];

const router = createBrowserRouter(routerConfig);

export default router;
