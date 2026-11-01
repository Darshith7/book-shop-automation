import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // --- Customer Public Interface ---
  {
    path: '',
    loadComponent: () => import('./features/customer/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'browse',
    loadComponent: () => import('./features/customer/browse/browse').then(m => m.BrowseComponent)
  },
  {
    path: 'book/:isbn',
    loadComponent: () => import('./features/customer/book-details/book-details').then(m => m.BookDetailsComponent)
  },
  {
    path: 'request-book',
    loadComponent: () => import('./features/customer/request-book/request-book').then(m => m.RequestBookComponent)
  },

  // --- Sales Clerk Interface ---
  {
    path: 'clerk',
    canActivate: [roleGuard(['CLERK', 'MANAGER'])],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/clerk/clerk-dashboard/clerk-dashboard').then(m => m.ClerkDashboardComponent)
      },
      {
        path: 'pos-sale',
        loadComponent: () => import('./features/clerk/pos-sale/pos-sale').then(m => m.PosSaleComponent)
      },
      {
        path: 'sales-history',
        loadComponent: () => import('./features/clerk/sales-history/sales-history').then(m => m.SalesHistoryComponent)
      },
      {
        path: 'stock-receive',
        loadComponent: () => import('./features/clerk/stock-receive/stock-receive').then(m => m.StockReceiveComponent)
      }
    ]
  },

  // --- Manager / Owner Interface ---
  {
    path: 'manager',
    canActivate: [roleGuard(['MANAGER'])],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/manager/manager-dashboard/manager-dashboard').then(m => m.ManagerDashboardComponent)
      },
      {
        path: 'books',
        loadComponent: () => import('./features/manager/manage-books/manage-books').then(m => m.ManageBooksComponent)
      },
      {
        path: 'publishers',
        loadComponent: () => import('./features/manager/manage-publishers/manage-publishers').then(m => m.ManagePublishersComponent)
      },
      {
        path: 'demand-report',
        loadComponent: () => import('./features/manager/demand-report/demand-report').then(m => m.DemandReportComponent)
      },
      {
        path: 'sales-statistics',
        loadComponent: () => import('./features/manager/sales-statistics/sales-statistics').then(m => m.SalesStatisticsComponent)
      },
      {
        path: 'reorder-report',
        loadComponent: () => import('./features/manager/reorder-report/reorder-report').then(m => m.ReorderReportComponent)
      },
      {
        path: 'requests',
        loadComponent: () => import('./features/manager/view-requests/view-requests').then(m => m.ViewRequestsComponent)
      }
    ]
  },

  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
