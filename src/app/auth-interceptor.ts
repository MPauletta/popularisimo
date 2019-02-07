import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDataService } from './user-data.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(private UserData: UserDataService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    var strToken = this.UserData.userToken;

    if (!req.headers.has('Content-Type')) {
        req = req.clone({ headers: req.headers.set('Content-Type', 'application/x-www-form-urlencoded') });
        req = req.clone({ headers: req.headers.set('Access-Control-Allow-Origin', '*') });
		if (strToken != "") {
            req = req.clone({ headers: req.headers.set('Authorization', 'JWT ' + strToken) });
		}
    }

    req = req.clone({ headers: req.headers.set('Accept', 'application/json') });
    return next.handle(req);
  }
}
