import type { Meta, StoryObj } from '@storybook/react';
import { SwiperSyncDemo, SwiperSyncDemoContext } from './swiper-sync-demo';

const meta: Meta<typeof SwiperSyncDemo> = {
  title: 'Ecosystem/SwiperSyncDemo',
  component: SwiperSyncDemo,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Controller 模块原理展示 */
export const Controller: Story = {};

/** Context 封装模式（跨组件同步） */
export const ContextMode: StoryObj<typeof SwiperSyncDemoContext> = {
  render: () => <SwiperSyncDemoContext />,
};
