import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  /**
   * Convierte nombres de propiedades de camelCase a snake_case
   * Excluye campos del sistema para evitar errores de actualización
   */
  private toSnakeCase(obj: any): any {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.toSnakeCase(item));
    }

    // No procesar objetos Date directamente como objetos planos
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    const snakeCaseObj: any = {};
    Object.keys(obj).forEach(key => {
      // Excluir campos que no deben actualizarse directamente o que causan errores
      if (['id', 'createdAt', 'updatedAt', 'created_at', 'updated_at'].includes(key)) {
        return;
      }

      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      snakeCaseObj[snakeKey] = this.toSnakeCase(obj[key]);
    });
    return snakeCaseObj;
  }

  /**
   * Convierte nombres de propiedades de snake_case a camelCase
   */
  private toCamelCase(obj: any): any {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.toCamelCase(item));
    }

    const camelCaseObj: any = {};
    Object.keys(obj).forEach(key => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelCaseObj[camelKey] = this.toCamelCase(obj[key]);
    });
    return camelCaseObj;
  }

  /**
   * Obtiene el cliente de Supabase para operaciones personalizadas
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }

  // ==================== AUTENTICACIÓN ====================

  /**
   * Registra un nuevo usuario
   */
  async signUp(email: string, password: string, metadata?: any) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Inicia sesión con email y contraseña
   */
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  /**
   * Cierra sesión
   */
  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Obtiene la sesión actual
   */
  async getSession() {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  /**
   * Obtiene el usuario actual
   */
  async getCurrentUser() {
    const { data, error } = await this.supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  }

  /**
   * Escucha cambios en la autenticación
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Envía email de recuperación de contraseña
   */
  async resetPassword(email: string) {
    const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) throw error;
    return data;
  }

  /**
   * Actualiza la contraseña del usuario
   */
  async updatePassword(newPassword: string) {
    const { data, error } = await this.supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return data;
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(updates: any) {
    const { data, error } = await this.supabase.auth.updateUser({
      data: updates
    });

    if (error) throw error;
    return data;
  }

  // ==================== PRODUCTOS ====================

  /**
   * Obtiene todos los productos
   */
  async getProducts() {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Convertir a camelCase y agregar variants vacío a cada producto
    const camelCaseData = this.toCamelCase(data);
    return camelCaseData?.map((product: any) => ({ ...product, variants: product.variants || [] })) || [];
  }

  /**
   * Obtiene un producto por ID
   */
  async getProductById(id: string) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Convertir a camelCase y agregar variants vacío
    const camelCaseData = this.toCamelCase(data);
    return { ...camelCaseData, variants: camelCaseData?.variants || [] };
  }

  /**
   * Crea un nuevo producto
   */
  async createProduct(product: any) {
    const { variants, ...productData } = product;

    // El nuevo toSnakeCase maneja la limpieza y remoción de campos del sistema
    const snakeCaseProduct = this.toSnakeCase(productData);

    console.log('Creando producto con datos:', snakeCaseProduct);

    const { data, error } = await this.supabase
      .from('products')
      .insert([snakeCaseProduct])
      .select()
      .single();

    if (error) {
      console.error('Error de Supabase al crear producto:', error);
      throw error;
    }

    const camelCaseData = this.toCamelCase(data);
    return { ...camelCaseData, variants: variants || [] };
  }

  /**
   * Actualiza un producto existente
   */
  async updateProduct(id: string, updates: any) {
    // Extraer variantes del objeto de actualización
    const { variants, ...updateData } = updates;

    // Convertir a snake_case y REMOVER el ID del cuerpo para evitar conflictos de llave primaria
    const snakeCaseUpdates = this.toSnakeCase(updateData);

    console.log('Actualizando producto ID:', id, 'con datos:', snakeCaseUpdates);

    const { data, error } = await this.supabase
      .from('products')
      .update(snakeCaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error de Supabase al actualizar producto:', error);
      throw error;
    }

    // Sincronizar respuesta con camelCase y variants
    const camelCaseData = this.toCamelCase(data);
    return { ...camelCaseData, variants: variants || camelCaseData.variants || [] };
  }

  /**
   * Elimina un producto
   */
  async deleteProduct(id: string) {
    const { data, error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==================== PROVEEDORES ====================

  /**
   * Obtiene todos los proveedores
   */
  async getSuppliers() {
    const { data, error } = await this.supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return this.toCamelCase(data);
  }

  /**
   * Crea un nuevo proveedor
   */
  async createSupplier(supplier: any) {
    // Asegurar valores por defecto para campos opcionales
    const supplierToInsert = {
      ...supplier,
      address: supplier.address || null,
      city: supplier.city || null,
      country: supplier.country || null,
      website: supplier.website || null,
      active: supplier.active !== undefined ? supplier.active : true
    };

    // Convertir a snake_case para Supabase
    const snakeCaseSupplier = this.toSnakeCase(supplierToInsert);

    const { data, error } = await this.supabase
      .from('suppliers')
      .insert([snakeCaseSupplier])
      .select()
      .single();

    if (error) {
      console.error('Error de Supabase al crear proveedor:', error);
      throw error;
    }
    return this.toCamelCase(data);
  }

  /**
   * Actualiza un proveedor
   */
  async updateSupplier(id: string, updates: any) {
    // Convertir a snake_case para Supabase
    const snakeCaseUpdates = this.toSnakeCase(updates);

    const { data, error } = await this.supabase
      .from('suppliers')
      .update(snakeCaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error de Supabase al actualizar proveedor:', error);
      throw error;
    }
    return this.toCamelCase(data);
  }

  /**
   * Elimina un proveedor
   */
  async deleteSupplier(id: string) {
    const { data, error } = await this.supabase
      .from('suppliers')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.toCamelCase(data);
  }

  // ==================== UBICACIONES ====================

  /**
   * Obtiene todas las ubicaciones
   */
  async getLocations() {
    const { data, error } = await this.supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return this.toCamelCase(data);
  }

  /**
   * Crea una nueva ubicación
   */
  async createLocation(location: any) {
    // Asegurar valores por defecto para campos opcionales
    const locationToInsert = {
      ...location,
      content: location.content || null,
      customName: location.customName !== undefined ? location.customName : false,
      active: location.active !== undefined ? location.active : true,
      binQty: location.binQty || 0
    };

    // Convertir a snake_case para Supabase
    const snakeCaseLocation = this.toSnakeCase(locationToInsert);

    const { data, error } = await this.supabase
      .from('locations')
      .insert([snakeCaseLocation])
      .select()
      .single();

    if (error) {
      console.error('Error de Supabase al crear ubicación:', error);
      throw error;
    }
    return this.toCamelCase(data);
  }

  /**
   * Actualiza una ubicación
   */
  async updateLocation(id: string, updates: any) {
    // Convertir a snake_case para Supabase
    const snakeCaseUpdates = this.toSnakeCase(updates);

    const { data, error } = await this.supabase
      .from('locations')
      .update(snakeCaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error de Supabase al actualizar ubicación:', error);
      throw error;
    }
    return this.toCamelCase(data);
  }

  /**
   * Elimina una ubicación
   */
  async deleteLocation(id: string) {
    const { data, error } = await this.supabase
      .from('locations')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.toCamelCase(data);
  }

  /**
   * Genera ubicaciones en masa
   */
  async generateLocations(params: any) {
    const locations = [];

    for (let row = params.rowMin; row <= params.rowMax; row++) {
      for (let bay = params.bayMin; bay <= params.bayMax; bay++) {
        for (let level = params.levelMin; level <= params.levelMax; level++) {
          // El usuario quiere el patrón consecutivo TYPE-CODE (ej: REGULAR-122)
          const code = (row * 100) + (bay * 10) + level;
          const storageName = `${params.type}-${code}`;

          locations.push({
            zone: params.zone || '-',
            category: params.category,
            type: params.type,
            area: params.area,
            row: row.toString(),
            bay: bay.toString(),
            level: level.toString(),
            storage_name: storageName,
            bin_qty: 0,
            content: params.content || '',
            active: true
          });
        }
      }
    }

    console.log('Generando ubicaciones en masa:', locations.length);

    const { data, error } = await this.supabase
      .from('locations')
      .insert(locations)
      .select();

    if (error) {
      console.error('Error de Supabase al generar ubicaciones:', error);
      throw error;
    }

    return this.toCamelCase(data);
  }

  // ==================== BINS ====================

  /**
   * Obtiene bins de una ubicación
   */
  async getBinsByLocation(locationId: string) {
    const { data, error } = await this.supabase
      .from('bins')
      .select('*')
      .eq('location_id', locationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Crea un nuevo bin
   */
  async createBin(bin: any) {
    const { data, error } = await this.supabase
      .from('bins')
      .insert([bin])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Actualiza un bin
   */
  async updateBin(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from('bins')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Elimina un bin
   */
  async deleteBin(id: string) {
    const { data, error } = await this.supabase
      .from('bins')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==================== CONSULTAS PERSONALIZADAS ====================

  /**
   * Ejecuta una consulta SQL personalizada (requiere función RPC en Supabase)
   */
  async executeRpc(functionName: string, params?: any) {
    const { data, error } = await this.supabase
      .rpc(functionName, params);

    if (error) throw error;
    return data;
  }

  /**
   * Realiza una búsqueda de texto completo
   */
  async searchTable(table: string, column: string, searchTerm: string) {
    const { data, error } = await this.supabase
      .from(table)
      .select('*')
      .ilike(column, `%${searchTerm}%`);

    if (error) throw error;
    return data;
  }
}
