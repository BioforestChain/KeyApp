import type { ActivityComponentType } from "@stackflow/react";
import { Modal } from "@/components/layout/bottom-sheet";
import { IconAlertTriangle as AlertTriangle } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useFlow } from "../../stackflow";

let onConfirmCallback: (() => void) | null = null;

export function setSecurityWarningConfirmCallback(cb: () => void) {
  onConfirmCallback = cb;
}

export const SecurityWarningJob: ActivityComponentType = () => {
  const { t } = useTranslation(["onboarding", "common"]);
  const { pop } = useFlow();
  const [acknowledged, setAcknowledged] = useState(false);

  const handleCancel = () => {
    pop();
  };

  const handleConfirm = () => {
    if (!acknowledged) return;
    pop();
    onConfirmCallback?.();
    onConfirmCallback = null;
  };

  return (
    <Modal>
      <div className="bg-background mx-4 max-w-sm rounded-2xl p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-amber-500/15 p-2">
            <AlertTriangle
              className="size-5 text-amber-600"
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold">
              {t("onboarding:securityWarning.title")}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("onboarding:securityWarning.message")}
            </p>
          </div>
        </div>

        {/* Checkbox */}
        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={acknowledged}
            onCheckedChange={setAcknowledged}
          />
          <span>{t("onboarding:securityWarning.acknowledge")}</span>
        </label>

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
          >
            {t("common:cancel")}
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleConfirm}
            disabled={!acknowledged}
          >
            {t("common:confirm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
