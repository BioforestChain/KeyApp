import type { ActivityComponentType } from '@stackflow/react'
import { AppScreen } from '@stackflow/plugin-basic-ui'
import { AddressTransactionsPage } from '@/pages/address-transactions'

export const AddressTransactionsActivity: ActivityComponentType = () => {
  return (
    <AppScreen>
      <AddressTransactionsPage />
    </AppScreen>
  )
}
