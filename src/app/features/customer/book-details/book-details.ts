import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BookService } from '../../../core/services/book.service';
import { PublisherService } from '../../../core/services/publisher.service';
import { Book } from '../../../core/models/book.model';
import { Publisher } from '../../../core/models/publisher.model';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule, RouterModule, InrCurrencyPipe],
  template: `
    <div class="py-6 max-w-4xl mx-auto">
      <!-- Breadcrumb -->
      <div class="text-xs text-neutral-500 mb-4">
        <a routerLink="/" class="hover:underline">Home</a> &gt;
        <a routerLink="/browse" class="hover:underline">Catalogue</a> &gt;
        <span>{{ book?.title || 'Book Details' }}</span>
      </div>

      @if (book) {
        <div class="card p-6 md:p-8 bg-white shadow-sm mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Book Cover Mock -->
            <div>
              <div class="book-cover" style="height: 320px;">
                <span class="badge badge-neutral text-xs self-start mb-auto bg-black/40 text-white border-0">
                  {{ book.category }}
                </span>
                <div class="book-cover-title text-xl">{{ book.title }}</div>
                <div class="book-cover-author text-sm">By {{ book.author }}</div>
              </div>

              <div class="mt-4 p-3 bg-neutral-50 rounded-lg text-xs text-neutral-600 border border-neutral-200 space-y-1">
                <p><strong>Category:</strong> {{ book.category }}</p>
                <p><strong>Stock Status:</strong> {{ book.isInStock() ? 'Available for In-Store Counter Purchase' : 'Currently Out of Stock' }}</p>
              </div>
            </div>

            <!-- Detailed Specifications -->
            <div class="md:col-span-2 flex flex-col justify-between">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="badge badge-neutral text-xs font-mono">ISBN: {{ book.isbn }}</span>
                  <span class="badge badge-neutral text-xs">{{ book.category }}</span>
                  @if (book.isInStock()) {
                    <span class="badge badge-success text-xs">In Stock ({{ book.stockQuantity }} copies)</span>
                  } @else {
                    <span class="badge badge-danger text-xs">Out of Stock (0 copies)</span>
                  }
                </div>

                <h1 class="text-2xl md:text-3xl font-bold font-serif text-neutral-900 mb-2 leading-tight">
                  {{ book.title }}
                </h1>
                <p class="text-base text-neutral-700 font-medium mb-4">
                  By <span class="text-neutral-900">{{ book.author }}</span>
                </p>

                <!-- Pricing & Stock Metrics -->
                <div class="grid grid-cols-3 gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200 mb-6">
                  <div>
                    <div class="text-xs text-neutral-500">Retail Price</div>
                    <div class="text-xl font-bold text-neutral-900">{{ book.price | inrCurrency }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-neutral-500">Physical Stock</div>
                    <div class="text-xl font-bold" [ngClass]="book.isInStock() ? 'text-emerald-700' : 'text-red-600'">
                      {{ book.stockQuantity }}
                    </div>
                  </div>
                  <div>
                    <div class="text-xs text-neutral-500">Recorded Enquiries</div>
                    <div class="text-xl font-bold text-neutral-900">{{ book.requestCount }}</div>
                  </div>
                </div>

                <!-- Publisher info -->
                <div class="mb-6 text-xs text-neutral-700 space-y-1">
                  <p><strong>Publisher:</strong> {{ publisher?.name || 'Independent Publisher' }}</p>
                  <p><strong>Publisher Address:</strong> {{ publisher?.fullAddress || 'N/A' }}</p>
                  <p><strong>Procurement Lead Time:</strong> {{ publisher?.procurementLeadDays || 'N/A' }} business days</p>
                </div>

                <!-- Description -->
                <div class="mb-6">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">About This Volume</h3>
                  <p class="text-sm text-neutral-600 leading-relaxed">
                    {{ book.description || 'Standard academic and retail textbook edition available in store for immediate purchase or enquiry.' }}
                  </p>
                </div>
              </div>

              <!-- Interactive Case Study Actions -->
              <div class="pt-6 border-t border-neutral-200">
                <!-- Action Feedback Alerts -->
                @if (enquiryMessage) {
                  <div class="p-3 mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <span>{{ enquiryMessage }}</span>
                    <button type="button" (click)="enquiryMessage = ''" class="text-emerald-900 font-bold">&times;</button>
                  </div>
                }

                @if (selectionModalOpen) {
                  <!-- Purchase Selection Modal / Highlight -->
                  <div class="p-4 mb-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 shadow-md">
                    <div class="flex items-start gap-3">
                      <div class="text-xl">🛒</div>
                      <div>
                        <h4 class="font-bold text-sm">Book Selected For Purchase!</h4>
                        <p class="text-xs mt-1 leading-relaxed">
                          "Book selected. Please provide ISBN <strong>{{ book.isbn }}</strong> to the sales clerk at the counter to complete your purchase."
                        </p>
                        <div class="mt-3 flex items-center gap-2">
                          <span class="inline-block px-3 py-1 bg-white font-mono font-bold text-xs rounded border border-amber-300">
                            ISBN: {{ book.isbn }}
                          </span>
                          <span class="text-[11px] text-amber-700">
                            (No stock was deducted yet. The clerk enters this at the POS desk).
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <div class="flex flex-col sm:flex-row gap-3">
                  <!-- Button 1: Explicit Check Availability / Enquire -->
                  <button type="button"
                          (click)="handleEnquiry()"
                          class="btn btn-outline flex-1 py-3">
                    <svg class="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                    </svg>
                    Check Availability / Enquire
                  </button>

                  <!-- Button 2: Select for Purchase (Only when in stock) -->
                  <button type="button"
                          (click)="handleSelectForPurchase()"
                          [disabled]="!book.isInStock()"
                          class="btn btn-primary flex-1 py-3">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                    Select for Purchase
                  </button>
                </div>

                @if (!book.isInStock()) {
                  <p class="text-xs text-red-600 font-medium mt-2 text-center">
                    This book is currently out of stock. It cannot be selected for purchase until new stock is received.
                  </p>
                }
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="card p-12 text-center bg-white">
          <p class="text-sm text-neutral-500 mb-4">Book not found in catalogue.</p>
          <a routerLink="/browse" class="btn btn-outline">Back to Catalogue</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .w-4 { width: 1rem; }
    .h-4 { height: 1rem; }
  `]
})
export class BookDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookService = inject(BookService);
  private publisherService = inject(PublisherService);

  book?: Book;
  publisher?: Publisher;
  enquiryMessage = '';
  selectionModalOpen = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const isbn = params.get('isbn');
      if (isbn) {
        this.loadBook(isbn);
      }
    });
  }

  private loadBook(isbn: string): void {
    this.book = this.bookService.getBookByIsbn(isbn);
    if (this.book) {
      this.publisher = this.publisherService.getPublisherById(this.book.publisherId);
    }
  }

  handleEnquiry(): void {
    if (!this.book) return;

    if (this.book.isInStock()) {
      // Explicit enquiry increments requestCount per Case Study 11
      const updated = this.bookService.recordEnquiry(this.book.isbn);
      this.book = updated;
      this.enquiryMessage = `Availability confirmed: ${updated.stockQuantity} copies currently in store. Enquiry recorded! Current demand count: ${updated.requestCount}.`;
    } else {
      this.enquiryMessage = `This title is registered in our catalogue but currently has 0 copies in stock.`;
    }
  }

  handleSelectForPurchase(): void {
    if (!this.book || !this.book.isInStock()) return;
    this.selectionModalOpen = true;
  }
}

