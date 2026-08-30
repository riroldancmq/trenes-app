import { CalendarDays, CloudOff, Pencil } from "lucide-react"
import { fmtDMY, toInputValue } from "../lib/dates"
import { ESTADOS, ESTADO_LABEL, type Estado, type Formacion } from "../lib/types"

const SEM_STYLE: Record<string, { badge: string; dot: string; texto: string }> = {
  verde: { badge: "bg-green-100 text-green-700 border-green-400", dot: "bg-green-500", texto: "OK" },
  amarillo: { badge: "bg-amber-100 text-amber-700 border-amber-400", dot: "bg-amber-400", texto: "Precaución" },
  rojo: { badge: "bg-red-100 text-red-700 border-red-400 animate-pulse-rojo", dot: "bg-red-500", texto: "Crítico" },
  sin: { badge: "bg-slate-100 text-slate-600 border-slate-300", dot: "bg-slate-400", texto: "Sin datos" },
}

const ESTADO_STYLE: Record<Estado, string> = {
  limpieza: "bg-cyan-100 text-cyan-700 border-cyan-300",
  reparacion: "bg-rose-100 text-rose-700 border-rose-300",
  "fuera-servicio": "bg-slate-200 text-slate-600 border-slate-400",
  activa: "bg-green-100 text-green-700 border-green-300",
}

interface Props {
  formacion: Formacion
  editor: boolean
  onCambio: (id: number, campos: { anteultima?: string | null; ultima?: string | null; estado?: Estado }) => void
}

export function FormationCard({ formacion: f, editor, onCambio }: Props) {
  const sem = SEM_STYLE[f.sem]

  return (
    <article className="bg-slate-100/90 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-200/40 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold text-sm">
            {f.formacion}
          </span>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Formación</p>
            <p className="font-semibold text-slate-700 leading-none">N° {f.formacion}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!editor && <Pencil className="w-3.5 h-3.5 text-slate-300" />}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${sem.badge}`}>
            <span className={`w-2 h-2 rounded-full ${sem.dot}`} />
            {sem.texto}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 w-24 shrink-0">Anteúltima</span>
          {editor ? (
            <input
              type="date"
              value={toInputValue(f.anteultima)}
              onChange={(e) => onCambio(f.id, { anteultima: e.target.value || null })}
              className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            />
          ) : (
            <span className={`flex-1 text-sm font-medium ${f.anteultima ? "text-slate-700" : "text-slate-400"}`}>
              {fmtDMY(f.anteultima) || "—"}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 w-24 shrink-0">Última</span>
          {editor ? (
            <input
              type="date"
              value={toInputValue(f.ultima)}
              onChange={(e) => onCambio(f.id, { ultima: e.target.value || null })}
              className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            />
          ) : (
            <span className={`flex-1 text-sm font-medium ${f.ultima ? "text-slate-700" : "text-slate-400"}`}>
              {fmtDMY(f.ultima) || "—"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <CalendarDays className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">
            Demora: <strong className={f.dias === null ? "" : f.dias <= 10 ? "text-green-600" : f.dias <= 20 ? "text-amber-600" : "text-red-600"}>{f.dias ?? "—"} días</strong>
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <span className="text-xs text-slate-500">Situación</span>
          {editor ? (
            <select
              value={f.estado}
              onChange={(e) => onCambio(f.id, { estado: e.target.value as Estado })}
              className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold bg-white focus:border-indigo-500 outline-none"
            >
              {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          ) : (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${ESTADO_STYLE[f.estado]}`}>
              {ESTADO_LABEL[f.estado]}
            </span>
          )}
        </div>
      </div>

      {editor && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 flex items-center gap-1.5 text-[11px] text-amber-700">
          <CloudOff className="w-3.5 h-3.5" />
          Los cambios se guardan en tu dispositivo y se sincronizan al tener conexión.
        </div>
      )}
    </article>
  )
}