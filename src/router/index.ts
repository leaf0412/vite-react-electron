import Home from '@/pages/home';
import Dialog from '@/pages/dialog';
import Window from '@/pages/window';

const router = [
  {
    path: '/',
    Component: Home,
  },
  {
    path: '/dialog',
    Component: Dialog,
  },
  {
    path: '/window',
    Component: Window,
  },
];

export default router;
