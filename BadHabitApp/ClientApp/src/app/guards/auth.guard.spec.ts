import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    authGuard = TestBed.inject(AuthGuard);
  });

  it('should allow access if user is authenticated', () => {
    authServiceMock.isAuthenticated.and.returnValue(true);  // Simulate authenticated user

    const canActivate = authGuard.canActivate();

    expect(canActivate).toBeTrue();
    expect(authServiceMock.isAuthenticated).toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();  // No redirection
  });

  it('should deny access and redirect to login if user is not authenticated', () => {
    authServiceMock.isAuthenticated.and.returnValue(false);  // Simulate unauthenticated user

    const canActivate = authGuard.canActivate();

    expect(canActivate).toBeFalse();
    expect(authServiceMock.isAuthenticated).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);  // Check redirection to login
  });
});
