import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule} from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observer } from 'rxjs';
import { ViaggiService } from '../../../servizi/viaggi.service';

interface MarkerData {
  lat: number;
  lng: number;
  name: string;
}

@Component({
  selector: 'app-i-miei-viaggi-modifica',
  standalone: true,
  imports: [ButtonModule, CommonModule, FormsModule],
  templateUrl: './i-miei-viaggi-modifica.component.html',
  styleUrl: './i-miei-viaggi-modifica.component.css'
})
export class IMieiViaggiModificaComponent implements OnInit{

  constructor(private router: Router, private viaggioService: ViaggiService){}

  tripstring = sessionStorage.getItem('trip')
  trip: any
  map: any;
startPoint: MarkerData | null = null;
endPoint: MarkerData | null = null;
startPointMarker: any = null;
endPointMarker: any = null;

  ngOnInit(): void {
    if(this.tripstring !== null){
      this.trip = JSON.parse(this.tripstring)
    }
    console.log(this.trip)
  }

  editTrip(form: NgForm){

    const trip = {
      userId: this.trip.userId,
      startDate: form.value.startDate ,
      endDate: form.value.endDate,
      vehicle: form.value.vehicle,
      type: form.value.type,
      startDestination: {
        latitude: this.startPoint ? this.startPoint.lat : this.trip.startDestination.latitude,
        longitude: this.startPoint ? this.startPoint.lng : this.trip.startDestination.longitude,
        name: this.startPoint ? this.startPoint.name : this.trip.startDestination.name
      },
      endDestination: {
        latitude: this.endPoint ? this.endPoint.lat : this.trip.endDestination.latitude,
        longitude: this.endPoint ? this.endPoint.lng : this.trip.endDestination.longitude,
        name: this.endPoint ? this.endPoint.name : this.trip.endDestination.name
      },
      description: form.value.description
    }
  
    const editTripObserver: Observer<any> = {
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
  
    this.viaggioService.editTripById(this.trip.id, trip).subscribe(editTripObserver)
    console.log(trip);
  }

  editjourneys(tripId: any){
    this.viaggioService.setTripData(tripId)
     this.router.navigateByUrl("/area-riservata/modifica-tappe")
  }


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
