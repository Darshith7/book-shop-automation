import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RequestService } from '../../../core/services/request.service';
import { BookRequest } from '../../../core/models/request.model';

@Component({
  selector: 'app-view-requests',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="py-6">
      <div class="text-xs text-neutral-500 mb-4">
        <a routerLink="/manager" class="hover:underline">Manager Console</a> &gt; <span>Procurement Requests</span>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold font-serif text-neutral-900">
            Customer Book Procurement Requests
          </h1>
          <p class="text-xs text-neutral-500 mt-1">
            Review titles requested by customers that are not currently sold in our catalogue
          </p>
        </div>
        <div class="text-xs font-semibold text-neutral-600">
          Total Requests: {{ requests.length }}
        </div>
      </div>

      <div class="card bg-white shadow-sm">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Date</th>
                <th>Requested Book Title</th>
                <th>Author</th>
                <th>Publisher / Edition Details</th>
                <th>Customer Notes</th>
                <th class="text-center">Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (req of requests; track req.requestId) {
                <tr>
                  <td>
                    <span class="font-mono font-bold text-xs text-neutral-900">{{ req.requestId }}</span>
                  </td>
                  <td class="text-xs text-neutral-600 whitespace-nowrap">
                    {{ req.requestDate | date:'mediumDate' }}
                  </td>
                  <td>
                    <div class="font-bold text-xs text-neutral-900">{{ req.title }}</div>
                  </td>
                  <td class="text-xs text-neutral-700">
                    {{ req.author || 'Not specified' }}
                  </td>
                  <td class="text-xs text-neutral-600">
                    {{ req.publisherDetails || 'Not specified' }}
                  </td>
                  <td class="text-xs text-neutral-500 max-w-xs">
                    {{ req.additionalDetails || '-' }}
                  </td>
                  <td class="text-center">
                    @if (req.status === 'PENDING') {
                      <span class="badge badge-warning text-[10px]">PENDING</span>
                    } @else if (req.status === 'PROCURED') {
                      <span class="badge badge-success text-[10px]">PROCURED</span>
                    } @else {
                      <span class="badge badge-danger text-[10px]">REJECTED</span>
                    }
                  </td>
                  <td class="text-center whitespace-nowrap">
                    @if (req.status === 'PENDING') {
                      <button type="button"
                              (click)="updateStatus(req.requestId, 'PROCURED')"
                              class="btn btn-sm btn-outline py-1 px-2 text-xs text-emerald-800 mr-1">
                        Mark Procured
                      </button>
                      <button type="button"
                              (click)="updateStatus(req.requestId, 'REJECTED')"
                              class="btn btn-sm btn-outline py-1 px-2 text-xs text-red-700">
                        Dismiss
                      </button>
                    } @else {
                      <button type="button"
                              (click)="updateStatus(req.requestId, 'PENDING')"
                              class="btn btn-sm btn-outline py-1 px-2 text-xs text-neutral-500">
                        Reset Status
                      </button>
                    }
                  </td>
                </tr>
              }
              @if (requests.length === 0) {
                <tr>
                  <td colspan="8" class="text-center py-10 text-neutral-400 text-xs">
                    No customer procurement requests logged.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ViewRequestsComponent {
  private requestService = inject(RequestService);

  get requests(): BookRequest[] {
    return this.requestService.getAllRequests();
  }

  updateStatus(requestId: string, status: 'PENDING' | 'PROCURED' | 'REJECTED'): void {
    this.requestService.updateStatus(requestId, status);
  }
}

