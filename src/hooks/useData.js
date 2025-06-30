import { useState, useEffect } from 'react'

// Helper to deeply flatten a value until it's not an array
function deepUnwrap(val) {
  while (Array.isArray(val)) {
    val = val[0]
  }
  return val
}

export function useData() {
  const [data, setData] = useState([])
  const [threatData, setThreatData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Condition mapping
  const conditionMapping = {
    'control': 'control',
    'treatment': 'treatment', 
    'handoff': 'handoff'
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load both datasets
        const [knowledgeResponse, threatResponse] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}data.json`),
          fetch(`${import.meta.env.BASE_URL}heatwave-threat-data.json`)
        ])
        
        if (!knowledgeResponse.ok) throw new Error('Failed to fetch knowledge data')
        if (!threatResponse.ok) throw new Error('Failed to fetch threat data')
        
        const knowledgeData = await knowledgeResponse.json()
        const threatDataRaw = await threatResponse.json()
        
        // Process knowledge data (existing logic)
        const processedKnowledgeData = knowledgeData.map(d => ({
          condition: deepUnwrap(d.condition),
          category: deepUnwrap(d.category),
          region: deepUnwrap(d.region),
          mean: deepUnwrap(d.mean),
          se: deepUnwrap(d.se),
          wave: deepUnwrap(d.wave),
          n: deepUnwrap(d.n)
        }))
        
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
        
        setData(processedKnowledgeData)
        setThreatData(processedThreatData)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  return { data, threatData, loading, error }
}
