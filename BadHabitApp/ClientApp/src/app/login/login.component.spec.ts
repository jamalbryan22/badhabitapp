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
    authServiceMock = jasmine.createSpyObj('AuthService', ['login', 'storeToken']);  // Mock storeToken
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
    authServiceMock.login.and.returnValue(of({ token: 'test-token' }));

    component.username = 'testUser';
    component.password = 'testPassword';
    component.login();

    // Simulate passage of time for setTimeout (2000ms)
    tick(2000);

    expect(authServiceMock.login).toHaveBeenCalledWith('testUser', 'testPassword');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should handle error when login fails', () => {
    authServiceMock.login.and.returnValue(throwError({ error: 'Invalid username or password' }));

    component.username = 'testUser';
    component.password = 'testPassword';
    component.login();

    expect(component.errorMessage).toBe('Invalid username or password');
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
