import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { FileUploadModule, FileUploadHandlerEvent } from 'primeng/fileupload';
import { ChipModule } from 'primeng/chip';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProductService, ProductWithVariants, ProductVariant } from '../service/product.service';
import { SupplierService } from '../service/supplier.service';
import { Supplier } from '../../types/supplier';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        InputTextModule,
        InputTextarea,
        InputNumberModule,
        SelectModule,
        FileUploadModule,
        ChipModule,
        TableModule,
        DialogModule,
        ToastModule,
        CardModule,
        DividerModule
    ],
    providers: [MessageService],
    template: `
        <p-toast />
        
        <div class="card">
            <div class="flex items-center mb-6">
                <p-button 
                    icon="pi pi-arrow-left" 
                    [text]="true"
                    [rounded]="true"
                    (onClick)="goBack()"
                    styleClass="mr-4">
                </p-button>
                <div>
                    <h2 class="text-3xl font-bold text-surface-900 dark:text-surface-0 m-0">
                        {{ isEditMode ? 'Editar Producto' : 'Nuevo Producto' }}
                    </h2>
                    <p class="text-surface-600 dark:text-surface-400 mt-2">
                        {{ isEditMode ? 'Modifica los detalles del producto' : 'Crea un nuevo producto con sus variantes' }}
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-6">
                <!-- Información Principal -->
                <div class="col-span-12 lg:col-span-8">
                    <p-card header="Información del Producto">
                        <div class="grid grid-cols-12 gap-4">
                            <div class="col-span-12">
                                <label class="block mb-2 font-semibold">Nombre del Producto *</label>
                                <input 
                                    pInputText 
                                    [(ngModel)]="product.name" 
                                    placeholder="Ej: Camiseta Premium"
                                    class="w-full" />
                            </div>

                            <div class="col-span-12 md:col-span-6">
                                <label class="block mb-2 font-semibold">Código *</label>
                                <input 
                                    pInputText 
                                    [(ngModel)]="product.code" 
                                    placeholder="Ej: PROD-001"
                                    class="w-full" />
                            </div>

                            <div class="col-span-12 md:col-span-6">
                                <label class="block mb-2 font-semibold">Precio Base *</label>
                                <p-inputNumber 
                                    [(ngModel)]="product.basePrice" 
                                    mode="currency" 
                                    currency="USD"
                                    locale="en-US"
                                    [minFractionDigits]="2"
                                    styleClass="w-full">
                                </p-inputNumber>
                            </div>

                            <div class="col-span-12">
                                <label class="block mb-2 font-semibold">Descripción</label>
                                <textarea 
                                    pInputTextarea 
                                    [(ngModel)]="product.description" 
                                    rows="4"
                                    placeholder="Describe tu producto..."
                                    class="w-full">
                                </textarea>
                            </div>

                            <div class="col-span-12">
                                <label class="block mb-2 font-semibold">Imágenes</label>
                                <p-fileUpload
                                    name="images[]"
                                    [customUpload]="true"
                                    (onSelect)="onImageSelect($event)"
                                    [multiple]="true"
                                    accept="image/*"
                                    [maxFileSize]="5000000"
                                    [showUploadButton]="false"
                                    [showCancelButton]="false"
                                    [auto]="true"
                                    chooseLabel="Seleccionar Imágenes"
                                    class="w-full">
                                    <ng-template #content>
                                        <div class="flex flex-wrap gap-4 mt-4" *ngIf="product.images.length > 0">
                                            <div *ngFor="let img of product.images; let i = index" class="relative group">
                                                <img [src]="img" class="w-32 h-32 object-cover rounded-lg shadow-md border border-surface-200 dark:border-surface-700" />
                                                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                    <p-button 
                                                        icon="pi pi-trash" 
                                                        (onClick)="removeImage(i)"
                                                        [rounded]="true"
                                                        severity="danger"
                                                        size="small"
                                                        pTooltip="Eliminar imagen">
                                                    </p-button>
                                                </div>
                                            </div>
                                        </div>
                                    </ng-template>
                                </p-fileUpload>
                            </div>
                        </div>
                    </p-card>

                    <!-- Variantes del Producto -->
                    <p-card header="Variantes del Producto" styleClass="mt-6">
                        <div class="mb-4">
                            <p-button 
                                label="Añadir Variante" 
                                icon="pi pi-plus"
                                (onClick)="showVariantDialog()"
                                size="small">
                            </p-button>
                        </div>

                        <p-table [value]="product.variants" [tableStyle]="{ 'min-width': '50rem' }">
                            <ng-template #header>
                                <tr>
                                    <th>SKU</th>
                                    <th>Color</th>
                                    <th>Tamaño</th>
                                    <th>Stock</th>
                                    <th>Precio</th>
                                    <th style="width: 10%">Acciones</th>
                                </tr>
                            </ng-template>
                            <ng-template #body let-variant let-i="rowIndex">
                                <tr>
                                    <td>{{ variant.sku }}</td>
                                    <td>{{ variant.color }}</td>
                                    <td>{{ variant.size }}</td>
                                    <td>{{ variant.stock }}</td>
                                    <td>\${{ variant.price?.toFixed(2) }}</td>
                                    <td>
                                        <div class="flex gap-2">
                                            <p-button 
                                                icon="pi pi-pencil" 
                                                (onClick)="editVariant(i)"
                                                [text]="true"
                                                [rounded]="true"
                                                severity="info"
                                                size="small">
                                            </p-button>
                                            <p-button 
                                                icon="pi pi-trash" 
                                                (onClick)="deleteVariant(i)"
                                                [text]="true"
                                                [rounded]="true"
                                                severity="danger"
                                                size="small">
                                            </p-button>
                                        </div>
                                    </td>
                                </tr>
                            </ng-template>
                            <ng-template #emptymessage>
                                <tr>
                                    <td colspan="6" class="text-center py-8">
                                        <i class="pi pi-box text-4xl text-surface-400 mb-4"></i>
                                        <p class="text-surface-600 dark:text-surface-400">No hay variantes creadas</p>
                                        <p class="text-sm text-surface-500">Añade variantes como color, tamaño, etc.</p>
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </p-card>
                </div>

                <!-- Panel Lateral -->
                <div class="col-span-12 lg:col-span-4">
                    <p-card header="Categoría y Estado">
                        <div class="flex flex-col gap-4">
                            <div>
                                <label class="block mb-2 font-semibold">Categoría</label>
                                <p-select
                                    [options]="categories"
                                    [(ngModel)]="product.category"
                                    placeholder="Selecciona una categoría"
                                    styleClass="w-full">
                                </p-select>
                            </div>

                            <div>
                                <label class="block mb-2 font-semibold">Proveedor</label>
                                <p-select
                                    [options]="suppliers"
                                    [(ngModel)]="product.supplierId"
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Selecciona un proveedor"
                                    styleClass="w-full"
                                    [filter]="true"
                                    filterBy="name,contactName">
                                    <ng-template #selectedItem let-supplier>
                                        <div *ngIf="supplier">
                                            <div class="font-semibold">{{ supplier.name }}</div>
                                            <div class="text-sm text-surface-500">{{ supplier.contactName }}</div>
                                        </div>
                                    </ng-template>
                                    <ng-template #item let-supplier>
                                        <div>
                                            <div class="font-semibold">{{ supplier.name }}</div>
                                            <div class="text-sm text-surface-500">{{ supplier.contactName }}</div>
                                        </div>
                                    </ng-template>
                                </p-select>
                            </div>

                            <div>
                                <label class="block mb-2 font-semibold">Estado</label>
                                <p-select
                                    [options]="statusOptions"
                                    [(ngModel)]="product.status"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Selecciona un estado"
                                    styleClass="w-full">
                                </p-select>
                            </div>
                        </div>
                    </p-card>

                    <p-card header="Tags" styleClass="mt-4">
                        <div class="mb-4">
                            <div class="flex gap-2">
                                <input 
                                    pInputText 
                                    [(ngModel)]="newTag" 
                                    placeholder="Añadir tag"
                                    (keyup.enter)="addTag()"
                                    class="flex-1" />
                                <p-button 
                                    icon="pi pi-plus" 
                                    (onClick)="addTag()"
                                    [disabled]="!newTag">
                                </p-button>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <p-chip 
                                *ngFor="let tag of product.tags" 
                                [label]="tag"
                                [removable]="true"
                                (onRemove)="removeTag(tag)">
                            </p-chip>
                        </div>
                    </p-card>

                    <div class="flex flex-col gap-2 mt-4">
                        <p-button 
                            label="Guardar Producto" 
                            icon="pi pi-check"
                            (onClick)="saveProduct()"
                            styleClass="w-full">
                        </p-button>
                        <p-button 
                            label="Cancelar" 
                            icon="pi pi-times"
                            (onClick)="goBack()"
                            styleClass="w-full"
                            [outlined]="true">
                        </p-button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dialog para Variante -->
        <p-dialog 
            [(visible)]="variantDialogVisible" 
            [header]="editingVariantIndex !== null ? 'Editar Variante' : 'Nueva Variante'"
            [modal]="true"
            [style]="{ width: '500px' }">
            
            <div class="flex flex-col gap-4">
                <div>
                    <label class="block mb-2 font-semibold">SKU *</label>
                    <input 
                        pInputText 
                        [(ngModel)]="currentVariant.sku" 
                        placeholder="Ej: PROD-001-R-M"
                        class="w-full" />
                </div>

                <div>
                    <label class="block mb-2 font-semibold">Color</label>
                    <input 
                        pInputText 
                        [(ngModel)]="currentVariant.color" 
                        placeholder="Ej: Rojo, Azul, Negro"
                        class="w-full" />
                </div>

                <div>
                    <label class="block mb-2 font-semibold">Tamaño</label>
                    <input 
                        pInputText 
                        [(ngModel)]="currentVariant.size" 
                        placeholder="Ej: S, M, L, XL, 40, 42"
                        class="w-full" />
                </div>

                <div>
                    <label class="block mb-2 font-semibold">Stock *</label>
                    <p-inputNumber 
                        [(ngModel)]="currentVariant.stock" 
                        [showButtons]="true"
                        [min]="0"
                        styleClass="w-full">
                    </p-inputNumber>
                </div>

                <div>
                    <label class="block mb-2 font-semibold">Precio *</label>
                    <p-inputNumber 
                        [(ngModel)]="currentVariant.price" 
                        mode="currency" 
                        currency="USD"
                        locale="en-US"
                        [minFractionDigits]="2"
                        styleClass="w-full">
                    </p-inputNumber>
                </div>
            </div>

            <ng-template #footer>
                <p-button 
                    label="Cancelar" 
                    icon="pi pi-times"
                    (onClick)="variantDialogVisible = false"
                    [outlined]="true">
                </p-button>
                <p-button 
                    label="Guardar" 
                    icon="pi pi-check"
                    (onClick)="saveVariant()">
                </p-button>
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        :host ::ng-deep {
            .p-card-header {
                font-weight: 600;
                font-size: 1.25rem;
            }
        }
    `]
})
export class ProductForm implements OnInit {
    isEditMode: boolean = false;
    productId: string | null = null;

    product: ProductWithVariants = {
        code: '',
        name: '',
        description: '',
        basePrice: 0,
        category: '',
        images: [],
        status: 'draft',
        tags: [],
        variants: []
    };

    currentVariant: ProductVariant = {};
    editingVariantIndex: number | null = null;
    variantDialogVisible: boolean = false;
    newTag: string = '';

    categories: string[] = [
        'Ropa',
        'Calzado',
        'Accesorios',
        'Electrónica',
        'Hogar',
        'Deportes',
        'Otros'
    ];

    statusOptions = [
        { label: 'Borrador', value: 'draft' },
        { label: 'Publicado', value: 'published' },
        { label: 'Archivado', value: 'archived' }
    ];

    suppliers: Supplier[] = [];

    constructor(
        private productService: ProductService,
        private supplierService: SupplierService,
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.loadSuppliers();
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.productId = params['id'];
                this.loadProduct(params['id']);
            }
        });
    }

    loadSuppliers(): void {
        this.suppliers = this.supplierService.getActiveSuppliers();
    }

    async loadProduct(id: string): Promise<void> {
        const product = await this.productService.getProductById(id);
        if (product) {
            this.product = { ...product };
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Producto no encontrado'
            });
            this.goBack();
        }
    }

    onImageSelect(event: any): void {
        const files = event.currentFiles || event.files;
        if (!files || files.length === 0) return;

        for (let file of files) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const base64Image = e.target.result;
                // Evitar duplicados si la imagen ya existe
                if (!this.product.images.includes(base64Image)) {
                    this.product.images.push(base64Image);
                }
            };
            reader.readAsDataURL(file);
        }

        // Limpiar la lista del componente para que no se queden ahí los nombres de archivo
        if (event.originalEvent) {
            this.messageService.add({
                severity: 'info',
                summary: 'Imágenes añadidas',
                detail: `${files.length} imágenes procesadas`
            });
        }
    }

    removeImage(index: number): void {
        this.product.images.splice(index, 1);
    }

    showVariantDialog(): void {
        this.currentVariant = {
            sku: '',
            color: '',
            size: '',
            stock: 0,
            price: this.product.basePrice
        };
        this.editingVariantIndex = null;
        this.variantDialogVisible = true;
    }

    editVariant(index: number): void {
        this.currentVariant = { ...this.product.variants[index] };
        this.editingVariantIndex = index;
        this.variantDialogVisible = true;
    }

    saveVariant(): void {
        if (!this.currentVariant.sku || this.currentVariant.stock === undefined || !this.currentVariant.price) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor completa los campos requeridos (SKU, Stock, Precio)'
            });
            return;
        }

        if (this.editingVariantIndex !== null) {
            this.product.variants[this.editingVariantIndex] = { ...this.currentVariant };
        } else {
            this.product.variants.push({ ...this.currentVariant });
        }

        this.variantDialogVisible = false;
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Variante guardada correctamente'
        });
    }

    deleteVariant(index: number): void {
        this.product.variants.splice(index, 1);
        this.messageService.add({
            severity: 'info',
            summary: 'Eliminado',
            detail: 'Variante eliminada'
        });
    }

    addTag(): void {
        if (this.newTag && !this.product.tags.includes(this.newTag)) {
            this.product.tags.push(this.newTag);
            this.newTag = '';
        }
    }

    removeTag(tag: string): void {
        this.product.tags = this.product.tags.filter(t => t !== tag);
    }

    async saveProduct(): Promise<void> {
        if (!this.product.name || !this.product.code || !this.product.basePrice) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor completa los campos requeridos (Nombre, Código, Precio)'
            });
            return;
        }

        try {
            if (this.isEditMode && this.productId) {
                const result = await this.productService.updateProduct(this.productId, this.product);
                if (result) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Producto actualizado correctamente'
                    });
                } else {
                    throw new Error('Error al actualizar');
                }
            } else {
                const result = await this.productService.addProduct(this.product);
                if (result) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Producto creado correctamente'
                    });
                } else {
                    throw new Error('Error al crear');
                }
            }

            setTimeout(() => {
                this.goBack();
            }, 1000);
        } catch (error) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error instanceof Error ? error.message : 'No se pudo guardar el producto'
            });
        }
    }

    goBack(): void {
        this.router.navigate(['/productos']);
    }
}
