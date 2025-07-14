import { useState, useEffect } from 'react'

export function useClimateTemporalData() {
  const [climateTemporalData, setClimateTemporalData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Fetching climate temporal data...')
        const response = await fetch(`${import.meta.env.BASE_URL}data/data-climate-temporal.json`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch climate temporal data: ${response.status} ${response.statusText}`)
        }
        
        const climateTemporalDataRaw = await response.json()
        console.log('Raw climate temporal data:', climateTemporalDataRaw.slice(0, 2))
        
        if (!Array.isArray(climateTemporalDataRaw) || climateTemporalDataRaw.length === 0) {
          throw new Error('Climate temporal data is empty or not an array')
        }
        
        // Process climate temporal data - include political_party field
        const processedClimateTemporalData = climateTemporalDataRaw.map(d => ({
          wave: d.wave,
          wave_label: d.wave_label,
          condition: d.condition,
          mean: d.mean,
          se: d.se,
          n: d.n,
          political_party: d.political_party // Include political_party from the data
        }))
        
        console.log('Processed climate temporal data:', processedClimateTemporalData.slice(0, 3))
        
        setClimateTemporalData(processedClimateTemporalData)
        setLoading(false)
      } catch (err) {
        console.error('Error loading climate temporal data:', err)
        setError(err.message)
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  return { climateTemporalData, loading, error }
}