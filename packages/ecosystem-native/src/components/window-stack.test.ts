/**
 * Tests for WindowStack component and manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
// Import to register the custom element
import './window-stack';
import type { WindowStack } from './window-stack';
import { windowStackManager } from './window-stack-manager';

describe('WindowStack', () => {
  let container: HTMLDivElement;
  let stack: WindowStack;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    stack = document.createElement('ecosystem-window-stack') as WindowStack;
    stack.desktop = 'mine';
    container.appendChild(stack);

    // Wait for Lit to render
    await stack.updateComplete;
  });

  afterEach(() => {
    container.remove();
    // Stack auto-unregisters in disconnectedCallback
  });

  it('should auto-register with windowStackManager on connect', () => {
    // Stack should be auto-registered when connected to DOM
    expect(windowStackManager.isStackRegistered('mine')).toBe(true);
    expect(windowStackManager.getStack('mine')).toBe(stack);
  });

  it('should auto-unregister when disconnected', () => {
    expect(windowStackManager.isStackRegistered('mine')).toBe(true);

    // Remove from DOM
    stack.remove();

    expect(windowStackManager.isStackRegistered('mine')).toBe(false);
  });

  it('should create a slot synchronously', () => {
    const slot = stack.getOrCreateSlot('test-app-1');

    expect(slot).toBeInstanceOf(HTMLDivElement);
    expect(slot.dataset.appId).toBe('test-app-1');
    expect(slot.dataset.desktop).toBe('mine');
    expect(stack.hasSlot('test-app-1')).toBe(true);
  });

  it('should return existing slot if already created', () => {
    const slot1 = stack.getOrCreateSlot('test-app-1');
    const slot2 = stack.getOrCreateSlot('test-app-1');

    expect(slot1).toBe(slot2);
  });

  it('should remove slot correctly', () => {
    stack.getOrCreateSlot('test-app-1');
    expect(stack.hasSlot('test-app-1')).toBe(true);

    stack.removeSlot('test-app-1');
    expect(stack.hasSlot('test-app-1')).toBe(false);
    expect(stack.getSlot('test-app-1')).toBeNull();
  });

  it('should set slot hidden state', () => {
    const slot = stack.getOrCreateSlot('test-app-1');

    stack.setSlotHidden('test-app-1', true);
    expect(slot.dataset.hidden).toBe('true');
    expect(slot.style.display).toBe('none');

    stack.setSlotHidden('test-app-1', false);
    expect(slot.dataset.hidden).toBe('false');
    expect(slot.style.display).toBe('');
  });

  it('should get all slot ids', () => {
    stack.getOrCreateSlot('app-1');
    stack.getOrCreateSlot('app-2');
    stack.getOrCreateSlot('app-3');

    const ids = stack.getSlotIds();
    expect(ids).toEqual(['app-1', 'app-2', 'app-3']);
  });

  it('should clear all slots', () => {
    stack.getOrCreateSlot('app-1');
    stack.getOrCreateSlot('app-2');

    stack.clearAllSlots();

    expect(stack.hasSlot('app-1')).toBe(false);
    expect(stack.hasSlot('app-2')).toBe(false);
    expect(stack.getSlotIds()).toEqual([]);
  });
});

describe('windowStackManager', () => {
  let container: HTMLDivElement;
  let stack: WindowStack;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    stack = document.createElement('ecosystem-window-stack') as WindowStack;
    stack.desktop = 'mine';
    container.appendChild(stack);
    await stack.updateComplete;
    // Stack is auto-registered in connectedCallback
  });

  afterEach(() => {
    container.remove();
    // Stack auto-unregisters in disconnectedCallback
  });

  it('should have stack auto-registered', () => {
    expect(windowStackManager.isStackRegistered('mine')).toBe(true);
    expect(windowStackManager.getStack('mine')).toBe(stack);
  });

  it('should create slots via manager', () => {
    const slot = windowStackManager.getOrCreateSlot('mine', 'test-app-1');
    expect(slot).toBeInstanceOf(HTMLDivElement);
    expect(slot.dataset.appId).toBe('test-app-1');
  });

  it('should throw when stack not registered', () => {
    expect(() => {
      windowStackManager.getOrCreateSlot('stack', 'test-app-1');
    }).toThrow('WindowStack for desktop "stack" is not registered');
  });

  it('should emit slot created events', () => {
    let createdSlot: { appId: string; desktop: string } | null = null;
    const unsub = windowStackManager.onSlotCreated((slot) => {
      createdSlot = { appId: slot.appId, desktop: slot.desktop };
    });

    windowStackManager.getOrCreateSlot('mine', 'test-app-1');

    expect(createdSlot).toEqual({ appId: 'test-app-1', desktop: 'mine' });

    unsub();
  });

  it('should emit slot removed events', () => {
    windowStackManager.getOrCreateSlot('mine', 'test-app-1');

    let removedInfo: { appId: string; desktop: string } | null = null;
    const unsub = windowStackManager.onSlotRemoved((appId, desktop) => {
      removedInfo = { appId, desktop };
    });

    windowStackManager.removeSlot('mine', 'test-app-1');

    expect(removedInfo).toEqual({ appId: 'test-app-1', desktop: 'mine' });

    unsub();
  });

  it('should check if slot exists via manager', () => {
    expect(windowStackManager.hasSlot('mine', 'test-app-1')).toBe(false);

    windowStackManager.getOrCreateSlot('mine', 'test-app-1');

    expect(windowStackManager.hasSlot('mine', 'test-app-1')).toBe(true);
  });

  it('should set slot hidden via manager', () => {
    const slot = windowStackManager.getOrCreateSlot('mine', 'test-app-1');

    windowStackManager.setSlotHidden('mine', 'test-app-1', true);
    expect(slot.dataset.hidden).toBe('true');
    expect(slot.style.display).toBe('none');

    windowStackManager.setSlotHidden('mine', 'test-app-1', false);
    expect(slot.dataset.hidden).toBe('false');
    expect(slot.style.display).toBe('');
  });
});
