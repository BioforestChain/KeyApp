import { z } from 'zod'

const MiniappCategorySchema = z.enum([
  'defi',
  'nft',
  'tools',
  'games',
  'social',
  'exchange',
  'other',
])

const SplashScreenSchema = z.union([
  z.literal(true),
  z.object({
    timeout: z.number().int().positive().optional(),
  }).passthrough(),
])

const CapsuleThemeSchema = z.enum(['auto', 'dark', 'light'])

const TargetDesktopSchema = z.enum(['stack', 'mine'])

export const MiniappManifestSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    longDescription: z.string().optional(),
    icon: z.string(),
    url: z.string(),
    version: z.string(),
    author: z.string().optional(),
    website: z.string().optional(),
    category: MiniappCategorySchema.optional(),
    tags: z.array(z.string()).optional(),
    permissions: z.array(z.string()).optional(),
    chains: z.array(z.string()).optional(),
    screenshots: z.array(z.string()).optional(),
    minWalletVersion: z.string().optional(),
    publishedAt: z.string().optional(),
    updatedAt: z.string().optional(),
    beta: z.boolean().optional(),
    officialScore: z.number().min(0).max(100).optional(),
    communityScore: z.number().min(0).max(100).optional(),
    splashScreen: SplashScreenSchema.optional(),
    capsuleTheme: CapsuleThemeSchema.optional(),
    targetDesktop: TargetDesktopSchema.optional(),
    themeColor: z.string().optional(),
    themeColorFrom: z.string().optional(),
    themeColorTo: z.string().optional(),
  })
  .passthrough()

export const EcosystemSourceSchema = z
  .object({
    name: z.string(),
    version: z.string(),
    updated: z.string(),
    icon: z.string().optional(),
    search: z
      .object({
        urlTemplate: z.string(),
      })
      .passthrough()
      .optional(),
    apps: z.array(MiniappManifestSchema),
  })
  .passthrough()

export const EcosystemSearchResponseSchema = z
  .object({
    version: z.string(),
    data: z.array(MiniappManifestSchema),
  })
  .passthrough()

