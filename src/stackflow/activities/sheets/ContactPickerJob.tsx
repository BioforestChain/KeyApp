import { useState, useMemo } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { useStore } from "@tanstack/react-store";
import { cn } from "@/lib/utils";
import { IconSearch, IconChevronRight } from "@tabler/icons-react";
import { ContactAvatar } from "@/components/common/contact-avatar";
import { generateAvatarFromAddress } from "@/lib/avatar-codec";
import { isValidAddressForChain } from "@/lib/address-format";
import { addressBookStore, addressBookSelectors, type ChainType, type Contact, type ContactAddress } from "@/stores";
import { useFlow } from "../../stackflow";
import { ActivityParamsProvider, useActivityParams } from "../../hooks";

type ContactPickerJobParams = {
  /** 当前选中的链类型，用于验证地址合法性 */
  chainType?: string;
};

function truncateAddress(address: string, startChars = 8, endChars = 6): string {
  if (address.length <= startChars + endChars + 3) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

function ContactPickerJobContent() {
  const { t } = useTranslation("common");
  const { pop } = useFlow();
  const { chainType: chainTypeParam } = useActivityParams<ContactPickerJobParams>();
  const chainType = chainTypeParam as ChainType | undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);

  const addressBookState = useStore(addressBookStore);

  // 显示所有联系人（不按 chainType 过滤），但用地址合法性验证来标记可选地址
  const filteredContacts = useMemo(() => {
    let contacts = addressBookState.contacts;

    // Filter by search query
    if (searchQuery) {
      contacts = addressBookSelectors.searchContacts(addressBookState, searchQuery);
    }

    // Sort by updated time (most recent first)
    return [...contacts].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [addressBookState, searchQuery]);

  const handleSelectAddress = (contact: Contact, address: ContactAddress) => {
    // Store selected address in a way that can be retrieved by the caller
    // We use a custom event since stackflow doesn't support return values directly
    const event = new CustomEvent("contact-picker-select", {
      detail: { contact, address },
    });
    window.dispatchEvent(event);
    pop();
  };

  // 获取联系人的所有地址，并标记当前链是否可用
  const getRelevantAddresses = (contact: Contact) => {
    return contact.addresses.map((addr) => ({
      ...addr,
      isValidForCurrentChain: chainType ? isValidAddressForChain(addr.address, chainType) : true,
    }));
  };

  // 检查联系人是否有当前链的有效地址
  const hasValidAddress = (contact: Contact) => {
    if (!chainType) return true;
    return contact.addresses.some((addr) => isValidAddressForChain(addr.address, chainType));
  };

  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>

        {/* Title */}
        <div className="border-border border-b px-4 pb-4">
          <h2 className="text-center text-lg font-semibold">
            {t("contact.selectContact")}
          </h2>
        </div>

        {/* Search */}
        <div className="border-border border-b p-4">
          <div className="bg-muted/50 flex items-center gap-2 rounded-xl px-3 py-2">
            <IconSearch className="text-muted-foreground size-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("addressBook.searchPlaceholder")}
              className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="max-h-[50vh] overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              {searchQuery ? t("addressBook.noResults") : t("contact.noContacts")}
            </div>
          ) : (
            <div className="divide-border divide-y">
              {filteredContacts.map((contact) => {
                const addresses = getRelevantAddresses(contact);
                const validAddresses = addresses.filter((a) => a.isValidForCurrentChain);
                const hasMultipleAddresses = addresses.length > 1;
                const isExpanded = expandedContactId === contact.id;
                const contactHasValidAddress = hasValidAddress(contact);

                // If only one address, show directly
                if (!hasMultipleAddresses) {
                  const address = addresses[0];
                  if (!address) return null;
                  const isDisabled = !address.isValidForCurrentChain;
                  return (
                    <button
                      key={contact.id}
                      onClick={() => !isDisabled && handleSelectAddress(contact, address)}
                      disabled={isDisabled}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 transition-colors",
                        isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/50"
                      )}
                    >
                      <ContactAvatar
                        src={contact.avatar || generateAvatarFromAddress(address.address)}
                        size={40}
                        className="shrink-0"
                      />
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate font-medium">{contact.name}</p>
                        <p className="text-muted-foreground truncate font-mono text-xs">
                          {truncateAddress(address.address)}
                        </p>
                      </div>
                      <span className={cn(
                        "text-xs uppercase",
                        isDisabled ? "text-muted-foreground/50" : "text-muted-foreground"
                      )}>
                        {address.chainType}
                      </span>
                    </button>
                  );
                }

                // Multiple addresses - show expandable
                return (
                  <div key={contact.id}>
                    <button
                      onClick={() => setExpandedContactId(isExpanded ? null : contact.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 transition-colors",
                        contactHasValidAddress ? "hover:bg-muted/50" : "opacity-50"
                      )}
                    >
                      <ContactAvatar
                        src={contact.avatar || (addresses[0]?.address ? generateAvatarFromAddress(addresses[0].address) : undefined)}
                        size={40}
                        className="shrink-0"
                      />
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate font-medium">{contact.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {validAddresses.length > 0 
                            ? `${validAddresses.length}/${addresses.length} ${t("contact.selectAddress")}`
                            : t("contact.noValidAddress")
                          }
                        </p>
                      </div>
                      <IconChevronRight
                        className={cn(
                          "text-muted-foreground size-5 transition-transform",
                          isExpanded && "rotate-90"
                        )}
                      />
                    </button>
                    {isExpanded && (
                      <div className="bg-muted/30 divide-border divide-y pl-14">
                        {addresses.map((address) => {
                          const isDisabled = !address.isValidForCurrentChain;
                          return (
                            <button
                              key={address.id}
                              onClick={() => !isDisabled && handleSelectAddress(contact, address)}
                              disabled={isDisabled}
                              className={cn(
                                "flex w-full items-center gap-3 px-4 py-2.5 transition-colors",
                                isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/50"
                              )}
                            >
                              <div className="min-w-0 flex-1 text-left">
                                <p className={cn(
                                  "truncate font-mono text-xs",
                                  isDisabled ? "text-muted-foreground/50" : "text-muted-foreground"
                                )}>
                                  {truncateAddress(address.address)}
                                </p>
                                {address.label && (
                                  <p className="text-muted-foreground text-xs">{address.label}</p>
                                )}
                              </div>
                              <span className={cn(
                                "text-xs uppercase",
                                isDisabled ? "text-muted-foreground/50" : "text-muted-foreground"
                              )}>
                                {address.chainType}
                              </span>
                              {address.isDefault && (
                                <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs">
                                  Default
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  );
}

export const ContactPickerJob: ActivityComponentType<ContactPickerJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <ContactPickerJobContent />
    </ActivityParamsProvider>
  );
};
