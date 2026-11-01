import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { Publisher, IPublisherData } from '../models/publisher.model';

@Injectable({
  providedIn: 'root'
})
export class PublisherService {
  private storageService = inject(StorageService);

  readonly publishers$: Observable<Publisher[]> = this.storageService.publishers$;

  getAllPublishers(): Publisher[] {
    return this.storageService.getPublishers();
  }

  getPublisherById(publisherId: string): Publisher | undefined {
    return this.getAllPublishers().find(p => p.publisherId.toUpperCase() === publisherId.trim().toUpperCase());
  }

  addPublisher(publisherData: IPublisherData): Publisher {
    const publishers = this.getAllPublishers();
    const existing = publishers.find(p => p.publisherId.toUpperCase() === publisherData.publisherId.trim().toUpperCase());
    if (existing) {
      throw new Error(`Publisher with ID "${publisherData.publisherId}" already exists.`);
    }

    const newPub = new Publisher(
      publisherData.publisherId,
      publisherData.name,
      publisherData.fullAddress,
      publisherData.procurementLeadDays
    );

    publishers.push(newPub);
    this.storageService.savePublishers(publishers);
    return newPub;
  }

  updatePublisher(publisherId: string, name: string, fullAddress: string, leadDays: number): Publisher {
    const publishers = this.getAllPublishers();
    const pub = publishers.find(p => p.publisherId.toUpperCase() === publisherId.trim().toUpperCase());
    if (!pub) {
      throw new Error(`Publisher with ID "${publisherId}" not found.`);
    }

    pub.updateDetails(name, fullAddress, leadDays);
    this.storageService.savePublishers(publishers);
    return pub;
  }
}

