import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PublisherService } from '../../../core/services/publisher.service';
import { BookService } from '../../../core/services/book.service';
import { Publisher, IPublisherData } from '../../../core/models/publisher.model';

@Component({
  selector: 'app-manage-publishers',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="py-6">
      <div class="text-xs text-neutral-500 mb-4">
        <a routerLink="/manager" class="hover:underline">Manager Console</a> &gt; <span>Publishers</span>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold font-serif text-neutral-900">
            Publishers & Procurement Lead Times
          </h1>
          <p class="text-xs text-neutral-500 mt-1">
            Maintain publisher full mailing addresses and procurement turnaround times for reorder calculations
          </p>
        </div>
        <button type="button" (click)="openAddModal()" class="btn btn-primary btn-sm">
          + Register New Publisher
        </button>
      </div>

      @if (alertMessage) {
        <div class="p-3 mb-6 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg flex items-center justify-between">
          <span>{{ alertMessage }}</span>
          <button type="button" (click)="alertMessage = ''" class="font-bold">&times;</button>
        </div>
      }

      <div class="card bg-white shadow-sm">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Publisher ID</th>
                <th>Publisher Name</th>
                <th>Full Postal Mailing Address</th>
                <th class="text-center">Lead Time</th>
                <th class="text-center">Supplied Titles</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (pub of publishers; track pub.publisherId) {
                <tr>
                  <td>
                    <span class="font-mono font-bold text-xs text-neutral-900">{{ pub.publisherId }}</span>
                  </td>
                  <td>
                    <div class="font-semibold text-xs text-neutral-900">{{ pub.name }}</div>
                  </td>
                  <td class="text-xs text-neutral-600 max-w-xs">
                    {{ pub.fullAddress }}
                  </td>
                  <td class="text-center font-bold text-xs text-indigo-900">
                    {{ pub.procurementLeadDays }} days
                  </td>
                  <td class="text-center">
                    <span class="badge badge-neutral text-[10px]">
                      {{ getSuppliedTitlesCount(pub.publisherId) }} books
                    </span>
                  </td>
                  <td class="text-center">
                    <button type="button" (click)="openEditModal(pub)" class="btn btn-sm btn-outline py-1 px-2 text-xs">
                      Edit Address / Days
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ADD PUBLISHER MODAL -->
    @if (showAddModal) {
      <div class="modal-backdrop">
        <div class="modal-content max-w-lg p-6">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
            <h3 class="text-lg font-bold font-serif text-neutral-900">Register New Publisher</h3>
            <button type="button" (click)="showAddModal = false" class="text-xl font-bold">&times;</button>
          </div>

          @if (formError) {
            <div class="p-3 mb-4 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
              {{ formError }}
            </div>
          }

          <form [formGroup]="publisherForm" (ngSubmit)="saveNewPublisher()">
            <div class="form-group">
              <label class="form-label">Publisher ID <span class="required">*</span></label>
              <input type="text" formControlName="publisherId" placeholder="e.g. PUB-007" class="form-input font-mono uppercase text-sm">
            </div>

            <div class="form-group">
              <label class="form-label">Publisher Name <span class="required">*</span></label>
              <input type="text" formControlName="name" placeholder="e.g. Wiley India Academic" class="form-input text-sm">
            </div>

            <div class="form-group">
              <label class="form-label">Full Postal Mailing Address <span class="required">*</span></label>
              <textarea formControlName="fullAddress" rows="3" placeholder="Full postal address for purchase orders..." class="form-textarea text-sm"></textarea>
              <div class="form-help">Per Case Study 11, full address must appear on printed reorder reports.</div>
            </div>

            <div class="form-group">
              <label class="form-label">Procurement Lead Time (Days) <span class="required">*</span></label>
              <input type="number" formControlName="procurementLeadDays" min="1" step="1" class="form-input text-sm">
              <div class="form-help">Number of business days it takes to procure books from this publisher.</div>
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-neutral-200">
              <button type="button" (click)="showAddModal = false" class="btn btn-outline">Cancel</button>
              <button type="submit" [disabled]="publisherForm.invalid" class="btn btn-primary">Save Publisher</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- EDIT PUBLISHER MODAL -->
    @if (editingPublisher) {
      <div class="modal-backdrop">
        <div class="modal-content max-w-lg p-6">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200">
            <h3 class="text-lg font-bold font-serif text-neutral-900">Edit Publisher Details</h3>
            <button type="button" (click)="editingPublisher = undefined" class="text-xl font-bold">&times;</button>
          </div>

          @if (formError) {
            <div class="p-3 mb-4 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
              {{ formError }}
            </div>
          }

          <form [formGroup]="editPublisherForm" (ngSubmit)="saveEditedPublisher()">
            <div class="form-group">
              <label class="form-label">Publisher Name <span class="required">*</span></label>
              <input type="text" formControlName="name" class="form-input text-sm">
            </div>

            <div class="form-group">
              <label class="form-label">Full Postal Mailing Address <span class="required">*</span></label>
              <textarea formControlName="fullAddress" rows="3" class="form-textarea text-sm"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Procurement Lead Time (Days) <span class="required">*</span></label>
              <input type="number" formControlName="procurementLeadDays" min="1" step="1" class="form-input text-sm">
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-neutral-200">
              <button type="button" (click)="editingPublisher = undefined" class="btn btn-outline">Cancel</button>
              <button type="submit" [disabled]="editPublisherForm.invalid" class="btn btn-primary">Update Publisher</button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ManagePublishersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private publisherService = inject(PublisherService);
  private bookService = inject(BookService);

  alertMessage = '';
  formError = '';
  showAddModal = false;
  editingPublisher?: Publisher;

  publisherForm!: FormGroup;
  editPublisherForm!: FormGroup;

  ngOnInit(): void {
    this.publisherForm = this.fb.group({
      publisherId: ['', Validators.required],
      name: ['', Validators.required],
      fullAddress: ['', Validators.required],
      procurementLeadDays: [7, [Validators.required, Validators.min(1)]]
    });

    this.editPublisherForm = this.fb.group({
      name: ['', Validators.required],
      fullAddress: ['', Validators.required],
      procurementLeadDays: [7, [Validators.required, Validators.min(1)]]
    });
  }

  get publishers(): Publisher[] {
    return this.publisherService.getAllPublishers();
  }

  getSuppliedTitlesCount(publisherId: string): number {
    return this.bookService.getAllBooks().filter(b => b.publisherId === publisherId).length;
  }

  openAddModal(): void {
    this.formError = '';
    const nextId = `PUB-00${this.publishers.length + 1}`;
    this.publisherForm.reset({
      publisherId: nextId,
      name: '',
      fullAddress: '',
      procurementLeadDays: 7
    });
    this.showAddModal = true;
  }

  saveNewPublisher(): void {
    this.formError = '';
    if (this.publisherForm.invalid) return;

    try {
      const data: IPublisherData = this.publisherForm.value;
      const created = this.publisherService.addPublisher(data);
      this.alertMessage = `Publisher "${created.name}" registered successfully.`;
      this.showAddModal = false;
    } catch (err: any) {
      this.formError = err.message || 'Error registering publisher.';
    }
  }

  openEditModal(pub: Publisher): void {
    this.formError = '';
    this.editingPublisher = pub;
    this.editPublisherForm.patchValue({
      name: pub.name,
      fullAddress: pub.fullAddress,
      procurementLeadDays: pub.procurementLeadDays
    });
  }

  saveEditedPublisher(): void {
    if (!this.editingPublisher || this.editPublisherForm.invalid) return;

    try {
      const { name, fullAddress, procurementLeadDays } = this.editPublisherForm.value;
      const updated = this.publisherService.updatePublisher(
        this.editingPublisher.publisherId,
        name,
        fullAddress,
        Number(procurementLeadDays)
      );
      this.alertMessage = `Updated details for "${updated.name}".`;
      this.editingPublisher = undefined;
    } catch (err: any) {
      this.formError = err.message || 'Error updating publisher.';
    }
  }
}

