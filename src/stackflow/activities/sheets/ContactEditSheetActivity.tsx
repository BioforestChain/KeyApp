import { useState, useCallback, useEffect } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@stackflow/plugin-basic-ui";
import { useTranslation } from "react-i18next";
import { useStore } from "@tanstack/react-store";
import { cn } from "@/lib/utils";
import { addressBookStore, addressBookActions, type ChainType } from "@/stores";
import { IconUser as User, IconWallet as Wallet, IconFileText as FileText } from "@tabler/icons-react";
import { useFlow } from "../../stackflow";
import { ActivityParamsProvider, useActivityParams } from "../../hooks";

type ContactEditSheetParams = {
  contactId?: string;
  defaultChain?: string;
};

function ContactEditSheetContent() {
  const { t } = useTranslation("common");
  const { pop } = useFlow();
  const { contactId, defaultChain } = useActivityParams<ContactEditSheetParams>();

  const contacts = useStore(addressBookStore, (s) => s.contacts);
  const contact = contactId ? contacts.find((c) => c.id === contactId) : null;

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [memo, setMemo] = useState("");

  const isEditing = !!contact;

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setAddress(contact.address);
      setMemo(contact.memo || "");
    }
  }, [contact]);

  const handleSave = useCallback(() => {
    const trimmedName = name.trim();
    const trimmedAddress = address.trim();
    const trimmedMemo = memo.trim();

    if (!trimmedName || !trimmedAddress) return;

    if (isEditing && contact) {
      addressBookActions.updateContact(contact.id, {
        name: trimmedName,
        address: trimmedAddress,
        ...(trimmedMemo && { memo: trimmedMemo }),
      });
    } else {
      addressBookActions.addContact({
        name: trimmedName,
        address: trimmedAddress,
        chain: (defaultChain as ChainType) || "ethereum",
        ...(trimmedMemo && { memo: trimmedMemo }),
      });
    }

    pop();
  }, [name, address, memo, isEditing, contact, defaultChain, pop]);

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
          {/* Name input */}
          <div className="space-y-2">
            <label htmlFor="contact-name" className="flex items-center gap-2 text-sm font-medium">
              <User className="size-4" />
              {t("contact.name")}
            </label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("contact.namePlaceholder")}
              maxLength={20}
              className={cn(
                "w-full rounded-xl border border-border bg-background px-4 py-3",
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
                "w-full rounded-full py-3 font-medium text-white transition-colors",
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

export const ContactEditSheetActivity: ActivityComponentType<ContactEditSheetParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <ContactEditSheetContent />
    </ActivityParamsProvider>
  );
};
