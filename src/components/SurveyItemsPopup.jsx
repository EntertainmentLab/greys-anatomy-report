import React, { useState, useEffect } from 'react'
import '../styles/components/SurveyItemsPopup.css'

const SurveyItemsPopup = ({ isOpen, onClose, constructName }) => {
  const [surveyData, setSurveyData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSurveyData = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}survey-items.json`)
        if (!response.ok) throw new Error('Failed to fetch survey data')
        const data = await response.json()
        setSurveyData(data)
        setLoading(false)
      } catch (error) {
        console.error('Error loading survey data:', error)
        setLoading(false)
      }
    }

    if (isOpen) {
      loadSurveyData()
    }
  }, [isOpen])

  // Prevent background scrolling when popup is open
  useEffect(() => {
    if (isOpen) {
      // Store original overflow style
      const originalStyle = window.getComputedStyle(document.body).overflow
      // Disable scrolling
      document.body.style.overflow = 'hidden'
      
      // Cleanup function to restore scrolling when popup closes
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isOpen])

  // Find the matching construct data
  const constructData = surveyData.find(item => item.construct === constructName)

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="survey-popup-overlay" onClick={handleOverlayClick}>
      <div className="survey-popup-content">
        <div className="survey-popup-header">
          <h2 className="survey-popup-title">Survey Items for: {constructName}</h2>
          <button 
            className="survey-popup-close-button"
            onClick={onClose}
            aria-label="Close popup"
          >
            ✕
          </button>
        </div>
        
        <div className="survey-popup-body">
          {loading ? (
            <div className="survey-popup-loading">Loading survey items...</div>
          ) : constructData ? (
            <div className="survey-items-table">
              <table>
                <thead>
                  <tr>
                    <th>Subconstruct</th>
                    <th>Question</th>
                    <th>Question Type</th>
                    <th>Response Options/Scale</th>
                    <th>Wave</th>
                  </tr>
                </thead>
                <tbody>
                  {constructData.subconstructs.map((subconstruct, index) => (
                    <tr key={index} className="survey-item-row">
                      <td className="subconstruct-cell">
                        {subconstruct.name && <em>{subconstruct.name}</em>}
                      </td>
                      <td className="question-cell">
                        <div className="question-text">
                          {subconstruct.question}
                        </div>
                        {subconstruct.questionItems && subconstruct.questionItems.length > 0 && (
                          <ul className="question-items-list">
                            {subconstruct.questionItems.map((item, itemIndex) => (
                              <li key={itemIndex} className="question-item">
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="question-type-cell">
                        {subconstruct.questionType}
                      </td>
                      <td className="response-options-cell">
                        {subconstruct.responseOptions}
                      </td>
                      <td className="wave-cell">
                        {subconstruct.wave}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="survey-popup-error">
              No survey items found for "{constructName}"
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SurveyItemsPopup