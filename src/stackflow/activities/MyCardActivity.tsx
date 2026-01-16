import type { ActivityComponentType } from '@stackflow/react';
import { AppScreen } from '@stackflow/plugin-basic-ui';
import { MyCardPage } from '@/pages/my-card';

export const MyCardActivity: ActivityComponentType = () => {
    return (
        <AppScreen>
            <MyCardPage />
        </AppScreen>
    );
};
