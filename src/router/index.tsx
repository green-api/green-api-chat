import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';

import BaseLayout from 'components/layouts/base-layout.component';
import { Routes } from 'configs';
import Main from 'pages/main.page';

export const routerConfig: RouteObject[] = [
  {
    path: Routes.main,
    element: <BaseLayout />,
    children: [{ index: true, element: <Main /> }],
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
