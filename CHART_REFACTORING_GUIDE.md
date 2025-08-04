# Chart Reusability Refactoring Guide

This document outlines a step-by-step plan to improve the reusability and maintainability of the chart system in the Grey's Anatomy research dashboard.

## Current State Analysis

The current chart architecture has several strengths but also opportunities for improvement:

**Strengths:**
- Well-structured component hierarchy
- Consistent data processing patterns
- Good separation of concerns between data hooks and chart rendering
- Successful implementation of smooth animations

**Pain Points:**
- Code duplication between similar chart types (e.g., `useDumbbellChart` vs `usePolicyDumbbellChart`)
- Repetitive chart component boilerplate
- Hard-coded chart configurations scattered across files
- Manual previous data management in each component

## Refactoring Roadmap

### Phase 1: Consolidate Duplicate Chart Logic ✅ COMPLETE

**Priority: High | Estimated Time: 2-3 hours**
**Status:** Completed January 2025

#### Step 1.1: Create Unified Dumbbell Hook ✅ DONE
- Created `useUnifiedDumbbellChart.js` that handles both category and political party grouping

Replace both `useDumbbellChart.js` and `usePolicyDumbbellChart.js` with a single hook:

```javascript
// src/components/base/useUnifiedDumbbellChart.js
export const useUnifiedDumbbellChart = ({
  svgRef,
  data,
  currentWave,
  previousData = null,
  groupBy = 'category', // 'category' or 'political_party'  
  categoryFilter = null, // for policy charts that filter by category
  title,
  subtitle,
  xAxisLabel,
  yAxisLabel,
  yAxisItems,
  xDomain,
  calculateDifferences = true,
  onYAxisLabelClick = null
}) => {
  // Implementation combines logic from both existing hooks
  // Use groupBy to determine data filtering strategy
  // Use categoryFilter for policy-specific filtering
}
```

#### Step 1.2: Update Chart Components ✅ DONE
- Updated `KnowledgeAccuracyChart.jsx` to use unified hook with `groupBy: 'category'`
- Updated `PolicySupportChart.jsx` to use unified hook with `groupBy: 'political_party'`

Update `KnowledgeAccuracyChart.jsx` and `PolicySupportChart.jsx` to use the unified hook:

```javascript
// Knowledge chart uses default groupBy='category'
useUnifiedDumbbellChart({
  // ... existing props
})

// Policy chart specifies groupBy and categoryFilter
useUnifiedDumbbellChart({
  // ... existing props,
  groupBy: 'political_party',
  categoryFilter: "Policy Support Average"
})
```

#### Step 1.3: Remove Old Hooks ✅ DONE
- Removed `useDumbbellChart.js`
- Removed `usePolicyDumbbellChart.js`

Delete `useDumbbellChart.js` and `usePolicyDumbbellChart.js` after migration is complete.

**Files to modify:**
- `src/components/base/useUnifiedDumbbellChart.js` (new)
- `src/components/charts/3.4-KnowledgeAccuracyChart.jsx`
- `src/components/charts/3.5-PolicySupportChart.jsx`
- `src/components/base/useDumbbellChart.js` (delete)
- `src/components/base/usePolicyDumbbellChart.js` (delete)

---

### Phase 2: Configuration-Driven Charts ⚠️ PARTIALLY COMPLETE

**Priority: Medium | Estimated Time: 3-4 hours**
**Status:** UnifiedChartContainer exists but no config system

#### Step 2.1: Create Chart Configuration System ❌ NOT DONE

```javascript
// src/config/chartConfigs.js
export const CHART_CONFIGS = {
  knowledge: {
    title: 'Heat Episode Impact on Health Knowledge',
    subtitle: 'Percentage point difference from control group by knowledge category',
    xAxisLabel: 'Difference from Control (percentage points)',
    yAxisLabel: 'Health Risks Associated with Extreme Heat',
    calculateDifferences: true,
    chartType: 'dumbbell',
    downloadPrefix: 'knowledge-accuracy',
    className: 'knowledge-accuracy-chart',
    availableWaves: [2, 3],
    yAxisItems: KNOWLEDGE_CATEGORIES.filter(category => category !== 'Cancer')
  },
  
  policy: {
    title: 'Heat Episode Impact on Policy Support',
    subtitle: 'Average of government investment and cooling center support by political affiliation',
    xAxisLabel: 'Difference from Control (percentage points)',
    groupBy: 'political_party',
    categoryFilter: "Policy Support Average",
    xDomain: [-4, 10],
    chartType: 'dumbbell',
    downloadPrefix: 'policy-support',
    className: 'policy-support-chart',
    availableWaves: [2, 3],
    yAxisItems: ['Overall', 'Democrat', 'Independent', 'Republican']
  },
  
  healthWorry: {
    title: 'Heat Episode Impact on Health Worry',
    subtitle: 'Difference in health worry levels by construct',
    xAxisLabel: 'Difference from Control (percentage points)',
    chartType: 'dumbbell',
    downloadPrefix: 'health-worry',
    className: 'health-worry-chart',
    availableWaves: [2, 3]
  }
  
  // Add more chart configs as needed
}
```

#### Step 2.2: Create Base Chart Component ❌ NOT DONE

```javascript
// src/components/base/BaseChart.jsx
export const BaseChart = ({
  config,
  data,
  currentWave,
  onWaveChange,
  children
}) => {
  const svgRef = useRef()
  const previousWaveData = useRef(null)
  const { chartRef, generateFilename } = useChartDownload(config.downloadPrefix)

  const handleWaveChange = (newWave) => {
    if (newWave === currentWave) return
    
    if (data && data.length > 0) {
      previousWaveData.current = normalizeChartData(
        data.filter(item => item.wave === currentWave)
      )
    }
    
    onWaveChange(newWave)
  }

  return (
    <UnifiedChartContainer
      chartRef={chartRef}
      svgRef={svgRef}
      filename={generateFilename({ wave: currentWave })}
      showWaveControls={true}
      currentWave={currentWave}
      onWaveChange={handleWaveChange}
      availableWaves={config.availableWaves}
      className={config.className}
    >
      {children({ 
        svgRef, 
        previousWaveData: previousWaveData.current,
        config 
      })}
    </UnifiedChartContainer>
  )
}
```

**Files to create:**
- `src/config/chartConfigs.js`
- `src/components/base/BaseChart.jsx`

---

### Phase 3: Unified Data Processing ❌ NOT STARTED

**Priority: Medium | Estimated Time: 2-3 hours**

#### Step 3.1: Create Universal Data Hook ❌ NOT DONE

```javascript
// src/hooks/useChartData.js
export const useChartData = (dataSource, config = {}) => {
  const dataHooks = {
    knowledge: useKnowledgeData,
    policy: usePolicyData,
    climate: useClimateTemporalData,
    heatwave: useHeatwaveCompositeData,
    ame: useAMEData
  }

  const hookFunction = dataHooks[dataSource]
  if (!hookFunction) {
    throw new Error(`Unknown data source: ${dataSource}`)
  }

  const { data: rawData, loading, error } = hookFunction()
  
  const processedData = useMemo(() => {
    if (!rawData) return null
    
    let processed = normalizeChartData(rawData)
    
    // Apply configuration-based filters
    if (config.categoryFilter) {
      processed = processed.filter(d => d.category === config.categoryFilter)
    }
    
    if (config.dataFilter) {
      processed = processed.filter(config.dataFilter)
    }
    
    return processed
  }, [rawData, config])

  return { data: processedData, loading, error }
}
```

#### Step 3.2: Standardize Domain Calculations ❌ NOT DONE

```javascript
// src/utils/domainUtils.js
export const domainUtils = {
  autoWithZero: (data, padding = 0.1) => {
    const values = data.map(d => d.mean).filter(v => v != null)
    if (values.length === 0) return [-1, 1]
    
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min
    const paddingValue = Math.max(range * padding, 1)
    
    return [
      Math.min(min - paddingValue, -paddingValue, 0),
      Math.max(max + paddingValue, paddingValue)
    ]
  },
  
  fixed: (min, max) => [min, max],
  
  symmetric: (data, padding = 0.1) => {
    const values = data.map(d => Math.abs(d.mean)).filter(v => v != null)
    if (values.length === 0) return [-1, 1]
    
    const max = Math.max(...values)
    const paddedMax = max * (1 + padding)
    return [-paddedMax, paddedMax]
  },
  
  fromConfig: (config, data) => {
    if (config.xDomain) return config.xDomain
    if (config.domainType === 'symmetric') return domainUtils.symmetric(data)
    return domainUtils.autoWithZero(data)
  }
}
```

**Files to create:**
- `src/hooks/useChartData.js`
- `src/utils/domainUtils.js`

---

### Phase 4: Simplified Chart Components ❌ NOT STARTED

**Priority: Low | Estimated Time: 1-2 hours**

#### Step 4.1: Refactor Chart Components to Use New System ❌ NOT DONE

```javascript
// src/components/charts/3.4-KnowledgeAccuracyChart.jsx
import { CHART_CONFIGS } from '../../config/chartConfigs'
import { useChartData } from '../../hooks/useChartData'
import { BaseChart } from '../base/BaseChart'
import { useUnifiedDumbbellChart } from '../base/useUnifiedDumbbellChart'

export default function KnowledgeAccuracyChart() {
  const [currentWave, setCurrentWave] = useState(2)
  const config = CHART_CONFIGS.knowledge
  const { data, loading, error } = useChartData('knowledge', config)

  if (loading) return <div className="loading">Loading knowledge accuracy data...</div>
  if (error) return <div className="error">Error loading data: {error}</div>
  if (!data || data.length === 0) {
    return <div className="loading">No knowledge data available...</div>
  }

  return (
    <BaseChart
      config={config}
      data={data}
      currentWave={currentWave}
      onWaveChange={setCurrentWave}
    >
      {({ svgRef, previousWaveData, config }) => {
        useUnifiedDumbbellChart({
          svgRef,
          data,
          currentWave,
          previousData: previousWaveData,
          ...config
        })
        return null
      }}
    </BaseChart>
  )
}
```

#### Step 4.2: Create Chart Factory (Optional) ❌ NOT DONE

```javascript
// src/components/base/ChartFactory.jsx
export const ChartFactory = ({ chartId, currentWave, onWaveChange }) => {
  const config = CHART_CONFIGS[chartId]
  if (!config) {
    throw new Error(`Unknown chart configuration: ${chartId}`)
  }

  const { data, loading, error } = useChartData(config.dataSource, config)

  if (loading) return <div className="loading">Loading {config.title}...</div>
  if (error) return <div className="error">Error loading data: {error}</div>

  return (
    <BaseChart
      config={config}
      data={data}
      currentWave={currentWave}
      onWaveChange={onWaveChange}
    >
      {({ svgRef, previousWaveData }) => {
        const chartHooks = {
          dumbbell: useUnifiedDumbbellChart,
          temporal: useTemporalChart,
          ame: useAMEChart
        }
        
        const useChart = chartHooks[config.chartType]
        useChart({
          svgRef,
          data,
          currentWave,
          previousData: previousWaveData,
          ...config
        })
        
        return null
      }}
    </BaseChart>
  )
}
```

**Files to modify:**
- All chart component files in `src/components/charts/`

---

### Phase 5: Extract Animation System (Optional Enhancement) ❌ NOT STARTED

**Priority: Low | Estimated Time: 2-3 hours**

#### Step 5.1: Create Reusable Animation Hook ❌ NOT DONE

```javascript
// src/hooks/useChartAnimations.js
export const useChartAnimations = (transitionDuration = 750) => {
  const animateElement = useCallback((selection, isUpdate, fromAttrs, toAttrs) => {
    if (isUpdate && fromAttrs) {
      selection
        .attr(fromAttrs)
        .transition()
        .duration(transitionDuration)
        .attr(toAttrs)
    } else {
      selection.attr(toAttrs)
    }
  }, [transitionDuration])

  const animateWithPrevious = useCallback((selection, isUpdate, currentData, previousData, attrFunction) => {
    if (isUpdate && previousData) {
      // Start from previous data position
      selection.attr(d => attrFunction(previousData.find(prev => prev.id === d.id) || d))
        .transition()
        .duration(transitionDuration)
        .attr(d => attrFunction(d))
    } else {
      selection.attr(d => attrFunction(d))
    }
  }, [transitionDuration])

  return { animateElement, animateWithPrevious }
}
```

**Files to create:**
- `src/hooks/useChartAnimations.js`

---

## Implementation Timeline

### Week 1: Core Consolidation
- [✅] Phase 1: Consolidate dumbbell chart hooks (Complete - unified hook created and old hooks removed)
- [✅] Test existing charts still work
- [✅] Verify animations still function

### Week 2: Configuration System  
- [⚠️] Phase 2: Implement configuration-driven approach (Partially done - UnifiedChartContainer exists)
- [ ] Create BaseChart component
- [ ] Migrate 2-3 chart components to new system

### Week 3: Data & Domain Utilities
- [ ] Phase 3: Unified data processing
- [ ] Domain calculation utilities
- [ ] Test all data sources work correctly

### Week 4: Polish & Optional Features
- [ ] Phase 4: Simplify remaining chart components
- [ ] Phase 5: Animation system (if desired)
- [ ] Documentation and cleanup

## Testing Strategy

1. **Regression Testing:** After each phase, verify all existing charts render correctly
2. **Animation Testing:** Ensure wave transitions work smoothly
3. **Data Testing:** Confirm all data sources load and process correctly
4. **Download Testing:** Verify PNG export functionality remains intact
5. **Responsive Testing:** Check mobile/desktop layouts

## Benefits After Refactoring

1. **Reduced Code Duplication:** ~50% less chart-specific code
2. **Easier Configuration:** Change chart properties without touching components
3. **Better Testing:** Test chart logic independently of React components  
4. **Consistent Behavior:** All charts follow the same patterns
5. **Easier Maintenance:** Fix bugs in one place, not scattered across files
6. **Faster Development:** New charts can be created with minimal boilerplate

## Rollback Plan

- Keep original files in a `backup/` directory until refactoring is complete
- Each phase can be rolled back independently
- Git branch strategy: create feature branches for each phase

## Notes

- This refactoring maintains all existing functionality
- No changes to the user-facing interface
- All current chart features (animations, downloads, responsive design) are preserved
- The refactoring makes the codebase more maintainable for future development

---

**Created:** January 2025  
**Status:** In Progress - Partially Implemented  
**Last Updated:** January 2025

## Completed Phases

### ✅ Phase 1: Consolidated Duplicate Chart Logic (January 2025)
- Created `useUnifiedDumbbellChart.js` that handles both chart types
- Updated both chart components to use the unified hook
- Removed old duplicate hooks (`useDumbbellChart.js` and `usePolicyDumbbellChart.js`)
- Tested and verified all functionality preserved including animations  
**Next Review:** [Schedule regular check-ins during implementation]