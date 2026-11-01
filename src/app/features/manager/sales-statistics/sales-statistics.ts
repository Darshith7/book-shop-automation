import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../core/services/report.service';
import { SalesReport } from '../../../core/models/report.model';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-sales-statistics',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, InrCurrencyPipe],
  template: `
    <div class="py-6">
      <div class="text-xs text-neutral-500 mb-4 no-print">
        <a routerLink="/manager" class="hover:underline">Manager Console</a> &gt; <span>Sales Statistics</span>
      </div>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="badge badge-neutral">Financial & Sales Audit</span>
            <span class="text-xs text-neutral-500 font-mono">Case Study Requirement #9</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-bold font-serif text-neutral-900">
            Sales Statistics for Selected Period
          </h1>
          <p class="text-xs text-neutral-500 mt-1">
            Analyze exact business performance, units sold, and revenue across any custom date interval
          </p>
        </div>
        <div class="flex items-center gap-2 no-print">
          <button type="button" (click)="printReport()" class="btn btn-primary btn-sm">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
            </svg>
            Print Sales Audit
          </button>
        </div>
      </div>

      <!-- Date Range Filter Form (no-print) -->
      <div class="card p-5 mb-6 bg-white shadow-sm no-print">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label class="form-label text-xs">Start Date (Inclusive)</label>
            <input type="date" [(ngModel)]="startDateStr" class="form-input text-sm">
          </div>
          <div>
            <label class="form-label text-xs">End Date (Inclusive)</label>
            <input type="date" [(ngModel)]="endDateStr" class="form-input text-sm">
          </div>
          <div class="flex gap-2">
            <button type="button" (click)="generateReport()" class="btn btn-primary text-sm flex-1">
              Generate Report
            </button>
            <button type="button" (click)="setPreset(14)" class="btn btn-outline text-xs" title="Last 14 Days">
              Last 14d
            </button>
            <button type="button" (click)="setPreset(30)" class="btn btn-outline text-xs" title="Last 30 Days">
              Last 30d
            </button>
          </div>
        </div>

        @if (validationError) {
          <div class="form-error mt-2">{{ validationError }}</div>
        }
      </div>

      <!-- Financial Metric Highlights (no-print) -->
      @if (report) {
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 no-print">
          <div class="stat-card">
            <div class="stat-icon bg-emerald-100 text-emerald-800">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <div class="stat-value">{{ report.totalRevenue | inrCurrency }}</div>
              <div class="stat-label">Total Revenue for Period</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon bg-sky-100 text-sky-800">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <div class="stat-value">{{ report.totalCopiesSold }} units</div>
              <div class="stat-label">Total Copies Sold</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon bg-purple-100 text-purple-800">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <div>
              <div class="stat-value">{{ report.items.length }}</div>
              <div class="stat-label">Distinct Titles Sold</div>
            </div>
          </div>
        </div>

        <!-- Printable Report Card -->
        <div class="card bg-white shadow-sm printable-area">
          <div class="p-6 border-b border-neutral-200">
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-xl font-bold font-serif text-neutral-900">THE HERITAGE BOOKSHOP</h2>
                <h3 class="text-sm font-semibold text-neutral-700">Official Sales Statistics Report</h3>
                <p class="text-xs text-neutral-600 mt-1">
                  Reporting Interval: <strong>{{ report.startDate | date:'longDate' }}</strong> to <strong>{{ report.endDate | date:'longDate' }}</strong>
                </p>
              </div>
              <div class="text-right text-xs text-neutral-500">
                <p>Audited from Store Sales Ledger</p>
                <p>Generated At: {{ report.generatedAt | date:'medium' }}</p>
              </div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Publisher</th>
                  <th>ISBN Number</th>
                  <th class="text-center">Copies Sold</th>
                  <th class="text-right">Sales Revenue</th>
                </tr>
              </thead>
              <tbody>
                @for (item of report.items; track item.isbn) {
                  <tr>
                    <td>
                      <div class="font-bold text-xs text-neutral-900">{{ item.bookTitle }}</div>
                    </td>
                    <td class="text-xs text-neutral-600">{{ item.publisherName }}</td>
                    <td>
                      <span class="font-mono font-semibold text-xs text-neutral-800">{{ item.isbn }}</span>
                    </td>
                    <td class="text-center font-bold text-xs text-neutral-900">
                      {{ item.copiesSold }}
                    </td>
                    <td class="text-right font-bold text-xs text-emerald-900">
                      {{ item.salesRevenue | inrCurrency }}
                    </td>
                  </tr>
                }
                @if (report.items.length === 0) {
                  <tr>
                    <td colspan="5" class="text-center py-8 text-neutral-400 text-xs">
                      No sales recorded within the selected date interval.
                    </td>
                  </tr>
                }
              </tbody>
              <!-- Totals Footer Row -->
              <tfoot>
                <tr class="bg-neutral-100 font-bold border-t-2 border-neutral-400">
                  <td colspan="3" class="text-right text-xs uppercase tracking-wider text-neutral-700">
                    Grand Totals for Period:
                  </td>
                  <td class="text-center text-sm text-neutral-900">
                    {{ report.totalCopiesSold }} units
                  </td>
                  <td class="text-right text-sm text-emerald-950 font-bold">
                    {{ report.totalRevenue | inrCurrency }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="p-4 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500 flex justify-between items-center">
            <span>Verified retail store financial ledger data.</span>
            <span>Sign: ____________________ (Store Owner)</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .w-4 { width: 1rem; }
    .h-4 { height: 1rem; }
    .w-6 { width: 1.5rem; }
    .h-6 { height: 1.5rem; }
  `]
})
export class SalesStatisticsComponent implements OnInit {
  private reportService = inject(ReportService);

  startDateStr = '';
  endDateStr = '';
  validationError = '';
  report?: SalesReport;

  ngOnInit(): void {
    // Default preset: last 30 days
    this.setPreset(30);
  }

  setPreset(days: number): void {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    this.startDateStr = start.toISOString().split('T')[0];
    this.endDateStr = end.toISOString().split('T')[0];
    this.generateReport();
  }

  generateReport(): void {
    this.validationError = '';
    if (!this.startDateStr || !this.endDateStr) {
      this.validationError = 'Please select both start and end dates.';
      return;
    }

    const start = new Date(this.startDateStr);
    const end = new Date(this.endDateStr);

    if (start.getTime() > end.getTime()) {
      this.validationError = 'Start date cannot be after end date.';
      return;
    }

    try {
      this.report = this.reportService.generateSalesReport(start, end);
    } catch (err: any) {
      this.validationError = err.message || 'Error generating sales statistics report.';
    }
  }

  printReport(): void {
    window.print();
  }
}

