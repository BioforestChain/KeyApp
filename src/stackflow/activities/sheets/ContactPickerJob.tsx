import { useState, useMemo } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { useStore } from "@tanstack/react-store";
import { cn } from "@/lib/utils";
import { IconSearch } from "@tabler/icons-react";
import { ContactAvatar } from "@/components/common/contact-avatar";
import { generateAvatarFromAddress } from "@/lib/avatar-codec";
import { isValidAddressForChain } from "@/lib/address-format";
import { addressBookStore, addressBookSelectors, type ChainType, type Contact, type ContactAddress } from "@/stores";
import { useFlow } from "../../stackflow";
import { ActivityParamsProvider, useActivityParams } from "../../hooks";

type ContactPickerJobParams = {
  chainType?: string;
};

function truncateAddress(address: string, startChars = 8, endChars = 6): string {
  if (address.length <= startChars + endChars + 3) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

interface AddressWithValidity extends ContactAddress {
  isValidForCurrentChain: boolean;
}

function ContactPickerJobContent() {
  const { t } = useTranslation("common");
  const { pop } = useFlow();
  const { chainType: chainTypeParam } = useActivityParams<ContactPickerJobParams>();
  const chainType = chainTypeParam as ChainType | undefined;

  const [searchQuery, setSearchQuery] = useState("");

  const addressBookState = useStore(addressBookStore);

  // 按联系人分组，每个联系人的地址带有效性标记
  const contactsWithAddresses = useMemo(() => {
    let contacts = addressBookState.contacts;

    if (searchQuery) {
      contacts = addressBookSelectors.searchContacts(addressBookState, searchQuery);
    }

    // Sort by updated time
    contacts = [...contacts].toSorted((a, b) => b.updatedAt - a.updatedAt);

    return contacts.map((contact) => {
      const addresses: AddressWithValidity[] = contact.addresses.map((addr) => ({
        ...addr,
        isValidForCurrentChain: chainType ? isValidAddressForChain(addr.address, chainType) : true,
      }));
      
      const hasValidAddress = addresses.some((a) => a.isValidForCurrentChain);
      
      return { contact, addresses, hasValidAddress };
    });
  }, [addressBookState, searchQuery, chainType]);

  const handleSelectAddress = (contact: Contact, address: ContactAddress) => {
    const event = new CustomEvent("contact-picker-select", {
      detail: { contact, address },
    });
    window.dispatchEvent(event);
    pop();
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
            {t("contact.selectAddress")}
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
          {contactsWithAddresses.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              {searchQuery ? t("addressBook.noResults") : t("contact.noContacts")}
            </div>
          ) : (
            <div className="divide-border divide-y">
              {contactsWithAddresses.map(({ contact, addresses, hasValidAddress }) => (
                <div key={contact.id} className={cn(!hasValidAddress && "opacity-50")}>
                  {/* Contact header: avatar + name */}
                  <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                    <ContactAvatar
                      src={contact.avatar || (addresses[0]?.address ? generateAvatarFromAddress(addresses[0].address) : undefined)}
                      size={40}
                      className="shrink-0"
                    />
                    <p className="min-w-0 flex-1 truncate font-medium">{contact.name}</p>
                  </div>
                  
                  {/* Address list */}
                  <div className="space-y-1 pb-3 pl-[56px] pr-4">
                    {addresses.map((address) => {
                      const isDisabled = !address.isValidForCurrentChain;
                      const label = address.label;
                      
                      return (
                        <button
                          key={address.id}
                          onClick={() => !isDisabled && handleSelectAddress(contact, address)}
                          disabled={isDisabled}
                          className={cn(
                            "flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                            isDisabled ? "cursor-not-allowed opacity-50" : "hover:bg-muted/50 active:bg-muted"
                          )}
                        >
                          <p className={cn(
                            "min-w-0 flex-1 truncate text-left font-mono text-sm",
                            isDisabled ? "text-muted-foreground/50" : "text-foreground"
                          )}>
                            {truncateAddress(address.address)}
                          </p>
                          <div className="flex shrink-0 items-center gap-2">
                            {label && (
                              <span className={cn(
                                "max-w-[5rem] truncate rounded-md bg-muted px-2 py-0.5 text-xs",
                                isDisabled ? "text-muted-foreground/50" : "text-muted-foreground"
                              )}>
                                {label}
                              </span>
                            )}
                                {address.isDefault && (
                                  <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs">
                                    {t("contact.defaultLabel")}
                                  </span>
                                )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
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
