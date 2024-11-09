import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { fakeAsync, tick } from '@angular/core/testing';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call AuthService.login on login and redirect on success', fakeAsync(() => {
    authServiceMock.login.and.returnValue(of({ isSuccess: true }));

    component.email = 'testEmail@test.com';
    component.password = 'testPassword';
    component.login();

    tick(); // Fast forward the async call

    expect(authServiceMock.login).toHaveBeenCalledWith('testEmail@test.com', 'testPassword');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should handle error when login fails', () => {
    authServiceMock.login.and.returnValue(
      throwError({ error: { messages: ['Invalid email or password'] } })
    );

    component.email = 'testEmail@test.com';
    component.password = 'testPassword';
    component.login();

    expect(component.errorMessages).toEqual(['Invalid email or password']);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should display default error message if no specific messages are provided', () => {
    authServiceMock.login.and.returnValue(throwError({}));

    component.email = 'testEmail@test.com';
    component.password = 'testPassword';
    component.login();

    expect(component.errorMessages).toEqual(['Incorrect Email or Password.']);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
