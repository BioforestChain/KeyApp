import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ScannerPage } from "@/pages/scanner";

export const ScannerActivity: ActivityComponentType = () => {
  return (
    <AppScreen >
      <ScannerPage />
    </AppScreen>
  );
};
