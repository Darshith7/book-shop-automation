import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import {
  ReportContext,
  SalesReportGenerator,
  DemandReportGenerator,
  ReorderReportGenerator,
  SalesReport,
  DemandReport,
  ReorderReport,
  SalesReportParams
} from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private storageService = inject(StorageService);

  // Concrete polymorphic generator instances
  private salesReportGen = new SalesReportGenerator();
  private demandReportGen = new DemandReportGenerator();
  private reorderReportGen = new ReorderReportGenerator();

  private getContext(): ReportContext {
    return {
      books: this.storageService.getBooks(),
      sales: this.storageService.getSales(),
      publishers: this.storageService.getPublishers()
    };
  }

  /**
   * Generates Sales Statistics Report for any arbitrary date range.
   */
  generateSalesReport(startDate: Date, endDate: Date): SalesReport {
    const params: SalesReportParams = { startDate, endDate };
    return this.salesReportGen.generate(this.getContext(), params);
  }

  /**
   * Generates Customer Demand Report based on enquiry counts.
   */
  generateDemandReport(): DemandReport {
    return this.demandReportGen.generate(this.getContext());
  }

  /**
   * Generates Daily Reorder Report based on 14-day sales and publisher lead times.
   */
  generateReorderReport(): ReorderReport {
    return this.reorderReportGen.generate(this.getContext());
  }
}

