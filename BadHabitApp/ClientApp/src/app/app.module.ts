import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HabitsComponent } from './habits/habits.component';

import { AuthInterceptor } from './services/auth.interceptor.service';

import { AuthGuard } from './guards/auth.guard';

@NgModule({ declarations: [
        AppComponent,
        NavMenuComponent,
        HomeComponent,
        CounterComponent,
        FetchDataComponent,
        LoginComponent,
        RegisterComponent,
        HabitsComponent
    ],
  bootstrap: [AppComponent], imports: [
        BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
        FormsModule,
        HttpClientModule,
        RouterModule.forRoot([
            { path: '', component: HomeComponent, pathMatch: 'full' },
            { path: 'register', component: RegisterComponent },
            { path: 'login', component: LoginComponent },
            { path: 'counter', component: CounterComponent, canActivate: [AuthGuard] },
            { path: 'fetch-data', component: FetchDataComponent },
            { path: 'habits', component: HabitsComponent, canActivate: [AuthGuard]}
        ])], providers: [
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideHttpClient(withInterceptorsFromDi())]
})
export class AppModule { }

