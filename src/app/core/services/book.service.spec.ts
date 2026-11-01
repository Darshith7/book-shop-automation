import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BookService } from './book.service';
import { StorageService } from './storage.service';

describe('BookService (Catalogue, Search, & Enquiry Tracking)', () => {
  let bookService: BookService;
  let storageService: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [BookService, StorageService]
    });

    storageService = TestBed.inject(StorageService);
    storageService.seedInitialData();
    bookService = TestBed.inject(BookService);
  });

  describe('Search Operations', () => {
    it('should find books by matching title', () => {
      const results = bookService.searchBooks('Clean Code', 'title');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toContain('Clean Code');
    });

    it('should find books by matching author', () => {
      const results = bookService.searchBooks('Kalam', 'author');
      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results.every(b => b.author.includes('Kalam'))).toBe(true);
    });

    it('should return empty array for non-matching queries', () => {
      const results = bookService.searchBooks('NonExistentTitleXYZ123');
      expect(results.length).toBe(0);
    });

    it('should return all books when search query is empty', () => {
      const all = bookService.getAllBooks();
      const results = bookService.searchBooks('');
      expect(results.length).toBe(all.length);
    });
  });

  describe('recordEnquiry() - Customer Demand Tracking', () => {
    it('should increment requestCount when enquiry is performed for an in-stock book', () => {
      const targetIsbn = '978-0132350884'; // In stock
      const bookBefore = bookService.getBookByIsbn(targetIsbn)!;
      const initialRequests = bookBefore.requestCount;

      const updated = bookService.recordEnquiry(targetIsbn);
      expect(updated.requestCount).toBe(initialRequests + 1);

      // Verify persisted in storage
      const reloaded = bookService.getBookByIsbn(targetIsbn)!;
      expect(reloaded.requestCount).toBe(initialRequests + 1);
    });

    it('should NOT increment requestCount for an out-of-stock book', () => {
      const targetIsbn = '978-0070591165'; // Database System Concepts (Stock: 0)
      const bookBefore = bookService.getBookByIsbn(targetIsbn)!;
      expect(bookBefore.stockQuantity).toBe(0);
      const initialRequests = bookBefore.requestCount;

      const result = bookService.recordEnquiry(targetIsbn);
      expect(result.requestCount).toBe(initialRequests);
    });

    it('should throw error when recording enquiry for non-existent ISBN', () => {
      expect(() => bookService.recordEnquiry('978-9999999999')).toThrow(/not found/);
    });
  });

  describe('addBook() - Manager Catalogue Additions', () => {
    it('should register a new book with unique ISBN', () => {
      const newBook = bookService.addBook({
        isbn: '978-0321356680',
        title: 'Effective Java',
        author: 'Joshua Bloch',
        publisherId: 'PUB-001',
        price: 899,
        stockQuantity: 10,
        requestCount: 0,
        category: 'Computer Science'
      });

      expect(newBook.isbn).toBe('978-0321356680');
      expect(bookService.getBookByIsbn('978-0321356680')).toBeDefined();
    });

    it('should prevent duplicate ISBN registration', () => {
      expect(() =>
        bookService.addBook({
          isbn: '978-0132350884', // Existing ISBN
          title: 'Duplicate Title',
          author: 'Some Author',
          publisherId: 'PUB-001',
          price: 500,
          stockQuantity: 5,
          requestCount: 0
        })
      ).toThrow(/already exists/);
    });
  });
});

