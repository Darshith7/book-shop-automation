export interface ISaleItemData {
  isbn: string;
  bookTitle: string;
  publisherName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ISaleData {
  saleId: string;
  receiptNumber: string;
  saleDate: string; // ISO string
  items: ISaleItemData[];
  totalAmount: number;
  clerkName?: string;
}

/**
 * Line item in a purchase receipt.
 * Preserves the historical price at time of sale.
 */
export class SaleItem {
  private _isbn: string;
  private _bookTitle: string;
  private _publisherName: string;
  private _quantity: number;
  private _unitPrice: number;
  private _lineTotal: number;

  constructor(
    isbn: string,
    bookTitle: string,
    publisherName: string,
    quantity: number,
    unitPrice: number
  ) {
    if (!isbn?.trim()) throw new Error('ISBN is required for sale item.');
    if (!bookTitle?.trim()) throw new Error('Book title is required.');
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Sale item quantity must be a positive integer.');
    }
    if (isNaN(unitPrice) || unitPrice < 0) {
      throw new Error('Unit price must be non-negative.');
    }

    this._isbn = isbn.trim().toUpperCase();
    this._bookTitle = bookTitle.trim();
    this._publisherName = publisherName.trim();
    this._quantity = quantity;
    this._unitPrice = unitPrice;
    this._lineTotal = Math.round(quantity * unitPrice * 100) / 100;
  }

  get isbn(): string {
    return this._isbn;
  }

  get bookTitle(): string {
    return this._bookTitle;
  }

  get publisherName(): string {
    return this._publisherName;
  }

  get quantity(): number {
    return this._quantity;
  }

  get unitPrice(): number {
    return this._unitPrice;
  }

  get lineTotal(): number {
    return this._lineTotal;
  }

  toJSON(): ISaleItemData {
    return {
      isbn: this._isbn,
      bookTitle: this._bookTitle,
      publisherName: this._publisherName,
      quantity: this._quantity,
      unitPrice: this._unitPrice,
      lineTotal: this._lineTotal
    };
  }

  static fromJSON(data: ISaleItemData): SaleItem {
    return new SaleItem(
      data.isbn,
      data.bookTitle,
      data.publisherName,
      data.quantity,
      data.unitPrice
    );
  }
}

/**
 * Sale domain entity representing completed retail book transactions.
 */
export class Sale {
  private _saleId: string;
  private _receiptNumber: string;
  private _saleDate: Date;
  private _items: SaleItem[];
  private _totalAmount: number;
  private _clerkName: string;

  constructor(
    saleId: string,
    receiptNumber: string,
    saleDate: Date | string,
    items: SaleItem[] = [],
    clerkName: string = 'Sales Clerk'
  ) {
    if (!saleId?.trim()) throw new Error('Sale ID cannot be blank.');
    if (!receiptNumber?.trim()) throw new Error('Receipt number cannot be blank.');
    if (!items || items.length === 0) {
      throw new Error('A sale must contain at least one item.');
    }

    this._saleId = saleId.trim();
    this._receiptNumber = receiptNumber.trim();
    this._saleDate = typeof saleDate === 'string' ? new Date(saleDate) : saleDate;
    this._items = [...items];
    this._clerkName = clerkName;
    this._totalAmount = this.calculateTotal();
  }

  get saleId(): string {
    return this._saleId;
  }

  get receiptNumber(): string {
    return this._receiptNumber;
  }

  get saleDate(): Date {
    return this._saleDate;
  }

  get items(): ReadonlyArray<SaleItem> {
    return this._items;
  }

  get totalAmount(): number {
    return this._totalAmount;
  }

  get clerkName(): string {
    return this._clerkName;
  }

  calculateTotal(): number {
    const sum = this._items.reduce((acc, item) => acc + item.lineTotal, 0);
    return Math.round(sum * 100) / 100;
  }

  toJSON(): ISaleData {
    return {
      saleId: this._saleId,
      receiptNumber: this._receiptNumber,
      saleDate: this._saleDate.toISOString(),
      items: this._items.map(item => item.toJSON()),
      totalAmount: this._totalAmount,
      clerkName: this._clerkName
    };
  }

  static fromJSON(data: ISaleData): Sale {
    const items = data.items.map(itemData => SaleItem.fromJSON(itemData));
    return new Sale(
      data.saleId,
      data.receiptNumber,
      new Date(data.saleDate),
      items,
      data.clerkName ?? 'Sales Clerk'
    );
  }
}

