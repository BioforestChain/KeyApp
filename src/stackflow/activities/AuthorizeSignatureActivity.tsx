import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ActivityParamsProvider } from "../hooks";
import { SignatureAuthPage } from "@/pages/authorize/signature";

type AuthorizeSignatureParams = {
  id: string;
  signaturedata?: string;
};

export const AuthorizeSignatureActivity: ActivityComponentType<AuthorizeSignatureParams> = ({
  params,
}) => {
  return (
    <AppScreen appBar={{ title: "签名授权" }}>
      <ActivityParamsProvider params={params}>
        <SignatureAuthPage />
      </ActivityParamsProvider>
    </AppScreen>
  );
};
