import { useState, useEffect } from 'react'

export function useAMEData() {
  const [ameData, setAmeData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data-combined_visualization_results.json`)
        
        if (!response.ok) throw new Error('Failed to fetch AME data')
        
        const ameDataRaw = await response.json()
        
        // Process combined visualization data - estimates from scaled models, p-values from AME models
        const processedAmeData = ameDataRaw.map(d => ({
          outcome: d.outcome,
          wave: d.wave,
          contrast: d.contrast,
          estimate: d.estimate,
          std_error: d["std.error"],
          t_value: d["t.value"],
          p_value: d["p.value"],
          ci_lower: d.ci_lower,
          ci_upper: d.ci_upper,
          n: d.n,
          p_value_fdr: d["p.value.fdr"],
          sig_raw: d.sig_raw,
          sig_fdr: d.sig_fdr
        }))
        
        console.log('Processed combined visualization data:', processedAmeData.slice(0, 3)) // Debug log
        
        setAmeData(processedAmeData)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  return { ameData, loading, error }
}
