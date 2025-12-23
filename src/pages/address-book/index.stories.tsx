import type { Meta, StoryObj } from '@storybook/react'
import { AddressBookPage } from './index'
import { addressBookActions, walletStore } from '@/stores'
import { withRouter, withI18n } from '@/test/storybook-decorators'

const meta: Meta<typeof AddressBookPage> = {
  title: 'Pages/AddressBook/AddressBookPage',
  component: AddressBookPage,
  decorators: [withRouter(), withI18n()],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof AddressBookPage>

// Helper to create addresses
function createAddresses(address: string, chainType = 'ethereum') {
  return [{ id: crypto.randomUUID(), address, chainType: chainType as 'ethereum' }]
}

const resetStores = () => {
  addressBookActions.clearAll()
  walletStore.setState({
    wallets: [],
    currentWalletId: null,
    isInitialized: true,
    isLoading: false,
    chainPreferences: {},
    selectedChain: 'ethereum',
  })
}

/**
 * 空状态：没有联系人
 */
export const Empty: Story = {
  decorators: [
    (Story) => {
      resetStores()
      return <Story />
    },
  ],
}

/**
 * 有联系人
 */
export const WithContacts: Story = {
  decorators: [
    (Story) => {
      resetStores()
      addressBookActions.addContact({
        name: 'Alice',
        addresses: createAddresses('0x1234567890abcdef1234567890abcdef12345678'),
        memo: '同事',
      })
      addressBookActions.addContact({
        name: 'Bob',
        addresses: createAddresses('0xabcdef1234567890abcdef1234567890abcdef12'),
      })
      addressBookActions.addContact({
        name: 'Charlie',
        addresses: createAddresses('0x9876543210fedcba9876543210fedcba98765432'),
        memo: '朋友',
      })
      return <Story />
    },
  ],
}

/**
 * 多个联系人
 */
export const ManyContacts: Story = {
  decorators: [
    (Story) => {
      resetStores()
      for (let i = 1; i <= 10; i++) {
        addressBookActions.addContact({
          name: `联系人 ${i}`,
          addresses: createAddresses(`0x${i.toString().padStart(40, '0')}`),
          ...(i % 3 === 0 ? { memo: '有备注' } : {}),
        })
      }
      return <Story />
    },
  ],
}

/**
 * 多地址联系人
 */
export const MultipleAddresses: Story = {
  decorators: [
    (Story) => {
      resetStores()
      addressBookActions.addContact({
        name: 'Multi-Chain User',
        addresses: [
          { id: '1', address: '0x1234567890abcdef1234567890abcdef12345678', chainType: 'ethereum' },
          { id: '2', address: 'b7ADmvZJJ3n3aDxkvwbXxJX1oGgeiCzL11', chainType: 'bfmeta' },
          { id: '3', address: 'TJYs1234567890abcdef1234567890abc', chainType: 'tron' },
        ],
        memo: '多链用户',
      })
      addressBookActions.addContact({
        name: 'Single Address',
        addresses: createAddresses('0xabcdef1234567890abcdef1234567890abcdef12'),
      })
      return <Story />
    },
  ],
}

/**
 * 长名称和地址
 */
export const LongContent: Story = {
  decorators: [
    (Story) => {
      resetStores()
      addressBookActions.addContact({
        name: '这是一个很长的联系人名称',
        addresses: createAddresses('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'),
        memo: '这是一个很长的备注信息，用于测试文本截断效果',
      })
      return <Story />
    },
  ],
}
