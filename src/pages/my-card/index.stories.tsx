import type { Meta, StoryObj } from '@storybook/react';
import { MyCardPage } from './index';

/**
 * MyCardPage - 我的名片页面
 * 
 * 功能：
 * - 显示和编辑用户名
 * - 点击头像随机更换
 * - 选择最多3个钱包显示在名片上
 * - QR码使用 contact 协议
 * - 下载/分享功能
 */
const meta: Meta<typeof MyCardPage> = {
    title: 'Pages/MyCardPage',
    component: MyCardPage,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: '我的名片页面 - 用于分享个人钱包地址二维码',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MyCardPage>;

export const Default: Story = {};

export const WithUsername: Story = {
    play: async () => {
        // Pre-set username for testing
        const { userProfileActions } = await import('@/stores/user-profile');
        userProfileActions.setUsername('测试用户');
        userProfileActions.randomizeAvatar();
    },
};
