import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';

import { Supplier } from '../../types/supplier';
import { SupplierService } from '../service/supplier.service';

@Component({
    selector: 'app-supplier-form',
    templateUrl: './supplier-form.html',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        CardModule,
        InputTextModule,
        ButtonModule,
        ToastModule,
        CheckboxModule
    ],
    providers: [MessageService]
})
export class SupplierForm implements OnInit {
    supplier: Supplier = {
        name: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        website: '',
        active: true
    };

    isEditMode: boolean = false;
    supplierId: string | null = null;

    constructor(
        private supplierService: SupplierService,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.supplierId = this.route.snapshot.paramMap.get('id');
        
        if (this.supplierId) {
            this.isEditMode = true;
            this.loadSupplier();
        }
    }

    async loadSupplier(): Promise<void> {
        if (this.supplierId) {
            const supplier = await this.supplierService.getSupplierById(this.supplierId);
            if (supplier) {
                this.supplier = { ...supplier };
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Proveedor no encontrado',
                    life: 3000
                });
                this.goBack();
            }
        }
    }

    async onSubmit(): Promise<void> {
        if (!this.validateForm()) {
            return;
        }

        try {
            if (this.isEditMode && this.supplierId) {
                const result = await this.supplierService.updateSupplier(this.supplierId, this.supplier);
                if (result) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Actualizado',
                        detail: 'Proveedor actualizado correctamente',
                        life: 3000
                    });
                } else {
                    throw new Error('Error al actualizar');
                }
            } else {
                const result = await this.supplierService.createSupplier(this.supplier);
                if (result) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Creado',
                        detail: 'Proveedor creado correctamente',
                        life: 3000
                    });
                } else {
                    throw new Error('Error al crear');
                }
            }

            setTimeout(() => {
                this.goBack();
            }, 1000);
        } catch (error) {
            console.error('Error al guardar proveedor:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error instanceof Error ? error.message : 'No se pudo guardar el proveedor',
                life: 3000
            });
        }
    }

    validateForm(): boolean {
        if (!this.supplier.name || this.supplier.name.trim() === '') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El nombre del proveedor es requerido',
                life: 3000
            });
            return false;
        }

        if (!this.supplier.contactName || this.supplier.contactName.trim() === '') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El nombre del contacto es requerido',
                life: 3000
            });
            return false;
        }

        if (!this.supplier.email || this.supplier.email.trim() === '') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El email es requerido',
                life: 3000
            });
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.supplier.email)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El email no es válido',
                life: 3000
            });
            return false;
        }

        if (!this.supplier.phone || this.supplier.phone.trim() === '') {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El teléfono es requerido',
                life: 3000
            });
            return false;
        }

        return true;
    }

    goBack(): void {
        this.router.navigate(['/proveedores']);
    }
}
