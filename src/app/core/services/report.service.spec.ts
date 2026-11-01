import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ReportService } from './report.service';
import { StorageService } from './storage.service';
import { Inventory } from '../models/inventory.model';
import { Book } from '../models/book.model';
import { Publisher } from '../models/publisher.model';
import { Sale, SaleItem } from '../models/sale.model';

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

  describe('Rolling 14-Day Calculation Boundary Tests (Fixed Dates)', () => {
    const testIsbn = '978-0132350884';
    const fixedReferenceDate = new Date('2026-11-15T12:00:00.000Z');
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    const exactCutoff = new Date(fixedReferenceDate.getTime() - fourteenDaysMs); // 2026-11-01T12:00:00.000Z

    function createTestSale(saleDate: Date, quantity: number): Sale {
      const item = new SaleItem(testIsbn, 'Test Book', 'Test Publisher', quantity, 500);
      return new Sale(`TEST-${Date.now()}-${Math.random()}`, `RCP-TEST`, saleDate, [item]);
    }

    it('should include sales occurring exactly on the 14-day cutoff timestamp', () => {
      const saleAtCutoff = createTestSale(exactCutoff, 3);
      const count = Inventory.getCopiesSoldInLast14Days(testIsbn, [saleAtCutoff], fixedReferenceDate);
      expect(count).toBe(3);
    });

    it('should exclude sales occurring 1 millisecond before the 14-day cutoff timestamp', () => {
      const justBeforeCutoff = new Date(exactCutoff.getTime() - 1);
      const saleBefore = createTestSale(justBeforeCutoff, 5);
      const count = Inventory.getCopiesSoldInLast14Days(testIsbn, [saleBefore], fixedReferenceDate);
      expect(count).toBe(0);
    });

    it('should include sales occurring exactly at the reference timestamp', () => {
      const saleAtRef = createTestSale(fixedReferenceDate, 4);
      const count = Inventory.getCopiesSoldInLast14Days(testIsbn, [saleAtRef], fixedReferenceDate);
      expect(count).toBe(4);
    });

    it('should exclude sales occurring 1 millisecond after the reference timestamp', () => {
      const justAfterRef = new Date(fixedReferenceDate.getTime() + 1);
      const saleAfter = createTestSale(justAfterRef, 6);
      const count = Inventory.getCopiesSoldInLast14Days(testIsbn, [saleAfter], fixedReferenceDate);
      expect(count).toBe(0);
    });

    it('should aggregate multiple sales inside the rolling 14-day window', () => {
      const midSale1 = createTestSale(new Date(fixedReferenceDate.getTime() - 2 * 24 * 60 * 60 * 1000), 2);
      const midSale2 = createTestSale(new Date(fixedReferenceDate.getTime() - 7 * 24 * 60 * 60 * 1000), 3);
      const oldSale = createTestSale(new Date(fixedReferenceDate.getTime() - 15 * 24 * 60 * 60 * 1000), 10);

      const count = Inventory.getCopiesSoldInLast14Days(testIsbn, [midSale1, midSale2, oldSale], fixedReferenceDate);
      expect(count).toBe(5); // 2 + 3 (oldSale is outside window)
    });
  });

  describe('Publisher Lead-Time & Threshold Evaluation', () => {
    it('should correctly calculate threshold = copiesSoldInLast14Days * procurementLeadDays', () => {
      const threshold = Inventory.calculateThreshold(3, 5);
      expect(threshold).toBe(15);
    });

    it('should throw error when calculateThreshold is called with non-positive or non-integer lead days', () => {
      expect(() => Inventory.calculateThreshold(3, 0)).toThrow(/Invalid procurement lead days/);
      expect(() => Inventory.calculateThreshold(3, -2)).toThrow(/Invalid procurement lead days/);
      expect(() => Inventory.calculateThreshold(3, 3.5)).toThrow(/Invalid procurement lead days/);
    });

    it('should flag incomplete publisher information when publisher is missing from directory', () => {
      const book = new Book('978-9999999999', 'Ghost Book', 'Ghost Author', 'PUB-NONEXISTENT', 500, 2);
      const evaluation = Inventory.evaluateReorder(book, undefined, []);

      expect(evaluation.hasValidPublisher).toBe(false);
      expect(evaluation.threshold).toBeNull();
      expect(evaluation.procurementLeadDays).toBeNull();
      expect(evaluation.isBelowThreshold).toBe(false);
      expect(evaluation.publisherIssue).toContain('not registered');
    });

    it('should flag incomplete publisher information when publisher lead days is invalid', () => {
      const book = new Book('978-9999999999', 'Invalid Pub Book', 'Author', 'PUB-BAD', 500, 2);
      // Create publisher with invalid lead time (cast to bypass constructor check to simulate bad data)
      const invalidPublisher = {
        publisherId: 'PUB-BAD',
        name: 'Bad Publisher',
        fullAddress: 'Some address',
        procurementLeadDays: 0
      } as unknown as Publisher;

      const evaluation = Inventory.evaluateReorder(book, invalidPublisher, []);

      expect(evaluation.hasValidPublisher).toBe(false);
      expect(evaluation.threshold).toBeNull();
      expect(evaluation.procurementLeadDays).toBeNull();
      expect(evaluation.isBelowThreshold).toBe(false);
      expect(evaluation.publisherIssue).toContain('invalid procurement lead days');
    });

    it('should generate reorder report identifying books below threshold with full publisher addresses', () => {
      const report = reportService.generateReorderReport();

      expect(report.reportType).toBe('REORDER_REPORT');
      expect(report.items.length).toBeGreaterThan(0);

      for (const item of report.items) {
        expect(item.hasValidPublisher).toBe(true);
        expect(item.isBelowThreshold).toBe(true);
        expect(item.currentStock).toBeLessThan(item.threshold!);
        expect(item.quantityToProcure).toBe(item.threshold! - item.currentStock);
        expect(item.publisherName).toBeTruthy();
        expect(item.publisherAddress.length).toBeGreaterThan(10);
      }
    });

    it('should separate incomplete books into incompleteItems in ReorderReport', () => {
      // Temporarily inject a book with an unregistered publisher
      const books = storageService.getBooks();
      const orphanBook = new Book('978-9999999991', 'Unregistered Title', 'Unknown', 'PUB-MISSING-99', 500, 1);
      books.push(orphanBook);
      storageService.saveBooks(books);

      const report = reportService.generateReorderReport();
      const orphanInReport = report.incompleteItems.find(i => i.isbn === orphanBook.isbn);

      expect(orphanInReport).toBeDefined();
      expect(orphanInReport!.hasValidPublisher).toBe(false);
      expect(orphanInReport!.threshold).toBeNull();
      // Must NOT be present in valid procurement dispatch items
      expect(report.items.some(i => i.isbn === orphanBook.isbn)).toBe(false);
    });

    it('should not flag books whose currentStock is greater than or equal to threshold', () => {
      const report = reportService.generateReorderReport();

      // Find an adequate book in allEvaluations (e.g. Wings of Fire, stock: 22)
      const wingsOfFire = report.allEvaluations.find(e => e.isbn === '978-0143416319');
      expect(wingsOfFire).toBeDefined();
      if (wingsOfFire) {
        expect(wingsOfFire.currentStock).toBeGreaterThanOrEqual(wingsOfFire.threshold!);
        expect(wingsOfFire.isBelowThreshold).toBe(false);
        expect(wingsOfFire.quantityToProcure).toBe(0);
      }
    });
  });
});
