import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../pages/service/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout">
      <header class="header">
        <div class="header-content">
          <h1 class="logo">Gestión de Productos</h1>
          <div class="user-section" *ngIf="authService.currentUser()">
            <span class="user-name">{{ authService.currentUser()?.name }}</span>
            <button class="btn btn-logout" (click)="logout()">Cerrar Sesión</button>
          </div>
        </div>
      </header>
      
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      background: linear-gradient(135deg, #e11d48 0%, #9f1239 100%);
      color: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-name {
      font-size: 0.95rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s;
    }

    .btn-logout {
      background: rgba(255,255,255,0.2);
      color: white;
    }

    .btn-logout:hover {
      background: rgba(255,255,255,0.3);
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }
  `]
})
export class MainLayoutComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  logout(): void {
    this.authService.logout();
  }
}
