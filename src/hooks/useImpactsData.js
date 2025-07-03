import { useState, useEffect } from 'react'

const IMPACT_MAPPING = {
  'Overcrowding': 'Overcrowded hospitals turning away patients',
  'Surgery Cancellation': 'Cancellation of surgeries',
  'Er Visits': 'Increased emergency room visits',
  'Resource Shortage': 'Shortages of medical staff or resources',
  'Response Times': 'Increased (delayed) response times for emergency services',
  'Losing Power': 'Hospitals losing power'
}

export function useImpactsData() {
  const [impactsData, setImpactsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}system-impacts-data.json`)
        
        if (!response.ok) throw new Error('Failed to fetch system impacts data')
        
        const impactsDataRaw = await response.json()
        
        // Process impacts data and map impact names
        const processedImpactsData = impactsDataRaw.map(d => ({
          condition: d.condition,
          impact_issue: IMPACT_MAPPING[d.impact_issue] || d.impact_issue,
          wave: d.wave,
          not_at_all: d.not_at_all,
          a_little_amount: d.a_little_amount,
          a_moderate_amount: d.a_moderate_amount,
          quite_a_bit: d.quite_a_bit,
          a_great_deal: d.a_great_deal
        }))
        
        console.log('Processed impacts data:', processedImpactsData.slice(0, 3)) // Debug log
        
        setImpactsData(processedImpactsData)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  return { impactsData, loading, error }
}
