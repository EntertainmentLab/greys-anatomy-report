import { useState, useEffect } from 'react'

export function useClimateBeliefChangeData() {
  const [climateBeliefChangeData, setClimateBeliefChangeData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Fetching climate belief change data...')
        const response = await fetch(`${import.meta.env.BASE_URL}data-climate-belief-change.json`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch climate belief change data: ${response.status} ${response.statusText}`)
        }
        
        const climateBeliefChangeDataRaw = await response.json()
        console.log('Raw climate belief change data:', climateBeliefChangeDataRaw)
        
        if (!Array.isArray(climateBeliefChangeDataRaw) || climateBeliefChangeDataRaw.length === 0) {
          throw new Error('Climate belief change data is empty or not an array')
        }
        
        // Process climate belief change data
        const processedClimateBeliefChangeData = climateBeliefChangeDataRaw.map(d => ({
          condition: d.condition,
          total_n: d.total_n,
          percentages: d.percentages,
          changed_mind_pct: d.changed_mind_pct
        }))
        
        console.log('Processed climate belief change data:', processedClimateBeliefChangeData)
        
        setClimateBeliefChangeData(processedClimateBeliefChangeData)
        setLoading(false)
      } catch (err) {
        console.error('Error loading climate belief change data:', err)
        setError(err.message)
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  return { climateBeliefChangeData, loading, error }
}