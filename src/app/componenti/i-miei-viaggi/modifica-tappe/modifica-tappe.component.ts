import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ViaggiService } from '../../../servizi/viaggi.service';
import { Router } from '@angular/router';
import { Observable, Observer } from 'rxjs';

@Component({
  selector: 'app-modifica-tappe',
  standalone: true,
  imports: [ButtonModule, FormsModule, CommonModule],
  templateUrl: './modifica-tappe.component.html',
  styleUrl: './modifica-tappe.component.css'
})
export class ModificaTappeComponent implements OnInit{

  constructor(private viaggiService:ViaggiService, private router:Router){}
  journeys:any
  showForm: boolean = false;
  tripstring = sessionStorage.getItem('trip')
  trip: any
  isEmpty = true

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  refreshPage() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  ngOnInit(): void {
    if(this.tripstring !== null){
      this.trip = JSON.parse(this.tripstring)
      this.isEmpty=false
    }
    console.log(this.trip)

    this.viaggiService.getAllJourneysByTripId(this.trip.id).subscribe((data) => {
      this.journeys = data
    })
  }

  editJourney(form: NgForm, journey: any){

    const journey$ = {
      tripId: this.trip.id,
      stepNumber: 1,
      destination: { 
        name: form.value.destination,
        latitude: 11.11111, 
        longitude: 11.1111 
      },
      description: form.value.description
    }

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
    }

    this.viaggiService.editJourneyById(journey.id, journey$).subscribe(editjourneyObserver)

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

  addJourney(form: NgForm): void {
    const journey = {
      tripId: this.trip.id,
      destination: {
        latitude: 11.111111,
        longitude: 11.111111,
        name: form.value.destination,
      },
      description: form.value.description
    }

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
    }

    this.viaggiService.createJourney(journey).subscribe(addJourneyObserver)
  }
}
