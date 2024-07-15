import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../servizi/auth.service';
import { Observer } from 'rxjs';

@Component({
  selector: 'app-registrazione',
  standalone: true,
  imports: [FormsModule, ButtonModule, RouterModule],
  templateUrl: './registrazione.component.html',
  styleUrl: './registrazione.component.css'
})
export class RegistrazioneComponent {

  constructor(private authService: AuthService, private router: Router) {}

  onRegistration(form: NgForm){
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

    const registrationObserver: Observer<any> = {
      next: response => {
        console.log('registration successful', response);
        this.router.navigateByUrl('/login');
      },
      error: error => {
        console.error('registration failed', error);
      },
      complete: () => {
        console.log('registration request complete');
      }
    }

    this.authService.Registrazione(user).subscribe(registrationObserver)
    console.log(user);
  }
}
