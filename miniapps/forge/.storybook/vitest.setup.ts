import { beforeAll, vi } from 'vitest'
import { setProjectAnnotations } from '@storybook/react-vite'
import * as previewAnnotations from './preview'

// Mock environment variable for Storybook tests
vi.stubEnv('VITE_COT_API_BASE_URL', 'http://mock-api.local')

const annotations = setProjectAnnotations([previewAnnotations])

beforeAll(annotations.beforeAll)
