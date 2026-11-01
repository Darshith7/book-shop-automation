export interface IBookRequestData {
  requestId: string;
  title: string;
  author: string;
  publisherDetails?: string;
  additionalDetails?: string;
  requestDate: string; // ISO format
  status: 'PENDING' | 'PROCURED' | 'REJECTED';
}

/**
 * Customer procurement request for books not currently sold by the bookshop.
 */
export class BookRequest {
  private _requestId: string;
  private _title: string;
  private _author: string;
  private _publisherDetails: string;
  private _additionalDetails: string;
  private _requestDate: Date;
  private _status: 'PENDING' | 'PROCURED' | 'REJECTED';

  constructor(
    requestId: string,
    title: string,
    author: string = '',
    publisherDetails: string = '',
    additionalDetails: string = '',
    requestDate: Date | string = new Date(),
    status: 'PENDING' | 'PROCURED' | 'REJECTED' = 'PENDING'
  ) {
    if (!requestId?.trim()) throw new Error('Request ID is required.');
    if (!title?.trim()) throw new Error('Book title is required.');

    this._requestId = requestId.trim();
    this._title = title.trim();
    this._author = author.trim();
    this._publisherDetails = publisherDetails.trim();
    this._additionalDetails = additionalDetails.trim();
    this._requestDate = typeof requestDate === 'string' ? new Date(requestDate) : requestDate;
    this._status = status;
  }

  get requestId(): string {
    return this._requestId;
  }

  get title(): string {
    return this._title;
  }

  get author(): string {
    return this._author;
  }

  get publisherDetails(): string {
    return this._publisherDetails;
  }

  get additionalDetails(): string {
    return this._additionalDetails;
  }

  get requestDate(): Date {
    return this._requestDate;
  }

  get status(): 'PENDING' | 'PROCURED' | 'REJECTED' {
    return this._status;
  }

  updateStatus(newStatus: 'PENDING' | 'PROCURED' | 'REJECTED'): void {
    this._status = newStatus;
  }

  toJSON(): IBookRequestData {
    return {
      requestId: this._requestId,
      title: this._title,
      author: this._author,
      publisherDetails: this._publisherDetails,
      additionalDetails: this._additionalDetails,
      requestDate: this._requestDate.toISOString(),
      status: this._status
    };
  }

  static fromJSON(data: IBookRequestData): BookRequest {
    return new BookRequest(
      data.requestId,
      data.title,
      data.author,
      data.publisherDetails,
      data.additionalDetails,
      new Date(data.requestDate),
      data.status
    );
  }
}

