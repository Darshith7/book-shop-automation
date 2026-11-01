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
   * Atomically validates ISBN, quantity, and stock, prepares new state immutably,
   * and persists books and sales in a single logical LocalStorage operation.
   * If persistence fails, previous state remains completely untouched.
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

    // 2. Lookup book in current catalogue
    const cleanIsbn = isbn.trim().toUpperCase();
    const currentBooks = this.storageService.getBooks();
    const existingBook = currentBooks.find(b => b.isbn.toUpperCase() === cleanIsbn);

    if (!existingBook) {
      throw new Error(`Book with ISBN "${isbn}" not found in catalogue.`);
    }

    // 3. Validate Quantity is a positive whole integer
    if (isNaN(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`Sale quantity must be a positive integer greater than zero (received: ${quantity}).`);
    }

    // 4. Validate Sufficient Stock
    if (existingBook.stockQuantity < quantity) {
      throw new Error(
        `Insufficient stock for "${existingBook.title}". Available copies: ${existingBook.stockQuantity}, Requested: ${quantity}.`
      );
    }

    // 5. Lookup Publisher for historical record
    const publisher = this.publisherService.getPublisherById(existingBook.publisherId);
    const publisherName = publisher ? publisher.name : 'Independent Publisher';

    // 6. Prepare updated book and inventory without prematurely mutating active state
    const updatedBook = Book.fromJSON(existingBook.toJSON());
    updatedBook.sellCopies(quantity);

    const updatedBooks = currentBooks.map(b =>
      b.isbn.toUpperCase() === cleanIsbn ? updatedBook : b
    );

    // 7. Create SaleItem with current selling price preserved
    const saleItem = new SaleItem(
      updatedBook.isbn,
      updatedBook.title,
      publisherName,
      quantity,
      updatedBook.price
    );

    // 8. Peek next sequential receipt number without prematurely advancing the counter
    const receiptNumber = this.storageService.peekNextReceiptNumber();
    const saleId = `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 9. Instantiate Sale domain entity
    const sale = new Sale(
      saleId,
      receiptNumber,
      new Date(),
      [saleItem],
      clerkName
    );

    // 10. Persist complete updated state in one logical storage operation
    // If this throws, active books, sales, and receipt counter remain unchanged
    this.storageService.commitSale(updatedBooks, sale);

    return { sale, book: updatedBook, item: saleItem };
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

