/**
 * Notification Utilities
 * 
 * Helper functions for showing notifications and alerts
 */

import { toast } from 'sonner'

export const notify = {
  /**
   * Show success message
   */
  success: (message: string, description?: string) => {
    toast.success(message, description ? { description } : undefined)
  },

  /**
   * Show error message
   */
  error: (message: string, description?: string) => {
    toast.error(message, description ? { description } : undefined)
  },

  /**
   * Show info message
   */
  info: (message: string, description?: string) => {
    toast.info(message, description ? { description } : undefined)
  },

  /**
   * Show warning message
   */
  warning: (message: string, description?: string) => {
    toast.warning(message, description ? { description } : undefined)
  },

  /**
   * Show loading message
   */
  loading: (message: string) => {
    return toast.loading(message)
  },

  /**
   * Dismiss a specific toast
   */
  dismiss: (toastId: string | number) => {
    toast.dismiss(toastId)
  },

  /**
   * Show promise-based notification
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    toast.promise(promise, messages)
  },
}

/**
 * Confirmation dialog
 */
export async function confirm(message: string, title?: string): Promise<boolean> {
  return new Promise((resolve) => {
    const confirmed = window.confirm(title ? `${title}\n\n${message}` : message)
    resolve(confirmed)
  })
}

/**
 * Show browser notification (requires permission)
 */
export async function showBrowserNotification(
  title: string,
  options?: NotificationOptions
) {
  if ('Notification' in window) {
    let permission = Notification.permission

    if (permission === 'default') {
      permission = await Notification.requestPermission()
    }

    if (permission === 'granted') {
      new Notification(title, options)
    }
  }
}
