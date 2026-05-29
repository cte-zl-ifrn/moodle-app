import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';

import { AppRoutingModule } from '@/app/app-routing.module';

const appRoutes: Routes = [
    {
        path: 'painel/home',
        loadComponent: () => import('./pages/home/home'),
    },
];

@NgModule({
    imports: [
        AppRoutingModule.forChild(appRoutes),
    ],
})
export class CorePainelModule {}
