import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QRCode, AddressQRCode } from './qr-code'

describe('QRCode', () => {
  it('renders QR code with value', () => {
    render(<QRCode value="test-value" />)
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders with custom size', () => {
    render(<QRCode value="test" size={300} />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveAttribute('width', '300')
    expect(svg).toHaveAttribute('height', '300')
  })

  it('renders with custom colors', () => {
    render(<QRCode value="test" bgColor="#f0f0f0" fgColor="#333333" />)
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders with logo', () => {
    render(<QRCode value="test" logoUrl="/logo.png" />)
    const img = screen.getByAltText('Logo')
    expect(img).toHaveAttribute('src', '/logo.png')
  })
})

describe('AddressQRCode', () => {
  it('renders Ethereum address with ethereum: prefix', () => {
    const { container } = render(
      <AddressQRCode address="0x1234567890abcdef" chain="ethereum" />
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders Bitcoin address with bitcoin: prefix', () => {
    const { container } = render(
      <AddressQRCode address="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" chain="bitcoin" />
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders Tron address without prefix', () => {
    const { container } = render(
      <AddressQRCode address="TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW" chain="tron" />
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders plain address when chain is not specified', () => {
    const { container } = render(
      <AddressQRCode address="some-address" />
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
