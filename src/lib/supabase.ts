import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL ?? ""
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
})

export const supabaseConfigurado = url.startsWith("http") && anonKey.length > 20

export type Rol = "admin" | "editor" | null

export async function fetchRol(userId: string): Promise<Rol> {
  const { data } = await supabase
    .from("roles")
    .select("rol")
    .eq("user_id", userId)
    .maybeSingle()
  return (data?.rol as Rol) ?? null
}