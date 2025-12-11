import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/security/password-input';
import { FormField } from '@/components/common/form-field';
import { ChevronRight, Check } from 'lucide-react';

/** Mnemonic language options */
export type MnemonicLanguage = 'english' | 'zh-Hans' | 'zh-Hant';

/** Mnemonic length options */
export type MnemonicLength = 12 | 15 | 18 | 21 | 24 | 36;

/** Mnemonic options for wallet creation */
export interface MnemonicOptions {
  language: MnemonicLanguage;
  length: MnemonicLength;
}

/** Form data for wallet creation */
export interface CreateWalletFormData {
  name: string;
  password: string;
  confirmPassword: string;
  tip: string;
  agreement: boolean;
  mnemonicOptions: MnemonicOptions;
}

/** Validation errors */
export interface CreateWalletFormErrors {
  name?: string | undefined;
  password?: string | undefined;
  confirmPassword?: string | undefined;
  tip?: string | undefined;
  agreement?: string | undefined;
}

interface CreateWalletFormProps {
  /** Form submit callback */
  onSubmit: (data: CreateWalletFormData) => void;
  /** Open mnemonic options callback */
  onOpenMnemonicOptions?: (() => void) | undefined;
  /** Current mnemonic options */
  mnemonicOptions?: MnemonicOptions | undefined;
  /** Whether form is submitting */
  isSubmitting?: boolean | undefined;
  /** Additional class name */
  className?: string | undefined;
}

const DEFAULT_MNEMONIC_OPTIONS: MnemonicOptions = {
  language: 'english',
  length: 12,
};

const LANGUAGE_LABELS: Record<MnemonicLanguage, string> = {
  english: 'English',
  'zh-Hans': '中文（简体）',
  'zh-Hant': '中文（繁體）',
};

/**
 * Validates the create wallet form data
 */
export function validateCreateWalletForm(data: Partial<CreateWalletFormData>): CreateWalletFormErrors {
  const errors: CreateWalletFormErrors = {};

  // Name validation: required, max 12 chars
  const trimmedName = data.name?.trim() ?? '';
  if (!trimmedName) {
    errors.name = '请输入钱包名称';
  } else if (trimmedName.length > 12) {
    errors.name = '钱包名称不能超过12个字符';
  }

  // Password validation: 8-30 chars, no whitespace
  const password = data.password ?? '';
  if (!password) {
    errors.password = '请输入密码';
  } else if (password.length < 8) {
    errors.password = '密码至少8个字符';
  } else if (password.length > 30) {
    errors.password = '密码不能超过30个字符';
  } else if (/\s/.test(password)) {
    errors.password = '密码不能包含空格';
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = '请确认密码';
  } else if (data.confirmPassword !== data.password) {
    errors.confirmPassword = '两次输入的密码不一致';
  }

  // Tip validation: max 50 chars (optional)
  if (data.tip && data.tip.length > 50) {
    errors.tip = '密码提示不能超过50个字符';
  }

  // Agreement validation
  if (!data.agreement) {
    errors.agreement = '请阅读并同意用户协议';
  }

  return errors;
}

/**
 * Create wallet form component
 */
export function CreateWalletForm({
  onSubmit,
  onOpenMnemonicOptions,
  mnemonicOptions = DEFAULT_MNEMONIC_OPTIONS,
  isSubmitting = false,
  className,
}: CreateWalletFormProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tip, setTip] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [errors, setErrors] = useState<CreateWalletFormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => new Set(prev).add(field));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const formData: CreateWalletFormData = {
        name: name.trim(),
        password,
        confirmPassword,
        tip,
        agreement,
        mnemonicOptions,
      };

      const validationErrors = validateCreateWalletForm(formData);
      setErrors(validationErrors);

      // Mark all fields as touched
      setTouched(new Set(['name', 'password', 'confirmPassword', 'tip', 'agreement']));

      if (Object.keys(validationErrors).length === 0) {
        onSubmit(formData);
      }
    },
    [name, password, confirmPassword, tip, agreement, mnemonicOptions, onSubmit],
  );

  const showError = (field: keyof CreateWalletFormErrors) => {
    return touched.has(field) ? errors[field] : undefined;
  };

  const isValid =
    name.trim().length > 0 &&
    name.trim().length <= 12 &&
    password.length >= 8 &&
    password.length <= 30 &&
    !/\s/.test(password) &&
    confirmPassword === password &&
    agreement;

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Wallet name */}
      <FormField label="钱包名称" required error={showError('name')}>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => handleBlur('name')}
          placeholder="请输入钱包名称"
          maxLength={12}
          disabled={isSubmitting}
          aria-invalid={!!showError('name')}
        />
        <div className="text-right text-xs text-muted-foreground">{name.length}/12</div>
      </FormField>

      {/* Password */}
      <FormField label="密码" required error={showError('password')}>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => handleBlur('password')}
          placeholder="8-30个字符，不能包含空格"
          showStrength
          disabled={isSubmitting}
          aria-invalid={!!showError('password')}
        />
      </FormField>

      {/* Confirm password */}
      <FormField label="确认密码" required error={showError('confirmPassword')}>
        <PasswordInput
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => handleBlur('confirmPassword')}
          placeholder="请再次输入密码"
          disabled={isSubmitting}
          aria-invalid={!!showError('confirmPassword')}
        />
      </FormField>

      {/* Password tip */}
      <FormField label="密码提示" hint="可选，用于帮助您记住密码" error={showError('tip')}>
        <Input
          type="text"
          value={tip}
          onChange={(e) => setTip(e.target.value)}
          onBlur={() => handleBlur('tip')}
          placeholder="可选"
          maxLength={50}
          disabled={isSubmitting}
        />
      </FormField>

      {/* Mnemonic options selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">助记词设置</label>
        <button
          type="button"
          onClick={onOpenMnemonicOptions}
          disabled={isSubmitting}
          className={cn(
            'flex w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-3',
            'transition-colors hover:bg-muted/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <span className="text-sm">
            {LANGUAGE_LABELS[mnemonicOptions.language]} · {mnemonicOptions.length} 词
          </span>
          <ChevronRight className="size-5 text-muted-foreground" />
        </button>
      </div>

      {/* User agreement */}
      <label className="flex cursor-pointer items-start gap-3">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            checked={agreement}
            onChange={(e) => setAgreement(e.target.checked)}
            disabled={isSubmitting}
            className="peer sr-only"
            aria-describedby={showError('agreement') ? 'agreement-error' : undefined}
          />
          <div
            className={cn(
              'flex size-5 items-center justify-center rounded border border-input',
              'transition-colors peer-checked:border-primary peer-checked:bg-primary',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
            )}
          >
            {agreement && <Check className="size-3.5 text-primary-foreground" />}
          </div>
        </div>
        <span className="text-sm leading-relaxed text-muted-foreground">
          我已阅读并同意
          <a href="/agreement" className="text-primary hover:underline">
            《用户协议》
          </a>
          和
          <a href="/privacy" className="text-primary hover:underline">
            《隐私政策》
          </a>
        </span>
      </label>
      {showError('agreement') && (
        <p id="agreement-error" className="-mt-4 text-xs text-destructive">
          {showError('agreement')}
        </p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className={cn(
          'w-full rounded-full py-3 font-medium text-white transition-colors',
          'bg-primary hover:bg-primary/90',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        {isSubmitting ? '创建中...' : '创建钱包'}
      </button>
    </form>
  );
}
