import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ViaggiService } from '../../../servizi/viaggi.service';

@Component({
  selector: 'app-crea-tappa',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, CommonModule],
  templateUrl: './crea-tappa.component.html',
  styleUrl: './crea-tappa.component.css'
})
export class CreaTappaComponent implements OnInit {
  journeyForms: FormGroup[] = []; // Array per memorizzare i form di journey
  journeys: any[] = []; // Array per memorizzare i journey da creare

  constructor(private fb: FormBuilder, private viaggiService: ViaggiService) {}

  ngOnInit() {

      this.addJourneyForm();
  }

  addJourneyForm() {
    const form = this.fb.group({
      destinationName: ['', Validators.required],
      description: ['', Validators.required]
    });
    this.journeyForms.push(form);
  }

  removeJourneyForm(index: number) {
    this.journeyForms.splice(index, 1);
  }
  
  onSubmit(index: number) {
    if (this.journeyForms[index].valid) {
      const destinationName = this.journeyForms[index].value.destinationName;
      const description = this.journeyForms[index].value.description;

      // Costruisci l'oggetto journey con i dati ottenuti dal form
      const journey = {
        tripId: 1, // Esempio di tripId, sostituisci con il valore appropriato
        stepNumber: 1, // Esempio di stepNumber, sostituisci con il valore appropriato
        destination: {
          name: destinationName,
          latitude: 0, // Inserisci latitudine appropriata
          longitude: 0 // Inserisci longitudine appropriata
        },
        description: description
      };

      // Aggiungi il journey all'array di journeys da creare
      this.journeys.push(journey);

      // Resetta il form dopo l'inserimento
      this.journeyForms[index].reset();
    }
  }

  createJourneysFromArray() {
    if (this.journeys.length > 0) {
      for (let journey of this.journeys) {
        this.viaggiService.createJourney(journey).subscribe(
          (response) => {
            console.log('Journey creato con successo:', response);
            // Puoi aggiungere qui la gestione per aggiornare l'interfaccia utente o fare altre operazioni
          },
          (error) => {
            console.error('Errore durante la creazione del journey:', error);
            // Gestisci l'errore in modo appropriato
          }
        );
      }
      this.journeys = []; // Resetta l'array di journeys dopo l'inserimento
    } else {
      console.warn('Nessun journey da creare.');
    }
  }


}
