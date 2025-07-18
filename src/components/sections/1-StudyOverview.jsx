import EpisodePreview from '../infographics/2.2-EpisodePreview';
import AMEChartsCarousel from '../charts/1.2-AMEChartsCarousel';
// import HeatwaveCompositeChart from '../charts/HeatwaveCompositeChart';
import SurveyItemsPopup from '../infographics/SurveyItemsPopup';
import { useState } from 'react';

function StudyOverview() {
  const [showEpisodePreview, setShowEpisodePreview] = useState(false);
  const [surveyPopupOpen, setSurveyPopupOpen] = useState(false);
  const [selectedConstruct, setSelectedConstruct] = useState('');

  const handleConstructClick = (outcome) => {
    setSelectedConstruct(outcome);
    setSurveyPopupOpen(true);
  };

  return (
    <section className="report-section">
      <h2>
        Study Overview
      </h2>
      <p>
        Television medical dramas have long reflected the realities of our everyday lives. As the climate crisis increasingly threatens public health and strains our healthcare systems, these shows – where medicine, science, and human emotion converge – may offer more than compelling stories. Can they help audiences see climate change not as a distant, abstract issue, but as a pressing, personal one? And can they deliver potentially life-saving information in a warming world?
      </p>
      <p>
        To explore how entertainment can shape public understanding of climate-related health risks, Rare’s Entertainment Lab studied the impact of an extreme heat storyline in the long-running cultural landmark Grey's Anatomy.
      </p>
      <p>
        In the Season 21 episode <button
          className="episode-preview-trigger"
          onClick={() => setShowEpisodePreview(true)}
        >
          "Drop it Like it's Hot"
        </button>, staff at Grey Sloan Memorial Hospital respond to a record-breaking heat wave. Though climate change is never mentioned explicitly, the episode vividly depicts the cascading effects of extreme heat: power outages, overwhelmed emergency services, and difficult triage decisions. <b>This provided a unique opportunity to test whether a dramatic medical storyline could shift perceptions about heat waves, their public health risks, and climate change more broadly.</b>
      </p>
      <p>
        The results were clear: the episode effectively raised awareness about heat-related health risks and significantly increased concern about the impacts of extreme heat. 
      </p>
      <p>The results were clear: the episode effectively raised awareness about heat-related health risks and significantly increased concern about the impacts of extreme heat. The episode boosted:</p>

      <ul>
        <li className="definition-item">
          <b>Perceived likelihood of heat wave exposure</b>
          <span className="info-button" onClick={() => handleConstructClick('Perceived Likelihood of Heat Wave Exposure')}>
            i
          </span>, or how likely viewers think they or their community will experience a severe heatwave this summer
        </li>
        <li className="definition-item">
          <b>Perceived threat severity</b>
          <span className="info-button" onClick={() => handleConstructClick('Perceived Heat Wave Threat Severity')}>
            i
          </span>, or how worried viewers are about severity of heatwaves, and the amount of harm they might cause
        </li>
        <li className="definition-item">
          <b>Perceived threat to health</b>
          <span className="info-button" onClick={() => handleConstructClick('Perceived Threat of Heat Waves on Health')}>
            i
          </span>, or how worried viewers are about how severe heat waves can impact their health
        </li>
        <li className="definition-item">
          <b>Knowledge</b>
          <span className="info-button" onClick={() => handleConstructClick('Knowledge of the Impact of Heat Waves')}>
            i
          </span> about the specific health impacts of exposure to extreme heat
        </li>
        <li className="definition-item">
          <b>Support</b>
          <span className="info-button" onClick={() => handleConstructClick('Heat and Policy Support')}>
            i
          </span> for heat-adaptive policies, such as investments in hospital infrastructure and the expansion of public cooling centers
        </li>
      </ul>
      <p>In addition to evaluating the episode on its own, the study tested the added impact of a complementary social media campaign. Half of the participants were randomly assigned to watch one of four short-form videos immediately after the episode. Produced independently by an environmental organization, these social media videos explicitly linked the episode’s events to climate science and included calls to action for health system resilience.</p>
      <p>The strongest and most lasting effects were observed among participants who saw both the episode and the follow-up social media videos. Additionally, this combined condition boosted:</p>
      <ul>
        <li className="definition-item">
          <b>Perceived personal impacts of climate change</b>
          <span className="info-button" onClick={() => handleConstructClick('Personal Impact of Climate Change')}>
            i
          </span>, including the belief that climate change will have a significant impact on daily life and it will do so sooner
        </li>
        <li className="definition-item">
          <b>Support</b>
          <span className="info-button" onClick={() => handleConstructClick('Climate Change - Support for Action')}>
            i
          </span> for action on climate change broadly
        </li>
      </ul>
      <p>We found that many of the positive shifts in audience attitudes <b>persisted even two weeks after viewing the episode or the episode</b> and the social media video together – providing empirical evidence of short-to-mid term impact.</p>
      
      <AMEChartsCarousel />
      
      <p>Notably, through a series of interviews with audiences, we found that these gains came without sacrificing entertainment value. Viewers:</p>
      <ul>
        <li>Connected the on-screen heatwave to their personal experiences with extreme heat and its serious health impacts within their own families.</li>
        <li>Commended the show for depicting real-world issues like heat waves, and praised the show’s legacy of addressing social issues. One interviewee remarked, “The show does the world a service by… incorporating real-life national issues into the storyline.”</li>
        <li>Highlighted real-world medical techniques – such as “using body bags and filling them with ice” to cool patients – as especially memorable. That striking image stayed with audiences, driving home just how serious extreme weather can be.</li>
      </ul>
      <p>It is important to acknowledge the areas where attitudes remained unchanged. We did not find any significant effects on perceptions of healthcare workers’ responsibility to raise awareness about heat-related health risks. Additionally, the episode alone did not move most measures related specifically to climate change, like the perceived personal impacts of climate change. This lack of movement is perhaps unsurprising, given that the episode did not explicitly reference climate change and the broader issue may not have been top of mind for viewers.</p>
      <p>Nevertheless, these findings demonstrate the powerful potential of entertainment to both engage and educate, making complex public health and environmental issues feel immediate and personal. As the climate crisis deepens, integrating accurate, emotionally-resonant storylines into popular film and TV may be one of the most impactful tools for life-saving public awareness and action.</p>
      
      {/* <HeatwaveCompositeChart /> */}
      
      <EpisodePreview
        isOpen={showEpisodePreview}
        onClose={() => setShowEpisodePreview(false)}
        episode="hot"
      />
      
      <SurveyItemsPopup 
        isOpen={surveyPopupOpen}
        onClose={() => setSurveyPopupOpen(false)}
        constructName={selectedConstruct}
      />
    </section>
  )
}

export default StudyOverview
