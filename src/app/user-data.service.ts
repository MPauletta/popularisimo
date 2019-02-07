import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Base64 } from 'js-base64';
import { Storage } from '@ionic/storage';

export class User {
  user_id: number;
  user_name: string;
  iat: string;
  token: string;

  constructor(id: number, name: string, iat: string, token: string) {
    this.user_id = id;
    this.user_name = name;
    this.iat = iat;
    this.token = token;
  }
}

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
 public currentUser: User;
 public userToken:string = "";
 public currentChatUser:number = 0;
 public unreadChats:string = "";
 public unreadMessages:string = "";
 public userPhoto:string = "";
 public userFullname:string = "";
 public userPrivacy: any;
 
  constructor(private storage: Storage) { }
  
 public getUserInfo(){
   return Observable.create(observer => {
     if (!this.currentUser) {
       this.storage.ready().then(
       () => {
   	     this.storage.get('token_data').then((val) => {
 	       if (val) {
console.log("Found In Storage: " + val);
             var thisToken = this.decodeToken(val);

   	         this.currentUser = new User(thisToken.user_id, thisToken.user_name, thisToken.iat, val);
   	         this.userToken = val;
       	     observer.next(this.currentUser);
       	     observer.complete();
	       } else {
             console.log("No User Stored!");
             observer.next(null);
             observer.complete();
 	       }
 	     });
       });
     } else {
       observer.next(this.currentUser);
       observer.complete();
     }
   });
 }
 
 public setUserInfo(strToken) {
   var thisToken = this.decodeToken(strToken);
console.log("setUserInfo: " + JSON.stringify(thisToken));

   this.currentUser = new User(thisToken.user_id, thisToken.user_name, thisToken.iat, strToken);
   this.userToken = strToken;
   this.storage.set('token_id', thisToken.iat);
console.log("Storing: " + strToken);
   this.storage.set('token_data', strToken);
}
 
 public clearUser() {
   this.userToken = "";
   this.currentChatUser = 0;
   this.unreadChats = "";
   this.unreadMessages = "";
   this.userPhoto = "";
   this.userFullname = "";
   this.currentUser.user_id = 0;
   this.currentUser = null;
   this.storage.remove('token_id');
   this.storage.remove('token_data');
   
   this.storage.remove('token_data').then(() => {
     console.log('removed ' + 'token_data');
   }).catch((error) => {
     console.log('removed error for ' + 'token_data' + '', error);
   });   
   
   console.log("User Cleared");
 }
 
// JWT Token decoding helper functions.

 public urlBase64Decode(str: string) {
   var output = str.replace(/-/g, '+').replace(/_/g, '/');

   switch (output.length % 4) {
      case 0: { break; }
      case 2: { output += '=='; break; }
      case 3: { output += '='; break; }
      default: {return Observable.throw('Illegal base64url string!');}
   }
   // This does not use btoa because it does not support unicode and the various fixes were... wonky.
   return Base64.decode(output);
  }


 public decodeToken(token: string): any {
   var parts = token.split('.');

   if (parts.length !== 3) {
      return Observable.throw('JWT must have 3 parts');
   }
   var decoded = this.urlBase64Decode(parts[1]);
   if (!decoded) {
      return Observable.throw('Cannot decode the token');
   }
console.log("decodeToken=" + decoded);
   return JSON.parse(decoded);
 }


 public getTokenExpirationDate(token: string): Date {
console.log("getTokenExpirationDate=" + token);
   var decoded: any;

   decoded = this.decodeToken(token);
   if (!decoded.hasOwnProperty('exp')) {
      return null;
   }
   var date = new Date(0); // The 0 here is the key, which sets the date to the epoch
   date.setUTCSeconds(decoded.exp);
   return date;
 }



 public isTokenExpired(token: string, offsetSeconds?: number): boolean {
   var date = this.getTokenExpirationDate(token);
   
   offsetSeconds = offsetSeconds || 0;
   if (date == null) {
      return false;
   }
   // Token expired?
   return !(date.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
 }

// End JWT Token decoding helper functions.
  
}
