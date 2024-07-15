import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../servizi/auth.service';

@Component({
  selector: 'app-menu-header',
  standalone: true,
  imports: [CommonModule, MenubarModule, RouterModule],
  templateUrl: './menu-header.component.html',
  styleUrl: './menu-header.component.css'
})
export class MenuHeaderComponent {

  isLoggedIn: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
    });
  }
}
