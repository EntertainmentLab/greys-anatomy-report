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

export function useHeatwaveConstructsData() {
  const [heatwaveConstructsData, setHeatwaveConstructsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Fetching heatwave constructs data...')
        const response = await fetch(`${import.meta.env.BASE_URL}data/data-heatwave-constructs.json`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch heatwave constructs data: ${response.status} ${response.statusText}`)
        }
        
        const heatwaveConstructsDataRaw = await response.json()
        console.log('Raw heatwave constructs data:', heatwaveConstructsDataRaw.slice(0, 2))
        
        if (!Array.isArray(heatwaveConstructsDataRaw) || heatwaveConstructsDataRaw.length === 0) {
          throw new Error('Heatwave constructs data is empty or not an array')
        }
        
        // Process heatwave constructs data
        const processedHeatwaveConstructsData = heatwaveConstructsDataRaw.map(d => ({
          construct: d.construct,
          construct_label: d.construct_label,
          wave: d.wave,
          wave_label: d.wave_label,
          condition: d.condition,
          mean: d.mean,
          se: d.se,
          n: d.n,
          political_party: 'Overall' // Add this field to match what TemporalChart expects
        }))
        
        console.log('Processed heatwave constructs data:', processedHeatwaveConstructsData.slice(0, 3))
        
        setHeatwaveConstructsData(processedHeatwaveConstructsData)
        setLoading(false)
      } catch (err) {
        console.error('Error loading heatwave constructs data:', err)
        setError(err.message)
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  return { heatwaveConstructsData, loading, error }
}