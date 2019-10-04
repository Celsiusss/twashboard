import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router, CanLoad
} from '@angular/router';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.auth.updateSignedInStatus()) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }

  canLoad(): boolean {
    if (this.auth.updateSignedInStatus()) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }

  constructor(private auth: AuthService, private router: Router) {}
}
