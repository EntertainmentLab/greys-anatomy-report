import { useState, useEffect } from 'react'

export function useThreatData() {
  const [threatData, setThreatData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/data-health-worry.json`)
        
        if (!response.ok) throw new Error('Failed to fetch threat data')
        
        const threatDataRaw = await response.json()
        
        // Process threat data - no unwrapping needed, data is already flat
        const processedThreatData = threatDataRaw.map(d => ({
          condition: d.condition,
          health_issue: d.health_issue,
          wave: d.wave,
          not_worried: d.not_worried,
          little_worried: d.little_worried,
          moderately_worried: d.moderately_worried,
          very_worried: d.very_worried,
          extremely_worried: d.extremely_worried
        }))
        
        console.log('Processed threat data:', processedThreatData.slice(0, 3)) // Debug log
        
        setThreatData(processedThreatData)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  return { threatData, loading, error }
}
