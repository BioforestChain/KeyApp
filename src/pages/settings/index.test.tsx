import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsItem } from './settings-item';
import { SettingsSection } from './settings-section';
import { SettingsPage } from './index';
import { TestI18nProvider, testI18n } from '@/test/i18n-mock';
import { IconWallet as Wallet } from '@tabler/icons-react';

const t = testI18n.getFixedT('zh-CN');

// Mock stackflow
const mockNavigate = vi.fn();
vi.mock('@/stackflow', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: vi.fn() }),
  useActivityParams: () => ({}),
}));

// Mock wallet store
vi.mock('@/stores', () => ({
  useCurrentWallet: () => ({
    id: 'wallet-1',
    name: 'My Wallet',
    chainAddresses: [
      { chain: 'ethereum', address: '0x1234' },
      { chain: 'bitcoin', address: 'bc1abc' },
    ],
  }),
  useLanguage: () => 'zh-CN',
  useCurrency: () => 'USD',
  useTheme: () => 'system',
  languages: {
    'zh-CN': { name: '简体中文', dir: 'ltr' },
    en: { name: 'English', dir: 'ltr' },
    ar: { name: 'العربية', dir: 'rtl' },
  },
  currencies: {
    USD: { symbol: '$', name: 'US Dollar' },
    CNY: { symbol: '¥', name: 'Chinese Yuan' },
  },
}));

// Test wrapper
function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>);
}

describe('SettingsItem', () => {
  it('renders label', () => {
    render(<SettingsItem label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<SettingsItem label="Wallet" icon={<Wallet data-testid="wallet-icon" size={20} />} />);
    expect(screen.getByTestId('wallet-icon')).toBeInTheDocument();
  });

  it('renders value when provided', () => {
    render(<SettingsItem label="Language" value="English" />);
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('renders chevron when clickable', () => {
    render(<SettingsItem label="Language" onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('handles click', async () => {
    const handleClick = vi.fn();
    render(<SettingsItem label="Language" onClick={handleClick} />);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables click when disabled', async () => {
    const handleClick = vi.fn();
    render(<SettingsItem label="Language" onClick={handleClick} disabled />);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe('SettingsSection', () => {
  it('renders title', () => {
    render(
      <SettingsSection title="Security">
        <div>Content</div>
      </SettingsSection>,
    );
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <SettingsSection title="Security">
        <div data-testid="child">Content</div>
      </SettingsSection>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header', () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText(t('settings:title'))).toBeInTheDocument();
  });

  it('displays wallet info card', () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText('My Wallet')).toBeInTheDocument();
    expect(screen.getByText(t('settings:chainAddressCount', { count: 2 }))).toBeInTheDocument();
  });

  it('displays wallet avatar with first letter', () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('renders all settings sections', () => {
    renderWithProviders(<SettingsPage />);

    const sectionTitles = screen.getAllByRole('heading', { level: 3 });
    const titles = sectionTitles.map((el) => el.textContent);

    expect(titles).toContain(t('settings:sections.walletManagement'));
    expect(titles).toContain(t('settings:sections.security'));
    expect(titles).toContain(t('settings:sections.preferences'));
    expect(titles).toContain(t('settings:sections.about'));
  });

  it('renders security settings items', () => {
    renderWithProviders(<SettingsPage />);

    expect(screen.getByText(t('settings:items.appLock'))).toBeInTheDocument();
    expect(screen.getByText(t('settings:items.viewMnemonic'))).toBeInTheDocument();
    expect(screen.getByText(t('settings:items.changeWalletLock'))).toBeInTheDocument();
  });

  it('renders preference settings items', () => {
    renderWithProviders(<SettingsPage />);

    expect(screen.getByText(t('settings:items.language'))).toBeInTheDocument();
    expect(screen.getByText(t('settings:items.currency'))).toBeInTheDocument();
    expect(screen.getByText(t('settings:items.appearance'))).toBeInTheDocument();
  });

  it('shows current language value', () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText('简体中文')).toBeInTheDocument();
  });

  it('shows current currency value', () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText('USD ($)')).toBeInTheDocument();
  });

  it('navigates to mnemonic page when clicking view mnemonic', async () => {
    renderWithProviders(<SettingsPage />);

    await userEvent.click(screen.getByText(t('settings:items.viewMnemonic')));
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/settings/mnemonic' });
  });

  it('navigates to address book page when clicking address book', async () => {
    renderWithProviders(<SettingsPage />);

    await userEvent.click(screen.getByText(t('settings:items.addressBook')));
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/address-book' });
  });

  it('navigates to wallet lock page when clicking change wallet lock', async () => {
    renderWithProviders(<SettingsPage />);

    await userEvent.click(screen.getByText(t('settings:items.changeWalletLock')));
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/settings/wallet-lock' });
  });

  it('navigates to language page when clicking language', async () => {
    renderWithProviders(<SettingsPage />);

    await userEvent.click(screen.getByText(t('settings:items.language')));
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/settings/language' });
  });
});
