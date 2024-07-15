import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ViaggiService } from '../../../servizi/viaggi.service';
import { Router } from '@angular/router';
import { Observer } from 'rxjs';

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
  tripId: any

  ngOnInit(): void {
    this.tripId = this.viaggiService.getTripData()
    console.log(this.tripId)
    this.viaggiService.getAllJourneysByTripId(this.tripId).subscribe((data) => {
      this.journeys = data
    })
  }

  editJourney(form: NgForm, journey: any){

    const journey$ = {
      tripId: this.tripId,
      stepNumber: 1,
      destination: { 
        name: form.value.destination,
        latitude: 11.11111, 
        longitude: 11.1111 
      },
      description: form.value.description
    }

    const editUserObserver: Observer<any> = {
      next: response => {
        console.log('edit successful', response);
        this.router.navigateByUrl('/area-riservata/i-miei-viaggi');
      },
      error: error => {
        console.error('edit failed', error);
      },
      complete: () => {
        console.log('edit request complete');
      }
    }

    this.viaggiService.editJourneyById(journey.id, journey$).subscribe(editUserObserver)

  }

  deleteJourney(journey: any) {
    this.viaggiService.deleteJourneyById(journey.id).subscribe(
      () => {
        console.log(`Journey with ID ${journey.id} deleted successfully`);
        this.router.navigateByUrl('/area-riservata/i-miei-viaggi');
      },
      (error) => {
        console.error('Error deleting journey', error);
      }
    );
  }


}
