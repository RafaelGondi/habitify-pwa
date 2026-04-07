import type { AppData } from '~/types'

export function useExport() {
  const { data, save } = useStorage()

  function exportJSON() {
    const exportData: AppData = {
      ...data.value,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `habitify-export-${toDateString(new Date())}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importJSON(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target!.result as string)
          if (!imported.version || !Array.isArray(imported.habits) || !Array.isArray(imported.completions)) {
            throw new Error('Arquivo inválido ou formato não reconhecido')
          }
          const existingHabitIds = new Set(data.value.habits.map(h => h.id))
          const existingCompletionIds = new Set(data.value.completions.map(c => c.id))
          const newHabits = imported.habits.filter((h: any) => !existingHabitIds.has(h.id))
          const newCompletions = imported.completions.filter((c: any) => !existingCompletionIds.has(c.id))
          save({
            habits: [...data.value.habits, ...newHabits],
            completions: [...data.value.completions, ...newCompletions],
          })
          resolve()
        }
        catch (err: any) {
          reject(err.message ?? 'Erro ao importar')
        }
      }
      reader.onerror = () => reject('Erro ao ler o arquivo')
      reader.readAsText(file)
    })
  }

  return { exportJSON, importJSON }
}
