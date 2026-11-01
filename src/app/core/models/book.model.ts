export interface IBookData {
  isbn: string;
  title: string;
  author: string;
  publisherId: string;
  price: number;
  stockQuantity: number;
  requestCount: number;
  category?: string;
  description?: string;
}

/**
 * Book domain entity demonstrating Object-Oriented Encapsulation.
 * Maintains invariants on stock, pricing, and demand request counters.
 */
export class Book {
  private _isbn: string;
  private _title: string;
  private _author: string;
  private _publisherId: string;
  private _price: number;
  private _stockQuantity: number;
  private _requestCount: number;
  private _category: string;
  private _description: string;

  constructor(
    isbn: string,
    title: string,
    author: string,
    publisherId: string,
    price: number,
    stockQuantity: number = 0,
    requestCount: number = 0,
    category: string = 'General',
    description: string = ''
  ) {
    this.validateIsbn(isbn);
    this.validateTitle(title);
    this.validateAuthor(author);
    this.validatePrice(price);
    this.validateStock(stockQuantity);

    this._isbn = isbn.trim().toUpperCase();
    this._title = title.trim();
    this._author = author.trim();
    this._publisherId = publisherId.trim();
    this._price = Number(price);
    this._stockQuantity = Math.floor(Number(stockQuantity));
    this._requestCount = Math.max(0, Math.floor(Number(requestCount)));
    this._category = category.trim();
    this._description = description.trim();
  }

  // --- Getters ---
  get isbn(): string {
    return this._isbn;
  }

  get title(): string {
    return this._title;
  }

  get author(): string {
    return this._author;
  }

  get publisherId(): string {
    return this._publisherId;
  }

  get price(): number {
    return this._price;
  }

  get stockQuantity(): number {
    return this._stockQuantity;
  }

  get requestCount(): number {
    return this._requestCount;
  }

  get category(): string {
    return this._category;
  }

  get description(): string {
    return this._description;
  }

  // --- Business Methods (Encapsulation) ---

  /**
   * Returns current physical copies available in store.
   */
  getAvailableStock(): number {
    return this._stockQuantity;
  }

  /**
   * Checks whether the book has at least one unit in stock.
   */
  isInStock(): boolean {
    return this._stockQuantity > 0;
  }

  /**
   * Decrements stock upon a valid sale.
   * Throws if quantity is non-positive or exceeds available stock.
   */
  sellCopies(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`Invalid sale quantity: ${quantity}. Must be a positive whole number.`);
    }
    if (quantity > this._stockQuantity) {
      throw new Error(
        `Insufficient stock for "${this._title}" (ISBN: ${this._isbn}). Requested: ${quantity}, Available: ${this._stockQuantity}.`
      );
    }
    this._stockQuantity -= quantity;
  }

  /**
   * Adds newly received physical stock copies.
   */
  receiveCopies(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`Invalid receive quantity: ${quantity}. Must be a positive whole number.`);
    }
    this._stockQuantity += quantity;
  }

  /**
   * Updates the catalogue selling price.
   */
  updatePrice(newPrice: number): void {
    this.validatePrice(newPrice);
    this._price = Number(newPrice);
  }

  /**
   * Increments the customer demand request counter when an in-stock book is queried.
   */
  recordEnquiry(): number {
    this._requestCount += 1;
    return this._requestCount;
  }

  /**
   * Updates general book details (Manager function).
   */
  updateDetails(
    title: string,
    author: string,
    publisherId: string,
    price: number,
    category?: string,
    description?: string
  ): void {
    this.validateTitle(title);
    this.validateAuthor(author);
    this.validatePrice(price);

    this._title = title.trim();
    this._author = author.trim();
    this._publisherId = publisherId.trim();
    this._price = Number(price);
    if (category !== undefined) this._category = category.trim();
    if (description !== undefined) this._description = description.trim();
  }

  // --- Validation Helpers ---

  private validateIsbn(isbn: string): void {
    if (!isbn || !isbn.trim()) {
      throw new Error('ISBN cannot be blank.');
    }
  }

  private validateTitle(title: string): void {
    if (!title || !title.trim()) {
      throw new Error('Book title cannot be blank.');
    }
  }

  private validateAuthor(author: string): void {
    if (!author || !author.trim()) {
      throw new Error('Author name cannot be blank.');
    }
  }

  private validatePrice(price: number): void {
    if (isNaN(price) || price < 0) {
      throw new Error('Selling price must be a valid non-negative number.');
    }
  }

  private validateStock(stock: number): void {
    if (isNaN(stock) || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      throw new Error('Stock quantity must be a non-negative integer.');
    }
  }

  // --- Serialization / Deserialization ---

  toJSON(): IBookData {
    return {
      isbn: this._isbn,
      title: this._title,
      author: this._author,
      publisherId: this._publisherId,
      price: this._price,
      stockQuantity: this._stockQuantity,
      requestCount: this._requestCount,
      category: this._category,
      description: this._description
    };
  }

  static fromJSON(data: IBookData): Book {
    return new Book(
      data.isbn,
      data.title,
      data.author,
      data.publisherId,
      data.price,
      data.stockQuantity,
      data.requestCount,
      data.category ?? 'General',
      data.description ?? ''
    );
  }
}

