import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../servizi/auth.service';

@Component({
  selector: 'app-area-riservata',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule, ConfirmDialogModule, ToastModule],
  templateUrl: './area-riservata.component.html',
  styleUrl: './area-riservata.component.css'
})
export class AreaRiservataComponent {

  constructor(private authservice: AuthService, private router: Router){}

  logout(event: Event){
  event.preventDefault();
  this.authservice.logout();
  sessionStorage.clear;
  this.router.navigateByUrl("/login")
  }

}
