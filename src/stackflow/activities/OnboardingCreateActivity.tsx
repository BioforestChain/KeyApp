import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { OnboardingCreatePage } from "@/pages/onboarding/create";

export const OnboardingCreateActivity: ActivityComponentType = () => {
  return (
    <AppScreen appBar={{ title: "创建钱包" }}>
      <OnboardingCreatePage />
    </AppScreen>
  );
};
