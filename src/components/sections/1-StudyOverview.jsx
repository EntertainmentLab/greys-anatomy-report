import EpisodePreview from '../infographics/2.2-EpisodePreview';
import HeatwaveCompositeChart from '../charts/HeatwaveCompositeChart';
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
      <h1>
        Study Overview
      </h1>
      <p>
        Television medical dramas have long reflected the realities of our everyday lives. As the climate crisis drives more extreme weather events that threaten public health and strain our healthcare systems, these shows – where medicine, science, and human emotion converge – may offer more than compelling stories. Can they help audiences see weather not as a trivial, abstract issue, but as a pressing, personal one? And can they deliver potentially life-saving information and inspire support for critical solutions in a warming world?
      </p>
      <p>
        To explore how entertainment can shape public understanding of climate-related health risks, Rare’s Entertainment Lab studied the impact of an extreme heat storyline in the long-running cultural landmark <i>Grey’s Anatomy</i>.
      </p>
      <p>
        In the Season 21 episode <button
          className="episode-preview-trigger"
          onClick={() => setShowEpisodePreview(true)}
        >
          <em>“Drop It Like It’s Hot”</em>
        </button>, staff at Grey Sloan Memorial Hospital respond to a record-breaking heat wave. Though climate change is never mentioned explicitly, the episode vividly depicts the cascading effects of extreme heat: power outages, overwhelmed emergency services, and difficult triage decisions. <b>This provided a unique opportunity to test whether a dramatic medical storyline could shift perceptions about heat waves, their public health risks, and climate change more broadly.</b>
      </p>
      <p>
        <b>The results were clear: the episode effectively raised awareness about heat-related health risks and significantly increased concern about the impacts of extreme heat.</b>
      </p>
      <p>The episode boosted:</p>

      <ul>
        <li className="definition-item">
          <b>Perceived likelihood of heat wave exposure</b>
          <span className="info-button" onClick={() => handleConstructClick('Perceived Likelihood of Heat Wave Exposure')}>
            i
          </span>, or how likely viewers think they or their community will experience a severe heat wave this summer
        </li>
        <li className="definition-item">
          <b>Perceived threat severity of heat waves</b>
          <span className="info-button" onClick={() => handleConstructClick('Perceived Heat Wave Threat Severity')}>
            i
          </span>, or how worried viewers are about severity of heat waves, and the amount of harm they might cause
        </li>
        <li className="definition-item">
          <b>Perceived threat of heat waves to health</b>
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
      <p>In addition to evaluating the episode on its own, the study also examined a <b>multiplatform condition</b>, which assessed the combined impact of the episode and a complementary social media campaign. Half of the viewers were randomly assigned to watch one of four short-form videos immediately after the episode. Produced independently by an environmental organization, these social media videos explicitly linked the episode’s events to climate science and included calls to action for health system resilience.</p>
      <p>The strongest and most lasting effects were observed among viewers who saw both the episode and the follow-up social media videos. Additionally, this combined condition boosted:</p>
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
      <p>We found that many of the positive shifts in viewer attitudes <b>persisted even two weeks after viewing the episode</b> or the episode and the social media video together – providing empirical evidence of short-to-mid term impact.</p>

      <HeatwaveCompositeChart />
      <p>Notably, through a series of interviews, we found that these gains came without sacrificing entertainment value. Viewers:</p>
      <ul>
        <li className="definition-item"><b>Connected the on-screen heat wave to their personal experiences</b> with extreme heat and its serious health impacts within their own families.</li>
        <li className="definition-item"><b>Felt better prepared for the threats of extreme heat.</b> One interviewee said it was a reminder <em>“how serious the heat is, and how it is deadly, and to not underestimate it...[the episode] makes you realize, ‘Hey, I could very well be in that situation, and I shouldn’t play around with it and always be prepared.’”</em></li>
        <li className="definition-item"><b>Commended the show for depicting real-world issues</b> like heat waves, and praised the show’s legacy of addressing social issues.</li>
        <li className="definition-item"><b>Highlighted real-world medical techniques</b> – such as <em>“using body bags and filling them with ice”</em> to cool patients – as especially memorable. One mother, for instance, shared that she now knows to quickly cool down her overheated two-year-old by placing him in a cold bath—an insight she credited to what she saw on screen.</li>
      </ul>
      <p>It is important to acknowledge the areas where attitudes remained unchanged. The episode alone did not move most measures related to climate change broadly, like the perceived personal impacts of <b>climate change</b> (as opposed to the impacts of <b>severe heat waves</b>). This lack of movement is perhaps unsurprising, given that the episode did not explicitly reference climate change and the larger issue may not have been top of mind for viewers. Additionally, we did not find any significant effects on perceptions of healthcare workers’ responsibility to raise awareness about heat-related health risks.</p>
      <p>Nevertheless, these findings demonstrate the powerful potential of entertainment to both engage and educate, making complex public health and environmental issues feel immediate and personal. These findings also examine the added benefits (and potential risks) of complementary multiplatform campaigns that can more explicitly link climate change to human health and extreme weather events. As the climate crisis deepens, integrating accurate, emotionally-resonant stories into popular film, TV, and social media may be one of the most impactful tools for life-saving public awareness and action. In fact, audiences agree…</p>

      <h2>Audience Opinions on The Role of Film and TV in Addressing Social Issues</h2>
      <p>In conversation with viewers, we found strong support for film and television engaging with real-world social issues—provided it’s done without overt preaching. One interviewee praised the show, and particularly creator Shonda Rhimes and her team, for their legacy of tackling topical issues. She said the show <em>“does the world a service by… incorporating real-life national issues into the storyline.”</em></p>
      
      <p>Another viewer noted, <em>“it just makes it more fun to watch because … it feels like a real universe, not just like a TV show.”</em> Others appreciated how addressing such topics can heighten entertainment value by allowing viewers to <em>“connect with something that’s real.”</em></p>
      
      <p>Several conversations suggested that strong storytelling and compelling narratives can bridge political divides. As one viewer put it: <em>“I do think that talking about social issues is great, and especially in the form of a TV show, where it’s not like necessarily being shoved down your face like, ‘Vote for this person because of this’…I think it kind of opens people’s minds a little bit, and makes them think like, ‘Oh, could that be me? Could that be my daughter… my grandson, my granddaughter?’”</em></p>
      
      <p>One participant also emphasized the potential for television to spark meaningful discussions, noting that certain shows can <em>“get the conversation rolling”</em> about topics like climate change. In her experience, such conversations often start casually, with a simple, <b><em>“Did you see that on TV?”</em></b></p>



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
