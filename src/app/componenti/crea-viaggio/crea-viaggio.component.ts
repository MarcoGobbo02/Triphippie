import { Component, Inject, OnInit, PLATFORM_ID, ViewChild, ViewContainerRef } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule, NgForm } from '@angular/forms';
import { ViaggiService } from '../../servizi/viaggi.service';
import { Router } from '@angular/router';
import { ProfiloService } from '../../servizi/profilo.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ButtonModule } from 'primeng/button';

interface MarkerData {
  lat: number;
  lng: number;
  name: string;
}

@Component({
  selector: 'app-crea-viaggio',
  standalone: true,
  imports: [CalendarModule, FormsModule, CommonModule, ButtonModule],
  templateUrl: './crea-viaggio.component.html',
  styleUrl: './crea-viaggio.component.css'
})
export class CreaViaggioComponent implements OnInit{

constructor(private viaggioservice: ViaggiService, private router: Router, private profileService: ProfiloService, @Inject(PLATFORM_ID) private platformId: object){}
tokenKey: any
token: any
userId: any

ngOnInit(): void {
  this.tokenKey = 'Bearer Token'
  this.token = localStorage.getItem(this.tokenKey)!;
  this.userId = this.profileService.getIdFromToken(this.token)!

  if (isPlatformBrowser(this.platformId) && this.isMapVisible) {
    this.loadLeaflet();
  }
}

addJourneys(form: NgForm): void|null{
  if (!this.startPoint || !this.endPoint) {
    alert('Devi selezionare sia un punto di inizio che un punto di fine.');
    return null;
  }

  const trip = {
    userId: this.userId,
    startDate: form.value.startDate ,
    endDate: form.value.endDate,
    vehicle: form.value.vehicle,
    type: form.value.type,
    startDestination: {
      latitude: this.startPoint.lat,
      longitude: this.startPoint.lng,
      name: this.startPoint.name
    },
    endDestination: {
      latitude: this.endPoint.lat,
      longitude: this.endPoint.lng,
      name: this.endPoint.name
    },
    description: form.value.description
  }

 sessionStorage.clear(); 
 let stringtrip = JSON.stringify(trip);
 sessionStorage.setItem('trip', stringtrip);
 console.log(trip)
 this.router.navigateByUrl("/area-riservata/crea-tappa");
}


//cose per la mappa
map: any;
startPoint: MarkerData | null = null;
endPoint: MarkerData | null = null;
startPointMarker: any = null;
endPointMarker: any = null;

isMapVisible: boolean = false;

@ViewChild('dynamicContainer', { read: ViewContainerRef }) container!: ViewContainerRef;

async loadLeaflet(): Promise<void> {
  const L = await import('leaflet');

  this.map = L.map('map').setView([51.505, -0.09], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(this.map);

  (L.Icon.Default as any).mergeOptions({
    iconRetinaUrl: 'marker-icon-2x.png',
    iconUrl: 'marker-icon.png',
    shadowUrl: 'marker-shadow.png'
  });

  this.map.on('click', (e: any) => {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    const name = prompt("Inserisci il nome del marker:") || "Marker senza nome";
    this.addMarker({ lat, lng, name });
  });
}

addMarker(markerData: MarkerData): void {
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

destroyMap(): void {
  if (this.map) {
    this.map.remove();
    this.map = null;
  }
}

}
