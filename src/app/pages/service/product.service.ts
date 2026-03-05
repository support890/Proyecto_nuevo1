import { Injectable, signal } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

export interface ProductVariant {
    id?: string;
    color?: string;
    size?: string;
    sku?: string;
    stock?: number;
    price?: number;
}

export interface ProductWithVariants {
    id?: string;
    code?: string;
    name: string;
    description: string;
    basePrice: number;
    category?: string;
    images: string[];
    status: 'draft' | 'published' | 'archived';
    tags: string[];
    variants: ProductVariant[];
    supplierId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private productsSignal = signal<ProductWithVariants[]>([]);
    private loadingSignal = signal<boolean>(false);
    
    products = this.productsSignal.asReadonly();
    loading = this.loadingSignal.asReadonly();

    constructor(private supabaseService: SupabaseService) {
        this.loadProducts();
    }

    async loadProducts(): Promise<void> {
        this.loadingSignal.set(true);
        try {
            const data = await this.supabaseService.getProducts();
            this.productsSignal.set(data || []);
        } catch (error) {
            console.error('Error loading products:', error);
            this.productsSignal.set([]);
        } finally {
            this.loadingSignal.set(false);
        }
    }

    getAllProducts(): ProductWithVariants[] {
        return this.productsSignal();
    }

    async getProductById(id: string): Promise<ProductWithVariants | undefined> {
        try {
            const product = await this.supabaseService.getProductById(id);
            return product;
        } catch (error) {
            console.error('Error getting product:', error);
            return undefined;
        }
    }

    async addProduct(product: ProductWithVariants): Promise<ProductWithVariants | null> {
        this.loadingSignal.set(true);
        try {
            const newProduct = await this.supabaseService.createProduct(product);
            
            // Actualizar signal local
            const current = this.productsSignal();
            this.productsSignal.set([...current, newProduct]);
            
            return newProduct;
        } catch (error) {
            console.error('Error adding product:', error);
            return null;
        } finally {
            this.loadingSignal.set(false);
        }
    }

    async updateProduct(id: string, product: Partial<ProductWithVariants>): Promise<ProductWithVariants | null> {
        this.loadingSignal.set(true);
        try {
            const updatedProduct = await this.supabaseService.updateProduct(id, product);
            
            // Actualizar signal local
            const current = this.productsSignal();
            const index = current.findIndex(p => p.id === id);
            if (index !== -1) {
                const updated = [...current];
                updated[index] = updatedProduct;
                this.productsSignal.set(updated);
            }
            
            return updatedProduct;
        } catch (error) {
            console.error('Error updating product:', error);
            return null;
        } finally {
            this.loadingSignal.set(false);
        }
    }

    async deleteProduct(id: string): Promise<boolean> {
        this.loadingSignal.set(true);
        try {
            await this.supabaseService.deleteProduct(id);
            
            // Actualizar signal local
            const current = this.productsSignal();
            this.productsSignal.set(current.filter(p => p.id !== id));
            
            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            return false;
        } finally {
            this.loadingSignal.set(false);
        }
    }

    searchProducts(query: string): ProductWithVariants[] {
        const lowerQuery = query.toLowerCase();
        return this.productsSignal().filter(p => 
            p.name?.toLowerCase().includes(lowerQuery) ||
            p.description?.toLowerCase().includes(lowerQuery) ||
            p.code?.toLowerCase().includes(lowerQuery)
        );
    }
}
