'use client';

import React from 'react';
import { Calendar, Clock, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { DocumentAnalysis } from '@/types/document';

interface TimelineTabProps {
  document: DocumentAnalysis;
  onSelectClause: (section: string) => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  document,
  onSelectClause,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Important Dates, Deadlines &amp; Milestones</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Chronological milestones extracted from the document including notice windows and review cycles.
          </p>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-800 ml-4 space-y-6">
        {document.importantDates.map((dateItem, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline Node Point */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-amber-400 ring-4 ring-slate-900 group-hover:scale-125 transition" />

            {/* Date Card */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  {dateItem.label}
                </span>

                {dateItem.section && (
                  <button
                    onClick={() => onSelectClause(dateItem.section!)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-800 text-amber-300 hover:text-amber-200 text-xs font-mono font-medium border border-slate-700 transition self-start sm:self-auto"
                  >
                    <span>{dateItem.section}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="text-lg font-bold text-amber-300">
                {dateItem.dateOrPeriod}
              </div>

              {dateItem.consequence && (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {dateItem.consequence}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
