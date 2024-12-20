import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HabitsComponent } from './habits/habits.component';
import { RelapseManagementComponent } from './relapse-management/relapse-management.component';
import { FooterComponent } from './footer/footer.component';


import { AuthInterceptor } from './services/auth.interceptor.service';
import { AuthGuard } from './guards/auth.guard';

// Import JwtHelperService and JWT_OPTIONS
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    HabitsComponent,
    RelapseManagementComponent,
   
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    FormsModule,
    HttpClientModule,
    FooterComponent,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'register', component: RegisterComponent },
      { path: 'login', component: LoginComponent },
      { path: 'habits', component: HabitsComponent, canActivate: [AuthGuard] },
      { path: 'manage-relapses/:id', component: RelapseManagementComponent, canActivate: [AuthGuard] },
      { path: 'manage-occurrences/:id', component: RelapseManagementComponent, canActivate: [AuthGuard] },
    ])
  ],
  providers: [
    AuthGuard,
    JwtHelperService,
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },  // Provide JWT_OPTIONS
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class AppModule { }

