import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import {
  IconPlus as Plus,
  IconSearch as Search,
  IconUser as User,
  IconArrowsVertical as MoreVertical,
} from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { ContactEditSheet } from '@/components/address-book/contact-edit-sheet';
import { PasswordConfirmSheet } from '@/components/security/password-confirm-sheet';
import {
  addressBookStore,
  addressBookActions,
  addressBookSelectors,
  walletStore,
  walletSelectors,
  type Contact,
} from '@/stores';
import { verifyPassword } from '@/lib/crypto';
import { cn } from '@/lib/utils';

export function AddressBookPage() {
  const navigate = useNavigate();
  const contacts = useStore(addressBookStore, (s) => s.contacts);
  const currentWallet = useStore(walletStore, walletSelectors.getCurrentWallet);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [deleteError, setDeleteError] = useState<string>();
  const [isDeleting, setIsDeleting] = useState(false);

  // 过滤联系人
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    return addressBookSelectors.searchContacts(addressBookStore.state, searchQuery.trim());
  }, [contacts, searchQuery]);

  // 返回
  const handleBack = useCallback(() => {
    navigate({ to: '/' });
  }, [navigate]);

  // 打开添加联系人
  const handleOpenAdd = useCallback(() => {
    setIsAddSheetOpen(true);
  }, []);

  // 关闭添加联系人
  const handleCloseAdd = useCallback(() => {
    setIsAddSheetOpen(false);
  }, []);

  // 打开编辑联系人
  const handleOpenEdit = useCallback((contact: Contact) => {
    setEditingContact(contact);
  }, []);

  // 关闭编辑联系人
  const handleCloseEdit = useCallback(() => {
    setEditingContact(null);
  }, []);

  // 开始删除联系人
  const handleStartDelete = useCallback((contact: Contact) => {
    setDeletingContact(contact);
    setDeleteError(undefined);
  }, []);

  // 取消删除
  const handleCancelDelete = useCallback(() => {
    setDeletingContact(null);
    setDeleteError(undefined);
  }, []);

  // 确认删除（验证密码）
  const handleConfirmDelete = useCallback(
    async (password: string) => {
      if (!deletingContact) return;

      // 如果有钱包，需要验证密码
      if (currentWallet?.encryptedMnemonic) {
        setIsDeleting(true);
        setDeleteError(undefined);

        try {
          const isValid = await verifyPassword(currentWallet.encryptedMnemonic, password);
          if (!isValid) {
            setDeleteError('密码错误');
            return;
          }
        } catch {
          setDeleteError('验证失败');
          return;
        } finally {
          setIsDeleting(false);
        }
      }

      // 删除联系人
      addressBookActions.deleteContact(deletingContact.id);
      setDeletingContact(null);
    },
    [deletingContact, currentWallet?.encryptedMnemonic],
  );

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader
        title="通讯录"
        onBack={handleBack}
        rightAction={
          <button
            onClick={handleOpenAdd}
            className={cn('rounded-full p-2 transition-colors', 'hover:bg-muted active:bg-muted/80')}
            aria-label="添加联系人"
          >
            <Plus className="size-5" />
          </button>
        }
      />

      {/* 搜索栏 */}
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索联系人"
            className={cn(
              'border-border bg-background w-full rounded-xl border py-2.5 pr-4 pl-10',
              'focus:ring-primary focus:ring-2 focus:outline-none',
            )}
          />
        </div>
      </div>

      {/* 联系人列表 */}
      <div className="flex-1 p-4">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <User className="text-muted-foreground/50 size-12" />
            <p className="text-muted-foreground">{searchQuery ? '没有找到联系人' : '还没有联系人'}</p>
            {!searchQuery && (
              <button
                onClick={handleOpenAdd}
                className={cn(
                  'bg-primary rounded-full px-6 py-2.5 text-sm font-medium text-white',
                  'hover:bg-primary/90 active:bg-primary/80',
                )}
              >
                添加联系人
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredContacts.map((contact) => (
              <ContactListItem
                key={contact.id}
                contact={contact}
                onEdit={() => handleOpenEdit(contact)}
                onDelete={() => handleStartDelete(contact)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 添加联系人弹窗 */}
      <ContactEditSheet open={isAddSheetOpen} onClose={handleCloseAdd} />

      {/* 编辑联系人弹窗 */}
      <ContactEditSheet contact={editingContact} open={!!editingContact} onClose={handleCloseEdit} />

      {/* 删除确认弹窗 */}
      <PasswordConfirmSheet
        open={!!deletingContact}
        onClose={handleCancelDelete}
        onVerify={handleConfirmDelete}
        title="删除联系人"
        description={`确定要删除联系人 "${deletingContact?.name}" 吗？`}
        error={deleteError}
        isVerifying={isDeleting}
      />
    </div>
  );
}

interface ContactListItemProps {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
}

function ContactListItem({ contact, onEdit, onDelete }: ContactListItemProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className={cn('bg-card rounded-xl p-4 shadow-sm', 'transition-colors')}>
      <div className="flex items-center gap-3">
        {/* 头像 */}
        <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full font-semibold">
          {contact.name.slice(0, 1).toUpperCase()}
        </div>

        {/* 信息 */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium">{contact.name}</h3>
          <p className="text-muted-foreground truncate font-mono text-xs">{contact.address}</p>
          {contact.memo && <p className="text-muted-foreground mt-1 truncate text-xs">{contact.memo}</p>}
        </div>

        {/* 操作按钮 */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className={cn('rounded-full p-2 transition-colors', 'hover:bg-muted active:bg-muted/80')}
            aria-label="更多操作"
          >
            <MoreVertical className="text-muted-foreground size-4" />
          </button>

          {showActions && (
            <>
              {/* 点击外部关闭 */}
              <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
              {/* 下拉菜单 */}
              <div className="bg-popover border-border absolute top-full right-0 z-20 mt-1 w-32 rounded-lg border py-1 shadow-lg">
                <button
                  onClick={() => {
                    setShowActions(false);
                    onEdit();
                  }}
                  className="hover:bg-muted w-full px-4 py-2 text-left text-sm transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={() => {
                    setShowActions(false);
                    onDelete();
                  }}
                  className="text-destructive hover:bg-destructive/10 w-full px-4 py-2 text-left text-sm transition-colors"
                >
                  删除
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
