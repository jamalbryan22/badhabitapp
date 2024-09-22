import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavMenuComponent } from './nav-menu.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('NavMenuComponent', () => {
  let component: NavMenuComponent;
  let fixture: ComponentFixture<NavMenuComponent>;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    // Create mock AuthService and Router
    authServiceMock = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getUsername', 'logout']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [NavMenuComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the menu expansion', () => {
    component.isExpanded = false;
    component.toggle();
    expect(component.isExpanded).toBeTrue();

    component.toggle();
    expect(component.isExpanded).toBeFalse();
  });

  it('should collapse the menu', () => {
    component.isExpanded = true;
    component.collapse();
    expect(component.isExpanded).toBeFalse();
  });

  it('should return the username if logged in', () => {
    authServiceMock.getUsername.and.returnValue('testUser');
    const username = component.getUsername();
    expect(username).toBe('testUser');
    expect(authServiceMock.getUsername).toHaveBeenCalled();
  });

  it('should return null if not logged in', () => {
    authServiceMock.getUsername.and.returnValue(null);
    const username = component.getUsername();
    expect(username).toBeNull();
    expect(authServiceMock.getUsername).toHaveBeenCalled();
  });

  it('should check if the user is logged in', () => {
    authServiceMock.isAuthenticated.and.returnValue(true);
    const isLoggedIn = component.isLoggedIn();
    expect(isLoggedIn).toBeTrue();
    expect(authServiceMock.isAuthenticated).toHaveBeenCalled();
  });

  it('should logout and navigate to login', () => {
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
