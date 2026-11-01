import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sale } from '../../../core/models/sale.model';
import { InrCurrencyPipe } from '../../pipes/inr-currency.pipe';

@Component({
  selector: 'app-receipt-modal',
  standalone: true,
  imports: [CommonModule, InrCurrencyPipe],
  template: `
    <div class="modal-backdrop">
      <div class="modal-content max-w-lg p-0 overflow-hidden">
        <!-- Header Controls (Hidden during print) -->
        <div class="p-4 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between no-print">
          <div class="flex items-center gap-2">
            <span class="badge badge-success">Sale Completed</span>
            <span class="text-xs font-semibold text-neutral-600">Receipt Preview</span>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" (click)="printReceipt()" class="btn btn-sm btn-primary">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              Print Receipt
            </button>
            <button type="button" (click)="close.emit()" class="btn btn-sm btn-outline">
              Close
            </button>
          </div>
        </div>

        <!-- Printable Receipt Content -->
        <div class="p-6 bg-white printable-area" id="receipt-print-area">
          <div class="text-center pb-4 mb-4 border-b border-neutral-300">
            <h2 class="text-xl font-bold font-serif tracking-tight text-neutral-900">THE HERITAGE BOOKSHOP</h2>
            <p class="text-xs text-neutral-500 mt-1">42 Academic Avenue, Connaught Circle, New Delhi - 110001</p>
            <p class="text-xs text-neutral-500">Ph: +91 11 2345 6789 | GSTIN: 07AAAAA0000A1Z5</p>
            <div class="mt-2 inline-block px-3 py-1 bg-neutral-100 rounded text-xs font-bold tracking-wider uppercase text-neutral-800">
              Tax Invoice / Retail Sales Receipt
            </div>
          </div>

          <div class="flex justify-between text-xs mb-4 text-neutral-700">
            <div>
              <p><strong>Receipt No:</strong> {{ sale.receiptNumber }}</p>
              <p><strong>Sale ID:</strong> {{ sale.saleId }}</p>
              <p><strong>Clerk:</strong> {{ sale.clerkName }}</p>
            </div>
            <div class="text-right">
              <p><strong>Date:</strong> {{ sale.saleDate | date:'mediumDate' }}</p>
              <p><strong>Time:</strong> {{ sale.saleDate | date:'shortTime' }}</p>
              <p><strong>POS Counter:</strong> Counter #1</p>
            </div>
          </div>

          <!-- Items Table -->
          <table class="table w-full text-xs mb-4">
            <thead>
              <tr class="border-t border-b border-neutral-300">
                <th class="py-2 text-left">Description</th>
                <th class="py-2 text-center">Qty</th>
                <th class="py-2 text-right">Price</th>
                <th class="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              @for (item of sale.items; track item.isbn) {
                <tr class="border-b border-neutral-200">
                  <td class="py-2">
                    <div class="font-semibold text-neutral-900">{{ item.bookTitle }}</div>
                    <div class="text-neutral-500 text-[11px]">
                      ISBN: {{ item.isbn }} | Pub: {{ item.publisherName }}
                    </div>
                  </td>
                  <td class="py-2 text-center font-semibold">{{ item.quantity }}</td>
                  <td class="py-2 text-right">{{ item.unitPrice | inrCurrency }}</td>
                  <td class="py-2 text-right font-bold text-neutral-900">{{ item.lineTotal | inrCurrency }}</td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Financial Summary -->
          <div class="flex justify-end pt-2 border-t border-neutral-300 mb-6">
            <div class="w-48 text-xs">
              <div class="flex justify-between py-1">
                <span class="text-neutral-600">Subtotal:</span>
                <span class="font-semibold">{{ sale.totalAmount | inrCurrency }}</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-neutral-600">GST (0% Books):</span>
                <span class="font-semibold">₹0.00</span>
              </div>
              <div class="flex justify-between py-1.5 border-t border-b border-neutral-400 font-bold text-sm text-neutral-900">
                <span>Grand Total:</span>
                <span>{{ sale.totalAmount | inrCurrency }}</span>
              </div>
            </div>
          </div>

          <!-- Footer note -->
          <div class="text-center text-[11px] text-neutral-500 pt-3 border-t border-neutral-200">
            <p class="font-medium">Thank you for patronizing The Heritage Bookshop!</p>
            <p>Exchange within 7 days with original sales receipt. Books in unread condition only.</p>
          </div>
        </div>

        <!-- Footer Actions (Hidden during print) -->
        <div class="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-end gap-3 no-print">
          <button type="button" (click)="close.emit()" class="btn btn-primary">
            Return to Sales Counter
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .w-4 { width: 1rem; }
    .h-4 { height: 1rem; }
  `]
})
export class ReceiptModalComponent {
  @Input({ required: true }) sale!: Sale;
  @Output() close = new EventEmitter<void>();

  printReceipt(): void {
    window.print();
  }
}

