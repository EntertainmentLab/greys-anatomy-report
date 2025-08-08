/* eslint-disable no-magic-numbers */
import { useEffect, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const chartData = [
  { group: 'Control', score: 42 },
  { group: 'Treatment', score: 67 },
  { group: 'Handoff', score: 73 }
]

const steps = [
  {
    text: 'Welcome! Scroll to explore how watching medical dramas may teach us about heat safety.'
  },
  {
    text: "Viewers who saw Grey's Anatomy learned the most about staying safe during heat waves."
  },
  {
    text: "Imagine if every show taught lifesaving tips — we'd all be better prepared."
  },
  { text: 'Stay cool and share what you learn!' }
]

export default function ScrollyApp() {
  const [activeStep, setActiveStep] = useState(0)
  const stepRefs = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveStep(Number(entry.target.dataset.index))
          }
        })
      },
      { threshold: 0.6 }
    )
    stepRefs.current.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="scrolly-wrapper">
      <div className="graphic">
        {activeStep === 1 && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="group" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#ff6b6b" />
            </BarChart>
          </ResponsiveContainer>
        )}
        {activeStep !== 1 && (
          <div className="placeholder">
            {activeStep === 0 && 'Heat safety can be dramatic!'}
            {activeStep === 2 && 'Entertainment can save lives.'}
            {activeStep === 3 && 'Thanks for scrolling!'}
          </div>
        )}
      </div>
      <div className="scroller">
        {steps.map((step, i) => (
          <section
            className="step"
            key={step.text}
            data-index={i}
            ref={el => (stepRefs.current[i] = el)}
          >
            <p>{step.text}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
