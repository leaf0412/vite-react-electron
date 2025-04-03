import { lazy } from 'react';
import Startup from '@/pages/startup';

const router = [
  {
    path: '/',
    Component: lazy(() => import('@/pages/home')),
  },
  {
    path: '/startup',
    Component: Startup,
  },
  {
    path: '/dialog',
    Component: lazy(() => import('@/pages/dialog')),
  },
  {
    path: '/window',
    Component: lazy(() => import('@/pages/window')),
  },
  {
    path: '/file-manager',
    Component: lazy(() => import('@/pages/file-manager')),
  },
];

export default router;
