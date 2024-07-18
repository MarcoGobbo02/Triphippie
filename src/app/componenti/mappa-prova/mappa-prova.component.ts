import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface MarkerData {
  lat: number;
  lng: number;
  name: string;
  marker?: any; // aggiungere una proprietà per il marker
}

@Component({
  selector: 'app-mappa-prova',
  templateUrl: './mappa-prova.component.html',
  styleUrls: ['./mappa-prova.component.css']
})
export class MappaProvaComponent implements OnInit {
  private map: any;
  private markers: MarkerData[] = []; // Array per memorizzare i marker

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadLeaflet();
    }
  }

  private async loadLeaflet(): Promise<void> {
    const L = await import('leaflet');

    this.map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Configura il percorso predefinito delle icone di Leaflet
    (L.Icon.Default as any).mergeOptions({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png'
    });

    // Ascolta l'evento di click sulla mappa
    this.map.on('click', (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const name = prompt("Inserisci il nome del marker:") || "Marker senza nome";
      this.addMarker({ lat, lng, name });
    });
  }

  private addMarker(markerData: MarkerData): void {
    const L = window['L'];

    const marker = L.marker([markerData.lat, markerData.lng]).addTo(this.map);
    marker.bindPopup(`<b>${markerData.name}</b><br>Lat: ${markerData.lat}, Lng: ${markerData.lng}`).openPopup();

    // Aggiungi il marker all'array e imposta il listener per la rimozione
    marker.on('click', () => {
      if (confirm(`Vuoi rimuovere il marker "${markerData.name}"?`)) {
        this.removeMarker(markerData);
      }
    });

    // Memorizza il marker nell'array
    markerData.marker = marker;
    this.markers.push(markerData);
  }

  private removeMarker(markerData: MarkerData): void {
    // Rimuovi il marker dalla mappa
    this.map.removeLayer(markerData.marker);

    // Rimuovi il marker dall'array
    this.markers = this.markers.filter(m => m !== markerData);
  }
}
