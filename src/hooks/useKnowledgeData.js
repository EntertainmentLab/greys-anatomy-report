import { useState, useEffect } from 'react'

// Helper to deeply flatten a value until it's not an array
function deepUnwrap(val) {
  while (Array.isArray(val) && val.length > 0) {
    val = val[0]
  }
  return val
}

export function useKnowledgeData() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/data-knowledge.json`)
        
        if (!response.ok) throw new Error('Failed to fetch knowledge data')
        
        const knowledgeData = await response.json()
        
        // Process knowledge data
        const processedData = knowledgeData.map(d => ({
          condition: deepUnwrap(d.condition),
          category: deepUnwrap(d.category),
          mean: deepUnwrap(d.mean),
          se: deepUnwrap(d.se),
          wave: deepUnwrap(d.wave),
          n: deepUnwrap(d.n)
        }))
        
        console.log('Processed knowledge data:', processedData.slice(0, 3))
        
        setData(processedData)
        setLoading(false)
      } catch (err) {
        console.error('Error loading knowledge data:', err)
        setError(err.message)
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  return { data, loading, error }
}
