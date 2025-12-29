import type { ActivityComponentType } from '@stackflow/react'
import { AppScreen } from '@stackflow/plugin-basic-ui'
import { useFlow } from '../stackflow'
import { MiniappPage } from '@/pages/ecosystem/miniapp'

type MiniappParams = {
  appId: string
}

export const MiniappActivity: ActivityComponentType<MiniappParams> = ({ params }) => {
  const { pop } = useFlow()

  return (
    <AppScreen>
      <MiniappPage appId={params.appId} onClose={() => pop()} />
    </AppScreen>
  )
}
