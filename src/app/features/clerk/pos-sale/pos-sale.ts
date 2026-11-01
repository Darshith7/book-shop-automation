import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SalesService, ProcessSaleResult } from '../../../core/services/sales.service';
import { BookService } from '../../../core/services/book.service';
import { PublisherService } from '../../../core/services/publisher.service';
import { StaffAuthService } from '../../../core/services/staff-auth.service';
import { Book } from '../../../core/models/book.model';
import { Sale } from '../../../core/models/sale.model';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { ReceiptModalComponent } from '../../../shared/components/receipt-modal/receipt-modal';

@Component({
  selector: 'app-pos-sale',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, InrCurrencyPipe, ReceiptModalComponent],
  template: `
    <div class="py-6 max-w-4xl mx-auto">
      <div class="text-xs text-neutral-500 mb-4">
        <a routerLink="/clerk" class="hover:underline">Clerk Desk</a> &gt; <span>New Sale (POS)</span>
      </div>

      <div class="card bg-white p-6 md:p-8 shadow-sm mb-6">
        <div class="flex items-center justify-between pb-4 mb-6 border-b border-neutral-200">
          <div>
            <span class="badge badge-info text-[10px] mb-1">Clerk Assisted Billing</span>
            <h1 class="text-2xl font-bold font-serif text-neutral-900">
              Process Book Sale
            </h1>
            <p class="text-xs text-neutral-500 mt-1">
              Enter the book's ISBN provided by the customer or scan physical barcode
            </p>
          </div>
          <div class="text-right text-xs">
            <div class="text-neutral-400">Cashier / Clerk:</div>
            <div class="font-bold text-neutral-800">{{ clerkName }}</div>
          </div>
        </div>

        <!-- POS Entry Form -->
        <form [formGroup]="saleForm" (ngSubmit)="onProcessSale()">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <!-- ISBN Field with real-time lookup -->
            <div class="md:col-span-2">
              <label class="form-label">
                Book ISBN <span class="required">*</span>
              </label>
              <div class="flex gap-2">
                <input type="text"
                       formControlName="isbn"
                       placeholder="e.g. 978-0132350884"
                       (input)="onIsbnChange()"
                       class="form-input font-mono uppercase text-sm">
                <button type="button" (click)="onLookupIsbn()" class="btn btn-outline shrink-0">
                  Lookup
                </button>
              </div>
              @if (isbnError) {
                <div class="form-error">{{ isbnError }}</div>
              }
              <div class="form-help">Tip: Quick-select from the sample in-stock books below.</div>
            </div>

            <!-- Quantity Field -->
            <div>
              <label class="form-label">
                Quantity <span class="required">*</span>
              </label>
              <input type="number"
                     formControlName="quantity"
                     min="1"
                     step="1"
                     (input)="recalculateTotal()"
                     class="form-input text-sm">
              @if (quantityError) {
                <div class="form-error">{{ quantityError }}</div>
              }
            </div>
          </div>

          <!-- Book Live Details Card (When ISBN Matches) -->
          @if (matchedBook) {
            <div class="card p-5 mb-6 bg-neutral-50 border-neutral-300 animate-fade-in">
              <div class="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="badge badge-neutral font-mono text-[10px]">ISBN: {{ matchedBook.isbn }}</span>
                    @if (matchedBook.isInStock()) {
                      <span class="badge badge-success text-[10px]">In Stock: {{ matchedBook.stockQuantity }} copies</span>
                    } @else {
                      <span class="badge badge-danger text-[10px]">Out of Stock (0 copies)</span>
                    }
                  </div>
                  <h3 class="text-lg font-bold font-serif text-neutral-900">{{ matchedBook.title }}</h3>
                  <p class="text-xs text-neutral-600">By {{ matchedBook.author }} | Publisher: {{ publisherName }}</p>
                </div>

                <div class="text-right">
                  <div class="text-xs text-neutral-500">Unit Price</div>
                  <div class="text-xl font-bold text-neutral-900">{{ matchedBook.price | inrCurrency }}</div>
                </div>
              </div>

              <!-- Price & Total Preview -->
              <div class="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between text-sm">
                <div class="text-xs text-neutral-600">
                  Line Total: {{ quantityValue }} unit(s) &times; {{ matchedBook.price | inrCurrency }}
                </div>
                <div class="font-bold text-lg text-emerald-900">
                  Payable: {{ calculatedTotal | inrCurrency }}
                </div>
              </div>
            </div>
          }

          <!-- Global Form Submission Error -->
          @if (errorMessage) {
            <div class="p-3 mb-6 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
          }

          <!-- Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-neutral-200">
            <button type="button" (click)="resetForm()" class="btn btn-outline">
              Clear Form
            </button>
            <button type="submit"
                    [disabled]="!matchedBook || !matchedBook.isInStock() || isProcessing"
                    class="btn btn-primary px-8 py-3 text-base font-bold shadow-md">
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Confirm Sale & Generate Receipt
            </button>
          </div>
        </form>
      </div>

      <!-- Quick-Pick Catalogue Shortcuts -->
      <div class="card p-5 bg-white shadow-sm">
        <h3 class="text-sm font-bold font-serif text-neutral-800 mb-3">
          Quick In-Store Book Selector (Click to load ISBN):
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          @for (book of quickPickBooks; track book.isbn) {
            <button type="button"
                    (click)="selectQuickBook(book)"
                    class="text-left p-3 rounded-lg border border-neutral-200 hover:border-emerald-600 hover:bg-emerald-50/40 transition-colors flex flex-col justify-between">
              <div>
                <div class="font-bold text-xs text-neutral-900 truncate">{{ book.title }}</div>
                <div class="text-[11px] text-neutral-500 font-mono mt-0.5">{{ book.isbn }}</div>
              </div>
              <div class="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100 text-[11px]">
                <span class="font-semibold text-neutral-800">{{ book.price | inrCurrency }}</span>
                <span [ngClass]="book.isInStock() ? 'text-emerald-700' : 'text-red-600'">
                  Stock: {{ book.stockQuantity }}
                </span>
              </div>
            </button>
          }
        </div>
      </div>
    </div>

    <!-- Receipt Modal Pop-up on Completed Sale -->
    @if (completedSale) {
      <app-receipt-modal [sale]="completedSale" (close)="onCloseReceipt()"></app-receipt-modal>
    }
  `,
  styles: [`
    .w-4 { width: 1rem; }
    .h-4 { height: 1rem; }
    .w-5 { width: 1.25rem; }
    .h-5 { height: 1.25rem; }
  `]
})
export class PosSaleComponent implements OnInit {
  private fb = inject(FormBuilder);
  private salesService = inject(SalesService);
  private bookService = inject(BookService);
  private publisherService = inject(PublisherService);
  private authService = inject(StaffAuthService);
  private route = inject(ActivatedRoute);

  saleForm!: FormGroup;
  matchedBook?: Book;
  completedSale?: Sale;
  errorMessage = '';
  isbnError = '';
  quantityError = '';
  isProcessing = false;

  ngOnInit(): void {
    this.saleForm = this.fb.group({
      isbn: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });

    this.route.queryParams.subscribe(params => {
      if (params['isbn']) {
        this.saleForm.patchValue({ isbn: params['isbn'] });
        this.onLookupIsbn();
      }
    });
  }

  get clerkName(): string {
    return this.authService.getCurrentUser().name;
  }

  get quickPickBooks(): Book[] {
    return this.bookService.getAllBooks().slice(0, 6);
  }

  get publisherName(): string {
    if (!this.matchedBook) return '';
    const pub = this.publisherService.getPublisherById(this.matchedBook.publisherId);
    return pub ? pub.name : 'Unknown Publisher';
  }

  get quantityValue(): number {
    return Number(this.saleForm.get('quantity')?.value || 1);
  }

  get calculatedTotal(): number {
    if (!this.matchedBook) return 0;
    const qty = this.quantityValue;
    return Math.round(qty * this.matchedBook.price * 100) / 100;
  }

  onIsbnChange(): void {
    this.errorMessage = '';
    this.isbnError = '';
    const isbnVal = (this.saleForm.get('isbn')?.value || '').trim();
    if (isbnVal.length >= 10) {
      this.matchedBook = this.bookService.getBookByIsbn(isbnVal);
    } else {
      this.matchedBook = undefined;
    }
  }

  onLookupIsbn(): void {
    this.errorMessage = '';
    this.isbnError = '';
    const isbnVal = (this.saleForm.get('isbn')?.value || '').trim();
    if (!isbnVal) {
      this.isbnError = 'Please enter an ISBN number.';
      this.matchedBook = undefined;
      return;
    }

    const found = this.bookService.getBookByIsbn(isbnVal);
    if (found) {
      this.matchedBook = found;
      this.saleForm.patchValue({ isbn: found.isbn });
    } else {
      this.matchedBook = undefined;
      this.isbnError = `No book found in catalogue with ISBN: "${isbnVal}".`;
    }
  }

  selectQuickBook(book: Book): void {
    this.saleForm.patchValue({ isbn: book.isbn, quantity: 1 });
    this.matchedBook = book;
    this.errorMessage = '';
    this.isbnError = '';
    this.quantityError = '';
  }

  recalculateTotal(): void {
    this.quantityError = '';
    const qty = this.saleForm.get('quantity')?.value;
    if (!Number.isInteger(Number(qty)) || Number(qty) <= 0) {
      this.quantityError = 'Quantity must be a positive whole number (e.g. 1, 2, 3).';
    } else if (this.matchedBook && Number(qty) > this.matchedBook.stockQuantity) {
      this.quantityError = `Requested quantity (${qty}) exceeds available stock (${this.matchedBook.stockQuantity}).`;
    }
  }

  onProcessSale(): void {
    this.errorMessage = '';
    this.isbnError = '';
    this.quantityError = '';

    const isbn = (this.saleForm.get('isbn')?.value || '').trim();
    const qty = Number(this.saleForm.get('quantity')?.value);

    if (!isbn) {
      this.isbnError = 'ISBN is required.';
      return;
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      this.quantityError = 'Quantity must be a positive whole integer.';
      return;
    }

    try {
      this.isProcessing = true;
      const result: ProcessSaleResult = this.salesService.processSale(isbn, qty, this.clerkName);

      // Sale succeeded!
      this.completedSale = result.sale;
      this.matchedBook = result.book;
    } catch (err: any) {
      this.errorMessage = err.message || 'Error processing book sale.';
    } finally {
      this.isProcessing = false;
    }
  }

  onCloseReceipt(): void {
    this.completedSale = undefined;
    this.resetForm();
  }

  resetForm(): void {
    this.saleForm.reset({ isbn: '', quantity: 1 });
    this.matchedBook = undefined;
    this.errorMessage = '';
    this.isbnError = '';
    this.quantityError = '';
  }
}

