import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { PublisherService } from './publisher.service';
import { Inventory, IReorderEvaluation } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private storageService = inject(StorageService);
  private publisherService = inject(PublisherService);

  /**
   * Returns a complete audit list of reorder evaluations for all books in catalogue.
   */
  getAllReorderEvaluations(): IReorderEvaluation[] {
    const books = this.storageService.getBooks();
    const sales = this.storageService.getSales();
    const now = new Date();

    return books.map(book => {
      const publisher = this.publisherService.getPublisherById(book.publisherId);
      return Inventory.evaluateReorder(book, publisher, sales, now);
    });
  }

  /**
   * Returns only books currently falling below their required threshold.
   */
  getBooksBelowThreshold(): IReorderEvaluation[] {
    return this.getAllReorderEvaluations().filter(evaluation => evaluation.isBelowThreshold);
  }

  /**
   * Total physical book copies across the store.
   */
  getTotalStockUnits(): number {
    return this.storageService.getBooks().reduce((sum, b) => sum + b.stockQuantity, 0);
  }

  /**
   * Total retail valuation of books currently in stock.
   */
  getTotalInventoryValuation(): number {
    const sum = this.storageService.getBooks().reduce((acc, b) => acc + (b.stockQuantity * b.price), 0);
    return Math.round(sum * 100) / 100;
  }
}

