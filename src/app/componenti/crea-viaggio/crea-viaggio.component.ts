import { Component, OnInit } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule, NgForm } from '@angular/forms';
import { ViaggiService } from '../../servizi/viaggi.service';
import { Observer } from 'rxjs';
import { Router } from '@angular/router';
import { ProfiloService } from '../../servizi/profilo.service';

@Component({
  selector: 'app-crea-viaggio',
  standalone: true,
  imports: [CalendarModule, FormsModule],
  templateUrl: './crea-viaggio.component.html',
  styleUrl: './crea-viaggio.component.css'
})
export class CreaViaggioComponent implements OnInit{

constructor(private viaggioservice: ViaggiService, private router: Router, private profileService: ProfiloService){}
tokenKey: any
token: any
userId: any


ngOnInit(): void {
  this.tokenKey = 'Bearer Token'
  this.token = localStorage.getItem(this.tokenKey)!;
  this.userId = this.profileService.getIdFromToken(this.token)!
}

refreshPage(): void {
  this.router.navigate([this.router.url])
    .then(() => {
      window.location.reload();
    });
}

onCreate(form: NgForm){
  const trip = {
      userId: this.userId,
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
  
  const createTripObserver: Observer<any> = {
    next: response => {
      console.log('trip added successfully', response);
      this.refreshPage();
    },
    error: error => {
      console.error('trip add failed', error);
    },
    complete: () => {
      console.log('trip add request complete');
    }
  }

  this.viaggioservice.createTrip(trip).subscribe(createTripObserver)
  console.log(trip);

}

}
