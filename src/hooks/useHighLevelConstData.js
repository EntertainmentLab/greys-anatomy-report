import { useState, useEffect } from 'react'

// Helper to deeply flatten a value until it's not an array
function deepUnwrap(val) {
  while (Array.isArray(val) && val.length > 0) {
    val = val[0]
  }
  return val
}

export function useHighLevelConstData() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Fetching high-level construct data...')
        const response = await fetch(`${import.meta.env.BASE_URL}data-high-level-const.json`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch high-level construct data: ${response.status} ${response.statusText}`)
        }
        
        const highLevelData = await response.json()
        console.log('Raw high-level construct data:', highLevelData.slice(0, 2))
        
        // Process high-level construct data with NaN filtering
        const processedData = highLevelData.map(d => ({
          condition: deepUnwrap(d.condition),
          category: deepUnwrap(d.category),
          mean: deepUnwrap(d.mean),
          se: deepUnwrap(d.se),
          wave: deepUnwrap(d.wave),
          n: deepUnwrap(d.n)
        })).filter(d => {
          // Filter out entries with NaN values
          return !isNaN(d.mean) && !isNaN(d.se) && d.mean !== null && d.se !== null && d.mean !== undefined && d.se !== undefined
        })
        
        console.log('Processed high-level construct data:', processedData.slice(0, 3))
        
        setData(processedData)
        setLoading(false)
      } catch (err) {
        console.error('Error loading high-level construct data:', err)
        setError(err.message)
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  return { data, loading, error }
}