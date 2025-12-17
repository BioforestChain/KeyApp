import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsItem } from './settings-item';
import { SettingsSection } from './settings-section';
import { SettingsPage } from './index';
import { TestI18nProvider } from '@/test/i18n-mock';
import { IconWallet as Wallet } from '@tabler/icons-react';

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
    render(<SettingsItem label="语言" />);
    expect(screen.getByText('语言')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<SettingsItem label="钱包" icon={<Wallet data-testid="wallet-icon" size={20} />} />);
    expect(screen.getByTestId('wallet-icon')).toBeInTheDocument();
  });

  it('renders value when provided', () => {
    render(<SettingsItem label="语言" value="简体中文" />);
    expect(screen.getByText('简体中文')).toBeInTheDocument();
  });

  it('renders chevron when clickable', () => {
    render(<SettingsItem label="语言" onClick={() => {}} />);
    // ChevronRight is rendered as an SVG
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('handles click', async () => {
    const handleClick = vi.fn();
    render(<SettingsItem label="语言" onClick={handleClick} />);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables click when disabled', async () => {
    const handleClick = vi.fn();
    render(<SettingsItem label="语言" onClick={handleClick} disabled />);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe('SettingsSection', () => {
  it('renders title', () => {
    render(
      <SettingsSection title="安全">
        <div>Content</div>
      </SettingsSection>,
    );
    expect(screen.getByText('安全')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <SettingsSection title="安全">
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
    expect(screen.getByText('设置')).toBeInTheDocument();
  });

  it('displays wallet info card', () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText('My Wallet')).toBeInTheDocument();
    expect(screen.getByText('2 个链地址')).toBeInTheDocument();
  });

  it('displays wallet avatar with first letter', () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText('M')).toBeInTheDocument(); // First letter of "My Wallet"
  });

  it('renders all settings sections', () => {
    renderWithProviders(<SettingsPage />);

    // Section titles are rendered as h3 elements
    const sectionTitles = screen.getAllByRole('heading', { level: 3 });
    const titles = sectionTitles.map((el) => el.textContent);

    expect(titles).toContain('钱包管理');
    expect(titles).toContain('安全');
    expect(titles).toContain('偏好设置');
    expect(titles).toContain('关于');
  });

  it('renders security settings items', () => {
    renderWithProviders(<SettingsPage />);

    expect(screen.getByText('应用锁')).toBeInTheDocument();
    expect(screen.getByText('查看助记词')).toBeInTheDocument();
    expect(screen.getByText('修改密码')).toBeInTheDocument();
  });

  it('renders preference settings items', () => {
    renderWithProviders(<SettingsPage />);

    expect(screen.getByText('语言')).toBeInTheDocument();
    expect(screen.getByText('货币单位')).toBeInTheDocument();
    expect(screen.getByText('外观')).toBeInTheDocument();
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

    await userEvent.click(screen.getByText('查看助记词'));
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/settings/mnemonic' });
  });

  it('navigates to address book page when clicking address book', async () => {
    renderWithProviders(<SettingsPage />);

    await userEvent.click(screen.getByText('地址簿'));
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/address-book' });
  });

  it('navigates to password page when clicking change password', async () => {
    renderWithProviders(<SettingsPage />);

    await userEvent.click(screen.getByText('修改密码'));
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/settings/password' });
  });

  it('navigates to language page when clicking language', async () => {
    renderWithProviders(<SettingsPage />);

    await userEvent.click(screen.getByText('语言'));
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/settings/language' });
  });
});
