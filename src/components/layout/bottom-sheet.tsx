/**
 * BottomSheet & Modal - Stackflow 弹出层包装组件
 *
 * 统一从这里导入，便于全局风格定制。
 * 仅在 Stackflow Activity 中使用。
 */
import { BottomSheet as StackflowBottomSheet, Modal as StackflowModal } from '@stackflow/plugin-basic-ui';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BottomSheetProps = ComponentProps<typeof StackflowBottomSheet>;
export type ModalProps = ComponentProps<typeof StackflowModal>;

/**
 * Re-export Stackflow BottomSheet
 */
export const BottomSheet = StackflowBottomSheet;

/**
 * Re-export Stackflow Modal
 */
export const Modal = StackflowModal;

export interface SheetContentProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Standard sheet content wrapper with handle, title, and safe area
 */
export function SheetContent({ title, children, className }: SheetContentProps) {
  return (
    <div className={cn('bg-background rounded-t-2xl', className)}>
      {/* Handle */}
      <div className="flex justify-center py-3">
        <div className="h-1 w-10 rounded-full bg-muted" />
      </div>

      {/* Title */}
      {title && (
        <div className="border-b border-border px-4 pb-4">
          <h2 className="text-center text-lg font-semibold">{title}</h2>
        </div>
      )}

      {/* Content */}
      {children}

      {/* Safe area */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
