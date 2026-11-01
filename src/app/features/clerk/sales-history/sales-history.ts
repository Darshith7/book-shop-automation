import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../../core/services/sales.service';
import { Sale } from '../../../core/models/sale.model';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { ReceiptModalComponent } from '../../../shared/components/receipt-modal/receipt-modal';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, InrCurrencyPipe, ReceiptModalComponent],
  template: `
    <div class="py-6">
      <div class="text-xs text-neutral-500 mb-4">
        <a routerLink="/clerk" class="hover:underline">Clerk Desk</a> &gt; <span>Sales Ledger</span>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold font-serif text-neutral-900">
            Store Sales Transactions Ledger
          </h1>
          <p class="text-xs text-neutral-500 mt-1">
            Complete historical record of receipts issued at front billing counter
          </p>
        </div>
        <a routerLink="/clerk/pos-sale" class="btn btn-primary btn-sm">
          + New Sale
        </a>
      </div>

      <!-- Filter Controls -->
      <div class="card p-4 mb-6 bg-white shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div class="flex-1 w-full sm:w-auto">
          <input type="text"
                 [(ngModel)]="filterQuery"
                 placeholder="Search by receipt number, book title, or ISBN..."
                 class="form-input text-sm">
        </div>
        <div class="text-xs text-neutral-500 whitespace-nowrap">
          Showing <strong>{{ filteredSales.length }}</strong> of {{ allSales.length }} transactions
        </div>
      </div>

      <!-- Ledger Table -->
      <div class="card bg-white shadow-sm">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Sale Date & Time</th>
                <th>Book Title & ISBN</th>
                <th>Publisher</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total Amount</th>
                <th class="text-center">Invoice</th>
              </tr>
            </thead>
            <tbody>
              @for (sale of filteredSales; track sale.saleId) {
                <tr>
                  <td>
                    <span class="font-mono font-bold text-neutral-900 text-xs">{{ sale.receiptNumber }}</span>
                    <div class="text-[10px] text-neutral-400">By {{ sale.clerkName }}</div>
                  </td>
                  <td class="text-xs text-neutral-600 whitespace-nowrap">
                    {{ sale.saleDate | date:'medium' }}
                  </td>
                  <td>
                    @for (item of sale.items; track item.isbn) {
                      <div>
                        <div class="font-semibold text-neutral-900 text-xs">{{ item.bookTitle }}</div>
                        <div class="text-[11px] text-neutral-500 font-mono">ISBN: {{ item.isbn }}</div>
                      </div>
                    }
                  </td>
                  <td class="text-xs text-neutral-600">
                    {{ sale.items[0]?.publisherName }}
                  </td>
                  <td class="text-center font-bold text-xs">
                    {{ sale.items[0]?.quantity }}
                  </td>
                  <td class="text-right text-xs">
                    {{ sale.items[0]?.unitPrice | inrCurrency }}
                  </td>
                  <td class="text-right font-bold text-neutral-900 text-xs">
                    {{ sale.totalAmount | inrCurrency }}
                  </td>
                  <td class="text-center">
                    <button type="button" (click)="selectedSale = sale" class="btn btn-sm btn-outline py-1 px-2 text-xs">
                      View / Print
                    </button>
                  </td>
                </tr>
              }
              @if (filteredSales.length === 0) {
                <tr>
                  <td colspan="8" class="text-center py-10 text-neutral-400 text-xs">
                    No transactions matching your search criteria.
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
  `
})
export class SalesHistoryComponent {
  private salesService = inject(SalesService);

  filterQuery = '';
  selectedSale?: Sale;

  get allSales(): Sale[] {
    return this.salesService.getAllSales();
  }

  get filteredSales(): Sale[] {
    const q = this.filterQuery.trim().toLowerCase();
    if (!q) return this.allSales;

    return this.allSales.filter(sale => {
      const matchReceipt = sale.receiptNumber.toLowerCase().includes(q);
      const matchItem = sale.items.some(
        it => it.bookTitle.toLowerCase().includes(q) || it.isbn.toLowerCase().includes(q)
      );
      return matchReceipt || matchItem;
    });
  }
}

