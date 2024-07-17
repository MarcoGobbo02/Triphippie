import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ViaggiService } from '../../servizi/viaggi.service';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule} from 'primeng/paginator';
import { Observer } from 'rxjs';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';


interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

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
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, CalendarModule, InputNumberModule, PaginatorModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  constructor(private viaggiservice:ViaggiService, private router:Router){}

  trips: Trip[] = [];
  totalTrips = 0

  startDate: string = '';
  endDate: string = '';
  isEmpty = true;

  applicaFiltri(form: NgForm) {
    this.filters.startDate = form.value.startDate
    this.filters.endDate = form.value.endDate
    console.log(this.filters)
    
    if(this.filters.startDate!=undefined && this.filters.startDate!="" || this.filters.startDate && this.filters.startDate!=""){
      this.getFilteredTrips()
    }
  }

  filters = {
    startDate: undefined,
    endDate: undefined,
    tripsSize: 10,
    page: 0
  }

  ngOnInit(): void {
    const tripObserver: Observer<any[]> = {
      next: (response:any) => {
        console.log(response)
        this.totalTrips = Number(response)
        console.log('Tutti i viaggi', this.totalTrips);
        if(this.totalTrips > 0){
          this.isEmpty=false;
        }else{
          this.isEmpty=true
        }
      },
      error: error => {
        console.error('Tutti i viaggi', error);
      },
      complete: () => {
        console.log('Tutti i viaggi complete');
      }
    };
  
    this.viaggiservice.getNumberTrips().subscribe(tripObserver)
    this.getFilteredTrips()
  }

  travelDetails(trip: any){
   sessionStorage.clear(); 
   let stringtrip = JSON.stringify(trip);
   sessionStorage.setItem('trip', stringtrip);
   this.router.navigateByUrl("/trip-details");
  }

  getFilteredTrips(): void {
    const tripObserver: Observer<any[]> = {
      next: response => {
        console.log(response)
        this.trips = response
        console.log('Filtered trips:', this.trips);
        if(this.trips.length <= 0){
          this.isEmpty=true;
        }else{
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

    this.viaggiservice.getFilteredTrip(this.filters).subscribe(tripObserver)
  }

  onPageChange(event: PageEvent) {
    this.filters.page = event.first/10;
    this.filters.tripsSize = event.rows;
    this.getFilteredTrips();
  }

}
