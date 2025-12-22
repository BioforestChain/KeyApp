import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ActivityParamsProvider } from "../hooks";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { SendPage } from "@/pages/send";

type SendParams = {
  address?: string;
  chain?: string;
  amount?: string;
};

export const SendActivity: ActivityComponentType<SendParams> = ({ params }) => {
  return (
    <AppScreen>
      <ActivityParamsProvider params={params}>
        <ErrorBoundary>
          <SendPage />
        </ErrorBoundary>
      </ActivityParamsProvider>
    </AppScreen>
  );
};
