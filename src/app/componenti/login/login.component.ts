import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../servizi/auth.service';
import { Observer } from 'rxjs';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ButtonModule, RouterModule, FloatLabelModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private authService: AuthService, private router: Router) {}

  loginFailed = false
  

  onLogin(form: NgForm){
      const user = {
        username: form.value.username,
        password: form.value.password
      };

      const loginObserver: Observer<any> = {
        next: response => {
          console.log('Login successful', response);
          this.router.navigateByUrl('/home');
        },
        error: error => {
          this.loginFailed= true;
          console.error('Login failed', error);
        },
        complete: () => {
          console.log('Login request complete');
        }
      }
    
    this.authService.Login(user).subscribe(loginObserver)
    console.log(user)
 }


}

