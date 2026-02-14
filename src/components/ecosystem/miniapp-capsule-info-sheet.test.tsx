import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestI18nProvider } from '@/test/i18n-mock';
import { MiniappCapsuleInfoSheet } from './miniapp-capsule-info-sheet';

describe('MiniappCapsuleInfoSheet', () => {
  it('shows info state when only query params differ', () => {
    render(
      <TestI18nProvider>
        <MiniappCapsuleInfoSheet
          open={true}
          onOpenChange={vi.fn()}
          appName="RWA Hub"
          appId="com.bioforest.rwa-hub"
          version="1.3.0"
          author="BioForest"
          sourceName="Official"
          runtime="iframe"
          entryUrl="https://rwahub.example.com/"
          currentUrl="https://rwahub.example.com/?__rv=v%3A1.3.0"
          sourceUrl="https://iweb.xin/rwahub.bfmeta.com.miniapp/source.json"
          strictUrl={false}
        />
      </TestI18nProvider>,
    );

    expect(screen.getByText('RWA Hub')).toBeInTheDocument();
    expect(screen.getByText('com.bioforest.rwa-hub')).toBeInTheDocument();
    expect(screen.getByText('1.3.0')).toBeInTheDocument();
    expect(screen.getByText('BioForest')).toBeInTheDocument();
    expect(screen.getByText('Official')).toBeInTheDocument();
    expect(screen.getByTestId('miniapp-capsule-current-url')).toBeInTheDocument();
    expect(screen.getByTestId('miniapp-capsule-url-adjusted-info')).toBeInTheDocument();
    expect(screen.getByTestId('miniapp-capsule-entry-url')).toBeInTheDocument();
    expect(screen.getByTestId('miniapp-capsule-source-url')).toBeInTheDocument();
  });

  it('hides entry url warning when entry url equals runtime url', () => {
    render(
      <TestI18nProvider>
        <MiniappCapsuleInfoSheet
          open={true}
          onOpenChange={vi.fn()}
          appName="RWA Hub"
          appId="com.bioforest.rwa-hub"
          version="1.3.0"
          author="BioForest"
          sourceName="Official"
          runtime="iframe"
          entryUrl="https://rwahub.example.com/"
          currentUrl="https://rwahub.example.com/"
          sourceUrl="https://iweb.xin/rwahub.bfmeta.com.miniapp/source.json"
          strictUrl={false}
        />
      </TestI18nProvider>,
    );

    expect(screen.getByTestId('miniapp-capsule-current-url')).toBeInTheDocument();
    expect(screen.queryByTestId('miniapp-capsule-url-adjusted-info')).not.toBeInTheDocument();
    expect(screen.queryByTestId('miniapp-capsule-url-mismatch-warning')).not.toBeInTheDocument();
    expect(screen.queryByTestId('miniapp-capsule-entry-url')).not.toBeInTheDocument();
  });

  it('shows warning state when origin/path differs', () => {
    render(
      <TestI18nProvider>
        <MiniappCapsuleInfoSheet
          open={true}
          onOpenChange={vi.fn()}
          appName="RWA Hub"
          appId="com.bioforest.rwa-hub"
          version="1.3.0"
          author="BioForest"
          sourceName="Official"
          runtime="iframe"
          entryUrl="https://rwahub.example.com/"
          currentUrl="https://rwahub-alt.example.com/"
          sourceUrl="https://iweb.xin/rwahub.bfmeta.com.miniapp/source.json"
          strictUrl={false}
        />
      </TestI18nProvider>,
    );

    expect(screen.getByTestId('miniapp-capsule-current-url')).toBeInTheDocument();
    expect(screen.queryByTestId('miniapp-capsule-url-adjusted-info')).not.toBeInTheDocument();
    expect(screen.getByTestId('miniapp-capsule-url-mismatch-warning')).toBeInTheDocument();
    expect(screen.getByTestId('miniapp-capsule-entry-url')).toBeInTheDocument();
  });
});
