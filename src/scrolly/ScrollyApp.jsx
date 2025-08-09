import { useEffect, useRef, useState } from 'react'
import '../styles/scrolly.css'

const sections = [
  {
    title: "Grey's Anatomy & Heat Waves",
    text: "Can a TV drama help us stay safe when the weather gets dangerously hot? Let's find out.",
    image: '/images/greys-anatomy-banner_with_text.png',
    alt: "Grey's Anatomy banner with doctors"
  },
  {
    title: 'What We Learned',
    text: 'People who watched a heat wave storyline remembered more lifesaving tips.',
    extra: 'On average, viewers recalled about two more pieces of heat safety advice than non-viewers.',
    image: '/images/eyeinspired.jpg',
    alt: 'Illustration of a blazing sun'
  },
  {
    title: 'Why It Matters',
    text: 'Extreme heat already kills more people than any other weather hazard in the U.S. Knowledge can save lives.',
    image: '/images/farmernick.jpg',
    alt: 'A farmer wiping sweat from his brow on a hot day'
  }
]

function ScrollyApp() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showMore, setShowMore] = useState(false)
  const stepRefs = useRef([])

  useEffect(() => {
    stepRefs.current = stepRefs.current.slice(0, sections.length)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index)
            setActiveIndex(index)
          }
        })
      },
      { threshold: 0.5 }
    )

    stepRefs.current.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="scrolly-container">
      <div className="graphic" aria-hidden="true">
        <img
          src={sections[activeIndex].image}
          alt={sections[activeIndex].alt}
        />
      </div>
      <div className="scrolly-text">
        {sections.map((section, i) => (
          <section
            key={i}
            className={`step ${i === activeIndex ? 'active' : ''}`}
            data-index={i}
            ref={(el) => (stepRefs.current[i] = el)}
          >
            <h2>{section.title}</h2>
            <p>{section.text}</p>
            {section.extra && i === 1 && (
              <div>
                <button
                  onClick={() => setShowMore((s) => !s)}
                  aria-expanded={showMore}
                  className="more-button"
                >
                  {showMore ? 'Hide detail' : 'Tell me more'}
                </button>
                {showMore && <p>{section.extra}</p>}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

export default ScrollyApp
