export interface MunicipalCoalitionDossier {
  councilName: string;
  code: string;
  totalSeats: number;
  majorityThreshold: number;
  currentMayor: {
    name: string;
    party: string;
    deputyMayor?: string;
    deputyParty?: string;
    electedDate: string;
    status: string;
  };
  coalitionPactName: string;
  governingParties: string[];
  pastCoalitionsTimeline: {
    period: string;
    mayor: string;
    parties: string;
    outcome: string;
  }[];
  breakingNewsAndFlashpoints: {
    title: string;
    summary: string;
    tag: 'Coalition Shift' | 'Service Delivery' | 'Legal' | 'Budget';
  }[];
  presets: {
    label: string;
    parties: string[];
    description: string;
  }[];
}

export const MUNICIPAL_COALITION_DOSSIERS: Record<string, MunicipalCoalitionDossier> = {
  TSH: {
    councilName: 'City of Tshwane Metropolitan Council',
    code: 'TSH',
    totalSeats: 214,
    majorityThreshold: 108,
    currentMayor: {
      name: 'Dr. Nasiphi Moya',
      party: 'ActionSA',
      deputyMayor: 'Eugene Modise',
      deputyParty: 'ANC',
      electedDate: 'October 2024',
      status: 'ActionSA-ANC-EFF Cooperative Governing Bloc (122+ seats)',
    },
    coalitionPactName: 'Multi-Party Cooperation Arrangement',
    governingParties: ['ActionSA', 'ANC', 'EFF', 'AIC', 'PAC'],
    pastCoalitionsTimeline: [
      {
        period: '2021 – March 2023',
        mayor: 'Randall Williams (DA)',
        parties: 'DA + ActionSA + VF Plus + ACDP',
        outcome: 'Resigned amid Auditor-General adverse audit findings and R10bn procurement investigation.',
      },
      {
        period: 'March 2023 – Sept 2024',
        mayor: 'Cilliers Brink (DA)',
        parties: 'DA + ActionSA + VF Plus + ACDP + IFP (Multi-Party Charter)',
        outcome: 'Ousted on 26 September 2024 via Motion of No Confidence (120-87) after ActionSA withdrew from the Charter.',
      },
      {
        period: 'October 2024 – Present',
        mayor: 'Dr. Nasiphi Moya (ActionSA)',
        parties: 'ActionSA + ANC + EFF + smaller parties',
        outcome: 'Elected with 122 votes against Cilliers Brink (86 votes); Eugene Modise (ANC) elected Deputy Mayor.',
      },
    ],
    breakingNewsAndFlashpoints: [
      {
        title: 'ActionSA-ANC Coalition Consolidation',
        summary: 'ActionSA secured the mayoral chain with Dr. Nasiphi Moya while the ANC chairs Finance and the EFF leads key service delivery portfolios.',
        tag: 'Coalition Shift',
      },
      {
        title: 'Rooiwal Wastewater & Hammanskraal Water',
        summary: 'Mayoral committee prioritizing Rooiwal plant overhaul and clean tap water delivery following Hammanskraal cholera crisis.',
        tag: 'Service Delivery',
      },
      {
        title: 'Eskom & Rand Water Arrears',
        summary: 'Tshwane continues negotiating debt repayment arrangements with Eskom (>R4bn) and water pressure restrictions.',
        tag: 'Budget',
      },
    ],
    presets: [
      {
        label: 'Current Governing Bloc (Moya)',
        parties: ['ActionSA', 'ANC', 'EFF'],
        description: 'Current ActionSA-led administration backed by ANC & EFF (122 seats).',
      },
      {
        label: 'Former Charter (Brink Era)',
        parties: ['DA', 'ActionSA', 'VF Plus', 'ACDP'],
        description: 'Multi-Party Charter alignment that governed Tshwane from 2021 to 2024.',
      },
      {
        label: 'Grand Coalition (DA + ANC)',
        parties: ['DA', 'ANC'],
        description: 'Two largest caucuses combined, surpassing the 108 threshold comfortably.',
      },
    ],
  },
  JHB: {
    councilName: 'City of Johannesburg Metropolitan Council',
    code: 'JHB',
    totalSeats: 270,
    majorityThreshold: 136,
    currentMayor: {
      name: 'Dada Morero',
      party: 'ANC',
      deputyMayor: 'Nobuhle Mthembu (Speaker)',
      deputyParty: 'ActionSA',
      electedDate: 'August 2024',
      status: 'Expanded Government of Local Unity (GLU)',
    },
    coalitionPactName: 'Expanded Government of Local Unity (GLU)',
    governingParties: ['ANC', 'ActionSA', 'PA', 'Al Jam-ah', 'AIC'],
    pastCoalitionsTimeline: [
      {
        period: '2021 – early 2023',
        mayor: 'Dr. Mpho Phalatse (DA)',
        parties: 'DA + ActionSA + VF Plus + ACDP + IFP',
        outcome: 'Ousted in Jan 2023 via ANC-EFF-PA motion of no confidence.',
      },
      {
        period: 'May 2023 – Aug 2024',
        mayor: 'Kabelo Gwamanda (Al Jam-ah)',
        parties: 'ANC + EFF + PA + Al Jam-ah (GLU minority mayor arrangement)',
        outcome: 'Resigned under public outcry over infrastructure collapse and historical fraud charges.',
      },
      {
        period: 'August 2024 – Present',
        mayor: 'Dada Morero (ANC)',
        parties: 'ANC + ActionSA (cooperation pact) + PA + Al Jam-ah',
        outcome: 'Elected with 189 votes; ActionSA took the Speaker of Council seat (Nobuhle Mthembu).',
      },
    ],
    breakingNewsAndFlashpoints: [
      {
        title: 'ActionSA Cooperative Arrangement',
        summary: 'ActionSA agreed to vote with ANC in Johannesburg in exchange for the Speaker position and mutual support in Tshwane.',
        tag: 'Coalition Shift',
      },
      {
        title: 'Joburg Water Commando System',
        summary: 'Severe water distribution challenges affecting Crown Mines, Linden, Blairgowrie, and Randburg water reservoirs.',
        tag: 'Service Delivery',
      },
      {
        title: 'Gwamanda Dismissal from Mayoral Committee',
        summary: 'Mayor Dada Morero dismissed former mayor Kabelo Gwamanda from MMC post following police arrest in Oct 2024.',
        tag: 'Legal',
      },
    ],
    presets: [
      {
        label: 'Current GLU (Morero)',
        parties: ['ANC', 'ActionSA', 'PA', 'Al Jam-ah'],
        description: 'Active governing arrangement commanding a decisive 150+ majority.',
      },
      {
        label: 'Left Alignment (ANC + EFF)',
        parties: ['ANC', 'EFF'],
        description: 'Historical voting bloc that governed Joburg throughout 2023-2024.',
      },
      {
        label: 'Opposition Bloc (DA + Charter)',
        parties: ['DA', 'ActionSA', 'VF Plus', 'ACDP'],
        description: 'Multi-Party Charter formulation from the 2021 election.',
      },
    ],
  },
  EKU: {
    councilName: 'City of Ekurhuleni Metropolitan Council',
    code: 'EKU',
    totalSeats: 224,
    majorityThreshold: 113,
    currentMayor: {
      name: 'Nkosindiphile Xhakaza',
      party: 'ANC',
      electedDate: 'April 2024',
      status: 'ANC Minority Executive Administration',
    },
    coalitionPactName: 'ANC-Led Municipal Governance Framework',
    governingParties: ['ANC', 'AIC', 'smaller parties'],
    pastCoalitionsTimeline: [
      {
        period: '2021 – March 2023',
        mayor: 'Tania Campbell (DA)',
        parties: 'DA-led coalition',
        outcome: 'Ousted in March 2023 by ANC-EFF voting bloc.',
      },
      {
        period: 'March 2023 – March 2024',
        mayor: 'Sivuyile Ngodwana (AIC)',
        parties: 'AIC + ANC + EFF (EFF provincial leader Nkululeko Dunga held Finance MMC)',
        outcome: 'Voted out on 28 March 2024 after council financial distress and budget gridlock.',
      },
      {
        period: 'April 2024 – Present',
        mayor: 'Nkosindiphile Xhakaza (ANC)',
        parties: 'ANC minority administration',
        outcome: 'Elected unopposed on 11 April 2024.',
      },
    ],
    breakingNewsAndFlashpoints: [
      {
        title: 'Rupture Between ANC and EFF',
        summary: 'Mayor Xhakaza fired EFF leader Nkululeko Dunga as Finance MMC in June 2024, leading to the collapse of the ANC-EFF pact in Ekurhuleni.',
        tag: 'Coalition Shift',
      },
      {
        title: 'Stabilizing Municipal Finances',
        summary: 'City working to clear audit qualifications and stabilize payments to municipal waste and power contractors.',
        tag: 'Budget',
      },
    ],
    presets: [
      {
        label: 'Current ANC-Led Bloc',
        parties: ['ANC', 'PA', 'AIC'],
        description: 'Current minority arrangement in council.',
      },
      {
        label: 'Former ANC-EFF Alliance',
        parties: ['ANC', 'EFF'],
        description: 'Combined voting majority that unseated DA in 2023.',
      },
      {
        label: 'DA Alternative',
        parties: ['DA', 'ActionSA', 'VF Plus'],
        description: 'Opposition caucuses representing eastern Gauteng wards.',
      },
    ],
  },
  NMA: {
    councilName: 'Nelson Mandela Bay Metropolitan Council',
    code: 'NMA',
    totalSeats: 120,
    majorityThreshold: 61,
    currentMayor: {
      name: 'Babalwa Lobishe',
      party: 'ANC',
      deputyMayor: 'Gary van Niekerk',
      deputyParty: 'National Alliance (NA)',
      electedDate: 'October 2024',
      status: 'ANC-Led Coalition (62 seats)',
    },
    coalitionPactName: 'ANC-NA-PA Municipal Pact',
    governingParties: ['ANC', 'NA', 'PA', 'AIC'],
    pastCoalitionsTimeline: [
      {
        period: 'May 2023 – Oct 2024',
        mayor: 'Gary van Niekerk (National Alliance)',
        parties: 'NA + ANC + PA + AIM + smaller parties',
        outcome: 'Stepped down on 31 October 2024 as part of a negotiated leadership swap with the ANC.',
      },
      {
        period: 'October 2024 – Present',
        mayor: 'Babalwa Lobishe (ANC)',
        parties: 'ANC + NA + PA',
        outcome: 'Elected Executive Mayor; Van Niekerk became Deputy Executive Mayor.',
      },
    ],
    breakingNewsAndFlashpoints: [
      {
        title: 'Lobishe-Van Niekerk Governance Feud',
        summary: 'Public fallout between Mayor Lobishe and Deputy Mayor Van Niekerk over delegated authority and service delivery execution.',
        tag: 'Coalition Shift',
      },
      {
        title: 'Section 139 Oversight Warnings',
        summary: 'Eastern Cape provincial government issuing directives over financial governance and council infighting.',
        tag: 'Legal',
      },
    ],
    presets: [
      {
        label: 'Current Governing Bloc (Lobishe)',
        parties: ['ANC', 'NA', 'PA'],
        description: 'Governing pact holding a 62-seat bare majority.',
      },
      {
        label: 'DA-Led Opposition Bloc',
        parties: ['DA', 'VF Plus', 'ACDP'],
        description: 'Main opposition holding 52+ seats.',
      },
      {
        label: 'Grand Coalition (DA + ANC)',
        parties: ['DA', 'ANC'],
        description: '48 + 48 seats = 96 seats (overwhelming 80% majority).',
      },
    ],
  },
  ETH: {
    councilName: 'eThekwini Metropolitan Council (Durban)',
    code: 'ETH',
    totalSeats: 219,
    majorityThreshold: 110,
    currentMayor: {
      name: 'Cyril Xaba',
      party: 'ANC',
      deputyMayor: 'Zandile Myeni',
      deputyParty: 'NFP',
      electedDate: 'July 2024',
      status: 'ANC-NFP-EFF Minority Cooperation Pact',
    },
    coalitionPactName: 'Cooperative Governance Pact',
    governingParties: ['ANC', 'NFP', 'EFF'],
    pastCoalitionsTimeline: [
      {
        period: '2021 – June 2024',
        mayor: 'Mxolisi Kaunda (ANC)',
        parties: 'ANC + NFP + ABC + EFF (informal)',
        outcome: 'Recalled by ANC national leadership in June 2024 amid water crisis and beach closures.',
      },
      {
        period: 'July 2024 – Present',
        mayor: 'Cyril Xaba (ANC)',
        parties: 'ANC + NFP + EFF + Exco participation',
        outcome: 'Sworn in on 10 July 2024 to restore service delivery and fiscal discipline.',
      },
    ],
    breakingNewsAndFlashpoints: [
      {
        title: 'Cyril Xaba Turnaround Programme',
        summary: 'Prioritizing water and sanitation repairs, beach reopened, and addressing the 55% water loss in metro pipelines.',
        tag: 'Service Delivery',
      },
      {
        title: 'MK Party Surge in KZN By-Elections',
        summary: 'Umkhonto weSizwe Party contesting municipal wards aggressively across eThekwini.',
        tag: 'Coalition Shift',
      },
    ],
    presets: [
      {
        label: 'Current Coalition (Xaba)',
        parties: ['ANC', 'NFP', 'EFF'],
        description: 'ANC-led cooperative pact holding council leadership.',
      },
      {
        label: 'Opposition Bloc',
        parties: ['DA', 'IFP', 'ActionSA'],
        description: 'Constitutional opposition in eThekwini chamber.',
      },
      {
        label: 'Grand Coalition (ANC + DA)',
        parties: ['ANC', 'DA'],
        description: 'Stable 154-seat bipartisan municipal majority.',
      },
    ],
  },
};

export function getMunicipalDossier(codeOrName?: string | null): MunicipalCoalitionDossier | null {
  if (!codeOrName) return null;
  const upper = codeOrName.toUpperCase().trim();
  if (MUNICIPAL_COALITION_DOSSIERS[upper]) {
    return MUNICIPAL_COALITION_DOSSIERS[upper];
  }
  for (const [code, dossier] of Object.entries(MUNICIPAL_COALITION_DOSSIERS)) {
    if (
      upper.includes(code) ||
      upper.includes(dossier.councilName.toUpperCase()) ||
      dossier.councilName.toUpperCase().includes(upper)
    ) {
      return dossier;
    }
  }
  return null;
}
