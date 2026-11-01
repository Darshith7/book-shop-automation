import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { BookService } from './book.service';
import { PublisherService } from './publisher.service';
import { Sale, SaleItem } from '../models/sale.model';
import { Book } from '../models/book.model';

export interface ProcessSaleResult {
  sale: Sale;
  book: Book;
  item: SaleItem;
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private storageService = inject(StorageService);
  private bookService = inject(BookService);
  private publisherService = inject(PublisherService);

  readonly sales$: Observable<Sale[]> = this.storageService.sales$;

  getAllSales(): Sale[] {
    return this.storageService.getSales();
  }

  getSaleById(saleId: string): Sale | undefined {
    return this.getAllSales().find(s => s.saleId === saleId);
  }

  getSaleByReceiptNumber(receiptNumber: string): Sale | undefined {
    const clean = receiptNumber.trim().toUpperCase();
    return this.getAllSales().find(s => s.receiptNumber.toUpperCase() === clean);
  }

  /**
   * Processes a retail book sale entered by the Sales Clerk.
   * Atomic operation: validates ISBN, positive integer quantity, and available stock.
   * If any validation fails, neither stock nor sales history changes.
   */
  processSale(
    isbn: string,
    quantity: number,
    clerkName: string = 'Sales Clerk'
  ): ProcessSaleResult {
    // 1. Validate ISBN presence
    if (!isbn || !isbn.trim()) {
      throw new Error('Please enter a valid ISBN number.');
    }

    // 2. Lookup book
    const cleanIsbn = isbn.trim().toUpperCase();
    const books = this.storageService.getBooks();
    const book = books.find(b => b.isbn.toUpperCase() === cleanIsbn);

    if (!book) {
      throw new Error(`Book with ISBN "${isbn}" not found in catalogue.`);
    }

    // 3. Validate Quantity
    if (isNaN(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`Sale quantity must be a positive integer greater than zero (received: ${quantity}).`);
    }

    // 4. Validate Sufficient Stock
    if (book.stockQuantity < quantity) {
      throw new Error(
        `Insufficient stock for "${book.title}". Available copies: ${book.stockQuantity}, Requested: ${quantity}.`
      );
    }

    // 5. Lookup Publisher for historical record
    const publisher = this.publisherService.getPublisherById(book.publisherId);
    const publisherName = publisher ? publisher.name : 'Independent Publisher';

    // 6. Deduct Stock on Book entity (encapsulated)
    book.sellCopies(quantity);

    // 7. Create SaleItem with current selling price preserved
    const saleItem = new SaleItem(
      book.isbn,
      book.title,
      publisherName,
      quantity,
      book.price
    );

    // 8. Generate unique Sale ID and sequential Receipt Number
    const saleId = `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const receiptNumber = this.storageService.getNextReceiptNumber();

    // 9. Instantiate Sale domain entity
    const sale = new Sale(
      saleId,
      receiptNumber,
      new Date(),
      [saleItem],
      clerkName
    );

    // 10. Atomically commit changes to storage
    const sales = this.storageService.getSales();
    sales.unshift(sale);

    this.storageService.saveBooks(books);
    this.storageService.saveSales(sales);

    return { sale, book, item: saleItem };
  }

  /**
   * Calculates today's total completed sales count.
   */
  getTodaySalesCount(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.getAllSales().filter(sale => {
      const d = new Date(sale.saleDate);
      return d >= today;
    }).length;
  }

  /**
   * Calculates today's total revenue.
   */
  getTodaySalesRevenue(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySales = this.getAllSales().filter(sale => {
      const d = new Date(sale.saleDate);
      return d >= today;
    });

    const sum = todaySales.reduce((acc, sale) => acc + sale.totalAmount, 0);
    return Math.round(sum * 100) / 100;
  }
}

