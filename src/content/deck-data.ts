/**
 * Single source of truth for the Project Olympus investor site.
 * Edit values here — no magic numbers in components or animations.
 *
 * Source: /source/Project_Olympus_Investor_Deck_v4.pptx (April 2026)
 */

export const meta = {
  project: "Project Olympus",
  subtitle: "An Institutional Carve-Out Investment Opportunity",
  asOf: "April 2026",
  classification: "Strictly Private & Confidential",
  thesis:
    "Validated earnings, contracted visibility, margin trajectory — at a disciplined entry multiple.",
  closingStatement:
    "A rare combination of contracted government demand, operational improvement potential, and platform scalability at a disciplined entry multiple.",
} as const;

export const contact = {
  email: "info@cresthaven.com",
  address: "3333 Michelson Dr, Suite 300, Irvine, CA 92612",
  url: "www.cresthaven.com",
} as const;

// ─── Section 2 — The Snapshot ───────────────────────────────────────
export const snapshot = [
  {
    value: 245,
    prefix: "$",
    suffix: "M",
    label: "Revenue",
    sub: "FY25A",
  },
  {
    value: 27.7,
    prefix: "$",
    suffix: "M",
    label: "Adjusted EBITDA",
    sub: "Grant Thornton verified",
    decimals: 1,
  },
  {
    value: 800,
    prefix: "$",
    suffix: "M+",
    label: "Contracted Backlog",
    sub: "Multi-year programs",
  },
  {
    value: 6.3,
    prefix: "~",
    suffix: "x",
    label: "Entry Multiple",
    sub: "On FY25A EBITDA",
    decimals: 1,
  },
] as const;

// ─── Section 3 — The Floor ──────────────────────────────────────────
export const revenueMix = [
  { label: "Government Programs", percent: 85, tone: "primary" as const },
  { label: "VIP Completions", percent: 10, tone: "secondary" as const },
  { label: "Aftermarket", percent: 5, tone: "tertiary" as const },
];

export const demandAnchors = [
  {
    title: "Air Force One",
    detail: "$4.2B total program value, multi-decade commitment",
    expanded: "The VC-25B program totals $4.2B across two aircraft. Greenpoint's existing Boeing qualification, active security clearances, and interior modification expertise position it as a primary subcontractor for VIP and crew cabin fitout across the program's full lifecycle.",
  },
  {
    title: "E-4C Recapitalization",
    detail: "~$13B program ($889M–$1.9B/yr FY24–27)",
    expanded: "The E-4C 'Nightwatch' Airborne Command Post replacement is among the largest single defense aviation programs in the U.S. budget. Greenpoint's active participation in the predecessor E-4B program and its classified modification experience make it a natural incumbent candidate for interior systems integration.",
  },
  {
    title: "C-32A Fleet",
    detail: "25+ year old fleet, replacement studies initiated",
    expanded: "The C-32A (Boeing 757 VIP transport) fleet supporting Congressional and Cabinet travel averages 26 years of service. Greenpoint's 757 modification certification and VIP interior expertise make it a direct-award candidate for any fleet transition or deep refurbishment program.",
  },
  {
    title: "VIP / Aftermarket",
    detail: "Recurring revenue from 60+ delivered aircraft",
    expanded: "Greenpoint has completed interior modifications on 61 aircraft across 30+ years. Each delivered aircraft represents a recurring aftermarket opportunity — upgrades, refurbishments, and modifications typically return 18–24% of original program value over the aircraft's operational life.",
  },
];

export const visibilityTotals = {
  contracted: 800,
  pipeline: 600,
  total: 1400,
} as const;

// ─── Section 4 — Three-Phase Growth Architecture ────────────────────
export const phases = [
  {
    number: "01",
    name: "The Floor",
    headline: "Protect the Base",
    metrics: [
      { label: "Revenue", value: "$245M" },
      { label: "EBITDA", value: "$27.7M" },
      { label: "Backlog", value: "$800M+" },
    ],
    bullets: [
      "Government contracts provide multi-year visibility",
      "Boeing relationship since 1987",
      "60+ aircraft delivered, certification moat",
    ],
  },
  {
    number: "02",
    name: "The Lift",
    headline: "Operational Optimization",
    metrics: [
      { label: "Target Margin", value: "15–18%" },
      { label: "Revenue Growth", value: "$300M+" },
      { label: "Pipeline", value: "$600M+" },
    ],
    bullets: [
      "Overhead rationalization and procurement",
      "Mix shift: higher-margin VIP and aftermarket",
      "6-phase vertically integrated lifecycle",
    ],
  },
  {
    number: "03",
    name: "The Compounding",
    headline: "Platform Scale",
    metrics: [
      { label: "Market CAGR", value: "5.8%" },
      { label: "MRO TAM", value: "$124B+" },
      { label: "Visibility", value: "$1.4B+" },
    ],
    bullets: [
      "E-4C recapitalization (~$13B program)",
      "Aging global fleet drives aftermarket demand",
      "Skilled labor scarcity deepens competitive moat",
    ],
  },
] as const;

// ─── Section 5 — The Asset ──────────────────────────────────────────
export const asset = {
  name: "Greenpoint Technologies, Inc.",
  shortName: "Greenpoint Technologies",
  pullQuote: "One of two globally authorized Boeing completion centers.",
  intro:
    "A leading provider of bespoke turnkey aircraft interior completions for Government / Military, Heads of State, and V-VIP clients globally.",
  stats: [
    { label: "Founded", value: "1987" },
    { label: "Employees", value: "350+" },
    { label: "Engineers", value: "200+" },
    { label: "Facilities", value: "5" },
    { label: "Aircraft Delivered", value: "61" },
    { label: "Boeing Quality Rating", value: "100%" },
    { label: "On-Time Delivery", value: "99%" },
    { label: "Headquarters", value: "Bothell, WA" },
  ],
} as const;

// ─── Section 6 — Scenario Analysis ──────────────────────────────────
// Years: FY26E – FY30E. Anchored to GT-verified FY25A actuals.
export const scenarios = {
  years: ["FY26E", "FY27E", "FY28E", "FY29E", "FY30E"] as const,
  base: {
    name: "Base Case",
    description: "Revised CrestHaven underwriting anchored to FY26 rebase",
    revenue: [226.5, 244.2, 268.9, 294.5, 315.0],
    ebitda: [29.4, 31.7, 34.1, 36.0, 37.9],
    finalRevenue: 315,
    finalEbitda: 37.9,
  },
  underwritten: {
    name: "Underwritten",
    description: "10% floor — disciplined deployment of pipeline",
    revenue: [232.0, 256.5, 285.0, 322.4, 360.0],
    ebitda: [30.2, 33.5, 37.1, 40.5, 43.6],
    finalRevenue: 360,
    finalEbitda: 43.6,
  },
  upside: {
    name: "Upside",
    description: "Pipeline conversion + Airbus ACJ certification flywheel",
    revenue: [241.0, 280.0, 340.5, 410.2, 485.0],
    ebitda: [31.0, 35.7, 41.2, 45.5, 49.3],
    finalRevenue: 485,
    finalEbitda: 49.3,
  },
  // Historical for the standalone reveal chart
  historical: {
    years: ["2021A", "2022A", "2023A", "2024A", "2025A", "2026E", "2027E"] as const,
    revenue: [52.7, 98.5, 169.1, 213.0, 245.2, 226.5, 214.3],
    ebitda: [6.2, 9.9, 17.0, 21.2, 27.7, 36.2, 37.1],
  },
  exitNote: "Exit at 7x FY30E EBITDA. FY25A per Grant Thornton QofE.",
} as const;

// ─── Section 7 — The Transaction ────────────────────────────────────
export const transaction = {
  enterpriseValue: 175,
  capitalStack: [
    {
      label: "Seller Note",
      amount: 50,
      detail: "Senior secured, 3-year, 7%/9%/11% step",
    },
    {
      label: "Performance Earnout",
      amount: 25,
      detail: "Subordinated, 2026–2028",
    },
    {
      label: "Structured Capital",
      amount: 100,
      detail: "Open architecture: senior debt, mezzanine, preferred, common",
    },
  ],
  thesis: [
    {
      title: "Defensible Revenue Base",
      body: "85%+ government revenue with multi-year contracts. $800M+ contracted backlog provides 3+ years of revenue visibility with limited customer concentration risk.",
    },
    {
      title: "Operational Upside",
      body: "Margin expansion from 11% to 15–18% through overhead rationalization, procurement optimization, and revenue mix shift toward higher-margin VIP and aftermarket.",
    },
    {
      title: "Secular Demand Tailwinds",
      body: "Aerospace engineering services growing at 5.8% CAGR to $81.7B. MRO market expanding to $124B+. Aging military and VIP fleets drive replacement and upgrade demand.",
    },
    {
      title: "Irreplaceable Competitive Position",
      body: "37+ year Boeing relationship, 60+ aircraft delivered. Vertically integrated 6-phase modification lifecycle. Security clearances and certifications create structural barriers to entry.",
    },
  ],
  dealTerms: [
    { label: "Entry Multiple", value: "~6.3x EBITDA" },
    { label: "Hold Period", value: "5–7 Years" },
    { label: "Target IRR", value: "30–40%" },
    { label: "Target MOIC", value: "4.0–6.0x" },
    { label: "Structure", value: "Equity + Acq. Term Loan" },
    { label: "Downside Protection", value: "Contracted Revenue" },
  ],
  // Precedent transaction comps — aerospace / defense carve-outs
  comparables: {
    rows: [
      { target: "StandardAero",       acquirer: "Carlyle Group",      year: "2015", ev: "$2.6B", multiple: "8.5x" },
      { target: "Vertex Aerospace",   acquirer: "ST Engineering",     year: "2021", ev: "$2.7B", multiple: "10.5x" },
      { target: "Kaman Aerospace",    acquirer: "Arcline Investment",  year: "2023", ev: "$1.7B", multiple: "9.1x" },
      { target: "Chromalloy",         acquirer: "Greenbriar Equity",  year: "2012", ev: "$0.9B", multiple: "7.5x" },
      { target: "LMI Aerospace",      acquirer: "Ducommun Inc.",      year: "2019", ev: "$1.0B", multiple: "8.2x" },
    ],
    medianMultiple: "8.5x",
    entryMultiple: "~6.4x",
    source: "Capital IQ, Bloomberg, public filings. Multiples on LTM EBITDA at announcement.",
  },
} as const;

// ─── Section 8 — The Ask ────────────────────────────────────────────
export const ask = {
  amount: "$100M",
  headline: "We are seeking $100M in structured capital.",
  body: "Open architecture: senior debt, mezzanine, preferred equity, common equity — or any combination.",
} as const;

// ─── Section 9 — The Team ───────────────────────────────────────────
export const principals = [
  {
    name: "Maury W. Bradsher",
    title: "Platform Architect",
    sub: "Federal & Defense Markets Authority",
    paragraphs: [
      "One of the preeminent platform builders in U.S. aerospace and defense with a 17-year track record of sourcing proprietary opportunities, engineering complex carve-outs, and transforming federal and defense businesses into high-performing, institutional-grade platforms.",
      "Portfolio includes Ridgewood Technology Partners (PEI 2014), ASSETT Inc., and WWC Global (PE Wire 2023). Board Member of the MITRE Corporation and its Aviation Committee.",
    ],
    credentials:
      "B.S. North Carolina A&T State University · MBA, New York University · Board Member, MITRE Corporation",
  },
  {
    name: "Ted Colbert",
    title: "Fortune-50 Executive",
    sub: "Global Aerospace & Defense Authority",
    paragraphs: [
      "Over 25 years of leadership across industrial and aerospace sectors, including 15 years at Boeing where he served as CEO of Boeing Defense, Space & Security, CEO of Boeing Global Services, and Chief Information and Digital Officer.",
      "Former Board Chair of the Aerospace Industries Association. Member of the National Academy of Engineering with deep expertise in systems integration and operational readiness.",
    ],
    credentials:
      "B.S. Industrial Engineering, Georgia Institute of Technology · B.S. Morehouse College · National Academy of Engineering",
  },
  {
    name: "Josh Childress",
    title: "Co-Founder & Managing Partner",
    sub: "Global Capital Formation Authority",
    paragraphs: [
      "Co-Founder and Managing Partner of CrestHaven leading firm strategy across high-barrier, performance-driven opportunities in aerospace, defense, critical infrastructure, and complex development.",
      "Involved in over $500M of transactions with deep alignment among institutional investors, sovereign wealth funds, family offices, and operating partners across six continents.",
    ],
    credentials:
      "B.A. Stanford University · Stanford Athletics Board · Harvard Business School Executive Education",
  },
] as const;

export const team = [
  {
    name: "Treana L. Allen",
    role: "Co-Founder, CLO",
    detail:
      "10+ years legal & in-house counsel. CLO & Partner at LandSpire Group. Former Investor-in-residence at TPG.",
  },
  {
    name: "Edwin Draughan",
    role: "Advisor — Infrastructure & Partnerships",
    detail:
      "M&A and capital raising at Park Lane. Advises on critical infrastructure and asset platform opportunities.",
  },
  {
    name: "Jeff Mitchell",
    role: "Principal — Underwriting & Capital Formation",
    detail:
      "15+ years underwriting and investment analysis. CFA. Managed over $6B in projects across development, leasing, and debt.",
  },
  {
    name: "AJ Schechter",
    role: "Associate — Business Development",
    detail:
      "6+ years across finance, investments, marketing, and business operations. Co-Founder of ItsYouAI; serial entrepreneur.",
  },
] as const;

// ─── Section 10 — Track Record ──────────────────────────────────────
export const trackRecord = {
  realizedMOIC: "5.16x",
  rows: [
    {
      asset: "Asset I",
      acquired: "Sept. 2006",
      invested: "$19.0M",
      proceeds: "$85.0M",
      moic: "4.5x",
    },
    {
      asset: "Asset II",
      acquired: "Aug. 2018",
      invested: "$5.0M",
      proceeds: "$30.0M",
      moic: "6.0x",
    },
    {
      asset: "Asset III (Active)",
      acquired: "Aug. 2022",
      invested: "$45.0M",
      proceeds: "Active",
      moic: "—",
    },
    {
      asset: "Ridgewood Merger",
      acquired: "Nov. 2015",
      invested: "$2.0M",
      proceeds: "$10.0M",
      moic: "5.0x",
    },
  ],
  awards: [
    {
      label: "PEI 2014",
      detail: "Successful investment and transformation of Ridgewood Technology Partners",
    },
    {
      label: "PE Wire 2023",
      detail: "Innovative WWC Global investment partnership",
    },
    {
      label: "TPG Next 2023",
      detail: "Selected as one of three strategic partners for TPG's next-generation platform",
    },
  ],
} as const;

// ─── Section 12 — Disclosure ────────────────────────────────────────
export const disclosure = {
  paragraphs: [
    "By accepting and viewing this presentation, recipients or potential investors acknowledge that they have read, understood, and accepted the terms of this disclaimer. This presentation contains confidential and proprietary information and may not be disclosed, reproduced, or distributed, in whole or in part, without the prior written consent of CrestHaven Capital (\"CrestHaven\") or its authorized representatives.",
    "No representation or warranty, express or implied, is or will be given by CrestHaven, its affiliates, directors, officers, employees, agents, or advisors, or any other person, as to the accuracy, completeness, reasonableness, or fairness of the information contained in this presentation, and no responsibility or liability whatsoever is accepted for any such information. Any reliance placed on the information contained in this presentation is strictly at the recipient's own risk.",
    "This presentation does not constitute legal, tax, investment, or other advice, and recipients are strongly encouraged to consult their own independent professional advisors before making any investment decisions. Neither CrestHaven nor any of its affiliates or representatives shall be liable for any direct, indirect, or consequential loss or damage resulting from reliance on this presentation or any of its content. All liability is expressly disclaimed.",
    "This presentation is not an offer to sell or a solicitation of an offer to buy securities or other financial instruments in any jurisdiction where such offer or solicitation would be unlawful. Any offer or solicitation will be made only through formal offering documents, which must be reviewed in their entirety before making any investment decisions. No securities may be sold or offered in any jurisdiction unless they are registered or exempt from registration under applicable securities laws.",
    "This presentation contains forward-looking statements that involve substantial risks and uncertainties. These statements are based on assumptions, expectations, and projections as of the date hereof and are subject to a variety of risks and factors, many of which are beyond the control of CrestHaven. Actual results, performance, or achievements may differ materially from those expressed or implied by these forward-looking statements.",
    "All information provided herein speaks only as of the date of this presentation. No duty to update or revise the information herein is assumed by CrestHaven or any of its representatives. Information sourced from third parties has not been independently verified, and no representation is made as to its accuracy or completeness.",
    "This presentation is intended solely for sophisticated and institutional investors who are capable of evaluating the risks and merits of the Firm's strategy and should not be shared with any unauthorized persons.",
  ],
} as const;

// ─── Animation timing constants (single source for tweens) ──────────
export const motion = {
  ease: "expo.out",
  durationFast: 0.6,
  duration: 0.9,
  durationSlow: 1.2,
  countUpDuration: 1.8,
  stagger: 0.1,
  scrollStart: "top 75%",
} as const;
