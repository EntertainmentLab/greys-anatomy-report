import InstagramCarousel from '../infographics/2.4-InstagramCarousel';
import TimelineInfographic from '../infographics/2.5-TimelineInfographic';
import EpisodePreview from '../infographics/2.2-EpisodePreview';
import ExperimentalConditionsInfographic from '../infographics/2.3-ExperimentalConditionsInfographic';
import InlineEpisodePreview from '../ui/InlineEpisodePreview';
import { useState, useEffect } from 'react';
// CSS imported via main.css

function Methodology({ expandAllDetails = false }) {
  const [showEpisodePreview, setShowEpisodePreview] = useState(false);
  const [showNightMovesPreview, setShowNightMovesPreview] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState({});

  // Expand all details when expandAllDetails prop is true
  useEffect(() => {
    if (expandAllDetails) {
      setExpandedDetails({
        'participants': true,
        'experimental-conditions': true,
        'instagram-videos': true,
        'study-design': true,
        'timeline-measures': true
      });
    }
  }, [expandAllDetails]);

  const toggleDetails = (detailId) => {
    setExpandedDetails(prev => ({
      ...prev,
      [detailId]: !prev[detailId]
    }));
  };

  return (
    <section className="report-section">
      <h1>
        Methodology
      </h1>

      {/* Quantitative Methodology */}
      <h2>Quantitative Methodology</h2>
      
      <div className="methodology-content">
        <div className="methodology-section">
          <p>
            The study recruited <strong>~5000 U.S.-based participants</strong> whose demographic characteristics were matched using Nielsen data to resemble viewers of <i>Grey’s Anatomy</i> Season 21. Our final sample closely matched the target demographic across core dimensions like gender, ethnicity, US region, and household income, with the primary deviation being a slightly younger age distribution.</p>
            <p> Participants were randomly assigned to a <em>Heat Wave Episode</em> group; a <em>Multiplatform</em> group, and a <em>Control</em> group:</p>
          <ul>
            <li>
              <strong>HEAT WAVE EPISODE GROUP</strong> watched Season 21, Episode 8 (<em>“Drop It Like It’s Hot”</em>), in which a severe heat wave disrupts hospital operations and patient care.
            </li>
            <li>
              <strong>MULTIPLATFORM GROUP</strong> watched the same episode as the Heat Wave Episode group, followed by social media content tying the episode content to climate change. This allowed us to study the joint effect of viewing content along with complementary social media campaigns.
            </li>
            <li>
              <strong>CONTROL GROUP</strong> watched Season 21, Episode 6 (<em>“Night Moves”</em>), which includes no mention of heat waves.
            </li>
          </ul>
          <p>
            To track the impact of the content over time, we measured participants at three different points:
          </p>
          <ul>
            <li><strong>Baseline</strong> (7-10 days prior to viewing)</li>
            <li><strong>Post-Viewing</strong> (Immediately after watching the show)</li>
            <li><strong>Follow-Up</strong> (15-20 days after watching the show)</li>
          </ul>
          <p>
            Over 3000 participants completed all three waves of the study. At each wave, participants completed a survey measuring perceptions of heat waves, knowledge of heat-related health risks, confidence in taking protective actions, support for relevant policy measures, and beliefs about climate change's relevance to daily life.
          </p>
        </div>

        <div className="methodology-section">
          <h3>Participants</h3>
          <div className="expandable-details">
            <div className="details-summary">
              <p>We employed a three-arm, longitudinal randomized controlled design across three waves of data collection. At Wave 1, participants (N = 4,830) were quota-sampled using Nielsen data to match the demographic profile of <i>Grey’s Anatomy</i> Season 21 viewers on age, sex, race/ethnicity, income, and region. Given the large sample size, towards the end of recruitment, we used Connect’s “relax quotas” feature which allowed participants to enter if they met most (but not all) of the recruitment quota categories.</p>
            </div>
            
            <button
              className={`details-toggle ${expandedDetails['participants'] ? 'expanded' : ''}`}
              onClick={() => toggleDetails('participants')}
            >
              {expandedDetails['participants'] ? 'Less details' : 'More details'}
              <span className="details-toggle-icon">▼</span>
            </button>

            <div className={`details-content ${expandedDetails['participants'] ? 'expanded' : ''}`}>
              <p>Data were collected via Cloud Research’s Connect online survey platform. Participants were compensated at above-market rates and compensation increased across waves to minimize participant attrition. Between baseline and the viewing assignment, attrition was relatively high (~30%), with 3,454 participants returning to view the episode. This high rate of attrition is likely due to the survey length at Wave 2, which required participants to watch a 40-min episode and then complete an 8-10 minute survey. We saw much lower attrition (~7%) between Wave 2 and Wave 3, with 3,204 out of 3,454 returning to complete the final post-viewing survey.</p>
            </div>
          </div>
        </div>
        <div className="methodology-section">
          <h3>Experimental Conditions</h3>
          <div className="expandable-details">
            <div className="details-summary">
              <p>Participants were randomly assigned to one of three groups:</p>
            </div>
            
            <button
              className={`details-toggle ${expandedDetails['experimental-conditions'] ? 'expanded' : ''}`}
              onClick={() => toggleDetails('experimental-conditions')}
            >
              {expandedDetails['experimental-conditions'] ? 'Less details' : 'More details'}
              <span className="details-toggle-icon">▼</span>
            </button>

            <div className={`details-content ${expandedDetails['experimental-conditions'] ? 'expanded' : ''}`}>
            
              <ul>
                <li>
                  <strong>HEAT WAVE EPISODE GROUP (N = 1,091):</strong> Viewed Season 21, Episode 8 (<button
                    className="episode-preview-trigger"
                    onClick={() => setShowEpisodePreview(true)}
                  >
                    <em>“Drop It Like It’s Hot”</em>
                  </button>), in which a severe heat wave disrupts hospital operations and patient care.
                </li>
                <li>
                  <strong>MULTIPLATFORM GROUP (N = 1,073)</strong> <i>(aka Heat Wave Episode + Social Media):</i> Viewed the same episode as the Heat Wave Episode group, followed by one of four climate-related social media videos developed to contextualize the episode’s content within broader climate-health dynamics. Each participant was randomly assigned one of the four videos.
                </li>
                <li>
                  <strong>CONTROL GROUP (N = 1,040)</strong> <i>(aka Non-Climate or Weather-Related Episode):</i> Viewed Season 21, Episode 6 (<button
                    className="episode-preview-trigger"
                    onClick={() => setShowNightMovesPreview(true)}
                  >
                    <em>“Night Moves”</em>
                  </button>) – a narrative episode with no reference to climate or extreme heat.
                </li>
              </ul>

              {/* <div className="inline-episodes-container">
                <InlineEpisodePreview episode="night" />
                <InlineEpisodePreview episode="hot" />
              </div> */}
            </div>
          </div>

          <ExperimentalConditionsInfographic
            onShowNightMovesPreview={() => setShowNightMovesPreview(true)}
            onShowEpisodePreview={() => setShowEpisodePreview(true)}
          />
        </div>

        <div className="methodology-section">
          <h3>Social Media Content: Instagram Videos</h3>
          <div className="expandable-details">
            <div className="details-summary">
              <p>The four climate-related social media videos used in the Multiplatform Condition (<i>Heat Wave Episode + Social Media</i>) were <strong>commissioned and distributed by Action for the Climate Emergency (ACE)</strong>, a youth-led U.S. climate-advocacy nonprofit. These short-form Instagram reels featured social media content creators discussing heat-related health impacts and climate adaptation strategies as part of ACE’s #DangerDome impact campaign, which was specifically designed to:</p>
               <ul>
                <li><strong>Amplify the <i>Grey’s Anatomy</i> storyline</strong> for viewers who had just watched the episode; and</li>
                <li><strong>Translate the drama into clear climate science take‑aways</strong> about extreme heat, health risks, and community preparedness</li>
              </ul>
            </div>
            
            {/* <button
              className={`details-toggle ${expandedDetails['instagram-videos'] ? 'expanded' : ''}`}
              onClick={() => toggleDetails('instagram-videos')}
            >
              {expandedDetails['instagram-videos'] ? 'Less details' : 'More details'}
              <span className="details-toggle-icon">▼</span>
            </button>

            <div className={`details-content ${expandedDetails['instagram-videos'] ? 'expanded' : ''}`}>
             
              <p>The videos were created by the following Instagram creators:</p>
              <ul>
                <li>
                  <strong><a href="https://www.instagram.com/reel/DG8WJFNuxwm/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer">@eyeinspired</a></strong>: Kelly Edelman posts bold, mixed-media portraits with vivid colors and occasional art-tutorials—popular among her millions of followers
                </li>
                <li>
                  <strong><a href="https://www.instagram.com/reel/DG_myvfBnLC/" target="_blank" rel="noopener noreferrer">@becomingdrdevore</a></strong>: Syd shares transparent pre-med and med-school journey content, MCAT tips, and application advice for aspiring medical students
                </li>
                <li>
                  <strong><a href="https://www.instagram.com/reel/DG6BgVAxhij/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer">@scotpilie_wx</a></strong>: New Orleans meteorologist Scot Pilié blends weather updates, personal lifestyle and foodie moments to engage his community of ~56K followers
                </li>
                <li>
                  <strong><a href="https://www.instagram.com/reel/DG5o77lAYV4/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer">@farmernick</a></strong>: Nick Cutsumpas uses his platform to coach urban gardening, sustainability, and plant-care through hands-on tutorials and environmental activism
                </li>
              </ul>
            </div> */}
          </div>
          
          <InstagramCarousel />
        </div>

        <div className="methodology-section">
          <h3>Study Design</h3>
          <div className="expandable-details">
            <div className="details-summary">
              <p>We employed a longitudinal design to assess both immediate and sustained effects of viewing the heat wave content. Participants completed surveys at three time points: a baseline assessment prior to viewing, an immediate post-viewing survey, and a follow-up survey approximately 15-20 days later. Over 3000 participants completed all three waves.</p>
            </div>
            
            <button
              className={`details-toggle ${expandedDetails['study-design'] ? 'expanded' : ''}`}
              onClick={() => toggleDetails('study-design')}
            >
              {expandedDetails['study-design'] ? 'Less details' : 'More details'}
              <span className="details-toggle-icon">▼</span>
            </button>

            <div className={`details-content ${expandedDetails['study-design'] ? 'expanded' : ''}`}>
              <ul>
                <li><strong>Wave 1 - Baseline Survey (N = 4,830):</strong> Administered 7-10 days prior to viewing, assessing demographics, media habits, and key outcome variables.</li>
                <li><strong>Wave 2 - Post-Viewing Survey (N = 3,575):</strong> Participants watched the assigned episode (and, for the multiplatform group, a social media video). After having seen the content, participants responded to a survey assessing perceived heat risk, health system impacts, climate beliefs, policy preferences, and behavioral intentions.</li>
                <li><strong>Wave 3 - Survey Measuring Durability of Effects (N = 3,219):</strong> A follow-up survey, administered 15-20 days post-viewing, helped assess how long the effects of viewing heat-related content persists in the short-to-medium run.</li>
              </ul>
            </div>
          </div>
          
          <TimelineInfographic />
        </div>

        <div className="methodology-section">
          <h3>Survey Measures</h3>
          <div className="expandable-details">
            <div className="details-summary">
              <p>We assessed outcomes by adapting established measures from climate and heat-risk communication research, including perceived heat wave risk, threat severity, heat wave worry and harm perception (<a href="https://www.pnas.org/doi/10.1073/pnas.1813145116" target="_blank" rel="noopener noreferrer">Howe et al., 2019</a>), social norms and behavioral intentions (<a href="https://climatecommunication.yale.edu/publications/climate-change-in-the-american-mind-politics-policy-spring-2025/" target="_blank" rel="noopener noreferrer">Leiserowitz et al., 2025</a>), perceived self-efficacy, support for heat-adaptation policies, and knowledge about the heat impacts of heat waves. These domains were measured with multi-item scales that captured key factors such as perceived threat of heat waves, knowledge of heat-related health risks, support for relevant policy measures, responsibility of healthcare workers to advocate for public awareness, personal impact of climate change, and support for climate action. <em><a href={`${import.meta.env.BASE_URL}html/survey-instrument.html`} target="_blank" rel="noopener noreferrer">See full survey instrument for item wording</a></em></p>
            </div>
            
            {/* <button
              className={`details-toggle ${expandedDetails['timeline-measures'] ? 'expanded' : ''}`}
              onClick={() => toggleDetails('timeline-measures')}
            >
              {expandedDetails['timeline-measures'] ? 'Less details' : 'More details'}
              <span className="details-toggle-icon">▼</span>
            </button> */}

            {/* <div className={`details-content ${expandedDetails['timeline-measures'] ? 'expanded' : ''}`}> */}
              <h3>Data Analysis Strategy</h3>
              <p>All statistical analyses and exclusion criteria were <a href="https://osf.io/uv9x3" target="_blank" rel="noopener noreferrer">pre-registered</a> in advance of running the study.</p>
              <p>Participants who failed comprehension checks, provided non-substantive responses to open-text prompts, or viewed less than 85% of the assigned episode were excluded from analysis, leaving a final sample of 3,048.</p>
              <p>Responses to individual survey items were aggregated into scales and sub-scales using pre-registered hierarchical models. Analyses of individual survey items were pre-registered as exploratory. Statistical tests were performed using FDR (False Discovery Rate) corrections to account for multiple comparisons.</p>
            </div>
          {/* </div> */}
        </div>

      </div>

      {/* Qualitative Methodology */}
      <h2>Qualitative Methodology</h2>
      
      <div className="methodology-content">
        <div className="methodology-section">
          <h3>Participants</h3>
          <p>
            We recruited 20 participants from User Interviews (a platform for recruiting participants for extended qualitative interviews) in two waves. Wave 1 (n = 11) took place before the quantitative portion of the study; Wave 2 (n = 9) followed and was informed by quantitative findings. The average age was 38.6, and most participants were female (n = 15). The sample included individuals identifying as White (n = 11), Hispanic or Latino (n = 4), Asian (n = 3), and Black or African American (n = 2). In terms of geographical distribution, participants were primarily from the South (n = 11), with others from the Northeast (n = 4), Midwest (n = 3), and West (n = 2). Eight reported having previously watched <i>Grey’s Anatomy</i> - ranging from loyal fans to viewers who had watched most seasons. Interviews in Wave 2 primarily focused on more politically-conservative participants, with the sample consisting of 5 Republicans, 2 Independents, and 2 Democrats.
          </p>
        </div>

        <div className="methodology-section">
          <h3>Study Design</h3>
          <p>
            Participants completed ~80-minute one-on-one Zoom interviews. Wave 1 interviews were conducted before the quantitative survey and focused on reactions to the heat wave episode. Wave 2 interviews were conducted after the survey and were informed by key quantitative findings. All participants watched the heat wave episode; a subset of Wave 2 participants also viewed one or two of the Instagram campaign videos following the episode.
          </p>
        </div>

        <div className="methodology-section">
          <h3>Measures</h3>
          <p><strong>Wave 1 interviews</strong> focused on participants’ initial, unaided reactions to the heat wave episode. Measures included general impressions of the episode, entertainment value, perceived realism, and recall of the heat wave storyline. Participants were asked to summarize the plot, identify heat-related medical emergencies, and reflect on whether the episode taught them anything new about extreme heat as a health risk. Additional measures probed personal relevance (e.g., past experiences with extreme heat), perceived hospital preparedness, and suggestions for improving the episode’s messaging.</p>
          
          <p><strong>Wave 2 interviews</strong> were designed to explore reactions and interpretations of quantitative survey findings. Participants first reflected their own belief shifts. Participants were then asked to provide their opinion on the pattern of results from the quantitative study, focusing on the increases in heat-related health knowledge and policy support among viewers. Measures captured reactions to these findings - especially their thoughts on the political differences in policy support. Participants were also asked to compare different messaging frames for both heat-adaptation measures (health alone vs health plus climate) as well as messages about climate impacts (health-focused, economy-focused, or national-security focused). Measures captured participants’ evaluations of the different messaging frames in terms of persuasiveness and risk of backlash. Participants were also asked to reflect on which messaging frames would be influential among their peers, especially peers who are less climate engaged. They were also asked to reflect on how the episode or findings might influence their own behavior or their conversations with others. Finally, participants were asked to evaluate the Instagram videos in terms of source credibility, persuasive appeal, and message receptivity.</p>
        </div>
      </div>

      <EpisodePreview
        isOpen={showEpisodePreview}
        onClose={() => setShowEpisodePreview(false)}
        episode="hot"
      />

      <EpisodePreview
        isOpen={showNightMovesPreview}
        onClose={() => setShowNightMovesPreview(false)}
        episode="night"
      />
    </section>
  )
}

export default Methodology
