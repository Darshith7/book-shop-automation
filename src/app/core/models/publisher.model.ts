export interface IPublisherData {
  publisherId: string;
  name: string;
  fullAddress: string;
  procurementLeadDays: number;
}

/**
 * Publisher domain class.
 * Represents book publishers and their procurement parameters.
 */
export class Publisher {
  private _publisherId: string;
  private _name: string;
  private _fullAddress: string;
  private _procurementLeadDays: number;

  constructor(
    publisherId: string,
    name: string,
    fullAddress: string,
    procurementLeadDays: number
  ) {
    if (!publisherId?.trim()) throw new Error('Publisher ID is required.');
    if (!name?.trim()) throw new Error('Publisher name is required.');
    if (!fullAddress?.trim()) throw new Error('Publisher address is required.');
    if (procurementLeadDays < 1) throw new Error('Procurement lead days must be at least 1.');

    this._publisherId = publisherId.trim();
    this._name = name.trim();
    this._fullAddress = fullAddress.trim();
    this._procurementLeadDays = Math.floor(procurementLeadDays);
  }

  get publisherId(): string {
    return this._publisherId;
  }

  get name(): string {
    return this._name;
  }

  get fullAddress(): string {
    return this._fullAddress;
  }

  get procurementLeadDays(): number {
    return this._procurementLeadDays;
  }

  updateDetails(name: string, fullAddress: string, procurementLeadDays: number): void {
    if (!name?.trim()) throw new Error('Publisher name cannot be blank.');
    if (!fullAddress?.trim()) throw new Error('Publisher address cannot be blank.');
    if (procurementLeadDays < 1) throw new Error('Procurement lead days must be >= 1.');

    this._name = name.trim();
    this._fullAddress = fullAddress.trim();
    this._procurementLeadDays = Math.floor(procurementLeadDays);
  }

  toJSON(): IPublisherData {
    return {
      publisherId: this._publisherId,
      name: this._name,
      fullAddress: this._fullAddress,
      procurementLeadDays: this._procurementLeadDays
    };
  }

  static fromJSON(data: IPublisherData): Publisher {
    return new Publisher(
      data.publisherId,
      data.name,
      data.fullAddress,
      data.procurementLeadDays
    );
  }
}

