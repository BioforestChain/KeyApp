import { useState, useCallback, useEffect } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { useStore } from "@tanstack/react-store";
import { cn } from "@/lib/utils";
import { addressBookStore, addressBookActions } from "@/stores";
import { IconFileText as FileText, IconRefresh as Refresh, IconPlus, IconTrash } from "@tabler/icons-react";
import { ContactAvatar } from "@/components/common/contact-avatar";
import { generateAvatarFromAddress } from "@/lib/avatar-codec";
import { useFlow } from "../../stackflow";
import { ActivityParamsProvider, useActivityParams } from "../../hooks";

type ContactEditJobParams = {
  contactId?: string;
};

interface AddressEntry {
  id: string;
  label: string;
  address: string;
}

const MAX_ADDRESSES = 3;
const MAX_LABEL_LENGTH = 10;

function ContactEditJobContent() {
  const { t } = useTranslation("common");
  const { pop } = useFlow();
  const { contactId } = useActivityParams<ContactEditJobParams>();

  const contacts = useStore(addressBookStore, (s) => s.contacts);
  const contact = contactId ? contacts.find((c) => c.id === contactId) : null;

  const [name, setName] = useState("");
  const [addresses, setAddresses] = useState<AddressEntry[]>([{ id: crypto.randomUUID(), label: "", address: "" }]);
  const [memo, setMemo] = useState("");
  const [avatarSeed, setAvatarSeed] = useState(() => Math.floor(Math.random() * 10000));
  const [avatarChanged, setAvatarChanged] = useState(false);

  const isEditing = !!contact;

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setAddresses(
        contact.addresses.length > 0
          ? contact.addresses.map((a) => ({ id: a.id, label: a.label || "", address: a.address }))
          : [{ id: crypto.randomUUID(), label: "", address: "" }]
      );
      setMemo(contact.memo ?? "");
      setAvatarChanged(false);
    }
  }, [contact]);

  // 切换头像（使用随机 seed）
  const handleChangeAvatar = useCallback(() => {
    setAvatarSeed(Math.floor(Math.random() * 10000));
    setAvatarChanged(true);
  }, []);

  // 第一个有效地址用于生成头像
  const firstValidAddress = addresses.find((a) => a.address.trim())?.address.trim();
  // 如果用户修改过头像或者是新建联系人，使用生成的头像；否则使用已保存的头像
  const currentAvatar = (!isEditing || avatarChanged)
    ? (firstValidAddress ? generateAvatarFromAddress(firstValidAddress, avatarSeed) : undefined)
    : (contact?.avatar || (firstValidAddress ? generateAvatarFromAddress(firstValidAddress, avatarSeed) : undefined));

  // 添加新地址
  const handleAddAddress = useCallback(() => {
    if (addresses.length >= MAX_ADDRESSES) return;
    setAddresses((prev) => [...prev, { id: crypto.randomUUID(), label: "", address: "" }]);
  }, [addresses.length]);

  // 删除地址
  const handleRemoveAddress = useCallback((id: string) => {
    setAddresses((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  // 更新地址
  const handleUpdateAddress = useCallback((id: string, field: "label" | "address", value: string) => {
    setAddresses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  }, []);

  const handleSave = useCallback(() => {
    const trimmedName = name.trim();
    const trimmedMemo = memo.trim();

    // 过滤有效地址
    const validAddresses = addresses
      .filter((a) => a.address.trim())
      .map((a, i) => ({
        id: a.id,
        address: a.address.trim(),
        label: a.label.trim() || undefined,
        isDefault: i === 0,
      }));

    if (!trimmedName || validAddresses.length === 0) return;

    // 生成最终头像（如果用户修改过或是新建，使用当前生成的头像）
    const finalAvatar = (!isEditing || avatarChanged)
      ? (validAddresses[0] ? generateAvatarFromAddress(validAddresses[0].address, avatarSeed) : undefined)
      : contact?.avatar;

    if (isEditing && contact) {
      // 更新联系人
      addressBookActions.updateContact(contact.id, {
        name: trimmedName,
        avatar: finalAvatar,
        addresses: validAddresses,
        memo: trimmedMemo || undefined,
      });
    } else {
      // 添加新联系人
      addressBookActions.addContact({
        name: trimmedName,
        addresses: validAddresses,
        avatar: finalAvatar,
        memo: trimmedMemo || undefined,
      });
    }

    pop();
  }, [name, addresses, memo, avatarSeed, isEditing, contact, pop]);

  const hasValidAddress = addresses.some((a) => a.address.trim());
  const canSave = name.trim().length > 0 && hasValidAddress;
  const canAddMore = addresses.length < MAX_ADDRESSES;

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
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="space-y-4 p-4">
            {/* Avatar & Name */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleChangeAvatar}
                disabled={!firstValidAddress}
                className="group relative shrink-0"
                title={t("addressBook.changeAvatar")}
              >
                <ContactAvatar src={currentAvatar} size={56} />
                {firstValidAddress && (
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

            {/* Addresses */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("contact.addresses")}</span>
                <span className="text-muted-foreground text-xs">{addresses.length}/{MAX_ADDRESSES}</span>
              </div>

              {addresses.map((addr, index) => (
                <div key={addr.id} className="space-y-2 rounded-xl border border-border p-3">
                  <div className="flex items-center gap-2">
                    {/* Label input - before address */}
                    <input
                      type="text"
                      value={addr.label}
                      onChange={(e) => handleUpdateAddress(addr.id, "label", e.target.value)}
                      placeholder={t("contact.addressLabelPlaceholder")}
                      maxLength={MAX_LABEL_LENGTH}
                      className={cn(
                        "w-24 shrink-0 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm",
                        "focus:outline-none focus:ring-2 focus:ring-primary"
                      )}
                    />
                    {/* Delete button */}
                    {addresses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAddress(addr.id)}
                        className="text-muted-foreground hover:text-destructive shrink-0 p-1"
                      >
                        <IconTrash className="size-4" />
                      </button>
                    )}
                    {index === 0 && (
                      <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs">
                        Default
                      </span>
                    )}
                  </div>
                  {/* Address input */}
                  <input
                    type="text"
                    value={addr.address}
                    onChange={(e) => handleUpdateAddress(addr.id, "address", e.target.value)}
                    placeholder={t("contact.addressPlaceholder")}
                    className={cn(
                      "w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm",
                      "focus:outline-none focus:ring-2 focus:ring-primary"
                    )}
                  />
                </div>
              ))}

              {/* Add address button */}
              {canAddMore && (
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <IconPlus className="size-4" />
                  {t("contact.addAddress")}
                </button>
              )}
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
