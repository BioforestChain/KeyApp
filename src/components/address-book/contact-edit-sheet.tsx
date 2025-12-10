import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { BottomSheet } from '@/components/layout/bottom-sheet'
import { addressBookActions, type Contact, type ChainType } from '@/stores'
import { User, Wallet, FileText } from 'lucide-react'

interface ContactEditSheetProps {
  /** Contact to edit (null for new contact) */
  contact?: Contact | null
  /** Whether the sheet is open */
  open: boolean
  /** Close callback */
  onClose: () => void
  /** Success callback */
  onSuccess?: () => void
  /** Default chain for new contacts */
  defaultChain?: ChainType
  /** Additional class name */
  className?: string
}

/**
 * Sheet for adding/editing contacts
 */
export function ContactEditSheet({
  contact,
  open,
  onClose,
  onSuccess,
  defaultChain = 'ethereum',
  className,
}: ContactEditSheetProps) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [memo, setMemo] = useState('')

  const isEditing = !!contact

  // Reset form when contact changes or sheet opens
  useEffect(() => {
    if (open) {
      setName(contact?.name || '')
      setAddress(contact?.address || '')
      setMemo(contact?.memo || '')
    }
  }, [open, contact])

  const handleClose = useCallback(() => {
    setName('')
    setAddress('')
    setMemo('')
    onClose()
  }, [onClose])

  const handleSave = useCallback(() => {
    const trimmedName = name.trim()
    const trimmedAddress = address.trim()

    if (!trimmedName || !trimmedAddress) return

    if (isEditing && contact) {
      addressBookActions.updateContact(contact.id, {
        name: trimmedName,
        address: trimmedAddress,
        memo: memo.trim() || undefined,
      })
    } else {
      addressBookActions.addContact({
        name: trimmedName,
        address: trimmedAddress,
        memo: memo.trim() || undefined,
        chain: defaultChain,
      })
    }

    onSuccess?.()
    handleClose()
  }, [name, address, memo, isEditing, contact, defaultChain, onSuccess, handleClose])

  const canSave = name.trim().length > 0 && address.trim().length > 0

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      title={isEditing ? '编辑联系人' : '添加联系人'}
      className={className}
    >
      <div className="p-4 space-y-4">
        {/* 名称输入 */}
        <div className="space-y-2">
          <label htmlFor="contact-name" className="flex items-center gap-2 text-sm font-medium">
            <User className="size-4" />
            名称
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入联系人名称"
            maxLength={20}
            autoFocus
            className={cn(
              'w-full rounded-xl border border-border bg-background px-4 py-3',
              'focus:outline-none focus:ring-2 focus:ring-primary'
            )}
          />
        </div>

        {/* 地址输入 */}
        <div className="space-y-2">
          <label htmlFor="contact-address" className="flex items-center gap-2 text-sm font-medium">
            <Wallet className="size-4" />
            地址
          </label>
          <input
            id="contact-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="请输入钱包地址"
            className={cn(
              'w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary'
            )}
          />
        </div>

        {/* 备注输入 */}
        <div className="space-y-2">
          <label htmlFor="contact-memo" className="flex items-center gap-2 text-sm font-medium">
            <FileText className="size-4" />
            备注（可选）
          </label>
          <textarea
            id="contact-memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="添加备注信息"
            maxLength={100}
            rows={2}
            className={cn(
              'w-full rounded-xl border border-border bg-background px-4 py-3 resize-none',
              'focus:outline-none focus:ring-2 focus:ring-primary'
            )}
          />
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={cn(
              'w-full rounded-full py-3 font-medium text-white transition-colors',
              'bg-primary hover:bg-primary/90',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {isEditing ? '保存' : '添加'}
          </button>
          <button
            onClick={handleClose}
            className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
          >
            取消
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
