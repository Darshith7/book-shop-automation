import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { Book } from '../models/book.model';

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

  it('should generate sequential receipt numbers without collisions', () => {
    const r1 = storageService.getNextReceiptNumber();
    const r2 = storageService.getNextReceiptNumber();

    expect(r1).toMatch(/^RCP-\d+$/);
    expect(r2).toMatch(/^RCP-\d+$/);
    expect(r1).not.toBe(r2);
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

