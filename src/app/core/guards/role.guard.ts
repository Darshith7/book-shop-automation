import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StaffAuthService } from '../services/staff-auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const authService = inject(StaffAuthService);
    const router = inject(Router);

    const currentRole = authService.getCurrentRole();

    if (allowedRoles.includes(currentRole)) {
      return true;
    }

    // If clerk route, manager is also allowed
    if (allowedRoles.includes('CLERK') && currentRole === 'MANAGER') {
      return true;
    }

    console.warn(`BAS: Route access blocked. Required: [${allowedRoles.join(', ')}], Current: ${currentRole}`);
    router.navigate(['/']);
    return false;
  };
};

