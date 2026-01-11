/**
 * Rule: enforce
 *
 * 根据文件路径模式，强制要求或禁止使用特定组件
 */

import type { Rule } from 'eslint'
import type { Node, ImportDeclaration } from 'estree'
import type { JSXOpeningElement } from 'estree-jsx'
import { minimatch } from 'minimatch'
import path from 'path'

/** 单条约束规则配置 */
export interface ConstraintRule {
  /** 文件路径 glob 模式 */
  fileMatch: string | string[]
  /** 排除的文件路径模式 */
  fileExclude?: string | string[]
  /** 必须使用的组件名称列表 */
  mustUse?: string[]
  /** 禁止使用的组件名称列表 */
  mustNotUse?: string[]
  /** 组件必须从指定路径导入 { ComponentName: ["@/path1", "@/path2"] } */
  mustImportFrom?: Record<string, string[]>
}

/** 插件配置 */
export interface PluginOptions {
  rules: ConstraintRule[]
}

/** 检查文件是否匹配模式 */
function matchesPatterns(filepath: string, patterns: string | string[]): boolean {
  const patternList = Array.isArray(patterns) ? patterns : [patterns]
  return patternList.some(pattern => minimatch(filepath, pattern))
}

/** 获取适用于当前文件的规则 */
function getApplicableRules(filepath: string, rules: ConstraintRule[]): ConstraintRule[] {
  return rules.filter(rule => {
    const matches = matchesPatterns(filepath, rule.fileMatch)
    const excluded = rule.fileExclude ? matchesPatterns(filepath, rule.fileExclude) : false
    return matches && !excluded
  })
}

export const enforceRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce component usage constraints based on file patterns',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      mustUseComponent:
        'File "{{filename}}" must use component <{{component}} />',
      mustNotUseComponent:
        'File "{{filename}}" must not use component <{{component}} />',
      mustImportFrom:
        'Component "{{component}}" must be imported from one of: {{sources}}',
    },
    schema: [
      {
        type: 'object',
        properties: {
          rules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                fileMatch: {
                  oneOf: [
                    { type: 'string' },
                    { type: 'array', items: { type: 'string' } },
                  ],
                },
                fileExclude: {
                  oneOf: [
                    { type: 'string' },
                    { type: 'array', items: { type: 'string' } },
                  ],
                },
                mustUse: {
                  type: 'array',
                  items: { type: 'string' },
                },
                mustNotUse: {
                  type: 'array',
                  items: { type: 'string' },
                },
                mustImportFrom: {
                  type: 'object',
                  additionalProperties: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
              required: ['fileMatch'],
              additionalProperties: false,
            },
          },
        },
        required: ['rules'],
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename()
    const options: PluginOptions = context.options[0] || { rules: [] }
    const applicableRules = getApplicableRules(filename, options.rules)

    // 如果没有适用的规则，跳过检查
    if (applicableRules.length === 0) {
      return {}
    }

    const basename = path.basename(filename)

    // 收集所有需要检查的组件
    const mustUseComponents = new Set<string>()
    const mustNotUseComponents = new Set<string>()
    const mustImportFrom: Record<string, string[]> = {}

    for (const rule of applicableRules) {
      rule.mustUse?.forEach(c => mustUseComponents.add(c))
      rule.mustNotUse?.forEach(c => mustNotUseComponents.add(c))
      if (rule.mustImportFrom) {
        for (const [component, sources] of Object.entries(rule.mustImportFrom)) {
          mustImportFrom[component] = [
            ...(mustImportFrom[component] || []),
            ...sources,
          ]
        }
      }
    }

    // 追踪使用情况
    const usedComponents = new Set<string>()
    const importedComponents: Record<string, string> = {} // component -> source
    let programNode: Node | null = null

    return {
      Program(node) {
        programNode = node
      },

      ImportDeclaration(node: ImportDeclaration) {
        const source = node.source.value as string
        for (const spec of node.specifiers) {
          if (spec.type === 'ImportSpecifier' && spec.imported.type === 'Identifier') {
            importedComponents[spec.imported.name] = source
          } else if (spec.type === 'ImportDefaultSpecifier') {
            importedComponents[spec.local.name] = source
          }
        }
      },

      JSXOpeningElement(node: JSXOpeningElement & Rule.NodeParentExtension) {
        const name = node.name
        let componentName: string | null = null

        if (name.type === 'JSXIdentifier') {
          componentName = name.name
        } else if (name.type === 'JSXMemberExpression') {
          // Handle Foo.Bar
          if (name.property.type === 'JSXIdentifier') {
            componentName = name.property.name
          }
        }

        if (!componentName) return

        usedComponents.add(componentName)

        // 检查 mustNotUse
        if (mustNotUseComponents.has(componentName)) {
          context.report({
            node: node as unknown as Node,
            messageId: 'mustNotUseComponent',
            data: {
              filename: basename,
              component: componentName,
            },
          })
        }

        // 检查 mustImportFrom
        if (mustImportFrom[componentName]) {
          const actualSource = importedComponents[componentName]
          const allowedSources = mustImportFrom[componentName]
          if (actualSource && !allowedSources.some(s => actualSource.includes(s))) {
            context.report({
              node: node as unknown as Node,
              messageId: 'mustImportFrom',
              data: {
                component: componentName,
                sources: allowedSources.join(', '),
              },
            })
          }
        }
      },

      'Program:exit'() {
        // 检查 mustUse
        for (const component of mustUseComponents) {
          if (!usedComponents.has(component)) {
            context.report({
              node: programNode!,
              messageId: 'mustUseComponent',
              data: {
                filename: basename,
                component,
              },
            })
          }
        }
      },
    }
  },
}
