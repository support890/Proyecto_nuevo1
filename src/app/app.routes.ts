import { Routes } from '@angular/router';
import { AppLayout } from './layout/components/app.layout';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { 
                path: '', 
                redirectTo: 'productos', 
                pathMatch: 'full' 
            },
            {
                path: 'productos',
                data: { breadcrumb: 'Gestión de Productos' },
                canActivate: [authGuard],
                loadComponent: () => import('./pages/ecommerce/product-management-list').then((c) => c.ProductManagementList)
            },
            {
                path: 'productos/nuevo',
                data: { breadcrumb: 'Nuevo Producto' },
                canActivate: [authGuard],
                loadComponent: () => import('./pages/ecommerce/product-form').then((c) => c.ProductForm)
            },
            {
                path: 'productos/editar/:id',
                data: { breadcrumb: 'Editar Producto' },
                canActivate: [authGuard],
                loadComponent: () => import('./pages/ecommerce/product-form').then((c) => c.ProductForm)
            },
            {
                path: 'proveedores',
                data: { breadcrumb: 'Gestión de Proveedores' },
                canActivate: [authGuard],
                loadComponent: () => import('./pages/suppliers/supplier-list').then((c) => c.SupplierList)
            },
            {
                path: 'proveedores/nuevo',
                data: { breadcrumb: 'Nuevo Proveedor' },
                canActivate: [authGuard],
                loadComponent: () => import('./pages/suppliers/supplier-form').then((c) => c.SupplierForm)
            },
            {
                path: 'proveedores/editar/:id',
                data: { breadcrumb: 'Editar Proveedor' },
                canActivate: [authGuard],
                loadComponent: () => import('./pages/suppliers/supplier-form').then((c) => c.SupplierForm)
            },
            {
                path: 'supabase-test',
                data: { breadcrumb: 'Test Supabase' },
                canActivate: [authGuard],
                loadComponent: () => import('./pages/supabase-test/supabase-test.component').then((c) => c.SupabaseTestComponent)
            },
            {
                path: 'ubicaciones',
                data: { breadcrumb: 'Gestión de Ubicaciones' },
                canActivate: [authGuard],
                loadComponent: () => import('./pages/locations/location-list').then((c) => c.LocationList)
            },
            {
                path: 'ubicaciones/nuevo',
                data: { breadcrumb: 'Nueva Ubicación' },
                canActivate: [authGuard],
                loadComponent: () => import('./pages/locations/location-form').then((c) => c.LocationForm)
            },
            {
                path: 'ubicaciones/editar/:id',
                data: { breadcrumb: 'Editar Ubicación' },
                canActivate: [authGuard],
                loadComponent: () => import('./pages/locations/location-form').then((c) => c.LocationForm)
            },
            {
                path: 'ubicaciones/generador',
                data: { breadcrumb: 'Generador de Ubicaciones' },
                canActivate: [authGuard],
                loadComponent: () => import('./pages/locations/location-generator').then((c) => c.LocationGenerator)
            },
            {
                path: 'ubicaciones/:locationId/bins',
                data: { breadcrumb: 'Gestión de Bins' },
                canActivate: [authGuard],
                loadComponent: () => import('./pages/bins/bin-list').then((c) => c.BinList)
            },
            {
                path: 'almacen/disenador',
                data: { breadcrumb: 'Diseñador de Almacén' },
                canActivate: [authGuard],
                loadComponent: () => import('./pages/warehouse/warehouse-designer').then((c) => c.WarehouseDesigner)
            }
        ]
    },
    { 
        path: 'auth/login', 
        loadComponent: () => import('./pages/auth/login').then((c) => c.Login) 
    },
    { 
        path: 'auth/register', 
        loadComponent: () => import('./pages/auth/register').then((c) => c.Register) 
    },
    { 
        path: 'notfound', 
        loadComponent: () => import('./pages/notfound/notfound').then((c) => c.Notfound) 
    },
    { 
        path: '**', 
        redirectTo: '/notfound' 
    }
];
