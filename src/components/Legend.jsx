import { CONDITIONS_CONFIG } from '../constants'
import './Legend.css'

function Legend() {
  return (
    <div className="legend-info">
      <h3>Experimental Conditions</h3>
      <div className="condition-explanations">
        {CONDITIONS_CONFIG.map(condition => (
          <div key={condition.id} className="condition-item">
            <span className={`condition-label ${condition.id}`}>
              {condition.label}
            </span>
            <span>{condition.description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Legend
