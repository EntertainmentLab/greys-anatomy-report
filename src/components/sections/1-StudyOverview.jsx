import EpisodePreview from '../infographics/2.2-EpisodePreview';
import AMEChartsCarousel from '../charts/1.2-AMEChartsCarousel';
import { useState } from 'react';

function StudyOverview() {
  const [showEpisodePreview, setShowEpisodePreview] = useState(false);

  return (
    <section className="report-section">
      <h2>
        Study Overview
      </h2>
      <p>
        Television medical dramas have long mirrored the realities of our everyday lives. As the climate crisis increasingly threatens public health and strains our healthcare systems, these shows – where medicine, science, and human emotion converge – may offer more than just compelling stories. Can they help audiences see climate change not as a distant, abstract issue, but as a pressing, personal one? And can they deliver potentially life-saving information in a warming world?
      </p>
      <p>
        To explore how entertainment can shape public understanding of climate-related health risks, Rare’s Entertainment Lab conducted a study measuring the impact of an extreme heat storyline in the long-running cultural landmark Grey's Anatomy.
      </p>
      <p>
        In the Season 21 episode <button
          className="episode-preview-trigger"
          onClick={() => setShowEpisodePreview(true)}
        >
          "Drop it Like it's Hot"
        </button>, the staff at Grey Sloan Memorial Hospital respond to a record-breaking heat wave. Though the episode never explicitly mentions climate change, it vividly portrays the cascading consequences of extreme heat, like power outages, overwhelmed emergency services, and difficult decisions in triage. This allowed us to test whether a dramatic medical storyline could affect attitudes and beliefs about heat waves, their public health risks, and climate change more broadly.
      </p>
      <p>
        In addition to evaluating the episode on its own, the study also tested the added impact of a complementary social media campaign. Half of the participants who viewed the episode were randomly assigned to watch one of four short-form social media videos immediately afterward. These videos, produced independently by an organization during the show's original airing, explicitly linked the events of the episode to climate science and calls to action for health system resilience.
      </p>
      <p>The results were clear: the episode effectively raised awareness about heat-related health risks and significantly increased concern about the impacts of extreme heat. The episode boosted:</p>

      <ul>
        <li className="definition-item"><b>Perceived likelihood of heat wave exposure</b>, or how likely viewers think they or their community will experience a severe heatwave this summer</li>
        <li className="definition-item"><b>Perceived threat severity</b>, or how worried viewers are about severity of heatwaves, and the amount of harm they might cause</li>
        <li className="definition-item"><b>Perceived threat to health</b>, or how worried viewers are about how severe heat waves can impact their health</li>
        <li className="definition-item"><b>Knowledge</b> about the specific health impacts of exposure to extreme heat</li>
        <li className="definition-item"><b>Support</b> for heat-adaptive policies, such as investments in hospital infrastructure and the expansion of public cooling centers</li>
      </ul>

      <p>The strongest and most lasting effects were observed among participants who saw both the episode and the follow-up social media videos. Additionally, this combined condition boosted:</p>
      <ul>
        <li className="definition-item"><b>Perceived personal impacts of climate change</b>, including the belief that climate change will have a significant impact on daily life</li>
        <li className="definition-item"><b>Support</b> for action on climate change broadly </li>
      </ul>
      <p>Excitingly, we found that many of the positive shifts in audience attitudes persisted even two weeks after viewing the episode – providing empirical evidence of short-to-mid term impact.</p>
      
      <AMEChartsCarousel />
      
      <p>Notably, through a series of qualitative interviews with audiences, we found that these gains came without sacrificing entertainment value. Throughout these interviews, viewers:</p>
      <ul>
        <li><b>Connected the on-screen heatwave to their personal experiences</b> with extreme heat and its serious health impacts within their own families.</li>
        <li><b>Commended the show for depicting real-world issues</b> like heatwaves, and praised the show’s legacy of addressing social issues. One interviewee remarked, “The show does the world a service by… incorporating real-life national issues into the storyline.”</li>
        <li><b>Pointed to real-world medical techniques as some of the most memorable scenes</b>. This included “using body bags and filling them with ice” to help cool people down during the heat wave. This visual moment, in particular, underscored to participants the severity of extreme weather.</li>
      </ul>
      <p>It is important to acknowledge the areas where attitudes remained unchanged. We did not find any significant effects on measures like the perceived responsibility of healthcare workers to bring the health effects of severe heat waves to the attention of the public or policymakers. Additionally, the episode alone did not move certain measures related specifically to climate change, like the perceived personal impacts of climate change. This lack of movement is perhaps unsurprising, given that the episode did not explicitly reference climate change and the broader issue may not have been top of mind for viewers.</p>
      <p>Nevertheless, these findings demonstrate the powerful potential of entertainment to both engage and educate, making complex public health and environmental issues feel immediate and personal. As the climate crisis deepens, integrating accurate, emotionally resonant storylines into popular film and TV may be one of our most underused—and impactful—tools for life-saving public awareness and action.</p>
      <EpisodePreview
        isOpen={showEpisodePreview}
        onClose={() => setShowEpisodePreview(false)}
        episode="hot"
      />
    </section>
  )
}

export default StudyOverview
