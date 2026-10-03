/* eslint-disable react/jsx-key */
const containt = [
  {
    smallTitle: 'Build',
    bigTitle: 'AI Product Engineering',
    desc: [
      <div className="p-l">We design and build AI products that solve real business problems, not science</div>,
      <div className="p-l">experiments. From LLM apps and autonomous agents to computer vision and predictive</div>,
      <div className="p-l">models, we ship production-grade systems that scale with you.</div>,
    ],
    descMobile: [
      <div className="p-l">We design and build AI products that solve real business</div>,
      <div className="p-l">problems, not science experiments. From LLM apps and</div>,
      <div className="p-l">autonomous agents to computer vision and predictive models,</div>,
      <div className="p-l">we ship production-grade systems that scale with you.</div>,
    ],
    options: [
      { title: 'LLM Applications', desc: 'Build custom copilots, chat assistants and content tools on the best-fit language models' },
      { title: 'AI Agents & Automation', desc: 'Deploy agents that plan, use your tools and complete multi-step workflows end to end' },
      { title: 'RAG & Knowledge Assistants', desc: 'Turn your documents and data into a secure assistant that answers with exact citations' },
      { title: 'Voice AI', desc: 'Create natural voice agents for support, sales and operations in English, Hindi and more' },
      { title: 'Computer Vision', desc: 'Detect, classify and inspect from images and video for quality, safety and retail use cases' },
      { title: 'Predictive ML', desc: 'Forecast demand, score risk and spot anomalies with models trained on your own data' },
      { title: 'AI MVPs for Founders', desc: 'Go from idea to a launch-ready AI product in weeks, built to win users and investors' },
      { title: 'Systems Integration', desc: 'Connect AI to your CRM, ERP, data warehouse and internal tools without disrupting operations' },
      { title: 'Web & Mobile AI Apps', desc: 'Ship polished web and mobile experiences with AI at their core, from first screen to app store' },
    ],
  },
  {
    smallTitle: 'Strategy',
    bigTitle: 'AI Strategy & Advisory',
    desc: [
      <div className="p-l">We help leadership teams find where AI creates real value, then plan how to get there.</div>,
      <div className="p-l">From readiness audits and use-case discovery to ROI models and governance, we make</div>,
      <div className="p-l">sure every AI investment is focused, measurable and safe.</div>,
    ],
    descMobile: [
      <div className="p-l">We help leadership teams find where AI creates real value,</div>,
      <div className="p-l">then plan how to get there. From readiness audits and</div>,
      <div className="p-l">use-case discovery to ROI models and governance, we make</div>,
      <div className="p-l">sure every AI investment is focused, measurable and safe.</div>,
    ],
    options: [
      { title: 'AI Readiness Audit', desc: 'Assess your data, systems and teams to see where AI can deliver value fastest' },
      { title: 'Use-Case Discovery', desc: 'Run focused workshops to find and rank the highest-impact AI opportunities in your business' },
      { title: 'ROI & Business Case', desc: 'Model costs, savings and revenue impact so every AI project starts with a clear business case' },
      { title: 'Build vs Buy', desc: 'Compare off-the-shelf tools, APIs and custom builds to choose the right path for each problem' },
      { title: 'Model & Vendor Selection', desc: 'Benchmark models and providers on your own tasks for quality, cost, latency and privacy' },
      { title: 'Data Strategy', desc: 'Plan the data foundations, pipelines and labelling your AI roadmap will depend on' },
      { title: 'Governance & Compliance', desc: 'Set up responsible AI policies, risk reviews and audit trails that satisfy regulators' },
      { title: 'Team Enablement', desc: 'Train your teams to use, evaluate and build with AI confidently in their daily work' },
    ],
  },
  {
    smallTitle: 'Scale',
    bigTitle: 'MLOps & Reliability',
    desc: [
      <div className="p-l">Shipping AI is only the beginning. We keep your models accurate, fast and affordable</div>,
      <div className="p-l">after launch, with evaluation pipelines that catch regressions before users do, and</div>,
      <div className="p-l">guardrails that keep every output safe and on-brand. Our services cover everything</div>,
      <div className="p-l">from monitoring and cost optimization to fine-tuning and secure hosting, so your AI</div>,
      <div className="p-l">keeps getting better over time.</div>,
    ],
    descMobile: [
      <div className="p-l">Shipping AI is only the beginning. We keep your models</div>,
      <div className="p-l">accurate, fast and affordable after launch, with evaluation</div>,
      <div className="p-l">pipelines that catch regressions before users do, and</div>,
      <div className="p-l">guardrails that keep every output safe and on-brand. From</div>,
      <div className="p-l">monitoring and cost optimization to fine-tuning and secure</div>,
      <div className="p-l">hosting, your AI keeps getting better over time.</div>,
    ],
    options: [
      { title: 'Evaluation Pipelines', desc: 'Measure accuracy, safety and quality on every release with automated, task-specific test suites' },
      { title: 'Guardrails & Safety', desc: 'Filter harmful, off-topic or confidential outputs and keep responses on-brand and compliant' },
      { title: 'Observability', desc: 'Track latency, cost, usage and answer quality in real time, with alerts when anything drifts' },
      { title: 'Cost Optimization', desc: 'Cut inference costs with caching, routing, smaller models and smarter prompts without losing quality' },
      { title: 'Fine-Tuning', desc: 'Adapt open and commercial models to your domain, tone and tasks for higher accuracy' },
      { title: 'Secure Deployment', desc: 'Host models in your own cloud or on-premise with encryption, access control and full audit logs' },
    ],
  },
];
export default containt;
