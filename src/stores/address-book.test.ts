import { describe, it, expect, beforeEach } from 'vitest'
import {
  addressBookStore,
  addressBookActions,
  addressBookSelectors,
  type Contact,
} from './address-book'

describe('AddressBookStore', () => {
  beforeEach(() => {
    // Clear localStorage and reset store
    localStorage.removeItem('bfm_address_book')
    addressBookActions.clearAll()
  })

  describe('addContact', () => {
    it('adds a new contact', () => {
      const contact = addressBookActions.addContact({
        name: 'Alice',
        address: '0x1234567890abcdef',
      })

      expect(contact.id).toBeDefined()
      expect(contact.name).toBe('Alice')
      expect(contact.address).toBe('0x1234567890abcdef')
      expect(contact.createdAt).toBeDefined()

      const state = addressBookStore.state
      expect(state.contacts).toHaveLength(1)
    })

    it('persists contacts to localStorage', () => {
      addressBookActions.addContact({
        name: 'Bob',
        address: '0xabcdef1234567890',
        chain: 'ethereum',
      })

      const stored = localStorage.getItem('bfm_address_book')
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!) as Contact[]
      expect(parsed).toHaveLength(1)
      expect(parsed[0].name).toBe('Bob')
    })
  })

  describe('updateContact', () => {
    it('updates an existing contact', () => {
      const contact = addressBookActions.addContact({
        name: 'Alice',
        address: '0x1234567890abcdef',
      })

      addressBookActions.updateContact(contact.id, {
        name: 'Alice Updated',
        memo: 'Friend',
      })

      const state = addressBookStore.state
      const updated = state.contacts.find((c) => c.id === contact.id)

      expect(updated?.name).toBe('Alice Updated')
      expect(updated?.memo).toBe('Friend')
      expect(updated?.updatedAt).toBeGreaterThanOrEqual(contact.createdAt)
    })
  })

  describe('deleteContact', () => {
    it('removes a contact', () => {
      const contact = addressBookActions.addContact({
        name: 'Alice',
        address: '0x1234567890abcdef',
      })

      expect(addressBookStore.state.contacts).toHaveLength(1)

      addressBookActions.deleteContact(contact.id)

      expect(addressBookStore.state.contacts).toHaveLength(0)
    })
  })

  describe('initialize', () => {
    it('loads contacts from localStorage', () => {
      // First clear everything
      addressBookActions.clearAll()

      // Then set up mock data in localStorage
      const mockContacts: Contact[] = [
        {
          id: '1',
          name: 'Alice',
          address: '0x1111',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]
      localStorage.setItem('bfm_address_book', JSON.stringify(mockContacts))

      // Now initialize to load from storage
      addressBookActions.initialize()

      const state = addressBookStore.state
      expect(state.contacts).toHaveLength(1)
      expect(state.contacts[0].name).toBe('Alice')
      expect(state.isInitialized).toBe(true)
    })
  })

  describe('selectors', () => {
    it('getContactByAddress finds contact by address (case-insensitive)', () => {
      addressBookActions.addContact({
        name: 'Alice',
        address: '0xABCDef1234567890',
      })

      const state = addressBookStore.state
      const found = addressBookSelectors.getContactByAddress(
        state,
        '0xabcdef1234567890'
      )

      expect(found?.name).toBe('Alice')
    })

    it('searchContacts filters by name or address', () => {
      addressBookActions.addContact({ name: 'Alice', address: '0x1111' })
      addressBookActions.addContact({ name: 'Bob', address: '0x2222' })
      addressBookActions.addContact({ name: 'Charlie', address: '0xalice' })

      const state = addressBookStore.state

      // Search by name
      const byName = addressBookSelectors.searchContacts(state, 'alice')
      expect(byName).toHaveLength(2) // Alice and Charlie (address contains 'alice')

      // Search by address
      const byAddress = addressBookSelectors.searchContacts(state, '2222')
      expect(byAddress).toHaveLength(1)
      expect(byAddress[0].name).toBe('Bob')
    })
  })
})
