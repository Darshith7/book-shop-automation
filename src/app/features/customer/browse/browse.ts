import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../../core/services/book.service';
import { PublisherService } from '../../../core/services/publisher.service';
import { Book } from '../../../core/models/book.model';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, InrCurrencyPipe],
  template: `
    <div class="py-6">
      <!-- Breadcrumb & Header -->
      <div class="mb-6">
        <div class="text-xs text-neutral-500 mb-2">
          <a routerLink="/" class="hover:underline">Home</a> &gt; <span>Catalogue</span>
        </div>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold font-serif text-neutral-900">In-Store Book Catalogue</h1>
            <p class="text-xs text-neutral-500 mt-1">
              Search real-time availability across {{ totalBookCount }} titles registered in the shop
            </p>
          </div>
          <a routerLink="/request-book" class="btn btn-sm btn-outline self-start md:self-auto">
            Book Not Found? Request Procurement
          </a>
        </div>
      </div>

      <!-- Search & Filter Controls -->
      <div class="card p-4 mb-6 bg-white shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Query input -->
          <div class="md:col-span-2">
            <label class="form-label text-xs">Search Keywords</label>
            <input type="text"
                   [(ngModel)]="searchQuery"
                   (ngModelChange)="applyFilter()"
                   placeholder="Search by book title or author name..."
                   class="form-input text-sm">
          </div>

          <!-- Search By Selector -->
          <div>
            <label class="form-label text-xs">Search Criteria</label>
            <select [(ngModel)]="searchBy" (ngModelChange)="applyFilter()" class="form-select text-sm">
              <option value="all">Title or Author</option>
              <option value="title">Book Title Only</option>
              <option value="author">Author Name Only</option>
            </select>
          </div>

          <!-- Availability Filter -->
          <div>
            <label class="form-label text-xs">Availability</label>
            <select [(ngModel)]="availabilityFilter" (ngModelChange)="applyFilter()" class="form-select text-sm">
              <option value="all">All Books</option>
              <option value="in_stock">In Stock Only</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        @if (searchQuery) {
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
            <span>Filtering by: <strong>"{{ searchQuery }}"</strong> ({{ filteredBooks.length }} results found)</span>
            <button type="button" (click)="clearSearch()" class="text-neutral-600 hover:text-neutral-900 underline">
              Clear Filter
            </button>
          </div>
        }
      </div>

      <!-- Results Grid -->
      @if (filteredBooks.length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          @for (book of filteredBooks; track book.isbn) {
            <div class="card flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div class="book-cover">
                  <span class="badge badge-neutral text-[10px] self-start mb-auto bg-black/40 text-white border-0">
                    {{ book.category }}
                  </span>
                  <div class="book-cover-title">{{ book.title }}</div>
                  <div class="book-cover-author">By {{ book.author }}</div>
                </div>

                <div class="p-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-neutral-400 font-mono text-[11px]">{{ book.isbn }}</span>
                    @if (book.isInStock()) {
                      <span class="badge badge-success text-[10px]">In Stock ({{ book.stockQuantity }})</span>
                    } @else {
                      <span class="badge badge-danger text-[10px]">Out of Stock</span>
                    }
                  </div>

                  <p class="text-xs text-neutral-600 mb-1">
                    <strong>Publisher:</strong> {{ getPublisherName(book.publisherId) }}
                  </p>

                  <div class="flex items-center justify-between pt-3 border-t border-neutral-100 mt-3">
                    <div>
                      <div class="text-[11px] text-neutral-400">Price</div>
                      <div class="font-bold text-base text-neutral-900">{{ book.price | inrCurrency }}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-[11px] text-neutral-400">Demand</div>
                      <div class="font-semibold text-xs text-emerald-800">{{ book.requestCount }} queries</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-4 pt-0">
                <a [routerLink]="['/book', book.isbn]" class="btn btn-sm btn-outline w-full text-center">
                  View Details & Enquire &rarr;
                </a>
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- Zero Search Results State -->
        <div class="card p-10 text-center bg-white max-w-xl mx-auto my-12">
          <div class="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            🔍
          </div>
          <h3 class="text-xl font-bold font-serif text-neutral-900 mb-2">Book Not Found in Catalogue</h3>
          <p class="text-xs text-neutral-600 mb-6 leading-relaxed">
            We couldn't find any titles matching "<strong>{{ searchQuery }}</strong>". Per Case Study 11 requirements,
            if the book is not currently sold by our shop, you can submit its full details for future procurement.
          </p>
          <div class="flex justify-center gap-3">
            <button type="button" (click)="clearSearch()" class="btn btn-outline">
              Reset Search
            </button>
            <a [routerLink]="['/request-book']" [queryParams]="{ title: searchQuery }" class="btn btn-primary">
              Enter Details for Procurement
            </a>
          </div>
        </div>
      }
    </div>
  `
})
export class BrowseComponent implements OnInit {
  private bookService = inject(BookService);
  private publisherService = inject(PublisherService);
  private route = inject(ActivatedRoute);

  searchQuery = '';
  searchBy: 'all' | 'title' | 'author' = 'all';
  availabilityFilter: 'all' | 'in_stock' | 'out_of_stock' = 'all';

  filteredBooks: Book[] = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
      }
      this.applyFilter();
    });
  }

  get totalBookCount(): number {
    return this.bookService.getAllBooks().length;
  }

  getPublisherName(publisherId: string): string {
    const pub = this.publisherService.getPublisherById(publisherId);
    return pub ? pub.name : 'Unknown Publisher';
  }

  applyFilter(): void {
    let list = this.bookService.searchBooks(this.searchQuery, this.searchBy);

    if (this.availabilityFilter === 'in_stock') {
      list = list.filter(b => b.isInStock());
    } else if (this.availabilityFilter === 'out_of_stock') {
      list = list.filter(b => !b.isInStock());
    }

    this.filteredBooks = list;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.availabilityFilter = 'all';
    this.applyFilter();
  }
}

