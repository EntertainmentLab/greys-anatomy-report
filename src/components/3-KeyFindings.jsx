import KnowledgeAccuracyChart from './3.1-KnowledgeAccuracyChart'
import HealthWorryChart from './3.2-HealthWorryChart'
import SystemImpactsChart from './3.3-SystemImpactsChart'
import PolicySupportChart from './3.4-PolicySupportChart'
import ClimateTemporalChart from './3.5-ClimateTemporalChart'

function KeyFindings() {
  return (
    <section className="report-section">
      <h2>
        Key Findings
      </h2>
      <p>
        Overall, the heatwave episode of Grey's Anatomy effectively educated viewers about heat-related health risks and significantly increased concern about heatwave impacts, with the handoff condition (episode + Instagram videos) showing the strongest and most sustained effects. Importantly, these impacts occurred without compromising entertainment value.
      </p>

      <h3>
        Knowledge of Heatwave Health Impacts
      </h3>
      <p>
        The heatwave episode effectively educated viewers about the serious health risks associated with extreme heat, particularly that it can trigger premature labor in pregnant women—a medical fact introduced early in the episode. While the handoff condition produced comparable or marginally stronger outcomes, the differences between the treatment and handoff groups were minimal and largely statistically nonsignificant. This educational boost persisted 15 days after viewing, demonstrating that the knowledge gained has lasting impact.
      </p>

      <KnowledgeAccuracyChart />


      <h3>
        Perceived Threat and Personal Concern
      </h3>
      <p>
        Participants who watched the episode (particularly those in the handoff condition) demonstrated significantly greater concern about the health consequences of heatwaves, including increased worry about potential effects on their own health and that of their loved ones, as well as greater awareness of how extreme heat events could strain their local hospital systems. This heightened awareness and concern remained 15 days later, suggesting that the episode created lasting changes that could translate into better preparedness and protective actions during future heatwave events.
      </p>
      <HealthWorryChart />
      <SystemImpactsChart />



      <h3>
        Policy Support
      </h3>
      <p>
        The heatwave episode effectively increased viewer support for heat-adaptive policies, including hospital infrastructure investments and public cooling centers. However, the effects varied dramatically depending on political party affiliation, revealing important insights about targeted messaging strategies.
        Republican viewers responded strongly to the treatment episode alone, showing substantial immediate increases in policy support that remained significant two weeks later. This suggests that the narrative content itself—depicting healthcare system strain during extreme heat—resonated powerfully with this audience without requiring additional context. Democratic viewers, by contrast, showed little response to the episode alone but demonstrated much stronger policy support when exposed to the supplemental Instagram videos in the handoff condition. This pattern indicates that explicit connections to climate science and policy solutions enhanced persuasive impact for this group. Most notably, the handoff condition produced backlash among Republican viewers. While the supplemental videos enhanced Democratic support, they actually undermined the positive effects observed among Republicans in the treatment-only condition. This backlash suggests that the climate-focused messaging in the Instagram videos may have triggered partisan resistance, reducing the episode's otherwise persuasive impact.
        These findings underscore the complexity of cross-partisan climate communication and highlight the critical need for audience-tailored approaches to supplemental impact media. What enhances persuasion for one group may inadvertently diminish it for another, particularly when bridging entertainment content to politically charged topics like climate change.
      </p>
      <PolicySupportChart />




      <h3>
        Climate Change Connections
      </h3>
      <p>
        Participants in the handoff group were more likely to attribute heatwaves to climate change and believed the impacts of climate change would affect their daily lives sooner (over 1 year sooner in Wave 2). They were also more likely to believe others are concerned about climate change. These climate attribution effects were stronger in the handoff condition than in treatment alone and remained significant 15 days later, indicating that the supplemental Instagram videos successfully connected the episode's narrative to broader climate science.
      </p>
      <ClimateTemporalChart />


      <h3>
        Additional Effects
      </h3>
      <div className="additional-effects">
        <b>Climate Action Support:</b> The handoff condition significantly increased support for climate action, particularly in normative beliefs and intent to act. These effects were modest but consistent.
        <br />
        <b>Perceived Likelihood of Heatwave Exposure:</b> The handoff condition significantly increased perceived risk of experiencing a severe heatwave, compared to both control and treatment conditions. The treatment-only group saw a modest, marginal increase.
        <br />
        <b>Perceived Heatwave Threat Severity:</b> Both treatment and handoff conditions significantly increased perceived threat severity, including greater concern over potential harm and increased behavioral intentions. The handoff condition yielded the largest effects.

      </div>

      <h3>
        Entertainment Value
      </h3>
      <p>
        Critically, there was no significant difference between the treatment and handoff groups in participants' reported likelihood of recommending Grey's Anatomy after viewing the episode. The addition of impact-focused Instagram content did not reduce or enhance entertainment value, demonstrating that educational supplements can be added without compromising the viewing experience.

      </p>

      <h3>
        Healthcare Worker Responsiblity
      </h3>
      <p>
        No significant effects were observed on perceptions of healthcare worker responsibility—either toward the public or policymakers—suggesting that the episode did not influence viewers' expectations about the role of medical professionals in addressing climate-health issues.

      </p>

      {/* Supplementary Materials Section */}
      <h3>Supplementary Materials</h3>
      <ul>
        <li>
          <a
            href={`${import.meta.env.BASE_URL}analysis-report.html`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Primary and Supplementary Analyses
          </a>
        </li>
        <li>
          <a
            href={`${import.meta.env.BASE_URL}ate_ame_comparison.html`}
            target="_blank"
            rel="noopener noreferrer"
          >
            ATE vs. AME Model Comparison
          </a>
        </li>
      </ul>

    </section>
  )
}

export default KeyFindings
