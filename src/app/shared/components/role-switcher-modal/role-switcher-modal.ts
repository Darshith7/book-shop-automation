import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StaffAuthService } from '../../../core/services/staff-auth.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-role-switcher-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop">
      <div class="modal-content max-w-lg overflow-hidden">
        <div class="p-5 bg-neutral-900 text-white flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold font-serif">Staff Access & Role Switcher</h3>
            <p class="text-xs text-neutral-400">Classroom SAD Demonstration Mode</p>
          </div>
          <button type="button" (click)="close.emit()" class="text-neutral-400 hover:text-white text-xl font-bold leading-none">
            &times;
          </button>
        </div>

        <div class="p-6">
          <div class="p-3 mb-5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <strong>Demonstration Notice:</strong> Per college project guidelines, no backend or database server is used.
            This screen allows instant role switching to simulate real physical bookshop staff operations during your live viva.
          </div>

          <div class="flex flex-col gap-3">
            <!-- Customer Role Option -->
            <div (click)="selectRole('CUSTOMER')"
                 class="p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3"
                 [ngClass]="activeRole === 'CUSTOMER' ? 'border-emerald-600 bg-emerald-50/50' : 'border-neutral-200 hover:border-neutral-300'">
              <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                C
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h4 class="font-bold text-sm text-neutral-900">Customer (Public Interface)</h4>
                  @if (activeRole === 'CUSTOMER') {
                    <span class="badge badge-success text-[10px]">Active</span>
                  }
                </div>
                <p class="text-xs text-neutral-600 mt-1">
                  Browse catalogue, search by title/author, enquire about availability (increments demand), select book for purchase, or request unavailable books.
                </p>
              </div>
            </div>

            <!-- Sales Clerk Role Option -->
            <div (click)="selectRole('CLERK')"
                 class="p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3"
                 [ngClass]="activeRole === 'CLERK' ? 'border-sky-600 bg-sky-50/50' : 'border-neutral-200 hover:border-neutral-300'">
              <div class="w-10 h-10 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-sm shrink-0">
                SC
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h4 class="font-bold text-sm text-neutral-900">Sales Clerk (Front Counter)</h4>
                  @if (activeRole === 'CLERK') {
                    <span class="badge badge-info text-[10px]">Active</span>
                  }
                </div>
                <p class="text-xs text-neutral-600 mt-1">
                  Enters ISBN given by customer, verifies stock, completes physical book sale, deducts stock, prints tax receipts, and reviews past sales history.
                </p>
              </div>
            </div>

            <!-- Manager Role Option -->
            <div (click)="selectRole('MANAGER')"
                 class="p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3"
                 [ngClass]="activeRole === 'MANAGER' ? 'border-indigo-600 bg-indigo-50/50' : 'border-neutral-200 hover:border-neutral-300'">
              <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm shrink-0">
                M
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h4 class="font-bold text-sm text-neutral-900">Bookshop Owner / Manager</h4>
                  @if (activeRole === 'MANAGER') {
                    <span class="badge badge-neutral text-[10px]">Active</span>
                  }
                </div>
                <p class="text-xs text-neutral-600 mt-1">
                  Full supervision: Manage books & prices, maintain publisher records, view customer demand, generate sales statistics for any period, and run the daily reorder report.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-end">
          <button type="button" (click)="close.emit()" class="btn btn-outline">
            Close
          </button>
        </div>
      </div>
    </div>
  `
})
export class RoleSwitcherModalComponent {
  private authService = inject(StaffAuthService);
  private router = inject(Router);

  @Output() close = new EventEmitter<void>();

  get activeRole(): UserRole {
    return this.authService.getCurrentRole();
  }

  selectRole(role: UserRole): void {
    this.authService.switchRole(role);
    this.close.emit();

    if (role === 'CLERK') {
      this.router.navigate(['/clerk']);
    } else if (role === 'MANAGER') {
      this.router.navigate(['/manager']);
    } else {
      this.router.navigate(['/']);
    }
  }
}

