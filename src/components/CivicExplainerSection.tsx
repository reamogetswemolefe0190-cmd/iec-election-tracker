'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BookOpen, ChevronDown, ChevronUp, Scale, Vote, CheckSquare, Users } from 'lucide-react';

interface ExplainerItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  shortSummary: string;
  fullExplanation: string;
  keyRule: string;
}

export function CivicExplainerSection() {
  const [expandedId, setExpandedId] = useState<string | null>('ballots');

  const items: ExplainerItem[] = [
    {
      id: 'ballots',
      icon: <Vote className="w-4 h-4 text-primary" />,
      title: 'Ward vs PR Ballots — How Local Government Votes Work',
      shortSummary: 'In Municipal Elections (LGE), voters receive 2 (or 3) ballot papers.',
      fullExplanation:
        'Local councils use a mixed electoral system combining direct representation and party proportionality. On the Ward Ballot, you vote for a specific candidate to represent your immediate neighborhood. On the PR (Proportional Representation) Ballot, you vote for a political party. In non-metro municipalities, you also receive a District Council Ballot.',
      keyRule: 'Rule: Council seats are balanced so each party’s total seats reflect its overall PR share.',
    },
    {
      id: 'coalitions',
      icon: <Scale className="w-4 h-4 text-amber-400" />,
      title: 'Hung Councils & The 50% + 1 Majority Rule',
      shortSummary: 'When no single party wins an absolute majority of council seats.',
      fullExplanation:
        'To elect an Executive Mayor, Council Speaker, and pass annual municipal budgets, a party needs 50% plus 1 of the council seats (e.g., 108 of 214 seats in Tshwane). If the leading party fails to reach this threshold, the council is "Hung". Parties have 14 days after results are declared to negotiate a formal governing coalition or supply agreement.',
      keyRule: 'Rule: Semicircle balance shows how close any party or bloc is to the 50%+1 threshold.',
    },
    {
      id: 'declared',
      icon: <CheckSquare className="w-4 h-4 text-emerald-400" />,
      title: 'Preliminary Count vs Official IEC Declaration',
      shortSummary: 'Why counting numbers shift throughout election night.',
      fullExplanation:
        'Votes are initially counted by hand at individual voting stations directly after polls close at 21:00, overseen by independent party agents. Results slips are then scanned and uploaded to the IEC central results system. A council or ward is only marked "Declared" after 100% of voting district slips are verified, audited, and cleared of legal objections.',
      keyRule: 'Rule: Early rural counts report first; high-density urban wards report later.',
    },
    {
      id: 'turnout',
      icon: <Users className="w-4 h-4 text-sky-400" />,
      title: 'Voter Turnout & Spoilt Ballots',
      shortSummary: 'How turnout percentages are officially calculated by the IEC.',
      fullExplanation:
        'Voter turnout is calculated as the sum of all valid votes plus rejected/spoilt ballots, expressed as a percentage of registered voters on the voters roll for that voting district or municipality. A ballot is ruled spoilt if a voter marks multiple candidates, writes identifying marks, or leaves the paper blank.',
      keyRule: 'Rule: Turnout figures exclude unregistered residents and only count registered voters.',
    },
  ];

  return (
    <Card className="p-5 sm:p-6 border-border/80 bg-card space-y-4">
      <CardHeader className="p-0 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg">
              Civic Guide: Understanding South African Election Results
            </CardTitle>
            <CardDescription className="text-xs">
              Demystifying electoral rules, council mathematics, and official declaration criteria
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all p-4 flex flex-col justify-between ${
                isExpanded
                  ? 'bg-muted/30 border-primary/40 shadow-xs'
                  : 'bg-card/60 border-border/70 hover:border-border hover:bg-muted/20'
              }`}
            >
              <div>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full flex items-start justify-between gap-2 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                  <span className="p-1 rounded-md text-muted-foreground group-hover:text-foreground">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </button>

                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {item.shortSummary}
                </p>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-2 animate-in fade-in duration-200">
                    <p className="text-xs text-foreground/90 leading-relaxed">
                      {item.fullExplanation}
                    </p>
                    <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-[11px] font-medium text-primary">
                      {item.keyRule}
                    </div>
                  </div>
                )}
              </div>

              {!isExpanded && (
                <button
                  type="button"
                  onClick={() => setExpandedId(item.id)}
                  className="text-[11px] text-primary hover:underline font-semibold mt-3 self-start cursor-pointer"
                >
                  Learn how this works →
                </button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
