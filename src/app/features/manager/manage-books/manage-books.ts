import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { BookService } from '../../../core/services/book.service';
import { PublisherService } from '../../../core/services/publisher.service';
import { Book, IBookData } from '../../../core/models/book.model';
import { Publisher } from '../../../core/models/publisher.model';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-manage-books',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, InrCurrencyPipe],
  template: `
    <div class="py-6">
      <div class="text-xs text-neutral-500 mb-4">
        <a routerLink="/manager" class="hover:underline">Manager Console</a> &gt; <span>Manage Books</span>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold font-serif text-neutral-900">
            Catalogue & Inventory Management
          </h1>
          <p class="text-xs text-neutral-500 mt-1">
            Maintain book records, configure selling prices, and monitor stock levels
          </p>
        </div>
        <button type="button" (click)="openAddModal()" class="btn btn-primary btn-sm">
          + Add New Book Record
        </button>
      </div>

      @if (alertMessage) {
        <div class="p-3 mb-6 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg flex items-center justify-between">
          <span>{{ alertMessage }}</span>
          <button type="button" (click)="alertMessage = ''" class="font-bold">&times;</button>
        </div>
      }

      <!-- Search & Filter Filter -->
      <div class="card p-4 mb-6 bg-white shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div class="flex-1 w-full sm:w-auto">
          <input type="text"
                 [(ngModel)]="searchQuery"
                 placeholder="Search catalogue by title, author, or ISBN..."
                 class="form-input text-sm">
        </div>
        <div class="text-xs text-neutral-500 whitespace-nowrap">
          Total Titles: <strong>{{ filteredBooks.length }}</strong>
        </div>
      </div>

      <!-- Books Table -->
      <div class="card bg-white shadow-sm">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>ISBN</th>
                <th>Title & Category</th>
                <th>Author</th>
                <th>Publisher</th>
                <th class="text-right">Selling Price</th>
                <th class="text-center">Stock</th>
                <th class="text-center">Demand</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (book of filteredBooks; track book.isbn) {
                <tr>
                  <td>
                    <span class="font-mono font-bold text-xs text-neutral-900">{{ book.isbn }}</span>
                  </td>
                  <td>
                    <div class="font-semibold text-xs text-neutral-900">{{ book.title }}</div>
                    <span class="badge badge-neutral text-[10px] mt-0.5">{{ book.category }}</span>
                  </td>
                  <td class="text-xs text-neutral-700">{{ book.author }}</td>
                  <td class="text-xs text-neutral-600">{{ getPublisherName(book.publisherId) }}</td>
                  <td class="text-right font-bold text-xs text-neutral-900">
                    {{ book.price | inrCurrency }}
                  </td>
                  <td class="text-center">
                    @if (book.isInStock()) {
                      <span class="badge badge-success text-[10px]">{{ book.stockQuantity }} units</span>
                    } @else {
                      <span class="badge badge-danger text-[10px]">0 Out</span>
                    }
                  </td>
                  <td class="text-center font-bold text-xs text-emerald-800">
                    {{ book.requestCount }}
                  </td>
                  <td class="text-center whitespace-nowrap">
                    <button type="button"
                            (click)="openPriceModal(book)"
                            class="btn btn-sm btn-outline py-1 px-2 text-xs mr-1 text-emerald-800">
                      Edit Price
                    </button>
                    <button type="button"
                            (click)="openEditModal(book)"
                            class="btn btn-sm btn-outline py-1 px-2 text-xs">
                      Edit Details
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ADD BOOK MODAL -->
    @if (showAddModal) {
      <div class="modal-backdrop">
        <div class="modal-content max-w-xl p-6">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
            <h3 class="text-lg font-bold font-serif text-neutral-900">Add New Book to Catalogue</h3>
            <button type="button" (click)="showAddModal = false" class="text-xl font-bold">&times;</button>
          </div>

          @if (formError) {
            <div class="p-3 mb-4 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
              {{ formError }}
            </div>
          }

          <form [formGroup]="bookForm" (ngSubmit)="saveNewBook()">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div class="form-group sm:col-span-2">
                <label class="form-label">ISBN <span class="required">*</span></label>
                <input type="text" formControlName="isbn" placeholder="e.g. 978-0132350884" class="form-input font-mono uppercase text-sm">
                <div class="form-help">Must be unique; blank and duplicate ISBNs are rejected.</div>
              </div>

              <div class="form-group sm:col-span-2">
                <label class="form-label">Book Title <span class="required">*</span></label>
                <input type="text" formControlName="title" placeholder="Title of the volume" class="form-input text-sm">
              </div>

              <div class="form-group sm:col-span-2">
                <label class="form-label">Author Name(s) <span class="required">*</span></label>
                <input type="text" formControlName="author" placeholder="Author name" class="form-input text-sm">
              </div>

              <div class="form-group">
                <label class="form-label">Publisher <span class="required">*</span></label>
                <select formControlName="publisherId" class="form-select text-sm">
                  @for (pub of publishers; track pub.publisherId) {
                    <option [value]="pub.publisherId">{{ pub.name }}</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Category</label>
                <input type="text" formControlName="category" placeholder="e.g. Computer Science" class="form-input text-sm">
              </div>

              <div class="form-group">
                <label class="form-label">Selling Price (₹) <span class="required">*</span></label>
                <input type="number" formControlName="price" min="0" step="1" class="form-input text-sm">
              </div>

              <div class="form-group">
                <label class="form-label">Initial Physical Stock <span class="required">*</span></label>
                <input type="number" formControlName="stockQuantity" min="0" step="1" class="form-input text-sm">
              </div>

              <div class="form-group sm:col-span-2">
                <label class="form-label">Description / Synopsis</label>
                <textarea formControlName="description" rows="2" class="form-textarea text-sm"></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-neutral-200">
              <button type="button" (click)="showAddModal = false" class="btn btn-outline">Cancel</button>
              <button type="submit" [disabled]="bookForm.invalid" class="btn btn-primary">Save Book to Catalogue</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- EDIT BOOK DETAILS MODAL -->
    @if (editingBook) {
      <div class="modal-backdrop">
        <div class="modal-content max-w-xl p-6">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
            <h3 class="text-lg font-bold font-serif text-neutral-900">Edit Book: {{ editingBook.isbn }}</h3>
            <button type="button" (click)="editingBook = undefined" class="text-xl font-bold">&times;</button>
          </div>

          @if (formError) {
            <div class="p-3 mb-4 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
              {{ formError }}
            </div>
          }

          <form [formGroup]="editForm" (ngSubmit)="saveEditedBook()">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div class="form-group sm:col-span-2">
                <label class="form-label">Title <span class="required">*</span></label>
                <input type="text" formControlName="title" class="form-input text-sm">
              </div>

              <div class="form-group sm:col-span-2">
                <label class="form-label">Author <span class="required">*</span></label>
                <input type="text" formControlName="author" class="form-input text-sm">
              </div>

              <div class="form-group">
                <label class="form-label">Publisher <span class="required">*</span></label>
                <select formControlName="publisherId" class="form-select text-sm">
                  @for (pub of publishers; track pub.publisherId) {
                    <option [value]="pub.publisherId">{{ pub.name }}</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Category</label>
                <input type="text" formControlName="category" class="form-input text-sm">
              </div>

              <div class="form-group sm:col-span-2">
                <label class="form-label">Selling Price (₹) <span class="required">*</span></label>
                <input type="number" formControlName="price" min="0" step="1" class="form-input text-sm">
              </div>

              <div class="form-group sm:col-span-2">
                <label class="form-label">Description</label>
                <textarea formControlName="description" rows="2" class="form-textarea text-sm"></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-neutral-200">
              <button type="button" (click)="editingBook = undefined" class="btn btn-outline">Cancel</button>
              <button type="submit" [disabled]="editForm.invalid" class="btn btn-primary">Update Book</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- UPDATE PRICE ONLY MODAL -->
    @if (pricingBook) {
      <div class="modal-backdrop">
        <div class="modal-content max-w-md p-6">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
            <h3 class="text-base font-bold font-serif text-neutral-900">Update Selling Price</h3>
            <button type="button" (click)="pricingBook = undefined" class="text-xl font-bold">&times;</button>
          </div>

          <div class="mb-4 text-xs text-neutral-700 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
            <p><strong>Title:</strong> {{ pricingBook.title }}</p>
            <p><strong>ISBN:</strong> {{ pricingBook.isbn }}</p>
            <p><strong>Current Price:</strong> {{ pricingBook.price | inrCurrency }}</p>
          </div>

          @if (formError) {
            <div class="p-3 mb-4 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
              {{ formError }}
            </div>
          }

          <form [formGroup]="priceForm" (ngSubmit)="savePriceOnly()">
            <div class="form-group">
              <label class="form-label">New Selling Price (₹) <span class="required">*</span></label>
              <input type="number" formControlName="newPrice" min="0" step="1" class="form-input text-sm">
              <div class="form-help">Must be a non-negative monetary value. Existing sales receipts retain their historical price.</div>
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-neutral-200">
              <button type="button" (click)="pricingBook = undefined" class="btn btn-outline">Cancel</button>
              <button type="submit" [disabled]="priceForm.invalid" class="btn btn-primary">Save New Price</button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ManageBooksComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bookService = inject(BookService);
  private publisherService = inject(PublisherService);

  searchQuery = '';
  alertMessage = '';
  formError = '';

  showAddModal = false;
  editingBook?: Book;
  pricingBook?: Book;

  bookForm!: FormGroup;
  editForm!: FormGroup;
  priceForm!: FormGroup;

  ngOnInit(): void {
    this.initForms();
  }

  private initForms(): void {
    const firstPubId = this.publishers[0]?.publisherId || '';

    this.bookForm = this.fb.group({
      isbn: ['', [Validators.required, Validators.minLength(3)]],
      title: ['', Validators.required],
      author: ['', Validators.required],
      publisherId: [firstPubId, Validators.required],
      category: ['General'],
      price: [500, [Validators.required, Validators.min(0)]],
      stockQuantity: [5, [Validators.required, Validators.min(0)]],
      description: ['']
    });

    this.editForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      publisherId: ['', Validators.required],
      category: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['']
    });

    this.priceForm = this.fb.group({
      newPrice: [0, [Validators.required, Validators.min(0)]]
    });
  }

  get publishers(): Publisher[] {
    return this.publisherService.getAllPublishers();
  }

  get allBooks(): Book[] {
    return this.bookService.getAllBooks();
  }

  get filteredBooks(): Book[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.allBooks;

    return this.allBooks.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q)
    );
  }

  getPublisherName(publisherId: string): string {
    const pub = this.publisherService.getPublisherById(publisherId);
    return pub ? pub.name : 'Unknown Publisher';
  }

  openAddModal(): void {
    this.formError = '';
    const firstPubId = this.publishers[0]?.publisherId || '';
    this.bookForm.reset({
      isbn: '',
      title: '',
      author: '',
      publisherId: firstPubId,
      category: 'General',
      price: 500,
      stockQuantity: 5,
      description: ''
    });
    this.showAddModal = true;
  }

  saveNewBook(): void {
    this.formError = '';
    if (this.bookForm.invalid) return;

    try {
      const data = this.bookForm.value;
      const created = this.bookService.addBook(data);
      this.alertMessage = `Successfully registered "${created.title}" (ISBN: ${created.isbn}) into catalogue.`;
      this.showAddModal = false;
    } catch (err: any) {
      this.formError = err.message || 'Error adding book.';
    }
  }

  openEditModal(book: Book): void {
    this.formError = '';
    this.editingBook = book;
    this.editForm.patchValue({
      title: book.title,
      author: book.author,
      publisherId: book.publisherId,
      category: book.category,
      price: book.price,
      description: book.description
    });
  }

  saveEditedBook(): void {
    if (!this.editingBook || this.editForm.invalid) return;

    try {
      const { title, author, publisherId, category, price, description } = this.editForm.value;
      const updated = this.bookService.updateBook(
        this.editingBook.isbn,
        title,
        author,
        publisherId,
        Number(price),
        category,
        description
      );
      this.alertMessage = `Updated details for "${updated.title}".`;
      this.editingBook = undefined;
    } catch (err: any) {
      this.formError = err.message || 'Error updating book details.';
    }
  }

  openPriceModal(book: Book): void {
    this.formError = '';
    this.pricingBook = book;
    this.priceForm.patchValue({ newPrice: book.price });
  }

  savePriceOnly(): void {
    if (!this.pricingBook || this.priceForm.invalid) return;

    try {
      const newPrice = Number(this.priceForm.get('newPrice')?.value);
      const updated = this.bookService.updatePrice(this.pricingBook.isbn, newPrice);
      this.alertMessage = `Updated price for "${updated.title}" to ₹${updated.price}. Past sales records maintain their historical prices.`;
      this.pricingBook = undefined;
    } catch (err: any) {
      this.formError = err.message || 'Error updating price.';
    }
  }
}

