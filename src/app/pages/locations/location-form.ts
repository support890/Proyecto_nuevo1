import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Location } from '../../types/location';
import { LocationService } from '../service/location.service';

@Component({
    selector: 'app-location-form',
    templateUrl: './location-form.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        InputSwitchModule,
        ToastModule
    ],
    providers: [MessageService]
})
export class LocationForm implements OnInit {
    location: Location = {
        zone: '-',
        category: '',
        type: '',
        area: '',
        row: '',
        bay: '',
        level: '',
        storageName: '',
        customName: false,
        binQty: 0,
        active: true
    };

    isEditMode: boolean = false;
    locationId: string = '';

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
        private route: ActivatedRoute,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.locationId = params['id'];
                this.loadLocation(this.locationId);
            }
        });
    }

    async loadLocation(id: string): Promise<void> {
        const location = await this.locationService.getLocationById(id);
        if (location) {
            this.location = { ...location };
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Ubicación no encontrada'
            });
            this.goBack();
        }
    }

    generateStorageName(): void {
        const { type, row, bay, level } = this.location;
        if (!this.location.customName && type && row !== '' && bay !== '' && level !== '') {
            const r = parseInt(row.toString());
            const b = parseInt(bay.toString());
            const l = parseInt(level.toString());
            const code = (isNaN(r) ? 0 : r) * 100 + (isNaN(b) ? 0 : b) * 10 + (isNaN(l) ? 0 : l);
            this.location.storageName = `${type}-${code}`;
        }
    }

    onTypeChange(): void {
        this.generateStorageName();
    }

    onRowChange(): void {
        this.generateStorageName();
    }

    onBayChange(): void {
        this.generateStorageName();
    }

    onLevelChange(): void {
        this.generateStorageName();
    }

    onCustomNameChange(): void {
        if (!this.location.customName) {
            this.generateStorageName();
        }
    }

    async saveLocation(): Promise<void> {
        if (!this.validateLocation()) {
            return;
        }

        try {
            if (this.isEditMode) {
                const result = await this.locationService.updateLocation(this.locationId, this.location);
                if (result) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Ubicación actualizada correctamente'
                    });
                } else {
                    throw new Error('Error al actualizar');
                }
            } else {
                const result = await this.locationService.createLocation(this.location);
                if (result) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Ubicación creada correctamente'
                    });
                } else {
                    throw new Error('Error al crear');
                }
            }
            setTimeout(() => this.goBack(), 1000);
        } catch (error) {
            console.error('Error al guardar ubicación:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error instanceof Error ? error.message : 'Error al guardar la ubicación'
            });
        }
    }

    validateLocation(): boolean {
        if (!this.location.category) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El campo Category es requerido'
            });
            return false;
        }

        if (!this.location.type) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El campo Type es requerido'
            });
            return false;
        }

        // Validar campos requeridos (evitando falsos negativos con el número 0)
        const { area, row, bay, level } = this.location;
        const isAreaValid = area !== undefined && area !== null && area !== '';
        const isRowValid = row !== undefined && row !== null && row !== '';
        const isBayValid = bay !== undefined && bay !== null && bay !== '';
        const isLevelValid = level !== undefined && level !== null && level !== '';

        if (!isAreaValid || !isRowValid || !isBayValid || !isLevelValid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'Los campos Area, Row, Bay y Level son requeridos'
            });
            return false;
        }

        if (!this.location.storageName) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El campo Storage Name es requerido'
            });
            return false;
        }

        return true;
    }

    goBack(): void {
        this.router.navigate(['/ubicaciones']);
    }
}
