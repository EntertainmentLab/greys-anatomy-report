import { COLOR_MAP, CONDITION_LABELS } from '../constants'
import '../styles/components/Controls.css'

function Controls({ currentWave, currentView, selectedConditions, onWaveChange, onViewChange, onConditionsChange }) {
  const conditions = [
    { id: 'control', label: CONDITION_LABELS.control, color: COLOR_MAP.control },
    { id: 'treatment', label: CONDITION_LABELS.treatment, color: COLOR_MAP.treatment },
    { id: 'handoff', label: CONDITION_LABELS.handoff, color: COLOR_MAP.handoff }
  ]

  const handleConditionChange = (conditionId) => {
    if (selectedConditions.includes(conditionId)) {
      // Don't allow unchecking if it's the last selected condition
      if (selectedConditions.length > 1) {
        onConditionsChange(selectedConditions.filter(id => id !== conditionId))
      }
    } else {
      onConditionsChange([...selectedConditions, conditionId])
    }
  }

  return (
    <div className="controls">
      <div className="wave-toggle">
        <label className="toggle-label">Wave</label>
        <div className="toggle-buttons">
          <button 
            className={`wave-btn ${currentWave === 2 ? 'active' : ''}`}
            onClick={() => onWaveChange(2)}
          >
            Wave 2
          </button>
          <button 
            className={`wave-btn ${currentWave === 3 ? 'active' : ''}`}
            onClick={() => onWaveChange(3)}
          >
            Wave 3
          </button>
        </div>
      </div>
      
      <div className="view-toggle">
        <label className="toggle-label">View</label>
        <div className="toggle-buttons">
          <button 
            className={`view-btn ${currentView === 'combined' ? 'active' : ''}`}
            onClick={() => onViewChange('combined')}
          >
            Combined
          </button>
          <button 
            className={`view-btn ${currentView === 'separate' ? 'active' : ''}`}
            onClick={() => onViewChange('separate')}
          >
            Regional
          </button>
        </div>
      </div>

      <div className="condition-checkboxes">
        <label className="toggle-label">Conditions</label>
        <div className="checkbox-group">
          {conditions.map(condition => (
            <label key={condition.id} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedConditions.includes(condition.id)}
                onChange={() => handleConditionChange(condition.id)}
                className="condition-checkbox"
              />
              <span className={`checkbox-label checkbox-label--${condition.id}`}>
                {condition.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Controls
