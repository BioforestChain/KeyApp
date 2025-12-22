/**
 * Modal - Stackflow Modal 包装组件
 *
 * 用于创建导航式的 Modal Activity。
 * 仅在 Stackflow Activity 中使用。
 *
 * 区别：
 * - Stackflow Modal: 导航式弹窗 (Activity)，有 URL、可后退
 * - shadcn AlertDialog: 内联式弹窗，状态控制，无 URL
 *
 * 如需内联确认弹窗，请使用 @/components/ui/alert-dialog
 */
export { Modal, ModalProps } from './bottom-sheet';
