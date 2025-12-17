import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ActivityParamsProvider } from "../hooks";
import { AddressAuthPage } from "@/pages/authorize/address";

type AuthorizeAddressParams = {
  id: string;
  type?: string;
  chainName?: string;
  signMessage?: string;
  getMain?: string;
};

export const AuthorizeAddressActivity: ActivityComponentType<AuthorizeAddressParams> = ({
  params,
}) => {
  return (
    <AppScreen >
      <ActivityParamsProvider params={params}>
        <AddressAuthPage />
      </ActivityParamsProvider>
    </AppScreen>
  );
};
