import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
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

    // Optionally suppress console.error during tests to reduce noise
    spyOn(console, 'error');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call AuthService.register on register and disable form fields on success', fakeAsync(() => {
    authServiceMock.register.and.returnValue(of({ isSuccess: true }));

    component.email = 'test@example.com';
    component.password = 'testPassword';
    component.confirmPassword = 'testPassword'; // Ensure passwords match

    component.register();

    // Simulate the passage of 2 seconds for setTimeout
    tick(2000);

    expect(authServiceMock.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'testPassword',
      addictionType: null,
      habitStartDate: null,
      lastRelapseDate: null,
      habitDescription: null,
      userMotivation: null,
      reasonForLastRelapse: null,
      costPerOccurrence: 0,
      occurrencesPerMonth: 0,
    });
    expect(component.successMessage).toBe('Registration successful! Redirecting to login');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.errorMessages.length).toBe(0);
    expect(component.isRegistering).toBe(true); // Form should be disabled
  }));

  it('should handle validation error messages when registration fails and re-enable form', () => {
    const errorResponse = new HttpErrorResponse({
      error: {
        errors: {
          email: ['Email is invalid.'],
          password: ['Password is too weak.']
        }
      },
      status: 400,
      statusText: 'Bad Request'
    });
    authServiceMock.register.and.returnValue(throwError(() => errorResponse));

    component.email = 'invalid@example.com';
    component.password = 'weakpassword';
    component.confirmPassword = 'weakpassword'; // Ensure passwords match

    component.register();

    expect(component.errorMessages).toEqual(['Email is invalid.', 'Password is too weak.']);
    expect(component.successMessage).toBe(null);
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(component.isRegistering).toBe(false); // Form should be re-enabled on error
  });

  it('should handle a general error message when registration fails and re-enable form', () => {
    const errorResponse = new HttpErrorResponse({
      error: {
        Message: 'Something went wrong, please try again.'
      },
      status: 500,
      statusText: 'Internal Server Error'
    });
    authServiceMock.register.and.returnValue(throwError(() => errorResponse));

    component.email = 'test@example.com';
    component.password = 'testPassword';
    component.confirmPassword = 'testPassword'; // Ensure passwords match

    component.register();

    expect(component.errorMessages).toEqual(['Something went wrong, please try again.']);
    expect(component.successMessage).toBe(null);
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(component.isRegistering).toBe(false); // Form should be re-enabled on error
  });

  it('should display an error if passwords do not match', () => {
    component.email = 'test@example.com';
    component.password = 'password123';
    component.confirmPassword = 'password321'; // Different password

    component.register();

    expect(component.errorMessages).toEqual(['Passwords do not match.']);
    expect(authServiceMock.register).not.toHaveBeenCalled();
    expect(component.isRegistering).toBe(false); // Form should remain enabled
  });
});
