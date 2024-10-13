// src/app/services/auth.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockJwtHelperService: MockJwtHelperService;

  const mockValidToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    'eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoidGVzdHVzZXIifQ.' +
    'signature';

  const mockInvalidToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    'invalidpayload.' +
    'signature';

  class MockJwtHelperService {
    isTokenExpiredReturnValue = false;
    decodeTokenReturnValue: any = {
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'testuser',
    };

    isTokenExpired(token?: string): boolean {
      return this.isTokenExpiredReturnValue;
    }

    decodeToken(token?: string): any {
      return this.decodeTokenReturnValue;
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: JwtHelperService, useClass: MockJwtHelperService },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    mockJwtHelperService = TestBed.inject(JwtHelperService) as any as MockJwtHelperService;
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a new user via POST', () => {
    const email = 'test@example.com';
    const password = 'password123';
    const mockResponse = { message: 'User registered successfully' };

    service.register(email, password).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['baseUrl']}/Account/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email, password });
    req.flush(mockResponse);
  });

  it('should login a user and store the token via POST', () => {
    const email = 'test@example.com';
    const password = 'password123';
    const mockResponse = { token: mockValidToken };

    spyOn(service, 'storeToken').and.callThrough();

    service.login(email, password).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      expect(service.storeToken).toHaveBeenCalledWith(mockValidToken);
    });

    const req = httpMock.expectOne(`${service['baseUrl']}/Account/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email, password });
    req.flush(mockResponse);
  });

  it('should send GET request with Authorization header when getting profile', () => {
    const mockProfile = { username: 'testuser' };

    localStorage.setItem('token', mockValidToken);

    service.getProfile().subscribe((profile) => {
      expect(profile).toEqual(mockProfile);
    });

    const req = httpMock.expectOne(`${service['baseUrl']}/profile`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockValidToken}`);
    req.flush(mockProfile);
  });

  it('should store the token in localStorage', () => {
    spyOn(localStorage, 'setItem').and.callThrough();
    service.storeToken(mockValidToken);
    expect(localStorage.setItem).toHaveBeenCalledWith('token', mockValidToken);
    expect(localStorage.getItem('token')).toBe(mockValidToken);
  });

  it('should retrieve the token from localStorage', () => {
    localStorage.setItem('token', mockValidToken);
    const token = service.getToken();
    expect(token).toBe(mockValidToken);
  });

  it('should clear the token on logout', () => {
    localStorage.setItem('token', mockValidToken);
    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should return true if user is authenticated (valid token)', () => {
    mockJwtHelperService.isTokenExpiredReturnValue = false; // Token is valid
    localStorage.setItem('token', mockValidToken);
    const isAuthenticated = service.isAuthenticated();
    expect(isAuthenticated).toBeTrue();
  });

  it('should return false if user is not authenticated (expired token)', () => {
    mockJwtHelperService.isTokenExpiredReturnValue = true; // Token is expired
    localStorage.setItem('token', mockValidToken);
    const isAuthenticated = service.isAuthenticated();
    expect(isAuthenticated).toBeFalse();
  });

  it('should return the username from the token', () => {
    mockJwtHelperService.decodeTokenReturnValue = {
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'testuser',
    };
    localStorage.setItem('token', mockValidToken);
    const username = service.getUsername();
    expect(username).toBe('testuser');
  });

  it('should return null for username if token is invalid', () => {
    mockJwtHelperService.decodeTokenReturnValue = null; // Simulate invalid token
    localStorage.setItem('token', mockInvalidToken);
    const username = service.getUsername();
    expect(username).toBeNull();
  });
});
