import { useState, useMemo } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { useStore } from "@tanstack/react-store";
import { cn } from "@/lib/utils";
import { IconUser, IconSearch, IconChevronRight } from "@tabler/icons-react";
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

function ContactPickerJobContent() {
  const { t } = useTranslation("common");
  const { pop } = useFlow();
  const { chainType: chainTypeParam } = useActivityParams<ContactPickerJobParams>();
  const chainType = chainTypeParam as ChainType | undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);

  const addressBookState = useStore(addressBookStore);

  const filteredContacts = useMemo(() => {
    let contacts = addressBookState.contacts;

    // Filter by chain type if specified
    if (chainType) {
      contacts = addressBookSelectors.getContactsByChain(addressBookState, chainType);
    }

    // Filter by search query
    if (searchQuery) {
      contacts = addressBookSelectors.searchContacts(
        { ...addressBookState, contacts },
        searchQuery
      );
    }

    // Sort by updated time (most recent first)
    return [...contacts].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [addressBookState, chainType, searchQuery]);

  const handleSelectAddress = (contact: Contact, address: ContactAddress) => {
    // Store selected address in a way that can be retrieved by the caller
    // We use a custom event since stackflow doesn't support return values directly
    const event = new CustomEvent("contact-picker-select", {
      detail: { contact, address },
    });
    window.dispatchEvent(event);
    pop();
  };

  const getRelevantAddresses = (contact: Contact) => {
    if (chainType) {
      return contact.addresses.filter((a) => a.chainType === chainType);
    }
    return contact.addresses;
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
                const hasMultipleAddresses = addresses.length > 1;
                const isExpanded = expandedContactId === contact.id;

                // If only one address or expanded, show all addresses
                if (!hasMultipleAddresses) {
                  const address = addresses[0];
                  if (!address) return null;
                  return (
                    <button
                      key={contact.id}
                      onClick={() => handleSelectAddress(contact, address)}
                      className="hover:bg-muted/50 flex w-full items-center gap-3 px-4 py-3 transition-colors"
                    >
                      <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                        <IconUser className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate font-medium">{contact.name}</p>
                        <p className="text-muted-foreground truncate font-mono text-xs">
                          {truncateAddress(address.address)}
                        </p>
                      </div>
                      <span className="text-muted-foreground text-xs uppercase">
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
                      className="hover:bg-muted/50 flex w-full items-center gap-3 px-4 py-3 transition-colors"
                    >
                      <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                        <IconUser className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate font-medium">{contact.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {addresses.length} {t("contact.selectAddress")}
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
                        {addresses.map((address) => (
                          <button
                            key={address.id}
                            onClick={() => handleSelectAddress(contact, address)}
                            className="hover:bg-muted/50 flex w-full items-center gap-3 px-4 py-2.5 transition-colors"
                          >
                            <div className="min-w-0 flex-1 text-left">
                              <p className="text-muted-foreground truncate font-mono text-xs">
                                {truncateAddress(address.address)}
                              </p>
                              {address.label && (
                                <p className="text-muted-foreground text-xs">{address.label}</p>
                              )}
                            </div>
                            <span className="text-muted-foreground text-xs uppercase">
                              {address.chainType}
                            </span>
                            {address.isDefault && (
                              <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs">
                                Default
                              </span>
                            )}
                          </button>
                        ))}
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
