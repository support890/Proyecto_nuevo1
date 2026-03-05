import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProductService, ProductWithVariants } from '../service/product.service';
import { SupplierService } from '../service/supplier.service';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { MenuModule } from 'primeng/menu';

@Component({
    selector: 'app-product-management-list',
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
        DialogModule,
        IconFieldModule,
        InputIconModule,
        MenuModule,
        FormsModule
    ],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-toast />
        <p-confirmDialog />
        
        <div class="card">
            <div class="flex justify-between items-start mb-6">
                <div>
                    <h2 class="text-3xl font-bold text-surface-900 dark:text-surface-0 m-0">Gestión de Productos</h2>
                </div>
                <div class="flex gap-3 items-center">
                    <p-button 
                        label="Nuevo Producto" 
                        icon="pi pi-plus" 
                        (onClick)="createNewProduct()">
                    </p-button>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input 
                            pInputText 
                            type="text" 
                            [(ngModel)]="searchValue"
                            (input)="onSearch()"
                            placeholder="Search keyword" 
                            style="width: 250px" />
                        <p-inputicon 
                            *ngIf="searchValue" 
                            styleClass="pi pi-times cursor-pointer" 
                            (click)="clearSearch()" />
                    </p-iconfield>
                </div>
            </div>

            <p-table 
                [value]="filteredProducts" 
                [tableStyle]="{ 'min-width': '60rem' }"
                [paginator]="true"
                [rows]="10">

                <ng-template #header>
                    <tr>
                        <th style="width:3rem"></th>
                        <th pSortableColumn="code" style="width:10%">
                            Código <p-sortIcon field="code"></p-sortIcon>
                        </th>
                        <th pSortableColumn="name" style="width:18%">
                            Nombre <p-sortIcon field="name"></p-sortIcon>
                        </th>
                        <th pSortableColumn="category" style="width:12%">
                            Categoría <p-sortIcon field="category"></p-sortIcon>
                        </th>
                        <th style="width:12%">Proveedor</th>
                        <th style="width:9%">Precio Base</th>
                        <th style="width:9%">Variantes</th>
                        <th pSortableColumn="status" style="width:10%">
                            Estado <p-sortIcon field="status"></p-sortIcon>
                        </th>
                        <th style="width:12%">Tags</th>
                    </tr>
                </ng-template>

                <ng-template #body let-product>
                    <tr>
                        <td>
                            <p-button 
                                icon="pi pi-ellipsis-v" 
                                [text]="true"
                                [rounded]="true"
                                size="small"
                                (onClick)="menu.toggle($event); menuItems = getMenuItems(product)">
                            </p-button>
                        </td>
                        <td>{{ product.code }}</td>
                        <td>
                            <div class="flex items-center gap-2">
                                <div class="w-12 h-12 flex-shrink-0 bg-surface-100 dark:bg-surface-800 rounded flex items-center justify-center overflow-hidden shadow-sm">
                                    <img 
                                        *ngIf="product.images && product.images.length > 0" 
                                        [src]="product.images[0]" 
                                        [alt]="product.name"
                                        class="w-full h-full object-cover" />
                                    <i *ngIf="!product.images || product.images.length === 0" class="pi pi-image text-surface-400"></i>
                                </div>
                                <span class="font-semibold">{{ product.name }}</span>
                            </div>
                        </td>
                        <td>{{ product.category }}</td>
                        <td>{{ getSupplierName(product.supplierId) }}</td>
                        <td>\${{ product.basePrice?.toFixed(2) }}</td>
                        <td class="text-center">
                            <p-button 
                                [label]="product.variants?.length?.toString() || '0'" 
                                icon="pi pi-eye"
                                (onClick)="viewVariants(product)"
                                [text]="true"
                                size="small">
                            </p-button>
                        </td>
                        <td>
                            <p-tag 
                                [value]="getStatusLabel(product.status)" 
                                [severity]="getStatusSeverity(product.status)">
                            </p-tag>
                        </td>
                        <td>
                            <p-tag 
                                *ngFor="let tag of product.tags?.slice(0, 2)" 
                                [value]="tag"
                                styleClass="mr-1"
                                [rounded]="true">
                            </p-tag>
                            <span *ngIf="product.tags && product.tags.length > 2">+{{ product.tags.length - 2 }}</span>
                        </td>
                    </tr>
                </ng-template>

                <ng-template #emptymessage>
                    <tr>
                        <td colspan="9" class="text-center py-8">
                            <div class="flex flex-col items-center gap-3">
                                <i class="pi pi-inbox text-4xl text-gray-400"></i>
                                <p class="text-gray-500">No se encontraron productos</p>
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body"></p-menu>

        <!-- Dialog para ver variantes -->
        <p-dialog 
            [(visible)]="variantsDialogVisible" 
            [header]="'Variantes de ' + selectedProduct?.name"
            [modal]="true"
            [style]="{ width: '50vw' }"
            [breakpoints]="{ '960px': '75vw', '640px': '90vw' }">
            
            <div *ngIf="selectedProduct">
                <p-table [value]="selectedProduct.variants || []">
                    <ng-template #header>
                        <tr>
                            <th>SKU</th>
                            <th>Color</th>
                            <th>Tamaño</th>
                            <th>Stock</th>
                            <th>Precio</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-variant>
                        <tr>
                            <td>{{ variant.sku }}</td>
                            <td>{{ variant.color }}</td>
                            <td>{{ variant.size }}</td>
                            <td>{{ variant.stock }}</td>
                            <td>\${{ variant.price?.toFixed(2) }}</td>
                        </tr>
                    </ng-template>
                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="5" class="text-center">No hay variantes disponibles</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </p-dialog>
    `,
    styles: [`
        :host ::ng-deep {
            .p-button.p-button-text {
                padding: 0.5rem;
            }
        }
    `]
})
export class ProductManagementList implements OnInit {
    products: ProductWithVariants[] = [];
    filteredProducts: ProductWithVariants[] = [];
    variantsDialogVisible: boolean = false;
    selectedProduct: ProductWithVariants | null = null;
    searchValue: string = '';

    menuItems: any[] = [];

    constructor(
        private productService: ProductService,
        private supplierService: SupplierService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.loadProducts();
    }

    async loadProducts(): Promise<void> {
        await this.productService.loadProducts();
        this.products = this.productService.getAllProducts();
        this.filteredProducts = [...this.products];
    }

    onSearch(): void {
        if (!this.searchValue) {
            this.filteredProducts = [...this.products];
            return;
        }

        const searchLower = this.searchValue.toLowerCase();
        this.filteredProducts = this.products.filter(product =>
            product.name?.toLowerCase().includes(searchLower) ||
            product.code?.toLowerCase().includes(searchLower) ||
            product.category?.toLowerCase().includes(searchLower) ||
            product.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
    }

    clearSearch(): void {
        this.searchValue = '';
        this.filteredProducts = [...this.products];
    }

    getMenuItems(product: ProductWithVariants): any[] {
        return [
            {
                label: 'Editar',
                icon: 'pi pi-pencil',
                command: () => this.editProduct(product)
            },
            {
                label: 'Eliminar',
                icon: 'pi pi-trash',
                command: () => this.deleteProduct(product)
            }
        ];
    }

    getSupplierName(supplierId: string | undefined): string {
        if (!supplierId) return '-';
        const supplier = this.supplierService.getAllSuppliers().find(s => s.id === supplierId);
        return supplier ? supplier.name : '-';
    }

    createNewProduct(): void {
        this.router.navigate(['/productos/nuevo']);
    }

    editProduct(product: ProductWithVariants): void {
        this.router.navigate(['/productos/editar', product.id]);
    }

    deleteProduct(product: ProductWithVariants): void {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar el producto "${product.name}"?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            accept: async () => {
                if (product.id) {
                    const success = await this.productService.deleteProduct(product.id);
                    if (success) {
                        this.loadProducts();
                        this.onSearch(); // Actualizar filtrado después de eliminar
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Eliminado',
                            detail: 'Producto eliminado correctamente'
                        });
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo eliminar el producto'
                        });
                    }
                }
            }
        });
    }

    viewVariants(product: ProductWithVariants): void {
        this.selectedProduct = product;
        this.variantsDialogVisible = true;
    }

    getStatusLabel(status: string): string {
        const labels: any = {
            'draft': 'Borrador',
            'published': 'Publicado',
            'archived': 'Archivado'
        };
        return labels[status] || status;
    }

    getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
        const severities: any = {
            'draft': 'warn',
            'published': 'success',
            'archived': 'secondary'
        };
        return severities[status];
    }
}
