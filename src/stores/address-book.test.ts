import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  addressBookStore,
  addressBookActions,
  addressBookSelectors,
  type Contact,
  type ContactAddress,
} from './address-book'

/** Helper to create a contact address */
function createAddress(address: string, label?: string): ContactAddress {
  return {
    id: crypto.randomUUID(),
    address,
    label,
  }
}

describe('AddressBookStore', () => {
  beforeEach(() => {
    // Clear localStorage and reset store
    localStorage.removeItem('bfm_address_book')
    addressBookActions.clearAll()
  })

  describe('addContact', () => {
    it('adds a new contact with addresses', () => {
      const contact = addressBookActions.addContact({
        name: 'Alice',
        addresses: [createAddress('0x1234567890abcdef')],
      })

      expect(contact.id).toBeDefined()
      expect(contact.name).toBe('Alice')
      expect(contact.addresses).toHaveLength(1)
      expect(contact.addresses[0]?.address).toBe('0x1234567890abcdef')
      expect(contact.createdAt).toBeDefined()

      const state = addressBookStore.state
      expect(state.contacts).toHaveLength(1)
    })

    it('persists contacts to localStorage', () => {
      addressBookActions.addContact({
        name: 'Bob',
        addresses: [createAddress('0xabcdef1234567890')],
      })

      const stored = localStorage.getItem('bfm_address_book')
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!) as { version: number; contacts: Contact[] }
      expect(parsed.version).toBe(2)
      expect(parsed.contacts).toHaveLength(1)
      expect(parsed.contacts[0]!.name).toBe('Bob')
    })
  })

  describe('updateContact', () => {
    it('updates an existing contact', () => {
      const contact = addressBookActions.addContact({
        name: 'Alice',
        addresses: [createAddress('0x1234567890abcdef')],
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
        addresses: [createAddress('0x1234567890abcdef')],
      })

      expect(addressBookStore.state.contacts).toHaveLength(1)

      addressBookActions.deleteContact(contact.id)

      expect(addressBookStore.state.contacts).toHaveLength(0)
    })
  })

  describe('addAddressToContact', () => {
    it('adds an address to existing contact', () => {
      const contact = addressBookActions.addContact({
        name: 'Alice',
        addresses: [createAddress('0x1111', 'ethereum')],
      })

      addressBookActions.addAddressToContact(contact.id, {
        address: 'b7ADmvZJJ3n3aDxkvwbXxJX1oGgeiCzL11',
        label: 'BFMETA',
      })

      const state = addressBookStore.state
      const updated = state.contacts.find((c) => c.id === contact.id)

      expect(updated?.addresses).toHaveLength(2)
      expect(updated?.addresses[1]?.label).toBe('BFMETA')
    })

    it('throws error when adding more than 3 addresses', () => {
      const contact = addressBookActions.addContact({
        name: 'Alice',
        addresses: [
          createAddress('0x1111', 'ethereum'),
          createAddress('0x2222', 'ethereum'),
          createAddress('0x3333', 'ethereum'),
        ],
      })

      expect(() => {
        addressBookActions.addAddressToContact(contact.id, {
          address: '0x4444444444444444444444444444444444444444',
          label: 'ETH4',
        })
      }).toThrow('Maximum 3 addresses per contact')
    })
  })

  describe('addContact with address limit', () => {
    it('allows up to 3 addresses', () => {
      const contact = addressBookActions.addContact({
        name: 'Alice',
        addresses: [
          createAddress('0x1111', 'ethereum'),
          createAddress('0x2222', 'ethereum'),
          createAddress('0x3333', 'ethereum'),
        ],
      })

      expect(contact.addresses).toHaveLength(3)
    })

    it('throws error when creating contact with more than 3 addresses', () => {
      expect(() => {
        addressBookActions.addContact({
          name: 'Alice',
          addresses: [
            createAddress('0x1111', 'ethereum'),
            createAddress('0x2222', 'ethereum'),
            createAddress('0x3333', 'ethereum'),
            createAddress('0x4444', 'ethereum'),
          ],
        })
      }).toThrow('Maximum 3 addresses per contact')
    })
  })

  describe('removeAddressFromContact', () => {
    it('removes an address from contact', () => {
      const addr1 = createAddress('0x1111', 'ethereum')
      const addr2 = createAddress('0x2222', 'ethereum')

      const contact = addressBookActions.addContact({
        name: 'Alice',
        addresses: [addr1, addr2],
      })

      addressBookActions.removeAddressFromContact(contact.id, addr1.id)

      const state = addressBookStore.state
      const updated = state.contacts.find((c) => c.id === contact.id)

      expect(updated?.addresses).toHaveLength(1)
      expect(updated?.addresses[0]?.address).toBe('0x2222')
    })
  })

  describe('importContacts', () => {
    it('imports new contacts with dedup by name', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

      const existing: Contact = {
        id: 'existing-1',
        name: 'Existing',
        addresses: [createAddress('0x1111', 'ethereum')],
        createdAt: 1,
        updatedAt: 1,
      }

      const importedA: Contact = {
        id: 'import-1',
        name: 'Alice',
        addresses: [createAddress('0x2222', 'ethereum')],
        createdAt: 2,
        updatedAt: 2,
      }

      const importedADupe: Contact = {
        ...importedA,
        id: 'import-1-dupe',
        name: 'Alice', // Same name - should be deduped
      }

      // seed existing
      const seedCount = addressBookActions.importContacts([existing])
      expect(seedCount).toBe(1)
      setItemSpy.mockClear()

      const added = addressBookActions.importContacts([
        importedA,
        importedADupe,
        existing, // duplicate with existing
      ])

      expect(added).toBe(1) // Only Alice is new
      expect(addressBookStore.state.contacts).toHaveLength(2)
      expect(setItemSpy).toHaveBeenCalledTimes(1)
    })

    it('returns 0 and does not persist when there are no new contacts', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

      const existing: Contact = {
        id: 'existing-1',
        name: 'Existing',
        addresses: [createAddress('0x1111', 'ethereum')],
        createdAt: 1,
        updatedAt: 1,
      }

      addressBookActions.importContacts([existing])
      setItemSpy.mockClear()

      const added = addressBookActions.importContacts([
        { ...existing, id: 'existing-1-again' },
      ])

      expect(added).toBe(0)
      expect(setItemSpy).not.toHaveBeenCalled()
      expect(addressBookStore.state.contacts).toHaveLength(1)
    })
  })

  describe('initialize', () => {
    it('loads contacts from localStorage (v2 format)', () => {
      addressBookActions.clearAll()

      const mockData = {
        version: 2,
        contacts: [
          {
            id: '1',
            name: 'Alice',
            addresses: [{ id: 'a1', address: '0x1111', label: 'ETH' }],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      }
      localStorage.setItem('bfm_address_book', JSON.stringify(mockData))

      addressBookActions.initialize()

      const state = addressBookStore.state
      expect(state.contacts).toHaveLength(1)
      expect(state.contacts[0]!.name).toBe('Alice')
      expect(state.contacts[0]!.addresses).toHaveLength(1)
      expect(state.isInitialized).toBe(true)
    })

    it('migrates v1 (legacy) format to v2', () => {
      addressBookActions.clearAll()

      // v1 format: array of contacts with single address
      const legacyContacts = [
        {
          id: '1',
          name: 'Alice',
          address: '0x1111111111111111111111111111111111111111',
          chain: 'ethereum',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]
      localStorage.setItem('bfm_address_book', JSON.stringify(legacyContacts))

      addressBookActions.initialize()

      const state = addressBookStore.state
      expect(state.contacts).toHaveLength(1)
      expect(state.contacts[0]!.name).toBe('Alice')
      expect(state.contacts[0]!.addresses).toHaveLength(1)
      expect(state.contacts[0]!.addresses[0]?.address).toBe('0x1111111111111111111111111111111111111111')
      expect(state.contacts[0]!.addresses[0]?.label).toBe('ETHEREUM')
    })
  })

  describe('selectors', () => {
    it('getContactByAddress finds contact by address (case-insensitive)', () => {
      addressBookActions.addContact({
        name: 'Alice',
        addresses: [createAddress('0xABCDef1234567890')],
      })

      const state = addressBookStore.state
      const result = addressBookSelectors.getContactByAddress(
        state,
        '0xabcdef1234567890'
      )

      expect(result?.contact.name).toBe('Alice')
      expect(result?.matchedAddress.address).toBe('0xABCDef1234567890')
    })

    it('searchContacts filters by name or address', () => {
      addressBookActions.addContact({
        name: 'Alice',
        addresses: [createAddress('0x1111')],
      })
      addressBookActions.addContact({
        name: 'Bob',
        addresses: [createAddress('0x2222')],
      })
      addressBookActions.addContact({
        name: 'Charlie',
        addresses: [createAddress('0xalice')],
      })

      const state = addressBookStore.state

      // Search by name
      const byName = addressBookSelectors.searchContacts(state, 'alice')
      expect(byName).toHaveLength(2) // Alice and Charlie (address contains 'alice')

      // Search by address
      const byAddress = addressBookSelectors.searchContacts(state, '2222')
      expect(byAddress).toHaveLength(1)
      expect(byAddress[0]!.name).toBe('Bob')
    })

    it('suggestContacts returns suggestions sorted by score', () => {
      addressBookActions.addContact({
        name: 'Alice',
        addresses: [
          { id: '1', address: '0x1234abcd1234abcd1234abcd1234abcd1234abcd', label: 'ETH' },
          { id: '2', address: 'b7ADmvZJJ3n3aDxkvwbXxJX1oGgeiCzL11', label: 'BFMETA' },
        ],
      })
      addressBookActions.addContact({
        name: 'Bob',
        addresses: [{ id: '3', address: '0x1234efgh1234efgh1234efgh1234efgh1234efgh', label: 'ETH' }],
      })

      const state = addressBookStore.state

      // Search by address prefix
      const suggestions = addressBookSelectors.suggestContacts(state, '0x1234')
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0]?.matchType).toBe('prefix')
    })

    it('suggestContacts returns all contacts when query is empty', () => {
      addressBookActions.addContact({
        name: 'Alice',
        addresses: [{ id: '1', address: '0x1111111111111111111111111111111111111111', label: 'ETH' }],
      })
      addressBookActions.addContact({
        name: 'Bob',
        addresses: [{ id: '2', address: '0x2222222222222222222222222222222222222222', label: 'ETH' }],
      })

      const state = addressBookStore.state

      // Empty query should return all contacts
      const suggestions = addressBookSelectors.suggestContacts(state, '')
      expect(suggestions).toHaveLength(2)
    })

    it('suggestContacts respects limit parameter', () => {
      // Add 10 contacts
      for (let i = 0; i < 10; i++) {
        addressBookActions.addContact({
          name: `Contact ${i}`,
          addresses: [{ id: `${i}`, address: `0x${i}000000000000000000000000000000000000000`, label: 'ETH' }],
        })
      }

      const state = addressBookStore.state

      // Default limit is 5
      const defaultLimit = addressBookSelectors.suggestContacts(state, '')
      expect(defaultLimit).toHaveLength(5)

      // Custom limit
      const customLimit = addressBookSelectors.suggestContacts(state, '', 3)
      expect(customLimit).toHaveLength(3)
    })

    it('getContactsByChain filters by chain type (using address format detection)', () => {
      addressBookActions.addContact({
        name: 'Alice',
        addresses: [
          { id: '1', address: '0x1111111111111111111111111111111111111111', label: 'ETH' },
          { id: '2', address: 'b7ADmvZJJ3n3aDxkvwbXxJX1oGgeiCzL11', label: 'BFMETA' },
        ],
      })
      addressBookActions.addContact({
        name: 'Bob',
        addresses: [{ id: '3', address: '0x2222222222222222222222222222222222222222', label: 'ETH' }],
      })
      addressBookActions.addContact({
        name: 'Charlie',
        addresses: [{ id: '4', address: 'TJYeasypTe7UMKAMyfX4pjCuj2zPZ9Wzwj', label: 'TRX' }],
      })

      const state = addressBookStore.state

      const ethContacts = addressBookSelectors.getContactsByChain(state, 'ethereum')
      expect(ethContacts).toHaveLength(2) // Alice and Bob

      const bfmetaContacts = addressBookSelectors.getContactsByChain(state, 'bfmeta')
      expect(bfmetaContacts).toHaveLength(1) // Alice only

      const tronContacts = addressBookSelectors.getContactsByChain(state, 'tron')
      expect(tronContacts).toHaveLength(1) // Charlie only
    })
  })
})
