import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { DataServiceService } from './../data-service.service';
import { TranslateService } from '@ngx-translate/core';
import { PopTools } from './../pop-tools';
import { Countries } from '../../assets/countries';
import { PopRoutes } from './../pop-routes';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {
  product = {"NoPhoto":0, "GroupID":0, "PhotoLocation":"", "Description":"", "Title":"", "Category":"", "SubCategory":"", "MinPrice":"", "Brand":"", "Country":"", "Currency":"", "MaxPrice":"", "Model":"", "Condition":"", "YearBuild":"", "Auction":false, "ExpireHide":false, "Sold":false, "Extra":"", "DateExpire":"", "State":"", "City":"", "Likes":0, "NLikes":0, "Comments":0};
  productEdit = {"Title":"", "Category":"", "SubCategory":"", "MinPrice":"", "Description": "", "Brand":"", "Country":"", "Currency":"", "MaxPrice":"", "Model":"", "Condition":"", "YearBuild":"", "Auction":false, "ExpireHide":false, "Sold":false, "Extra":"", "DateExpire":"", "State":"", "City":"", "PhotoLocation":""};
  formOptions = {"Mode":"EDIT","Title":"", "returnFull": true};
  auctions = [];
  country = ""
  lastAuction: any;
  hasAuctions: boolean = false;
  productPhotos = [];
  lastProductPhoto: any;
  hasProductPhotos: boolean = false;
  productID: number = 0;
  productEditing: boolean = false;
  productOwner: boolean = false;
  activeMember: boolean = false;
  groupAdmin: boolean = false;
  currentUserID: number = 0;
  NoPhoto: boolean = true;
  groupID: number = null;
  moreDetail: boolean = false;
  moreDetailArrow: string = "arrow-dropdown-circle";
  errorMessage: string;
  productIsAuction: string = "BTN_No";
  productIsExpireHide: string = "BTN_No";
  productIsSold: string = "BTN_No";
  sheetLabels: any = {};

  slideOpts = {
    slidesPerView: 5,
	autoHeight: true,
	touchStartPreventDefault: false
  };
  
  constructor(private router: Router, private rest: DataServiceService, private translate: TranslateService, private popTools: PopTools, private popRoutes: PopRoutes) { 

  }

  ngOnInit() {
    this.translate.stream(['Product_Edit','All_BTN_Cancel','All_Wait','Al_SystemError','Update_Message','Add_Message','Social_NewPhoto',
			'Social_Pictures','All_Already_Added','Social_PhotoOptions','Social_Delete_Photo','Delete_Message',
			'Social_ViewPhoto','All_Product','Market_ProductLike',
			'All_CannotContinue','errManInvalidAccess','All_AccessDenied','All_Item_Not_Found','Social_AlreadyLiked',
			'Social_MemberLike','All_Like','All_DontLike','All_Sow_Likes','Social_LikeSet']).subscribe(res => {
      this.sheetLabels = res;
    });
  }

  ionViewDidEnter() {
	this.product = null;
	this.hasProductPhotos = false;
    let myParams = this.popRoutes.getCurrentParam();
    if (myParams.productID) {
      this.productID = myParams.productID;
      if (myParams.groupID) {this.groupID = myParams.groupID;}
      this.getProduct();
      this.getAuctions();
      this.getProductPhotos();
    }
  }
  
  goBack() {
    this.popRoutes.navigateBackwards();
  }

  getProduct() {
    this.rest.getProduct(this.productID, this.groupID)
      .subscribe(
        product => this.parsProduct(product[0]),
        error =>  this.errorMessage = <any>error);
  }
  
  parsProduct(product) {
    if (product.Auction == 1) {this.productIsAuction = "BTN_Yes";} else {this.productIsAuction = "BTN_No";}
    if (product.ExpireHide == 1) {this.productIsExpireHide = "BTN_Yes";} else {this.productIsExpireHide = "BTN_No";}
    if (product.Sold == 1) {this.productIsSold = "BTN_Yes";} else {this.productIsSold = "BTN_No";}
    if (product.NoPhoto == 1) {this.NoPhoto = true;} else {this.NoPhoto = false;}
    switch(product.Condition) {
      case 1:
        product.ConditionLabel = "Usage_New";
        break;
      case 2:
        product.ConditionLabel = "Usage_Used";
        break;
      case 3:
        product.ConditionLabel = "Usage_Old";
        break;
      case 4:
        product.ConditionLabel = "Usage_VeryOld";
        break;
      case 5:
        product.ConditionLabel = "Usage_Damaged";
        break;
      default:
        product.ConditionLabel = "Usage_New";
        break;
    }
    this.country = Countries[product.Country];
    if (product.ActiveMember) {if (product.ActiveMember == 1) {this.activeMember = true;}}
    if (product.GroupAdmin) {if (product.GroupAdmin == 1) {this.groupAdmin = true;}}
    if (product.ProductOwner) {if (product.ProductOwner == 1) {this.productOwner = true;}}
    if (this.productOwner || this.groupAdmin) {this.productEditing = true;}
    
    this.product = product;
  }


  getAuctions() {
    this.rest.getAuctions(this.productID,null)
      .subscribe(
        auctions => this.parsAuctions(auctions),
        error =>  this.errorMessage = <any>error);
  }
  
  parsAuctions(auctions) {
	this.auctions = [];
    auctions.forEach(auction => {
      if (!this.hasAuctions) {this.hasAuctions = true;}
        this.lastAuction = auction.DatePlaced;
        this.auctions.push(auction);
    });
  }

  getProductPhotos() {
    this.productPhotos = [];
    this.rest.getProductPhotos(this.productID,null)
      .subscribe(
        productphotos => this.parsProductPhotos(productphotos),
        error =>  this.errorMessage = <any>error);
  }
  
  parsProductPhotos(productphotos) {
    productphotos.forEach(productphoto => {
      if (!this.hasProductPhotos) {this.hasProductPhotos = true;}
        this.lastProductPhoto = productphoto.DateUploaded;
        this.productPhotos.push(productphoto);
    });
  }

  toggleMoreDetail() {
    if (this.moreDetail) {
      this.moreDetail = false;
      this.moreDetailArrow = "arrow-dropdown-circle";
    } else {
      this.moreDetail = true;
      this.moreDetailArrow = "arrow-dropup-circle";
    }
  }

  clickedPhoto(lngIndex, photoID) {
   if (this.productEditing) {
     this.presentActionSheet(lngIndex, photoID);
   } else {
     this.showPhoto(lngIndex);
   }
  }

  showPhoto(lngIndex) {
   var params = {};

   if (lngIndex == -1) {
     params = {"Location": this.product.PhotoLocation, "Description": this.product.Description, "Likes": this.product.Likes, "NLikes": this.product.NLikes, "Comments": this.product.Comments};
   } else {
     params = {"NoIcons": true, "Location": this.productPhotos[lngIndex].Location, "Description": this.productPhotos[lngIndex].Description, "Likes": null, "NLikes": null, "Comments": null};
   }

   this.popRoutes.navigateForward('/show-photo', params);
  }

  editProduct() {
   let groupID = this.groupID;
   let postString = "";

   if (!groupID || groupID == 0) {if (this.product.GroupID > 0) {if (this.groupAdmin) {groupID = this.product.GroupID;}}}
   this.productEdit.Title = this.product.Title;
   this.productEdit.Category = this.product.Category;
   this.productEdit.SubCategory = this.product.SubCategory;
   this.productEdit.MinPrice = this.product.MinPrice;
   this.productEdit.Description = this.product.Description;
   this.productEdit.Brand = this.product.Brand;
   this.productEdit.Country = this.product.Country;
   this.productEdit.Currency = this.product.Currency;
   this.productEdit.PhotoLocation = this.product.PhotoLocation;

   this.productEdit.MaxPrice = this.product.MaxPrice;
   this.productEdit.Model = this.product.Model;
   this.productEdit.Condition = this.product.Condition;
   this.productEdit.YearBuild = this.product.YearBuild;
   this.productEdit.Extra = this.product.Extra;
   this.productEdit.State = this.product.State;
   this.productEdit.City = this.product.City;
   this.productEdit.Auction = Boolean(this.product.Auction);
   this.productEdit.ExpireHide = Boolean(this.product.ExpireHide);
   this.productEdit.Sold = Boolean(this.product.Sold);

   this.formOptions.Title = this.product.Title;
   let params = { "product": this.productEdit, "options": this.formOptions };

   this.popRoutes.showModal("ProductEditPage", params, (data) => {
    if (data) {
      delete data.PhotoLocation;
      delete data.Title;
      if (data.Category == this.product.Category) {delete data.Category;}
      if (data.SubCategory == this.product.SubCategory) {delete data.SubCategory;}
      if (data.MinPrice == this.product.MinPrice) {delete data.MinPrice;}
      if (data.Description == this.product.Description) {delete data.Description;}
      if (data.Brand == this.product.Brand) {delete data.Brand;}
      if (data.Country == this.product.Country) {delete data.Country;}
      if (data.Currency == this.product.Currency) {delete data.Currency;}

      if (data.MaxPrice == this.product.MaxPrice) {delete data.MaxPrice;}
      if (data.Model == this.product.Model) {delete data.Model;}
      if (data.Condition == this.product.Condition) {delete data.Condition;}
      if (data.YearBuild == this.product.YearBuild) {delete data.YearBuild;}
      if (data.Extra == this.product.Extra) {delete data.Extra;}
      if (data.State == this.product.State) {delete data.State;}
      if (data.City == this.product.City) {delete data.City;}
      data.Auction = data.Auction ? 1 : 0;
      if (data.Auction == this.product.Auction) {delete data.Auction;}
      data.ExpireHide = data.ExpireHide ? 1 : 0;
      if (data.ExpireHide == this.product.ExpireHide) {delete data.ExpireHide;}
      data.Sold = data.Sold ? 1 : 0;
      if (data.Sold == this.product.Sold) {delete data.Sold;}

      for (var key in data) {
        if (postString != "") {postString = postString + "&";}
        postString = postString + key + "=" + data[key];
      }
      if (postString != "") {
        this.popTools.showLoading();
        this.rest.patchProduct(this.productID,groupID,postString)
    	    .subscribe(
            response => this.parsResponse(response),
            error =>  this.errorNotification(error));
      }
    }
   });
  }

  editPhoto() {
   let groupID = this.groupID;
   let postString = "";

   if (!groupID || groupID == 0) {if (this.product.GroupID > 0) {if (this.groupAdmin) {groupID = this.product.GroupID;}}}
   this.formOptions.Title = this.sheetLabels["Social_Pictures"];
   let params = { "resourceIndex": 1, "options": this.formOptions };

   this.popRoutes.showModal("SelectMyResourcePage", params, (data) => {
    if (data) {
      postString = "PhotoLocation=" + data.resourceLocation;
      this.popTools.showLoading();
      this.rest.patchProduct(this.productID,groupID,postString)
    	  .subscribe(
          response => this.parsResponse(response),
          error =>  this.errorNotification(error));
    }
   });
  }

  addPhoto() {
   let blnAlready = false;
   let groupID = this.groupID;
   let postString = "";

   if (!groupID || groupID == 0) {if (this.product.GroupID > 0) {if (this.groupAdmin) {groupID = this.product.GroupID;}}}
   this.formOptions.Title = this.sheetLabels["Social_Pictures"];
   let params = { "resourceIndex": 1, "options": this.formOptions };

   this.popRoutes.showModal("SelectMyResourcePage", params, (data) => {
    if (data) {
      this.productPhotos.forEach(productphoto => {
        if (productphoto.UserPhotoID == data.ID) {blnAlready = true;}
      });
      if (blnAlready) {
        this.popTools.showAlert(this.sheetLabels["Social_NewPhoto"],this.sheetLabels["All_Already_Added"]);
      } else { 
        postString = "Location=" + data.resourceLocation;
        postString = postString + "&ProductID=" + this.productID;
        postString = postString + "&Description=" + data.Description;
        postString = postString + "&UserPhotoID=" + data.ID;
        postString = postString + "&PhotoName=" + data.PhotoName;
        postString = postString + "&DateUploaded=" + data.DateUploaded;

        this.popTools.showLoading();
        this.rest.newProductPhoto(groupID,this.productID,postString)
          .subscribe(
            response => this.parsResponsePhotos(response),
            error =>  this.errorNotification(error));
      }
    }
   });
  }

  deletePhoto(resourceIndex, photoID) {
    let groupID = this.groupID;
    
    this.popTools.showLoading();
    if (!groupID || groupID == 0) {if (this.product.GroupID > 0) {if (this.groupAdmin) {groupID = this.product.GroupID;}}}
    this.rest.deleteProductPhoto(groupID, this.productID, photoID)
       .subscribe(
         response => this.parsDeletePhotos(response),
         error =>  this.errorNotification(error));
  }
 
  parsResponse(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.popTools.showToast(this.sheetLabels["Update_Message"],null);
      this.getProduct();
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
    }
  }

  parsResponsePhotos(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.getProductPhotos();
      this.popTools.showToast(this.sheetLabels["Add_Message"],null);
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
    }
  }

  parsDeletePhotos(response) {
    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      this.getProductPhotos();
      this.popTools.showToast(this.sheetLabels["Delete_Message"],null);
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],JSON.stringify(response));
    }
  }

  showGroup(lngGroupID) {
   let params = { groupID: lngGroupID };

   this.popRoutes.navigateForward('/group-details', params);
  }

  showMember(lngMemberID) {
   let params = { memberID: lngMemberID, isFriend: null };

   this.popRoutes.navigateForward('/member-profile', params);
  }

  showObject() {
    var ObjectData = this.product;
    var params = {"ObjectType": "product", "ObjectID": ObjectData["ID"], Location: ObjectData["PhotoLocation"], 
		Description: ObjectData["Title"], "Likes": ObjectData["Likes"], "NLikes": ObjectData["NLikes"], 
		"Comments": ObjectData["Comments"], NoIcons: null, ShowComments: true, "resourceType": 1};

    let pageClosed = (retData)=>{
      if (retData.Likes != null && retData.Likes > 0) {this.increaseCount("Likes", 1);}
      if (retData.NLikes != null && retData.NLikes > 0) {this.increaseCount("NLikes", 1);}
      if (retData.Comments != null && retData.Comments > 0) {this.increaseCount( "Comments", retData.Comments);}
    }
    params["pageClosed"] = pageClosed;
    this.popRoutes.navigateForward('/show-photo', params);
  }

  increaseCount(strObject, lngValue) {
    var lngCount = 0;

    switch(strObject) {
      case "Likes":
        lngCount = Number(this.product.Likes) + lngValue;
        this.product.Likes = lngCount
        break;
      case "NLikes":
        lngCount = Number(this.product.NLikes) + lngValue;
        this.product.NLikes = lngCount
        break;
      case "Comments":
        lngCount = Number(this.product.Comments) + lngValue;
        this.product.Comments = lngCount
        break;
    }
  }
  
  async showAddLikePrompt() {
    this.popTools.showAddLikePrompt(this.sheetLabels["Market_ProductLike"], (data) => {
      if (data == 3) {
        var strTitle = this.sheetLabels["All_Product"] + " " + this.product.Title;
        var params = { ObjectType:"product", ObjectID: this.product["ID"], Title: strTitle };
        this.popTools.showLikes(params, (data2) => {
          if (data2 > 0) {this.showMember(data2);}
        });
      } else if (data > 0) {
        this.sendLike(data)
      }
    });
  }

  sendLike(like) {
    this.popTools.showLoading();
    this.rest.postLike("product", this.product["ID"], like)
      .subscribe(
        response => this.parsLikeResponse(response, like),
        error =>  this.popTools.parsPostError(error));
  }

  parsLikeResponse(response,like) {
    var lngCount = 0;

    this.popTools.dismissLoading();
    if (response.rowsAffected[0]) {
      if (like == 1) {
        lngCount = Number(this.product.Likes) + 1;
        this.product.Likes = lngCount;
      } else {
        lngCount = Number(this.product.NLikes) + 1;
        this.product.NLikes = lngCount;
      }

      this.popTools.showToast(this.sheetLabels["Social_LikeSet"],this.product.PhotoLocation);
    } else {
      this.errorNotification(response);
    }
  }

  errorNotification(error) {
    this.errorMessage = <any>error;

    this.popTools.dismissLoading();
    let jsonError = JSON.parse(error)
    if (jsonError.code) {
      if (jsonError.code != "ITEM_NOT_FOUND") {this.popTools.showAlert(this.sheetLabels["Al_SystemError"],error);}
    } else {
      this.popTools.showAlert(this.sheetLabels["Al_SystemError"],error);
    }
  }

  presentActionSheet(lngIndex, photoID) {
     let buttons = [
       {
         text: this.sheetLabels["Social_ViewPhoto"],
         handler: () => {
           this.showPhoto(lngIndex);
         }
       },
       {
         text: this.sheetLabels["Social_Delete_Photo"],
         handler: () => {
           this.deletePhoto(lngIndex, photoID);
         }
       },
       {
         text: this.sheetLabels["All_BTN_Cancel"],
         role: 'cancel',
         handler: () => { }
       }
     ];

   this.popTools.showActionSheet(this.sheetLabels["Social_PhotoOptions"], buttons);
  }
  
  emptyMethod() {

  }

}
