import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { LocationGeneratorParams } from '../../types/location';
import { LocationService } from '../service/location.service';

@Component({
    selector: 'app-location-generator',
    templateUrl: './location-generator.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        InputNumberModule,
        ToastModule
    ],
    providers: [MessageService]
})
export class LocationGenerator {
    generatorParams: LocationGeneratorParams = {
        zone: '-',
        category: '',
        type: '',
        area: '',
        rowMin: 1,
        rowMax: 1,
        bayMin: 1,
        bayMax: 1,
        levelMin: 1,
        levelMax: 1,
        content: ''
    };

    // Opciones para dropdowns
    categoryOptions = [
        { label: 'Priority A', value: 'Priority A' },
        { label: 'Priority B', value: 'Priority B' },
        { label: 'Priority C', value: 'Priority C' },
        { label: 'No Priority', value: 'No Priority' }
    ];

    typeOptions = [
        { label: 'REGULAR', value: 'REGULAR' },
        { label: 'HURT', value: 'HURT' },
        { label: 'STAGED', value: 'STAGED' },
        { label: 'QUARANTINE', value: 'QUARANTINE' }
    ];

    constructor(
        private locationService: LocationService,
        private router: Router,
        private messageService: MessageService
    ) { }

    get totalLocations(): number {
        const rows = (this.generatorParams.rowMax - this.generatorParams.rowMin + 1);
        const bays = (this.generatorParams.bayMax - this.generatorParams.bayMin + 1);
        const levels = (this.generatorParams.levelMax - this.generatorParams.levelMin + 1);
        return rows * bays * levels;
    }

    get totalRows(): number {
        return this.generatorParams.rowMax - this.generatorParams.rowMin + 1;
    }

    get totalBays(): number {
        return this.generatorParams.bayMax - this.generatorParams.bayMin + 1;
    }

    get totalLevels(): number {
        return this.generatorParams.levelMax - this.generatorParams.levelMin + 1;
    }

    async generateLocations(): Promise<void> {
        if (!this.validateParams()) {
            return;
        }

        try {
            const generated = await this.locationService.generateLocations(this.generatorParams);

            if (generated && generated.length > 0) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `${generated.length} ubicaciones creadas correctamente`
                });

                setTimeout(() => this.goBack(), 1500);
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron generar ubicaciones'
                });
            }
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al generar las ubicaciones'
            });
        }
    }

    validateParams(): boolean {
        if (!this.generatorParams.category) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El campo Category es requerido'
            });
            return false;
        }

        if (!this.generatorParams.type) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El campo Type es requerido'
            });
            return false;
        }

        if (!this.generatorParams.area) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El campo Area es requerido'
            });
            return false;
        }

        if (this.generatorParams.rowMin > this.generatorParams.rowMax) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'Row Min no puede ser mayor que Row Max'
            });
            return false;
        }

        if (this.generatorParams.bayMin > this.generatorParams.bayMax) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'Bay Min no puede ser mayor que Bay Max'
            });
            return false;
        }

        if (this.generatorParams.levelMin > this.generatorParams.levelMax) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'Level Min no puede ser mayor que Level Max'
            });
            return false;
        }

        if (this.totalLocations > 1000) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'No se pueden generar más de 1000 ubicaciones a la vez'
            });
            return false;
        }

        return true;
    }

    goBack(): void {
        this.router.navigate(['/ubicaciones']);
    }
}
