import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-neutral-200">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center"
                 [ngClass]="isDanger ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-neutral-900">{{ title }}</h3>
              <p class="text-xs text-neutral-500 font-medium">Action Confirmation</p>
            </div>
          </div>
          <p class="text-sm text-neutral-600 leading-relaxed">{{ message }}</p>
        </div>
        <div class="bg-neutral-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-neutral-200">
          <button type="button"
                  (click)="cancel.emit()"
                  class="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors">
            {{ cancelText }}
          </button>
          <button type="button"
                  (click)="confirm.emit()"
                  [ngClass]="isDanger ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-emerald-700 hover:bg-emerald-800 text-white'"
                  class="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-colors">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Input() isDanger: boolean = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}

