import type { Formacion, SemColor } from "./types"

export function parseISO(iso: string | null): Date | null {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

export function fmtDMY(iso: string | null): string {
  const d = parseISO(iso)
  if (!d) return ""
  const dd = String(d.getUTCDate()).padStart(2, "0")
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0")
  return `${dd}/${mm}/${d.getUTCFullYear()}`
}

export function toInputValue(iso: string | null): string {
  const d = parseISO(iso)
  if (!d) return ""
  const dd = String(d.getUTCDate()).padStart(2, "0")
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0")
  return `${d.getUTCFullYear()}-${mm}-${dd}`
}

export function calcularDias(ultima: string | null): number | null {
  const fecha = parseISO(ultima)
  if (!fecha) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const base = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
  const diff = hoy.getTime() - base.getTime()
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24))
  return dias >= 0 ? dias : 0
}

export function semaforo(dias: number | null): { sem: SemColor; texto: string } {
  if (dias === null) return { sem: "sin", texto: "Sin datos" }
  if (dias <= 10) return { sem: "verde", texto: "OK" }
  if (dias <= 20) return { sem: "amarillo", texto: "Precaución" }
  return { sem: "rojo", texto: "Crítico" }
}

export function ordenarPorCriticidad(lista: Formacion[]): Formacion[] {
  return [...lista].sort((a, b) => {
    if (a.dias === null && b.dias === null) return a.formacion - b.formacion
    if (a.dias === null) return 1
    if (b.dias === null) return -1
    if (b.dias !== a.dias) return b.dias - a.dias
    return a.formacion - b.formacion
  })
}

export function fechaAhora(): string {
  return new Date().toLocaleString("es-AR", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}