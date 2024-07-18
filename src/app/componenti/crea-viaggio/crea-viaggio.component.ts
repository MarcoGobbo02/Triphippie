import { Component, OnInit } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule, NgForm } from '@angular/forms';
import { ViaggiService } from '../../servizi/viaggi.service';
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

addJourneys(form: NgForm){
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

 sessionStorage.clear(); 
 let stringtrip = JSON.stringify(trip);
 sessionStorage.setItem('trip', stringtrip);
 console.log(trip)
 this.router.navigateByUrl("/area-riservata/crea-tappa");
}

}
