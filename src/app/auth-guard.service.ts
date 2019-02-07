import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(public auth: AuthServiceService) {  }
  
  canActivate(): boolean {
    return this.auth.isAuthenticated();
  }
  
}
