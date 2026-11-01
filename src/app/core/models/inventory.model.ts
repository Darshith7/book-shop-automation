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
  procurementLeadDays: number;
  threshold: number;
  isBelowThreshold: boolean;
  quantityToProcure: number;
}

/**
 * Inventory domain model that coordinates stock audits, valuation,
 * and mathematical evaluation of reorder thresholds based on the Case Study rule.
 */
export class Inventory {
  /**
   * Calculates total copies sold for a specific book within the last 14 days.
   */
  static getCopiesSoldInLast14Days(isbn: string, sales: Sale[], referenceDate: Date = new Date()): number {
    const fourteenDaysAgo = new Date(referenceDate);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    // Start of the day 14 days ago
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    let soldCount = 0;
    for (const sale of sales) {
      const saleTime = new Date(sale.saleDate).getTime();
      if (saleTime >= fourteenDaysAgo.getTime() && saleTime <= referenceDate.getTime()) {
        for (const item of sale.items) {
          if (item.isbn.toUpperCase() === isbn.toUpperCase()) {
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
    return Math.max(0, copiesSoldInLast14Days * procurementLeadDays);
  }

  /**
   * Evaluates reorder status for a single book.
   */
  static evaluateReorder(
    book: Book,
    publisher: Publisher | undefined,
    sales: Sale[],
    referenceDate: Date = new Date()
  ): IReorderEvaluation {
    const leadDays = publisher ? publisher.procurementLeadDays : 7;
    const publisherName = publisher ? publisher.name : 'Unknown Publisher';
    const publisherAddress = publisher ? publisher.fullAddress : 'Address not registered';

    const copiesSold14 = Inventory.getCopiesSoldInLast14Days(book.isbn, sales, referenceDate);
    const threshold = Inventory.calculateThreshold(copiesSold14, leadDays);
    const isBelowThreshold = book.stockQuantity < threshold;
    const quantityToProcure = isBelowThreshold ? Math.max(0, threshold - book.stockQuantity) : 0;

    return {
      isbn: book.isbn,
      bookTitle: book.title,
      author: book.author,
      publisherId: book.publisherId,
      publisherName,
      publisherAddress,
      currentStock: book.stockQuantity,
      copiesSoldInLast14Days: copiesSold14,
      procurementLeadDays: leadDays,
      threshold,
      isBelowThreshold,
      quantityToProcure
    };
  }
}

