import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UserDataService } from './user-data.service';
import { environment } from './../environments/environment';
 
const TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  authUrl: string = environment.authUrl;
  error: string;

  authenticationState = new BehaviorSubject(false);
 
  constructor(private httpClient: HttpClient, private UserData: UserDataService, private storage: Storage, private plt: Platform) { 
    this.plt.ready().then(() => {
      this.checkToken();
    });
  }
 
  getUserLogin(strEmail): Observable<{}> {
    var strUserURL = this.authUrl + "login/" + strEmail;
    return this.httpClient.get(strUserURL).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  LoginUser(strEMail, strData): Observable<{}> {
    var url = this.authUrl + "login/";
    var strSend = `EMail=${strEMail}&Data=${strData}`;

    return this.httpClient.post<{}>(url, strSend).pipe(
      map(this.authenticated),
      catchError(this.handleError)
    );
  }

  resetUserPassword(infoData): Observable<{}> {
    var url = this.authUrl + "reset/"; 
 
    return this.httpClient.post<{}>(url, infoData).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  unlockUserPassword(infoData): Observable<{}> {
    var url = this.authUrl + "unlock/";

    return this.httpClient.post<{}>(url, infoData).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  resetCompletePassword(infoData): Observable<{}> {
    var url = this.authUrl + "resetcomplete/";

    return this.httpClient.post<{}>(url, infoData).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  unlockCompletePassword(infoData): Observable<{}> {
    var url = this.authUrl + "unlockcomplete/"; 

    return this.httpClient.post<{}>(url, infoData).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  public register(credentials: any): Observable<{}> {
    var url = this.authUrl + "register/";

    return this.httpClient.post<{}>(url, credentials).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  public registerComplete(infoData): Observable<{}> {
    var url = this.authUrl + "registercomplete/";

    return this.httpClient.post<{}>(url, infoData).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  getCountries(): Observable<{}> {
    var url = this.authUrl + "countries/";
  
    return this.httpClient.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  checkToken() {
    this.UserData.getUserInfo().subscribe(user => {
      if (user) {
        this.authenticationState.next(true);
      }
    });
  }
 
  logout() {	  
    this.UserData.clearUser();
    this.authenticationState.next(false);
  }
 
  finilizeLogin() {
	this.authenticationState.next(true);
  }
  
  isAuthenticated() {
    return this.authenticationState.value;
  }

  private authenticated(res: any) {
    let token = res.Token
    console.log(token)
    return token || { };
  }

  private extractData(res: Response) {
    let body = res;
    return body || { };
  }

  private handleError (error: any) {
    let errMsg: string;
    errMsg = error.error ? JSON.stringify(error.error) : JSON.stringify(error);
    console.error(JSON.stringify(error));

    return throwError(errMsg);
  }
  
}
