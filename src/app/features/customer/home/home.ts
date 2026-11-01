import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../../core/services/book.service';
import { PublisherService } from '../../../core/services/publisher.service';
import { StaffAuthService } from '../../../core/services/staff-auth.service';
import { Book } from '../../../core/models/book.model';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, InrCurrencyPipe],
  template: `
    <div class="py-6">
      <!-- Hero Section -->
      <section class="card mb-8 bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] text-white p-8 md:p-12 relative overflow-hidden shadow-lg border-0"
               style="background: linear-gradient(135deg, #1b4332 0%, #245e46 100%);">
        <div class="max-w-2xl relative z-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold mb-4 backdrop-blur-sm border border-white/10">
            <span>Physical Bookstore Automation</span>
            <span>•</span>
            <span>Est. 1988</span>
          </div>
          <h1 class="text-3xl md:text-5xl font-bold font-serif mb-4 leading-tight text-white">
            Welcome to The Heritage Bookshop
          </h1>
          <p class="text-base md:text-lg text-emerald-100/90 mb-6 font-normal leading-relaxed">
            Discover classic literature, university academic texts, software engineering references, and rare volumes.
            Query in-store availability, select titles, and finalize purchases with our counter sales clerk.
          </p>

          <!-- Quick Search Bar -->
          <form (ngSubmit)="performSearch()" class="flex flex-col sm:flex-row gap-2 max-w-xl">
            <div class="flex-1 relative">
              <input type="text"
                     [(ngModel)]="searchQuery"
                     name="searchQuery"
                     placeholder="Search availability by title or author name..."
                     class="w-full px-4 py-3 rounded-lg text-neutral-900 bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-md text-sm">
            </div>
            <button type="submit" class="btn btn-accent px-6 py-3 font-bold shadow-md">
              Search Stock
            </button>
          </form>
        </div>
      </section>

      <!-- Operational Notice Card -->
      <div class="card mb-8 bg-[#fdfbf7] border-[#e7e1d5] p-5">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
            ℹ️
          </div>
          <div>
            <h3 class="font-bold text-sm text-neutral-900">How In-Store Book Purchasing Works</h3>
            <p class="text-xs text-neutral-600 mt-1 leading-relaxed">
              1. <strong>Customer Availability Enquiry:</strong> Customers browse or search by title or author. Checking availability increments the demand counter.
              <br>
              2. <strong>Selection for Purchase:</strong> Customers click "Select for Purchase" to get the book's ISBN.
              <br>
              3. <strong>Counter Billing:</strong> Take the physical book or ISBN to the Sales Clerk at the front counter. The clerk enters the ISBN into the POS terminal, confirms quantity, deducts stock, and generates your sales receipt.
            </p>
          </div>
        </div>
      </div>

      <!-- Featured Catalogue Books -->
      <section class="mb-10">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold font-serif text-neutral-900">Popular In-Store Titles</h2>
            <p class="text-xs text-neutral-500">Real-time availability directly from our in-store physical inventory</p>
          </div>
          <a routerLink="/browse" class="btn btn-sm btn-outline">
            View All {{ allBooks.length }} Books &rarr;
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          @for (book of featuredBooks; track book.isbn) {
            <div class="card flex flex-col justify-between">
              <div>
                <!-- Book Spine / Cover Mock -->
                <div class="book-cover">
                  <span class="badge badge-neutral text-[10px] self-start mb-auto bg-black/40 text-white border-0">
                    {{ book.category }}
                  </span>
                  <div class="book-cover-title">{{ book.title }}</div>
                  <div class="book-cover-author">By {{ book.author }}</div>
                </div>

                <div class="p-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-neutral-500 font-mono">ISBN: {{ book.isbn }}</span>
                    @if (book.isInStock()) {
                      <span class="badge badge-success text-[10px]">In Stock ({{ book.stockQuantity }})</span>
                    } @else {
                      <span class="badge badge-danger text-[10px]">Out of Stock</span>
                    }
                  </div>

                  <p class="text-xs text-neutral-600 line-clamp-2 mb-3">
                    {{ book.description || 'Comprehensive physical edition available in store.' }}
                  </p>

                  <div class="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <div>
                      <div class="text-[11px] text-neutral-400">Price</div>
                      <div class="font-bold text-base text-neutral-900">{{ book.price | inrCurrency }}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-[11px] text-neutral-400">Enquiries</div>
                      <div class="font-semibold text-xs text-emerald-800">{{ book.requestCount }} queries</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-4 pt-0">
                <a [routerLink]="['/book', book.isbn]" class="btn btn-sm btn-outline w-full text-center">
                  Check Details & Availability
                </a>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Customer Support: Cannot find book? -->
      <section class="card bg-neutral-900 text-white p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span class="badge badge-warning text-[10px] mb-2">Procurement Service</span>
          <h2 class="text-2xl font-bold font-serif mb-2 text-white">Can't Find The Book You're Looking For?</h2>
          <p class="text-xs md:text-sm text-neutral-300 max-w-xl leading-relaxed">
            If a book is not currently sold in our shop, submit its details. Our manager regularly reviews
            customer procurement requests to source new titles directly from publishers.
          </p>
        </div>
        <a routerLink="/request-book" class="btn btn-accent px-6 py-3 font-semibold shrink-0">
          Request Unavailable Book &rarr;
        </a>
      </section>
    </div>
  `
})
export class HomeComponent {
  private bookService = inject(BookService);
  private router = inject(Router);

  searchQuery = '';

  get allBooks(): Book[] {
    return this.bookService.getAllBooks();
  }

  get featuredBooks(): Book[] {
    return this.allBooks.slice(0, 8);
  }

  performSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/browse'], { queryParams: { q: this.searchQuery.trim() } });
    } else {
      this.router.navigate(['/browse']);
    }
  }
}

