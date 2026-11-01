import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReportService } from '../../../core/services/report.service';
import { ReorderReport } from '../../../core/models/report.model';

@Component({
  selector: 'app-reorder-report',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="py-6">
      <div class="text-xs text-neutral-500 mb-4 no-print">
        <a routerLink="/manager" class="hover:underline">Manager Console</a> &gt; <span>Daily Reorder Report</span>
      </div>

      <!-- Action & Header Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="badge badge-accent">Daily Replenishment Order</span>
            <span class="text-xs text-neutral-500 font-mono">Case Study Requirements #10, #11, #12</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-bold font-serif text-neutral-900">
            Daily Books Reorder & Publisher Procurement Report
          </h1>
          <p class="text-xs text-neutral-500 mt-1">
            Formula: <em>Threshold = Copies Sold in Last 14 Days &times; Publisher Lead Days</em>. Identifies stock below threshold.
          </p>
        </div>
        <div class="flex items-center gap-2 no-print">
          <button type="button" (click)="generateReport()" class="btn btn-primary btn-sm">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Generate Today's Reorder Report
          </button>
          <button type="button" (click)="printReport()" class="btn btn-outline btn-sm">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
            </svg>
            Print Reorder Report
          </button>
        </div>
      </div>

      <!-- Formula & Case Study Explanation Card (no-print) -->
      <div class="card p-5 mb-6 bg-[#fbf8f2] border-[#e4dcd0] text-xs no-print">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 font-bold">
            📐
          </div>
          <div>
            <h4 class="font-bold text-amber-950 text-sm mb-1">Original Case Study 11 Specification & Formula Implementation:</h4>
            <p class="text-amber-900 leading-relaxed mb-2">
              <em>"The inventory level required for a book is equal to the number of copies of the book sold over a period of two weeks multiplied by the available number of days it takes to procure the book from its publisher. Every day the book shop owner would give a command for the BAS to print the books which have fallen below the threshold and the number of copies to be procured along with full address of the publisher."</em>
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono bg-white/70 p-2.5 rounded border border-amber-200">
              <div><strong>Threshold:</strong> Sold(14d) &times; LeadDays</div>
              <div><strong>Reorder Trigger:</strong> Stock &lt; Threshold</div>
              <div><strong>Copies to Procure:</strong> max(0, Threshold - Stock)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Metric Highlights (no-print) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 no-print">
        <div class="stat-card" [ngClass]="report.totalBooksBelowThreshold > 0 ? 'border-red-300 bg-red-50/20' : ''">
          <div class="stat-icon bg-red-100 text-red-800">
            ⚠️
          </div>
          <div>
            <div class="stat-value text-red-700">{{ report.totalBooksBelowThreshold }}</div>
            <div class="stat-label">Titles Requiring Procurement Today</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-amber-100 text-amber-800">
            📦
          </div>
          <div>
            <div class="stat-value text-amber-900">{{ report.totalCopiesToProcure }} units</div>
            <div class="stat-label">Total Volume of Copies to Procure</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-emerald-100 text-emerald-800">
            ✅
          </div>
          <div>
            <div class="stat-value text-emerald-800">
              {{ report.allEvaluations.length - report.totalBooksBelowThreshold }} / {{ report.allEvaluations.length }}
            </div>
            <div class="stat-label">Titles Currently at Safe Stock Levels</div>
          </div>
        </div>
      </div>

      <!-- Tab Selection (no-print) -->
      <div class="flex items-center gap-2 mb-4 no-print border-b border-neutral-200 pb-2">
        <button type="button"
                (click)="activeTab = 'reorder'"
                class="btn btn-sm"
                [ngClass]="activeTab === 'reorder' ? 'btn-primary' : 'btn-outline'">
          Procurement Dispatch Orders ({{ report.items.length }})
        </button>
        <button type="button"
                (click)="activeTab = 'audit'"
                class="btn btn-sm"
                [ngClass]="activeTab === 'audit' ? 'btn-primary' : 'btn-outline'">
          Full Inventory Threshold Audit (All {{ report.allEvaluations.length }} Books)
        </button>
      </div>

      <!-- MAIN REPORT PRINTABLE AREA -->
      <div class="card bg-white shadow-sm printable-area">
        <!-- Header -->
        <div class="p-6 border-b border-neutral-200">
          <div class="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h2 class="text-xl font-bold font-serif text-neutral-900">THE HERITAGE BOOKSHOP</h2>
              <h3 class="text-sm font-semibold text-neutral-800">
                DAILY INVENTORY REORDER & PUBLISHER PROCUREMENT DISPATCH REPORT
              </h3>
              <p class="text-xs text-neutral-500 mt-1">
                Generated by Store Owner Command on: <strong>{{ report.generatedAt | date:'fullDate' }}</strong> ({{ report.generatedAt | date:'mediumTime' }})
              </p>
            </div>
            <div class="text-right text-xs text-neutral-500">
              <p class="font-bold text-neutral-800">DISPATCH REF: ORD-{{ report.generatedAt | date:'yyyyMMdd' }}-BAS</p>
              <p>Threshold Formula: 14-Day Sales &times; Publisher Lead Days</p>
            </div>
          </div>
        </div>

        @if (activeTab === 'reorder') {
          <!-- Filtered: Only Books Below Threshold Requiring Orders -->
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr class="bg-amber-50/70">
                  <th>ISBN</th>
                  <th>Book Title & Author</th>
                  <th class="text-center">Current Stock</th>
                  <th class="text-center">Sold (14d)</th>
                  <th class="text-center">Lead Days</th>
                  <th class="text-center">Threshold</th>
                  <th class="text-center bg-red-100 text-red-950 font-bold">Copies to Procure</th>
                  <th>Publisher & Full Postal Address</th>
                </tr>
              </thead>
              <tbody>
                @for (item of report.items; track item.isbn) {
                  <tr>
                    <td>
                      <span class="font-mono font-bold text-xs text-neutral-900">{{ item.isbn }}</span>
                    </td>
                    <td>
                      <div class="font-bold text-xs text-neutral-900">{{ item.bookTitle }}</div>
                      <div class="text-[11px] text-neutral-500">By {{ item.author }}</div>
                    </td>
                    <td class="text-center font-bold text-xs text-red-700 bg-red-50/30">
                      {{ item.currentStock }}
                    </td>
                    <td class="text-center text-xs">
                      {{ item.copiesSoldInLast14Days }}
                    </td>
                    <td class="text-center text-xs font-semibold">
                      {{ item.procurementLeadDays }}d
                    </td>
                    <td class="text-center font-bold text-xs text-amber-900 bg-amber-50">
                      {{ item.threshold }}
                    </td>
                    <td class="text-center font-bold text-sm text-red-800 bg-red-100">
                      {{ item.quantityToProcure }}
                    </td>
                    <td class="text-xs">
                      <div class="font-bold text-neutral-900">{{ item.publisherName }}</div>
                      <div class="text-neutral-600 text-[11px] max-w-sm mt-0.5 leading-snug">
                        {{ item.publisherAddress }}
                      </div>
                    </td>
                  </tr>
                }
                @if (report.items.length === 0) {
                  <tr>
                    <td colspan="8" class="text-center py-10 text-emerald-800 bg-emerald-50/40 text-xs">
                      ✅ All book inventory levels are currently above their required threshold. No procurement required today.
                    </td>
                  </tr>
                }
              </tbody>
              @if (report.items.length > 0) {
                <tfoot>
                  <tr class="bg-neutral-100 font-bold border-t-2 border-neutral-400">
                    <td colspan="6" class="text-right text-xs uppercase tracking-wider text-neutral-700">
                      Total Titles to Replenish: {{ report.items.length }} | Total Procurement Volume:
                    </td>
                    <td class="text-center text-sm font-bold text-red-900 bg-red-100">
                      {{ report.totalCopiesToProcure }} units
                    </td>
                    <td class="text-xs text-neutral-500">
                      Dispatch orders to respective publisher addresses listed above.
                    </td>
                  </tr>
                </tfoot>
              }
            </table>
          </div>
        } @else {
          <!-- Complete Inventory Audit Table (All Books) -->
          <div class="table-responsive">
            <table class="table text-xs">
              <thead>
                <tr>
                  <th>ISBN</th>
                  <th>Book Title</th>
                  <th class="text-center">Stock</th>
                  <th class="text-center">Sold (14d)</th>
                  <th class="text-center">Lead Days</th>
                  <th class="text-center">Threshold</th>
                  <th class="text-center">Deficit / Procure</th>
                  <th class="text-center">Status</th>
                  <th>Publisher</th>
                </tr>
              </thead>
              <tbody>
                @for (item of report.allEvaluations; track item.isbn) {
                  <tr [ngClass]="item.isBelowThreshold ? 'bg-red-50/40' : ''">
                    <td class="font-mono text-neutral-900 font-bold">{{ item.isbn }}</td>
                    <td class="font-semibold text-neutral-900">{{ item.bookTitle }}</td>
                    <td class="text-center font-bold" [ngClass]="item.currentStock < item.threshold ? 'text-red-700' : 'text-emerald-700'">
                      {{ item.currentStock }}
                    </td>
                    <td class="text-center">{{ item.copiesSoldInLast14Days }}</td>
                    <td class="text-center">{{ item.procurementLeadDays }}d</td>
                    <td class="text-center font-bold">{{ item.threshold }}</td>
                    <td class="text-center font-bold" [ngClass]="item.quantityToProcure > 0 ? 'text-red-700' : 'text-neutral-400'">
                      {{ item.quantityToProcure > 0 ? item.quantityToProcure : '-' }}
                    </td>
                    <td class="text-center">
                      @if (item.isBelowThreshold) {
                        <span class="badge badge-danger text-[9px]">BELOW THRESHOLD</span>
                      } @else {
                        <span class="badge badge-success text-[9px]">ADEQUATE</span>
                      }
                    </td>
                    <td class="text-neutral-600 truncate max-w-xs">{{ item.publisherName }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Footer Signoff -->
        <div class="p-6 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-600 flex justify-between items-center flex-wrap gap-4">
          <div>
            <p><strong>Store Manager Verification:</strong> Verified against physical counts and sales ledger records.</p>
            <p class="text-[11px] text-neutral-500">Purchase orders are dispatched with publisher delivery lead requirements.</p>
          </div>
          <div class="text-right">
            <p class="font-serif">Authorized Signature: ________________________________</p>
            <p class="text-[10px] text-neutral-400 mt-1">Bookshop Owner / Store Inventory Controller</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .w-4 { width: 1rem; }
    .h-4 { height: 1rem; }
    .w-8 { width: 2rem; }
    .h-8 { height: 2rem; }
  `]
})
export class ReorderReportComponent implements OnInit {
  private reportService = inject(ReportService);

  report!: ReorderReport;
  activeTab: 'reorder' | 'audit' = 'reorder';

  ngOnInit(): void {
    this.generateReport();
  }

  generateReport(): void {
    this.report = this.reportService.generateReorderReport();
  }

  printReport(): void {
    window.print();
  }
}

