import { Component, Inject, OnInit, PLATFORM_ID, ViewChild, ViewContainerRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

interface MarkerData {
  lat: number;
  lng: number;
  name: string;
}

interface Trip {
  startDate: string;
  endDate: string;
  vehicle: string;
  type: string;
  startDestination:{
    latitude: number;
    longitude: number;
    name: string;
  };
  endDestination:{
    latitude: number;
    longitude: number;
    name: string;
  };
  description: string;
}

@Component({
  selector: 'app-mappa-prova',
  templateUrl: './mappa-prova.component.html',
  styleUrls: ['./mappa-prova.component.css'],
  standalone: true,
  imports: [CommonModule, ButtonModule]
})
export class MappaProvaComponent implements OnInit {
  private map: any;
  private startPoint: MarkerData | null = null;
  private endPoint: MarkerData | null = null;
  private startPointMarker: any = null;
  private endPointMarker: any = null;

  isMapVisible: boolean = false;

  @ViewChild('dynamicContainer', { read: ViewContainerRef }) container!: ViewContainerRef;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && this.isMapVisible) {
      this.loadLeaflet();
    }
  }

  private async loadLeaflet(): Promise<void> {
    const L = await import('leaflet');

    this.map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Imposta il percorso per le icone dei marker
    (L.Icon.Default as any).mergeOptions({
      iconRetinaUrl: 'C:\\Users\\marco\\OneDrive\\Desktop\\triphippie\\triphippie\\src\\assets\\leaflet\\marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png'
    });

    this.map.on('click', (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const name = prompt("Inserisci il nome del marker:") || "Marker senza nome";
      this.addMarker({ lat, lng, name });
    });
  }

  private addMarker(markerData: MarkerData): void {
    const L = window['L'];
    
    if (this.startPoint && this.endPoint) {
      alert('Puoi aggiungere solo due marker: Partenza ed Arrivo');
      return;
    }

    const marker = L.marker([markerData.lat, markerData.lng]).addTo(this.map);
    marker.bindPopup(`<b>${markerData.name}</b><br>Lat: ${markerData.lat}, Lng: ${markerData.lng}`).openPopup();
    marker.on('click', () => {
      if (confirm(`Vuoi rimuovere il marker "${markerData.name}"?`)) {
        this.removeMarker(markerData);
      }
    });

    if (!this.startPoint) {
      this.startPoint = markerData;
      this.startPointMarker = marker;
    } else {
      this.endPoint = markerData;
      this.endPointMarker = marker;
    }
  }

    removeMarker(markerData: MarkerData): void {
    if (this.startPoint && this.startPoint.lat === markerData.lat && this.startPoint.lng === markerData.lng) {
      if (this.startPointMarker) {
        this.map.removeLayer(this.startPointMarker);
      }
      this.startPoint = null;
      this.startPointMarker = null;
    } else if (this.endPoint && this.endPoint.lat === markerData.lat && this.endPoint.lng === markerData.lng) {
      if (this.endPointMarker) {
        this.map.removeLayer(this.endPointMarker);
      }
      this.endPoint = null;
      this.endPointMarker = null;
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

  createTravelData(): Trip
 | null {
    if (!this.startPoint || !this.endPoint) {
      alert('Devi selezionare sia un punto di inizio che un punto di fine.');
      return null;
    }

    const travelData: Trip
   = {
      startDate: '2024-07-12',
      endDate: '2024-07-18',
      vehicle: 'AUTO',
      type: 'CULTURALE',
      startDestination: {
        latitude: this.startPoint.lat,
        longitude: this.startPoint.lng,
        name: this.startPoint.name,
      },
      endDestination: {
        latitude: this.endPoint.lat,
        longitude: this.endPoint.lng,
        name: this.endPoint.name,
      },
      description: 'Viaggio per castelli a intervistare i fantasmi del luogo'
    };

    return travelData;
  }

  showTravelData(): void {
    const travelData = this.createTravelData();
    if (travelData) {
      console.log(travelData);
      alert(JSON.stringify(travelData, null, 2));
    }
  }
}
