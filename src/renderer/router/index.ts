import { lazy } from 'react';
import Startup from '@renderer/pages/startup';

const router = [
  {
    path: '/',
    Component: lazy(() => import('@renderer/pages/home')),
  },
  {
    path: '/startup',
    Component: Startup,
  },
  {
    path: '/dialog',
    Component: lazy(() => import('@renderer/pages/dialog')),
  },
  {
    path: '/window',
    Component: lazy(() => import('@renderer/pages/window')),
  },
  {
    path: '/file-manager',
    Component: lazy(() => import('@renderer/pages/file-manager')),
  },
];

export default router;
