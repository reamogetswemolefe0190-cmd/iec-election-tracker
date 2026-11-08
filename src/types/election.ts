export interface PartyMetadata {
  ID: number;
  Name: string;
  PartyFullName: string;
  sWebColour: string;
  sLeaderBoardColour: string;
  PartyImage: string;
}

export interface RawPartyResult {
  ID: number;
  TotalValidVotes?: number;
  PercOfVotes?: number;
  TotalSeatsWon?: number;
  WardSeatsWon?: number;
  PRSeatsWon?: number;
  CouncilsWon?: number;
  AvailableSeats?: number;
  IsLeadingParty?: boolean;
  IsLeadingPartyVotes?: boolean;
  bIsIndependent?: boolean;
  name?: string;
}

export interface RawMunicipalityResult {
  MunicipalityID: number;
  Municipality?: string;
  ProvinceID?: number;
  Province?: string;
  VDsComplete?: number;
  VDExpected?: number;
  Perc_VDsComplete?: number;
  SeatsComplete?: number;
  SeatsExpected?: number;
  HungCouncils?: number;
  MajorityCouncils?: number;
  RegisteredVoters?: number;
  TotalVotesCast?: number;
  ValidVotesCast?: number;
  PartyBallotResults?: RawPartyResult[];
}

export interface RawProvinceResult {
  ProvinceID: number;
  Province?: string;
  VDsComplete?: number;
  VDExpected?: number;
  Perc_Complete?: number;
  Perc_VDsComplete?: number;
  SeatsComplete?: number;
  SeatsExpected?: number;
  WardsComplete?: number;
  WardExpected?: number;
  PartyBallotResults?: RawPartyResult[];
  MunicipalityResults?: RawMunicipalityResult[];
}

export interface EnrichedPartyResult {
  id: number;
  abbr: string;
  fullName: string;
  color: string;
  logoUrl: string;
  votes: number;
  votePercentage: number;
  seats: number;
  wardSeats?: number;
  prSeats?: number;
  councilsWon?: number;
  isLeading: boolean;
  isIndependent: boolean;
  candidate?: string;
}

export interface MunicipalitySummary {
  municipalityId: number;
  name: string;
  code?: string;
  provinceId: number;
  provinceName: string;
  vdsComplete: number;
  vdExpected: number;
  percComplete: number;
  seatsComplete: number;
  seatsExpected: number;
  hungCouncil?: boolean;
  majorityWon?: boolean;
  totalVotesCast?: number;
  validVotesCast?: number;
  registeredVoters?: number;
  leadingParty?: {
    abbr: string;
    color: string;
    votes: number;
    percentage: number;
  };
  topParties: EnrichedPartyResult[];
  allParties?: EnrichedPartyResult[];
}

export interface ProvinceSummary {
  provinceId: number;
  name: string;
  vdsComplete?: number;
  vdExpected?: number;
  percComplete?: number;
  leadingParty?: {
    abbr: string;
    color: string;
    votes: number;
    percentage: number;
  };
  topParties: EnrichedPartyResult[];
  allParties?: EnrichedPartyResult[];
  municipalities?: MunicipalitySummary[];
}

export interface GpsLocation {
  latitude: number;
  longitude: number;
  province: string;
  municipality: string;
  ward: string;
  city: string;
}

export interface ElectionDataResponse {
  electoralEventId: number;
  electionYear: string;
  electionTitle: string;
  reportDate: string;
  lastUpdated: string;
  ballotType: string;
  stats: {
    registeredVoters: number;
    totalVotesCast: number;
    validVotesCast: number;
    spoiltVotes: number;
    specialVotes: number;
    percentagePoll: number;
    vdsComplete: number;
    vdExpected: number;
    seatsComplete: number;
    seatsExpected: number;
    wardsComplete: number;
    wardsExpected: number;
    municsComplete: number;
    municsExpected: number;
    percComplete: number;
  };
  leadingParty: EnrichedPartyResult | null;
  parties: EnrichedPartyResult[];
  provinces: ProvinceSummary[];
  municipalities?: MunicipalitySummary[];
  coalitionStats: {
    majorityThreshold: number;
    currentSeatsAllocated: number;
  };
}
