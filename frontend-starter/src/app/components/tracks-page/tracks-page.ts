import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Track } from '../../shared/models/track.model';
import { TrackService } from '../../shared/services/track.service';

const MAX_AUDIO_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = new Set([
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/mp4',
  'audio/x-m4a',
]);

@Component({
  imports: [ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './tracks-page.html',
  styleUrl: './tracks-page.css',
})
export class TracksPageComponent implements OnDestroy {
  private readonly service = inject(TrackService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly audioInput = viewChild.required<ElementRef<HTMLInputElement>>('audioInput');

  readonly tracks = signal<Track[]>([]);
  readonly page = signal(1);
  readonly pages = signal(1);
  readonly loading = signal(false);
  readonly libraryError = signal('');
  readonly uploading = signal(false);
  readonly uploadProgress = signal<number | null>(null);
  readonly uploadError = signal('');
  readonly uploadSuccess = signal('');
  readonly deletingTrackIds = signal<ReadonlySet<string>>(new Set());
  readonly audioUrl = signal('');
  readonly currentTrackId = signal<string | null>(null);
  readonly currentTrackTitle = signal('');
  readonly audioError = signal('');
  readonly title = new FormControl('', { nonNullable: true });
  file: File | null = null;

  constructor() {
    this.load();
  }

  choose(event: Event): void {
    this.file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.uploadError.set('');
    this.uploadSuccess.set('');
    console.debug('[TracksPage] Fichier sélectionné', this.file?.name);
  }

  load(): void {
    this.libraryError.set('');
    this.loading.set(true);
    this.service.list(this.page()).subscribe({
      next: (response) => {
        console.debug('[TracksPage] Pistes chargées', response.items.length);
        this.tracks.set(response.items);
        this.pages.set(response.pages);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.libraryError.set(
          this.responseMessage(error, 'Impossible de charger la bibliothèque. Réessayez.'),
        );
        this.loading.set(false);
      },
    });
  }

  go(page: number): void {
    this.page.set(page);
    this.load();
  }

  upload(): void {
    if (this.uploading()) return;

    this.uploadError.set('');
    this.uploadSuccess.set('');
    this.uploadProgress.set(null);

    const file = this.file;
    const title = this.title.value.trim();

    if (!file) {
      this.uploadError.set('Choisissez un fichier audio avant de continuer.');
      return;
    }
    if (!title) {
      this.uploadError.set('Saisissez un titre pour cette piste.');
      return;
    }
    if (!ALLOWED_AUDIO_TYPES.has(file.type)) {
      this.uploadError.set('Format non accepté. Choisissez un fichier MP3, WAV, OGG ou M4A.');
      return;
    }
    if (file.size > MAX_AUDIO_FILE_SIZE) {
      this.uploadError.set('Le fichier dépasse la taille maximale de 25 Mo.');
      return;
    }

    this.uploading.set(true);
    this.service.upload(file, title).subscribe({
      next: (event: HttpEvent<Track>) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total && event.total > 0) {
            this.uploadProgress.set(Math.round((100 * event.loaded) / event.total));
          }
          return;
        }

        if (event.type === HttpEventType.Response) {
          this.uploading.set(false);
          this.uploadProgress.set(null);
          this.title.setValue('');
          this.file = null;
          this.audioInput().nativeElement.value = '';
          this.uploadSuccess.set('La piste a été envoyée avec succès.');
          this.page.set(1);
          this.load();
        }
      },
      error: (error: HttpErrorResponse) => {
        this.uploadError.set(
          this.responseMessage(error, 'L’envoi a échoué. Vérifiez le fichier et réessayez.'),
        );
        this.uploading.set(false);
        this.uploadProgress.set(null);
      },
    });
  }

  deleteTrack(track: Track): void {
    if (this.deletingTrackIds().has(track.id)) return;
    if (!window.confirm(`Voulez-vous supprimer la piste « ${track.title} » ?`)) return;

    this.deletingTrackIds.update((ids) => new Set(ids).add(track.id));

    this.service.delete(track.id).subscribe({
      next: () => {
        this.snackBar.open('Piste supprimée avec succès.', 'Fermer', { duration: 5000 });
        if (this.page() > 1 && this.tracks().length === 1) {
          this.page.update((page) => page - 1);
        }
        this.load();
        this.finishDeleting(track.id);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.snackBar.open(
            'Piste introuvable ou inaccessible. Elle a peut-être déjà été supprimée.',
            'Fermer',
            { duration: 7000 },
          );
          this.load();
        } else {
          this.snackBar.open('Impossible de supprimer la piste.', 'Fermer', { duration: 5000 });
        }
        this.finishDeleting(track.id);
      },
    });
  }

  play(track: Track): void {
    this.audioError.set('');
    this.service.audio(track.id).subscribe({
      next: (blob) => {
        console.debug('[TracksPage] Audio chargé', track.id);
        const previousUrl = this.audioUrl();
        if (previousUrl) URL.revokeObjectURL(previousUrl);
        this.audioUrl.set(URL.createObjectURL(blob));
        this.currentTrackId.set(track.id);
        this.currentTrackTitle.set(track.title);
      },
      error: (error: HttpErrorResponse) => {
        this.audioError.set(
          this.responseMessage(error, 'Impossible de charger cet audio. Réessayez.'),
        );
      },
    });
  }

  ngOnDestroy(): void {
    const audioUrl = this.audioUrl();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }

  private responseMessage(error: HttpErrorResponse, fallback: string): string {
    const response = error.error;
    if (
      typeof response === 'object' &&
      response !== null &&
      'message' in response &&
      typeof response.message === 'string' &&
      response.message.trim()
    ) {
      return response.message;
    }

    return fallback;
  }

  private finishDeleting(trackId: string): void {
    this.deletingTrackIds.update((ids) => {
      const next = new Set(ids);
      next.delete(trackId);
      return next;
    });
  }
}
