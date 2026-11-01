import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { Book } from '../models/book.model';
import { Sale, SaleItem } from '../models/sale.model';

describe('StorageService (LocalStorage Persistence & Typed Rehydration)', () => {
  let storageService: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [StorageService]
    });
    storageService = TestBed.inject(StorageService);
  });

  it('should initialize and seed default catalogue data on fresh run', () => {
    const books = storageService.getBooks();
    expect(books.length).toBeGreaterThanOrEqual(15);
    expect(storageService.getPublishers().length).toBeGreaterThanOrEqual(5);
    expect(storageService.getSales().length).toBeGreaterThan(0);
  });

  it('should preserve and restore domain class instances and methods from localStorage', () => {
    const books = storageService.getBooks();
    const firstBook = books[0];
    expect(firstBook instanceof Book).toBe(true);
    expect(typeof firstBook.sellCopies).toBe('function');
    expect(typeof firstBook.getAvailableStock).toBe('function');
  });

  it('should peek next receipt number without incrementing the counter', () => {
    const peek1 = storageService.peekNextReceiptNumber();
    const peek2 = storageService.peekNextReceiptNumber();
    expect(peek1).toBe(peek2);
    expect(peek1).toMatch(/^RCP-\d+$/);
  });

  it('should generate sequential receipt numbers without collisions', () => {
    const r1 = storageService.getNextReceiptNumber();
    const r2 = storageService.getNextReceiptNumber();

    expect(r1).toMatch(/^RCP-\d+$/);
    expect(r2).toMatch(/^RCP-\d+$/);
    expect(r1).not.toBe(r2);
  });

  it('should atomically commit updated books and new sale via commitSale()', () => {
    const books = storageService.getBooks();
    const targetBook = books[0];
    const initialStock = targetBook.stockQuantity;

    const clonedBook = Book.fromJSON(targetBook.toJSON());
    clonedBook.sellCopies(1);
    const updatedBooks = books.map((b, idx) => (idx === 0 ? clonedBook : b));

    const receiptNo = storageService.peekNextReceiptNumber();
    const saleItem = new SaleItem(clonedBook.isbn, clonedBook.title, 'Publisher', 1, clonedBook.price);
    const sale = new Sale('SALE-TEST-COMMIT', receiptNo, new Date(), [saleItem]);

    const salesBefore = storageService.getSales().length;

    storageService.commitSale(updatedBooks, sale);

    // Verify both book stock and sales list were updated in storage
    expect(storageService.getBooks()[0].stockQuantity).toBe(initialStock - 1);
    expect(storageService.getSales().length).toBe(salesBefore + 1);
    expect(storageService.getSales()[0].saleId).toBe('SALE-TEST-COMMIT');
  });

  it('should not update internal observables or counter when localStorage.setItem throws in commitSale()', () => {
    const books = storageService.getBooks();
    const clonedBook = Book.fromJSON(books[0].toJSON());
    clonedBook.sellCopies(1);
    const updatedBooks = [clonedBook, ...books.slice(1)];

    const receiptNo = storageService.peekNextReceiptNumber();
    const saleItem = new SaleItem(clonedBook.isbn, clonedBook.title, 'Publisher', 1, clonedBook.price);
    const sale = new Sale('SALE-FAIL', receiptNo, new Date(), [saleItem]);

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => storageService.commitSale(updatedBooks, sale)).toThrow(/Storage failure/);

    // Verify counter did not advance
    expect(storageService.peekNextReceiptNumber()).toBe(receiptNo);

    // Verify books observable was not mutated
    expect(storageService.getBooks()[0].stockQuantity).toBe(books[0].stockQuantity);

    setItemSpy.mockRestore();
  });

  it('should restore state after simulating browser refresh', () => {
    // Modify a book's price
    const books = storageService.getBooks();
    books[0].updatePrice(999);
    storageService.saveBooks(books);

    // Instantiate new service instance to simulate page refresh / restart
    const newStorageService = new StorageService();
    const reloadedBook = newStorageService.getBooks()[0];

    expect(reloadedBook.price).toBe(999);
    expect(reloadedBook instanceof Book).toBe(true);
  });
});
