import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuthResponse } from '../models/auth-response.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('sends login credentials and returns the simulated authentication response', () => {
    const credentials = {
      email: 'fictional.user@example.test',
      password: 'fictional-password',
    };
    const response: AuthResponse = {
      token: 'fake-jwt-token',
      user: {
        id: 'user-test-123',
        name: 'Fictional User',
        email: credentials.email,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    };
    let receivedResponse: AuthResponse | undefined;

    service.login(credentials.email, credentials.password).subscribe((value) => {
      receivedResponse = value;
    });

    const request = httpTestingController.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    request.flush(response);

    expect(receivedResponse).toEqual(response);
    expect(localStorage.getItem('gpc_token')).toBe('fake-jwt-token');
  });
});
