'use client';

import React, { useState, useEffect, useRef } from 'react';
import { EnrichedPartyResult } from '@/types/election';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PartyLogo } from '@/components/ui/party-logo';
import {
  Share2,
  Copy,
  Check,
  X,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Radio,
  Send,
  HelpCircle,
} from 'lucide-react';

export interface ShareSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: '2026' | '2024';
  scopeTitle: string;
  scopeType: 'Municipal' | 'Provincial' | 'National';
  countingProgress: number;
  vdsComplete: number;
  vdExpected: number;
  topParties: EnrichedPartyResult[];
  totalVotes: number;
  councilStatus?: string;
}

export function ShareSnapshotModal({
  isOpen,
  onClose,
  year,
  scopeTitle,
  scopeType,
  countingProgress,
  vdsComplete,
  vdExpected,
  topParties,
  totalVotes,
  councilStatus,
}: ShareSnapshotModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const [statusCopiedNotice, setStatusCopiedNotice] = useState(false);

  // Synchronize modal state with native HTML5 <dialog>
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
      setStatusCopiedNotice(false);
    }
  }, [isOpen]);

  const formatNum = (n: number) => new Intl.NumberFormat('en-ZA').format(n);

  const partySummary = topParties
    .slice(0, 3)
    .map(
      (p, idx) =>
        `${idx + 1}. ${p.abbr}: ${p.votePercentage.toFixed(2)}% (${formatNum(p.votes)} votes${
          p.seats > 0 ? ` • ${p.seats} seats` : ''
        })`
    )
    .join('\n');

  // Full rich text for Native Share & Clipboard (renders emojis faithfully without HTTP header encoding errors)
  const fullShareText = `🇿🇦 *IEC ${year} Live Election Tracker*
• *Scope:* ${scopeTitle} (${scopeType} Count)
• *Counting Progress:* ${countingProgress.toFixed(1)}% (${formatNum(vdsComplete)} of ${formatNum(vdExpected)} VDs counted)
${councilStatus ? `• *Council Status:* ${councilStatus}\n` : ''}• *Total Ballots Processed:* ${formatNum(totalVotes)}

🏆 *Current Standings:*
${partySummary}

🔗 *Live Tracker:* https://iec-election-tracker.vercel.app`;

  // Clean ASCII/BMP formatted text for wa.me URL query parameter.
  // Standard 4-byte emojis get corrupted into '' replacement diamonds by Windows WhatsApp Web's 302 redirect.
  // Using universal bullets ('•') guarantees pristine rendering without broken diamond symbols.
  const cleanUrlText = `[LIVE] IEC ${year} Live Election Tracker
• Scope: ${scopeTitle} (${scopeType} Count)
• Counting Progress: ${countingProgress.toFixed(1)}% (${formatNum(vdsComplete)} of ${formatNum(vdExpected)} VDs)
${councilStatus ? `• Council Status: ${councilStatus}\n` : ''}• Total Ballots Processed: ${formatNum(totalVotes)}

• Current Standings:
${partySummary}

• Track live in real-time:
https://iec-election-tracker.vercel.app`;

  const twitterText = `Live IEC ${year} Election Update for ${scopeTitle}: Counting at ${countingProgress.toFixed(
    1
  )}% with ${topParties[0]?.abbr || 'contesting parties'} leading! #SouthAfrica #IECElections${year}`;

  const whatsappChatUrl = `https://wa.me/?text=${encodeURIComponent(cleanUrlText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    twitterText
  )}&url=${encodeURIComponent('https://iec-election-tracker.vercel.app')}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullShareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleWhatsAppStatus = async () => {
    // 1. Mobile & Web Share API support:
    // When the OS native share sheet opens and the user chooses WhatsApp,
    // WhatsApp automatically shows "My Status" as the top option!
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `IEC ${year} Election Tracker — ${scopeTitle}`,
          text: fullShareText,
          url: 'https://iec-election-tracker.vercel.app',
        });
        return;
      } catch (err: unknown) {
        // If user cancelled, return; if unsupported, proceed to clipboard flow
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }

    // 2. Desktop Fallback:
    // WhatsApp Web has no direct URL endpoint to create a Status story.
    // We copy the text to clipboard and prompt the user to paste into WhatsApp Web Status.
    try {
      await navigator.clipboard.writeText(fullShareText);
      setStatusCopiedNotice(true);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Clipboard fallback
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="share-snapshot-title"
      className="backdrop:bg-black/75 backdrop:backdrop-blur-xs bg-transparent p-0 m-auto max-w-lg w-[calc(100%-2rem)] rounded-3xl overflow-hidden shadow-2xl border border-border/80 focus:outline-none transition-all overscroll-contain"
    >
      <div className="bg-card text-foreground p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="share-snapshot-title" className="text-base font-bold text-foreground">
                Share Live Snapshot
              </h2>
              <p className="text-xs text-muted-foreground">
                Post directly to WhatsApp Status, send to chats, or share on X
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close share dialog"
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Live Broadcast Graphic Preview Card */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-b from-[#131b26] to-[#0c1017] p-4 text-white shadow-inner space-y-3">
          {/* Card Brand Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-5 rounded-sm overflow-hidden shadow-xs ring-1 ring-white/20 shrink-0">
                <img src="/za.svg" alt="South Africa Flag" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-xs tracking-tight">IEC Live Election Tracker</span>
            </div>
            <Badge variant="live" size="sm" className="text-[10px] px-2 py-0.5">
              {year} LIVE COUNT
            </Badge>
          </div>

          {/* Scope & Counting Progress */}
          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[260px]">
                {scopeTitle}
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums shrink-0">
                {countingProgress.toFixed(1)}% VDs
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>{formatNum(vdsComplete)} of {formatNum(vdExpected)} VDs Counted</span>
              <span>{formatNum(totalVotes)} Ballots</span>
            </div>
            <Progress value={countingProgress} size="xs" variant="gradient" className="h-2" />
          </div>

          {/* Council Status Pill if present */}
          {councilStatus && (
            <div className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-zinc-200">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Status:</span>
              <span className="font-semibold text-emerald-300 truncate">{councilStatus}</span>
            </div>
          )}

          {/* Top 3 Party Breakdown */}
          <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs font-mono">
            {topParties.slice(0, 3).map((party, idx) => (
              <div key={party.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-zinc-500 font-bold">{idx + 1}.</span>
                  <PartyLogo
                    abbr={party.abbr}
                    name={party.fullName}
                    color={party.color}
                    size="xs"
                  />
                  <span className="font-bold text-zinc-100 truncate">{party.abbr}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] tabular-nums shrink-0">
                  <span className="font-bold text-white">{party.votePercentage.toFixed(2)}%</span>
                  <span className="text-zinc-400">({formatNum(party.votes)})</span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Verified Stamp */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3 h-3" /> Official IEC Feed
            </span>
            <span className="text-zinc-500">iec-election-tracker.vercel.app</span>
          </div>
        </div>

        {/* Action Sharing Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* Primary Action 1: Post to WhatsApp Status */}
          <button
            type="button"
            onClick={handleWhatsAppStatus}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all shadow-md shadow-emerald-950/40 cursor-pointer active:scale-[0.99]"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Post to WhatsApp Status (Story)</span>
          </button>

          {/* WhatsApp Status Guide / Feedback Notice */}
          {statusCopiedNotice ? (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-400">
                <Check className="w-4 h-4 shrink-0" />
                <span>Status update copied to clipboard!</span>
              </div>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                WhatsApp Web requires statuses to be pasted directly:
              </p>
              <div className="bg-black/30 p-2.5 rounded-xl space-y-1 font-mono text-[11px] text-zinc-300 border border-white/5">
                <div>1. Click below to open <strong>WhatsApp Web</strong></div>
                <div>2. Click the circular <strong>Status</strong> icon</div>
                <div>3. Click the <strong>Pencil (✏️)</strong> icon and press <strong>Ctrl+V</strong> (Paste)</div>
              </div>
              <a
                href="https://web.whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open WhatsApp Web Status
              </a>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground text-center">
              {hasNativeShare
                ? '📱 Mobile: tap above, then select "My Status" at the top of WhatsApp'
                : '💡 Desktop: copies update to clipboard & gives 1-click WhatsApp Web status link'}
            </p>
          )}

          {/* Secondary Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Action 2: Send to WhatsApp Chat / Group */}
            <a
              href={whatsappChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-semibold text-xs border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-emerald-500" />
              <span>Send to Chat</span>
            </a>

            {/* Action 3: Share to X (Twitter) */}
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-semibold text-xs border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>Share to X</span>
            </a>

            {/* Action 4: Copy Full Formatted Text */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 text-xs font-semibold rounded-xl"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
