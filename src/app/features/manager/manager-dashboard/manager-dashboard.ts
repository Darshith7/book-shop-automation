import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookService } from '../../../core/services/book.service';
import { SalesService } from '../../../core/services/sales.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { RequestService } from '../../../core/services/request.service';
import { PublisherService } from '../../../core/services/publisher.service';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, InrCurrencyPipe],
  template: `
    <div class="py-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="badge badge-neutral">Owner & Manager Console</span>
            <span class="text-xs text-neutral-500 font-mono">Store Supervision</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-bold font-serif text-neutral-900">
            Bookshop Management Dashboard
          </h1>
        </div>
        <div class="flex items-center gap-3">
          <a routerLink="/manager/reorder-report" class="btn btn-accent btn-sm">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            Daily Reorder Report ({{ booksBelowThresholdCount }})
          </a>
          <a routerLink="/manager/books" class="btn btn-primary btn-sm">
            + Add New Book
          </a>
        </div>
      </div>

      <!-- Critical Inventory Alert (If any book below threshold) -->
      @if (booksBelowThresholdCount > 0) {
        <div class="card p-4 mb-6 bg-amber-50 border-amber-300 flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-lg shrink-0">
              ⚠️
            </div>
            <div>
              <h3 class="font-bold text-sm text-amber-950">
                Action Required: {{ booksBelowThresholdCount }} Title(s) Below Inventory Reorder Threshold
              </h3>
              <p class="text-xs text-amber-800">
                Calculated using 14-day sales volume &times; publisher lead time. Run the daily reorder report to generate replenishment orders with full publisher addresses.
              </p>
            </div>
          </div>
          <a routerLink="/manager/reorder-report" class="btn btn-sm btn-accent whitespace-nowrap">
            Generate Today's Reorder Report &rarr;
          </a>
        </div>
      }

      <!-- 7 KPI Metric Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <!-- 1. Titles in Catalogue -->
        <div class="stat-card">
          <div class="stat-icon bg-emerald-100 text-emerald-800">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ totalCatalogueTitles }}</div>
            <div class="stat-label">Catalogue Titles</div>
          </div>
        </div>

        <!-- 2. Total Stock Units -->
        <div class="stat-card">
          <div class="stat-icon bg-blue-100 text-blue-800">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ totalStockUnits }}</div>
            <div class="stat-label">Total Stock Units</div>
          </div>
        </div>

        <!-- 3. Sales Revenue -->
        <div class="stat-card">
          <div class="stat-icon bg-purple-100 text-purple-800">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ totalSalesRevenue | inrCurrency }}</div>
            <div class="stat-label">Total Sales Revenue</div>
          </div>
        </div>

        <!-- 4. Copies Sold -->
        <div class="stat-card">
          <div class="stat-icon bg-teal-100 text-teal-800">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ totalCopiesSold }}</div>
            <div class="stat-label">Copies Sold to Date</div>
          </div>
        </div>

        <!-- 5. Customer Enquiry Counts -->
        <div class="stat-card">
          <div class="stat-icon bg-amber-100 text-amber-800">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ totalEnquiriesCount }}</div>
            <div class="stat-label">In-Store Queries</div>
          </div>
        </div>

        <!-- 6. Unavailable Requests -->
        <div class="stat-card">
          <div class="stat-icon bg-rose-100 text-rose-800">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ unavailableRequestsCount }}</div>
            <div class="stat-label">Procurement Requests</div>
          </div>
        </div>

        <!-- 7. Books Below Threshold -->
        <div class="stat-card" [ngClass]="booksBelowThresholdCount > 0 ? 'border-amber-300 bg-amber-50/30' : ''">
          <div class="stat-icon bg-red-100 text-red-800">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div>
            <div class="stat-value text-red-700">{{ booksBelowThresholdCount }}</div>
            <div class="stat-label">Below Reorder Level</div>
          </div>
        </div>

        <!-- 8. Registered Publishers -->
        <div class="stat-card">
          <div class="stat-icon bg-indigo-100 text-indigo-800">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ registeredPublishersCount }}</div>
            <div class="stat-label">Publishers On File</div>
          </div>
        </div>
      </div>

      <!-- Quick Manager Navigation Hub -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card p-6">
          <h3 class="font-bold text-base text-neutral-900 font-serif mb-2">Catalogue & Inventory</h3>
          <p class="text-xs text-neutral-600 mb-4">
            Maintain title records, update selling prices, adjust publisher mappings, and review available physical stock.
          </p>
          <div class="flex flex-col gap-2">
            <a routerLink="/manager/books" class="btn btn-outline btn-sm text-left justify-start">
              &rarr; Manage Books & Prices
            </a>
            <a routerLink="/manager/publishers" class="btn btn-outline btn-sm text-left justify-start">
              &rarr; Manage Publishers & Lead Times
            </a>
          </div>
        </div>

        <div class="card p-6">
          <h3 class="font-bold text-base text-neutral-900 font-serif mb-2">Management Intelligence</h3>
          <p class="text-xs text-neutral-600 mb-4">
            Analyze customer enquiry demand trends and review financial sales statistics for any arbitrary reporting period.
          </p>
          <div class="flex flex-col gap-2">
            <a routerLink="/manager/demand-report" class="btn btn-outline btn-sm text-left justify-start">
              &rarr; Customer Demand Report
            </a>
            <a routerLink="/manager/sales-statistics" class="btn btn-outline btn-sm text-left justify-start">
              &rarr; Sales Statistics (Date Range)
            </a>
          </div>
        </div>

        <div class="card p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <h3 class="font-bold text-base text-amber-950 font-serif mb-2">Replenishment Operations</h3>
          <p class="text-xs text-amber-800 mb-4">
            Daily threshold calculation: 14-day sales volume &times; procurement days. Generates publisher procurement purchase orders.
          </p>
          <div class="flex flex-col gap-2">
            <a routerLink="/manager/reorder-report" class="btn btn-accent btn-sm text-left justify-start font-bold">
              &rarr; Generate Daily Reorder Report
            </a>
            <a routerLink="/manager/requests" class="btn btn-outline btn-sm text-left justify-start">
              &rarr; Customer Procurement Requests
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .w-4 { width: 1rem; }
    .h-4 { height: 1rem; }
    .w-6 { width: 1.5rem; }
    .h-6 { height: 1.5rem; }
  `]
})
export class ManagerDashboardComponent {
  private bookService = inject(BookService);
  private salesService = inject(SalesService);
  private inventoryService = inject(InventoryService);
  private requestService = inject(RequestService);
  private publisherService = inject(PublisherService);

  get totalCatalogueTitles(): number {
    return this.bookService.getAllBooks().length;
  }

  get totalStockUnits(): number {
    return this.inventoryService.getTotalStockUnits();
  }

  get totalSalesRevenue(): number {
    return this.salesService.getAllSales().reduce((sum, s) => sum + s.totalAmount, 0);
  }

  get totalCopiesSold(): number {
    return this.salesService.getAllSales().reduce((sum, s) => {
      return sum + s.items.reduce((acc, it) => acc + it.quantity, 0);
    }, 0);
  }

  get totalEnquiriesCount(): number {
    return this.bookService.getAllBooks().reduce((sum, b) => sum + b.requestCount, 0);
  }

  get unavailableRequestsCount(): number {
    return this.requestService.getAllRequests().length;
  }

  get booksBelowThresholdCount(): number {
    return this.inventoryService.getBooksBelowThreshold().length;
  }

  get registeredPublishersCount(): number {
    return this.publisherService.getAllPublishers().length;
  }
}

