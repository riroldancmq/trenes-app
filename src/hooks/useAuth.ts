import { useCallback, useEffect, useState } from "react"
import { supabase, fetchRol, type Rol } from "../lib/supabase"
import type { Session } from "@supabase/supabase-js"

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [rol, setRol] = useState<Rol>(null)
  const [loading, setLoading] = useState(true)

  const cargarRol = useCallback((userId: string) => {
    fetchRol(userId).then(setRol)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user.id) cargarRol(data.session.user.id)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      setRol(null)
      if (s?.user.id) cargarRol(s.user.id)
    })
    return () => sub.subscription.unsubscribe()
  }, [cargarRol])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (!error) setRol(null) // rol se setea vía SQL por el admin
    return error?.message ?? null
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return { session, rol, loading, signIn, signUp, signOut }
}

export type UseAuth = ReturnType<typeof useAuth>