import { useState, useEffect } from 'react'

export function useHeatwaveCompositeData() {
  const [heatwaveCompositeData, setHeatwaveCompositeData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Fetching heatwave composite data...')
        const response = await fetch(`${import.meta.env.BASE_URL}data/data-heatwave-composite.json`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch heatwave composite data: ${response.status} ${response.statusText}`)
        }
        
        const heatwaveCompositeDataRaw = await response.json()
        console.log('Raw heatwave composite data:', heatwaveCompositeDataRaw.slice(0, 2))
        
        if (!Array.isArray(heatwaveCompositeDataRaw) || heatwaveCompositeDataRaw.length === 0) {
          throw new Error('Heatwave composite data is empty or not an array')
        }
        
        // Process heatwave composite data
        const processedHeatwaveCompositeData = heatwaveCompositeDataRaw.map(d => ({
          wave: d.wave,
          wave_label: d.wave_label,
          condition: d.condition,
          mean: d.mean,
          se: d.se,
          n: d.n,
          political_party: 'Overall' // Add this field to match what TemporalChart expects
        }))
        
        console.log('Processed heatwave composite data:', processedHeatwaveCompositeData.slice(0, 3))
        
        setHeatwaveCompositeData(processedHeatwaveCompositeData)
        setLoading(false)
      } catch (err) {
        console.error('Error loading heatwave composite data:', err)
        setError(err.message)
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  return { heatwaveCompositeData, loading, error }
}