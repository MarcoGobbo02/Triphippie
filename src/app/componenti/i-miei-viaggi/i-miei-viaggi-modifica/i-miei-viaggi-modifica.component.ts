import { Component, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observer } from 'rxjs';
import { ViaggiService } from '../../../servizi/viaggi.service';

@Component({
  selector: 'app-i-miei-viaggi-modifica',
  standalone: true,
  imports: [ButtonModule, CommonModule, FormsModule],
  templateUrl: './i-miei-viaggi-modifica.component.html',
  styleUrl: './i-miei-viaggi-modifica.component.css'
})
export class IMieiViaggiModificaComponent implements OnInit{

  constructor(private router: Router, private viaggioService: ViaggiService){}

  trip: any

  ngOnInit(): void {
    this.trip = this.viaggioService.getTripData();
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
        latitude: 11.111111,
        longitude: 11.111111,
        name: form.value.startDestination
      },
      endDestination: {
        latitude: 11.111111,
        longitude: 11.111111,
        name: form.value.endDestination
      },
      description: form.value.description
    }
  
    const registrationObserver: Observer<any> = {
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
  
    this.viaggioService.editTripById(this.trip.id, trip).subscribe(registrationObserver)
    console.log(trip);
  }


}
