import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { AuthService } from './servizi/auth.service';
import { CommonModule } from '@angular/common';
import { MenuHeaderComponent } from './componenti/utilities/menu-header/menu-header.component';



@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [RouterOutlet, CommonModule, MenuHeaderComponent]
})
export class AppComponent {
  
  constructor(private primengConfig: PrimeNGConfig, private authservice: AuthService) {}


  
  
}
