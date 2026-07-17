export type ToastColor = 'success' | 'error' | 'neutral'

export interface AppToastItem {
  id: string
  title: string
  description?: string
  color: ToastColor
}

export function useAppToast() {
  const toasts = useState<AppToastItem[]>('app-toasts', () => [])

  function add(opts: {
    title: string
    description?: string
    color?: ToastColor
    duration?: number
  }) {
    const id = crypto.randomUUID()
    const item: AppToastItem = {
      id,
      title: opts.title,
      description: opts.description,
      color: opts.color ?? 'neutral',
    }
    toasts.value = [...toasts.value, item]
    const duration = opts.duration ?? 3200
    if (import.meta.client) {
      window.setTimeout(() => dismiss(id), duration)
    }
  }

  function dismiss(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    toasts,
    add,
    dismiss,
    success: (title: string, description?: string) => add({ title, description, color: 'success' }),
    error: (title: string, description?: string) => add({ title, description, color: 'error' }),
    neutral: (title: string, description?: string) => add({ title, description, color: 'neutral' }),
  }
}
