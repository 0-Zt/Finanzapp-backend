// src/db/postgresql.service.ts
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();
export interface SelectOptions {
  orderBy?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

@Injectable()
export class DbPostgresqlService {
  private readonly logger = new Logger(DbPostgresqlService.name);
  private readonly supabase: SupabaseClient;

  constructor() {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Las variables SUPABASE_URL y SUPABASE_ANON_KEY deben estar definidas.');
    }

    // Inicializa el cliente de Supabase
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    this.logger.log('Cliente Supabase inicializado correctamente');
  }

  
  /**
   * Realiza una consulta SELECT en la tabla indicada con los filtros y opciones opcionales.
   * @param table Nombre de la tabla.
   * @param queryOptions Objeto con condiciones (ej. { user_id: 1 }).
   * @param options Opciones adicionales como orderBy, order, limit y offset.
   */
  async select(table: string, queryOptions: any = {}, options: SelectOptions = {}): Promise<any> {
    // Inicia la consulta
    let query = this.supabase
      .from(table)
      .select('*')
      .match(queryOptions);

    // Agregar ordenamiento si se especifica
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.order !== 'desc' });
    }

    // Agregar paginación si se especifica un límite
    if (options.limit !== undefined) {
      // Si además se especifica offset, usamos .range() para establecer ambos
      if (options.offset !== undefined) {
        // .range(from, to) donde to = offset + limit - 1
        query = query.range(options.offset, options.offset + options.limit - 1);
      } else {
        query = query.limit(options.limit);
      }
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error(`Error al seleccionar datos de ${table}: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  /**
   * Inserta datos en la tabla indicada.
   * @param table Nombre de la tabla.
   * @param payload Objeto o arreglo de objetos a insertar.
   */
  async insert(table: string, payload: any): Promise<any> {
    const { data, error } = await this.supabase
      .from(table)
      .insert(payload);

    if (error) {
      this.logger.error(`Error al insertar en ${table}: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  /**
   * Actualiza registros en la tabla indicada según la condición.
   * @param table Nombre de la tabla.
   * @param payload Datos a actualizar.
   * @param queryOptions Condiciones para identificar los registros a actualizar.
   */
  async update(table: string, payload: any, queryOptions: any): Promise<any> {
    const { data, error } = await this.supabase
      .from(table)
      .update(payload)
      .match(queryOptions);

    if (error) {
      this.logger.error(`Error al actualizar en ${table}: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  /**
   * Elimina registros de la tabla indicada según la condición.
   * @param table Nombre de la tabla.
   * @param queryOptions Condiciones para identificar los registros a eliminar.
   */
  async delete(table: string, queryOptions: any): Promise<any> {
    const { data, error } = await this.supabase
      .from(table)
      .delete()
      .match(queryOptions);

    if (error) {
      this.logger.error(`Error al eliminar de ${table}: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  /**
   * (Opcional) Ejecuta una consulta SQL en bruto mediante RPC.
   * Requiere tener configurada una función almacenada en la BD.
   * @param query Consulta SQL.
   * @param params Parámetros para la consulta.
   */
  async executeSql(query: string, params?: any): Promise<any> {
    const { data, error } = await this.supabase.rpc('execute_sql', { query, params });
    if (error) {
      this.logger.error(`Error al ejecutar SQL: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }
}
