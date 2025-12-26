import { useState } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { IconCheck as Check } from "@tabler/icons-react";
import { useFlow } from "../../stackflow";
import { ActivityParamsProvider, useActivityParams } from "../../hooks";

type MnemonicLanguage = "english" | "zh-Hans" | "zh-Hant";
type MnemonicLength = 12 | 15 | 18 | 21 | 24 | 36;

interface MnemonicOptions {
  language: MnemonicLanguage;
  length: MnemonicLength;
}

// Global callback for mnemonic options
let pendingCallback: ((options: MnemonicOptions) => void) | null = null;

export function setMnemonicOptionsCallback(callback: (options: MnemonicOptions) => void) {
  pendingCallback = callback;
}

function clearMnemonicOptionsCallback() {
  pendingCallback = null;
}

type MnemonicOptionsJobParams = {
  language?: string;
  length?: string;
};

const LANGUAGE_OPTIONS: { value: MnemonicLanguage; label: string }[] = [
  { value: "english", label: "English" },
  { value: "zh-Hans", label: "中文（简体）" },
  { value: "zh-Hant", label: "中文（繁體）" },
];

const LENGTH_OPTIONS: MnemonicLength[] = [12, 15, 18, 21, 24, 36];

function MnemonicOptionsJobContent() {
  const { t } = useTranslation("onboarding");
  const { pop } = useFlow();
  const { language: initialLanguage, length: initialLength } = useActivityParams<MnemonicOptionsJobParams>();

  const [options, setOptions] = useState<MnemonicOptions>({
    language: (initialLanguage as MnemonicLanguage) || "english",
    length: (Number(initialLength) as MnemonicLength) || 12,
  });

  const handleLanguageSelect = (language: MnemonicLanguage) => {
    setOptions((prev) => ({ ...prev, language }));
  };

  const handleLengthSelect = (length: MnemonicLength) => {
    setOptions((prev) => ({ ...prev, length }));
  };

  const handleConfirm = () => {
    if (pendingCallback) {
      pendingCallback(options);
    }
    clearMnemonicOptionsCallback();
    pop();
  };

  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>

        {/* Title */}
        <div className="border-b border-border px-4 pb-4">
          <h2 className="text-center text-lg font-semibold">{t("create.mnemonicOptions.title")}</h2>
        </div>

        {/* Content */}
        <div className="space-y-6 p-4">
          {/* Language selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">{t("create.mnemonicOptions.language")}</h3>
            <div className="space-y-1" role="radiogroup">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={options.language === option.value}
                  onClick={() => handleLanguageSelect(option.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-4 py-3",
                    "transition-colors hover:bg-muted/50",
                    options.language === option.value && "bg-muted"
                  )}
                >
                  <span className="text-sm">{option.label}</span>
                  {options.language === option.value && <Check className="size-5 text-primary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Length selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">{t("create.mnemonicOptions.wordCount")}</h3>
            <div className="grid grid-cols-3 gap-2" role="radiogroup">
              {LENGTH_OPTIONS.map((length) => (
                <button
                  key={length}
                  type="button"
                  role="radio"
                  aria-checked={options.length === length}
                  onClick={() => handleLengthSelect(length)}
                  className={cn(
                    "flex items-center justify-center rounded-lg py-3 text-sm font-medium",
                    "transition-colors",
                    options.length === length ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {length} {t("create.mnemonicOptions.words")}
                </button>
              ))}
            </div>
          </div>

          {/* Confirm button */}
          <button
            type="button"
            onClick={handleConfirm}
            className={cn(
              "w-full rounded-full py-3 font-medium text-primary-foreground transition-colors",
              "bg-primary hover:bg-primary/90"
            )}
          >
            {t("create.mnemonicOptions.confirm")}
          </button>
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  );
}

export const MnemonicOptionsJob: ActivityComponentType<MnemonicOptionsJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <MnemonicOptionsJobContent />
    </ActivityParamsProvider>
  );
};
