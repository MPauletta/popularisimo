import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from './../environments/environment';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class DataServiceService {
  public blnDirty: boolean = false;
  private usersUrl = environment.usersUrl;
  private groupsUrl = environment.groupsUrl;
  private productsUrl = environment.productsUrl;
  private membersUrl = environment.membersUrl;
  private friendsUrl = environment.friendsUrl;
  private photosUrl = environment.photosUrl;
  private videosUrl = environment.videosUrl;
  private docsUrl = environment.docsUrl;
  private eventsUrl = environment.eventsUrl;
  private mailsUrl = environment.mailsUrl;
  private mailactionsUrl = environment.mailactionsUrl;
  private chatsUrl = environment.chatsUrl;
  private auctionsUrl = environment.auctionsUrl;
  private productPhotosUrl = environment.productphotosUrl;
  private notificationsUrl = environment.notificationsUrl;
  private forumsUrl = environment.forumsUrl;
  private groupNotificationsUrl = environment.groupnotificationsUrl;
  private forumPostsUrl = environment.forumpostsUrl;
  private forumPostActionsUrl = environment.forumpostactionsUrl;
  private groupMembersUrl = environment.groupmembersUrl;
  private notesUrl = environment.notesUrl;
  private groupNotesUrl = environment.groupnotesUrl;
  private foldersUrl = environment.foldersUrl;
  private groupFoldersUrl = environment.groupfoldersUrl;
  private postsUrl = environment.postsUrl;
  private groupPostsUrl = environment.grouppostsUrl;
  private likesUrl = environment.likesUrl;
  private commentsUrl = environment.commentsUrl;
  private addressesUrl = environment.addressesUrl;
  private userPrivacyUrl = environment.userPrivacyUrl;
  private watchsUrl = environment.watchsUrl;

  constructor(private http: HttpClient, private plt: Platform, private transfer: FileTransfer, private socket: Socket) { 

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
  
  getUser(): Observable<{}> {
    var strUserURL = this.usersUrl;
    return this.http.get(strUserURL).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  getGroup(groupID): Observable<{}> {
    var url = this.groupsUrl;
  
    url = url + groupID + "/";
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  getGroups(memberID,lastDate): Observable<{}> {
    var url = this.groupsUrl;
  
    if (memberID > 0) {url = url + "user/" + memberID + "/"}
    if (lastDate) {url = url + "more/" + lastDate;}
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  newGroup(groupData): Observable<{}> {
    var url = this.groupsUrl;

    return this.http.post<{}>(url, groupData).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  patchGroup(groupID, groupData): Observable<{}> {
    var url = this.groupsUrl + "/" + groupID;

    return this.http.patch<{}>(url, groupData).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  getProduct(productID,groupID): Observable<{}> {
    var url = this.productsUrl;
  
    if (groupID) {if (groupID > 0) {url = url + "group/" + groupID + "/";}}
    url = url + productID + "/";
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  getProducts(memberID,groupID,lastDate): Observable<{}> {
    var url = this.productsUrl;
  
    if (memberID > 0) {url = url + "user/" + memberID + "/"}
    if (groupID > 0) {url = url + "group/" + groupID + "/"}
    if (lastDate) {url = url + "more/" + lastDate;}
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  newProduct(groupID, productData): Observable<{}> {
    var url = this.productsUrl;

    if (groupID > 0) {url = url + "group/" + groupID + "/"}
    return this.http.post<{}>(url, productData).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  patchProduct(productID, groupID, productData): Observable<{}> {
    var url = this.productsUrl;

    if (groupID > 0) {url = url + "group/" + groupID + "/"}
    url = url + productID;
    return this.http.patch<{}>(url, productData).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  getMembers(lastDate): Observable<{}> {
    var url = this.membersUrl;
    
    if (lastDate) {url = url + "more/" + lastDate;}
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  getMember(memberID): Observable<{}> {
    var url = this.membersUrl + memberID;
    
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  getFriends(memberID,lastDate): Observable<{}> {
    var url = this.friendsUrl;
  
    if (memberID > 0) {url = url + "user/" + memberID + "/"}
    if (lastDate) {url = url + "more/" + lastDate;}
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  getPhotos(folderID,lastDate): Observable<{}> {
    var url = this.photosUrl;
  
    if (folderID) {
      if (folderID > 0) {
        url = url + "folder/" + folderID;
        if (lastDate) {url = url + "/";}
      }
    }
    if (lastDate) {url = url + "more/" + lastDate;}
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  patchPhoto(photoID, groupID, folderID, photoDesc): Observable<{}> {
    var url = this.photosUrl;
    var strSend = `FolderID=${folderID}&Description=${photoDesc}`

    if (groupID) {if (groupID > 0) {url = url + "group/" + groupID + "/";}}
    url = url + photoID
    return this.http.patch<{}>(url, strSend).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  deletePhoto(photoID, groupID): Observable<{}> {
    var url = this.photosUrl;
  
    if (groupID) {if (groupID > 0) {url = url + "group/" + groupID + "/";}}
    url = url + photoID
    return this.http.delete(url).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  uploadPhoto(strToken, img, groupID, folderID, photoDesc) {
    var url = this.photosUrl;
    var targetPath = img;
 
    if (groupID) {if (groupID > 0) {url = url + "group/" + groupID;}}
    var options: FileUploadOptions = {
      fileKey: 'image',
      chunkedMode: false,
      mimeType: 'multipart/form-data',
      headers: { 'Authorization': 'JWT ' + strToken },
      params: { 'FolderID' : folderID, 'Description': photoDesc }
    };
 
    const fileTransfer: FileTransferObject = this.transfer.create();
 
    // Use the FileTransfer to upload the image
    return fileTransfer.upload(targetPath, url, options);
  }

  getVideos(folderID,lastDate): Observable<{}> {
    var url = this.videosUrl;

    if (folderID) {
      if (folderID > 0) {
        url = url + "folder/" + folderID;
        if (lastDate) {url = url + "/";}
      }
    }
    if (lastDate) {url = url + "more/" + lastDate;}
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  patchVideo(videoID, groupID, folderID, videoDesc): Observable<{}> {
    var url = this.videosUrl;
    var strSend = `FolderID=${folderID}&Description=${videoDesc}`

    if (groupID) {if (groupID > 0) {url = url + "group/" + groupID + "/";}}
      url = url + videoID
      return this.http.patch<{}>(url, strSend).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  deleteVideo(videoID, groupID): Observable<{}> {
    var url = this.videosUrl;
  
    if (groupID) {if (groupID > 0) {url = url + "group/" + groupID + "/";}}
    url = url + videoID
    return this.http.delete(url).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  uploadVideo(strToken, video, groupID, folderID, videoDesc) {
    var url = this.videosUrl;
    var targetPath = video;
 
    if (groupID) {if (groupID > 0) {url = url + "group/" + groupID;}}
    var options: FileUploadOptions = {
      fileKey: 'video',
      chunkedMode: false,
      mimeType: 'multipart/form-data',
      headers: { 'Authorization': 'JWT ' + strToken },
      params: { 'FolderID' : folderID, 'Description': videoDesc }
    };
 
    const fileTransfer: FileTransferObject = this.transfer.create();
 
    // Use the FileTransfer to upload the video
    return fileTransfer.upload(targetPath, url, options);
  }

  getDocs(folderID,lastDate): Observable<{}> {
    var url = this.docsUrl;

    if (folderID) {
      if (folderID > 0) {
        url = url + "folder/" + folderID;
        if (lastDate) {url = url + "/";}
      }
    }
    if (lastDate) {url = url + "more/" + lastDate;}
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  patchDoc(docID, groupID, folderID, docDesc): Observable<{}> {
    var url = this.docsUrl;
    var strSend = `FolderID=${folderID}&Description=${docDesc}`

    if (groupID) {if (groupID > 0) {url = url + "group/" + groupID + "/";}}
    url = url + docID
    return this.http.patch<{}>(url, strSend).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  deleteDoc(docID, groupID): Observable<{}> {
    var url = this.docsUrl;
  
    if (groupID) {if (groupID > 0) {url = url + "group/" + groupID + "/";}}
    url = url + docID
    return this.http.delete(url).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  uploadDoc(strToken, img, groupID, folderID, docDesc) {
    var url = this.docsUrl;
    var targetPath = img;
 
    if (groupID) {if (groupID > 0) {url = url + "group/" + groupID;}}
    var options: FileUploadOptions = {
      fileKey: 'image',
      chunkedMode: false,
      mimeType: 'multipart/form-data',
      headers: { 'Authorization': 'JWT ' + strToken },
      params: { 'FolderID' : folderID, 'Description': docDesc }
    };
 
    const fileTransfer: FileTransferObject = this.transfer.create();
 
    // Use the FileTransfer to upload the image
    return fileTransfer.upload(targetPath, url, options);
  }

  getMemberPhotos(folderID,lngMemberID,lastDate): Observable<{}> {
    var url = this.photosUrl + "user/" + lngMemberID;
  
    if (folderID) {if (folderID > 0) {url = url + "/folder/" + folderID;}}
    if (lastDate) {url = url + "/more/" + lastDate;}
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

  getMemberVideos(folderID,lngMemberID,lastDate): Observable<{}> {
    var url = this.videosUrl + "user/" + lngMemberID;

    if (folderID) {if (folderID > 0) {url = url + "/folder/" + folderID;}}
    if (lastDate) {url = url + "/more/" + lastDate;}
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }

 getMemberDocs(folderID,lngMemberID,lastDate): Observable<{}> {
  var url = this.docsUrl + "user/" + lngMemberID;

  if (folderID) {if (folderID > 0) {url = url + "/folder/" + folderID;}}
  if (lastDate) {url = url + "/more/" + lastDate;}
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getGroupPhotos(folderID,lngGroupID,lastDate): Observable<{}> {
  var url = this.photosUrl + "group/" + lngGroupID;
  
  if (folderID) {if (folderID > 0) {url = url + "/folder/" + folderID;}}
  if (lastDate) {url = url + "/more/" + lastDate;}
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getGroupVideos(folderID,lngGroupID,lastDate): Observable<{}> {
  var url = this.videosUrl + "group/" + lngGroupID;

  if (folderID) {if (folderID > 0) {url = url + "/folder/" + folderID;}}
  if (lastDate) {url = url + "/more/" + lastDate;}
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getGroupDocs(folderID,lngGroupID,lastDate): Observable<{}> {
  var url = this.docsUrl + "group/" + lngGroupID;

  if (folderID) {if (folderID > 0) {url = url + "/folder/" + folderID;}}
  if (lastDate) {url = url + "/more/" + lastDate;}
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getEvents(): Observable<{}> {
  return this.http.get(this.eventsUrl).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getGroupEvents(lngGroupID): Observable<{}> {
  var url = this.eventsUrl + "group/" + lngGroupID;

  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 newEvent(groupID, eventData): Observable<{}> {
   var url = this.eventsUrl;

   if (groupID > 0) {url = url + "group/" + groupID + "/"}
   return this.http.post<{}>(url, eventData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 patchEvent(eventID, groupID, eventData): Observable<{}> {
   var url = this.eventsUrl;

   if (groupID > 0) {url = url + "group/" + groupID + "/"}
   url = url + eventID;
   return this.http.patch<{}>(url, eventData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 getMessagesStats(): Observable<{}> {
  var url = this.mailactionsUrl + "stats/";
  
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getMessage(strMessageID): Observable<{}> {
  var url = this.mailsUrl + strMessageID;

  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getMessages(lngFolder,friendID,lastDate): Observable<{}> {
  var url = this.mailactionsUrl;
  
  if (lngFolder) {url = url + lngFolder + "/"}
  if (friendID) {url = url + "user/" + friendID + "/";}
  if (lastDate) {url = url + "more/" + lastDate;}
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 sendNewMessage(messageData): Observable<{}> {
   var url = this.mailsUrl;

   return this.http.post<{}>(url, messageData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 saveNewMessage(messageData): Observable<{}> {
   var url = this.mailsUrl + "save/";

   return this.http.post<{}>(url, messageData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 saveOldMessage(strID, messageData): Observable<{}> {
   var url = this.mailsUrl + "save/" + strID;

   return this.http.patch<{}>(url, messageData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 sendOldMessage(strID, messageData): Observable<{}> {
   var url = this.mailsUrl + "send/" + strID;

   return this.http.patch<{}>(url, messageData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 deleteMessage(strID): Observable<{}> {
  var url = this.mailsUrl + strID;
  
  return this.http.delete(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 restoreDeletedMessage(strID): Observable<{}> {
   var url = this.mailsUrl + "restore/" + strID;
   var messageData = `ID=${strID}`

   return this.http.patch<{}>(url, messageData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 getMemberNames(memberIDs): Observable<{}> {
  var strTemp = memberIDs;
  var url = this.membersUrl + "names/";
  
  if (!isNaN(strTemp)) {strTemp = strTemp.toString();} 
  if (strTemp.length > 0) {
    if (strTemp.substring(strTemp.length - 1, strTemp.length) == ";") {strTemp = strTemp.substring(0,strTemp.length - 1)}
    strTemp = strTemp.replace(/;/g,",");
    url = url + strTemp;
    return this.http.get(url).pipe(
      map(this.extractData),
      catchError(this.handleError)
    );
  }
 }

 getChats(): Observable<{}> {
  return this.http.get(this.chatsUrl).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getChatMessages(fromID): Observable<{}> {
  var strTemp = fromID;
  var url = this.chatsUrl + "messages/" + strTemp;
  
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getChatStats(): Observable<{}> {
  var url = this.chatsUrl + "stats/";
  
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getNotifications(lastNotification): Observable<{}> {
  var url = this.notificationsUrl;
  
  if (lastNotification) {url = url + lastNotification;}
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getNewNotifications(lastNotification): Observable<{}> {
  var url = this.notificationsUrl + "new/" + lastNotification;
  
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getMemberNotifications(userID,lastNotification): Observable<{}> {
  var url = this.notificationsUrl + "user/" + userID;
  
  if (lastNotification) {url = url + "/" + lastNotification;}
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getNewMemberNotifications(userID,lastNotification): Observable<{}> {
  var url = this.notificationsUrl + "user/" + userID + "/new/" + lastNotification;
  
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 postFriendRequestNotification(userID, message): Observable<{}> {
  var url = this.notificationsUrl + "addrequest/" + userID;
  var strSend = `Contents=${message}`
  
   return this.http.post<{}>(url, strSend).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 postFriendAcceptNotification(userID): Observable<{}> {
  var url = this.notificationsUrl + "addcomplete/" + userID;
  
   return this.http.post<{}>(url, "").pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 postGroupRequestNotification(groupID, message): Observable<{}> {
  var url = this.notificationsUrl + "group/" + groupID + "/addrequest/";
  var strSend = `Contents=${message}`
  
   return this.http.post<{}>(url, strSend).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 postGroupSuggestNotification(groupID, userID, message): Observable<{}> {
  var url = this.notificationsUrl + "group/" + groupID + "/addsuggest/" + userID;
  var strSend = `Contents=${message}`
  
   return this.http.post<{}>(url, strSend).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 postGroupAcceptRequestNotification(groupID, userID): Observable<{}> {
  var url = this.notificationsUrl + "group/" + groupID + "/requestcomplete/" + userID;
  
   return this.http.post<{}>(url, "").pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 postGroupAcceptSugestNotification(groupID): Observable<{}> {
  var url = this.notificationsUrl + "group/" + groupID + "/suggestcomplete/";
  
   return this.http.post<{}>(url, "").pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 postGroupRejectRequestNotification(groupID, userID): Observable<{}> {
  var url = this.notificationsUrl + "group/" + groupID + "/requestreject/" + userID;
  
   return this.http.post<{}>(url, "").pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 patchConsumeNotification(notiID): Observable<{}> {
  var url = this.notificationsUrl + "consume/" + notiID;

   return this.http.patch<{}>(url, "").pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 getAuctions(productID,lastDate): Observable<{}> {
  var url = this.auctionsUrl + productID + "/";
  
  if (lastDate) {url = url + "more/" + lastDate;}
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getProductPhotos(productID,lastDate): Observable<{}> {
  var url = this.productPhotosUrl + productID + "/";
  
  if (lastDate) {url = url + "more/" + lastDate;}
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 newProductPhoto(groupID, productID, photoData): Observable<{}> {
   var url = this.productPhotosUrl;

   if (groupID > 0) {url = url + "group/" + groupID + "/"}
   url = url + productID;
   return this.http.post<{}>(url, photoData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 deleteProductPhoto(groupID, productID, photoID): Observable<{}> {
   var url = this.productPhotosUrl;

   if (groupID > 0) {url = url + "group/" + groupID + "/"}
   url = url + productID + "/" + photoID;
   return this.http.delete(url).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 getForums(GroupID,lastDate): Observable<{}> {
  var url = this.forumsUrl + GroupID + "/";
  
  if (lastDate) {url = url + "more/" + lastDate;}
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 newForum(GroupID,forumData): Observable<{}> {
   var url = this.forumsUrl + GroupID + "/";

   return this.http.post<{}>(url, forumData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 patchForum(GroupID, ForumID, forumData): Observable<{}> {
   var url = this.forumsUrl + GroupID + "/" + ForumID;

   return this.http.patch<{}>(url, forumData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 getGroupNotifications(GroupID,lastDate): Observable<{}> {
  var url = this.groupNotificationsUrl + GroupID + "/";
  
  if (lastDate) {url = url + "more/" + lastDate;}
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getForumPost(PostID): Observable<{}> {
  var url = this.forumPostsUrl + PostID + "/";
  
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getForumPosts(ForumID,lastDate): Observable<{}> {
  var url = this.forumPostsUrl + "forum/" + ForumID + "/";
  
  if (lastDate) {url = url + "more/" + lastDate;}
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getForumPostActions(PostID,lastID): Observable<{}> {
  var url = this.forumPostActionsUrl + "post/" + PostID + "/";
  
  if (lastID) {url = url + "more/" + lastID;}
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 newForumPost(GroupID, ForumID, messageData): Observable<{}> {
   var url = this.forumPostsUrl + GroupID + "/" + ForumID;

   return this.http.post<{}>(url, messageData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 patchForumPost(GroupID, ForumID, PostID, messageData): Observable<{}> {
   var url = this.forumPostsUrl + GroupID + "/" + ForumID + "/" + PostID;

   return this.http.patch<{}>(url, messageData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 blockForumPost(GroupID, ForumID, PostID): Observable<{}> {
   var messageData = "";
   var url = this.forumPostsUrl + "block/" + GroupID + "/" + ForumID + "/" + PostID;

   return this.http.patch<{}>(url, messageData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 getGroupMembers(GroupID,lastDate): Observable<{}> {
  var url = this.groupMembersUrl + GroupID + "/";
  
  if (lastDate) {url = url + "more/" + lastDate;}
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getNote(noteID,groupID): Observable<{}> {
  var url = "";
  
  if (groupID) {
    url = this.groupNotesUrl + groupID + "/" + noteID;
  } else {
    url = this.notesUrl + noteID + "/";
  }
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getNotes(groupID,folderID,lastDate): Observable<{}> {
  var url = ""; var folder = 0;
  
  if (folderID) {if (folderID > 0) {folder = folderID;}}
  if (!groupID) {url = this.notesUrl + "folder/" + folder + "/"}
  if (groupID) {url = this.groupNotesUrl + groupID + "/folder/" + folder + "/"}
  if (lastDate) {url = url + "more/" + lastDate;}
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 newNote(GroupID, FolderID, messageData): Observable<{}> {
   var url = ""; var folder = 0;

   if (FolderID) {if (FolderID > 0) {folder = FolderID;}}
   if (!GroupID) {url = this.notesUrl + folder + "/"}
   if (GroupID) {url = this.groupNotesUrl + GroupID + "/" + folder + "/"}
   return this.http.post<{}>(url, messageData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 patchNote(GroupID, NoteID, messageData): Observable<{}> {
   var url = "";

   if (GroupID) {
     url = this.groupNotesUrl + GroupID + "/" + NoteID;
   } else {
     url = this.notesUrl + NoteID + "/";
   }
   return this.http.patch<{}>(url, messageData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 deleteNote(GroupID, NoteID): Observable<{}> {
   var url = "";

   if (GroupID) {
     url = this.groupNotesUrl + GroupID + "/" + NoteID;
   } else {
     url = this.notesUrl + NoteID + "/";
   }
   return this.http.delete(url).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 getFolders(userID,groupID,lastDate): Observable<{}> {
  var url = this.foldersUrl;
  
  if (groupID) {url = this.groupFoldersUrl + groupID + "/"}
  if (userID) {url = url + "user/" + userID + "/"}
  if (lastDate) {url = url + "more/" + lastDate;}
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getProductPropertyList(propertyName): Observable<{}> {
  var url = this.productsUrl;
  
  if (propertyName) {
     url = url + propertyName + "/";
     return this.http.get(url).pipe(
       map(this.extractData),
       catchError(this.handleError)
     );
  }
 }

 getProductPropertyList2(propertyName,parameter): Observable<{}> {
  var url = this.productsUrl;
  
  if (propertyName) {
     url = url + propertyName + "/" + parameter;
     return this.http.get(url).pipe(
       map(this.extractData),
       catchError(this.handleError)
     );
  }
 }

 getPosts(UserID,PostID): Observable<{}> {
  var url = this.postsUrl;
  
  if (UserID) {url = url + "user/" + UserID + "/"}
  if (PostID) {url = url + PostID + "/"}
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 newPosts(FriendID,PostData): Observable<{}> {
  var url = this.postsUrl;

  if (FriendID) {url = url + "friend/" + FriendID + "/"}
  return this.http.post<{}>(url, PostData).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getGroupPosts(GroupID,PostID): Observable<{}> {
  var url = this.groupPostsUrl + GroupID + "/";
  
  if (PostID) {url = url + PostID + "/"}
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 newGroupPosts(GroupID,PostData): Observable<{}> {
  var url = this.groupPostsUrl + GroupID + "/";

  return this.http.post<{}>(url, PostData).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getLikes(ObjectType,ObjectID,LastDate,LikeID): Observable<{}> {
  var url = this.likesUrl + ObjectType + "/" + ObjectID + "/";

  if (LastDate) {
    url = url + "more/" + LastDate + "/";
  } else if (LikeID) {
    url = this.likesUrl + LikeID + "/";
  }
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 postLike(ObjectType,ObjectID,PostData): Observable<{}> {
  var url = this.likesUrl + ObjectType + "/" + ObjectID + "/yesno/" + PostData + "/";

  return this.http.post<{}>(url, "").pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getComments(ObjectType,ObjectID,LastDate,CommentID): Observable<{}> {
  var url = this.commentsUrl + ObjectType + "/" + ObjectID + "/";

  if (LastDate) {
    url = url + "more/" + LastDate + "/";
  } else if (CommentID) {
    url = this.commentsUrl + CommentID + "/";
  }
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 postComment(ObjectType,ObjectID,Comment): Observable<{}> {
  var url = this.commentsUrl + ObjectType + "/" + ObjectID + "/";
  var strSend = `Comment=${Comment}`

  return this.http.post<{}>(url, strSend).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 getAddresses(addressID): Observable<{}> {
  var url = this.addressesUrl;
  
  if (addressID) {
    url = url + addressID + "/";
  }
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 newAddress(addressData): Observable<{}> {
  var url = this.addressesUrl;

   return this.http.post<{}>(url, addressData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 patchAddress(addressID, addressData): Observable<{}> {
  var url = this.addressesUrl + addressID + "/";

   return this.http.patch<{}>(url, addressData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 patchUserInfo(infoData): Observable<{}> {
  var url = this.usersUrl;

   return this.http.patch<{}>(url, infoData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 patchUserSpace(spaceData): Observable<{}> {
  var url = this.usersUrl + "profile/";

   return this.http.patch<{}>(url, spaceData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 patchUserPassword(infoData): Observable<{}> {
  var url = this.usersUrl + "password/";

   return this.http.patch<{}>(url, infoData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 resetUserPassword(infoData): Observable<{}> {
  var url = this.usersUrl + "reset/";

   return this.http.post<{}>(url, infoData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 unlockUserPassword(infoData): Observable<{}> {
  var url = this.usersUrl + "unlock/";

   return this.http.post<{}>(url, infoData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 resetCompletePassword(infoData): Observable<{}> {
  var url = this.usersUrl + "resetcomplete/";

   return this.http.post<{}>(url, infoData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 unlockCompletePassword(infoData): Observable<{}> {
  var url = this.usersUrl + "unlockcomplete/";

   return this.http.post<{}>(url, infoData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 getPrivacy(): Observable<{}> {
  var url = this.userPrivacyUrl;
  
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 patchPrivacy(privacyData): Observable<{}> {
  var url = this.userPrivacyUrl;

   return this.http.patch<{}>(url, privacyData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 getWatches(watchType, watchID, LastDate): Observable<{}> {
  var url = this.watchsUrl + "type/" + watchType + "/";

  if (LastDate) {
    url = url + "more/" + LastDate + "/";
  } else if (watchID) {
    url = url + watchID + "/";
  }
  return this.http.get(url).pipe(
    map(this.extractData),
    catchError(this.handleError)
  );
 }

 newWatch(watchType, watchData): Observable<{}> {
  var url = this.watchsUrl + "type/" + watchType + "/";

   return this.http.post<{}>(url, watchData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

 patchWatch(watchID, watchData): Observable<{}> {
  var url = this.watchsUrl + watchID + "/";

   return this.http.patch<{}>(url, watchData).pipe(
     map(this.extractData),
     catchError(this.handleError)
   );
 }

// Socket Communication Functionalities:

  socketStart(userToken) {
    this.socket.connect();
    this.socket.emit('authenticate', {JWT: userToken});
  }

  socketEnd() {
    this.socket.disconnect();
  }

  socketSendMessage(userID,messageID,message,objectType,objectUrl) {
    var json = { Recipient: userID, MessageID: messageID, Text: message, ObjectType: objectType, ObjectLocation: objectUrl};

    this.socket.emit('user_message', json);
  }
 
  socketSendAction(userID,dataID,messageID,action) {
    this.socket.emit('user_message', { Recipient: userID, ID: dataID, MessageID: messageID, Action: action, Text: action });
  }
 
  socketListen() {
    let observable = new Observable(observer => {
      this.socket.on('json', (data) => {
        observer.next(data);
      });
    })
    return observable;
  }

}
