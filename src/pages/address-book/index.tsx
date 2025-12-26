import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFlow } from '@/stackflow';
import { setWalletLockConfirmCallback } from '@/stackflow/activities/sheets';
import { useStore } from '@tanstack/react-store';
import {
  IconPlus as Plus,
  IconSearch as Search,
  IconUser as User,
  IconDotsVertical as MoreVertical,
} from '@tabler/icons-react';
import { ContactAvatar } from '@/components/common/contact-avatar';
import { generateAvatarFromAddress } from '@/lib/avatar-codec';
import { PageHeader } from '@/components/layout/page-header';
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
  const { t } = useTranslation('common');
  const { goBack } = useNavigation();
  const { push } = useFlow();
  const addressBookState = useStore(addressBookStore);
  const contacts = addressBookState.contacts;
  const currentWallet = useStore(walletStore, walletSelectors.getCurrentWallet);

  // 确保 store 已初始化
  useEffect(() => {
    if (!addressBookState.isInitialized) {
      addressBookActions.initialize();
    }
  }, [addressBookState.isInitialized]);

  const [searchQuery, setSearchQuery] = useState('');
  const deletingContactRef = useRef<Contact | null>(null);

  // 过滤联系人
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    return addressBookSelectors.searchContacts(addressBookStore.state, searchQuery.trim());
  }, [contacts, searchQuery]);

  // 返回
  const handleBack = useCallback(() => {
    goBack();
  }, [goBack]);

  // 打开添加联系人
  const handleOpenAdd = useCallback(() => {
    push('ContactEditJob', {});
  }, [push]);

  // 打开编辑联系人
  const handleOpenEdit = useCallback(
    (contact: Contact) => {
      push('ContactEditJob', { contactId: contact.id });
    },
    [push],
  );

  // 分享联系人名片
  const handleShare = useCallback(
    (contact: Contact) => {
      push('ContactShareJob', {
        name: contact.name,
        addresses: JSON.stringify(
          contact.addresses.map((a) => ({
            chainType: a.chainType,
            address: a.address,
            label: a.label,
          })),
        ),
        memo: contact.memo,
        avatar: contact.avatar,
      });
    },
    [push],
  );

  // 开始删除联系人
  const handleStartDelete = useCallback(
    (contact: Contact) => {
      deletingContactRef.current = contact;

      // 如果有钱包，需要验证密码
      if (currentWallet?.encryptedMnemonic) {
        setWalletLockConfirmCallback(async (password: string) => {
          try {
            const isValid = await verifyPassword(currentWallet.encryptedMnemonic!, password);
            if (!isValid) {
              return false;
            }
            // 删除联系人
            addressBookActions.deleteContact(contact.id);
            deletingContactRef.current = null;
            return true;
          } catch {
            return false;
          }
        });

        push('WalletLockConfirmJob', {
          title: t('addressBook.deleteTitle'),
          description: t('addressBook.deleteConfirm', { name: contact.name }),
        });
      } else {
        // 无钱包直接删除
        addressBookActions.deleteContact(contact.id);
        deletingContactRef.current = null;
      }
    },
    [currentWallet?.encryptedMnemonic, push, t],
  );

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader
        title={t('addressBook.title')}
        onBack={handleBack}
        rightAction={
          <button
            onClick={handleOpenAdd}
            className={cn('rounded-full p-2 transition-colors', 'hover:bg-muted active:bg-muted/80')}
            aria-label={t('a11y.addContact')}
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
            placeholder={t('addressBook.searchPlaceholder')}
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
            <p className="text-muted-foreground">
              {searchQuery ? t('addressBook.noResults') : t('addressBook.noContacts')}
            </p>
            {!searchQuery && (
              <button
                onClick={handleOpenAdd}
                className={cn(
                  'bg-primary rounded-full px-6 py-2.5 text-sm font-medium text-primary-foreground',
                  'hover:bg-primary/90 active:bg-primary/80',
                )}
              >
                {t('contact.addTitle')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredContacts.map((contact) => (
              <ContactListItem
                key={contact.id}
                contact={contact}
                onShare={() => handleShare(contact)}
                onEdit={() => handleOpenEdit(contact)}
                onDelete={() => handleStartDelete(contact)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ContactListItemProps {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
}

function ContactListItem({ contact, onEdit, onDelete, onShare }: ContactListItemProps) {
  const { t } = useTranslation('common');
  const [showActions, setShowActions] = useState(false);

  return (
    <div className={cn('bg-card rounded-xl p-4 shadow-sm', 'transition-colors')}>
      <div className="flex items-center gap-3">
        {/* 头像 */}
        <ContactAvatar
          src={contact.avatar || (contact.addresses[0]?.address ? generateAvatarFromAddress(contact.addresses[0].address) : undefined)}
          size={40}
        />

        {/* 信息 */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium">{contact.name}</h3>
          {contact.addresses.length > 0 && (
            <p className="text-muted-foreground truncate font-mono text-xs">
              {contact.addresses[0]?.address}
              {contact.addresses.length > 1 && ` (+${contact.addresses.length - 1})`}
            </p>
          )}
          {contact.memo && <p className="text-muted-foreground mt-1 truncate text-xs">{contact.memo}</p>}
        </div>

        {/* 操作按钮 */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className={cn('rounded-full p-2 transition-colors', 'hover:bg-muted active:bg-muted/80')}
            aria-label={t('a11y.moreActions')}
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
                    onShare();
                  }}
                  className="hover:bg-muted w-full px-4 py-2 text-left text-sm transition-colors"
                >
                  {t('addressBook.shareContact')}
                </button>
                <button
                  onClick={() => {
                    setShowActions(false);
                    onEdit();
                  }}
                  className="hover:bg-muted w-full px-4 py-2 text-left text-sm transition-colors"
                >
                  {t('addressBook.edit')}
                </button>
                <button
                  onClick={() => {
                    setShowActions(false);
                    onDelete();
                  }}
                  className="text-destructive hover:bg-destructive/10 w-full px-4 py-2 text-left text-sm transition-colors"
                >
                  {t('addressBook.delete')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
