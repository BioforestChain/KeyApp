import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PermissionList } from './PermissionList'
import { TestI18nProvider } from '@/test/i18n-mock'

describe('PermissionList', () => {
  it('renders permission labels', () => {
    render(
      <TestI18nProvider>
        <PermissionList permissions={['viewAddress', 'viewPublicKey']} />
      </TestI18nProvider>
    )

    expect(screen.getByText('查看你的钱包地址')).toBeInTheDocument()
    expect(screen.getByText('查看你的公钥')).toBeInTheDocument()
  })
})

