import KnowledgeAccuracyChart from './3.1-KnowledgeAccuracyChart'
import HealthWorryChart from './3.2-HealthWorryChart'
import SystemImpactsChart from './3.3-SystemImpactsChart'
import PolicySupportChart from './3.4-PolicySupportChart'
import ClimateTemporalChart from './3.5-ClimateTemporalChart'
import HeatwaveKnowledgeChart from './rechartsknowledgebars'

function KeyFindings() {
  return (
    <section className="report-section">
      <h2>
        Key Findings
      </h2>
      <p>
        Overall, the heat wave episode of Grey's Anatomy effectively educated viewers about heat-related health risks and significantly increased concern about heat wave impacts, with the handoff condition (episode + Instagram videos) showing the strongest and most sustained effects. Importantly, these impacts occurred without compromising entertainment value.
      </p>

      <h3>
        Knowledge of Heat Wave Health Impacts
      </h3>
      <p>
        The heat wave episode effectively educated viewers about the serious health risks associated with extreme heat, particularly that it can trigger premature labor in pregnant women—a medical fact introduced early in the episode. While the handoff condition produced comparable or marginally stronger outcomes, the differences between the treatment and handoff groups were minimal and largely statistically nonsignificant. This educational boost persisted 15 days after viewing, demonstrating that the knowledge gained has lasting impact.
      </p>

      <KnowledgeAccuracyChart />
      <HeatwaveKnowledgeChart />

      <h3>
        Perceived Threat and Personal Concern
      </h3>
      <p>
        Participants who watched the episode (particularly those in the handoff condition) demonstrated significantly greater concern about the health consequences of heat waves, including increased worry about potential effects on their own health and that of their loved ones, as well as greater awareness of how extreme heat events could strain their local hospital systems. This heightened awareness and concern remained 15 days later, suggesting that the episode created lasting changes that could translate into better preparedness and protective actions during future heat wave events.
      </p>
      <HealthWorryChart />
      <SystemImpactsChart />



      <h3>
        Policy Support
      </h3>
      <p>
        The heat wave episode effectively increased viewer support for heat-adaptive policies, including hospital infrastructure investments and public cooling centers, though the effects varied dramatically by political party affiliation. Democratic viewers already showed high baseline support for these policies (81-82%), and the episode alone produced little additional change. However, when paired with supplemental Instagram videos in the handoff condition, Democratic support increased further to 83-84%, suggesting that explicit connections to climate science and policy solutions enhanced persuasive impact for this already-sympathetic audience.
        Republican viewers, starting from much lower baseline support (52-55%), showed the strongest response to the treatment episode alone, with support increasing by 10 percentage points that remained significant two weeks later. This suggests that the narrative content itself—depicting healthcare system strain during extreme heat—resonated powerfully with this audience segment without requiring additional context. However, the handoff condition produced backlash among Republican viewers. While the heat wave episode alone generated sustained increases in support (63% immediately, maintaining significance at follow-up), the added Instagram video in the handoff condition undermined these gains. Republican viewers in the handoff condition showed initial increases similar to the treatment-only group, but these effects dissipated by the two-week follow-up, with some measures actually falling below baseline levels. While the supplemental videos enhanced Democratic support, they actually undermined the positive effects observed among Republicans in the treatment-only condition.
        Different audiences require different approaches—Republicans responded to the human story of healthcare system strain, while Democrats needed explicit climate change and health connections to change their policy views. The backlash effect highlights the critical need for audience-tailored approaches to supplemental impact media. Rather than abandoning cross-partisan climate communication, these results suggest that strategic, audience-specific messaging can maximize persuasive impact while avoiding the pitfalls of one-size-fits-all approaches.


      </p>
      <PolicySupportChart />




      <h3>
        Climate Change Connections
      </h3>
      <p>
        Participants in the handoff group were more likely to attribute heat waves to climate change and believed the impacts of climate change would affect their daily lives sooner (over 1 year sooner in Wave 2). They were also more likely to believe others are concerned about climate change. These climate attribution effects were stronger in the handoff condition than in treatment alone and remained significant 15 days later, indicating that the supplemental Instagram videos successfully connected the episode's narrative to broader climate science.
      </p>
      <ClimateTemporalChart />


      <h3>
        Additional Effects
      </h3>
      <div className="additional-effects">
        <b>Climate Action Support:</b> The handoff condition significantly increased support for climate action, particularly in normative beliefs and intent to act. These effects were modest but consistent.
        <br />
        <b>Perceived Likelihood of Heat Wave Exposure:</b> The handoff condition significantly increased perceived risk of experiencing a severe heat wave, compared to both control and treatment conditions. The treatment-only group saw a modest, marginal increase.
        <br />
        <b>Perceived Heat Wave Threat Severity:</b> Both treatment and handoff conditions significantly increased perceived threat severity, including greater concern over potential harm and increased behavioral intentions. The handoff condition yielded the largest effects.

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
            href={`${import.meta.env.BASE_URL}analysis_report.html`}
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
