import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NavMenuComponent } from './nav-menu.component';
import { RouterTestingModule } from '@angular/router/testing';  // Correct testing module for routing
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';  // Optional: suppress unknown elements like routerLink
import { of } from 'rxjs';

describe('NavMenuComponent', () => {
  let component: NavMenuComponent;
  let fixture: ComponentFixture<NavMenuComponent>;
  let authServiceMock: any;
  let router: Router;

  beforeEach(async () => {
    // Create mock AuthService
    authServiceMock = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getUsername', 'logout']);

    await TestBed.configureTestingModule({
      declarations: [NavMenuComponent],
      imports: [
        RouterTestingModule.withRoutes([  // Define mock routes
          { path: 'login', redirectTo: '' }
        ])
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA]  // Optional: suppress errors for unknown elements like routerLink
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavMenuComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the menu expansion', fakeAsync(() => {
    component.isExpanded = false;
    component.toggle();
    expect(component.isExpanded).toBeTrue();

    component.toggle();
    expect(component.isExpanded).toBeFalse();
  }));

  it('should collapse the menu', fakeAsync(() => {
    component.isExpanded = true;
    component.collapse();
    expect(component.isExpanded).toBeFalse();
  }));

  it('should return the username if logged in', fakeAsync(() => {
    authServiceMock.getUsername.and.returnValue('testUser');
    const username = component.getUsername();
    expect(username).toBe('testUser');
    expect(authServiceMock.getUsername).toHaveBeenCalled();
  }));

  it('should return null if not logged in', fakeAsync(() => {
    authServiceMock.getUsername.and.returnValue(null);
    const username = component.getUsername();
    expect(username).toBeNull();
    expect(authServiceMock.getUsername).toHaveBeenCalled();
  }));

  it('should check if the user is logged in', fakeAsync(() => {
    authServiceMock.isAuthenticated.and.returnValue(true);
    const isLoggedIn = component.isLoggedIn();
    expect(isLoggedIn).toBeTrue();
    expect(authServiceMock.isAuthenticated).toHaveBeenCalled();
  }));

  it('should logout and navigate to login', fakeAsync(() => {
    // Mock the logout method
    authServiceMock.logout.and.callFake(() => of(true));

    // Spy on the router's navigate method
    const navigateSpy = spyOn(router, 'navigate');

    // Call the component's logout method
    component.logout();

    // Simulate the passage of time
    tick();

    // Assert that the AuthService's logout method was called
    expect(authServiceMock.logout).toHaveBeenCalled();

    // Assert that the Router.navigate was called with the '/login' route
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  }));
});
