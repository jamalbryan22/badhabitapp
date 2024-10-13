import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor.service';
import { AuthService } from './auth.service';

describe('AuthInterceptor', () => {
  let authService: AuthService;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    const authServiceMock = {
      getToken: jasmine.createSpy().and.returnValue('mockToken') // Adjust this if needed
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        }
      ]
    });

    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify(); // Verifies that no unexpected requests are pending
  });

  it('should add an Authorization header if token exists', () => {
    // Act
    httpClient.get('/test-url').subscribe();

    // Assert
    const httpRequest = httpMock.expectOne('/test-url');

    expect(httpRequest.request.headers.has('Authorization')).toBeTruthy();
    expect(httpRequest.request.headers.get('Authorization')).toBe('Bearer mockToken');
  });

  it('should not add an Authorization header if no token exists', () => {
    (authService.getToken as jasmine.Spy).and.returnValue(null); // No token case

    // Act
    httpClient.get('/test-url').subscribe();

    // Assert
    const httpRequest = httpMock.expectOne('/test-url');

    expect(httpRequest.request.headers.has('Authorization')).toBeFalsy();
  });
});
