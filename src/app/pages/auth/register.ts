import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
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
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        FormsModule,
        RouterModule,
        RippleModule,
        AppConfigurator,
        InputIcon,
        IconField,
        MessageModule
    ],
    template: `
        <app-configurator [simple]="true" />
        <div class="bg-surface-100 dark:bg-surface-950 h-screen w-screen flex items-center justify-center">
            <div class="bg-surface-0 dark:bg-surface-900 py-16 px-8 sm:px-16 shadow flex flex-col w-11/12 sm:w-[30rem]" style="border-radius: 14px">
                <h1 class="font-bold text-2xl mt-0 mb-2">BINLOGIC</h1>
                <p class="text-muted-color mb-6">Crea tu cuenta en <strong>Binlogic</strong> para comenzar</p>

                <p-message *ngIf="errorMessage" severity="error" [text]="errorMessage" styleClass="mb-4 w-full"></p-message>
                <p-message *ngIf="successMessage" severity="success" [text]="successMessage" styleClass="mb-4 w-full"></p-message>

                <form (ngSubmit)="onRegister()" *ngIf="!registrationSuccess">
                    <p-iconfield class="mb-6">
                        <p-inputicon class="pi pi-user" />
                        <input 
                            pInputText 
                            type="text" 
                            placeholder="Nombre" 
                            class="w-full" 
                            [(ngModel)]="name" 
                            name="name" 
                            required 
                        />
                    </p-iconfield>

                    <p-iconfield class="mb-6">
                        <p-inputicon class="pi pi-envelope" />
                        <input 
                            pInputText 
                            type="email" 
                            placeholder="Email" 
                            class="w-full" 
                            [(ngModel)]="email" 
                            name="email" 
                            required 
                        />
                    </p-iconfield>

                    <p-iconfield class="mb-6">
                        <p-inputicon class="pi pi-key" />
                        <input 
                            pInputText 
                            type="password" 
                            placeholder="Contraseña (mínimo 6 caracteres)" 
                            class="w-full" 
                            [(ngModel)]="password" 
                            name="password" 
                            required 
                        />
                    </p-iconfield>

                    <p-iconfield class="mb-6">
                        <p-inputicon class="pi pi-key" />
                        <input 
                            pInputText 
                            type="password" 
                            placeholder="Confirmar contraseña" 
                            class="w-full" 
                            [(ngModel)]="confirmPassword" 
                            name="confirmPassword" 
                            required 
                        />
                    </p-iconfield>

                    <p-button 
                        type="submit" 
                        label="Registrarse" 
                        styleClass="mb-4 w-full" 
                        [loading]="loading"
                        [disabled]="loading">
                    </p-button>

                    <div class="text-center">
                        <span class="text-muted-color">¿Ya tienes cuenta? </span>
                        <a routerLink="/auth/login" class="text-primary font-semibold">Inicia sesión</a>
                    </div>
                </form>

                <div *ngIf="registrationSuccess" class="text-center">
                    <i class="pi pi-check-circle text-6xl text-green-500 mb-4"></i>
                    <h3 class="font-bold text-xl mb-2">¡Registro exitoso!</h3>
                    <p class="text-muted-color mb-4">
                        Hemos enviado un email de confirmación a <strong>{{ email }}</strong>
                    </p>
                    <p class="text-muted-color mb-6">
                        Por favor, revisa tu correo y confirma tu cuenta antes de iniciar sesión.
                    </p>
                    <p-button 
                        label="Ir al login" 
                        routerLink="/auth/login"
                        styleClass="w-full">
                    </p-button>
                </div>
            </div>
        </div>
    `
})
export class Register {
    name: string = '';
    email: string = '';
    password: string = '';
    confirmPassword: string = '';
    loading: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';
    registrationSuccess: boolean = false;

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    async onRegister(): Promise<void> {
        // Validaciones
        if (!this.name || !this.email || !this.password || !this.confirmPassword) {
            this.errorMessage = 'Por favor completa todos los campos';
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.errorMessage = 'Las contraseñas no coinciden';
            return;
        }

        if (this.password.length < 6) {
            this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        try {
            const result = await this.authService.signUp(this.email, this.password, this.name);

            if (result.success) {
                this.registrationSuccess = true;
                this.successMessage = 'Registro exitoso. Revisa tu email para confirmar tu cuenta.';
            } else {
                this.errorMessage = result.error || 'Error al registrar usuario';
                this.loading = false;
            }
        } catch (error: any) {
            this.errorMessage = error.message || 'Error al registrar usuario';
            this.loading = false;
        }
    }
}
