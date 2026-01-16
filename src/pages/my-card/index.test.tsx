import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyCardPage } from './index';

// Mock i18next - inline
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, params?: Record<string, unknown>) => {
            const translations: Record<string, string> = {
                'myCard.title': '我的名片',
                'myCard.defaultName': '我的名片',
                'myCard.changeAvatar': '点击换头像',
                'myCard.usernamePlaceholder': '输入用户名',
                'myCard.selectWallets': '选择钱包',
                'myCard.addWallet': '添加钱包',
                'myCard.maxWallets': `最多选择 ${params?.max ?? 3} 个钱包`,
                'myCard.noWalletsSelected': '请选择至少一个钱包',
                'myCard.scanToAdd': '扫码添加我为联系人',
                'download': '下载',
                'share': '分享',
            };
            return translations[key] ?? key;
        },
    }),
}));

// Mock stackflow - inline
vi.mock('@/stackflow', () => ({
    useNavigation: () => ({
        goBack: vi.fn(),
    }),
}));

// Mock stores - all inline with vi.fn inside factory
vi.mock('@/stores', () => ({
    useUserProfile: () => ({
        username: '',
        avatar: 'avatar:TESTDATA',
        selectedWalletIds: ['wallet-1'],
    }),
    userProfileActions: {
        setUsername: vi.fn(),
        randomizeAvatar: vi.fn(),
        initializeDefaultAvatar: vi.fn(),
        toggleWalletSelection: vi.fn(),
    },
    useWallets: () => [
        {
            id: 'wallet-1',
            name: 'Main Wallet',
            chain: 'ethereum',
            chainAddresses: [
                { chain: 'ethereum', address: '0x1234567890abcdef1234567890abcdef12345678' },
                { chain: 'bitcoin', address: 'bc1qtest123' },
            ],
        },
        {
            id: 'wallet-2',
            name: 'Savings',
            chain: 'bitcoin',
            chainAddresses: [
                { chain: 'bitcoin', address: 'bc1qsavings456' },
            ],
        },
    ],
    useChainPreferences: () => ({
        'wallet-1': 'ethereum',
        'wallet-2': 'bitcoin',
    }),
    useSelectedWalletIds: () => ['wallet-1'],
    useCanAddMoreWallets: () => true,
    useIsWalletSelected: () => false,
}));

// Mock QR parser - inline
vi.mock('@/lib/qr-parser', () => ({
    generateContactQRContent: vi.fn(() => '{"type":"contact","name":"test"}'),
}));

// Mock ContactCard - inline
vi.mock('@/components/contact/contact-card', () => ({
    ContactCard: ({ name, avatar, addresses, qrContent }: { name: string; avatar: string; addresses: unknown[]; qrContent: string }) => (
        <div data-testid="contact-card">
            <span data-testid="card-name">{name}</span>
            <span data-testid="card-avatar">{avatar}</span>
            <span data-testid="card-addresses">{JSON.stringify(addresses)}</span>
            <span data-testid="card-qr-content">{qrContent}</span>
        </div>
    ),
}));

// Mock ContactAvatar - inline
vi.mock('@/components/common/contact-avatar', () => ({
    ContactAvatar: ({ src, size }: { src: string; size: number }) => (
        <div data-testid="contact-avatar" data-src={src} data-size={size} />
    ),
}));

// Mock snapdom - inline
vi.mock('@zumer/snapdom', () => ({
    snapdom: {
        download: vi.fn(),
    },
}));

// Mock Sheet component - inline
vi.mock('@/components/ui/sheet', () => ({
    Sheet: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
        open ? <div data-testid="sheet-overlay">{children}</div> : null,
    SheetContent: ({ children }: { children: React.ReactNode }) =>
        <div data-testid="sheet-content">{children}</div>,
    SheetHeader: ({ children }: { children: React.ReactNode }) =>
        <div data-testid="sheet-header">{children}</div>,
    SheetTitle: ({ children }: { children: React.ReactNode }) =>
        <h2 data-testid="sheet-title">{children}</h2>,
}));

describe('MyCardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('AC-1: Page Rendering', () => {
        it('renders page header with title', () => {
            render(<MyCardPage />);
            // Use testid since '我的名片' appears in multiple places
            expect(screen.getByTestId('page-title')).toHaveTextContent('我的名片');
        });

        it('renders avatar area', () => {
            render(<MyCardPage />);
            expect(screen.getByTestId('contact-avatar')).toBeInTheDocument();
        });

        it('renders ContactCard with QR code', () => {
            render(<MyCardPage />);
            expect(screen.getByTestId('contact-card')).toBeInTheDocument();
        });

        it('renders download button', () => {
            render(<MyCardPage />);
            expect(screen.getByText('下载')).toBeInTheDocument();
        });
    });

    describe('AC-2: Avatar Functionality', () => {
        it('clicking avatar triggers randomizeAvatar', async () => {
            const { userProfileActions } = await import('@/stores');
            render(<MyCardPage />);

            const avatarButton = screen.getByLabelText('点击换头像');
            await userEvent.click(avatarButton);

            expect(userProfileActions.randomizeAvatar).toHaveBeenCalled();
        });
    });

    describe('AC-4: Wallet Selection', () => {
        it('displays selected wallet chip', () => {
            render(<MyCardPage />);
            expect(screen.getByText('Main Wallet')).toBeInTheDocument();
        });

        it('shows add wallet button when under limit', () => {
            render(<MyCardPage />);
            expect(screen.getByText('添加钱包')).toBeInTheDocument();
        });

        it('removes wallet when X is clicked on chip', async () => {
            const { userProfileActions } = await import('@/stores');
            render(<MyCardPage />);

            const removeButton = screen.getByLabelText('Remove Main Wallet');
            await userEvent.click(removeButton);

            expect(userProfileActions.toggleWalletSelection).toHaveBeenCalledWith('wallet-1');
        });

        it('shows max wallets message', () => {
            render(<MyCardPage />);
            expect(screen.getByText(/最多选择.*3.*个钱包/)).toBeInTheDocument();
        });
    });

    describe('AC-5: QR Code Generation', () => {
        it('calls generateContactQRContent', async () => {
            const { generateContactQRContent } = await import('@/lib/qr-parser');
            render(<MyCardPage />);

            expect(generateContactQRContent).toHaveBeenCalled();
        });

        it('displays addresses from selected wallets in ContactCard', () => {
            render(<MyCardPage />);

            const addressesElement = screen.getByTestId('card-addresses');
            expect(addressesElement.textContent).toContain('0x1234567890abcdef');
        });
    });

    describe('AC-6: Download/Share', () => {
        it('download button is enabled when wallets are selected', () => {
            render(<MyCardPage />);

            const downloadButton = screen.getByRole('button', { name: /下载/i });
            expect(downloadButton).not.toBeDisabled();
        });

        it('clicking download triggers snapdom.download', async () => {
            const { snapdom } = await import('@zumer/snapdom');
            render(<MyCardPage />);

            const downloadButton = screen.getByRole('button', { name: /下载/i });
            await userEvent.click(downloadButton);

            // Wait for async download to complete
            await waitFor(() => {
                expect(snapdom.download).toHaveBeenCalled();
            }, { timeout: 3000 });
        });
    });
});
