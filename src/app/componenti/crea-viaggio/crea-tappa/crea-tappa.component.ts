import { Component, Inject, OnInit, PLATFORM_ID, ViewChild, ViewContainerRef } from '@angular/core';
import { ViaggiService } from '../../../servizi/viaggi.service';
import { catchError, concatMap, finalize, from, Observable, Observer, of } from 'rxjs';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

interface MarkerData {
  lat: number;
  lng: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-crea-tappa',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './crea-tappa.component.html',
  styleUrls: ['./crea-tappa.component.css']
})
export class CreaTappaComponent implements OnInit {
  trip: any; // Assumendo che ci sia un modo per inizializzare questo oggetto trip
  response: any;

  constructor(
    private viaggiService: ViaggiService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    this.trip = JSON.parse(sessionStorage.getItem('trip')!);
    console.log(this.trip);

    if (isPlatformBrowser(this.platformId) && this.isMapVisible) {
      this.loadLeaflet();
    }
  }

  createJourney(marker: MarkerData, tripId: number): Observable<any> {
    const journeyData = {
      tripId: tripId,
      destination: {
        latitude: marker.lat,
        longitude: marker.lng,
        name: marker.name,
      },
      description: marker.description
    };

    return this.viaggiService.createJourney(journeyData).pipe(
      catchError(error => {
        console.error('Journey creation failed', error);
        return of(null); //Continua anche se uno dei journey fallisce
      })
    );
  }

  createJourneysFromArray(): void {
    this.createTrip().pipe(
      concatMap(tripResponse => {
        if (tripResponse && tripResponse.tripId) {
          this.response = tripResponse;
          const tripId = tripResponse.tripId;

          return from(this.markers).pipe(
            concatMap(marker => this.createJourney(marker, tripId)),
            finalize(() => {
              console.log('All journeys have been processed');
              this.router.navigateByUrl("/area-riservata/i-miei-viaggi")
            })
          );
        } else {
          return of(null);
        }
      })
    ).subscribe(response => {
      if (response) {
        console.log('Journey created successfully', response);
      }
    });
  }

  createTrip(): Observable<any> {
    const trip = {
      userId: this.trip.userId,
      startDate: this.trip.startDate,
      endDate: this.trip.endDate,
      vehicle: this.trip.vehicle,
      type: this.trip.type,
      startDestination: {
        latitude: this.trip.startDestination.latitude,
        longitude: this.trip.startDestination.longitude,
        name: this.trip.startDestination.name
      },
      endDestination: {
        latitude: this.trip.endDestination.latitude,
        longitude: this.trip.endDestination.longitude,
        name: this.trip.endDestination.name
      },
      description: this.trip.description
    };

    return this.viaggiService.createTrip(trip);
  }

  createTrip$(){
    const trip = {
      userId: this.trip.userId,
      startDate: this.trip.startDate,
      endDate: this.trip.endDate,
      vehicle: this.trip.vehicle,
      type: this.trip.type,
      startDestination: {
        latitude: this.trip.startDestination.latitude,
        longitude: this.trip.startDestination.longitude,
        name: this.trip.startDestination.name
      },
      endDestination: {
        latitude: this.trip.endDestination.latitude,
        longitude: this.trip.endDestination.longitude,
        name: this.trip.endDestination.name
      },
      description: this.trip.description
    };

    const createTripObserver: Observer<any> = {
      next: response => {
        console.log('trip edited successfully', response);
        this.router.navigateByUrl('/area-riservata/i-miei-viaggi');
      },
      error: error => {
        console.error('trip edited failed', error);
      },
      complete: () => {
        console.log('trip edited request complete');
      }
    }

    this.viaggiService.createTrip(trip).subscribe(createTripObserver)
  }

  // Cose per la mappa
  map: any;
  markers: MarkerData[] = [];
  leafletMarkers: any[] = [];
  isMapVisible: boolean = false;

  @ViewChild('dynamicContainer', { read: ViewContainerRef }) container!: ViewContainerRef;

  private async loadLeaflet(): Promise<void> {
    const L = await import('leaflet');

    this.map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    (L.Icon.Default as any).mergeOptions({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png'
    });

    this.map.on('click', (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const name = prompt("Inserisci il nome del marker:") || "Marker senza nome";
      const description = prompt("Inserisci la descrizione del marker:") || "Nessuna descrizione";
      this.addMarker({ lat, lng, name, description });
    });
  }

  private addMarker(markerData: MarkerData): void {
    const L = window['L'];

    const marker = L.marker([markerData.lat, markerData.lng]).addTo(this.map);
    marker.bindPopup(`<b>${markerData.name}</b><br>Lat: ${markerData.lat}, Lng: ${markerData.lng}`).openPopup();
    marker.on('click', () => {
      if (confirm(`Vuoi rimuovere il marker "${markerData.name}"?`)) {
        this.removeMarker(markerData);
      }
    });

    this.markers.push(markerData);
    this.leafletMarkers.push(marker);
  }

  private removeMarker(markerData: MarkerData): void {
    const markerIndex = this.markers.findIndex(m => m.lat === markerData.lat && m.lng === markerData.lng);
    if (markerIndex !== -1) {
      this.map.removeLayer(this.leafletMarkers[markerIndex]);
      this.markers.splice(markerIndex, 1);
      this.leafletMarkers.splice(markerIndex, 1);
    }
  }

  toggleMap(): void {
    this.isMapVisible = !this.isMapVisible;
    if (this.isMapVisible) {
      setTimeout(() => {
        this.loadLeaflet();
      }, 0);
    } else {
      this.destroyMap();
    }
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
