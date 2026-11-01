import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { StorageService } from './storage.service';
import {
  User,
  CustomerUser,
  SalesClerk,
  Manager,
  UserRole,
  StaffPermission
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class StaffAuthService {
  private storageService = inject(StorageService);

  private _currentUser$ = new BehaviorSubject<User>(this.instantiateUser(this.storageService.getCurrentRole()));
  readonly currentUser$ = this._currentUser$.asObservable();
  readonly currentRole$ = this.currentUser$.pipe(map(u => u.role));

  constructor() {
    this.storageService.currentRole$.subscribe(role => {
      const current = this._currentUser$.value;
      if (current.role !== role) {
        this._currentUser$.next(this.instantiateUser(role));
      }
    });
  }

  getCurrentUser(): User {
    return this._currentUser$.value;
  }

  getCurrentRole(): UserRole {
    return this._currentUser$.value.role;
  }

  switchRole(role: UserRole): void {
    const newUser = this.instantiateUser(role);
    this._currentUser$.next(newUser);
    this.storageService.saveCurrentRole(role);
  }

  hasPermission(permission: StaffPermission): boolean {
    return this._currentUser$.value.hasPermission(permission);
  }

  isCustomer(): boolean {
    return this._currentUser$.value.role === 'CUSTOMER';
  }

  isClerk(): boolean {
    return this._currentUser$.value.role === 'CLERK';
  }

  isManager(): boolean {
    return this._currentUser$.value.role === 'MANAGER';
  }

  isStaff(): boolean {
    return this.isClerk() || this.isManager();
  }

  private instantiateUser(role: UserRole): User {
    switch (role) {
      case 'CLERK':
        return new SalesClerk('clerk-demo-01', 'Priya Sharma (Clerk)', 'SC-101');
      case 'MANAGER':
        return new Manager('mgr-demo-01', 'Rajesh Kumar (Manager)', 'MGR-001');
      case 'CUSTOMER':
      default:
        return new CustomerUser('customer-guest', 'Customer (Public)');
    }
  }
}

