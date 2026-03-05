import { Injectable, signal } from '@angular/core';
import { Location, LocationGeneratorParams } from '../../types/location';
import { SupabaseService } from '../../services/supabase.service';

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    private locations = signal<Location[]>([]);
    private loadingSignal = signal<boolean>(false);

    loading = this.loadingSignal.asReadonly();

    constructor(private supabaseService: SupabaseService) {
        this.loadLocations();
    }

    async loadLocations(): Promise<void> {
        this.loadingSignal.set(true);
        try {
            const data = await this.supabaseService.getLocations();
            this.locations.set(data || []);
        } catch (error) {
            console.error('Error loading locations:', error);
            this.locations.set([]);
        } finally {
            this.loadingSignal.set(false);
        }
    }

    getAllLocations(): Location[] {
        return this.locations();
    }

    getActiveLocations(): Location[] {
        return this.locations().filter(loc => loc.active);
    }

    async getLocationById(id: string): Promise<Location | undefined> {
        try {
            const locations = await this.supabaseService.getLocations();
            return locations?.find((loc: any) => loc.id === id);
        } catch (error) {
            console.error('Error getting location:', error);
            return undefined;
        }
    }

    async createLocation(location: Location): Promise<Location | null> {
        this.loadingSignal.set(true);
        try {
            const newLocation = await this.supabaseService.createLocation(location);

            // Actualizar signal local
            const current = this.locations();
            this.locations.set([...current, newLocation]);

            return newLocation;
        } catch (error) {
            console.error('Error creating location:', error);
            return null;
        } finally {
            this.loadingSignal.set(false);
        }
    }

    async updateLocation(id: string, location: Partial<Location>): Promise<Location | null> {
        this.loadingSignal.set(true);
        try {
            const updated = await this.supabaseService.updateLocation(id, location);

            // Actualizar signal local
            const current = this.locations();
            const index = current.findIndex(loc => loc.id === id);
            if (index !== -1) {
                const newLocations = [...current];
                newLocations[index] = updated;
                this.locations.set(newLocations);
            }

            return updated;
        } catch (error) {
            console.error('Error updating location:', error);
            return null;
        } finally {
            this.loadingSignal.set(false);
        }
    }

    async deleteLocation(id: string): Promise<boolean> {
        this.loadingSignal.set(true);
        try {
            await this.supabaseService.deleteLocation(id);

            // Actualizar signal local
            const current = this.locations();
            this.locations.set(current.filter(loc => loc.id !== id));

            return true;
        } catch (error) {
            console.error('Error deleting location:', error);
            return false;
        } finally {
            this.loadingSignal.set(false);
        }
    }

    async toggleLocationStatus(id: string): Promise<boolean> {
        const location = this.locations().find(loc => loc.id === id);
        if (!location) return false;

        const updated = await this.updateLocation(id, { ...location, active: !location.active });
        return updated !== null;
    }

    // Generador de locations en bulk
    async generateLocations(params: LocationGeneratorParams): Promise<Location[]> {
        this.loadingSignal.set(true);
        try {
            const generatedLocations = await this.supabaseService.generateLocations(params);

            // Actualizar signal local
            const current = this.locations();
            this.locations.set([...current, ...generatedLocations]);

            return generatedLocations;
        } catch (error) {
            console.error('Error generating locations:', error);
            return [];
        } finally {
            this.loadingSignal.set(false);
        }
    }

    async updateBinQty(locationId: string, qty: number): Promise<boolean> {
        const location = this.locations().find(loc => loc.id === locationId);
        if (!location) return false;

        const updated = await this.updateLocation(locationId, { ...location, binQty: qty });
        return updated !== null;
    }

    // Métodos de filtrado (client-side)
    filterLocations(filters: {
        zone?: string;
        category?: string;
        type?: string;
        searchTerm?: string;
    }): Location[] {
        let filtered = this.getAllLocations();

        if (filters.zone) {
            filtered = filtered.filter(loc => loc.zone === filters.zone);
        }

        if (filters.category) {
            filtered = filtered.filter(loc => loc.category === filters.category);
        }

        if (filters.type) {
            filtered = filtered.filter(loc => loc.type === filters.type);
        }

        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(loc =>
                loc.storageName?.toLowerCase().includes(term) ||
                loc.content?.toLowerCase().includes(term)
            );
        }

        return filtered;
    }
}
