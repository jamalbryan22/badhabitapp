import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { fakeAsync, tick } from '@angular/core/testing';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['register']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call AuthService.register on register and disable form fields on success', fakeAsync(() => {
    authServiceMock.register.and.returnValue(of({ isSuccess: true }));

    component.email = 'test@example.com';
    component.password = 'testPassword';
    component.register();

    tick(2000);

    expect(authServiceMock.register).toHaveBeenCalledWith('test@example.com', 'testPassword');
    expect(component.successMessage).toBe('Registration successful! Redirecting to login...');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.errorMessages.length).toBe(0);
    expect(component.isRegistering).toBe(true);  // Form should be disabled
  }));

  it('should handle validation error messages when registration fails and re-enable form', () => {
    const errorResponse = {
      error: {
        errors: {
          email: ['Email is invalid.'],
          password: ['Password is too weak.']
        }
      }
    };
    authServiceMock.register.and.returnValue(throwError(errorResponse));

    component.email = 'invalid@example.com';
    component.password = 'weakpassword';
    component.register();

    expect(component.errorMessages).toEqual(['Email is invalid.', 'Password is too weak.']);
    expect(component.successMessage).toBe('');
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(component.isRegistering).toBe(false);  // Form should be re-enabled on error
  });

  it('should handle a general error message when registration fails and re-enable form', () => {
    const errorResponse = {
      error: {
        Message: 'Something went wrong, please try again.'
      }
    };
    authServiceMock.register.and.returnValue(throwError(errorResponse));

    component.email = 'test@example.com';
    component.password = 'testPassword';
    component.register();

    expect(component.errorMessages).toEqual(['Something went wrong, please try again.']);
    expect(component.successMessage).toBe('');
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(component.isRegistering).toBe(false);  // Form should be re-enabled on error
  });
});
