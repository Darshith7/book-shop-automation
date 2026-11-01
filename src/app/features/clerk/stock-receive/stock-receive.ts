import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookService } from '../../../core/services/book.service';
import { PublisherService } from '../../../core/services/publisher.service';
import { Book } from '../../../core/models/book.model';

@Component({
  selector: 'app-stock-receive',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="py-6 max-w-2xl mx-auto">
      <div class="text-xs text-neutral-500 mb-4">
        <a routerLink="/clerk" class="hover:underline">Clerk Desk</a> &gt; <span>Receive Stock</span>
      </div>

      <div class="card bg-white p-6 md:p-8 shadow-sm">
        <div class="mb-6 pb-4 border-b border-neutral-200">
          <span class="badge badge-success text-[10px] mb-2">Inventory Replenishment</span>
          <h1 class="text-2xl font-bold font-serif text-neutral-900">
            Receive Physical Book Stock
          </h1>
          <p class="text-xs text-neutral-600 mt-1 leading-relaxed">
            When publisher shipments arrive at the shop, enter the ISBN and number of copies to increment physical inventory.
          </p>
        </div>

        @if (successMessage) {
          <div class="p-4 mb-6 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
            <span>{{ successMessage }}</span>
            <button type="button" (click)="successMessage = ''" class="font-bold text-emerald-950">&times;</button>
          </div>
        }

        @if (errorMessage) {
          <div class="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
            {{ errorMessage }}
          </div>
        }

        <form [formGroup]="receiveForm" (ngSubmit)="onReceive()">
          <!-- ISBN Selection -->
          <div class="form-group">
            <label class="form-label">
              Select Book or Enter ISBN <span class="required">*</span>
            </label>
            <select formControlName="isbn" (change)="onBookSelect()" class="form-select text-sm mb-2">
              <option value="">-- Choose from catalogue titles --</option>
              @for (b of allBooks; track b.isbn) {
                <option [value]="b.isbn">
                  {{ b.title }} (Current Stock: {{ b.stockQuantity }})
                </option>
              }
            </select>
          </div>

          @if (selectedBook) {
            <div class="p-3 mb-4 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
              <p><strong>Selected:</strong> {{ selectedBook.title }}</p>
              <p><strong>ISBN:</strong> {{ selectedBook.isbn }} | <strong>Current Stock:</strong> {{ selectedBook.stockQuantity }} units</p>
            </div>
          }

          <!-- Quantity to Receive -->
          <div class="form-group">
            <label class="form-label">
              Number of Copies Received <span class="required">*</span>
            </label>
            <input type="number"
                   formControlName="quantity"
                   min="1"
                   step="1"
                   placeholder="e.g. 10"
                   class="form-input text-sm">
            <div class="form-help">Must be a positive whole integer.</div>
          </div>

          <div class="pt-4 border-t border-neutral-200 flex items-center justify-between">
            <a routerLink="/clerk" class="text-xs text-neutral-500 hover:text-neutral-800">
              Return to Counter
            </a>
            <button type="submit" [disabled]="receiveForm.invalid" class="btn btn-primary px-6">
              Update Inventory Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class StockReceiveComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bookService = inject(BookService);

  receiveForm!: FormGroup;
  selectedBook?: Book;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.receiveForm = this.fb.group({
      isbn: ['', Validators.required],
      quantity: [5, [Validators.required, Validators.min(1)]]
    });
  }

  get allBooks(): Book[] {
    return this.bookService.getAllBooks();
  }

  onBookSelect(): void {
    const isbn = this.receiveForm.get('isbn')?.value;
    this.selectedBook = this.bookService.getBookByIsbn(isbn);
  }

  onReceive(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.receiveForm.invalid) return;

    const { isbn, quantity } = this.receiveForm.value;
    try {
      const updated = this.bookService.receiveStock(isbn, Number(quantity));
      this.selectedBook = updated;
      this.successMessage = `Successfully received ${quantity} copies for "${updated.title}". New stock level: ${updated.stockQuantity}.`;
      this.receiveForm.patchValue({ quantity: 5 });
    } catch (err: any) {
      this.errorMessage = err.message || 'Error updating stock.';
    }
  }
}

