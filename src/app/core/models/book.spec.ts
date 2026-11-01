import { describe, it, expect, beforeEach } from 'vitest';
import { Book } from './book.model';

describe('Book Domain Model (OOP Encapsulation & Invariants)', () => {
  let book: Book;

  beforeEach(() => {
    book = new Book(
      '978-0132350884',
      'Clean Code',
      'Robert C. Martin',
      'PUB-001',
      850,
      10,
      5,
      'Computer Science',
      'Agile software craftsmanship.'
    );
  });

  describe('Field Encapsulation & Getters', () => {
    it('should expose properties through getters without allowing direct mutation', () => {
      expect(book.isbn).toBe('978-0132350884');
      expect(book.title).toBe('Clean Code');
      expect(book.author).toBe('Robert C. Martin');
      expect(book.price).toBe(850);
      expect(book.stockQuantity).toBe(10);
      expect(book.requestCount).toBe(5);
      expect(book.isInStock()).toBe(true);
    });

    it('should correctly report available stock', () => {
      expect(book.getAvailableStock()).toBe(10);
    });
  });

  describe('sellCopies() - Stock Deduction & Boundary Invariants', () => {
    it('should successfully decrement stock for valid positive integer', () => {
      book.sellCopies(3);
      expect(book.stockQuantity).toBe(7);
      expect(book.getAvailableStock()).toBe(7);
    });

    it('should allow purchasing exact stock quantity, leaving 0 stock', () => {
      book.sellCopies(10);
      expect(book.stockQuantity).toBe(0);
      expect(book.isInStock()).toBe(false);
    });

    it('should throw an error and preserve stock when quantity exceeds available stock', () => {
      expect(() => book.sellCopies(11)).toThrow(/Insufficient stock/);
      expect(book.stockQuantity).toBe(10); // Unchanged
    });

    it('should reject zero quantity', () => {
      expect(() => book.sellCopies(0)).toThrow(/Invalid sale quantity/);
      expect(book.stockQuantity).toBe(10);
    });

    it('should reject negative quantity', () => {
      expect(() => book.sellCopies(-2)).toThrow(/Invalid sale quantity/);
      expect(book.stockQuantity).toBe(10);
    });

    it('should reject fractional / floating-point quantity', () => {
      expect(() => book.sellCopies(2.5)).toThrow(/Invalid sale quantity/);
      expect(book.stockQuantity).toBe(10);
    });
  });

  describe('receiveCopies() - Stock Inflow', () => {
    it('should successfully increment stock for valid positive integer', () => {
      book.receiveCopies(5);
      expect(book.stockQuantity).toBe(15);
    });

    it('should reject zero, negative, or fractional received quantities', () => {
      expect(() => book.receiveCopies(0)).toThrow(/Invalid receive quantity/);
      expect(() => book.receiveCopies(-5)).toThrow(/Invalid receive quantity/);
      expect(() => book.receiveCopies(3.14)).toThrow(/Invalid receive quantity/);
      expect(book.stockQuantity).toBe(10);
    });
  });

  describe('updatePrice() - Price Maintenance', () => {
    it('should update price for valid non-negative amount', () => {
      book.updatePrice(950);
      expect(book.price).toBe(950);
    });

    it('should allow zero price (e.g. promotional/free volume)', () => {
      book.updatePrice(0);
      expect(book.price).toBe(0);
    });

    it('should reject negative price', () => {
      expect(() => book.updatePrice(-100)).toThrow(/Selling price must be a valid non-negative number/);
      expect(book.price).toBe(850);
    });
  });

  describe('recordEnquiry() - Demand Counter', () => {
    it('should increment request count by 1 and return the updated count', () => {
      const initial = book.requestCount;
      const updated = book.recordEnquiry();
      expect(updated).toBe(initial + 1);
      expect(book.requestCount).toBe(initial + 1);
    });
  });

  describe('Serialization & Deserialization', () => {
    it('should serialize to plain JSON object and restore methods via fromJSON', () => {
      const json = book.toJSON();
      expect(json.isbn).toBe('978-0132350884');
      expect(json.stockQuantity).toBe(10);

      const restored = Book.fromJSON(json);
      expect(restored instanceof Book).toBe(true);
      expect(typeof restored.sellCopies).toBe('function');
      restored.sellCopies(2);
      expect(restored.stockQuantity).toBe(8);
    });
  });
});

