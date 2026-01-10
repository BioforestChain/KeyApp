import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ActivityParamsProvider } from "../hooks";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { DestroyPage } from "@/pages/destroy";

type DestroyParams = {
  assetType?: string;
  assetLocked?: string;
};

export const DestroyActivity: ActivityComponentType<DestroyParams> = ({ params }) => {
  return (
    <AppScreen>
      <ActivityParamsProvider params={params}>
        <ErrorBoundary>
          <DestroyPage />
        </ErrorBoundary>
      </ActivityParamsProvider>
    </AppScreen>
  );
};
