import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestService } from '../../../core/services/request.service';
import { BookService } from '../../../core/services/book.service';

@Component({
  selector: 'app-request-book',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="py-6 max-w-2xl mx-auto">
      <div class="text-xs text-neutral-500 mb-4">
        <a routerLink="/" class="hover:underline">Home</a> &gt; <span>Procurement Request</span>
      </div>

      <div class="card bg-white p-6 md:p-8 shadow-sm">
        <div class="mb-6 pb-4 border-b border-neutral-200">
          <span class="badge badge-warning text-[10px] mb-2">Customer Procurement Desk</span>
          <h1 class="text-2xl md:text-3xl font-bold font-serif text-neutral-900">
            Request an Unavailable Book
          </h1>
          <p class="text-xs text-neutral-600 mt-2 leading-relaxed">
            Per Case Study 11: If a requested book is not currently sold by the bookshop, customers are invited
            to provide full details of the book. Our manager reviews these requests to evaluate demand and procure
            copies directly from publishers.
          </p>
        </div>

        @if (submittedSuccess) {
          <div class="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center mb-6 animate-fade-in">
            <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
              ✓
            </div>
            <h3 class="text-lg font-bold text-emerald-900 mb-1">Procurement Request Registered</h3>
            <p class="text-xs text-emerald-800 mb-4 max-w-md mx-auto">
              Your request for <strong>"{{ submittedTitle }}"</strong> has been recorded into the manager's procurement queue (ID: {{ submittedId }}).
            </p>
            <div class="flex justify-center gap-3">
              <button type="button" (click)="resetForm()" class="btn btn-sm btn-outline">
                Request Another Book
              </button>
              <a routerLink="/browse" class="btn btn-sm btn-primary">
                Return to Catalogue
              </a>
            </div>
          </div>
        } @else {
          <!-- Notice explaining catalogue vs uncatalogued -->
          <div class="p-3 mb-6 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900">
            <strong>Note on Inventory Status:</strong> A book that exists in the catalogue with 0 stock is considered "out of stock" and will be replenished via our daily reorder report. Use this form specifically for books that are <em>not yet sold by our shop</em>.
          </div>

          <form [formGroup]="requestForm" (ngSubmit)="onSubmit()">
            <!-- Book Title (Required) -->
            <div class="form-group">
              <label class="form-label">
                Book Title <span class="required">*</span>
              </label>
              <input type="text"
                     formControlName="title"
                     placeholder="e.g. Structure and Interpretation of Computer Programs"
                     class="form-input text-sm"
                     [ngClass]="{'border-red-500': submitted && f['title'].errors}">
              @if (submitted && f['title'].errors) {
                <div class="form-error">Book title is mandatory.</div>
              }
            </div>

            <!-- Author Name -->
            <div class="form-group">
              <label class="form-label">Author Name(s) (If known)</label>
              <input type="text"
                     formControlName="author"
                     placeholder="e.g. Harold Abelson, Gerald Jay Sussman"
                     class="form-input text-sm">
            </div>

            <!-- Publisher Details -->
            <div class="form-group">
              <label class="form-label">Publisher / Edition Details (If known)</label>
              <input type="text"
                     formControlName="publisherDetails"
                     placeholder="e.g. MIT Press, 2nd Edition (ISBN-13: 978-0262510875)"
                     class="form-input text-sm">
              <div class="form-help">Include publisher name, edition, or ISBN if available.</div>
            </div>

            <!-- Additional Details / Notes -->
            <div class="form-group">
              <label class="form-label">Additional Identifying Details or Customer Notes</label>
              <textarea formControlName="additionalDetails"
                        rows="3"
                        placeholder="e.g. Required for University course syllabus by next semester..."
                        class="form-textarea text-sm"></textarea>
            </div>

            <div class="pt-4 border-t border-neutral-200 flex items-center justify-between">
              <a routerLink="/browse" class="text-xs text-neutral-500 hover:text-neutral-800">
                Cancel
              </a>
              <button type="submit" class="btn btn-primary px-6">
                Submit Procurement Request
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class RequestBookComponent implements OnInit {
  private fb = inject(FormBuilder);
  private requestService = inject(RequestService);
  private route = inject(ActivatedRoute);

  requestForm!: FormGroup;
  submitted = false;
  submittedSuccess = false;
  submittedTitle = '';
  submittedId = '';

  ngOnInit(): void {
    this.requestForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      author: [''],
      publisherDetails: [''],
      additionalDetails: ['']
    });

    this.route.queryParams.subscribe(params => {
      if (params['title']) {
        this.requestForm.patchValue({ title: params['title'] });
      }
    });
  }

  get f() {
    return this.requestForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.requestForm.invalid) {
      return;
    }

    const { title, author, publisherDetails, additionalDetails } = this.requestForm.value;
    const req = this.requestService.submitRequest(title, author, publisherDetails, additionalDetails);

    this.submittedSuccess = true;
    this.submittedTitle = req.title;
    this.submittedId = req.requestId;
  }

  resetForm(): void {
    this.submitted = false;
    this.submittedSuccess = false;
    this.requestForm.reset();
  }
}

