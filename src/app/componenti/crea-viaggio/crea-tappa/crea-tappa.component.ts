import { Component, OnInit } from '@angular/core';
import { FormBuilder} from '@angular/forms';
import { ViaggiService } from '../../../servizi/viaggi.service';
import { catchError, concatMap, finalize, from, Observable, of} from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crea-tappa',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './crea-tappa.component.html',
  styleUrls: ['./crea-tappa.component.css']
})
export class CreaTappaComponent implements OnInit {
  journeyForms: any[] = [];
  trip: any; // Assumendo che ci sia un modo per inizializzare questo oggetto trip
  response: any
  
  constructor(private fb: FormBuilder, private viaggiService: ViaggiService, private router:Router) { }

  ngOnInit() {
    // Esempio di inizializzazione del trip, sostituire con la logica effettiva per ottenere il trip
    this.trip = JSON.parse(sessionStorage.getItem('trip')!);
    console.log(this.trip)
    this.addJourneyForm();  // Aggiungi un form iniziale al caricamento
  }

  addJourneyForm() {
    this.journeyForms.push({
      destinationName: '',
      description: ''
    });
  }

  removeJourneyForm(index: number) {
    this.journeyForms.splice(index, 1);
  }

  createJourney(journey: any, tripId: number): Observable<any> {
    const journeyData = {
      tripId: tripId,
      destination: {
        latitude: 11.111111,
        longitude: 11.111111,
        name: journey.destinationName,
      },
      description: journey.description
    };

    return this.viaggiService.createJourney(journeyData).pipe(
      catchError(error => {
        console.error('Journey creation failed', error);
        return of(null); // Continua anche se uno dei journey fallisce
      })
    );
  }

  createTrip(): Observable<any> {
    const trip = {
      userId: this.trip.userId,
      startDate: this.trip.startDate,
      endDate: this.trip.endDate,
      vehicle: this.trip.vehicle,
      type: this.trip.type,
      startDestination: {
        latitude: 11.111111,
        longitude: 11.111111,
        name: this.trip.startDestination.name
      },
      endDestination: {
        latitude: 11.111111,
        longitude: 11.111111,
        name: this.trip.endDestination.name
      },
      description: this.trip.description
    };

    return this.viaggiService.createTrip(trip).pipe(
      catchError(error => {
        console.error('Trip creation failed', error);
        return of(null);
      })
    );
  }

  createJourneysFromArray() {
    this.createTrip().pipe(
      concatMap(tripResponse => {
        if (tripResponse && tripResponse.tripId) {
          this.response = tripResponse;
          const tripId = tripResponse.tripId;

          return from(this.journeyForms).pipe(
            concatMap(journey => this.createJourney(journey, tripId)),
            finalize(() => {
              console.log('All journeys have been processed');
            })
          );
        } else {
          return of(null);
        }
      })
    ).subscribe(response => {
      if (response) {
        console.log('Journey created successfully', response);
      }
    });
  }
}
