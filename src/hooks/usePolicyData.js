import { useState, useEffect } from 'react'

// Helper to deeply flatten a value until it's not an array
function deepUnwrap(val) {
  while (Array.isArray(val) && val.length > 0) {
    val = val[0]
  }
  return val
}

export function usePolicyData() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Fetching policy support data...')
        const response = await fetch(`${import.meta.env.BASE_URL}data-policy-support.json`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch policy support data: ${response.status} ${response.statusText}`)
        }
        
        const policyData = await response.json()
        console.log('Raw policy data:', policyData.slice(0, 2))
        
        // Process policy support data
        const processedData = policyData.map(d => ({
          condition: deepUnwrap(d.condition),
          category: deepUnwrap(d.category),
          mean: deepUnwrap(d.mean),
          se: deepUnwrap(d.se),
          wave: deepUnwrap(d.wave),
          n: deepUnwrap(d.n),
          political_party: deepUnwrap(d.political_party)
        }))
        
        console.log('Processed policy data:', processedData.slice(0, 3))
        
        setData(processedData)
        setLoading(false)
      } catch (err) {
        console.error('Error loading policy data:', err)
        setError(err.message)
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  return { data, loading, error }
}
