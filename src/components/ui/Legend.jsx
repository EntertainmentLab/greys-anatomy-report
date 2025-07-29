import { CONDITIONS_CONFIG } from '../../constants'
// CSS imported via main.css

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
            <p className="condition-description">{condition.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Legend
