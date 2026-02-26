import { createBrowserRouter } from 'react-router'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      lazy: () => import('./components/Layout'),
      children: [
        {
          index: true,
          lazy: () => import('./features/dashboard/components/HomePage'),
        },
        {
          path: 'create',
          lazy: () =>
            import('./features/cake-request/components/CreateRequestPage'),
        },
        {
          path: 'concepts/:id',
          lazy: () =>
            import('./features/cake-request/components/ConceptDetailPage'),
        },
        {
          path: 'bank',
          lazy: () => import('./features/cake-bank/components/CakeBankPage'),
        },
        {
          path: 'bonanza',
          lazy: () => import('./features/bonanza/components/BonanzaPage'),
        },
      ],
    },
    {
      // Share page lives outside the main layout (public view)
      path: 'share/:token',
      lazy: () => import('./features/sharing/components/SharePage'),
    },
  ],
  {
    basename,
  }
)
