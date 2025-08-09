import KnowledgeAccuracyChart from '../charts/3.4-KnowledgeAccuracyChart'
// import KnowledgeHorizontalChart from '../charts/3.4-KnowledgeHorizontalChart'
import PolicySupportChart from '../charts/3.5-PolicySupportChart'
import ClimateTemporalChart from '../charts/3.6-ClimateTemporalChart'
// import ClimateBeliefChangeChart from '../charts/ClimateBeliefChangeChart'
// import AMEChart from './AMEChart'
import AMEChart1 from '../charts/3.1-AMEChart1'
import AMEChart2 from '../charts/3.2-AMEChart2'
import AMEChart3 from '../charts/3.3-AMEChart3'

function KeyFindings() {
  return (
    <section className="report-section">
      <h1>
        Key Findings
      </h1>
      <p>
        Overall, the heat wave episode of <i>Grey's Anatomy</i> effectively increased viewer understanding of heat-related health risks, heightened concern about the impacts of extreme heat, and boosted support for heat-adaptive policies. Notably, through interviews with viewers, we found that these impacts occurred without diminishing the show's entertainment value. For most (but not all) of the measures, the combination of the episode and the social media videos produced the strongest and most lasting effects.
      </p>
      {/* <h3>
        [Option 1 of Key Findings]
      </h3> */}
      {/* <AMEChart /> */}
      {/* <h3>
        [Option 2 of Key Findings]
      </h3> */}


      <h2>Perception and Knowledge of Heat Waves</h2>
      <h3>Perceived Likelihood of Heat Wave Exposure</h3>
      <p>In our survey, we asked viewers: "How likely is it that you, your family, or your community will be seriously impacted by at least one severe heat wave this summer?"</p>
      <p>Participants in the multiplatform condition were significantly more likely to believe that they would be personally impacted by a heat wave this summer, with gains evident immediately after viewing and perceptions remaining elevated even 15-20 days later. The heat wave episode condition showed a modest, marginal increase in perceived likelihood, but those effects faded over time.</p>
      <p>Our one-on-one interviews confirmed how viewing the heat wave episode can influence perception of heat wave likelihood. One viewer remarked, "Wow…This is going to be more common, you know, every single year… There are going to be more heat waves in places that are not prepared or not used to heat waves."</p>
      <h3>Perceived Threat Severity of Heat Waves</h3>
      <p>Both the heat wave episode and the multiplatform conditions significantly increased perceived threat severity—boosting concern about harm to personal well-being, family, and community. Viewing the content also increased the self-reported likelihood that they would take extra safety precautions and would check-in on vulnerable individuals. The multiplatform condition produced the strongest effects immediately after viewing.</p>
      <p>In our interviews, one regular Grey's Anatomy viewer, a 33-year old female from Arizona, remarked: "<em>I would personally show [the episode] to my own parents. I feel like there's times where they just don't realize, and they'll…stand outside and water their plants and … they don't realize how much time they're spending outside. No protection, like nothing.</em>"</p>
      <h3>Perceived Threat of Heat Waves on Health</h3>
      <p>Viewers who watched the episode—especially those in the multiplatform condition—expressed significantly greater concern about the health impacts of heat waves. This included increased worry about risks to their own health and that of loved ones, as well as heightened awareness of how extreme heat can strain local hospital systems. These effects persisted even 15-20 days after viewing, suggesting that both the episode alone and the multiplatform campaign fostered lasting awareness that could support better preparedness and protective behaviors during future heat waves.</p>
      <p>One interviewee remarked that the episode was "<em>a reminder to me how serious the heat is, and how it is deadly, and to not underestimate it, to be prepared....</em>" She further elaborated, "<em>It makes you realize like, hey, I could very well be in that situation, and I shouldn't play around with it and always be prepared.</em>"</p>
      <p>Another, inspired by the episode, said that she would "<em>call my family, making sure I check in on them, and when it's super hot outside, and tell them to look out for the different health risks that are being discussed [in the episode].</em>"</p>
      <AMEChart1 />
      <h3>Knowledge of Heat Wave Health Impacts</h3>
      <p>The heat wave episode boosted viewer understanding of the serious health risks associated with extreme heat – including the risk of organ failure, heart attacks among the vulnerable, premature labor in pregnant women, and increased violent crime, all of which were highlighted in the episode. The knowledge boosts were primarily driven by viewing the episode - with minimal additional gain resulting from viewing the additional social media content (multiplatform group). Excitingly, the boost in knowledge persisted even 15-20 days after viewing the episode, suggesting that the storyline had a lasting impact on people's knowledge about the severe health risks associated with heat waves.</p>
      <p>In our interviews, one viewer found that the episode helped her understand that individuals "<em>prone to heart problems</em>" require more "<em>heat protection</em>" during hot weather. Only after viewing the episode did she fully connect how extreme heat could produce severe health consequences like "<em>heart attacks, organ failure... all of these things.</em>"</p>

      <KnowledgeAccuracyChart />
      {/* <KnowledgeHorizontalChart /> */}

      <h2>
        Policy Support and Healthcare Worker Responsibility
      </h2>
      <h3>Policy Support by Political Affiliation</h3>
      <p>
        The heat wave episode increased viewer support for heat-adaptive policies, such as investments in hospital infrastructure and the expansion of public cooling centers – but the effects varied markedly by political affiliation.
        Among Democratic viewers, baseline support for these policies was already high (81–82%), leaving little room for movement with the episode alone. However, when paired with supplemental social media videos in the multiplatform condition, support rose modestly to 83–84%, suggesting that explicit messaging linking climate science and policy solutions reinforced attitudes for an already receptive audience.</p>

      <p>Republican viewers began with much lower baseline support (52–55%) but showed the strongest response to the episode alone. Support increased by 10 percentage points to 63%, a shift that remained statistically significant even two weeks later – indicating that the episode’s focus on hospital strain and public health challenges during extreme heat resonated with this audience. </p>

      <p>However, this effect was not sustained in the multiplatform condition. While Republican viewers in the combined multiplatform group initially showed a similar boost, those gains faded by the two-week follow-up – and in some cases, support dropped below baseline. This suggests that the explicit framing provided in the supplemental videos may have inadvertently triggered resistance or disengagement. While anecdotal, interviews with some Republican viewers suggested that the specific use of the phrase "<em>climate change</em>" in at least one of the social media videos was perceived as unwelcomed or polarizing. One interviewee, a self-identified conservative, said "<em>the moment that she [the content creator in the social media video] said, quote climate change end quote...I instantly almost discard it as being a political message.</em>" He elaborated that "<em>climate change has become sadly too political... it's been so muddied by politics that people aren't hearing each other anymore.</em>" He felt the inclusion of "<em>climate change</em>" in a statement is "<em>instantly assigning blame to the occurrences</em>" and causes the conversation to go "<em>in a whole different direction.</em>" Meanwhile, he felt the episode (which does not use the term "<em>climate change</em>") maintained a "<em>balance of entertainment and message.</em>" He was "<em>entirely entertained</em>" and "<em>wasn't focused on 'Hey, there's a message being given to me here,' which is a good thing.</em>"</p>
      <p>The unusual pattern here shows no disengagement or reactance immediately after viewing (where presumably, the effect of the episode is at its maximum and therefore softening any sort of adverse reaction to the social media videos), followed by an apparent backlash 15-20 days later. However, since this was an exploratory analysis in our pre-registration, we would recommend caution when interpreting these results.

      </p>
      <PolicySupportChart />
      <p>Different audiences require different approaches – especially when designing supplemental or impact-driven social media content. While Democratic viewers may have needed explicit climate change and health connections to boost policy support, Republican viewers were moved by emotionally grounded, human-centered storytelling. In our interviews with participants, we found support for this hypothesis. Republican interviewees consistently preferred social media content that delivered the message with an entertainment-forward lens, while finding direct-to-camera appeals to be "<em>preachy.</em>" </p>

      <h3>Healthcare Worker Responsibility</h3>
      <p>
        No significant effects were observed on perceptions of healthcare worker responsibility—either toward the public or policymakers—suggesting that the episode did not influence viewers' expectations about the role of medical professionals in addressing climate-health issues.
      </p>
      <AMEChart2 />
      <h2>
        Climate Change Connections
      </h2>
      <h3>Climate Change Impacts and Support for Climate Action</h3>
      <p>
        Participants in the multiplatform group were more likely to attribute heat waves to climate change. They also perceived greater concern about climate change among others. This matters because people often underestimate the climate concern of <a href="https://www.nature.com/articles/s41467-022-32412-y" target="_blank" rel="noopener noreferrer">those around them</a>, a form of "pluralistic ignorance" (i.e. ignorance about how commonly shared a belief is). Research consistently shows that pluralistic ignorance can discourage individual action or reduce support for climate policies.
      </p>
      <p>These climate attribution effects were stronger in the multiplatform condition than with the episode alone and remained statistically significant 15-20 days later, suggesting that the supplemental social media videos effectively reinforced connections between the episode’s heat wave storyline and broader climate science.
      </p>
      <p>
        The multiplatform condition also increased support for climate action, particularly in normative beliefs ("<em>Do you think that people should take action to address climate change because it is the right thing to do?</em>”) and self-reported intention to take some action to address climate change in the next 12 months. These effects were modest but consistent.
      </p>

      <AMEChart3 />
      <h3>Climate Change Temporal Proximity</h3>
      <p>Participants in the multiplatform group were also more likely to believe that the impacts of climate change would affect their daily lives more imminently – over a year sooner when surveyed immediately after viewing. While we did see similar effects for the episode-only group immediately after viewing the episode, those effects did not persist when measured 15-20 days later.</p>
      <ClimateTemporalChart />
      <p>It’s important to note that the episode itself did not reference climate change. Given this, it is not surprising that the episode alone did not significantly increase climate attribution for heat waves or shift broader climate-related beliefs.</p>
      {/* <ClimateBeliefChangeChart /> */}

      <h2>
        Impact of the Social Media Campaign on Episode's Entertainment Value
      </h2>
      <p>
        Critically, there was no significant difference between the heat wave episode only and multiplatform groups in participants' reported likelihood of recommending <i>Grey's Anatomy</i> after viewing the episode. The addition of impact-focused social media content did not reduce or enhance entertainment value, demonstrating that these campaigns can be added without compromising the viewing experience.
      </p>





      {/* Supplementary Materials Section */}
      <h1>Supplementary Materials</h1>
      <div className="supplementary-materials-buttons">
        <button
          className="btn btn-secondary btn-md"
          onClick={() => window.open(`${import.meta.env.BASE_URL}html/analysis_report.html`, '_blank', 'noopener,noreferrer')}
        >
          Primary and Supplementary Analyses
        </button>
        <button
          className="btn btn-secondary btn-md"
          onClick={() => window.open(`${import.meta.env.BASE_URL}html/ate_ame_comparison.html`, '_blank', 'noopener,noreferrer')}
        >
          ATE vs. AME Model Comparison
        </button>
        <button
          className="btn btn-secondary btn-md"
          onClick={() => window.open(`${import.meta.env.BASE_URL}html/survey-instrument.html`, '_blank', 'noopener,noreferrer')}
        >
          Full Survey Instrument
        </button>
        <button
          className="btn btn-secondary btn-md"
          onClick={() => window.open('https://osf.io/uv9x3', '_blank', 'noopener,noreferrer')}
        >
          OSF Preregistration
        </button>
        <button
          className="btn btn-secondary btn-md"
          onClick={() => window.open(`${import.meta.env.BASE_URL}html/demographic_summary.html`, '_blank', 'noopener,noreferrer')}
        >
          Summary of Demographic Data
        </button>
      </div>

    </section>
  )
}

export default KeyFindings
