import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginCustomPageRoutingModule } from './login-custom-routing.module';

@NgModule({
  imports: [
    CommonModule,
    LoginCustomPageRoutingModule
    // REMOVIDO: LoginCustomPage e IonicModule/FormsModule (já estão no standalone)
  ],
  declarations: [] // Continua vazio
})
export class LoginCustomPageModule {}
