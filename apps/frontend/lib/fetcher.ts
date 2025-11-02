export const fetcher = async (url: string) => {
  const res = await fetch(url)

  if (!res.ok) {
    const errorData = await res.json()
    const error = new Error(errorData.error || 'Ocorreu um erro ao buscar os dados.')
    throw error
  }

  return res.json()
}