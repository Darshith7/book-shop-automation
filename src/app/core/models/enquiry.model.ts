export interface IBookEnquiryData {
  enquiryId: string;
  isbn: string;
  bookTitle: string;
  enquiryDate: string; // ISO date
}

/**
 * Record of an explicit customer availability enquiry for an in-stock book.
 */
export class BookEnquiry {
  private _enquiryId: string;
  private _isbn: string;
  private _bookTitle: string;
  private _enquiryDate: Date;

  constructor(
    enquiryId: string,
    isbn: string,
    bookTitle: string,
    enquiryDate: Date | string = new Date()
  ) {
    if (!enquiryId?.trim()) throw new Error('Enquiry ID is required.');
    if (!isbn?.trim()) throw new Error('ISBN is required.');

    this._enquiryId = enquiryId.trim();
    this._isbn = isbn.trim().toUpperCase();
    this._bookTitle = bookTitle.trim();
    this._enquiryDate = typeof enquiryDate === 'string' ? new Date(enquiryDate) : enquiryDate;
  }

  get enquiryId(): string {
    return this._enquiryId;
  }

  get isbn(): string {
    return this._isbn;
  }

  get bookTitle(): string {
    return this._bookTitle;
  }

  get enquiryDate(): Date {
    return this._enquiryDate;
  }

  toJSON(): IBookEnquiryData {
    return {
      enquiryId: this._enquiryId,
      isbn: this._isbn,
      bookTitle: this._bookTitle,
      enquiryDate: this._enquiryDate.toISOString()
    };
  }

  static fromJSON(data: IBookEnquiryData): BookEnquiry {
    return new BookEnquiry(
      data.enquiryId,
      data.isbn,
      data.bookTitle,
      new Date(data.enquiryDate)
    );
  }
}

