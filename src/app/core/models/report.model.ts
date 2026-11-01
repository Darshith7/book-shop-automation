import { Book } from './book.model';
import { Publisher } from './publisher.model';
import { Sale } from './sale.model';
import { Inventory, IReorderEvaluation } from './inventory.model';

export interface ReportContext {
  books: Book[];
  sales: Sale[];
  publishers: Publisher[];
}

// ----------------- Sales Statistics Report Interfaces -----------------
export interface SalesReportParams {
  startDate: Date;
  endDate: Date;
}

export interface SalesReportItem {
  bookTitle: string;
  publisherName: string;
  isbn: string;
  copiesSold: number;
  salesRevenue: number;
}

export interface SalesReport {
  reportType: 'SALES_STATISTICS';
  title: string;
  startDate: Date;
  endDate: Date;
  generatedAt: Date;
  items: SalesReportItem[];
  totalCopiesSold: number;
  totalRevenue: number;
}

// ----------------- Demand Report Interfaces -----------------
export interface DemandReportItem {
  isbn: string;
  bookTitle: string;
  author: string;
  publisherName: string;
  requestCount: number;
  currentStock: number;
}

export interface DemandReport {
  reportType: 'DEMAND_REPORT';
  title: string;
  generatedAt: Date;
  items: DemandReportItem[];
  totalEnquiriesRecorded: number;
}

// ----------------- Reorder Report Interfaces -----------------
export interface ReorderReport {
  reportType: 'REORDER_REPORT';
  title: string;
  generatedAt: Date;
  items: IReorderEvaluation[]; // Books strictly below threshold
  allEvaluations: IReorderEvaluation[]; // Complete audit of all books
  totalBooksBelowThreshold: number;
  totalCopiesToProcure: number;
}

/**
 * Base abstract class demonstrating Object-Oriented Polymorphism.
 * Concrete subclasses provide tailored generation logic across diverse reports.
 */
export abstract class ReportGenerator<TReport, TParams = void> {
  abstract readonly reportType: string;
  abstract readonly reportTitle: string;

  /**
   * Polymorphic method implemented differently by each concrete report generator.
   */
  abstract generate(context: ReportContext, params?: TParams): TReport;
}

/**
 * Concrete Polymorphic Report: Sales Statistics Report Generator
 */
export class SalesReportGenerator extends ReportGenerator<SalesReport, SalesReportParams> {
  readonly reportType = 'SALES_STATISTICS';
  readonly reportTitle = 'Sales Statistics Report';

  generate(context: ReportContext, params?: SalesReportParams): SalesReport {
    if (!params || !params.startDate || !params.endDate) {
      throw new Error('Start date and end date are mandatory for Sales Statistics report.');
    }

    const start = new Date(params.startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(params.endDate);
    end.setHours(23, 59, 59, 999);

    if (start.getTime() > end.getTime()) {
      throw new Error('Start date cannot be after end date.');
    }

    // Map to aggregate by ISBN
    const aggregation = new Map<string, { bookTitle: string; publisherName: string; isbn: string; copiesSold: number; revenue: number }>();

    for (const sale of context.sales) {
      const saleDate = new Date(sale.saleDate);
      if (saleDate >= start && saleDate <= end) {
        for (const item of sale.items) {
          const key = item.isbn.toUpperCase();
          const existing = aggregation.get(key);
          if (existing) {
            existing.copiesSold += item.quantity;
            existing.revenue = Math.round((existing.revenue + item.lineTotal) * 100) / 100;
          } else {
            aggregation.set(key, {
              bookTitle: item.bookTitle,
              publisherName: item.publisherName,
              isbn: item.isbn,
              copiesSold: item.quantity,
              revenue: item.lineTotal
            });
          }
        }
      }
    }

    const items: SalesReportItem[] = Array.from(aggregation.values()).map(entry => ({
      bookTitle: entry.bookTitle,
      publisherName: entry.publisherName,
      isbn: entry.isbn,
      copiesSold: entry.copiesSold,
      salesRevenue: entry.revenue
    }));

    // Sort by copies sold descending
    items.sort((a, b) => b.copiesSold - a.copiesSold);

    const totalCopiesSold = items.reduce((sum, item) => sum + item.copiesSold, 0);
    const totalRevenue = Math.round(items.reduce((sum, item) => sum + item.salesRevenue, 0) * 100) / 100;

    return {
      reportType: 'SALES_STATISTICS',
      title: this.reportTitle,
      startDate: start,
      endDate: end,
      generatedAt: new Date(),
      items,
      totalCopiesSold,
      totalRevenue
    };
  }
}

/**
 * Concrete Polymorphic Report: Customer Demand Report Generator
 */
export class DemandReportGenerator extends ReportGenerator<DemandReport, void> {
  readonly reportType = 'DEMAND_REPORT';
  readonly reportTitle = 'Customer Demand & Enquiry Analysis';

  generate(context: ReportContext): DemandReport {
    const publisherMap = new Map<string, string>();
    for (const pub of context.publishers) {
      publisherMap.set(pub.publisherId, pub.name);
    }

    const items: DemandReportItem[] = context.books.map(book => ({
      isbn: book.isbn,
      bookTitle: book.title,
      author: book.author,
      publisherName: publisherMap.get(book.publisherId) || 'Unknown Publisher',
      requestCount: book.requestCount,
      currentStock: book.stockQuantity
    }));

    // Sort by demand (requestCount) descending
    items.sort((a, b) => b.requestCount - a.requestCount);

    const totalEnquiriesRecorded = items.reduce((sum, item) => sum + item.requestCount, 0);

    return {
      reportType: 'DEMAND_REPORT',
      title: this.reportTitle,
      generatedAt: new Date(),
      items,
      totalEnquiriesRecorded
    };
  }
}

/**
 * Concrete Polymorphic Report: Daily Reorder Report Generator
 * Strictly calculates inventory thresholds using the Case Study 11 formula:
 * threshold = copiesSoldInLast14Days * procurementLeadTimeDays
 */
export class ReorderReportGenerator extends ReportGenerator<ReorderReport, void> {
  readonly reportType = 'REORDER_REPORT';
  readonly reportTitle = "Daily Reorder & Publisher Procurement Report";

  generate(context: ReportContext): ReorderReport {
    const publisherMap = new Map<string, Publisher>();
    for (const pub of context.publishers) {
      publisherMap.set(pub.publisherId, pub);
    }

    const allEvaluations: IReorderEvaluation[] = [];
    const reorderItems: IReorderEvaluation[] = [];

    const now = new Date();

    for (const book of context.books) {
      const publisher = publisherMap.get(book.publisherId);
      const evalResult = Inventory.evaluateReorder(book, publisher, context.sales, now);
      allEvaluations.push(evalResult);

      if (evalResult.isBelowThreshold) {
        reorderItems.push(evalResult);
      }
    }

    // Sort reorder items by largest deficit first
    reorderItems.sort((a, b) => b.quantityToProcure - a.quantityToProcure);

    const totalCopiesToProcure = reorderItems.reduce((acc, curr) => acc + curr.quantityToProcure, 0);

    return {
      reportType: 'REORDER_REPORT',
      title: this.reportTitle,
      generatedAt: now,
      items: reorderItems,
      allEvaluations,
      totalBooksBelowThreshold: reorderItems.length,
      totalCopiesToProcure
    };
  }
}

