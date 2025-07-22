import { api } from './api';

export interface Test {
  id: string;
  name: string;
  category: string;
  description?: string;
  normalRange?: string;
  unit?: string;
  type: 'blood' | 'urine' | 'imaging' | 'biopsy' | 'culture' | 'other';
  preparationInstructions?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestSearchParams {
  search?: string;
  category?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface CreateTestData {
  name: string;
  category: string;
  description?: string;
  normalRange?: string;
  unit?: string;
  type: 'blood' | 'urine' | 'imaging' | 'biopsy' | 'culture' | 'other';
  preparationInstructions?: string;
}

export interface TestResponse {
  success: boolean;
  data: {
    tests: Test[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface SingleTestResponse {
  success: boolean;
  data: Test;
}

class TestService {
  // Default tests that are commonly used
  private defaultTests: Test[] = [
    {
      id: 'default-1',
      name: 'Complete Blood Count (CBC)',
      category: 'Hematology',
      description: 'Measures different components of blood',
      type: 'blood',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'default-2',
      name: 'Basic Metabolic Panel (BMP)',
      category: 'Chemistry',
      description: 'Measures glucose, electrolytes, and kidney function',
      type: 'blood',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'default-3',
      name: 'Lipid Panel',
      category: 'Chemistry',
      description: 'Measures cholesterol and triglycerides',
      type: 'blood',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'default-4',
      name: 'Thyroid Function Tests',
      category: 'Endocrinology',
      description: 'Measures TSH, T3, and T4 levels',
      type: 'blood',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'default-5',
      name: 'Urinalysis',
      category: 'Urology',
      description: 'Analysis of urine components',
      type: 'urine',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'default-6',
      name: 'Chest X-Ray',
      category: 'Radiology',
      description: 'Imaging of chest and lungs',
      type: 'imaging',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'default-7',
      name: 'ECG/EKG',
      category: 'Cardiology',
      description: 'Electrocardiogram to assess heart rhythm',
      type: 'other',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'default-8',
      name: 'HbA1c',
      category: 'Endocrinology',
      description: 'Measures average blood sugar over 2-3 months',
      type: 'blood',
      normalRange: '4.0-5.6%',
      unit: '%',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  async getTests(params: TestSearchParams = {}): Promise<Test[]> {
    try {
      // For now, return default tests since backend may not have test endpoints
      // In future, this can be replaced with actual API call:
      // const queryParams = new URLSearchParams();
      // if (params.search) queryParams.append('search', params.search);
      // const response = await api.get<TestResponse>(`/tests?${queryParams.toString()}`);
      // return response.data.tests;
      
      let tests = [...this.defaultTests];
      
      // Apply search filter
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        tests = tests.filter(test => 
          test.name.toLowerCase().includes(searchLower) ||
          test.category.toLowerCase().includes(searchLower) ||
          (test.description && test.description.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply category filter
      if (params.category) {
        tests = tests.filter(test => test.category === params.category);
      }
      
      // Apply type filter
      if (params.type) {
        tests = tests.filter(test => test.type === params.type);
      }
      
      // Apply pagination
      const limit = params.limit || 20;
      const page = params.page || 1;
      const start = (page - 1) * limit;
      const end = start + limit;
      
      return tests.slice(start, end);
    } catch (error) {
      console.error('Error fetching tests:', error);
      // Return default tests as fallback
      return this.defaultTests;
    }
  }

  async searchTests(query: string, limit: number = 20): Promise<Test[]> {
    try {
      if (!query || query.length < 2) {
        return this.defaultTests.slice(0, limit);
      }

      return await this.getTests({ search: query, limit });
    } catch (error) {
      console.error('Error searching tests:', error);
      return this.defaultTests.slice(0, limit);
    }
  }

  async getTestSuggestions(query: string, limit: number = 10): Promise<Test[]> {
    try {
      return await this.searchTests(query, limit);
    } catch (error) {
      console.error('Error fetching test suggestions:', error);
      return [];
    }
  }

  async createTest(testData: CreateTestData): Promise<Test> {
    try {
      // For now, create a local test object
      // In future, this can be replaced with actual API call:
      // const response = await api.post<SingleTestResponse>('/tests', testData);
      // return response.data;
      
      const newTest: Test = {
        ...testData,
        id: Math.random().toString(36).substring(2, 9),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return newTest;
    } catch (error) {
      console.error('Error creating test:', error);
      throw error;
    }
  }

  // Utility method to format test display name
  formatTestName(test: Test): string {
    let name = test.name;
    if (test.category) {
      name += ` (${test.category})`;
    }
    return name;
  }

  // Get test categories
  getTestCategories(): string[] {
    return [
      'Hematology',
      'Chemistry',
      'Endocrinology',
      'Cardiology',
      'Urology',
      'Radiology',
      'Microbiology',
      'Pathology',
      'Immunology',
      'Other'
    ];
  }

  // Get test types
  getTestTypes(): Array<{ value: 'blood' | 'urine' | 'imaging' | 'biopsy' | 'culture' | 'other'; label: string }> {
    return [
      { value: 'blood', label: 'Blood Test' },
      { value: 'urine', label: 'Urine Test' },
      { value: 'imaging', label: 'Imaging' },
      { value: 'biopsy', label: 'Biopsy' },
      { value: 'culture', label: 'Culture' },
      { value: 'other', label: 'Other' },
    ];
  }
}

export const testService = new TestService();