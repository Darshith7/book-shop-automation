import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SalesService } from '../../../core/services/sales.service';
import { BookService } from '../../../core/services/book.service';
import { StaffAuthService } from '../../../core/services/staff-auth.service';
import { Sale } from '../../../core/models/sale.model';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { ReceiptModalComponent } from '../../../shared/components/receipt-modal/receipt-modal';

@Component({
  selector: 'app-clerk-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, InrCurrencyPipe, ReceiptModalComponent],
  template: `
    <div class="py-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="badge badge-info">Front Counter Terminal</span>
            <span class="text-xs text-neutral-500 font-mono">Logged in as: {{ clerkName }}</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-bold font-serif text-neutral-900">
            Sales Clerk Point of Sale
          </h1>
        </div>
        <div class="flex items-center gap-3">
          <a routerLink="/clerk/stock-receive" class="btn btn-sm btn-outline">
            Receive Stock Copies
          </a>
          <a routerLink="/clerk/pos-sale" class="btn btn-primary">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Process New Sale (ISBN)
          </a>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="stat-card">
          <div class="stat-icon bg-emerald-100 text-emerald-800">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ todaySalesRevenue | inrCurrency }}</div>
            <div class="stat-label">Today's Sales Revenue</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-sky-100 text-sky-800">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ todaySalesCount }}</div>
            <div class="stat-label">Today's Invoices Completed</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-purple-100 text-purple-800">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ totalLifetimeSales }}</div>
            <div class="stat-label">Total Completed Transactions</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-amber-100 text-amber-800">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <div>
            <div class="stat-value">{{ inStockTitlesCount }} / {{ totalTitlesCount }}</div>
            <div class="stat-label">Titles Currently in Stock</div>
          </div>
        </div>
      </div>

      <!-- Quick Action Callout -->
      <div class="card p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-emerald-950 font-serif">Customer at the Counter with a Book?</h2>
          <p class="text-xs text-emerald-800 mt-1 max-w-xl">
            When a customer presents an ISBN or brings a selected physical book, enter the ISBN to look up live inventory, specify the quantity, deduct stock, and print an official tax invoice receipt.
          </p>
        </div>
        <a routerLink="/clerk/pos-sale" class="btn btn-primary shrink-0">
          Open POS Billing Screen &rarr;
        </a>
      </div>

      <!-- Recent Sales Table -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="font-bold text-base text-neutral-900 font-serif">Recent Retail Transactions</h3>
            <p class="text-xs text-neutral-500">Live transaction history saved in store database</p>
          </div>
          <a routerLink="/clerk/sales-history" class="btn btn-sm btn-outline">
            View All Sales History
          </a>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Date & Time</th>
                <th>Book Title & ISBN</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
                <th class="text-center">Receipt</th>
              </tr>
            </thead>
            <tbody>
              @for (sale of recentSales; track sale.saleId) {
                <tr>
                  <td>
                    <span class="font-mono font-bold text-neutral-900 text-xs">{{ sale.receiptNumber }}</span>
                  </td>
                  <td class="text-xs text-neutral-600 whitespace-nowrap">
                    {{ sale.saleDate | date:'medium' }}
                  </td>
                  <td>
                    @for (item of sale.items; track item.isbn) {
                      <div>
                        <div class="font-semibold text-neutral-900 text-xs">{{ item.bookTitle }}</div>
                        <div class="text-[11px] text-neutral-400 font-mono">ISBN: {{ item.isbn }}</div>
                      </div>
                    }
                  </td>
                  <td class="text-center font-semibold text-xs">
                    {{ sale.items[0]?.quantity || 1 }}
                  </td>
                  <td class="text-right text-xs">
                    {{ sale.items[0]?.unitPrice | inrCurrency }}
                  </td>
                  <td class="text-right font-bold text-neutral-900 text-xs">
                    {{ sale.totalAmount | inrCurrency }}
                  </td>
                  <td class="text-center">
                    <button type="button" (click)="selectedSale = sale" class="btn btn-sm btn-outline py-1 px-2 text-xs">
                      View Receipt
                    </button>
                  </td>
                </tr>
              }
              @if (recentSales.length === 0) {
                <tr>
                  <td colspan="7" class="text-center py-8 text-neutral-400 text-xs">
                    No sales recorded yet. Process your first sale above!
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Receipt Modal -->
    @if (selectedSale) {
      <app-receipt-modal [sale]="selectedSale" (close)="selectedSale = undefined"></app-receipt-modal>
    }
  `,
  styles: [`
    .w-4 { width: 1rem; }
    .h-4 { height: 1rem; }
    .w-6 { width: 1.5rem; }
    .h-6 { height: 1.5rem; }
  `]
})
export class ClerkDashboardComponent {
  private salesService = inject(SalesService);
  private bookService = inject(BookService);
  private authService = inject(StaffAuthService);

  selectedSale?: Sale;

  get clerkName(): string {
    return this.authService.getCurrentUser().name;
  }

  get todaySalesRevenue(): number {
    return this.salesService.getTodaySalesRevenue();
  }

  get todaySalesCount(): number {
    return this.salesService.getTodaySalesCount();
  }

  get totalLifetimeSales(): number {
    return this.salesService.getAllSales().length;
  }

  get totalTitlesCount(): number {
    return this.bookService.getAllBooks().length;
  }

  get inStockTitlesCount(): number {
    return this.bookService.getAllBooks().filter(b => b.isInStock()).length;
  }

  get recentSales(): Sale[] {
    return this.salesService.getAllSales().slice(0, 5);
  }
}

