import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { MenuModule } from 'primeng/menu';
import { ConfirmationService, MessageService } from 'primeng/api';

import { Supplier } from '../../types/supplier';
import { SupplierService } from '../service/supplier.service';

@Component({
    selector: 'app-supplier-list',
    templateUrl: './supplier-list.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        TagModule,
        ConfirmDialogModule,
        ToastModule,
        TooltipModule,
        IconFieldModule,
        InputIconModule,
        FormsModule,
        MenuModule
    ],
    providers: [ConfirmationService, MessageService]
})
export class SupplierList implements OnInit {
    suppliers: Supplier[] = [];
    filteredSuppliers: Supplier[] = [];
    searchValue: string = '';
    menuItems: any[] = [];

    constructor(
        private supplierService: SupplierService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadSuppliers();
    }

    loadSuppliers(): void {
        this.suppliers = this.supplierService.getAllSuppliers();
        this.filteredSuppliers = [...this.suppliers];
    }

    onSearch(): void {
        if (!this.searchValue) {
            this.filteredSuppliers = [...this.suppliers];
            return;
        }

        const searchLower = this.searchValue.toLowerCase();
        this.filteredSuppliers = this.suppliers.filter(supplier =>
            supplier.name?.toLowerCase().includes(searchLower) ||
            supplier.contactName?.toLowerCase().includes(searchLower) ||
            supplier.email?.toLowerCase().includes(searchLower) ||
            supplier.city?.toLowerCase().includes(searchLower) ||
            supplier.country?.toLowerCase().includes(searchLower)
        );
    }

    clearSearch(): void {
        this.searchValue = '';
        this.filteredSuppliers = [...this.suppliers];
    }

    createNewSupplier(): void {
        this.router.navigate(['/proveedores/nuevo']);
    }

    editSupplier(supplierId: string): void {
        this.router.navigate(['/proveedores/editar', supplierId]);
    }

    deleteSupplier(supplier: Supplier): void {
        this.confirmationService.confirm({
            message: `¿Está seguro que desea eliminar el proveedor "${supplier.name}"?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            accept: async () => {
                const success = await this.supplierService.deleteSupplier(supplier.id!);
                if (success) {
                    this.loadSuppliers();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Eliminado',
                        detail: 'Proveedor eliminado correctamente',
                        life: 3000
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo eliminar el proveedor',
                        life: 3000
                    });
                }
            }
        });
    }

    async toggleStatus(supplier: Supplier): Promise<void> {
        const success = await this.supplierService.toggleSupplierStatus(supplier.id!);
        if (success) {
            this.loadSuppliers();
            this.messageService.add({
                severity: 'info',
                summary: 'Estado Actualizado',
                detail: `Proveedor ${supplier.active ? 'desactivado' : 'activado'}`,
                life: 3000
            });
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo cambiar el estado del proveedor',
                life: 3000
            });
        }
    }

    getStatusSeverity(active: boolean): string {
        return active ? 'success' : 'danger';
    }

    getStatusLabel(active: boolean): string {
        return active ? 'Activo' : 'Inactivo';
    }

    getMenuItems(supplier: Supplier): any[] {
        return [
            {
                label: 'Editar',
                icon: 'pi pi-pencil',
                command: () => this.editSupplier(supplier.id!)
            },
            {
                label: supplier.active ? 'Desactivar' : 'Activar',
                icon: supplier.active ? 'pi pi-eye-slash' : 'pi pi-eye',
                command: () => this.toggleStatus(supplier)
            },
            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                command: () => this.deleteSupplier(supplier)
            }
        ];
    }
}
