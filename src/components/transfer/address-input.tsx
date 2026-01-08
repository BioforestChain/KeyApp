import { useState, forwardRef, useId, useMemo, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useStore } from '@tanstack/react-store';
import { IconLineScan as ScanLine, IconClipboardCopy as ClipboardPaste, IconUsers, IconX, IconPencil } from '@tabler/icons-react';
import { ContactAvatar } from '@/components/common/contact-avatar';
import { clipboardService } from '@/services/clipboard';
import { isValidAddressForChain } from '@/lib/address-format';
import { generateAvatarFromAddress } from '@/lib/avatar-codec';
import { addressBookStore, addressBookSelectors, type ChainType, type ContactSuggestion, type ContactAddress } from '@/stores';
import { AddressDisplay } from '@/components/wallet/address-display';

/** 获取地址显示标签（只显示自定义 label，没有则为空） */
function getAddressDisplayLabel(address: ContactAddress): string {
  return address.label || '';
}

interface AddressInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  onScan?: (() => void) | undefined;
  onPaste?: (() => void) | undefined;
  /** Callback to open contact picker */
  onContactPicker?: (() => void) | undefined;
  error?: string | undefined;
  label?: string | undefined;
  /** Chain type to filter contact addresses */
  chainType?: ChainType | undefined;
  /** Enable contact suggestions dropdown */
  showSuggestions?: boolean | undefined;
  /** Maximum suggestions to show (default: 5) */
  maxSuggestions?: number | undefined;
}

function isValidAddress(address: string): boolean {
  if (!address) return true;
  // Basic validation for common address formats
  if (address.startsWith('0x') && address.length === 42) return true; // ETH
  if (address.startsWith('T') && address.length === 34) return true; // TRON
  if ((address.startsWith('1') || address.startsWith('3') || address.startsWith('bc1')) && address.length >= 26)
    return true; // BTC
  if (address.length >= 20) return true; // Generic - allow for now
  return false;
}

const AddressInput = forwardRef<HTMLInputElement, AddressInputProps>(
  ({ value = '', onChange, onScan, onPaste, onContactPicker, error, label, className, chainType, showSuggestions = true, maxSuggestions = 5, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation('common');
    const errorId = useId();
    const listboxId = useId();

    // 直接从 addressBookStore 读取数据（单一数据源）
    const addressBookState = useStore(addressBookStore);
    const hasContacts = addressBookState.contacts.length > 0;

    const currentValue = value || internalValue;
    const isValid = isValidAddress(currentValue);
    const hasError = !!(error || (!isValid && currentValue));

    const isDisplayMode = !focused && currentValue && !hasError;

    // Merge refs
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(inputRef.current);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = inputRef.current;
      }
    }, [ref]);

    // 检测当前输入是否精确匹配某个联系人的地址
    const matchedContact = useMemo(() => {
      if (!currentValue) return null;
      return addressBookSelectors.getContactByAddress(addressBookState, currentValue);
    }, [addressBookState, currentValue]);

    // 获取联系人建议 - 显示所有联系人，用地址合法性验证标记可选地址
    const suggestions = useMemo(() => {
      if (!showSuggestions) return [];
      const allSuggestions = addressBookSelectors.suggestContacts(addressBookState, currentValue || '', maxSuggestions);
      // 标记每个建议的地址是否对当前链有效
      return allSuggestions.map((s) => ({
        ...s,
        isValidForCurrentChain: chainType ? isValidAddressForChain(s.matchedAddress.address, chainType) : true,
      }));
    }, [addressBookState, currentValue, chainType, showSuggestions, maxSuggestions]);

    // Show dropdown when focused and has contacts (even without input)
    useEffect(() => {
      if (focused && showSuggestions && (suggestions.length > 0 || hasContacts)) {
        setShowDropdown(true);
        setSelectedIndex(-1);
      } else {
        setShowDropdown(false);
      }
    }, [focused, suggestions.length, hasContacts, showSuggestions]);

    // Handle click outside to close dropdown
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setShowDropdown(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.trim();
      setInternalValue(newValue);
      onChange?.(newValue);
    };

    const handlePaste = async () => {
      try {
        const text = await clipboardService.read();
        const trimmed = text.trim();
        setInternalValue(trimmed);
        onChange?.(trimmed);
        onPaste?.();
        inputRef.current?.focus();
      } catch {
        console.error('Failed to read clipboard');
      }
    };

    const handleSelectSuggestion = useCallback((suggestion: ContactSuggestion) => {
      setInternalValue(suggestion.matchedAddress.address);
      onChange?.(suggestion.matchedAddress.address);
      setShowDropdown(false);
      setFocused(false);
    }, [onChange]);

    const handleClearContact = useCallback(() => {
      setInternalValue('');
      onChange?.('');
      inputRef.current?.focus();
    }, [onChange]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          if (selectedIndex >= 0 && suggestions[selectedIndex] && suggestions[selectedIndex].isValidForCurrentChain) {
            e.preventDefault();
            handleSelectSuggestion(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          setShowDropdown(false);
          break;
      }
    };

    return (
      <div ref={containerRef} className={cn('@container space-y-2', className)}>
        {label && <label className="block text-sm font-medium">{label}</label>}
        <div className="relative">
          <div
            className={cn(
              'bg-background relative flex items-center gap-2 rounded-xl border p-2 transition-colors @xs:gap-3 @xs:p-3',
              focused ? 'border-primary ring-primary/20 ring-2' : 'border-input',
              hasError && 'border-destructive ring-destructive/20 ring-2',
            )}
            onClick={() => {
               if (isDisplayMode) {
                 setFocused(true);
                 setTimeout(() => inputRef.current?.focus(), 0);
               }
            }}
          >
            {/* 匹配到联系人时显示头像和信息 */}
            {matchedContact ? (
              <>
                <ContactAvatar
                  src={matchedContact.contact.avatar || generateAvatarFromAddress(matchedContact.matchedAddress.address)}
                  size={40}
                  className="shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{matchedContact.contact.name}</p>
                  <p className="text-muted-foreground truncate font-mono text-xs">
                    {matchedContact.matchedAddress.address}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearContact();
                  }}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/50 shrink-0 rounded-lg p-1.5 transition-colors"
                  aria-label={t('a11y.clear')}
                >
                  <IconX className="size-5" />
                </button>
              </>
            ) : isDisplayMode ? (
              <div 
                className="group flex h-10 w-full cursor-text items-center justify-between gap-2 overflow-hidden hover:opacity-80 transition-opacity"
                tabIndex={0}
                role="button"
                onFocus={() => {
                   setFocused(true);
                   setTimeout(() => inputRef.current?.focus(), 0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setFocused(true);
                    setTimeout(() => inputRef.current?.focus(), 0);
                  }
                }}
              >
                <div className="min-w-0 flex-1">
                  <AddressDisplay 
                    address={currentValue} 
                    copyable={false} 
                    className="w-full text-sm"
                  />
                </div>
                <IconPencil className="text-muted-foreground/50 group-hover:text-muted-foreground size-4 shrink-0 transition-colors" />
              </div>
            ) : (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  data-testid="address-input"
                  value={currentValue}
                  onChange={handleChange}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 200)}
                  onKeyDown={handleKeyDown}
                  className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent font-mono text-sm outline-none"
                  placeholder={t('addressPlaceholder')}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? errorId : undefined}
                  aria-expanded={showDropdown}
                  aria-controls={showDropdown ? listboxId : undefined}
                  aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
                  role="combobox"
                  {...props}
                />

                <div className="flex items-center">
                  {onScan && (
                    <button
                      type="button"
                      data-testid="scan-address-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onScan();
                      }}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg p-1.5 transition-colors @xs:p-2"
                      aria-label={t('a11y.scanQrCode')}
                    >
                      <ScanLine className="size-5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                       e.stopPropagation();
                       handlePaste();
                    }}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 @xs:text-primary @xs:hover:text-primary/80 rounded-lg p-1.5 transition-colors @xs:px-3 @xs:py-1.5 @xs:text-sm @xs:font-medium @xs:hover:bg-transparent"
                    aria-label={t('a11y.paste')}
                  >
                    <ClipboardPaste className="size-5 @xs:hidden" />
                    <span className="hidden @xs:inline">{t('paste')}</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Contact suggestions dropdown */
}
          {showDropdown && (
            <div
              id={listboxId}
              className="bg-popover border-border absolute z-50 mt-1 w-full overflow-hidden rounded-xl border shadow-lg"
            >
              {suggestions.length > 0 ? (
                <ul role="listbox">
                  {suggestions.map((suggestion, index) => {
                    const isDisabled = !suggestion.isValidForCurrentChain;
                    return (
                      <li
                        key={`${suggestion.contact.id}-${suggestion.matchedAddress.id}`}
                        id={`suggestion-${index}`}
                        role="option"
                        aria-selected={index === selectedIndex}
                        aria-disabled={isDisabled}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 transition-colors',
                          isDisabled
                            ? 'opacity-50 cursor-not-allowed'
                            : index === selectedIndex
                              ? 'bg-accent cursor-pointer'
                              : 'hover:bg-muted/50 cursor-pointer',
                        )}
                        onClick={() => !isDisabled && handleSelectSuggestion(suggestion)}
                      >
                        <ContactAvatar
                          src={suggestion.contact.avatar}
                          size={32}
                          className="shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{suggestion.contact.name}</p>
                          <p className={cn(
                            "truncate font-mono text-xs",
                            isDisabled ? "text-muted-foreground/50" : "text-muted-foreground"
                          )}>{suggestion.matchedAddress.address}</p>
                        </div>
                        {getAddressDisplayLabel(suggestion.matchedAddress) && (
                          <span className={cn(
                            "max-w-[4rem] shrink-0 truncate text-xs",
                            isDisabled ? "text-muted-foreground/50" : "text-muted-foreground"
                          )}>{getAddressDisplayLabel(suggestion.matchedAddress)}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-muted-foreground px-3 py-4 text-center text-sm">
                  {t('contact.noContacts')}
                </div>
              )}
              {/* View all contacts button */}
              {onContactPicker && (
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    onContactPicker();
                  }}
                  className="text-primary hover:bg-muted/50 border-border flex w-full items-center justify-center gap-2 border-t px-3 py-2.5 text-sm font-medium transition-colors"
                >
                  <IconUsers className="size-4" />
                  {t('contact.viewAll')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Error message with aria-live for screen readers */}
        {hasError && (
          <p
            id={errorId}
            className="text-destructive -mt-0.5 text-xs"
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            {error || t('a11y.invalidAddress')}
          </p>
        )}
      </div>
    );
  },
);
AddressInput.displayName = 'AddressInput';

export { AddressInput, isValidAddress };
