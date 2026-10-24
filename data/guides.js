// HAZWOPER guides. Rendered by tools/build.js into guides/<slug>/.
// Body is HTML. Link tokens are checked at build time:
//   {{course:slug}} or {{course:slug|link text}}   {{guide:slug|text}}   {{quiz:slug|text}}
// Every <h2> becomes a table-of-contents entry.
module.exports = [
  {
    slug: 'what-is-hazwoper',
    title: 'What Is HAZWOPER? The Complete Guide to OSHA 29 CFR 1910.120',
    short: 'What is HAZWOPER?',
    desc: 'What HAZWOPER means, who it covers, the 40, 24 and 8 hour training levels, emergency response, medical surveillance and how to get certified under OSHA 29 CFR 1910.120.',
    related: ['osha-40-hour-hazwoper-training', 'osha-24-hour-hazwoper-training', 'osha-8-hour-hazwoper-refresher-training'],
    quiz: 'hazwoper-40-hour-practice-test',
    body: `
<p><strong>HAZWOPER</strong> stands for <strong>Hazardous Waste Operations and Emergency Response</strong>. It is the OSHA standard at <strong>29 CFR 1910.120</strong> (repeated word for word for construction at 29 CFR 1926.65) that sets safety, health and training rules for people who clean up hazardous waste, work at hazardous waste treatment, storage and disposal facilities, or respond to releases of hazardous substances. OSHA published the final rule in 1989 under the Superfund Amendments and Reauthorization Act (SARA).</p>

<h2>Who HAZWOPER applies to</h2>
<p>Paragraph (a)(1) of the standard lists five groups of operations:</p>
<ol>
<li><strong>Government-required cleanups</strong> at uncontrolled hazardous waste sites, including EPA Superfund (CERCLA) sites and state priority sites.</li>
<li><strong>RCRA corrective actions</strong> at facilities regulated under the Resource Conservation and Recovery Act.</li>
<li><strong>Voluntary cleanups</strong> at sites recognized by a federal, state, local or other government body as uncontrolled hazardous waste sites.</li>
<li><strong>Operations at RCRA treatment, storage and disposal (TSD) facilities</strong> regulated under 40 CFR Parts 264 and 265.</li>
<li><strong>Emergency response</strong> to releases, or substantial threats of releases, of hazardous substances, wherever the hazard occurs.</li>
</ol>
<p>That last group is the one people miss. A chemical plant, warehouse, hospital, utility, refinery, fire department or water treatment plant that expects its employees to respond to a spill is covered by HAZWOPER's emergency response rules in paragraph (q), even though it never touches a cleanup site.</p>

<h2>HAZWOPER training levels</h2>
<p>Training hours depend on what the worker does and how much exposure they may have. The main levels are:</p>
<div class="table-wrap"><table>
<thead><tr><th>Level</th><th>Who</th><th>Initial training</th><th>Reference</th></tr></thead>
<tbody>
<tr><td>40 Hour</td><td>General site workers (laborers, equipment operators, remediation technicians) who may be exposed at or above permissible exposure limits</td><td>40 hours off site + 3 days supervised field experience</td><td>1910.120(e)(3)(i)</td></tr>
<tr><td>24 Hour</td><td>Occasional site workers, and workers in fully monitored areas below exposure limits who don't need respirators</td><td>24 hours off site + 1 day field experience</td><td>1910.120(e)(3)(ii)-(iii)</td></tr>
<tr><td>8 Hour Supervisor</td><td>On-site managers and supervisors</td><td>Their 40 or 24 hour training + 8 more hours</td><td>1910.120(e)(4)</td></tr>
<tr><td>8 Hour Refresher</td><td>Everyone trained at the 40 or 24 hour level</td><td>8 hours every year</td><td>1910.120(e)(8)</td></tr>
<tr><td>TSD Facility</td><td>Employees at RCRA treatment, storage and disposal facilities</td><td>24 hours + 8 hours each year</td><td>1910.120(p)(7)</td></tr>
<tr><td>Emergency response</td><td>Awareness, operations, technician, specialist, incident commander</td><td>Competency-based, from awareness to 24+ hours</td><td>1910.120(q)(6)</td></tr>
</tbody></table></div>
<p>Not sure which applies to you? Read {{guide:which-hazwoper-course-do-i-need|40 vs 24 vs 8 Hour HAZWOPER: which training do you need}}.</p>

<h2>What HAZWOPER training covers</h2>
<p>Under 1910.120(e)(2), initial training has to cover:</p>
<ul>
<li>The names of personnel and alternates responsible for site safety and health</li>
<li>Safety, health and other hazards present on the site</li>
<li>Use of personal protective equipment ({{guide:ppe-levels-a-b-c-d|PPE levels A, B, C and D}})</li>
<li>Work practices that minimize risk</li>
<li>Safe use of engineering controls and equipment on the site</li>
<li>Medical surveillance requirements, including recognition of symptoms and signs of overexposure</li>
<li>The contents of the site safety and health plan</li>
</ul>
<p>In practice, a 40-hour course also teaches toxicology and routes of exposure, {{guide:exposure-limits-pel-tlv-idlh|exposure limits}}, {{guide:air-monitoring|air monitoring}}, {{guide:site-control-work-zones|site control and work zones}}, {{guide:hazwoper-decontamination|decontamination}}, confined spaces, drum handling, spill containment and emergency procedures.</p>

<h2>The written programs HAZWOPER requires</h2>
<p>Training is only one part of the standard. Employers running cleanup operations also need:</p>
<ul>
<li>A written <strong>safety and health program</strong> (paragraph b) with an organizational structure, work plan and a {{guide:site-safety-and-health-plan|site-specific safety and health plan}}</li>
<li><strong>Site characterization and analysis</strong> before entry (c)</li>
<li><strong>Site control</strong>, including a site map, work zones and the buddy system (d)</li>
<li><strong>{{guide:hazwoper-medical-surveillance|Medical surveillance}}</strong> for workers exposed above limits, respirator users and HAZMAT team members (f)</li>
<li><strong>Engineering controls, work practices and PPE</strong> (g)</li>
<li><strong>Air monitoring</strong> (h)</li>
<li><strong>Decontamination</strong> procedures (k)</li>
<li>An <strong>emergency response plan</strong> (l for cleanup sites, q for other employers)</li>
</ul>

<h2>Emergency response under paragraph (q)</h2>
<p>Employers whose employees respond to hazardous substance releases need a written emergency response plan, an incident command system, and responders trained to the level of their duties. The five levels run from first responder awareness (people who discover a release and call it in) to on-scene incident commander. See {{guide:emergency-response-training-levels|HAZWOPER emergency response training levels}} for the hours and competencies each one needs.</p>

<h2>Is online HAZWOPER training valid?</h2>
<p>Yes, for the classroom portion. OSHA has said in interpretation letters that computer-based training can meet part of the requirement when it covers the required topics and trainees can reach a qualified trainer with questions. It does not replace the supervised field experience the 40 and 24 hour levels need, or hands-on practice with the PPE and equipment a worker will use. Employers stay responsible for site-specific training and field days.</p>

<h2>How to get started</h2>
<ol>
<li>Work out your training level from your duties and likely exposure.</li>
<li>Complete the online course and final exam. Your certificate and wallet card are available as soon as you pass.</li>
<li>Complete supervised field experience with your employer (40 and 24 hour levels).</li>
<li>Take the {{course:osha-8-hour-hazwoper-refresher-training|8 hour refresher}} every 12 months to stay current.</li>
</ol>
<p>Want to check what you know first? Take the free {{quiz:hazwoper-40-hour-practice-test|HAZWOPER practice test}}.</p>
`,
    faq: [
      ['What does HAZWOPER stand for?', 'HAZWOPER stands for Hazardous Waste Operations and Emergency Response, the OSHA standard at 29 CFR 1910.120 and 29 CFR 1926.65.'],
      ['Is HAZWOPER a certification or a license?', 'HAZWOPER is a training requirement, not a government license. After training, the trainer issues a written certificate (1910.120(e)(7)) showing the worker completed the required training. OSHA does not issue HAZWOPER cards itself.'],
      ['What is the difference between 1910.120 and 1926.65?', 'The text is identical. 29 CFR 1910.120 applies to general industry and 29 CFR 1926.65 applies to construction work, such as demolition or excavation on a hazardous waste site.'],
    ],
  },

  {
    slug: 'which-hazwoper-course-do-i-need',
    title: '40 vs 24 vs 8 Hour HAZWOPER: Which Training Do You Need?',
    short: '40 vs 24 vs 8 hour HAZWOPER',
    desc: 'Compare 40 hour, 24 hour and 8 hour HAZWOPER training. Who needs each level under OSHA 1910.120(e), field experience rules, supervisor training and how to upgrade from 24 to 40.',
    related: ['osha-40-hour-hazwoper-training', 'osha-24-hour-hazwoper-training', 'osha-8-hour-hazwoper-refresher-training', 'osha-8-hour-hazwoper-supervisor-training'],
    quiz: 'hazwoper-40-hour-practice-test',
    body: `
<p>The number of hours of HAZWOPER training you need depends on two things: <strong>what you do on site</strong> and <strong>how much exposure you may have</strong>. Here is how OSHA 29 CFR 1910.120(e)(3) sorts workers.</p>

<h2>40 hour HAZWOPER</h2>
<p>Required for <strong>general site workers</strong> at uncontrolled hazardous waste sites who are exposed, or may be exposed, to hazardous substances at or above permissible exposure limits, or who need respirators. Typical roles: laborers, heavy equipment operators, drillers, remediation technicians, sampling crews and environmental field staff.</p>
<ul><li>40 hours of instruction off the site</li><li>Plus at least <strong>3 days of actual field experience</strong> under a trained, experienced supervisor</li></ul>
<p>Industry versions cover the same 40 hours with scenarios from your field: {{course:osha-40-hour-hazwoper-for-construction-contaminated-sites|construction}}, {{course:osha-40-hour-hazwoper-for-environmental-remediation|environmental remediation}}, {{course:osha-40-hour-hazwoper-for-oil-and-gas-spill-response|oil and gas spill response}}, {{course:osha-40-hour-hazwoper-for-emergency-response-fire-hazmat-teams|fire and HAZMAT teams}} and {{course:osha-40-hour-hazwoper-for-utility-pipeline-emergency-response|utility and pipeline}}. It is also offered {{course:osha-40-hour-hazwoper-training-spanish|in Spanish}}.</p>

<h2>24 hour HAZWOPER</h2>
<p>Required for two groups:</p>
<ul>
<li><strong>Occasional site workers</strong> on site for a specific, limited task (for example, groundwater monitoring, land surveying or geophysical surveying) who are unlikely to be exposed above permissible exposure limits</li>
<li><strong>Workers regularly on site in areas that are monitored and fully characterized</strong>, where exposures are below permissible limits and respirators are not needed, and the characterization shows no health hazards or possibility of an emergency</li>
</ul>
<p>Plus at least <strong>1 day of field experience</strong> under a trained, experienced supervisor. Workers at RCRA TSD facilities also need 24 hours under 1910.120(p).</p>

<h2>Upgrading from 24 to 40 hours</h2>
<p>A 24-hour worker who becomes a general site worker, or who has to wear a respirator, needs the <strong>additional 16 hours and 2 days</strong> of training to reach the 40-hour level (1910.120(e)(3)(iv)). Many people take the full {{course:osha-40-hour-hazwoper-training|40 hour course}} so they are qualified for any site role from the start.</p>

<h2>8 hour refresher</h2>
<p>Everyone trained at the 40 or 24 hour level needs <strong>8 hours of refresher training every year</strong> (1910.120(e)(8)). The {{course:osha-8-hour-hazwoper-refresher-training|8 hour HAZWOPER refresher}} reviews core topics and covers relevant changes, recent incidents and lessons learned. Details: {{guide:hazwoper-refresher-requirements|HAZWOPER refresher requirements}}.</p>

<h2>8 hour supervisor</h2>
<p>On-site managers and supervisors directly responsible for, or who supervise, employees in hazardous waste operations need the same initial training as their workers <strong>plus at least 8 additional hours</strong> on managing the employer's safety and health program, PPE program, spill containment program and health hazard monitoring (1910.120(e)(4)). Take the {{course:osha-8-hour-hazwoper-supervisor-training|8 hour supervisor course}} once; the annual refresher still applies, and a {{course:osha-8-hour-hazwoper-supervisor-refresher-training|supervisor refresher}} is available.</p>

<h2>Quick decision table</h2>
<div class="table-wrap"><table>
<thead><tr><th>If you...</th><th>You need</th></tr></thead>
<tbody>
<tr><td>Work hands-on at a cleanup site with possible exposure above limits or respirator use</td><td>{{course:osha-40-hour-hazwoper-training|40 Hour}} + 3 field days</td></tr>
<tr><td>Visit a site occasionally for a limited task with low exposure</td><td>{{course:osha-24-hour-hazwoper-training|24 Hour}} + 1 field day</td></tr>
<tr><td>Work at a RCRA treatment, storage or disposal facility</td><td>{{course:osha-24-hour-hazwoper-rcra-tsd-operations-training|24 Hour RCRA TSD}}</td></tr>
<tr><td>Already have 40 or 24 hour training</td><td>{{course:osha-8-hour-hazwoper-refresher-training|8 Hour Refresher}} every year</td></tr>
<tr><td>Supervise hazardous waste operations</td><td>Initial training + {{course:osha-8-hour-hazwoper-supervisor-training|8 Hour Supervisor}}</td></tr>
<tr><td>May discover a release and must call it in</td><td>{{course:osha-4-hour-hazwoper-first-responder-awareness-level-training|First Responder Awareness}}</td></tr>
<tr><td>Work in California</td><td>{{course:cal-osha-40-hour-hazwoper-training|Cal/OSHA HAZWOPER}} (8 CCR 5192)</td></tr>
</tbody></table></div>
`,
    faq: [
      ['Can I take the 24 hour course instead of the 40 hour?', 'Only if your duties match 1910.120(e)(3)(ii) or (iii): occasional work for a limited task, or regular work in monitored, characterized areas below exposure limits without respirators. If you may be exposed above limits or wear a respirator, you need 40 hours.'],
      ['Does 40 hour HAZWOPER include the 24 hour?', 'Yes. Someone trained at the 40-hour level meets the 24-hour requirement as well. Both groups then take the same 8-hour annual refresher.'],
      ['Do I need the 3 days of field experience if I train online?', 'Yes. The field experience is separate from the 40 hours of instruction and must be completed on site under a trained, experienced supervisor, usually arranged by your employer.'],
    ],
  },

  {
    slug: 'hazwoper-refresher-requirements',
    title: 'HAZWOPER 8 Hour Refresher Requirements: Deadlines, Lapses and Records',
    short: 'HAZWOPER refresher requirements',
    desc: 'OSHA requires 8 hours of HAZWOPER refresher training every year under 1910.120(e)(8). When it is due, what happens if it lapses, what it covers, and the records employers keep.',
    related: ['osha-8-hour-hazwoper-refresher-training', 'osha-8-hour-hazwoper-supervisor-refresher-training', 'cal-osha-8-hour-hazwoper-refresher-training', '8-hour-hazwoper-refresher-state-plan-versions-available'],
    quiz: 'hazwoper-8-hour-refresher-practice-quiz',
    body: `
<p>Workers trained at the 40 or 24 hour HAZWOPER level must complete <strong>at least 8 hours of refresher training every year</strong>. The rule is 29 CFR 1910.120(e)(8) for cleanup sites and (p)(7)(ii) for TSD facilities. Emergency responders under paragraph (q)(8) need annual refresher training of enough content and length to keep their competencies, or must show their competency each year.</p>

<h2>When the refresher is due</h2>
<p>OSHA says "annually," which employers usually track as <strong>within 12 months of the last training date</strong>. Most companies set a recurring reminder from the date on the last certificate, and many schedule refreshers a month early to leave room for scheduling problems.</p>

<h2>What if my refresher lapses?</h2>
<p>OSHA does not set a fixed grace period. In interpretation letters it has said a worker who misses the anniversary should take the refresher as soon as possible, and that the employer decides whether the worker still has the knowledge and skills from initial training. A short lapse is usually fixed with the 8-hour refresher. After a long lapse, or if the worker's skills can't be shown to be current, the employer may require them to repeat the 40 or 24 hour course. Check your own company or client policy: many contractors won't badge anyone onto a site without a current refresher.</p>

<h2>What the refresher covers</h2>
<p>The 8 hours are meant to keep core skills sharp and pass on what has changed. Typical content:</p>
<ul>
<li>Hazard recognition and toxicology review</li>
<li>{{guide:ppe-levels-a-b-c-d|PPE selection}}, donning, doffing and respirator use</li>
<li>{{guide:air-monitoring|Air monitoring}} and instrument use</li>
<li>{{guide:hazwoper-decontamination|Decontamination}} and {{guide:site-control-work-zones|site control}}</li>
<li>Updates to the site safety and health plan and regulations</li>
<li>Critiques of recent incidents and lessons learned</li>
</ul>

<h2>Refresher options</h2>
<ul>
<li>{{course:osha-8-hour-hazwoper-refresher-training}}: the standard annual course for 40 and 24 hour workers</li>
<li>{{course:osha-8-hour-hazwoper-supervisor-refresher-training}}: refresher with supervisor-level content</li>
<li>{{course:8-hour-hazwoper-and-incident-command-refresher-training}}: combined refresher for incident command roles</li>
<li>{{course:osha-8-hour-hazwoper-annual-refresher-rcra-tsd-operations-training}}: for TSD facility employees</li>
<li>{{course:cal-osha-8-hour-hazwoper-refresher-training}} and {{course:8-hour-hazwoper-refresher-state-plan-versions-available|state-plan versions}}</li>
</ul>

<h2>Records to keep</h2>
<p>Under 1910.120(e)(7), employees who complete training get a <strong>written certificate</strong>. Keep each worker's initial certificate, every refresher certificate and documentation of field experience. Clients often ask for copies before site access, so keep the wallet card with you and a PDF on file.</p>
`,
    faq: [
      ['Is the HAZWOPER refresher required every year?', 'Yes. 29 CFR 1910.120(e)(8) requires 8 hours of refresher training annually for workers trained at the 40 or 24 hour level.'],
      ['Can I take the 8 hour refresher online?', 'Yes. Online refresher training is widely accepted when it covers the required content and learners can reach a qualified trainer for questions. Employers may add hands-on review of site-specific equipment.'],
      ['Does the refresher have to be 8 hours in one day?', 'No. OSHA requires 8 hours of training each year, not one continuous session. Self-paced online refreshers save your progress so you can complete it over several sittings.'],
    ],
  },

  {
    slug: 'hazwoper-certification',
    title: 'How to Get HAZWOPER Certified Online (and How Long It Lasts)',
    short: 'Getting HAZWOPER certified',
    desc: 'Step-by-step guide to HAZWOPER certification: choosing a level, online training, field experience, certificates and wallet cards, how long HAZWOPER certification lasts and how to verify it.',
    related: ['osha-40-hour-hazwoper-training', 'osha-24-hour-hazwoper-training', 'osha-8-hour-hazwoper-refresher-training'],
    quiz: 'hazwoper-40-hour-practice-test',
    body: `
<p>"HAZWOPER certified" means you have completed the training OSHA requires for your role under 29 CFR 1910.120 and received a written certificate from the training provider. Here is the process from start to finish.</p>

<h2>Step 1: Pick the right level</h2>
<p>Most people need the {{course:osha-40-hour-hazwoper-training|40 hour}} or {{course:osha-24-hour-hazwoper-training|24 hour}} course. Supervisors add the {{course:osha-8-hour-hazwoper-supervisor-training|8 hour supervisor}} course. Workers who only need to recognize a release and call it in can take {{course:osha-4-hour-hazwoper-first-responder-awareness-level-training|First Responder Awareness}}. See {{guide:which-hazwoper-course-do-i-need|which HAZWOPER course do I need}}.</p>

<h2>Step 2: Complete the online course</h2>
<p>Online courses are self-paced. Log in from any device, work through the modules and knowledge checks, and pick up where you left off. Most people finish the 40-hour course in one to two working weeks.</p>

<h2>Step 3: Pass the final exam</h2>
<p>Each course ends with a final exam on the material. Practise first with the free {{quiz:hazwoper-40-hour-practice-test|HAZWOPER practice test}}.</p>

<h2>Step 4: Download your certificate and wallet card</h2>
<p>As soon as you pass, you can download a printable certificate of completion and a wallet card. These are the written certification 1910.120(e)(7) requires. Keep the PDF and send copies to your employer or client.</p>

<h2>Step 5: Complete field experience</h2>
<p>The 40-hour level needs 3 days, and the 24-hour level 1 day, of supervised field experience on site. This is done with your employer under a trained, experienced supervisor and recorded separately.</p>

<h2>How long HAZWOPER certification lasts</h2>
<p>Your initial certificate doesn't expire, but you stay qualified only by taking the {{course:osha-8-hour-hazwoper-refresher-training|8 hour refresher}} <strong>every 12 months</strong>. In practice, a HAZWOPER certification is "current" for one year from your last course. See {{guide:hazwoper-refresher-requirements|refresher requirements}}.</p>

<h2>How employers verify HAZWOPER training</h2>
<ul>
<li>Check the certificate shows the worker's name, course title, training level, completion date and provider</li>
<li>Check the most recent refresher date is within the last 12 months</li>
<li>Confirm documentation of supervised field experience</li>
<li>Contact the training provider to confirm the certificate if in doubt</li>
</ul>
`,
    faq: [
      ['How long does it take to get HAZWOPER certified?', 'The 40 hour course takes at least 40 hours of training time and the 24 hour course at least 24 hours. Online courses are self-paced, so you can finish as fast as your schedule allows. Field experience is extra.'],
      ['Does OSHA issue HAZWOPER cards?', 'No. OSHA sets the training requirements but does not issue HAZWOPER certificates. The training provider issues the certificate and wallet card.'],
      ['Does HAZWOPER certification expire?', 'The initial certificate stays valid as proof of initial training, but you must complete 8 hours of refresher training every year to remain qualified.'],
    ],
  },

  {
    slug: 'ppe-levels-a-b-c-d',
    title: 'PPE Levels A, B, C and D Explained (EPA and OSHA HAZWOPER)',
    short: 'PPE levels A, B, C and D',
    desc: 'The four levels of HAZWOPER personal protective equipment: what Level A, B, C and D include, when to use each, and how to choose a level under OSHA 1910.120 Appendix B.',
    related: ['hazwoper-micro-module-ppe-levels-a-b-c-and-d-explained', 'osha-40-hour-hazwoper-training', 'osha-24-hour-hazwoper-training'],
    quiz: 'ppe-levels-quiz',
    body: `
<p>HAZWOPER sorts chemical protective ensembles into four levels, A through D, described in OSHA 29 CFR 1910.120 Appendix B and in EPA guidance. The level is chosen from the known or suspected hazard, the routes of exposure and how much is known about the chemicals involved.</p>

<h2>Level A: highest respiratory, skin and eye protection</h2>
<p><strong>Use when:</strong> the substance requires the highest level of protection for skin, eyes and lungs. That means high concentrations of vapors, gases or particulates that are toxic through the skin, unknown substances in a confined or poorly ventilated area, or operations with a high chance of splash, immersion or contact with skin-toxic chemicals.</p>
<ul>
<li>Positive-pressure, full-facepiece self-contained breathing apparatus (SCBA), or a positive-pressure supplied-air respirator with escape SCBA</li>
<li><strong>Totally encapsulating, vapor-tight</strong> chemical-protective suit</li>
<li>Inner and outer chemical-resistant gloves</li>
<li>Chemical-resistant boots with steel toe and shank</li>
<li>Two-way radio communications; optional cooling unit, hard hat and coveralls under the suit</li>
</ul>

<h2>Level B: highest respiratory, lesser skin protection</h2>
<p><strong>Use when:</strong> the highest level of respiratory protection is needed but less skin protection, for example oxygen-deficient atmospheres (below 19.5%), IDLH concentrations, or substances that aren't a significant skin hazard. Level B is the minimum level recommended for initial site entry until hazards are identified.</p>
<ul>
<li>Positive-pressure, full-facepiece SCBA or supplied-air respirator with escape SCBA</li>
<li>Hooded chemical-resistant clothing (splash suit, coveralls or one- or two-piece suit). Not vapor-tight</li>
<li>Inner and outer chemical-resistant gloves and chemical-resistant boots</li>
</ul>

<h2>Level C: air-purifying respirator</h2>
<p><strong>Use when:</strong> the type and concentration of airborne substances are known, the criteria for using air-purifying respirators are met, and skin contact isn't expected to cause harm. Oxygen must be at least 19.5%, the contaminant must have adequate warning properties or an end-of-service-life indicator, and concentrations must be below IDLH and within the respirator's protection factor.</p>
<ul>
<li>Full-face or half-mask air-purifying respirator (APR) with the correct cartridges, or a powered air-purifying respirator (PAPR)</li>
<li>Hooded chemical-resistant clothing</li>
<li>Inner and outer chemical-resistant gloves and boots</li>
</ul>

<h2>Level D: work uniform</h2>
<p><strong>Use when:</strong> the atmosphere contains no known hazard and work rules out splashes, immersion or unexpected inhalation or contact. Level D is for nuisance contamination only and gives <strong>no respiratory protection</strong>.</p>
<ul>
<li>Coveralls</li>
<li>Safety boots or shoes, safety glasses or chemical splash goggles, hard hat</li>
<li>Gloves and face shield as needed</li>
</ul>

<h2>Comparison table</h2>
<div class="table-wrap"><table>
<thead><tr><th>Level</th><th>Respiratory</th><th>Skin</th><th>Typical situation</th></tr></thead>
<tbody>
<tr><td>A</td><td>SCBA or SAR with escape</td><td>Vapor-tight, fully encapsulating suit</td><td>Unknowns, high vapor concentrations, skin-absorbable toxics</td></tr>
<tr><td>B</td><td>SCBA or SAR with escape</td><td>Splash-protective, hooded</td><td>Initial entry, O<sub>2</sub> &lt; 19.5%, IDLH air, low skin hazard</td></tr>
<tr><td>C</td><td>Air-purifying respirator</td><td>Splash-protective, hooded</td><td>Known contaminant, measured concentrations, APR criteria met</td></tr>
<tr><td>D</td><td>None</td><td>Work uniform</td><td>No atmospheric hazard, nuisance contamination only</td></tr>
</tbody></table></div>

<h2>Changing levels during work</h2>
<p>The level isn't fixed for the whole job. {{guide:air-monitoring|Air monitoring}} results, new information from site characterization, or a change in tasks can raise or lower it. The site safety and health plan should set action levels that trigger an upgrade or withdrawal. Every level also needs a matching {{guide:hazwoper-decontamination|decontamination line}}.</p>

<h2>Heat stress and PPE</h2>
<p>Higher levels of protection trap body heat. Workers in Level A and B face serious heat stress risk, so the plan should include work-rest cycles, fluids, monitoring of heart rate or body temperature, and cooling vests where needed.</p>
`,
    faq: [
      ['What is the difference between Level A and Level B PPE?', 'Both use SCBA or supplied air for maximum respiratory protection. Level A adds a totally encapsulating, vapor-tight suit for maximum skin protection. Level B uses non-vapor-tight, splash-protective clothing.'],
      ['When can Level C be used?', 'Level C can be used when the airborne contaminants and their concentrations are known, oxygen is at least 19.5%, concentrations are below IDLH, air-purifying respirator criteria are met, and skin contact is not expected to cause harm.'],
      ['Does Level D include a respirator?', 'No. Level D is a work uniform with no respiratory protection and is only for situations with no known atmospheric hazard.'],
    ],
  },

  {
    slug: 'hazwoper-decontamination',
    title: 'HAZWOPER Decontamination Procedures: Decon Line Setup and Steps',
    short: 'Decontamination procedures',
    desc: 'How HAZWOPER decontamination works under 1910.120(k): decon methods, setting up the contamination reduction corridor, typical decon line stations, equipment decon and emergency decon.',
    related: ['hazwoper-micro-module-decontamination-procedures', 'osha-40-hour-hazwoper-training', 'osha-24-hour-hazwoper-training'],
    quiz: 'decontamination-and-site-control-quiz',
    body: `
<p>Decontamination ("decon") removes or neutralizes contaminants that have built up on people and equipment, so hazards don't leave the work area. OSHA 29 CFR 1910.120(k) requires a written decontamination procedure, developed and communicated to employees <strong>before anyone enters a site</strong> where they may be exposed.</p>

<h2>What OSHA requires</h2>
<ul>
<li>All employees leaving a contaminated area must be decontaminated, and all contaminated clothing and equipment leaving must be decontaminated or disposed of</li>
<li>Decon must happen in areas that minimize exposure of uncontaminated employees or equipment</li>
<li>The site safety and health officer monitors the procedure and revises it if it isn't working</li>
<li>Equipment and solvents used for decon must themselves be decontaminated or disposed of properly</li>
<li>Protective clothing that can't be decontaminated is disposed of; contaminated clothing is never taken home</li>
<li>Showers and change rooms are provided where decon procedures call for them</li>
</ul>

<h2>Decon methods</h2>
<ul>
<li><strong>Physical removal:</strong> brushing, scraping, rinsing, wiping, vacuuming with HEPA filtration</li>
<li><strong>Dilution:</strong> water or detergent wash and rinse</li>
<li><strong>Chemical:</strong> neutralization, solidification or a solvent matched to the contaminant. Check compatibility first so the decon solution doesn't create a new hazard</li>
<li><strong>Disposal:</strong> disposable PPE removed and bagged as waste</li>
</ul>

<h2>Where decon happens</h2>
<p>Decon takes place in the <strong>contamination reduction zone (CRZ)</strong>, the transition between the exclusion zone and the clean support zone. Inside it, the <strong>contamination reduction corridor</strong> holds the decon line, laid out from dirtiest to cleanest with the access control point at the clean end. See {{guide:site-control-work-zones|site control and work zones}}.</p>

<h2>A typical decon line</h2>
<ol>
<li><strong>Segregated equipment drop:</strong> leave tools, sampling gear and instruments on plastic sheeting or in containers</li>
<li><strong>Boot cover and outer glove wash</strong></li>
<li><strong>Boot cover and outer glove rinse</strong></li>
<li><strong>Tape removal</strong> at wrists and ankles</li>
<li><strong>Boot cover removal</strong></li>
<li><strong>Outer glove removal</strong></li>
<li><strong>Suit and safety boot wash</strong></li>
<li><strong>Suit and boot rinse</strong></li>
<li><strong>Tank change or redress</strong>, if returning to the exclusion zone</li>
<li><strong>Safety boot removal</strong></li>
<li><strong>Splash suit removal</strong></li>
<li><strong>Inner glove wash and rinse</strong></li>
<li><strong>Facepiece removal</strong></li>
<li><strong>Inner glove removal</strong></li>
<li><strong>Inner clothing removal</strong>, field wash and redress</li>
</ol>
<p>The number of stations depends on the PPE level and contaminant. Level A and B lines are longer; Level C and D lines may only need a few steps.</p>

<h2>Checking decon worked</h2>
<p>Methods include visual inspection (sometimes under UV light for fluorescent contaminants), wipe sampling of PPE or skin, and testing the final rinse solution. Results feed back into the procedure.</p>

<h2>Emergency decon</h2>
<p>If a worker is injured or seriously exposed, life-saving care comes first. Gross decon such as removing outer clothing and flushing with water can be done quickly; full decon may be skipped if it would delay critical medical treatment. Wrap the victim to limit spread and tell medical staff what the contaminant is.</p>
`,
    faq: [
      ['Where is the decontamination line located?', 'In the contamination reduction zone (warm zone), between the exclusion zone and the support zone, arranged from most contaminated to least contaminated.'],
      ['Does OSHA require a written decon procedure?', 'Yes. 1910.120(k)(1) requires a decontamination procedure to be developed, communicated to employees and implemented before anyone enters a site where they may be exposed.'],
      ['Should decon be done before emergency medical treatment?', 'Not if it would delay life-saving care. Perform gross decon if it can be done quickly, protect medical responders and tell them what the contaminant is.'],
    ],
  },

  {
    slug: 'site-control-work-zones',
    title: 'Site Control and Work Zones: Exclusion, Contamination Reduction and Support Zones',
    short: 'Site control & work zones',
    desc: 'HAZWOPER site control under 1910.120(d): the site control program, hot, warm and cold work zones, the buddy system, access control points and site communications.',
    related: ['hazwoper-micro-module-site-characterization-and-hazard-assessment', 'osha-40-hour-hazwoper-training', 'osha-8-hour-hazwoper-supervisor-training'],
    quiz: 'decontamination-and-site-control-quiz',
    body: `
<p>Site control keeps people away from hazards and keeps contamination where it belongs. OSHA 29 CFR 1910.120(d) requires appropriate site control procedures <strong>before cleanup work begins</strong>.</p>

<h2>Elements of a site control program</h2>
<p>The site control program is part of the {{guide:site-safety-and-health-plan|site safety and health plan}} and must include, at a minimum:</p>
<ul>
<li>A site map</li>
<li>Site work zones</li>
<li>Use of a "buddy system"</li>
<li>Site communications, including alerting means for emergencies</li>
<li>Standard operating procedures or safe work practices</li>
<li>Identification of the nearest medical assistance</li>
</ul>

<h2>The three work zones</h2>
<div class="table-wrap"><table>
<thead><tr><th>Zone</th><th>Also called</th><th>What happens there</th></tr></thead>
<tbody>
<tr><td>Exclusion zone (EZ)</td><td>Hot zone</td><td>Where contamination is or could be. Entry only in the required PPE, only by trained and authorized workers. Bounded by the hotline.</td></tr>
<tr><td>Contamination reduction zone (CRZ)</td><td>Warm zone</td><td>Transition area holding the decontamination corridor. Reduces the chance of spreading contaminants to the clean zone.</td></tr>
<tr><td>Support zone (SZ)</td><td>Cold zone</td><td>Clean area for the command post, first aid, equipment, vehicles and break areas. Located upwind of the exclusion zone.</td></tr>
</tbody></table></div>
<p>Workers enter and leave the exclusion zone through <strong>access control points</strong>, and exit always goes through {{guide:hazwoper-decontamination|decontamination}}. Zone boundaries are set from site characterization and air monitoring data and should be marked with tape, cones, signs or fencing.</p>

<h2>Setting zone boundaries</h2>
<ul>
<li>Use visual survey, air monitoring readings and sampling results from site characterization</li>
<li>Consider wind direction, terrain, drainage, and how far vapors, dust and spills could travel</li>
<li>Leave enough room in the CRZ for a full decon line and emergency access</li>
<li>Put the support zone upwind and adjust zones if conditions change</li>
</ul>

<h2>The buddy system</h2>
<p>OSHA defines the buddy system as organizing employees into work groups so that each one is designated to be observed by at least one other employee in the group. Buddies watch each other for signs of exposure or heat stress, help each other, check PPE integrity and get help in an emergency.</p>

<h2>Communications</h2>
<p>Exclusion zone work needs reliable communication: two-way radios, hand signals (especially when respirators make speech hard), air horns or sirens for evacuation, and a check-in/check-out log at the access control point so everyone is accounted for.</p>
`,
    faq: [
      ['What are the three HAZWOPER work zones?', 'The exclusion zone (hot zone), contamination reduction zone (warm zone) and support zone (cold zone).'],
      ['Where should the support zone be located?', 'Upwind of the exclusion zone, in a clean area, with the command post, first aid, equipment and break areas.'],
      ['What is the buddy system in HAZWOPER?', 'A system that organizes workers into groups so each one is observed by at least one other worker who can watch for problems and summon help.'],
    ],
  },

  {
    slug: 'air-monitoring',
    title: 'HAZWOPER Air Monitoring: Oxygen, LEL, Toxics and Direct-Reading Instruments',
    short: 'Air monitoring & instruments',
    desc: 'HAZWOPER air monitoring under 1910.120(h): oxygen, LEL and toxic action levels, 4-gas meters, PIDs, FIDs, colorimetric tubes, bump testing, calibration and monitoring order.',
    related: ['osha-air-monitoring-and-gas-detection-training', 'hazwoper-micro-module-air-monitoring-and-direct-reading-instruments', 'osha-40-hour-hazwoper-training'],
    quiz: 'air-monitoring-quiz',
    body: `
<p>Air monitoring tells you what is in the air, how much of it, and whether workers' PPE and work zones are adequate. OSHA 29 CFR 1910.120(h) requires monitoring during initial site entry and periodically after that, whenever there may be exposure above permissible limits, a change in conditions or a new operation.</p>

<h2>What to monitor first</h2>
<p>On initial entry, check hazards in this order, because each one can kill fastest:</p>
<ol>
<li><strong>Oxygen</strong>: below 19.5% is oxygen deficient (atmosphere-supplying respirator needed). Above 23.5% is oxygen enriched and raises fire risk.</li>
<li><strong>Flammability</strong>: measured as a percent of the lower explosive limit (LEL). Combustible gas readings are only accurate when oxygen is normal.</li>
<li><strong>Toxic gases and vapors</strong>: such as hydrogen sulfide, carbon monoxide and organic vapors, compared against exposure limits and IDLH values.</li>
<li><strong>Radiation</strong>, where suspected.</li>
</ol>

<h2>Common action levels</h2>
<div class="table-wrap"><table>
<thead><tr><th>Reading</th><th>Typical action</th></tr></thead>
<tbody>
<tr><td>O<sub>2</sub> &lt; 19.5%</td><td>Oxygen deficient: SCBA or supplied air, or don't enter</td></tr>
<tr><td>O<sub>2</sub> &gt; 23.5%</td><td>Oxygen enriched: fire hazard, stop work and find the source</td></tr>
<tr><td>Combustible gas &lt; 10% LEL</td><td>Continue with monitoring</td></tr>
<tr><td>10-25% LEL</td><td>Continue with extreme caution and continuous monitoring</td></tr>
<tr><td>&gt; 25% LEL</td><td>Explosion hazard: withdraw and reassess</td></tr>
<tr><td>Toxics at or above PEL/REL</td><td>Upgrade PPE or use controls per the site plan</td></tr>
<tr><td>Toxics at or above IDLH</td><td>Atmosphere-supplying respirator or withdraw</td></tr>
</tbody></table></div>
<p>These follow widely used EPA guidance. Your site safety and health plan sets the actual action levels for your site.</p>

<h2>Direct-reading instruments</h2>
<ul>
<li><strong>Multi-gas (4-gas) meters</strong> measure O<sub>2</sub>, LEL, H<sub>2</sub>S and CO</li>
<li><strong>Photoionization detectors (PID)</strong> measure many volatile organic compounds in ppm. Response depends on the lamp energy (eV) and the chemical's ionization potential, and readings need correction factors for specific compounds</li>
<li><strong>Flame ionization detectors (FID)</strong> measure organic vapors including methane, which PIDs don't detect well</li>
<li><strong>Colorimetric detector tubes</strong> give a reading for one specific chemical</li>
<li><strong>Aerosol and dust monitors</strong>, <strong>radiation meters</strong> and <strong>mercury vapor analyzers</strong> for specific hazards</li>
</ul>
<p>Direct-reading instruments give real-time results for decisions on site. Personal sampling with pumps and lab analysis documents actual worker exposure against PELs.</p>

<h2>Bump testing and calibration</h2>
<ul>
<li><strong>Bump test</strong> before each day's use: expose the instrument to a known gas to make sure the sensors and alarms respond</li>
<li><strong>Calibrate</strong> per the manufacturer, and whenever a bump test fails</li>
<li>Record bump tests and calibrations</li>
<li>Know each instrument's limits: interfering gases, humidity, temperature, sensor poisoning and response time</li>
</ul>

<h2>Where to monitor</h2>
<p>Sample at the breathing zone, then at low and high points depending on vapor density. Heavier-than-air gases collect in trenches, pits and basements; lighter gases rise. Monitor before entering confined spaces, and continuously during work that could release contaminants, such as drum opening or excavation.</p>
`,
    faq: [
      ['What oxygen level is considered oxygen deficient?', 'OSHA considers an atmosphere with less than 19.5% oxygen by volume to be oxygen deficient. Above 23.5% is oxygen enriched.'],
      ['What is the difference between a PID and an FID?', 'Both detect organic vapors. A PID uses ultraviolet light and does not respond well to methane. An FID burns the sample in a hydrogen flame and detects methane and most organic compounds.'],
      ['How often should a gas meter be bump tested?', 'Before each day\'s use is the common industry and manufacturer recommendation, with full calibration per the manufacturer and whenever a bump test fails.'],
    ],
  },

  {
    slug: 'site-safety-and-health-plan',
    title: 'Site-Specific Safety and Health Plan (HASP) Requirements Under 1910.120(b)',
    short: 'Site safety & health plan (HASP)',
    desc: 'What a HAZWOPER site-specific safety and health plan (HASP) must contain under OSHA 1910.120(b)(4), who writes it, pre-entry briefings, inspections and a checklist of required elements.',
    related: ['osha-8-hour-hazwoper-supervisor-training', 'osha-40-hour-hazwoper-training', 'hazwoper-micro-module-site-characterization-and-hazard-assessment'],
    quiz: 'hazwoper-40-hour-practice-test',
    body: `
<p>Every hazardous waste cleanup site needs a written <strong>site-specific safety and health plan</strong>, often called a HASP. It is part of the employer's safety and health program under 29 CFR 1910.120(b), must be kept on site, and must address the safety and health hazards of each phase of the operation.</p>

<h2>Required elements of the HASP</h2>
<p>Under 1910.120(b)(4)(ii), the plan must address at least:</p>
<ol>
<li>A safety and health <strong>risk or hazard analysis</strong> for each site task and operation in the work plan</li>
<li><strong>Employee training</strong> assignments</li>
<li><strong>Personal protective equipment</strong> for each site task and operation ({{guide:ppe-levels-a-b-c-d|PPE levels}})</li>
<li><strong>Medical surveillance</strong> requirements ({{guide:hazwoper-medical-surveillance|medical surveillance}})</li>
<li>Frequency and types of <strong>air monitoring</strong>, personnel monitoring and environmental sampling, including instrument maintenance and calibration ({{guide:air-monitoring|air monitoring}})</li>
<li><strong>Site control</strong> measures ({{guide:site-control-work-zones|work zones}})</li>
<li><strong>Decontamination</strong> procedures ({{guide:hazwoper-decontamination|decon}})</li>
<li>An <strong>emergency response plan</strong> meeting 1910.120(l)</li>
<li><strong>Confined space entry</strong> procedures</li>
<li>A <strong>spill containment</strong> program</li>
</ol>

<h2>The wider safety and health program</h2>
<p>The HASP sits inside a written program that also includes:</p>
<ul>
<li>An <strong>organizational structure</strong> naming the general supervisor, the site safety and health supervisor, and lines of authority</li>
<li>A <strong>comprehensive work plan</strong> covering tasks, objectives, staffing, equipment and training</li>
<li>Standard operating procedures and the medical surveillance program</li>
</ul>

<h2>Pre-entry briefings and inspections</h2>
<p>The plan must provide for <strong>pre-entry briefings</strong> before site activities start, and at other times as needed, so employees know the plan and are following it. The employer must also inspect the site to judge whether the plan is working and fix any problems found.</p>

<h2>Who writes the HASP</h2>
<p>A qualified person, usually a certified industrial hygienist, safety professional or experienced site safety officer, writes the HASP using the site characterization data. Contractors and subcontractors must be told about the site's hazards. The plan is a living document: update it when conditions, tasks or data change.</p>
`,
    faq: [
      ['What does HASP stand for?', 'HASP stands for Health and Safety Plan. Under HAZWOPER it is the site-specific safety and health plan required by 29 CFR 1910.120(b)(4).'],
      ['Does the HASP have to be kept on site?', 'Yes. The site safety and health plan must be kept on site and be available to employees, contractors and OSHA.'],
      ['How often must the HASP be updated?', 'Whenever site conditions, tasks or new information change the hazards. Inspections under the plan should find and correct deficiencies.'],
    ],
  },

  {
    slug: 'emergency-response-training-levels',
    title: 'HAZWOPER Emergency Response Training Levels: Awareness to Incident Commander',
    short: 'Emergency response levels',
    desc: 'The five HAZWOPER emergency responder levels under 1910.120(q)(6): first responder awareness, operations, HAZMAT technician, specialist and on-scene incident commander, with required hours and competencies.',
    related: ['osha-4-hour-hazwoper-first-responder-awareness-level-training', 'osha-8-hour-hazwoper-q-incident-command-training', 'osha-40-hour-hazwoper-for-emergency-response-fire-hazmat-teams', 'manufacturing-emergency-response-team-ert-training'],
    quiz: 'first-responder-awareness-quiz',
    body: `
<p>Paragraph (q) of 29 CFR 1910.120 covers emergency response to hazardous substance releases at any workplace. Employers whose employees respond need a written <strong>emergency response plan</strong>, an <strong>incident command system (ICS)</strong>, and responders trained to the level of the duties they will perform.</p>

<h2>The five training levels</h2>
<div class="table-wrap"><table>
<thead><tr><th>Level</th><th>Role</th><th>Minimum training</th><th>Reference</th></tr></thead>
<tbody>
<tr><td>First responder awareness</td><td>Likely to witness or discover a release; starts the response by notifying authorities, then takes no further action</td><td>Enough training or proven experience to show the listed competencies</td><td>(q)(6)(i)</td></tr>
<tr><td>First responder operations</td><td>Responds defensively to protect people, property and the environment, without trying to stop the release</td><td>Awareness competencies + at least 8 hours</td><td>(q)(6)(ii)</td></tr>
<tr><td>Hazardous materials technician</td><td>Approaches the point of release to plug, patch or otherwise stop it</td><td>At least 24 hours equal to operations level + competencies</td><td>(q)(6)(iii)</td></tr>
<tr><td>Hazardous materials specialist</td><td>Supports technicians with specific knowledge of substances; liaison with authorities</td><td>At least 24 hours equal to technician level + competencies</td><td>(q)(6)(iv)</td></tr>
<tr><td>On-scene incident commander</td><td>Takes control of the scene beyond the awareness level</td><td>At least 24 hours equal to operations level + competencies</td><td>(q)(6)(v)</td></tr>
</tbody></table></div>

<h2>First responder awareness competencies</h2>
<p>An awareness-level responder must be able to:</p>
<ul>
<li>Understand what hazardous substances are and the risks in an incident</li>
<li>Understand the possible outcomes of an emergency involving hazardous substances</li>
<li>Recognize hazardous substances in an emergency</li>
<li>Identify the hazardous substances if possible</li>
<li>Understand their role in the employer's emergency response plan, including site security and control, and use the U.S. DOT Emergency Response Guidebook</li>
<li>Recognize the need for more resources and make the right notifications to the communication center</li>
</ul>
<p>Our {{course:osha-4-hour-hazwoper-first-responder-awareness-level-training|First Responder Awareness}} course covers these competencies.</p>

<h2>Incident command</h2>
<p>The senior emergency response official on scene becomes the individual in charge of a site-specific ICS (q)(3)). They identify hazards, set up the response, make sure PPE is right, limit the number of people in danger areas, use the buddy system in hazardous zones, keep backup personnel ready with first aid, and designate a safety officer. Training: {{course:osha-8-hour-hazwoper-q-incident-command-training}} or {{course:8-hour-hazwoper-and-incident-command-refresher-training}}.</p>

<h2>Annual refresher for responders</h2>
<p>Responders must get annual refresher training of enough content and length to keep their competencies, or demonstrate competency in those areas at least once a year (q)(8)). The employer keeps a statement of the training or competency.</p>

<h2>Skilled support and specialist employees</h2>
<p>Skilled support personnel, such as equipment operators brought in for a specific task, need an initial briefing on site covering PPE, chemical hazards and their duties. Specialist employees who give technical advice need annual training or demonstrated competency in their specialty.</p>

<h2>Do you need a response team?</h2>
<p>An employer that will <strong>evacuate</strong> employees and call outside responders, and not let its own employees respond, can follow an emergency action plan under 1910.38 instead of paragraph (q). Employers who expect employees to respond need paragraph (q). Industry options: {{course:manufacturing-emergency-response-team-ert-training|manufacturing ERT}}, {{course:osha-40-hour-hazwoper-for-emergency-response-fire-hazmat-teams|fire and HAZMAT teams}}, {{course:osha-40-hour-hazwoper-for-utility-pipeline-emergency-response|utility and pipeline}}.</p>
`,
    faq: [
      ['How many hours is HAZWOPER first responder awareness training?', 'OSHA does not set a minimum number of hours for awareness level. Workers need enough training or proven experience to demonstrate the competencies in 1910.120(q)(6)(i). Courses are commonly 4 hours.'],
      ['How many hours is first responder operations level?', 'At least 8 hours of training, in addition to awareness-level competencies, under 1910.120(q)(6)(ii).'],
      ['What is the difference between operations and technician level?', 'Operations responders act defensively from a safe distance to contain a release and prevent exposure. Technicians approach the point of release to plug, patch or stop it, and need at least 24 hours of training.'],
    ],
  },

  {
    slug: 'hazwoper-medical-surveillance',
    title: 'HAZWOPER Medical Surveillance Requirements (1910.120(f))',
    short: 'Medical surveillance',
    desc: 'Who needs HAZWOPER medical surveillance under OSHA 1910.120(f), exam frequency, what the exam includes, the physician\'s written opinion and 30-year record retention.',
    related: ['osha-40-hour-hazwoper-training', 'osha-8-hour-hazwoper-supervisor-training', 'osha-8-hour-hazwoper-refresher-training'],
    quiz: 'hazwoper-8-hour-refresher-practice-quiz',
    body: `
<p>HAZWOPER requires employers to run a <strong>medical surveillance program</strong> for certain workers, under 29 CFR 1910.120(f). Exams are done by or under the supervision of a licensed physician, at no cost to the employee, without loss of pay, and at a reasonable time and place.</p>

<h2>Who must be in the program</h2>
<ul>
<li>Employees who are or may be exposed to hazardous substances or health hazards <strong>at or above the permissible exposure limit</strong> (or published exposure levels, if there is no PEL) <strong>for 30 days or more a year</strong>, without regard to respirator use</li>
<li>Employees who <strong>wear a respirator for 30 days or more a year</strong>, or as required by 1910.134</li>
<li>Employees who are <strong>injured, become ill or develop symptoms</strong> from possible overexposure in an emergency or at a hazardous waste site</li>
<li>Members of <strong>HAZMAT teams</strong></li>
</ul>

<h2>When exams happen</h2>
<ul>
<li><strong>Before assignment</strong> (baseline)</li>
<li><strong>At least once every 12 months</strong>, unless the physician decides a longer interval (no more than two years) is appropriate</li>
<li><strong>At termination of employment</strong> or reassignment out of the program, unless an exam was done within the last six months</li>
<li><strong>As soon as possible</strong> after signs or symptoms of overexposure, or after an unprotected exposure in an emergency</li>
<li>More often if the physician decides it is medically necessary</li>
</ul>

<h2>What the exam covers</h2>
<p>A medical and work history, with special emphasis on symptoms related to handling hazardous substances and on fitness for duty, including the ability to wear required PPE under expected conditions such as temperature extremes. The physician decides what tests to add based on the employee's exposures.</p>

<h2>Information the employer gives the physician</h2>
<ul>
<li>A copy of the HAZWOPER standard and its appendices</li>
<li>A description of the employee's duties as they relate to exposures</li>
<li>Exposure levels, actual or expected</li>
<li>A description of the PPE used or to be used</li>
<li>Information from previous medical exams that the physician can't readily get</li>
</ul>

<h2>The physician's written opinion</h2>
<p>The employer gets a written opinion stating whether the employee has any condition that puts them at increased risk from work with hazardous substances, any recommended limits on the employee's work or respirator use, and that the employee has been told the results. It must not reveal specific findings or diagnoses unrelated to occupational exposure. The employee gets a copy.</p>

<h2>Recordkeeping</h2>
<p>Medical records must be kept for the <strong>duration of employment plus 30 years</strong>, under 29 CFR 1910.1020.</p>
`,
    faq: [
      ['How often are HAZWOPER medical exams required?', 'Before assignment, at least every 12 months (or up to every two years if the physician decides), at termination, and after symptoms of overexposure.'],
      ['Who pays for HAZWOPER medical surveillance?', 'The employer. Exams must be provided at no cost to the employee, without loss of pay, and at a reasonable time and place.'],
      ['How long must HAZWOPER medical records be kept?', 'For the duration of employment plus 30 years, under 29 CFR 1910.1020.'],
    ],
  },

  {
    slug: 'exposure-limits-pel-tlv-idlh',
    title: 'Exposure Limits Explained: PEL, REL, TLV, STEL, Ceiling and IDLH',
    short: 'Exposure limits (PEL, TLV, IDLH)',
    desc: 'Plain-English guide to occupational exposure limits used in HAZWOPER: OSHA PEL, NIOSH REL, ACGIH TLV, TWA, STEL, ceiling, IDLH, and routes of exposure.',
    related: ['osha-40-hour-hazwoper-training', 'osha-air-monitoring-and-gas-detection-training', 'osha-24-hour-hazwoper-training'],
    quiz: 'air-monitoring-quiz',
    body: `
<p>HAZWOPER training levels, PPE selection, medical surveillance and air monitoring all depend on <strong>exposure limits</strong>: airborne concentrations a worker can be exposed to without expected harm. Here are the terms you'll see on safety data sheets and in site plans.</p>

<h2>Who sets the limits</h2>
<div class="table-wrap"><table>
<thead><tr><th>Limit</th><th>Set by</th><th>Legal status</th></tr></thead>
<tbody>
<tr><td>PEL (Permissible Exposure Limit)</td><td>OSHA</td><td>Legally enforceable (29 CFR 1910.1000 tables and substance-specific standards)</td></tr>
<tr><td>REL (Recommended Exposure Limit)</td><td>NIOSH</td><td>Recommendation, often stricter than the PEL</td></tr>
<tr><td>TLV (Threshold Limit Value)</td><td>ACGIH</td><td>Guideline, updated yearly; adopted by some states and contracts</td></tr>
<tr><td>IDLH (Immediately Dangerous to Life or Health)</td><td>NIOSH</td><td>Used for respirator selection and emergency decisions</td></tr>
</tbody></table></div>
<p>Many PELs date from 1971 and are less protective than current RELs and TLVs. HAZWOPER uses PELs and, where there is no PEL, "published exposure levels".</p>

<h2>Types of limits</h2>
<ul>
<li><strong>TWA (time-weighted average):</strong> the average concentration over an 8-hour shift (OSHA) or a 10-hour shift (NIOSH)</li>
<li><strong>STEL (short-term exposure limit):</strong> a 15-minute average that shouldn't be exceeded at any time in the shift</li>
<li><strong>Ceiling (C):</strong> a concentration that must never be exceeded, even briefly</li>
<li><strong>Skin notation:</strong> the chemical can be absorbed through skin, so airborne limits alone don't protect workers</li>
<li><strong>IDLH:</strong> a concentration that could cause death, immediate or delayed permanent health effects, or prevent escape. Only atmosphere-supplying respirators (SCBA or supplied air with escape) are used at or above IDLH</li>
</ul>

<h2>Routes of exposure</h2>
<ol>
<li><strong>Inhalation:</strong> the most common route at hazardous waste sites</li>
<li><strong>Skin and eye absorption:</strong> many solvents and pesticides pass through skin</li>
<li><strong>Ingestion:</strong> usually from contaminated hands, food or tobacco, which is why eating and smoking are banned in the exclusion zone</li>
<li><strong>Injection:</strong> punctures from contaminated sharp objects</li>
</ol>

<h2>Acute vs chronic effects</h2>
<p><strong>Acute</strong> effects show up during or shortly after a short, high exposure, such as dizziness from solvent vapors or burns from a corrosive. <strong>Chronic</strong> effects come from repeated exposure over months or years, such as cancer, liver or kidney damage, or nerve damage. Some substances have both.</p>

<h2>Using limits on site</h2>
<p>{{guide:air-monitoring|Air monitoring}} readings are compared against these limits to choose {{guide:ppe-levels-a-b-c-d|PPE levels}}, set action levels in the {{guide:site-safety-and-health-plan|site plan}} and decide who needs {{guide:hazwoper-medical-surveillance|medical surveillance}}. A respirator's assigned protection factor times the exposure limit gives the maximum concentration it can be used in.</p>
`,
    faq: [
      ['What is the difference between a PEL and a TLV?', 'A PEL is OSHA\'s legally enforceable limit. A TLV is a guideline published by ACGIH that is updated regularly and is often more protective.'],
      ['What does IDLH mean?', 'Immediately Dangerous to Life or Health: a concentration that could cause death or serious permanent harm or prevent escape. Only SCBA or supplied air with escape is used at or above IDLH.'],
      ['What is a STEL?', 'A short-term exposure limit: a 15-minute time-weighted average exposure that should not be exceeded at any time during the workday.'],
    ],
  },

  {
    slug: 'cal-osha-hazwoper',
    title: 'Cal/OSHA HAZWOPER (Title 8 CCR 5192): California Training Guide',
    short: 'Cal/OSHA HAZWOPER',
    desc: 'California HAZWOPER training under Title 8 CCR 5192: who needs it, 40, 24 and 8 hour Cal/OSHA courses, TSDF training, and how Cal/OSHA compares with federal OSHA 1910.120.',
    related: ['cal-osha-40-hour-hazwoper-training', 'cal-osha-24-hour-hazwoper-training', 'cal-osha-8-hour-hazwoper-refresher-training', 'cal-osha-24-hour-hazwoper-tsdf-rcra-training'],
    quiz: 'hazwoper-40-hour-practice-test',
    body: `
<p>California runs its own OSHA-approved state plan, so HAZWOPER work there falls under <strong>Cal/OSHA, Title 8 California Code of Regulations Section 5192</strong>, "Hazardous Waste Operations and Emergency Response." It follows the federal 29 CFR 1910.120 structure, and state plans must be at least as effective as federal OSHA.</p>

<h2>Who needs Cal/OSHA HAZWOPER</h2>
<p>The same groups as federal HAZWOPER, for work in California: cleanup workers at uncontrolled hazardous waste sites, RCRA corrective action and voluntary cleanup crews, employees of hazardous waste treatment, storage and disposal facilities, and emergency responders to hazardous substance releases. Construction work on these sites is covered as well.</p>

<h2>Cal/OSHA HAZWOPER courses</h2>
<ul>
<li>{{course:cal-osha-40-hour-hazwoper-training}}: general site workers, plus 3 days supervised field experience</li>
<li>{{course:cal-osha-24-hour-hazwoper-training}}: occasional workers and workers in characterized, low-exposure areas, plus 1 day field experience</li>
<li>{{course:cal-osha-8-hour-hazwoper-refresher-training}}: required every year</li>
<li>{{course:cal-osha-24-hour-hazwoper-tsdf-rcra-training}} and {{course:cal-osha-8-hour-hazwoper-tsdf-rcra-refresher-training}}: for TSD facility employees</li>
<li>{{course:cal-osha-rcra-hazardous-waste-training}}: hazardous waste handling for California generators</li>
</ul>

<h2>California-specific points</h2>
<ul>
<li>Cal/OSHA enforces 8 CCR 5192, and California regulations are cited instead of federal ones</li>
<li>California's Department of Toxic Substances Control (DTSC) regulates hazardous waste under Title 22 CCR, which is broader than federal RCRA and includes California-only hazardous wastes</li>
<li>California also requires an Injury and Illness Prevention Program (IIPP) under 8 CCR 3203, which your HAZWOPER program should fit into</li>
<li>Clients and agencies in California often ask specifically for Cal/OSHA-labelled certificates</li>
</ul>

<h2>Other state-plan states</h2>
<p>More than 20 states run their own OSHA plans covering private employers, including Washington, Oregon, Michigan, Minnesota, Virginia, North Carolina and others. Most adopt HAZWOPER rules identical or very close to the federal standard. See the {{course:8-hour-hazwoper-refresher-state-plan-versions-available|state-plan refresher}}.</p>
`,
    faq: [
      ['Is federal OSHA HAZWOPER accepted in California?', 'For work in California, training should meet Cal/OSHA 8 CCR 5192. The content closely matches federal 1910.120, but many California employers and agencies require Cal/OSHA-specific certificates.'],
      ['What is the Cal/OSHA HAZWOPER regulation?', 'Title 8 California Code of Regulations Section 5192, Hazardous Waste Operations and Emergency Response.'],
      ['Does Cal/OSHA require an annual HAZWOPER refresher?', 'Yes. Like federal OSHA, Cal/OSHA requires 8 hours of refresher training every year for trained hazardous waste workers.'],
    ],
  },

  {
    slug: 'rcra-hazardous-waste-training-requirements',
    title: 'RCRA Hazardous Waste Training Requirements by Generator Category',
    short: 'RCRA hazardous waste training',
    desc: 'EPA RCRA hazardous waste training requirements for VSQGs, SQGs and LQGs, satellite accumulation, manifests, universal waste, DOT hazmat training and how RCRA training relates to HAZWOPER.',
    related: ['rcra-hazardous-waste-generator-training', 'rcra-hazardous-waste-generator-refresher-training', 'hazardous-waste-manifest-training', 'rcra-universal-waste-handler-training', 'hazardous-waste-satellite-accumulation-area-training'],
    quiz: 'rcra-hazardous-waste-quiz',
    body: `
<p>The Resource Conservation and Recovery Act (RCRA) regulates hazardous waste from "cradle to grave." EPA's training requirements depend on how much hazardous waste a site generates each month. RCRA training is a <strong>separate requirement</strong> from OSHA HAZWOPER, though many facilities need both.</p>

<h2>Generator categories</h2>
<div class="table-wrap"><table>
<thead><tr><th>Category</th><th>Hazardous waste per calendar month</th><th>On-site accumulation</th></tr></thead>
<tbody>
<tr><td>Very small quantity generator (VSQG)</td><td>&le; 100 kg (and &le; 1 kg acute)</td><td>No time limit; up to 1,000 kg</td></tr>
<tr><td>Small quantity generator (SQG)</td><td>&gt; 100 kg and &lt; 1,000 kg</td><td>Up to 180 days (270 if TSDF is over 200 miles away); max 6,000 kg</td></tr>
<tr><td>Large quantity generator (LQG)</td><td>&ge; 1,000 kg, or &gt; 1 kg acute</td><td>Up to 90 days</td></tr>
</tbody></table></div>
<p>Categories come from 40 CFR 262.13, updated by EPA's 2016 Hazardous Waste Generator Improvements Rule. States may be stricter.</p>

<h2>Training by category</h2>
<ul>
<li><strong>LQGs</strong> (40 CFR 262.17(a)(7)): a formal personnel training program, classroom or on-the-job, teaching hazardous waste management procedures and emergency response relevant to each person's job. New employees must finish within <strong>six months</strong> and may not work unsupervised until trained. Everyone takes an <strong>annual review</strong>. Records: job titles, descriptions, training content and completion, kept until closure for current employees and 3 years for former employees.</li>
<li><strong>SQGs</strong> (262.16(b)(9)(iii)): ensure all employees are thoroughly familiar with proper waste handling and emergency procedures relevant to their duties.</li>
<li><strong>VSQGs</strong>: no specific training requirement, though basic training is good practice.</li>
<li><strong>TSDFs</strong> (264.16 / 265.16): formal training like LQGs, and employees also fall under HAZWOPER 1910.120(p).</li>
</ul>
<p>Courses: {{course:rcra-hazardous-waste-generator-training}} and the annual {{course:rcra-hazardous-waste-generator-refresher-training}}.</p>

<h2>Satellite accumulation areas</h2>
<p>Generators can collect up to <strong>55 gallons</strong> of non-acute hazardous waste, or <strong>1 quart of liquid or 1 kg of solid acute</strong> hazardous waste, at or near the point of generation and under the control of the operator (40 CFR 262.15). Containers must be closed, in good condition, compatible with the waste and marked "Hazardous Waste" with an indication of the hazards. See {{course:hazardous-waste-satellite-accumulation-area-training}}.</p>

<h2>Manifests and DOT training</h2>
<p>Off-site shipments travel on the Uniform Hazardous Waste Manifest (EPA Form 8700-22), now handled through EPA's e-Manifest system. Anyone who signs a manifest or prepares a hazardous materials shipment is a DOT <strong>hazmat employee</strong> and needs training under 49 CFR 172.704 at least <strong>every 3 years</strong>. See {{course:hazardous-waste-manifest-training}} and {{course:epa-rcra-dot-combined-hazardous-materials-compliance-training}}.</p>

<h2>Universal waste</h2>
<p>Batteries, pesticides, mercury-containing equipment, lamps and aerosol cans can be managed under the simpler universal waste rules at 40 CFR 273. Handlers must tell employees about proper handling and emergency procedures. See {{course:rcra-universal-waste-handler-training}}.</p>

<h2>Contingency plans and emergency coordinators</h2>
<p>LQGs and TSDFs need a written contingency plan and an emergency coordinator on site or on call at all times. SQGs need a designated emergency coordinator and posted emergency information. See {{course:hazardous-waste-contingency-plan-and-emergency-coordinator-training}}.</p>
`,
    faq: [
      ['Is RCRA training the same as HAZWOPER?', 'No. RCRA training is an EPA requirement for hazardous waste generators and TSDFs. HAZWOPER is an OSHA worker safety standard. TSDF employees and some generator employees need both.'],
      ['How often is RCRA training required?', 'Large quantity generators and TSDFs must provide an annual review of initial training. New employees must be trained within six months.'],
      ['What are the RCRA generator categories?', 'Very small quantity generators (100 kg or less per month), small quantity generators (more than 100 kg and less than 1,000 kg) and large quantity generators (1,000 kg or more, or more than 1 kg of acute hazardous waste).'],
    ],
  },

  {
    slug: 'hazwoper-employer-compliance-checklist',
    title: 'HAZWOPER Compliance Checklist for Employers',
    short: 'Employer compliance checklist',
    desc: 'A practical HAZWOPER compliance checklist for employers and EHS managers: scope, written programs, training records, medical surveillance, PPE, emergency response and common OSHA citations.',
    related: ['osha-8-hour-hazwoper-supervisor-training', 'hazwoper-train-the-trainer-certification', 'osha-40-hour-hazwoper-training', 'osha-8-hour-hazwoper-refresher-training'],
    quiz: 'hazwoper-8-hour-refresher-practice-quiz',
    body: `
<p>Use this checklist to review your HAZWOPER program. It follows the structure of 29 CFR 1910.120 and points to the guides for each topic. It isn't legal advice; your site's hazards and contracts decide what you actually need.</p>

<h2>1. Scope</h2>
<ul class="todo">
<li>Have you decided which of your operations fall under 1910.120(a)(1): cleanup, corrective action, TSDF, or emergency response?</li>
<li>If employees won't respond to releases, do you have an emergency action plan (1910.38) that tells them to evacuate?</li>
<li>For California and other state-plan states, have you checked the state rule? ({{guide:cal-osha-hazwoper|Cal/OSHA}})</li>
</ul>

<h2>2. Written programs</h2>
<ul class="todo">
<li>Written safety and health program with organization chart and work plan</li>
<li>{{guide:site-safety-and-health-plan|Site-specific safety and health plan}} for each site, kept on site</li>
<li>Site characterization before entry</li>
<li>{{guide:site-control-work-zones|Site control program}} with map, work zones and buddy system</li>
<li>{{guide:hazwoper-decontamination|Decontamination procedures}}</li>
<li>Emergency response plan</li>
<li>PPE program and written respiratory protection program (1910.134)</li>
<li>Spill containment program and confined space procedures</li>
</ul>

<h2>3. Training</h2>
<ul class="todo">
<li>Each worker's level matches their duties ({{guide:which-hazwoper-course-do-i-need|40, 24 or 8 hour}})</li>
<li>Supervisors have the extra 8 hours</li>
<li>Field experience is documented (3 days or 1 day)</li>
<li>Annual 8-hour refreshers are tracked and up to date ({{guide:hazwoper-refresher-requirements|refresher rules}})</li>
<li>Emergency responders are trained to their level ({{guide:emergency-response-training-levels|response levels}})</li>
<li>Trainers are qualified (1910.120(e)(5)). Consider {{course:hazwoper-train-the-trainer-certification|train-the-trainer}} for in-house instructors</li>
<li>Written certificates are on file for every worker</li>
<li>Spanish-language training for workers who need it ({{course:osha-40-hour-hazwoper-training-spanish|40 Hour Spanish}})</li>
</ul>

<h2>4. Medical surveillance</h2>
<ul class="todo">
<li>Workers exposed above PELs 30+ days a year, respirator users 30+ days a year and HAZMAT team members are enrolled</li>
<li>Baseline, annual, termination and post-exposure exams are scheduled</li>
<li>Physician's written opinions are on file; records kept for employment plus 30 years</li>
</ul>
<p>See {{guide:hazwoper-medical-surveillance|medical surveillance}}.</p>

<h2>5. Monitoring and PPE</h2>
<ul class="todo">
<li>{{guide:air-monitoring|Air monitoring}} plan with action levels; instruments bump tested and calibrated</li>
<li>{{guide:ppe-levels-a-b-c-d|PPE levels}} chosen from hazard data and written into the plan</li>
<li>Respirator fit tests done every year</li>
<li>Heat stress controls for Level A and B work</li>
</ul>

<h2>6. Common OSHA citations to avoid</h2>
<ul>
<li>No written safety and health program or site plan</li>
<li>Untrained or under-trained employees, or no annual refresher</li>
<li>No emergency response plan for employers whose staff respond to releases</li>
<li>No medical surveillance for respirator users or HAZMAT teams</li>
<li>Missing training certificates</li>
</ul>

<h2>Training a whole crew</h2>
<p>Add every course your team needs to the cart and check out once, with a seat count for each course. For large groups or purchase orders, call or email our team.</p>
`,
    faq: [
      ['What are the most common HAZWOPER violations?', 'Lack of a written safety and health program, missing site-specific plans, untrained or under-trained employees, missed annual refreshers, no emergency response plan, and no medical surveillance for respirator users and HAZMAT teams.'],
      ['Who can train employees in HAZWOPER?', 'Trainers must be qualified to instruct by having completed a training program for the subjects they teach, or by academic credentials and instructional experience, under 1910.120(e)(5).'],
      ['What HAZWOPER records must employers keep?', 'Training certificates for every employee, documentation of field experience and refreshers, medical surveillance records (employment plus 30 years), and exposure monitoring records.'],
    ],
  },
];
