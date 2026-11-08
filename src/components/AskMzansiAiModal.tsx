'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  MessageSquare,
  Bot,
  User,
  ShieldCheck,
  ChevronRight,
  Info,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CivicElectionContext, ChatMessage, cleanCivicAiText } from '@/lib/ai-client';

interface AskMzansiAiModalProps {
  context: CivicElectionContext;
}

export function AskMzansiAiModal({ context }: AskMzansiAiModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Contextual prompt suggestions based on current active location
  const quickQuestions = [
    `Who is leading in ${context.scopeName}?`,
    context.councilMath && context.councilMath.seatsTotal > 0
      ? `Can a coalition govern ${context.scopeName}?`
      : 'Explain coalition rules in hung councils',
    context.wardDetails
      ? `What is happening in Ward ${context.wardDetails.wardNumber}?`
      : 'How do PR vs Ward ballots work?',
    'What do the early voter turnout numbers show?',
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context,
          history: messages,
        }),
      });

      if (!res.ok) {
        throw new Error('AI query failed');
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: cleanCivicAiText(data.answer || 'I could not generate an answer at this moment.'),
      };
      setMessages([...updatedHistory, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...updatedHistory,
        {
          role: 'assistant',
          content: cleanCivicAiText(
            `In ${context.scopeName}, ${context.topParties[0]?.abbr || 'The leading party'} is currently ahead with ${(context.topParties[0]?.votePercentage || 0).toFixed(1)}% of counted ballots. Counting progress is at ${context.percComplete.toFixed(1)}%. All counts are provisional until certified by the IEC.`
          ),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Pill Trigger (Fixed Bottom-Right) */}
      <div className="fixed bottom-5 right-5 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-11 sm:h-12 px-3.5 sm:px-4.5 rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 border border-emerald-400/40 transition-transform active:scale-95 cursor-pointer"
          aria-label="Ask Mzansi AI"
        >
          <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
          <span>Ask Mzansi AI</span>
          <Badge
            variant="outline"
            className="hidden sm:inline-flex bg-white/20 text-white border-none text-[10px] px-1.5 py-0 rounded-full"
          >
            {context.scopeName}
          </Badge>
        </Button>
      </div>

      {/* Slide-Up Drawer / Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-lg bg-card border border-border/80 sm:rounded-2xl shadow-2xl flex flex-col h-[85vh] sm:h-[620px] max-h-[92vh] overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-chat-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 id="ai-chat-title" className="font-bold text-sm sm:text-base text-foreground truncate">
                      Ask Mzansi AI
                    </h3>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                      CIVIC COPILOT
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Grounded in live IEC returns for <strong>{context.scopeName}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setMessages([])}
                    title="Clear Conversation"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setIsOpen(false)}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Context Badge Bar */}
            <div className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-500/20 text-[11px] flex items-center justify-between text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-1.5 truncate">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  IEC Live Scope: <strong>{context.scopeName}</strong> ({context.percComplete.toFixed(1)}% counted)
                </span>
              </div>
              <span className="font-mono text-[10px] font-semibold shrink-0">
                {context.topParties[0]?.abbr || 'ANC'}: {context.topParties[0]?.votePercentage.toFixed(1)}%
              </span>
            </div>

            {/* Conversation Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
              {messages.length === 0 ? (
                <div className="py-6 px-2 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h4 className="font-bold text-foreground text-sm sm:text-base">
                      How can I help you understand the election?
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Ask any question about vote counts, hung councils, coalition scenarios, or ward results in South Africa.
                    </p>
                  </div>

                  {/* Suggestion Quick Pills */}
                  <div className="flex flex-col gap-1.5 w-full pt-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-left">
                      Suggested Questions for {context.scopeName}:
                    </span>
                    {quickQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(q)}
                        className="text-left py-2 px-3 rounded-xl bg-muted/60 hover:bg-muted text-foreground border border-border/60 text-xs transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                      >
                        <span className="truncate">{q}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground font-medium rounded-br-xs'
                          : 'bg-muted/70 text-foreground border border-border/80 rounded-bl-xs'
                      }`}
                    >
                      {msg.role === 'assistant'
                        ? cleanCivicAiText(msg.content)
                        : msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-muted/70 text-muted-foreground border border-border/80 rounded-2xl px-3.5 py-2.5 text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] ml-1">Analyzing live IEC returns...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form & Footer */}
            <div className="p-3 border-t border-border bg-card flex flex-col gap-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask about ${context.scopeName}...`}
                  disabled={isLoading}
                  className="flex-1 text-xs sm:text-sm h-9 rounded-xl bg-muted/40 border-border"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="sm"
                  className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>

              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground px-1">
                <Info className="w-3 h-3 shrink-0 text-emerald-600" />
                <span className="truncate">
                  Non-partisan AI grounded strictly in official IEC preliminary election data.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
