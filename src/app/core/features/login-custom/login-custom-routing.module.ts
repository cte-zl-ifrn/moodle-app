import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginCustomPage } from './login-custom.page';

const routes: Routes = [
  {
    path: '',
    component: LoginCustomPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginCustomPageRoutingModule {}
