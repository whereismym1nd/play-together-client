import { useCallback, useEffect, useState } from 'react'

const GAME_LIST_URL = '/api/games'

type Game = {
  id: string
  title: string
  cover: string
}

export const useGetGameList = () => {
  const [data, setData] = useState<Game[]>([])
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(GAME_LIST_URL)
      if (!response.ok) throw new Error(`Request failed: ${response.status}`)

      const payload: Game[] = await response.json()
      setData(payload)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return {
    data,
    isLoading,
    error,
    reload: load,
  }
}
