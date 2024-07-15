import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { ProfiloService } from '../../../servizi/profilo.service';
import { Observer } from 'rxjs';

@Component({
  selector: 'app-profilo-modifica',
  standalone: true,
  imports: [FormsModule,RouterModule,ButtonModule],
  templateUrl: './profilo-modifica.component.html',
  styleUrl: './profilo-modifica.component.css'
})
export class ProfiloModificaComponent {
  tokenKey: any;
  token: any;
  UserId: any;
  utente: any

  constructor(private router:Router, private profileService: ProfiloService){}

  ngOnInit(): void {
    this.tokenKey = 'Bearer Token'
    this.token = localStorage.getItem(this.tokenKey)!;
    this.UserId = this.profileService.getIdFromToken(this.token)!;

    this.profileService.getUser(this.UserId)
    .subscribe((data) =>{
      this.utente = data
      console.log(this.utente) 
    })  
  }
  
  onEdit(form: NgForm){
    const user = {
      username: form.value.username,
      password: form.value.password,
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      dateOfBirth: form.value.dateOfBirth,
      email: form.value.email,
      about: form.value.about,
      city: form.value.city
    }

    const editUserObserver: Observer<any> = {
      next: response => {
        console.log('edit successful', response);
        this.router.navigateByUrl('/area-riservata/profilo');
      },
      error: error => {
        console.error('edit failed', error);
      },
      complete: () => {
        console.log('edit request complete');
      }
    }

    this.profileService.editUser(this.UserId, user).subscribe(editUserObserver)
  }

}
