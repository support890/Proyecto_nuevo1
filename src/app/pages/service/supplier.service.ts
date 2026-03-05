import { Injectable, signal } from '@angular/core';
import { Supplier } from '../../types/supplier';
import { SupabaseService } from '../../services/supabase.service';

@Injectable({
    providedIn: 'root'
})
export class SupplierService {
    private suppliers = signal<Supplier[]>([]);
    private loadingSignal = signal<boolean>(false);

    loading = this.loadingSignal.asReadonly();

    constructor(private supabaseService: SupabaseService) {
        this.loadSuppliers();
    }

    async loadSuppliers(): Promise<void> {
        this.loadingSignal.set(true);
        try {
            const data = await this.supabaseService.getSuppliers();
            this.suppliers.set(data || []);
        } catch (error) {
            console.error('Error loading suppliers:', error);
            this.suppliers.set([]);
        } finally {
            this.loadingSignal.set(false);
        }
    }

    getAllSuppliers(): Supplier[] {
        return this.suppliers();
    }

    getActiveSuppliers(): Supplier[] {
        return this.suppliers().filter(s => s.active);
    }

    async getSupplierById(id: string): Promise<Supplier | undefined> {
        try {
            const suppliers = await this.supabaseService.getSuppliers();
            return suppliers?.find((s: any) => s.id === id);
        } catch (error) {
            console.error('Error getting supplier:', error);
            return undefined;
        }
    }

    async createSupplier(supplier: Supplier): Promise<Supplier | null> {
        this.loadingSignal.set(true);
        try {
            const newSupplier = await this.supabaseService.createSupplier(supplier);

            // Actualizar signal local
            const current = this.suppliers();
            this.suppliers.set([...current, newSupplier]);

            return newSupplier;
        } catch (error) {
            console.error('Error creating supplier:', error);
            return null;
        } finally {
            this.loadingSignal.set(false);
        }
    }

    async updateSupplier(id: string, updatedSupplier: Supplier): Promise<Supplier | null> {
        this.loadingSignal.set(true);
        try {
            const updated = await this.supabaseService.updateSupplier(id, updatedSupplier);

            // Actualizar signal local
            const current = this.suppliers();
            const index = current.findIndex(s => s.id === id);
            if (index !== -1) {
                const newSuppliers = [...current];
                newSuppliers[index] = updated;
                this.suppliers.set(newSuppliers);
            }

            return updated;
        } catch (error) {
            console.error('Error updating supplier:', error);
            return null;
        } finally {
            this.loadingSignal.set(false);
        }
    }

    async deleteSupplier(id: string): Promise<boolean> {
        this.loadingSignal.set(true);
        try {
            await this.supabaseService.deleteSupplier(id);

            // Actualizar signal local
            const current = this.suppliers();
            this.suppliers.set(current.filter(s => s.id !== id));

            return true;
        } catch (error) {
            console.error('Error deleting supplier:', error);
            return false;
        } finally {
            this.loadingSignal.set(false);
        }
    }

    async toggleSupplierStatus(id: string): Promise<boolean> {
        const supplier = this.suppliers().find(s => s.id === id);
        if (!supplier) return false;

        const updated = await this.updateSupplier(id, { ...supplier, active: !supplier.active });
        return updated !== null;
    }
}
