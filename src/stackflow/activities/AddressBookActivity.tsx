import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { AddressBookPage } from "@/pages/address-book";

export const AddressBookActivity: ActivityComponentType = () => {
  return (
    <AppScreen appBar={{ title: "地址簿" }}>
      <AddressBookPage />
    </AppScreen>
  );
};
