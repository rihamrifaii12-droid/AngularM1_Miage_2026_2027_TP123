import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('gpc_token', 'fake-jwt-token');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('adds the bearer authorization header to a protected request', () => {
    let receivedResponse: { id: string } | undefined;

    TestBed.inject(HttpClient).get<{ id: string }>('/api/users/me').subscribe((value) => {
      receivedResponse = value;
    });

    const request = httpTestingController.expectOne('/api/users/me');
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
    request.flush({ id: 'user-test-123' });

    expect(receivedResponse).toEqual({ id: 'user-test-123' });
  });
});
