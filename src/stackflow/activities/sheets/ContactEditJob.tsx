import { useState, useCallback, useEffect } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { useStore } from "@tanstack/react-store";
import { cn } from "@/lib/utils";
import { addressBookStore, addressBookActions, addressBookSelectors, type ChainType } from "@/stores";
import { IconWallet as Wallet, IconFileText as FileText, IconRefresh as Refresh, IconTag as Tag } from "@tabler/icons-react";
import { ContactAvatar } from "@/components/common/contact-avatar";
import { generateAvatarFromAddress } from "@/lib/avatar-codec";
import { useFlow } from "../../stackflow";
import { ActivityParamsProvider, useActivityParams } from "../../hooks";

type ContactEditJobParams = {
  contactId?: string;
  defaultChain?: string;
};

function ContactEditJobContent() {
  const { t } = useTranslation("common");
  const { pop } = useFlow();
  const { contactId, defaultChain } = useActivityParams<ContactEditJobParams>();

  const contacts = useStore(addressBookStore, (s) => s.contacts);
  const contact = contactId ? contacts.find((c) => c.id === contactId) : null;

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [addressLabel, setAddressLabel] = useState("");
  const [memo, setMemo] = useState("");
  const [avatarSeed, setAvatarSeed] = useState(0);

  const isEditing = !!contact;

  // Get default address for editing
  const defaultAddress = contact
    ? addressBookSelectors.getDefaultAddress(contact, defaultChain as ChainType | undefined)
    : undefined;

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setAddress(defaultAddress?.address ?? "");
      setAddressLabel(defaultAddress?.label ?? "");
      setMemo(contact.memo ?? "");
    }
  }, [contact, defaultAddress]);

  // 切换头像
  const handleChangeAvatar = useCallback(() => {
    setAvatarSeed(prev => prev + 1);
  }, []);

  // 当前头像 URL
  const currentAvatar = contact?.avatar || (address.trim() ? generateAvatarFromAddress(address.trim(), avatarSeed) : undefined);

  const handleSave = useCallback(() => {
    const trimmedName = name.trim();
    const trimmedAddress = address.trim();
    const trimmedLabel = addressLabel.trim();
    const trimmedMemo = memo.trim();

    if (!trimmedName || !trimmedAddress) return;

    // 生成最终头像
    const finalAvatar = contact?.avatar || generateAvatarFromAddress(trimmedAddress, avatarSeed);

    if (isEditing && contact) {
      // Update contact name, memo and avatar
      addressBookActions.updateContact(contact.id, {
        name: trimmedName,
        avatar: finalAvatar,
        ...(trimmedMemo ? { memo: trimmedMemo } : {}),
      });

      // Update address if changed
      if (defaultAddress && (defaultAddress.address !== trimmedAddress || defaultAddress.label !== trimmedLabel)) {
        // Remove old address and add new one
        addressBookActions.removeAddressFromContact(contact.id, defaultAddress.id);
        addressBookActions.addAddressToContact(contact.id, {
          address: trimmedAddress,
          label: trimmedLabel || undefined,
          isDefault: true,
        });
      }
    } else {
      // Add new contact with single address
      addressBookActions.addContact({
        name: trimmedName,
        addresses: [
          {
            id: crypto.randomUUID(),
            address: trimmedAddress,
            label: trimmedLabel || undefined,
            isDefault: true,
          },
        ],
        avatar: finalAvatar,
        ...(trimmedMemo ? { memo: trimmedMemo } : {}),
      });
    }

    pop();
  }, [name, address, addressLabel, memo, avatarSeed, isEditing, contact, defaultAddress, pop]);

  const canSave = name.trim().length > 0 && address.trim().length > 0;

  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>

        {/* Title */}
        <div className="border-b border-border px-4 pb-4">
          <h2 className="text-center text-lg font-semibold">
            {isEditing ? t("contact.editTitle") : t("contact.addTitle")}
          </h2>
        </div>

        {/* Content */}
        <div className="space-y-4 p-4">
          {/* Avatar & Name */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleChangeAvatar}
              disabled={!address.trim() || !!contact?.avatar}
              className="group relative shrink-0"
              title={t("addressBook.changeAvatar")}
            >
              <ContactAvatar src={currentAvatar} size={56} />
              {address.trim() && !contact?.avatar && (
                <div className="bg-background/80 absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100">
                  <Refresh className="text-primary size-5" />
                </div>
              )}
            </button>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("contact.namePlaceholder")}
              maxLength={20}
              className={cn(
                "flex-1 rounded-xl border border-border bg-background px-4 py-3",
                "focus:outline-none focus:ring-2 focus:ring-primary"
              )}
            />
          </div>

          {/* Address input */}
          <div className="space-y-2">
            <label htmlFor="contact-address" className="flex items-center gap-2 text-sm font-medium">
              <Wallet className="size-4" />
              {t("contact.address")}
            </label>
            <input
              id="contact-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("contact.addressPlaceholder")}
              className={cn(
                "w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm",
                "focus:outline-none focus:ring-2 focus:ring-primary"
              )}
            />
          </div>

          {/* Address label input */}
          <div className="space-y-2">
            <label htmlFor="contact-address-label" className="flex items-center gap-2 text-sm font-medium">
              <Tag className="size-4" />
              {t("contact.addressLabel")}
            </label>
            <input
              id="contact-address-label"
              type="text"
              value={addressLabel}
              onChange={(e) => setAddressLabel(e.target.value)}
              placeholder={t("contact.addressLabelPlaceholder")}
              maxLength={20}
              className={cn(
                "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-primary"
              )}
            />
          </div>

          {/* Memo input */}
          <div className="space-y-2">
            <label htmlFor="contact-memo" className="flex items-center gap-2 text-sm font-medium">
              <FileText className="size-4" />
              {t("contact.memoOptional")}
            </label>
            <textarea
              id="contact-memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={t("contact.memoPlaceholder")}
              maxLength={100}
              rows={2}
              className={cn(
                "w-full resize-none rounded-xl border border-border bg-background px-4 py-3",
                "focus:outline-none focus:ring-2 focus:ring-primary"
              )}
            />
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={cn(
                "w-full rounded-full py-3 font-medium text-primary-foreground transition-colors",
                "bg-primary hover:bg-primary/90",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {isEditing ? t("contact.save") : t("contact.add")}
            </button>
            <button
              onClick={() => pop()}
              className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
            >
              {t("contact.cancel")}
            </button>
          </div>
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  );
}

export const ContactEditJob: ActivityComponentType<ContactEditJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <ContactEditJobContent />
    </ActivityParamsProvider>
  );
};
