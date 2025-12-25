import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { IconPlus, IconDownload } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useFlow } from "../../stackflow";
import { useNavigation } from "../../hooks/use-navigation";

export const WalletAddJob: ActivityComponentType = () => {
  const { t } = useTranslation(["wallet", "home"]);
  const { pop } = useFlow();
  const { navigate } = useNavigation();

  const handleCreate = () => {
    pop();
    navigate({ to: "/wallet/create" });
  };

  const handleImport = () => {
    pop();
    navigate({ to: "/onboarding/recover" });
  };

  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>

        {/* Title */}
        <div className="border-b border-border px-4 pb-4">
          <h2 className="text-center text-lg font-semibold">{t("wallet:add")}</h2>
        </div>

        {/* Options */}
        <div className="space-y-3 p-4">
          {/* Create new wallet */}
          <button
            onClick={handleCreate}
            className={cn(
              "flex w-full items-center gap-4 rounded-xl p-4 transition-colors",
              "bg-muted/50 hover:bg-muted active:bg-muted/80"
            )}
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <IconPlus className="size-6 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold">{t("home:welcome.createWallet")}</div>
              <div className="text-sm text-muted-foreground">{t("wallet:createDesc")}</div>
            </div>
          </button>

          {/* Import existing wallet */}
          <button
            onClick={handleImport}
            className={cn(
              "flex w-full items-center gap-4 rounded-xl p-4 transition-colors",
              "bg-muted/50 hover:bg-muted active:bg-muted/80"
            )}
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <IconDownload className="size-6 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold">{t("home:welcome.importWallet")}</div>
              <div className="text-sm text-muted-foreground">{t("wallet:importDesc")}</div>
            </div>
          </button>
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  );
};
