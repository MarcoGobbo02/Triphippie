import { Component, OnInit } from '@angular/core';
import { ProfiloService } from '../../servizi/profilo.service';
import { ViaggiService } from '../../servizi/viaggi.service';
import { Observer } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

interface Trip {
  id: number;
  userId: string;
  startDate: string;
  endDate: string;
  vehicle: string;
  type: string;
  startDestination: {
    latitude: number
    longitude: number
    name: number
  };
  endDestination: {
    latitude: number
    longitude: number
    name: number
  }
  description: string;
}

@Component({
  selector: 'app-i-miei-viaggi',
  standalone: true,
  imports: [CommonModule, ButtonModule,],
  templateUrl: './i-miei-viaggi.component.html',
  styleUrl: './i-miei-viaggi.component.css'
})
export class IMieiViaggiComponent implements OnInit {

  constructor(private profiloService:ProfiloService,
              private viaggiservice: ViaggiService,
              private router:Router){}
  
  trips: Trip[] = [];
  tokenKey: any; 
  token: any;
  userId: any;
  isEmpty=true;
  numero!: number;

  filters = {
    tripsSize: 10,
    page: 0
  };

  ngOnInit(): void {
    this.tokenKey = 'Bearer Token'
    this.token = localStorage.getItem(this.tokenKey)!;
    this.userId = this.profiloService.getIdFromToken(this.token)!;

    const tripObserver: Observer<any[]> = {
      next: response => {
        console.log(response)
        this.trips = response.filter(trip => trip.userId == this.userId); 
        console.log('Filtered trips:', this.trips);
        if(this.trips.length > 0){
          this.isEmpty=false;
        }
      },
      error: error => {
        console.error('Failed to fetch trips', error);
      },
      complete: () => {
        console.log('Trip fetch complete');
      }
    };

    this.viaggiservice.getAllTrips(this.filters.tripsSize).subscribe(tripObserver)
    console.log(this.trips)

    this.viaggiservice.getNumberTrips().subscribe({
      next: (data: any) => {
        console.log("Raw data:", data);
        this.numero = Number(data);
        console.log("Numero viaggi:", this.numero);
      },
      error: (err) => console.error('Errore:', err)
    });
  }

  refreshPage(): void {
    this.router.navigate([this.router.url])
      .then(() => {
        window.location.reload();
      });
  }

  deleteTrip(trip: any){

    const deleteTripObserver: Observer<any> = {
      next: response => {
        console.log('registration successful', response);
        this.refreshPage();
      },
      error: error => {
        console.error('registration failed', error);
      },
      complete: () => {
        console.log('registration request complete');
      }
    }

    this.viaggiservice.deleteTripById(trip.id).subscribe(deleteTripObserver)
  }

  editTrip(trip: any){
    sessionStorage.clear(); 
    let stringtrip = JSON.stringify(trip);
    sessionStorage.setItem('trip', stringtrip);
    this.router.navigateByUrl('/area-riservata/modifica-viaggio');
  }
}
