import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { BinGeneratorParams } from '../../types/bin';
import { BinService } from '../service/bin.service';

@Component({
    selector: 'app-bin-generator',
    templateUrl: './bin-generator.html',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        ToastModule
    ],
    providers: [MessageService]
})
export class BinGenerator {
    @Input() visible: boolean = false;
    @Input() locationId: string = '';
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() onGenerate = new EventEmitter<void>();

    generatorParams: BinGeneratorParams = {
        locationId: '',
        prefix: 'BIN',
        startNumber: 1,
        endNumber: 10
    };

    generating: boolean = false;

    constructor(
        private binService: BinService,
        private messageService: MessageService
    ) {}

    get totalBins(): number {
        return Math.max(0, this.generatorParams.endNumber - this.generatorParams.startNumber + 1);
    }

    async generateBins(): Promise<void> {
        if (!this.validateParams()) {
            return;
        }

        this.generatorParams.locationId = this.locationId;
        this.generating = true;

        try {
            const generated = await this.binService.generateBins(this.generatorParams);

            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: `${generated.length} bins creados correctamente`
            });

            this.onGenerate.emit();
            this.closeDialog();
            this.resetForm();
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al generar los bins'
            });
        } finally {
            this.generating = false;
        }
    }

    validateParams(): boolean {
        if (!this.generatorParams.prefix) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El prefijo es requerido'
            });
            return false;
        }

        if (this.generatorParams.startNumber > this.generatorParams.endNumber) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El número inicial no puede ser mayor que el número final'
            });
            return false;
        }

        if (this.totalBins > 500) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'No se pueden generar más de 500 bins a la vez'
            });
            return false;
        }

        return true;
    }

    closeDialog(): void {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    resetForm(): void {
        this.generatorParams = {
            locationId: '',
            prefix: 'BIN',
            startNumber: 1,
            endNumber: 10
        };
    }
}
