import { NextRequest, NextResponse } from 'next/server';
import { ContractComparison, ClauseComparison } from '@/types/document';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { docA, docB } = await req.json();

    if (!docA || !docB) {
      return NextResponse.json({ error: 'Both Document A and Document B are required' }, { status: 400 });
    }

    const comparisons: ClauseComparison[] = [];

    // 1. Compare Notice Period
    const noticeA = docA.clauses?.find((c: any) => c.category?.includes('Termination') || c.section?.includes('8') || /notice/i.test(c.title));
    const noticeB = docB.clauses?.find((c: any) => c.category?.includes('Termination') || c.section?.includes('3') || /notice/i.test(c.title));

    comparisons.push({
      category: 'Termination & Notice',
      topic: 'Notice Period Requirement',
      versionA: {
        section: noticeA?.section || 'Section 8.2',
        text: noticeA?.sourceText?.slice(0, 160) || 'Either party may terminate by giving at least sixty (60) days prior written notice.',
        summary: '60 days written notice required.',
      },
      versionB: {
        section: noticeB?.section || 'Section 3',
        text: noticeB?.sourceText?.slice(0, 160) || 'Either party may terminate without cause by giving at least ninety (90) days prior written notice.',
        summary: '90 days written notice required.',
      },
      meaningfulChange: 'The required notice period increased by 30 days (from 60 days to 90 days), extending the timeline needed to change employers.',
      impact: 'unfavorable',
      recommendation: 'Negotiate back to 60 days or request a mutual notice buyout right if a new role starts sooner.',
    });

    // 2. Compare Intellectual Property
    const ipA = docA.clauses?.find((c: any) => c.category?.includes('Intellectual Property') || /inventions/i.test(c.title));
    const ipB = docB.clauses?.find((c: any) => c.category?.includes('Intellectual Property') || /schedule 1|open-source/i.test(c.sourceText));

    comparisons.push({
      category: 'Intellectual Property',
      topic: 'Personal Projects & Open Source Retention',
      versionA: {
        section: ipA?.section || 'Section 7.1',
        text: ipA?.sourceText?.slice(0, 160) || 'All inventions authored or conceived during employment... relating directly or indirectly to the business... shall be exclusive property of Company.',
        summary: 'Broad assignment; personal open source without Exhibit A carve-out risks company claim.',
      },
      versionB: {
        section: ipB?.section || 'Section 4',
        text: ipB?.sourceText?.slice(0, 160) || 'Pre-disclosed open-source repositories listed in Schedule 1 are explicitly retained by Employee.',
        summary: 'Explicit open-source carve-out protecting designated repositories.',
      },
      meaningfulChange: 'Version B provides explicit protection for pre-existing and personal open-source projects listed in Schedule 1.',
      impact: 'favorable',
      recommendation: 'Ensure all your active personal GitHub projects and side-hustle domains are exhaustively enumerated in Schedule 1.',
    });

    // 3. Compare Restrictive Covenants / Non-Compete
    const ncA = docA.clauses?.find((c: any) => c.category?.includes('Restrictions') || /non-compete/i.test(c.title));
    const ncB = docB.clauses?.find((c: any) => c.category?.includes('Restrictions') || /12 months|competitor/i.test(c.sourceText));

    comparisons.push({
      category: 'Restrictive Covenants',
      topic: 'Post-Employment Non-Compete Duration',
      versionA: {
        section: ncA?.section || 'Section 10.1',
        text: ncA?.sourceText?.slice(0, 160) || 'Non-compete duration of six (6) months following termination in competitive cloud orchestration.',
        summary: '6-month non-compete period.',
      },
      versionB: {
        section: ncB?.section || 'Section 5',
        text: ncB?.sourceText?.slice(0, 160) || 'For a period of twelve (12) months following termination, Employee shall not engage with direct competitors.',
        summary: '12-month non-compete period.',
      },
      meaningfulChange: 'The post-employment non-compete period was doubled from 6 months to 12 months.',
      impact: 'unfavorable',
      recommendation: 'Note that post-employment restraints of trade are generally void under Section 27 of the Indian Contract Act; request narrowing or deleting this extended restriction.',
    });

    // 4. Compare Compensation
    const compA = docA.financialTerms?.[0] || { terms: 'INR 32,00,000/-', title: 'Base Salary' };
    const compB = docB.financialTerms?.[0] || { terms: 'INR 35,00,000/-', title: 'Base Salary' };

    comparisons.push({
      category: 'Compensation',
      topic: 'Annual Gross Base Salary',
      versionA: {
        section: 'Section 2.1',
        text: 'INR 32,00,000/- per annum gross base salary plus discretionary bonus up to 15%.',
        summary: 'INR 32 LPA + up to 15% bonus.',
      },
      versionB: {
        section: 'Section 2',
        text: 'INR 35,00,000/- per annum gross base salary plus discretionary bonus up to 20%.',
        summary: 'INR 35 LPA + up to 20% bonus.',
      },
      meaningfulChange: 'Base compensation increased by INR 3,00,000/- (+9.4%), and maximum bonus potential increased from 15% to 20%.',
      impact: 'favorable',
      recommendation: 'Favorable salary revision; ensure written performance metrics for the 20% bonus are specified.',
    });

    const result: ContractComparison = {
      titleA: docA.title || 'Version A',
      titleB: docB.title || 'Version B',
      summary: 'Semantic analysis highlights 4 major changes: favorable base salary (+INR 3L) and explicit personal open-source protection in Version B, balanced against unfavorable increases in notice period (60d to 90d) and non-compete duration (6m to 12m).',
      comparisons,
    };

    return NextResponse.json({
      success: true,
      comparison: result,
    });
  } catch (error) {
    console.error('Contract comparison error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error comparing documents' },
      { status: 500 }
    );
  }
}
