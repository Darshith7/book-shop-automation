import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { BookRequest, IBookRequestData } from '../models/request.model';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private storageService = inject(StorageService);

  readonly requests$: Observable<BookRequest[]> = this.storageService.requests$;

  getAllRequests(): BookRequest[] {
    return this.storageService.getRequests();
  }

  getRequestById(requestId: string): BookRequest | undefined {
    return this.getAllRequests().find(r => r.requestId === requestId);
  }

  submitRequest(
    title: string,
    author: string = '',
    publisherDetails: string = '',
    additionalDetails: string = ''
  ): BookRequest {
    if (!title || !title.trim()) {
      throw new Error('Book title is mandatory to request procurement.');
    }

    const requestId = `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newRequest = new BookRequest(
      requestId,
      title,
      author,
      publisherDetails,
      additionalDetails,
      new Date(),
      'PENDING'
    );

    const requests = this.getAllRequests();
    requests.unshift(newRequest);
    this.storageService.saveRequests(requests);

    return newRequest;
  }

  updateStatus(requestId: string, status: 'PENDING' | 'PROCURED' | 'REJECTED'): void {
    const requests = this.getAllRequests();
    const req = requests.find(r => r.requestId === requestId);
    if (!req) {
      throw new Error(`Request with ID "${requestId}" not found.`);
    }

    req.updateStatus(status);
    this.storageService.saveRequests(requests);
  }
}

