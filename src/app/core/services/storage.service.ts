import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Book, IBookData } from '../models/book.model';
import { Publisher, IPublisherData } from '../models/publisher.model';
import { Sale, ISaleData } from '../models/sale.model';
import { BookRequest, IBookRequestData } from '../models/request.model';
import { BookEnquiry, IBookEnquiryData } from '../models/enquiry.model';
import { UserRole } from '../models/user.model';
import {
  INITIAL_BOOKS,
  INITIAL_PUBLISHERS,
  INITIAL_SALES,
  INITIAL_REQUESTS,
  INITIAL_ENQUIRIES
} from '../data/sample-data';

interface IBasStorageSnapshot {
  version: string;
  books: IBookData[];
  publishers: IPublisherData[];
  sales: ISaleData[];
  requests: IBookRequestData[];
  enquiries: IBookEnquiryData[];
  currentRole: UserRole;
  receiptCounter: number;
}

const STORAGE_KEY = 'BAS_APP_STATE_V1';
const CURRENT_VERSION = '1.0.0';

/**
 * StorageService: Centralized LocalStorage persistence manager.
 * Handles typed serialization and reconstruction of domain class instances.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _books$ = new BehaviorSubject<Book[]>([]);
  private _publishers$ = new BehaviorSubject<Publisher[]>([]);
  private _sales$ = new BehaviorSubject<Sale[]>([]);
  private _requests$ = new BehaviorSubject<BookRequest[]>([]);
  private _enquiries$ = new BehaviorSubject<BookEnquiry[]>([]);
  private _currentRole$ = new BehaviorSubject<UserRole>('CUSTOMER');
  private _receiptCounter = 1005;

  readonly books$ = this._books$.asObservable();
  readonly publishers$ = this._publishers$.asObservable();
  readonly sales$ = this._sales$.asObservable();
  readonly requests$ = this._requests$.asObservable();
  readonly enquiries$ = this._enquiries$.asObservable();
  readonly currentRole$ = this._currentRole$.asObservable();

  constructor() {
    this.loadState();
  }

  // --- Initial Load & Rehydration ---

  private loadState(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.seedInitialData();
        return;
      }

      const parsed: IBasStorageSnapshot = JSON.parse(raw);
      if (!parsed || parsed.version !== CURRENT_VERSION) {
        console.warn('BAS: Storage version mismatch or empty state. Re-seeding initial data.');
        this.seedInitialData();
        return;
      }

      // Rehydrate classes from raw data
      const books = (parsed.books || []).map(b => Book.fromJSON(b));
      const publishers = (parsed.publishers || []).map(p => Publisher.fromJSON(p));
      const sales = (parsed.sales || []).map(s => Sale.fromJSON(s));
      const requests = (parsed.requests || []).map(r => BookRequest.fromJSON(r));
      const enquiries = (parsed.enquiries || []).map(e => BookEnquiry.fromJSON(e));
      const role = parsed.currentRole || 'CUSTOMER';
      this._receiptCounter = parsed.receiptCounter || 1005;

      this._books$.next(books);
      this._publishers$.next(publishers);
      this._sales$.next(sales);
      this._requests$.next(requests);
      this._enquiries$.next(enquiries);
      this._currentRole$.next(role);
    } catch (err) {
      console.error('BAS: Failed to rehydrate from localStorage. Resetting to seed data.', err);
      this.seedInitialData();
    }
  }

  private persist(): void {
    try {
      const snapshot: IBasStorageSnapshot = {
        version: CURRENT_VERSION,
        books: this._books$.value.map(b => b.toJSON()),
        publishers: this._publishers$.value.map(p => p.toJSON()),
        sales: this._sales$.value.map(s => s.toJSON()),
        requests: this._requests$.value.map(r => r.toJSON()),
        enquiries: this._enquiries$.value.map(e => e.toJSON()),
        currentRole: this._currentRole$.value,
        receiptCounter: this._receiptCounter
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (err) {
      console.error('BAS: Error saving state to localStorage', err);
    }
  }

  /**
   * Resets entire application state to clean seed demonstration data.
   */
  seedInitialData(): void {
    const books = INITIAL_BOOKS.map(b => Book.fromJSON(b));
    const publishers = INITIAL_PUBLISHERS.map(p => Publisher.fromJSON(p));
    const sales = INITIAL_SALES.map(s => Sale.fromJSON(s));
    const requests = INITIAL_REQUESTS.map(r => BookRequest.fromJSON(r));
    const enquiries = INITIAL_ENQUIRIES.map(e => BookEnquiry.fromJSON(e));
    this._receiptCounter = 1005;

    this._books$.next(books);
    this._publishers$.next(publishers);
    this._sales$.next(sales);
    this._requests$.next(requests);
    this._enquiries$.next(enquiries);
    this._currentRole$.next('CUSTOMER');

    this.persist();
  }

  // --- Synchronous Getters ---

  getBooks(): Book[] {
    return this._books$.value;
  }

  getPublishers(): Publisher[] {
    return this._publishers$.value;
  }

  getSales(): Sale[] {
    return this._sales$.value;
  }

  getRequests(): BookRequest[] {
    return this._requests$.value;
  }

  getEnquiries(): BookEnquiry[] {
    return this._enquiries$.value;
  }

  getCurrentRole(): UserRole {
    return this._currentRole$.value;
  }

  peekNextReceiptNumber(): string {
    return `RCP-${this._receiptCounter + 1}`;
  }

  getNextReceiptNumber(): string {
    this._receiptCounter += 1;
    this.persist();
    return `RCP-${this._receiptCounter}`;
  }

  /**
   * Commits a book sale and stock reduction as a single atomic LocalStorage write operation.
   * State and Observables are updated ONLY if localStorage.setItem succeeds.
   * If persistence fails, state is not altered and the receipt counter is preserved.
   */
  commitSale(updatedBooks: Book[], newSale: Sale): void {
    const nextCounter = this._receiptCounter + 1;
    const currentSales = this._sales$.value;
    const updatedSales = [newSale, ...currentSales];

    const snapshot: IBasStorageSnapshot = {
      version: CURRENT_VERSION,
      books: updatedBooks.map(b => b.toJSON()),
      publishers: this._publishers$.value.map(p => p.toJSON()),
      sales: updatedSales.map(s => s.toJSON()),
      requests: this._requests$.value.map(r => r.toJSON()),
      enquiries: this._enquiries$.value.map(e => e.toJSON()),
      currentRole: this._currentRole$.value,
      receiptCounter: nextCounter
    };

    // Logical single storage write
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (err) {
      console.error('BAS: Failed to persist sale to LocalStorage:', err);
      throw new Error('Storage failure: Unable to record sale to local storage. State remains unchanged.');
    }

    // Only upon successful persistence: mutate in-memory state and emit to observables
    this._receiptCounter = nextCounter;
    this._books$.next([...updatedBooks]);
    this._sales$.next(updatedSales);
  }

  // --- Mutators ---

  saveBooks(books: Book[]): void {
    this._books$.next([...books]);
    this.persist();
  }

  savePublishers(publishers: Publisher[]): void {
    this._publishers$.next([...publishers]);
    this.persist();
  }

  saveSales(sales: Sale[]): void {
    this._sales$.next([...sales]);
    this.persist();
  }

  saveRequests(requests: BookRequest[]): void {
    this._requests$.next([...requests]);
    this.persist();
  }

  saveEnquiries(enquiries: BookEnquiry[]): void {
    this._enquiries$.next([...enquiries]);
    this.persist();
  }

  saveCurrentRole(role: UserRole): void {
    this._currentRole$.next(role);
    this.persist();
  }
}

