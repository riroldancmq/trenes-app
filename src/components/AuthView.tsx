import { useState } from "react"
import { Loader2, LogIn, UserPlus, Train } from "lucide-react"
import { supabaseConfigurado } from "../lib/supabase"

interface Props {
  onIniciarSesion: (email: string, password: string) => Promise<string | null>
  onRegistrarse: (email: string, password: string) => Promise<string | null>
  onEntrarComoVisitante: () => void
}

export function AuthView({ onIniciarSesion, onRegistrarse, onEntrarComoVisitante }: Props) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [registro, setRegistro] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setMsg(null)
    const err = registro ? await onRegistrarse(email, password) : await onIniciarSesion(email, password)
    if (err) {
      setMsg(registro ? "No se pudo crear la cuenta. Revisá los datos." : "Credenciales incorrectas.")
    } else if (registro) {
      setMsg("Cuenta creada. Avisá al administrador para habilitarte como editor.")
    }
    setCargando(false)
  }

  if (!supabaseConfigurado) {
    return (
      <LoadingScreen
        titulo="Falta la configuración de Supabase"
        detalle="Definí VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env"
      />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white mb-4">
            <Train className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Registro de demoras</h1>
          <p className="text-slate-500 text-sm">Lavado de formaciones</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
          />
          <div className="relative">
            <input
              type="password"
              required
              autoComplete={registro ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            />
          </div>

          {msg && (
            <p className="text-sm text-center rounded-lg bg-amber-50 text-amber-700 border border-amber-200 px-3 py-2">
              {msg}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : registro ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {registro ? "Crear cuenta" : "Iniciar sesión"}
          </button>
        </form>

        <div className="mt-3 flex justify-center">
          <button
            onClick={() => {
              setRegistro((r) => !r)
              setMsg(null)
            }}
            className="text-indigo-600 text-sm font-semibold hover:underline"
          >
            {registro ? "Ya tengo cuenta → Iniciar sesión" : "¿No tenés cuenta? Registrate"}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={onEntrarComoVisitante}
            className="w-full py-3 rounded-lg border-2 border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 transition"
          >
            Ver como visitante
          </button>
          <p className="text-xs text-slate-400 text-center mt-3">
            Los visitantes solo pueden leer. Para editar necesitás iniciar sesión.
          </p>
        </div>
      </div>
    </div>
  )
}

export function LoadingScreen({ titulo, detalle }: { titulo: string; detalle: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
        <Train className="w-12 h-12 mx-auto text-indigo-600 mb-4" />
        <h1 className="text-lg font-bold text-slate-800 mb-2">{titulo}</h1>
        <p className="text-slate-500 text-sm">{detalle}</p>
      </div>
    </div>
  )
}