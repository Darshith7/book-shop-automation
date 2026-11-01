export type UserRole = 'CUSTOMER' | 'CLERK' | 'MANAGER';

export type StaffPermission =
  | 'BROWSE_CATALOGUE'
  | 'PROCESS_SALES'
  | 'VIEW_SALES_HISTORY'
  | 'RECEIVE_STOCK'
  | 'LOOKUP_ISBN'
  | 'UPDATE_PRICE'
  | 'MANAGE_BOOKS'
  | 'MANAGE_PUBLISHERS'
  | 'VIEW_MANAGEMENT_REPORTS'
  | 'VIEW_REORDER_REPORT'
  | 'VIEW_DEMAND_REPORT'
  | 'VIEW_SALES_STATS'
  | 'VIEW_CUSTOMER_REQUESTS';

/**
 * Base User class demonstrating Object-Oriented Inheritance.
 */
export abstract class User {
  protected _id: string;
  protected _name: string;
  protected _role: UserRole;

  constructor(id: string, name: string, role: UserRole) {
    this._id = id;
    this._name = name;
    this._role = role;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get role(): UserRole {
    return this._role;
  }

  abstract getRoleTitle(): string;
  abstract hasPermission(permission: StaffPermission): boolean;
}

/**
 * Public Customer user implementation.
 */
export class CustomerUser extends User {
  constructor(id: string = 'cust-guest', name: string = 'Customer') {
    super(id, name, 'CUSTOMER');
  }

  getRoleTitle(): string {
    return 'Customer (Public)';
  }

  hasPermission(permission: StaffPermission): boolean {
    return permission === 'BROWSE_CATALOGUE';
  }
}

/**
 * Abstract Staff class extending User.
 */
export abstract class Staff extends User {
  protected _staffId: string;
  protected _department: string;

  constructor(
    id: string,
    name: string,
    role: UserRole,
    staffId: string,
    department: string = 'Store Operations'
  ) {
    super(id, name, role);
    this._staffId = staffId;
    this._department = department;
  }

  get staffId(): string {
    return this._staffId;
  }

  get department(): string {
    return this._department;
  }
}

/**
 * SalesClerk domain class subclassing Staff.
 */
export class SalesClerk extends Staff {
  constructor(id: string = 'clerk-1', name: string = 'Priya Sharma', staffId: string = 'SC-101') {
    super(id, name, 'CLERK', staffId, 'Front Counter & Sales');
  }

  getRoleTitle(): string {
    return 'Sales Clerk';
  }

  hasPermission(permission: StaffPermission): boolean {
    switch (permission) {
      case 'BROWSE_CATALOGUE':
      case 'PROCESS_SALES':
      case 'VIEW_SALES_HISTORY':
      case 'RECEIVE_STOCK':
      case 'LOOKUP_ISBN':
        return true;
      default:
        // Clerks are NOT permitted to change prices or view management reports
        return false;
    }
  }
}

/**
 * Manager domain class subclassing Staff.
 * Represents the bookshop owner/manager with full supervisory privileges.
 */
export class Manager extends Staff {
  constructor(id: string = 'mgr-1', name: string = 'Rajesh Kumar', staffId: string = 'MGR-001') {
    super(id, name, 'MANAGER', staffId, 'Store Management & Inventory');
  }

  getRoleTitle(): string {
    return 'Store Manager / Owner';
  }

  hasPermission(_permission: StaffPermission): boolean {
    // Manager has unrestricted authority over all features
    return true;
  }
}

