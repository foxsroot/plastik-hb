import { ref, reactive } from 'vue'

export interface AlertItem {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timeout?: number
}

const alerts = ref<AlertItem[]>([])

export const useAlert = () => {
  const showAlert = (
    type: AlertItem['type'],
    title: string,
    message: string,
    timeout: number = 5000
  ) => {
    const id = Date.now().toString()
    const alert: AlertItem = {
      id,
      type,
      title,
      message,
      timeout
    }

    alerts.value.push(alert)

    // Auto remove after timeout
    if (timeout > 0) {
      setTimeout(() => {
        removeAlert(id)
      }, timeout)
    }

    return id
  }

  const removeAlert = (id: string) => {
    const index = alerts.value.findIndex(alert => alert.id === id)
    if (index > -1) {
      alerts.value.splice(index, 1)
    }
  }

  const clearAlerts = () => {
    alerts.value = []
  }

  // Convenience methods
  const success = (title: string, message: string, timeout?: number) => 
    showAlert('success', title, message, timeout)

  const error = (title: string, message: string, timeout?: number) => 
    showAlert('error', title, message, timeout)

  const warning = (title: string, message: string, timeout?: number) => 
    showAlert('warning', title, message, timeout)

  const info = (title: string, message: string, timeout?: number) => 
    showAlert('info', title, message, timeout)

  return {
    alerts,
    showAlert,
    removeAlert,
    clearAlerts,
    success,
    error,
    warning,
    info
  }
}