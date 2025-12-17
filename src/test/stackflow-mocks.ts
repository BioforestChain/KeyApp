import { vi } from 'vitest';

/**
 * Mock navigate function for testing
 */
export const mockNavigate = vi.fn();
export const mockGoBack = vi.fn();
export const mockPush = vi.fn();
export const mockPop = vi.fn();
export const mockReplace = vi.fn();

/**
 * Default activity params for testing
 */
let mockActivityParams: Record<string, unknown> = {};

/**
 * Set mock activity params for testing
 */
export function setMockActivityParams(params: Record<string, unknown>) {
  mockActivityParams = params;
}

/**
 * Reset all mocks
 */
export function resetStackflowMocks() {
  mockNavigate.mockReset();
  mockGoBack.mockReset();
  mockPush.mockReset();
  mockPop.mockReset();
  mockReplace.mockReset();
  mockActivityParams = {};
}

/**
 * Setup Stackflow mocks for vi.mock
 */
export function setupStackflowMocks(params: Record<string, unknown> = {}) {
  mockActivityParams = params;
  
  vi.mock('@/stackflow', () => ({
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    }),
    useActivityParams: () => mockActivityParams,
    useFlow: () => ({
      push: mockPush,
      pop: mockPop,
      replace: mockReplace,
    }),
    Stack: ({ children }: { children?: React.ReactNode }) => children,
    ActivityParamsProvider: ({ children }: { children?: React.ReactNode }) => children,
  }));
}

// Auto-setup mocks when this module is imported
vi.mock('@/stackflow', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useActivityParams: <T extends Record<string, unknown>>() => mockActivityParams as T,
  useFlow: () => ({
    push: mockPush,
    pop: mockPop,
    replace: mockReplace,
  }),
  Stack: ({ children }: { children?: React.ReactNode }) => children,
  ActivityParamsProvider: ({ children }: { children?: React.ReactNode }) => children,
}));
