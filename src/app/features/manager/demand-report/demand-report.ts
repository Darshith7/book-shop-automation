import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReportService } from '../../../core/services/report.service';
import { DemandReport, DemandReportItem } from '../../../core/models/report.model';

@Component({
  selector: 'app-demand-report',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="py-6">
      <div class="text-xs text-neutral-500 mb-4 no-print">
        <a routerLink="/manager" class="hover:underline">Manager Console</a> &gt; <span>Customer Demand Report</span>
      </div>

      <!-- Action & Header Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="badge badge-info">Demand Analysis</span>
            <span class="text-xs text-neutral-500 font-mono">Case Study Requirement #5</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-bold font-serif text-neutral-900">
            Book-Wise Customer Demand Report
          </h1>
          <p class="text-xs text-neutral-500 mt-1">
            Periodic overview of customer enquiry counts to estimate market interest and guide store replenishment
          </p>
        </div>
        <div class="flex items-center gap-2 no-print">
          <button type="button" (click)="refreshReport()" class="btn btn-outline btn-sm">
            Refresh Data
          </button>
          <button type="button" (click)="printReport()" class="btn btn-primary btn-sm">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
            </svg>
            Print Report
          </button>
        </div>
      </div>

      <!-- Demand Metric Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 no-print">
        <div class="stat-card">
          <div class="stat-icon bg-emerald-100 text-emerald-800 font-bold text-lg">
            📊
          </div>
          <div>
            <div class="stat-value">{{ report.totalEnquiriesRecorded }}</div>
            <div class="stat-label">Total Cumulative Customer Queries</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-sky-100 text-sky-800 font-bold text-lg">
            ⭐
          </div>
          <div>
            <div class="stat-value">{{ report.items[0]?.requestCount || 0 }}</div>
            <div class="stat-label">Highest Title Demand: "{{ report.items[0]?.bookTitle || 'N/A' }}"</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-purple-100 text-purple-800 font-bold text-lg">
            📚
          </div>
          <div>
            <div class="stat-value">{{ report.items.length }}</div>
            <div class="stat-label">Total Titles Monitored</div>
          </div>
        </div>
      </div>

      <!-- Printable Report Card -->
      <div class="card bg-white shadow-sm printable-area">
        <div class="p-6 border-b border-neutral-200">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-xl font-bold font-serif text-neutral-900">THE HERITAGE BOOKSHOP</h2>
              <h3 class="text-sm font-semibold text-neutral-700">Official Customer Demand & Enquiry Log</h3>
              <p class="text-xs text-neutral-500 mt-1">
                Generated On: {{ report.generatedAt | date:'medium' }}
              </p>
            </div>
            <div class="text-right text-xs text-neutral-500">
              <p>BAS Managerial Report #DEM-{{ report.generatedAt | date:'yyyyMMdd' }}</p>
              <p>Sorted by: Customer Interest (Request Field Descending)</p>
            </div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th class="w-12 text-center">Rank</th>
                <th>ISBN</th>
                <th>Book Title</th>
                <th>Author</th>
                <th>Publisher</th>
                <th class="text-center">Current Stock</th>
                <th class="text-center bg-emerald-50 text-emerald-950 font-bold">Request Field (Demand)</th>
              </tr>
            </thead>
            <tbody>
              @for (item of report.items; track item.isbn; let idx = $index) {
                <tr [ngClass]="idx < 3 ? 'bg-amber-50/20' : ''">
                  <td class="text-center font-bold text-xs text-neutral-500">
                    #{{ idx + 1 }}
                  </td>
                  <td>
                    <span class="font-mono font-bold text-xs text-neutral-900">{{ item.isbn }}</span>
                  </td>
                  <td>
                    <div class="font-bold text-xs text-neutral-900">{{ item.bookTitle }}</div>
                  </td>
                  <td class="text-xs text-neutral-700">{{ item.author }}</td>
                  <td class="text-xs text-neutral-600">{{ item.publisherName }}</td>
                  <td class="text-center font-semibold text-xs" [ngClass]="item.currentStock === 0 ? 'text-red-600' : 'text-neutral-800'">
                    {{ item.currentStock }}
                  </td>
                  <td class="text-center font-bold text-sm text-emerald-800 bg-emerald-50/40">
                    {{ item.requestCount }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="p-4 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500 flex justify-between items-center">
          <span>Note: Customer enquiry counts are incremented each time an in-stock title is checked by a customer.</span>
          <span>End of Report</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .w-4 { width: 1rem; }
    .h-4 { height: 1rem; }
    .w-12 { width: 3rem; }
  `]
})
export class DemandReportComponent implements OnInit {
  private reportService = inject(ReportService);

  report!: DemandReport;

  ngOnInit(): void {
    this.refreshReport();
  }

  refreshReport(): void {
    this.report = this.reportService.generateDemandReport();
  }

  printReport(): void {
    window.print();
  }
}

