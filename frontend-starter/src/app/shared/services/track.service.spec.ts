import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Page } from '../models/page.model';
import { Track } from '../models/track.model';
import { TrackService } from './track.service';

describe('TrackService', () => {
  let service: TrackService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TrackService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('requests the selected track page and returns the simulated page', () => {
    const response: Page<Track> = {
      items: [
        {
          id: 'track-test-1',
          title: 'Fictional blues',
          originalName: 'fictional-blues.mp3',
          mimeType: 'audio/mpeg',
          size: 1234,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      page: 2,
      limit: 5,
      total: 6,
      pages: 2,
    };
    let receivedResponse: Page<Track> | undefined;

    service.list(2, 5).subscribe((value) => {
      receivedResponse = value;
    });

    const request = httpTestingController.expectOne((req) => req.url === '/api/tracks');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('limit')).toBe('5');
    request.flush(response);

    expect(receivedResponse).toEqual(response);
  });

  it('sends a DELETE request for the selected track and completes on 204', () => {
    let completed = false;

    service.delete('track-123').subscribe({
      complete: () => {
        completed = true;
      },
    });

    const request = httpTestingController.expectOne('/api/tracks/track-123');
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });

    expect(completed).toBe(true);
  });
});
