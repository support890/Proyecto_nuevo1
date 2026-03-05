import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { MenuModule } from 'primeng/menu';
import { ConfirmationService, MessageService } from 'primeng/api';

import { Bin } from '../../types/bin';
import { Location } from '../../types/location';
import { BinService } from '../service/bin.service';
import { LocationService } from '../service/location.service';
import { BinForm } from './bin-form';
import { BinGenerator } from './bin-generator';

@Component({
    selector: 'app-bin-list',
    templateUrl: './bin-list.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        TagModule,
        DialogModule,
        ConfirmDialogModule,
        ToastModule,
        TooltipModule,
        IconFieldModule,
        InputIconModule,
        FormsModule,
        BinForm,
        BinGenerator,
        MenuModule
    ],
    providers: [ConfirmationService, MessageService]
})
export class BinList implements OnInit {
    bins: Bin[] = [];
    filteredBins: Bin[] = [];
    location: Location | undefined;
    locationId: string = '';
    searchValue: string = '';
    menuItems: any[] = [];

    // Dialog de creación de bin
    showBinFormDialog: boolean = false;
    showBinGeneratorDialog: boolean = false;
    editingBin: Bin | null = null;

    constructor(
        private binService: BinService,
        private locationService: LocationService,
        private router: Router,
        private route: ActivatedRoute,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (params['locationId']) {
                this.locationId = params['locationId'];
                this.loadLocation();
                this.loadBins();
            }
        });
    }

    async loadLocation(): Promise<void> {
        this.location = await this.locationService.getLocationById(this.locationId);
        if (!this.location) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Ubicación no encontrada'
            });
            this.goBack();
        }
    }

    loadBins(): void {
        this.bins = this.binService.getBinsByLocation(this.locationId);
        this.filteredBins = [...this.bins];
        // Actualizar el contador de bins en la ubicación
        this.locationService.updateBinQty(this.locationId, this.bins.length);
    }

    onSearch(): void {
        if (!this.searchValue) {
            this.filteredBins = [...this.bins];
            return;
        }

        const searchLower = this.searchValue.toLowerCase();
        this.filteredBins = this.bins.filter(bin =>
            bin.code?.toLowerCase().includes(searchLower) ||
            bin.content?.toLowerCase().includes(searchLower)
        );
    }

    clearSearch(): void {
        this.searchValue = '';
        this.filteredBins = [...this.bins];
    }

    createNewBin(): void {
        this.editingBin = null;
        this.showBinFormDialog = true;
    }

    openGenerator(): void {
        this.showBinGeneratorDialog = true;
    }

    editBin(bin: Bin): void {
        this.editingBin = { ...bin };
        this.showBinFormDialog = true;
    }

    deleteBin(bin: Bin): void {
        this.confirmationService.confirm({
            message: `¿Está seguro que desea eliminar el bin "${bin.code}"?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            accept: () => {
                this.binService.deleteBin(bin.id!);
                this.loadBins();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Eliminado',
                    detail: 'Bin eliminado correctamente',
                    life: 3000
                });
            }
        });
    }

    getStatusClass(status: string): string {
        const classes: any = {
            'empty': 'secondary',
            'partial': 'warning',
            'full': 'success'
        };
        return classes[status] || 'secondary';
    }

    getStatusLabel(status: string): string {
        const labels: any = {
            'empty': 'Vacío',
            'partial': 'Parcial',
            'full': 'Lleno'
        };
        return labels[status] || status;
    }

    goBack(): void {
        this.router.navigate(['/ubicaciones']);
    }

    getMenuItems(bin: Bin): any[] {
        return [
            {
                label: 'Editar',
                icon: 'pi pi-pencil',
                command: () => this.editBin(bin)
            },
            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                command: () => this.deleteBin(bin)
            }
        ];
    }
}
