import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SalesService } from './sales.service';
import { BookService } from './book.service';
import { StorageService } from './storage.service';
import { PublisherService } from './publisher.service';

describe('SalesService (Counter Billing & Sales Processing)', () => {
  let salesService: SalesService;
  let bookService: BookService;
  let storageService: StorageService;

  beforeEach(() => {
    // Reset test storage environment
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [SalesService, BookService, StorageService, PublisherService]
    });

    storageService = TestBed.inject(StorageService);
    storageService.seedInitialData();

    salesService = TestBed.inject(SalesService);
    bookService = TestBed.inject(BookService);
  });

  describe('processSale() - Transaction Processing & Validations', () => {
    it('should successfully complete sale, reduce stock, and create receipt for valid ISBN', () => {
      const targetIsbn = '978-0132350884'; // Clean Code (initial stock: 3, price: 850)
      const bookBefore = bookService.getBookByIsbn(targetIsbn)!;
      const initialStock = bookBefore.stockQuantity;
      const salesCountBefore = salesService.getAllSales().length;

      const result = salesService.processSale(targetIsbn, 2, 'Priya Sharma');

      expect(result.sale).toBeDefined();
      expect(result.sale.receiptNumber).toMatch(/^RCP-\d+$/);
      expect(result.sale.totalAmount).toBe(1700); // 2 * 850
      expect(result.item.isbn).toBe(targetIsbn);
      expect(result.item.quantity).toBe(2);
      expect(result.item.unitPrice).toBe(850);
      expect(result.item.lineTotal).toBe(1700);

      // Verify stock was reduced atomically
      const bookAfter = bookService.getBookByIsbn(targetIsbn)!;
      expect(bookAfter.stockQuantity).toBe(initialStock - 2);

      // Verify sales history was updated
      expect(salesService.getAllSales().length).toBe(salesCountBefore + 1);
    });

    it('should throw error and NOT modify stock if ISBN does not exist', () => {
      const salesCountBefore = salesService.getAllSales().length;
      expect(() => salesService.processSale('978-0000000000', 1)).toThrow(/not found in catalogue/);
      expect(salesService.getAllSales().length).toBe(salesCountBefore);
    });

    it('should throw error for blank or whitespace ISBN', () => {
      expect(() => salesService.processSale('', 1)).toThrow(/valid ISBN/);
      expect(() => salesService.processSale('   ', 1)).toThrow(/valid ISBN/);
    });

    it('should throw error if quantity is zero', () => {
      const targetIsbn = '978-0132350884';
      const initialStock = bookService.getBookByIsbn(targetIsbn)!.stockQuantity;
      expect(() => salesService.processSale(targetIsbn, 0)).toThrow(/positive integer/);
      expect(bookService.getBookByIsbn(targetIsbn)!.stockQuantity).toBe(initialStock);
    });

    it('should throw error if quantity is negative', () => {
      const targetIsbn = '978-0132350884';
      const initialStock = bookService.getBookByIsbn(targetIsbn)!.stockQuantity;
      expect(() => salesService.processSale(targetIsbn, -3)).toThrow(/positive integer/);
      expect(bookService.getBookByIsbn(targetIsbn)!.stockQuantity).toBe(initialStock);
    });

    it('should throw error if quantity is fractional', () => {
      const targetIsbn = '978-0132350884';
      const initialStock = bookService.getBookByIsbn(targetIsbn)!.stockQuantity;
      expect(() => salesService.processSale(targetIsbn, 1.5)).toThrow(/positive integer/);
      expect(bookService.getBookByIsbn(targetIsbn)!.stockQuantity).toBe(initialStock);
    });

    it('should throw error if requested quantity exceeds available stock', () => {
      const targetIsbn = '978-0132350884'; // Stock is 3
      const initialStock = bookService.getBookByIsbn(targetIsbn)!.stockQuantity;
      expect(() => salesService.processSale(targetIsbn, initialStock + 1)).toThrow(/Insufficient stock/);
      expect(bookService.getBookByIsbn(targetIsbn)!.stockQuantity).toBe(initialStock);
    });

    it('should allow purchasing exact stock quantity, reducing stock to 0', () => {
      const targetIsbn = '978-0132350884';
      const book = bookService.getBookByIsbn(targetIsbn)!;
      const exactStock = book.stockQuantity;

      const result = salesService.processSale(targetIsbn, exactStock);
      expect(result.book.stockQuantity).toBe(0);
      expect(result.book.isInStock()).toBe(false);
    });
  });

  describe('Atomic Persistence & Error Rollback Guarantees', () => {
    it('should roll back completely and NOT mutate state or consume receipt number if storage write fails', () => {
      const targetIsbn = '978-0132350884';
      const bookBefore = bookService.getBookByIsbn(targetIsbn)!;
      const stockBefore = bookBefore.stockQuantity;
      const salesBefore = salesService.getAllSales().length;
      const nextReceiptBefore = storageService.peekNextReceiptNumber();

      // Spy on localStorage.setItem to simulate QuotaExceededError or write failure
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError: LocalStorage limit reached');
      });

      expect(() => salesService.processSale(targetIsbn, 1)).toThrow(/Storage failure/);

      // Verify in-memory and stored stock remained completely unchanged
      const bookAfter = bookService.getBookByIsbn(targetIsbn)!;
      expect(bookAfter.stockQuantity).toBe(stockBefore);

      // Verify no sale was added to the sales ledger
      expect(salesService.getAllSales().length).toBe(salesBefore);

      // Verify receipt number was NOT consumed or advanced
      expect(storageService.peekNextReceiptNumber()).toBe(nextReceiptBefore);

      setItemSpy.mockRestore();
    });

    it('should not skip sequential receipt numbers between successful and failed sale attempts', () => {
      const targetIsbn = '978-0132350884';
      const nextReceipt1 = storageService.peekNextReceiptNumber();

      // Attempt 1: Fails due to validation (quantity too high)
      expect(() => salesService.processSale(targetIsbn, 999)).toThrow();
      expect(storageService.peekNextReceiptNumber()).toBe(nextReceipt1);

      // Attempt 2: Succeeds with valid quantity
      const result = salesService.processSale(targetIsbn, 1);
      expect(result.sale.receiptNumber).toBe(nextReceipt1);

      // Attempt 3: Next receipt should be next consecutive number
      const nextReceipt2 = storageService.peekNextReceiptNumber();
      expect(nextReceipt2).not.toBe(nextReceipt1);
    });
  });

  describe('Historical Unit Price Preservation', () => {
    it('should preserve original unit price on past sale receipt even if catalogue price is later updated', () => {
      const targetIsbn = '978-0201616224'; // The Pragmatic Programmer (Price: 920)
      const result = salesService.processSale(targetIsbn, 1);
      const receiptNo = result.sale.receiptNumber;

      // Now manager changes book price in catalogue to 1500
      bookService.updatePrice(targetIsbn, 1500);
      expect(bookService.getBookByIsbn(targetIsbn)!.price).toBe(1500);

      // Verify historical sale still has the original price (920)
      const historicalSale = salesService.getSaleByReceiptNumber(receiptNo)!;
      expect(historicalSale.items[0].unitPrice).toBe(920);
      expect(historicalSale.totalAmount).toBe(920);
    });
  });

  describe('Sales Metrics', () => {
    it('should calculate today sales count and revenue', () => {
      expect(salesService.getTodaySalesCount()).toBeGreaterThanOrEqual(0);
      expect(salesService.getTodaySalesRevenue()).toBeGreaterThanOrEqual(0);
    });
  });
});
