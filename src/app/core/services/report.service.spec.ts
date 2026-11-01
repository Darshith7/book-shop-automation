import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ReportService } from './report.service';
import { StorageService } from './storage.service';
import { Inventory } from '../models/inventory.model';

describe('ReportService & Polymorphic Report Generators', () => {
  let reportService: ReportService;
  let storageService: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [ReportService, StorageService]
    });

    storageService = TestBed.inject(StorageService);
    storageService.seedInitialData();
    reportService = TestBed.inject(ReportService);
  });

  describe('SalesReportGenerator', () => {
    it('should aggregate sales within date range and calculate totals', () => {
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const report = reportService.generateSalesReport(thirtyDaysAgo, now);

      expect(report.reportType).toBe('SALES_STATISTICS');
      expect(report.items.length).toBeGreaterThan(0);
      expect(report.totalCopiesSold).toBeGreaterThan(0);
      expect(report.totalRevenue).toBeGreaterThan(0);

      // Verify each item contains required columns: bookTitle, publisherName, isbn, copiesSold, salesRevenue
      for (const item of report.items) {
        expect(item.bookTitle).toBeTruthy();
        expect(item.publisherName).toBeTruthy();
        expect(item.isbn).toBeTruthy();
        expect(item.copiesSold).toBeGreaterThan(0);
        expect(item.salesRevenue).toBeGreaterThan(0);
      }
    });

    it('should throw error when start date is after end date', () => {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(() => reportService.generateSalesReport(tomorrow, today)).toThrow(/Start date cannot be after end date/);
    });
  });

  describe('DemandReportGenerator', () => {
    it('should generate demand report sorted by requestCount descending', () => {
      const report = reportService.generateDemandReport();

      expect(report.reportType).toBe('DEMAND_REPORT');
      expect(report.items.length).toBeGreaterThan(0);

      // Verify descending order
      for (let i = 0; i < report.items.length - 1; i++) {
        expect(report.items[i].requestCount).toBeGreaterThanOrEqual(report.items[i + 1].requestCount);
      }
    });
  });

  describe('ReorderReportGenerator (Case Study 11 Reorder Formula)', () => {
    it('should correctly calculate threshold = copiesSoldInLast14Days * procurementLeadDays', () => {
      // Direct unit test of mathematical formula
      const threshold = Inventory.calculateThreshold(3, 5);
      expect(threshold).toBe(15);
    });

    it('should generate reorder report identifying books below threshold with full publisher addresses', () => {
      const report = reportService.generateReorderReport();

      expect(report.reportType).toBe('REORDER_REPORT');
      expect(report.items.length).toBeGreaterThan(0);

      for (const item of report.items) {
        // Must strictly satisfy: currentStock < threshold
        expect(item.isBelowThreshold).toBe(true);
        expect(item.currentStock).toBeLessThan(item.threshold);

        // Required quantity calculation
        expect(item.quantityToProcure).toBe(item.threshold - item.currentStock);

        // Required publisher details per Case Study 11
        expect(item.publisherName).toBeTruthy();
        expect(item.publisherAddress).toBeTruthy();
        expect(item.publisherAddress.length).toBeGreaterThan(10);
      }
    });

    it('should not flag books whose currentStock is greater than or equal to threshold', () => {
      const report = reportService.generateReorderReport();

      // Find an adequate book in allEvaluations (e.g. Wings of Fire, stock: 22)
      const wingsOfFire = report.allEvaluations.find(e => e.isbn === '978-0143416319');
      expect(wingsOfFire).toBeDefined();
      if (wingsOfFire) {
        expect(wingsOfFire.currentStock).toBeGreaterThanOrEqual(wingsOfFire.threshold);
        expect(wingsOfFire.isBelowThreshold).toBe(false);
        expect(wingsOfFire.quantityToProcure).toBe(0);
      }
    });
  });
});

