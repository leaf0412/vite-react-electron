import Home from '@/pages/home';
import Dialog from '@/pages/dialog';
import Window from '@/pages/window';
import FileManager from '@/pages/file-manager';

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
  {
    path: '/file-manager',
    Component: FileManager,
  },
];

export default router;
