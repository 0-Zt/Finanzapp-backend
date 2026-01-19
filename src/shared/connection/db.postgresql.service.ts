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

export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in';

export interface QueryFilter {
  column: string;
  operator: FilterOperator;
  value: any;
}

@Injectable()
export class DbPostgresqlService {
  private readonly logger = new Logger(DbPostgresqlService.name);
  private readonly supabaseUrl: string;
  private readonly supabaseAnonKey: string;

  constructor() {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Las variables SUPABASE_URL y SUPABASE_ANON_KEY deben estar definidas.');
    }

    this.supabaseUrl = SUPABASE_URL;
    this.supabaseAnonKey = SUPABASE_ANON_KEY;
    this.logger.log('Cliente Supabase inicializado correctamente');
  }

  private getClient(accessToken?: string): SupabaseClient {
    if (!accessToken) {
      return createClient(this.supabaseUrl, this.supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }

    return createClient(this.supabaseUrl, this.supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  
  /**
   * Realiza una consulta SELECT en la tabla indicada con los filtros y opciones opcionales.
   * @param table Nombre de la tabla.
   * @param queryOptions Objeto con condiciones (ej. { user_id: 1 }).
   * @param options Opciones adicionales como orderBy, order, limit y offset.
   * @param accessToken JWT del usuario para respetar RLS.
   */
  async select(
    table: string,
    queryOptions: any = {},
    options: SelectOptions = {},
    accessToken?: string,
  ): Promise<any> {
    // Inicia la consulta
    const client = this.getClient(accessToken);
    let query = client
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
   * Realiza una consulta SELECT con filtros avanzados (gte, lte, in, etc).
   * @param table Nombre de la tabla.
   * @param filters Lista de filtros con operador.
   * @param options Opciones de orden y paginacion.
   * @param accessToken JWT del usuario para respetar RLS.
   */
  async selectWithFilters(
    table: string,
    filters: QueryFilter[] = [],
    options: SelectOptions = {},
    accessToken?: string,
  ): Promise<any> {
    const client = this.getClient(accessToken);
    let query = client.from(table).select('*');

    for (const filter of filters) {
      switch (filter.operator) {
        case 'eq':
          query = query.eq(filter.column, filter.value);
          break;
        case 'neq':
          query = query.neq(filter.column, filter.value);
          break;
        case 'gt':
          query = query.gt(filter.column, filter.value);
          break;
        case 'gte':
          query = query.gte(filter.column, filter.value);
          break;
        case 'lt':
          query = query.lt(filter.column, filter.value);
          break;
        case 'lte':
          query = query.lte(filter.column, filter.value);
          break;
        case 'in':
          query = query.in(filter.column, filter.value);
          break;
        default:
          break;
      }
    }

    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.order !== 'desc' });
    }

    if (options.limit !== undefined) {
      if (options.offset !== undefined) {
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
   * @param accessToken JWT del usuario para respetar RLS.
   */
  async insert(table: string, payload: any, accessToken?: string): Promise<any> {
    const client = this.getClient(accessToken);
    const { data, error } = await client
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
   * @param accessToken JWT del usuario para respetar RLS.
   */
  async update(table: string, payload: any, queryOptions: any, accessToken?: string): Promise<any> {
    const client = this.getClient(accessToken);
    const { data, error } = await client
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
   * @param accessToken JWT del usuario para respetar RLS.
   */
  async delete(table: string, queryOptions: any, accessToken?: string): Promise<any> {
    const client = this.getClient(accessToken);
    const { data, error } = await client
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
  async executeSql(query: string, params?: any, accessToken?: string): Promise<any> {
    const client = this.getClient(accessToken);
    const { data, error } = await client.rpc('execute_sql', { query, params });
    if (error) {
      this.logger.error(`Error al ejecutar SQL: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }
}
