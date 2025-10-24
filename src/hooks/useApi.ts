import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { ApiResponse, ApiError } from '../services/api';

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
    gcTime: options?.cacheTime ?? 10 * 60 * 1000, // 10 minutes
  });
}


