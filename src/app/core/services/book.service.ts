import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { Book, IBookData } from '../models/book.model';
import { BookEnquiry } from '../models/enquiry.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private storageService = inject(StorageService);

  readonly books$: Observable<Book[]> = this.storageService.books$;

  getAllBooks(): Book[] {
    return this.storageService.getBooks();
  }

  getBookByIsbn(isbn: string): Book | undefined {
    if (!isbn) return undefined;
    const clean = isbn.trim().toUpperCase();
    return this.getAllBooks().find(b => b.isbn.toUpperCase() === clean);
  }

  /**
   * Search books by title, author, or both.
   */
  searchBooks(query: string, searchType: 'all' | 'title' | 'author' = 'all'): Book[] {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      return this.getAllBooks();
    }

    return this.getAllBooks().filter(b => {
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchAuthor = b.author.toLowerCase().includes(q);
      const matchIsbn = b.isbn.toLowerCase().includes(q);

      if (searchType === 'title') return matchTitle;
      if (searchType === 'author') return matchAuthor;
      return matchTitle || matchAuthor || matchIsbn;
    });
  }

  /**
   * Explicit action: Customer queries availability of an in-stock book.
   * Increments the book's requestCount and creates an enquiry log.
   */
  recordEnquiry(isbn: string): Book {
    const books = this.getAllBooks();
    const book = books.find(b => b.isbn.toUpperCase() === isbn.trim().toUpperCase());
    if (!book) {
      throw new Error(`Book with ISBN ${isbn} not found in catalogue.`);
    }

    if (book.isInStock()) {
      book.recordEnquiry();

      // Log enquiry record
      const enquiries = this.storageService.getEnquiries();
      const newEnquiry = new BookEnquiry(
        `ENQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        book.isbn,
        book.title,
        new Date()
      );
      enquiries.unshift(newEnquiry);

      this.storageService.saveBooks(books);
      this.storageService.saveEnquiries(enquiries);
    }

    return book;
  }

  /**
   * Add a new book to the catalogue (Manager only).
   */
  addBook(data: IBookData): Book {
    const books = this.getAllBooks();
    const cleanIsbn = data.isbn.trim().toUpperCase();

    const exists = books.find(b => b.isbn.toUpperCase() === cleanIsbn);
    if (exists) {
      throw new Error(`A book with ISBN "${data.isbn}" already exists in the catalogue.`);
    }

    const newBook = new Book(
      cleanIsbn,
      data.title,
      data.author,
      data.publisherId,
      data.price,
      data.stockQuantity,
      0,
      data.category,
      data.description
    );

    books.push(newBook);
    this.storageService.saveBooks(books);
    return newBook;
  }

  /**
   * Updates existing book details.
   */
  updateBook(
    isbn: string,
    title: string,
    author: string,
    publisherId: string,
    price: number,
    category?: string,
    description?: string
  ): Book {
    const books = this.getAllBooks();
    const book = books.find(b => b.isbn.toUpperCase() === isbn.trim().toUpperCase());
    if (!book) {
      throw new Error(`Book with ISBN "${isbn}" not found.`);
    }

    book.updateDetails(title, author, publisherId, price, category, description);
    this.storageService.saveBooks(books);
    return book;
  }

  /**
   * Updates only the catalogue selling price (Manager function).
   */
  updatePrice(isbn: string, newPrice: number): Book {
    const books = this.getAllBooks();
    const book = books.find(b => b.isbn.toUpperCase() === isbn.trim().toUpperCase());
    if (!book) {
      throw new Error(`Book with ISBN "${isbn}" not found.`);
    }

    book.updatePrice(newPrice);
    this.storageService.saveBooks(books);
    return book;
  }

  /**
   * Receives additional stock copies for an existing book.
   */
  receiveStock(isbn: string, quantity: number): Book {
    const books = this.getAllBooks();
    const book = books.find(b => b.isbn.toUpperCase() === isbn.trim().toUpperCase());
    if (!book) {
      throw new Error(`Book with ISBN "${isbn}" not found.`);
    }

    book.receiveCopies(quantity);
    this.storageService.saveBooks(books);
    return book;
  }
}

