import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error: string | null;
  success: boolean;
}

export abstract class BaseService {
  protected static handleError(error: PostgrestError | Error | unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return (error as any).message;
    }
    return 'Une erreur inattendue s\'est produite';
  }

  protected static createResponse<T>(
    data: T | null, 
    error: string | null = null
  ): ServiceResponse<T> {
    return {
      data,
      error,
      success: !error && data !== null
    };
  }

  protected static createPaginatedResponse<T>(
    data: T[],
    pagination: PaginatedResponse<T>['pagination'],
    error: string | null = null
  ): PaginatedResponse<T> {
    return {
      data,
      pagination,
      error,
      success: !error
    };
  }

  protected static calculatePagination(
    page: number,
    limit: number,
    total: number
  ) {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  protected static getSupabaseClient() {
    return supabase as any;
  }

  protected static getTypedSupabaseClient() {
    return supabase as typeof supabase;
  }
}