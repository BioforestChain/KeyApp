import type { ActivityComponentType } from '@stackflow/react'
import { AppScreen } from '@stackflow/plugin-basic-ui'
import { AddressBalancePage } from '@/pages/address-balance'

export const AddressBalanceActivity: ActivityComponentType = () => {
  return (
    <AppScreen>
      <AddressBalancePage />
    </AppScreen>
  )
}
