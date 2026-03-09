import { Injectable } from '@angular/core';
import { Bin, BinGeneratorParams } from '../../types/bin';
import { SupabaseService } from '../../services/supabase.service';

@Injectable({
    providedIn: 'root'
})
export class BinService {

    constructor(private supabaseService: SupabaseService) {}

    async getBinsByLocation(locationId: string): Promise<Bin[]> {
        try {
            const data = await this.supabaseService.getBinsByLocation(locationId);
            return (data || []).map((b: any) => this.mapToBin(b));
        } catch (error) {
            console.error('Error getting bins:', error);
            return [];
        }
    }

    async createBin(bin: Bin): Promise<Bin | null> {
        try {
            const payload = {
                location_id: bin.locationId,
                bin_name: bin.binName,
                capacity: bin.capacity ?? null,
                current_stock: 0,
                active: bin.active !== undefined ? bin.active : true
            };
            const data = await this.supabaseService.createBin(payload);
            return this.mapToBin(data);
        } catch (error) {
            console.error('Error creating bin:', error);
            return null;
        }
    }

    async generateBins(params: BinGeneratorParams): Promise<Bin[]> {
        return this.generateBinsWithFormat({
            locationId: params.locationId,
            prefix: params.prefix,
            startNumber: params.startNumber,
            endNumber: params.endNumber,
            nameFormat: '{Prefix}-{Number}',
            capacity: undefined,
            active: true
        });
    }

    async generateBinsWithFormat(params: {
        locationId: string;
        prefix: string;
        startNumber: number;
        endNumber: number;
        nameFormat: string;
        capacity?: number;
        active: boolean;
    }): Promise<Bin[]> {
        try {
            const payload = [];
            for (let i = params.startNumber; i <= params.endNumber; i++) {
                const num = i.toString().padStart(3, '0');
                const binName = params.nameFormat
                    .replace(/\{Prefix\}/g, params.prefix || '')
                    .replace(/\{Number\}/g, num);
                payload.push({
                    location_id: params.locationId,
                    bin_name: binName,
                    capacity: params.capacity ?? null,
                    current_stock: 0,
                    active: params.active
                });
            }
            const data = await this.supabaseService.createBins(payload);
            return (data || []).map((b: any) => this.mapToBin(b));
        } catch (error) {
            console.error('Error generating bins:', error);
            return [];
        }
    }

    async generateBinsForLocations(locationIds: string[], params: {
        prefix: string;
        startNumber: number;
        endNumber: number;
        nameFormat: string;
        capacity?: number;
        active: boolean;
    }): Promise<Bin[]> {
        try {
            const payload = [];
            for (const locationId of locationIds) {
                for (let i = params.startNumber; i <= params.endNumber; i++) {
                    const num = i.toString().padStart(3, '0');
                    const binName = params.nameFormat
                        .replace(/\{Prefix\}/g, params.prefix || '')
                        .replace(/\{Number\}/g, num);
                    payload.push({
                        location_id: locationId,
                        bin_name: binName,
                        capacity: params.capacity ?? null,
                        current_stock: 0,
                        active: params.active
                    });
                }
            }
            const data = await this.supabaseService.createBins(payload);
            return (data || []).map((b: any) => this.mapToBin(b));
        } catch (error) {
            console.error('Error generating bins for locations:', error);
            return [];
        }
    }

    async updateBin(id: string, bin: Partial<Bin>): Promise<Bin | null> {
        try {
            const payload: any = {};
            if (bin.binName !== undefined) payload.bin_name = bin.binName;
            if (bin.capacity !== undefined) payload.capacity = bin.capacity;
            if (bin.currentStock !== undefined) payload.current_stock = bin.currentStock;
            if (bin.active !== undefined) payload.active = bin.active;
            const data = await this.supabaseService.updateBin(id, payload);
            return this.mapToBin(data);
        } catch (error) {
            console.error('Error updating bin:', error);
            return null;
        }
    }

    async deleteBin(id: string): Promise<boolean> {
        try {
            await this.supabaseService.deleteBin(id);
            return true;
        } catch (error) {
            console.error('Error deleting bin:', error);
            return false;
        }
    }

    private mapToBin(data: any): Bin {
        return {
            id: data.id,
            locationId: data.location_id,
            binName: data.bin_name,
            capacity: data.capacity,
            currentStock: data.current_stock,
            active: data.active,
            createdAt: data.created_at ? new Date(data.created_at) : undefined
        };
    }
}
