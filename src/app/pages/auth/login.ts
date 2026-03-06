import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppConfigurator } from '@/layout/components/app.configurator';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { AuthService } from '../service/auth.service';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppConfigurator, InputIcon, IconField, MessageModule],
    template: `
        <app-configurator [simple]="true" />
        <div class="bg-surface-100 dark:bg-surface-950 h-screen w-screen flex items-center justify-center">
            <div class="bg-surface-0 dark:bg-surface-900 py-16 px-8 sm:px-16 shadow flex flex-col w-11/12 sm:w-[30rem]" style="border-radius: 14px">
                <img src="/layout/images/logo-dark.png" alt="Binlogic" class="mb-4" style="height: 72px; width: auto;" />
                <p class="text-muted-color mb-6 text-center">Welcome to the <strong>Binlogic Community</strong>, where the magic happens, sign in to continue.</p>

                <p-message *ngIf="errorMessage" severity="error" [text]="errorMessage" styleClass="mb-4 w-full"></p-message>
                <p-message *ngIf="successMessage" severity="success" [text]="successMessage" styleClass="mb-4 w-full"></p-message>

                <form (ngSubmit)="onLogin()">
                    <p-iconfield class="mb-6">
                        <p-inputicon class="pi pi-user" />
                        <input pInputText type="email" placeholder="Email" class="w-full" [(ngModel)]="email" name="email" required />
                    </p-iconfield>

                    <p-iconfield class="mb-6">
                        <p-inputicon class="pi pi-key" />
                        <input pInputText type="password" placeholder="Password" class="w-full" [(ngModel)]="password" name="password" required />
                    </p-iconfield>

                    <p-button type="submit" label="Sign In" styleClass="mb-6 w-full" [loading]="loading" [disabled]="loading"></p-button>

                    <div class="text-center mb-6">
                        <span class="text-muted-color">¿No tienes cuenta? </span>
                        <a routerLink="/auth/register" class="text-primary font-semibold">Regístrate aquí</a>
                    </div>
                </form>

            </div>
        </div>
    `
})
export class Login {
    email: string = '';
    password: string = '';
    loading: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';
    returnUrl: string = '/';

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        // Obtener URL de retorno si existe
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    async onLogin(): Promise<void> {
        // Validaciones básicas
        if (!this.email || !this.password) {
            this.errorMessage = 'Por favor ingresa email y contraseña';
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        try {
            const result = await this.authService.login(this.email, this.password);

            if (result.success) {
                this.successMessage = 'Inicio de sesión exitoso';
                setTimeout(() => {
                    this.router.navigate([this.returnUrl]);
                }, 500);
            } else {
                this.errorMessage = result.error || 'Error al iniciar sesión';
                this.loading = false;
            }
        } catch (error: any) {
            this.errorMessage = error.message || 'Error al iniciar sesión';
            this.loading = false;
        }
    }
}
