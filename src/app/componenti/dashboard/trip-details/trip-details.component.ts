import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgForm } from '@angular/forms';
import { isEmpty, Observer } from 'rxjs';
import { Router } from '@angular/router';
import { ViaggiService } from '../../../servizi/viaggi.service';

@Component({
  selector: 'app-trip-details',
  standalone: true,
  imports: [ButtonModule, FormsModule, CommonModule],
  templateUrl: './trip-details.component.html',
  styleUrl: './trip-details.component.css'
})
export class TripDetailsComponent implements OnInit {

  constructor(private router:Router, private viaggioService:ViaggiService){}
  
  showForm = false;
  journeys: any
  tripstring = sessionStorage.getItem('trip')
  isEmpty=true
  trip: any

  ngOnInit(): void {
    if(this.tripstring !== null){
      this.trip = JSON.parse(this.tripstring)
    }
    
    console.log(this.trip)
    this.viaggioService.getAllJourneysByTripId(this.trip.id).subscribe((data) => {
      this.journeys = data
      if(this.journeys.length > 0){
        this.isEmpty = false;
      }

    })
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  onCreate(form: NgForm){
    const journey = {
        tripId:this.trip.id,
        stepNumber: 1,
        destination: {
          latitude: 11.111111,
          longitude: 11.111111,
          name: form.value.destination,
        },
        description: form.value.description
      }
    
    const createTripObserver: Observer<any> = {
      next: response => {
        console.log('trip added successfully', response);
        this.ngOnInit()
      },
      error: error => {
        console.error('trip add failed', error);
      },
      complete: () => {
        console.log('trip add request complete');
      }
    }
  
    this.viaggioService.createJourney(journey).subscribe(createTripObserver)
    console.log(journey);
  }


}
