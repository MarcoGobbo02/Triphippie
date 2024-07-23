import { Component, Inject, OnInit, PLATFORM_ID, ViewChild, ViewContainerRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ViaggiService } from '../../../servizi/viaggi.service';
import { Router } from '@angular/router';
import { Observable, Observer } from 'rxjs';

interface MarkerData {
  lat: number;
  lng: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-modifica-tappe',
  standalone: true,
  imports: [ButtonModule, FormsModule, CommonModule],
  templateUrl: './modifica-tappe.component.html',
  styleUrl: './modifica-tappe.component.css'
})
export class ModificaTappeComponent implements OnInit {

  constructor(private viaggiService: ViaggiService, private router: Router, @Inject(PLATFORM_ID) private platformId: object) { }
  journeys: any;
  showForm: boolean = false;
  tripstring = sessionStorage.getItem('trip');
  trip: any;
  isEmpty = true;
  currentJourney: any

  refreshPage() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  ngOnInit(): void {
    if (this.tripstring !== null) {
      this.trip = JSON.parse(this.tripstring);
      this.isEmpty = false;
    }
    console.log(this.trip);

    this.viaggiService.getAllJourneysByTripId(this.trip.id).subscribe((data) => {
      this.journeys = data;
    });

    if (isPlatformBrowser(this.platformId) && this.isMapVisible) {
      this.loadLeaflet();
    }
  }

  editJourney(journeyId: number) {
    if (!this.newMarker) {
      alert('Devi selezionare un marker sulla mappa per modificare la tappa.');
      return;
    }

    const journey = {
      tripId: this.trip.id,
      destination: {
        latitude: this.newMarker!.lat,
        longitude: this.newMarker!.lng,
        name: this.newMarker!.name
      },
      description: this.newMarker!.description
    };

    const editjourneyObserver: Observer<any> = {
      next: response => {
        console.log('edit successful', response);
        this.refreshPage();
      },
      error: error => {
        console.error('edit failed', error);
      },
      complete: () => {
        console.log('edit request complete');
      }
    };

    this.viaggiService.editJourneyById(journeyId, journey).subscribe(editjourneyObserver);
  }

  deleteJourney(journey: any) {
    this.viaggiService.deleteJourneyById(journey.id).subscribe(
      () => {
        console.log(`Journey with ID ${journey.id} deleted successfully`);
        this.refreshPage();
      },
      (error) => {
        console.error('Error deleting journey', error);
      }
    );
  }

  addJourney(): void {
   if (!this.newMarker) {
      alert('Devi selezionare un marker sulla mappa per creare la tappa.');
      return;
  }

    const journey = {
      tripId: this.trip.id,
      destination: {
        latitude: this.newMarker!.lat,
        longitude: this.newMarker!.lng,
        name: this.newMarker!.name
      },
      description: this.newMarker!.description
    };

    const addJourneyObserver: Observer<any> = {
      next: response => {
        console.log('create successful', response);
        this.refreshPage();
      },
      error: error => {
        console.error('create failed', error);
      },
      complete: () => {
        console.log('create request complete');
      }
    };

    this.viaggiService.createJourney(journey).subscribe(addJourneyObserver);
  }

  // Map-related properties and methods
  map: any;
  newMarker: MarkerData | null = null;
  isMapVisible: boolean = false;
  isEditing: boolean = false; 

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

    if (this.newMarker) {
      alert('Puoi aggiungere solo una tappa alla volta!');
      return;
    }

    const marker = L.marker([markerData.lat, markerData.lng]).addTo(this.map);
    marker.bindPopup(`<b>${markerData.name}</b><br>Lat: ${markerData.lat}, Lng: ${markerData.lng}`).openPopup();
    marker.on('click', () => {
      if (confirm(`Vuoi rimuovere il marker "${markerData.name}"?`)) {
        this.removeMarker(markerData);
      }
    });

    this.newMarker = markerData;
  }

  private removeMarker(markerData: MarkerData): void {
    if (this.map && this.newMarker && this.newMarker.lat === markerData.lat && this.newMarker.lng === markerData.lng) {
      const L = window['L'];
      const marker = this.map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker && layer.getLatLng().lat === markerData.lat && layer.getLatLng().lng === markerData.lng) {
          this.map.removeLayer(layer);
        }
      });
      this.newMarker = null;
    }
  }

  toggleMap(journey?: any): void {
    this.isMapVisible = !this.isMapVisible;
    if (this.isMapVisible) {
      if(journey){
        this.isEditing=true
        this.currentJourney = journey
      }
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
      this.newMarker=null;
      this.isEditing=false
    }
  }
}
