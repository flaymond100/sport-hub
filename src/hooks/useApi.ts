import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, ApiResponse, ApiError } from '../services/api';

// Generic hook for GET requests
export function useApiGet<T>(
  endpoint: string,
  queryKey: string[],
  options?: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
  }
) {
  return useQuery<ApiResponse<T>, ApiError>({
    queryKey,
    queryFn: () => apiService.get<T>(endpoint),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    cacheTime: options?.cacheTime ?? 10 * 60 * 1000, // 10 minutes
  });
}

// Generic hook for POST requests
export function useApiPost<T, D = any>(
  endpoint: string,
  options?: {
    onSuccess?: (data: ApiResponse<T>) => void;
    onError?: (error: ApiError) => void;
  }
) {
  return useMutation<ApiResponse<T>, ApiError, D>({
    mutationFn: (data: D) => apiService.post<T>(endpoint, data),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

// Generic hook for PUT requests
export function useApiPut<T, D = any>(
  endpoint: string,
  options?: {
    onSuccess?: (data: ApiResponse<T>) => void;
    onError?: (error: ApiError) => void;
  }
) {
  return useMutation<ApiResponse<T>, ApiError, D>({
    mutationFn: (data: D) => apiService.put<T>(endpoint, data),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

// Generic hook for DELETE requests
export function useApiDelete<T>(
  endpoint: string,
  options?: {
    onSuccess?: (data: ApiResponse<T>) => void;
    onError?: (error: ApiError) => void;
  }
) {
  return useMutation<ApiResponse<T>, ApiError>({
    mutationFn: () => apiService.delete<T>(endpoint),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

// Hook for invalidating queries
export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  
  return (queryKey: string[]) => {
    queryClient.invalidateQueries({ queryKey });
  };
}
