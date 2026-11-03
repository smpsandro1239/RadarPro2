/** True para URLs de base de dados remota (Turso/libsql, http(s), ws(s)). */
export function isRemoteDatabaseUrl(url: string): boolean {
  return /^(libsql|https?|wss?):\/\//i.test(url);
}
