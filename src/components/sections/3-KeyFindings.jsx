import KnowledgeAccuracyChart from '../charts/3.4-KnowledgeAccuracyChart'
import PolicySupportChart from '../charts/3.5-PolicySupportChart'
import ClimateTemporalChart from '../charts/3.6-ClimateTemporalChart'
// import ClimateBeliefChangeChart from '../charts/ClimateBeliefChangeChart'
// import AMEChart from './AMEChart'
import AMEChart1 from '../charts/3.1-AMEChart1'
import AMEChart2 from '../charts/3.2-AMEChart2'
import AMEChart3 from '../charts/3.3-AMEChart3'
// import AMEChartDumbbellSimple from './AMEChartDumbbellSimple'

function KeyFindings() {
  return (
    <section className="report-section">
      <h2>
        Key Findings
      </h2>
      <p>
        Overall, the heat wave episode of Grey’s Anatomy effectively increased viewer understanding of heat-related health risks and heightened concern about the impacts of extreme heat. The combination of the episode and the social media videos produced the strongest and most lasting effects. Notably, these impacts occurred without diminishing the show's entertainment value.
      </p>
      {/* <h3>
        [Option 1 of Key Findings]
      </h3> */}
      {/* <AMEChart /> */}
      {/* <h3>
        [Option 2 of Key Findings]
      </h3> */}
      <AMEChart1 />
      <AMEChart2 />
      {/* <h3>
        [Option 3 of Key Findings]
      </h3>
      <AMEChartDumbbellSimple /> */}
      <h3>
        Knowledge of Heat Wave Health Impacts
      </h3>
      <p>
        The heat wave episode boosted viewer understanding of the serious health risks associated with extreme heat – particularly the risk of triggering premature labor in pregnant women, a fact introduced early in the storyline. While the multiplatform condition produced outcomes that were comparable or slightly stronger, differences between the two groups were minimal and largely not statistically significant. Excitingly, the knowledge gains persisted 15 days after viewing, indicating that the knowledge gained had lasting impact.
      </p>

      <KnowledgeAccuracyChart />


      <h3>
        Perceived Threat and Personal Concern
      </h3>
      <p>
        Participants who watched the episode (particularly those in the multiplatform condition) demonstrated significantly greater concern about the health consequences of heat waves, including increased worry about potential effects on their own health and that of their loved ones, along with greater awareness of how extreme heat can overwhelm their local hospital systems. This heightened awareness and concern remained 15 days after viewing, suggesting that the episode created lasting changes that could translate into better preparedness and protective actions during future heat waves.
      </p>



      <h3>
        Policy Support
      </h3>
      <p>
        The heat wave episode increased viewer support for heat-adaptive policies, such as investments in hospital infrastructure and the expansion of public cooling centers – but the effects varied markedly by political affiliation.
        Among Democratic viewers, baseline support for these policies was already high (81–82%), leaving little room for movement with the episode alone. However, when paired with supplemental social media videos in the multiplatform condition, support rose modestly to 83–84%, suggesting that explicit messaging linking climate science and policy solutions reinforced attitudes within an already receptive audience.</p>

      <p>Republican viewers began with much lower baseline support (52–55%) but showed the strongest response to the episode alone. Support increased by 10 percentage points to 63%, a shift that remained statistically significant even two weeks later – indicating that the episode’s focus on hospital strain and public health challenges during extreme heat resonated with this audience. </p>

      <p>However, this effect was not sustained in the multiplatform condition. While Republican viewers in the combined multiplatform group initially showed a similar boost, those gains faded by the two-week follow-up – and in some cases, support dropped below baseline. This suggests that the explicit framing provided in the supplemental videos may have inadvertently triggered resistance or disengagement. This may have been driven by the fact that all of the social media videos were heavily “Democrat coded.” The unusual pattern here shows no backlash immediately after viewing (where presumably, the effect of the episode is at its maximum), followed by an apparent backlash 15-20 days later. However, since this was an exploratory analysis in our pre-registration, we would recommend caution when interpreting these results.

      </p>
      <PolicySupportChart />
      <p>Different audiences require different approaches – especially when designing supplemental or impact-driven social media content. While Democratic viewers may have needed explicit climate change and health connections to change their policy views, Republican viewers were more influenced by emotionally grounded, human-centered storytelling. These findings highlight the limitations of one-size-fits-all strategies, but they also underscore the unique potential of audience-tailored messaging in strategic, multiplatform media campaigns that bring together film and TV with social media. </p>
      <h3>
        Climate Change Connections
      </h3>
      <p>
        Participants in the multiplatform group were more likely to attribute heat waves to climate change. They also perceived greater concern about climate change among others. These attribution effects were stronger in the multiplatform condition than with the episode alone and remained statistically significant 15 days later, suggesting that the supplemental social media videos effectively reinforced connections between the episode’s storyline and broader climate science.

      </p>

      <AMEChart3 />
      <p>Participants in the multiplatform group  were also more like to believe that the impacts of climate change would affect their daily lives more imminently – over a year sooner when surveyed immediately after viewing. While we did see similar effects immediately after viewing the episode, those effects did not persist for the episode-only group.</p>
      <ClimateTemporalChart />
      It’s important to note that the episode itself did not reference climate change. Given this, it is not surprising that the episode alone did not significantly increase climate attribution for heat waves or shift broader climate-related beliefs.
      {/* <ClimateBeliefChangeChart /> */}


      <h3>
        Additional Effects
      </h3>
      <div className="additional-effects">
        <b>Climate Action Support:</b> The multiplatform condition significantly increased support for climate action, particularly in normative beliefs and intent to act. These effects were modest but consistent.
        <br />
        <b>Perceived Likelihood of Heat Wave Exposure:</b> The multiplatform condition significantly increased perceived risk of experiencing a severe heat wave, compared to both control and episode only conditions. The treatment-only group saw a modest, marginal increase.
        <br />
        <b>Perceived Heat Wave Threat Severity:</b> Both the heat wave episode and multiplatform conditions significantly increased perceived threat severity, including greater concern over potential harm and increased behavioral intentions. The multiplatform condition yielded the largest effects.


      </div>

      <h3>
        Entertainment Value
      </h3>
      <p>
        Critically, there was no significant difference between the heat wave episode only and multiplatform groups in participants' reported likelihood of recommending Grey's Anatomy after viewing the episode. The addition of impact-focused Instagram content did not reduce or enhance entertainment value, demonstrating that these campaigns can be added without compromising the viewing experience.


      </p>

      <h3>
        Healthcare Worker Responsiblity
      </h3>
      <p>
        No significant effects were observed on perceptions of healthcare worker responsibility—either toward the public or policymakers—suggesting that the episode did not influence viewers' expectations about the role of medical professionals in addressing climate-health issues.

      </p>

      {/* Supplementary Materials Section */}
      <h3>Supplementary Materials</h3>
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
      </div>

    </section>
  )
}

export default KeyFindings
