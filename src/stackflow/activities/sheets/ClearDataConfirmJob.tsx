import { useState, useCallback } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useFlow } from "../../stackflow";
import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";

async function clearAllData() {
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear all IndexedDB databases
  const databases = await indexedDB.databases();
  await Promise.all(
    databases.map((db) => {
      if (db.name) {
        return new Promise<void>((resolve, reject) => {
          const request = indexedDB.deleteDatabase(db.name!);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
      return Promise.resolve();
    })
  );
}

function ClearDataConfirmJobContent() {
  const { t } = useTranslation(["settings", "common"]);
  const { pop } = useFlow();
  const [isClearing, setIsClearing] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsClearing(true);
    try {
      await clearAllData();
      // Reload the page to reset app state
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to clear data:", error);
      setIsClearing(false);
    }
  }, []);

  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Warning Icon */}
          <div className="flex justify-center">
            <div className="bg-destructive/10 flex size-16 items-center justify-center rounded-full">
              <IconAlertTriangle className="text-destructive size-8" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-lg font-semibold">{t("settings:clearData.title")}</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {t("settings:clearData.warning")}
            </p>
          </div>

          {/* Warning List */}
          <div className="bg-destructive/5 rounded-lg p-4">
            <ul className="text-destructive space-y-2 text-sm">
              <li>• {t("settings:clearData.item1")}</li>
              <li>• {t("settings:clearData.item2")}</li>
              <li>• {t("settings:clearData.item3")}</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => pop()}
              disabled={isClearing}
            >
              {t("common:cancel")}
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleConfirm}
              disabled={isClearing}
            >
              {isClearing ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                t("settings:clearData.confirm")
              )}
            </Button>
          </div>
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  );
}

export const ClearDataConfirmJob: ActivityComponentType = () => {
  return <ClearDataConfirmJobContent />;
};
