import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ScannerPage } from "@/pages/scanner";

export const ScannerActivity: ActivityComponentType = () => {
  return (
    <AppScreen appBar={{ title: "扫描", border: false }}>
      <ScannerPage />
    </AppScreen>
  );
};
