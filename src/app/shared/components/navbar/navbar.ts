import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StaffAuthService } from '../../../core/services/staff-auth.service';
import { StorageService } from '../../../core/services/storage.service';
import { RoleSwitcherModalComponent } from '../role-switcher-modal/role-switcher-modal';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RoleSwitcherModalComponent, ConfirmDialogComponent],
  template: `
    <header class="bg-white border-b border-[#e2ddd4] sticky top-0 z-40 shadow-sm no-print">
      <!-- Top banner for demo context -->
      <div class="bg-[#1b4332] text-white text-[11px] py-1 px-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span><strong>BAS v1.0:</strong> Physical Book-Shop Automation System (Case Study 11)</span>
        </div>
        <div class="flex items-center gap-3">
          <button type="button" (click)="openRoleModal = true" class="hover:underline flex items-center gap-1 font-semibold text-emerald-200">
            <span>Role:</span>
            <span class="bg-emerald-900/80 px-2 py-0.5 rounded text-white border border-emerald-700">
              {{ currentRoleTitle }}
            </span>
            <span class="text-[10px] bg-amber-500 text-neutral-900 font-bold px-1 rounded">Demo Switch</span>
          </button>
          <span class="text-emerald-500">|</span>
          <button type="button" (click)="openResetConfirm = true" class="text-emerald-200 hover:text-white text-[11px]">
            Reset Seed Data
          </button>
        </div>
      </div>

      <!-- Main Navigation Bar -->
      <div class="container py-3">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <!-- Logo & Branding -->
          <a routerLink="/" class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-[#1b4332] text-white flex items-center justify-center shadow-md">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <div>
              <div class="font-serif font-bold text-lg md:text-xl text-[#1f2421] leading-tight">
                The Heritage Bookshop
              </div>
              <div class="text-[11px] text-[#5c645f] font-medium tracking-wide">
                Automation System (BAS)
              </div>
            </div>
          </a>

          <!-- Contextual Navigation Links -->
          <nav class="flex items-center gap-1 md:gap-2 flex-wrap">
            <!-- Customer Links -->
            <a routerLink="/" routerLinkActive="nav-active" [routerLinkActiveOptions]="{ exact: true }"
               class="nav-link">Home</a>
            <a routerLink="/browse" routerLinkActive="nav-active"
               class="nav-link">Browse Books</a>
            <a routerLink="/request-book" routerLinkActive="nav-active"
               class="nav-link">Request Book</a>

            <!-- Staff Links (Clerk & Manager) -->
            @if (isClerk || isManager) {
              <span class="text-neutral-300 mx-1">|</span>
              <a routerLink="/clerk" routerLinkActive="nav-active" [routerLinkActiveOptions]="{ exact: true }"
                 class="nav-link">Clerk Desk</a>
              <a routerLink="/clerk/pos-sale" routerLinkActive="nav-active"
                 class="nav-link text-emerald-800 font-semibold bg-emerald-50 rounded">
                + New Sale
              </a>
              <a routerLink="/clerk/sales-history" routerLinkActive="nav-active"
                 class="nav-link">Sales History</a>
              <a routerLink="/clerk/stock-receive" routerLinkActive="nav-active"
                 class="nav-link">Receive Stock</a>
            }

            <!-- Manager Only Links -->
            @if (isManager) {
              <span class="text-neutral-300 mx-1">|</span>
              <a routerLink="/manager" routerLinkActive="nav-active" [routerLinkActiveOptions]="{ exact: true }"
                 class="nav-link font-semibold">Manager Hub</a>
              <a routerLink="/manager/books" routerLinkActive="nav-active"
                 class="nav-link">Books</a>
              <a routerLink="/manager/publishers" routerLinkActive="nav-active"
                 class="nav-link">Publishers</a>
              <a routerLink="/manager/demand-report" routerLinkActive="nav-active"
                 class="nav-link">Demand</a>
              <a routerLink="/manager/sales-statistics" routerLinkActive="nav-active"
                 class="nav-link">Sales Stats</a>
              <a routerLink="/manager/reorder-report" routerLinkActive="nav-active"
                 class="nav-link text-amber-800 font-bold bg-amber-50 rounded">
                Reorder Report
              </a>
              <a routerLink="/manager/requests" routerLinkActive="nav-active"
                 class="nav-link">Requests</a>
            }
          </nav>

          <!-- Staff Access Trigger Button -->
          <div class="flex items-center gap-2">
            <button type="button" (click)="openRoleModal = true" class="btn btn-sm btn-outline">
              <svg class="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Staff Access
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Modals -->
    @if (openRoleModal) {
      <app-role-switcher-modal (close)="openRoleModal = false"></app-role-switcher-modal>
    }

    @if (openResetConfirm) {
      <app-confirm-dialog
        title="Reset Demo Data?"
        message="This will re-initialize all catalogue books, publishers, sales records, customer enquiries, and reorder statistics back to the initial seed state. Any newly created sales or books will be overwritten."
        confirmText="Yes, Reset Data"
        cancelText="Cancel"
        [isDanger]="true"
        (confirm)="handleReset()"
        (cancel)="openResetConfirm = false">
      </app-confirm-dialog>
    }
  `,
  styles: [`
    .nav-link {
      font-size: 0.825rem;
      font-weight: 500;
      color: #5c645f;
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .nav-link:hover {
      color: #1f2421;
      background-color: #f4f1ea;
    }
    .nav-active {
      color: #1b4332 !important;
      font-weight: 700 !important;
      background-color: #e8f5ed !important;
    }
    .w-2 { width: 0.5rem; }
    .h-2 { height: 0.5rem; }
    .w-4 { width: 1rem; }
    .h-4 { height: 1rem; }
    .w-6 { width: 1.5rem; }
    .h-6 { height: 1.5rem; }
    .w-10 { width: 2.5rem; }
    .h-10 { height: 2.5rem; }
  `]
})
export class NavbarComponent {
  private authService = inject(StaffAuthService);
  private storageService = inject(StorageService);

  openRoleModal = false;
  openResetConfirm = false;

  get currentRoleTitle(): string {
    return this.authService.getCurrentUser().getRoleTitle();
  }

  get isClerk(): boolean {
    return this.authService.isClerk();
  }

  get isManager(): boolean {
    return this.authService.isManager();
  }

  handleReset(): void {
    this.storageService.seedInitialData();
    this.openResetConfirm = false;
    window.location.reload();
  }
}

