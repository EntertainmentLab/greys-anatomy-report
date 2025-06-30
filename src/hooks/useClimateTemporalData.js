import { useState, useEffect } from 'react'

export function useClimateTemporalData() {
  const [climateTemporalData, setClimateTemporalData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}climate-temporal-data.json`)
        
        if (!response.ok) throw new Error('Failed to fetch climate temporal data')
        
        const climateTemporalDataRaw = await response.json()
        
        // Process climate temporal data
        const processedClimateTemporalData = climateTemporalDataRaw.map(d => ({
          wave: d.wave,
          wave_label: d.wave_label,
          condition: d.condition,
          mean: d.mean,
          se: d.se,
          n: d.n
        }))
        
        console.log('Processed climate temporal data:', processedClimateTemporalData.slice(0, 3)) // Debug log
        
        setClimateTemporalData(processedClimateTemporalData)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  return { climateTemporalData, loading, error }
}