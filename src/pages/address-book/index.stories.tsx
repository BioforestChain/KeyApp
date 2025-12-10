import type { Meta, StoryObj } from '@storybook/react'
import { AddressBookPage } from './index'
import { addressBookStore, addressBookActions, walletStore } from '@/stores'
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

const resetStores = () => {
  addressBookActions.clearAll()
  walletStore.setState({
    wallets: [],
    currentWalletId: null,
    isInitialized: true,
    isLoading: false,
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
        address: '0x1234567890abcdef1234567890abcdef12345678',
        memo: '同事',
      })
      addressBookActions.addContact({
        name: 'Bob',
        address: '0xabcdef1234567890abcdef1234567890abcdef12',
      })
      addressBookActions.addContact({
        name: 'Charlie',
        address: '0x9876543210fedcba9876543210fedcba98765432',
        memo: '朋友',
        chain: 'ethereum',
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
          address: `0x${i.toString().padStart(40, '0')}`,
          memo: i % 3 === 0 ? '有备注' : undefined,
        })
      }
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
        address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        memo: '这是一个很长的备注信息，用于测试文本截断效果',
      })
      return <Story />
    },
  ],
}
