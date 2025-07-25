import React from 'react'
import '../../styles/components/footer.css'

const Footer = () => {
  return (
    <footer className="l-footer" role="contentinfo">
      <div className="l-constrain l-constrain--large">
        <div className="l-grid l-grid--4col">
          {/* Column 1: Logo */}
          <div className="footer__logo-column">
            <div className="footer__logo">
              <a className="site-name" href="https://rare.org" title="Home" rel="home">
                <img src="https://rare.org/wp-content/themes/rare/images/rare-logo--white.svg" alt="Rare" className="rare-logo" />
              </a>
            </div>
          </div>

          {/* Column 2: Tagline + Social */}
          <div className="footer__tagline-column">
            <span className="site-slogan">Rare inspires change so people and nature thrive.</span>
            
            <ul className="menu menu--social">
              <li className="menu__item menu__item--facebook">
                <a className="menu__link" href="https://www.facebook.com/Rare.org" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  Facebook
                </a>
              </li>
              <li className="menu__item menu__item--instagram">
                <a className="menu__link" href="https://www.instagram.com/rare_org" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  Instagram
                </a>
              </li>
              <li className="menu__item menu__item--twitter">
                <a className="menu__link" href="https://twitter.com/rare_org" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  Twitter
                </a>
              </li>
              <li className="menu__item menu__item--linkedin">
                <a className="menu__link" href="https://www.linkedin.com/company/rare" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  LinkedIn
                </a>
              </li>
              <li className="menu__item menu__item--youtube">
                <a className="menu__link" href="https://www.youtube.com/user/rareconservation" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  YouTube
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Join Us */}
          <div className="footer__menu-column">
            <div className="footer-menu-section">
              <h3 className="footer-menu-title">Join Us</h3>
              <ul className="footer-menu-list">
                <li><a href="https://rare.org/about-us/contact-us/">Contact Us</a></li>
                <li><a href="https://rare.org/careers/">Careers</a></li>
                <li><a href="/subscribe/">Get updates</a></li>
                <li><a href="/why-give/">Why give</a></li>
              </ul>
              <div className="footer-donate-btn-container">
                <a href="https://www.rare.org/donate" className="rare-donate-btn">Give</a>
              </div>
            </div>
          </div>

          {/* Column 4: Our Network */}
          <div className="footer__menu-column">
            <div className="footer-menu-section">
              <h3 className="footer-menu-title">Our Network</h3>
              <ul className="footer-menu-list">
                <li><a href="https://behavior.rare.org/" target="_blank">Center for Behavior & the Environment</a></li>
                <li><a href="https://solutionsearch.org/" target="_blank">Solution Search</a></li>
                <li><a href="https://www.meloyfund.com/" target="_blank">The Meloy Fund</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer__copyright">
          <div className="copyright">
            © 2025 Rare.
          </div>

          <ul className="menu menu--copyright">
            <li className="menu__item menu-item menu-item-type-post_type menu-item-object-page menu-item-142">
              <a className="menu__link" href="https://rare.org/terms/" target="">Terms</a>
            </li>
            <li className="menu__item menu-item menu-item-type-post_type menu-item-object-page menu-item-privacy-policy menu-item-143">
              <a className="menu__link" href="https://rare.org/privacy-policy/" target="">Privacy</a>
            </li>
            <li className="menu__item menu-item menu-item-type-post_type menu-item-object-page menu-item-144">
              <a className="menu__link" href="https://rare.org/cookies/" target="">Cookies</a>
            </li>
            <li className="menu__item menu-item menu-item-type-post_type menu-item-object-page menu-item-25551">
              <a className="menu__link" href="https://rare.org/about-us/accountability-transparency/" target="">Financials, Accountability & Transparency</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default Footer