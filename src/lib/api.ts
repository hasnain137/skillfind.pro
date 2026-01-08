// API utility functions for making requests to our backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  subcategories: Subcategory[];
  _count?: {
    professionalServices: number;
  };
}

interface Subcategory {
  id: string;
  name: string;
  description: string | null;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    return {
      success: false,
      error: 'Network error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Categories API functions
export const categoriesApi = {
  // Get all categories with subcategories
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    return apiRequest<Category[]>('/categories');
  },

  // Get a single category by ID
  getById: async (id: string): Promise<ApiResponse<Category>> => {
    return apiRequest<Category>(`/categories/${id}`);
  },

  // Create a new category (admin only)
  create: async (categoryData: {
    name: string;
    description?: string;
    icon?: string;
  }): Promise<ApiResponse<Category>> => {
    return apiRequest<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  // Update a category (admin only)
  update: async (
    id: string,
    categoryData: {
      name?: string;
      description?: string;
      icon?: string;
    }
  ): Promise<ApiResponse<Category>> => {
    return apiRequest<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  // Delete a category (admin only)
  delete: async (id: string): Promise<ApiResponse<null>> => {
    return apiRequest<null>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// Export types for use in components
export type { Category, Subcategory, ApiResponse };