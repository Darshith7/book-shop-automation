import { Book } from './book.model';
import { Publisher } from './publisher.model';
import { Sale } from './sale.model';

export interface IReorderEvaluation {
  isbn: string;
  bookTitle: string;
  author: string;
  publisherId: string;
  publisherName: string;
  publisherAddress: string;
  currentStock: number;
  copiesSoldInLast14Days: number;
  procurementLeadDays: number | null;
  threshold: number | null;
  isBelowThreshold: boolean;
  quantityToProcure: number;
  hasValidPublisher: boolean;
  publisherIssue?: string;
}

/**
 * Inventory domain model that coordinates stock audits, valuation,
 * and mathematical evaluation of reorder thresholds based on the Case Study rule.
 */
export class Inventory {
  /**
   * Exact rolling 14 days in milliseconds: 14 * 24 * 60 * 60 * 1000 = 1,209,600,000 ms.
   */
  static readonly ROLLING_14_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

  /**
   * Calculates total copies sold for a specific book within an exact rolling 14-day window
   * ending at the reference timestamp: [referenceDate - 14 days, referenceDate].
   *
   * Invariant rules:
   * - Includes sales within the defined 14-day window.
   * - Excludes sales strictly older than cutoff (saleTime < cutoffTime).
   * - Excludes sales strictly after reference timestamp (saleTime > refTime).
   * - Includes sales exactly on the cutoff (saleTime === cutoffTime).
   * - Includes sales exactly at the reference timestamp (saleTime === refTime).
   */
  static getCopiesSoldInLast14Days(isbn: string, sales: Sale[], referenceDate: Date = new Date()): number {
    const cleanIsbn = isbn.trim().toUpperCase();
    const refTime = referenceDate.getTime();
    const cutoffTime = refTime - Inventory.ROLLING_14_DAYS_MS;

    let soldCount = 0;
    for (const sale of sales) {
      const saleTime = new Date(sale.saleDate).getTime();
      if (saleTime >= cutoffTime && saleTime <= refTime) {
        for (const item of sale.items) {
          if (item.isbn.trim().toUpperCase() === cleanIsbn) {
            soldCount += item.quantity;
          }
        }
      }
    }
    return soldCount;
  }

  /**
   * Calculates required inventory threshold strictly using Case Study 11 specification:
   * "Inventory level required for a book is equal to the number of copies of the book
   * sold over a period of two weeks multiplied by the available number of days
   * it takes to procure the book from its publisher."
   *
   * threshold = copiesSoldInLast14Days * procurementLeadDays
   */
  static calculateThreshold(copiesSoldInLast14Days: number, procurementLeadDays: number): number {
    if (!Number.isInteger(procurementLeadDays) || procurementLeadDays < 1) {
      throw new Error(`Invalid procurement lead days: ${procurementLeadDays}. Must be an integer >= 1.`);
    }
    return Math.max(0, copiesSoldInLast14Days * procurementLeadDays);
  }

  /**
   * Evaluates reorder status for a single book.
   * Strictly avoids inventing or defaulting a missing publisher's lead time.
   * Books with missing or invalid publisher data are flagged with hasValidPublisher = false.
   */
  static evaluateReorder(
    book: Book,
    publisher: Publisher | undefined,
    sales: Sale[],
    referenceDate: Date = new Date()
  ): IReorderEvaluation {
    const copiesSold14 = Inventory.getCopiesSoldInLast14Days(book.isbn, sales, referenceDate);

    // Case A: Publisher is completely missing from registry
    if (!publisher) {
      return {
        isbn: book.isbn,
        bookTitle: book.title,
        author: book.author,
        publisherId: book.publisherId,
        publisherName: 'Unregistered Publisher',
        publisherAddress: 'Address unavailable (Publisher ID not registered in directory)',
        currentStock: book.stockQuantity,
        copiesSoldInLast14Days: copiesSold14,
        procurementLeadDays: null,
        threshold: null,
        isBelowThreshold: false,
        quantityToProcure: 0,
        hasValidPublisher: false,
        publisherIssue: `Publisher ID "${book.publisherId}" is not registered in the publisher directory.`
      };
    }

    // Case B: Publisher exists but has non-positive or invalid lead time
    const leadDays = publisher.procurementLeadDays;
    if (isNaN(leadDays) || !Number.isInteger(leadDays) || leadDays < 1) {
      return {
        isbn: book.isbn,
        bookTitle: book.title,
        author: book.author,
        publisherId: book.publisherId,
        publisherName: publisher.name,
        publisherAddress: publisher.fullAddress,
        currentStock: book.stockQuantity,
        copiesSoldInLast14Days: copiesSold14,
        procurementLeadDays: null,
        threshold: null,
        isBelowThreshold: false,
        quantityToProcure: 0,
        hasValidPublisher: false,
        publisherIssue: `Publisher "${publisher.name}" has invalid procurement lead days: ${leadDays}. Must be >= 1.`
      };
    }

    // Case C: Valid publisher and lead time -> execute authentic Case Study 11 calculation
    const threshold = Inventory.calculateThreshold(copiesSold14, leadDays);
    const isBelowThreshold = book.stockQuantity < threshold;
    const quantityToProcure = isBelowThreshold ? Math.max(0, threshold - book.stockQuantity) : 0;

    return {
      isbn: book.isbn,
      bookTitle: book.title,
      author: book.author,
      publisherId: book.publisherId,
      publisherName: publisher.name,
      publisherAddress: publisher.fullAddress,
      currentStock: book.stockQuantity,
      copiesSoldInLast14Days: copiesSold14,
      procurementLeadDays: leadDays,
      threshold,
      isBelowThreshold,
      quantityToProcure,
      hasValidPublisher: true
    };
  }
}
