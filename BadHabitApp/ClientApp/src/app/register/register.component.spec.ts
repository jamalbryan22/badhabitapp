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

  it('should call AuthService.register on register and redirect on success', fakeAsync(() => {
    authServiceMock.register.and.returnValue(of({ isSuccess: true, messages: ['User registered successfully.'] }));

    component.username = 'testUser';
    component.password = 'testPassword';
    component.email = 'test@example.com';
    component.register();

    tick(2000);

    expect(authServiceMock.register).toHaveBeenCalledWith('testUser', 'testPassword', 'test@example.com');
    expect(component.successMessage).toBe('User registered successfully.');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should handle error when registration fails', () => {
    authServiceMock.register.and.returnValue(
      throwError({ error: { messages: ['Username already exists.'] } })
    );

    component.username = 'testUser';
    component.password = 'testPassword';
    component.email = 'test@example.com';
    component.register();

    expect(component.errorMessages).toEqual(['Username already exists.']);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
