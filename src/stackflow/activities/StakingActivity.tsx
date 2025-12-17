import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { StakingPage } from "@/pages/staking";

export const StakingActivity: ActivityComponentType = () => {
  return (
    <AppScreen appBar={{ title: "质押" }}>
      <StakingPage />
    </AppScreen>
  );
};
