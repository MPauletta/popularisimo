import { AuthGuardService } from './auth-guard.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'my-portal', canActivate: [AuthGuardService], loadChildren: './my-portal/my-portal.module#MyPortalPageModule' },
  { path: 'groups', canActivate: [AuthGuardService], loadChildren: './groups/groups.module#GroupsPageModule' },
  { path: 'chat', canActivate: [AuthGuardService], loadChildren: './chat/chat.module#ChatPageModule' },
  { path: 'market', canActivate: [AuthGuardService], loadChildren: './market/market.module#MarketPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'register', loadChildren: './register/register.module#RegisterPageModule' },
  { path: 'custom-toast', loadChildren: './custom-toast/custom-toast.module#CustomToastPageModule' },
  { path: 'select-my-resource', loadChildren: './select-my-resource/select-my-resource.module#SelectMyResourcePageModule' },
  { path: 'show-likes', loadChildren: './show-likes/show-likes.module#ShowLikesPageModule' },
  { path: 'messenger', loadChildren: './messenger/messenger.module#MessengerPageModule' },
  { path: 'friends', loadChildren: './friends/friends.module#FriendsPageModule' },
  { path: 'members', loadChildren: './members/members.module#MembersPageModule' },
  { path: 'my-resources/:type', loadChildren: './my-resources/my-resources.module#MyResourcesPageModule' },
  { path: 'group-resources', loadChildren: './group-resources/group-resources.module#GroupResourcesPageModule' },
  { path: 'pdf-viewer', loadChildren: './pdf-viewer/pdf-viewer.module#PdfViewerPageModule' },
  { path: 'my-calendar', loadChildren: './my-calendar/my-calendar.module#MyCalendarPageModule' },
  { path: 'event-details', loadChildren: './event-details/event-details.module#EventDetailsPageModule' },
  { path: 'message-details', loadChildren: './message-details/message-details.module#MessageDetailsPageModule' },
  { path: 'chat-room', loadChildren: './chat-room/chat-room.module#ChatRoomPageModule' },
  { path: 'comment-add', loadChildren: './comment-add/comment-add.module#CommentAddPageModule' },
  { path: 'main-options', loadChildren: './main-options/main-options.module#MainOptionsPageModule' },
  { path: 'member-profile', loadChildren: './member-profile/member-profile.module#MemberProfilePageModule' },
  { path: 'member-resources', loadChildren: './member-resources/member-resources.module#MemberResourcesPageModule' },
  { path: 'show-photo', loadChildren: './show-photo/show-photo.module#ShowPhotoPageModule' },
  { path: 'product', loadChildren: './product/product.module#ProductPageModule' },
  { path: 'group-details', loadChildren: './group-details/group-details.module#GroupDetailsPageModule' },
  { path: 'forum', loadChildren: './forum/forum.module#ForumPageModule' },
  { path: 'forum-message', loadChildren: './forum-message/forum-message.module#ForumMessagePageModule' },
  { path: 'group-members', loadChildren: './group-members/group-members.module#GroupMembersPageModule' },
  { path: 'group-calendar', loadChildren: './group-calendar/group-calendar.module#GroupCalendarPageModule' },
  { path: 'notes', loadChildren: './notes/notes.module#NotesPageModule' },
  { path: 'note-details', loadChildren: './note-details/note-details.module#NoteDetailsPageModule' },
  { path: 'folders', loadChildren: './folders/folders.module#FoldersPageModule' },
  { path: 'group-edit', loadChildren: './group-edit/group-edit.module#GroupEditPageModule' },
  { path: 'product-edit', loadChildren: './product-edit/product-edit.module#ProductEditPageModule' },
  { path: 'message-editor', loadChildren: './message-editor/message-editor.module#MessageEditorPageModule' },
  { path: 'select-friends', loadChildren: './select-friends/select-friends.module#SelectFriendsPageModule' },
  { path: 'forum-message-editor', loadChildren: './forum-message-editor/forum-message-editor.module#ForumMessageEditorPageModule' },
  { path: 'note-editor', loadChildren: './note-editor/note-editor.module#NoteEditorPageModule' },
  { path: 'select-group-members', loadChildren: './select-group-members/select-group-members.module#SelectGroupMembersPageModule' },
  { path: 'user-info', loadChildren: './user-info/user-info.module#UserInfoPageModule' },
  { path: 'user-address', loadChildren: './user-address/user-address.module#UserAddressPageModule' },
  { path: 'user-privacy', loadChildren: './user-privacy/user-privacy.module#UserPrivacyPageModule' },
  { path: 'user-security', loadChildren: './user-security/user-security.module#UserSecurityPageModule' },
  { path: 'watch-list', loadChildren: './watch-list/watch-list.module#WatchListPageModule' },
  { path: 'app-storage', loadChildren: './app-storage/app-storage.module#AppStoragePageModule' },
  { path: 'upload-modal', loadChildren: './upload-modal/upload-modal.module#UploadModalPageModule' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
