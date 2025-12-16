import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  IconArrowRight as ArrowRight,
  IconSend as Send,
  IconLink as Link2,
  IconShield as Shield,
  IconDownload as Download,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMigrationOptional } from '@/contexts/MigrationContext';

const WELCOME_SHOWN_KEY = 'keyapp_welcome_shown';

export function hasSeenWelcome(): boolean {
  return localStorage.getItem(WELCOME_SHOWN_KEY) === '1';
}

export function markWelcomeSeen(): void {
  localStorage.setItem(WELCOME_SHOWN_KEY, '1');
}

export function resetWelcome(): void {
  localStorage.removeItem(WELCOME_SHOWN_KEY);
}

interface WelcomeSlide {
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
}

export function WelcomeScreen() {
  const { t } = useTranslation('guide');
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const migration = useMigrationOptional();

  const slides: WelcomeSlide[] = [
    {
      icon: <Send className="text-primary size-16" />,
      titleKey: 'welcome.slides.transfer.title',
      descriptionKey: 'welcome.slides.transfer.description',
    },
    {
      icon: <Link2 className="text-primary size-16" />,
      titleKey: 'welcome.slides.multichain.title',
      descriptionKey: 'welcome.slides.multichain.description',
    },
    {
      icon: <Shield className="text-primary size-16" />,
      titleKey: 'welcome.slides.security.title',
      descriptionKey: 'welcome.slides.security.description',
    },
  ];

  const currentSlideData = slides[currentSlide];
  if (!currentSlideData) return null;

  const handleGetStarted = useCallback(() => {
    markWelcomeSeen();
    navigate({ to: '/wallet/create' });
  }, [navigate]);

  const handleHaveWallet = useCallback(() => {
    markWelcomeSeen();
    navigate({ to: '/wallet/import' });
  }, [navigate]);

  const handleMigrate = useCallback(() => {
    markWelcomeSeen();
    navigate({ to: '/onboarding/migrate' });
  }, [navigate]);

  const handleSkip = useCallback(() => {
    markWelcomeSeen();
    navigate({ to: '/' });
  }, [navigate]);

  const handleNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide, slides.length]);

  const isLastSlide = currentSlide === slides.length - 1;
  const shouldShowMigration = migration?.shouldPromptMigration;

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Skip button */}
      <div className="flex justify-end p-4">
        <Button variant="ghost" size="sm" onClick={handleSkip}>
          {t('welcome.skip')}
        </Button>
      </div>

      {/* Slide content */}
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <div className="bg-primary/10 mb-8 flex size-32 items-center justify-center rounded-full">
          {currentSlideData.icon}
        </div>
        <h1 className="mb-4 text-center text-2xl font-bold">{t(currentSlideData.titleKey)}</h1>
        <p className="text-muted-foreground mb-8 max-w-sm text-center">{t(currentSlideData.descriptionKey)}</p>

        {/* Dots indicator */}
        <div className="mb-8 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                'size-2 rounded-full transition-colors',
                index === currentSlide ? 'bg-primary' : 'bg-muted-foreground/30',
              )}
              aria-label={t('welcome.goToSlide', { number: index + 1 })}
            />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-6">
        {isLastSlide ? (
          <div className="flex flex-col gap-3">
            {/* Migration button - shown when mpay data detected */}
            {shouldShowMigration && (
              <Button onClick={handleMigrate} className="w-full" size="lg" variant="default">
                <Download className="mr-2 size-4" />
                {t('welcome.migrateFromMpay', { defaultValue: '从 mpay 迁移钱包' })}
              </Button>
            )}
            <Button
              onClick={handleGetStarted}
              className="w-full"
              size="lg"
              variant={shouldShowMigration ? 'outline' : 'default'}
            >
              {t('welcome.getStarted')}
            </Button>
            <Button onClick={handleHaveWallet} variant="outline" className="w-full" size="lg">
              {t('welcome.haveWallet')}
            </Button>
          </div>
        ) : (
          <Button onClick={handleNext} className="w-full" size="lg">
            {t('welcome.next')}
            <ArrowRight className="ml-2 size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default WelcomeScreen;
