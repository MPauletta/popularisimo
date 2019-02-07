import { AuthGuardService } from './../auth-guard.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'my-portal',
		    canActivate: [AuthGuardService],
        children: [
          {
            path: '',
			      canActivate: [AuthGuardService],
            loadChildren: '../my-portal/my-portal.module#MyPortalPageModule',
          }
        ]
      },
      {
        path: 'groups',
        children: [
          {
            path: '',
			      canActivate: [AuthGuardService],
            loadChildren: '../groups/groups.module#GroupsPageModule'
          }
        ]
      },
      {
        path: 'chat',
        children: [
          {
            path: '',
			      canActivate: [AuthGuardService],
            loadChildren: '../chat/chat.module#ChatPageModule'
          }
        ]
      },
      {
        path: 'market',
        children: [
          {
            path: '',
			      canActivate: [AuthGuardService],
            loadChildren: '../market/market.module#MarketPageModule'
          }
        ]
      },
      {
        path: '',
		    canActivate: [AuthGuardService],
        redirectTo: '/login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
	  canActivate: [AuthGuardService],
    redirectTo: '/login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
