import { DocumentAnalysis } from '@/types/document';

export interface SampleDocumentItem {
  id: string;
  title: string;
  type: string;
  description: string;
  rawText: string;
  precomputedAnalysis: DocumentAnalysis;
}

export const SAMPLE_EMPLOYMENT_AGREEMENT_TEXT = `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is made and entered into as of October 1, 2026 ("Effective Date"), by and between:

ABC Technologies Private Limited, a company incorporated under the laws of India, having its registered office at Cyber City, Gurugram, Haryana ("Company" or "Employer"),
AND
Arjun Mehta, an individual residing at Indiranagar, Bengaluru, Karnataka ("Employee").

1. APPOINTMENT AND SCOPE OF EMPLOYMENT
1.1 The Company hereby employs the Employee in the role of Principal Systems Architect, and the Employee accepts such employment upon the terms and conditions set forth herein.
1.2 The Employee shall devote their full business time, attention, skill, and best efforts to the performance of duties assigned by the Company.

2. COMPENSATION AND BENEFITS
2.1 Base Salary: The Company shall pay the Employee an annual gross base salary of INR 32,00,000/- (Rupees Thirty-Two Lakhs only), payable in monthly installments on or before the last working day of each calendar month.
2.2 Performance Bonus: The Employee shall be eligible for an annual discretionary performance bonus of up to 15% of the base salary, subject to individual and company performance metrics determined solely by the Board.
2.3 Statutory Deductions: All payments shall be subject to standard statutory withholdings including Provident Fund, Professional Tax, and Tax Deducted at Source (TDS).

3. PROBATION PERIOD
3.1 The Employee shall serve an initial probationary period of three (3) months commencing from the Effective Date.
3.2 The Company reserves the right to extend the probation period by an additional thirty (30) days based on performance evaluation.

4. WORKING HOURS AND LEAVE ENTITLEMENT
4.1 The standard working week consists of 40 hours, Monday through Friday. Due to the executive nature of the position, reasonable additional hours may be required without additional overtime pay.
4.2 The Employee is entitled to 18 days of paid annual leave, 10 days of casual/sick leave, and declared public holidays as per the Company's policy calendar.

5. CODE OF CONDUCT AND COMPLIANCE
5.1 The Employee shall strictly adhere to all internal regulations, IT policies, anti-bribery standards, and data protection guidelines issued by the Company.
5.2 The Employee shall not engage in any outside commercial activity, consultancies, or secondary employment without prior express written approval from the Managing Director.

6. CONFIDENTIALITY AND NON-DISCLOSURE
6.1 Protection of Information: The Employee acknowledges that during employment they will have access to proprietary trade secrets, algorithms, customer lists, and financial records. The Employee agrees to maintain strict confidentiality and not disclose such information during or after employment without time limitation.
6.2 Non-Misappropriation: The Employee shall not use Company confidential data for personal enrichment or the benefit of any competitor or third party.

7. INTELLECTUAL PROPERTY RIGHTS
7.1 Assignment of Inventions: The Employee agrees that all inventions, discoveries, software code, designs, algorithms, improvements, and works of authorship authored or conceived during the term of employment—whether created during normal working hours, on Company premises, using Company equipment, or relating directly or indirectly to the present or demonstrably anticipated business of the Company—shall be the sole and exclusive property of the Company as "works made for hire."
7.2 Prior Inventions: The Employee must disclose in Exhibit A any pre-existing personal inventions. Any intellectual property not explicitly carved out in Exhibit A that relates to software architectures shall be presumed assigned to the Company.

8. TERMINATION AND NOTICE PERIOD
8.1 Termination for Cause: The Company may terminate this Agreement immediately without notice or severance in the event of gross misconduct, fraud, material breach of confidentiality, or unauthorized absence exceeding 7 consecutive days.
8.2 Termination Without Cause & Notice Period: Either party may terminate this Agreement without cause by giving at least sixty (60) days' prior written notice to the other party.
8.3 Pay in Lieu of Notice: The Company reserves the right, at its sole discretion, to waive the notice period by paying gross salary in lieu of notice. The Employee shall not be entitled to buy out the notice period without the Company's explicit written approval.
8.4 Garden Leave: During any notice period, the Company may require the Employee to refrain from contacting clients or entering premises while remaining on full base compensation.

9. RETURN OF COMPANY PROPERTY
9.1 Upon notice of termination or at any time upon request, the Employee shall immediately return all Company laptops, access badges, encryption tokens, storage devices, and documentation.
9.2 The Employee shall certify in writing that all electronic copies of proprietary materials have been deleted from personal cloud backups and local hard drives.

10. RESTRICTIVE COVENANTS AND NON-SOLICITATION
10.1 Non-Compete: For a period of six (6) months following the termination of employment for any reason, the Employee shall not directly or indirectly accept employment with, consult for, or establish an entity providing competitive cloud orchestration solutions within the territory of India.
10.2 Non-Solicitation of Employees: For twelve (12) months post-termination, the Employee shall not solicit, induce, or encourage any current employee or contractor of the Company to terminate their engagement.
10.3 Non-Solicitation of Clients: For twelve (12) months post-termination, the Employee shall not solicit business from any client with whom the Employee had direct dealings during the preceding 12 months.

11. INDEMNIFICATION AND LIABILITY
11.1 The Employee agrees to indemnify the Company against direct damages, claims, or regulatory penalties arising out of the Employee's intentional malfeasance or gross negligence.

12. DISPUTE RESOLUTION AND GOVERNING LAW
12.1 Governing Law: This Agreement shall be governed by and construed in accordance with the substantive laws of India.
12.2 Arbitration: Any dispute arising out of or in connection with this Agreement shall be referred to arbitration before a sole arbitrator appointed mutually by the parties, seated in Bengaluru, conducted under the Arbitration and Conciliation Act, 1996.

13. SEVERABILITY AND ENTIRE AGREEMENT
13.1 If any provision of this Agreement is held invalid or unenforceable, such holding shall not invalidate the remaining provisions.
13.2 This Agreement supersedes all prior verbal or written understandings between the parties concerning the subject matter herein.

14. AMENDMENT AND WAIVER
14.1 No modification of this Agreement shall be valid unless made in writing and duly signed by an authorized director of the Company and the Employee.

IN WITNESS WHEREOF, the parties hereto have executed this Employment Agreement.

For ABC Technologies Pvt. Ltd.                Employee
Authorized Signatory                           Arjun Mehta
Director - Human Resources
`;

export const SAMPLE_EMPLOYMENT_AGREEMENT_ANALYSIS: DocumentAnalysis = {
  documentId: "doc_sample_employment_001",
  documentType: "Employment Agreement",
  title: "Employment Agreement - ABC Technologies & Arjun Mehta",
  parties: [
    { name: "ABC Technologies Private Limited", role: "Employer / Company", jurisdictionOrAddress: "Gurugram, Haryana" },
    { name: "Arjun Mehta", role: "Employee", jurisdictionOrAddress: "Indiranagar, Bengaluru, Karnataka" },
  ],
  effectiveDate: "2026-10-01",
  expirationDate: null,
  governingLaw: "Laws of India (Arbitration seated in Bengaluru)",
  summary: "Comprehensive executive employment agreement appointing Arjun Mehta as Principal Systems Architect at ABC Technologies Pvt. Ltd. Key features include a 60-day notice period requirement, broad intellectual property assignment including ambiguous coverage of personal projects, post-employment non-compete covenants, and strict confidentiality guidelines.",
  pageCount: 4,
  clauses: [
    {
      id: "clause_1",
      section: "Section 1",
      title: "Appointment and Scope of Employment",
      category: "Appointment",
      sourceText: "1.1 The Company hereby employs the Employee in the role of Principal Systems Architect... 1.2 The Employee shall devote their full business time, attention, skill, and best efforts to the performance of duties assigned by the Company.",
      plainLanguage: "You are hired full-time as Principal Systems Architect. You are expected to dedicate all normal business working hours exclusively to this role.",
      obligations: ["Devote full business time and best efforts to Company duties"],
      importantDates: ["Effective Date: October 1, 2026"],
      questionsToConsider: ["Are the job responsibilities and reporting lines documented in writing?"],
      reviewReason: null,
      reviewSeverity: "info",
    },
    {
      id: "clause_2",
      section: "Section 2",
      title: "Compensation and Benefits",
      category: "Compensation",
      sourceText: "2.1 Base Salary: INR 32,00,000/- per annum gross... 2.2 Performance Bonus: Up to 15% discretionary bonus... 2.3 Subject to statutory deductions.",
      plainLanguage: "Annual base salary is INR 32 Lakhs payable monthly. A discretionary bonus of up to 15% may be awarded based on metrics determined solely by the Board.",
      obligations: ["Company must pay monthly salary on or before the last working day"],
      importantDates: ["Monthly salary paid by last working day"],
      questionsToConsider: ["What specific KPIs determine the 15% discretionary bonus?"],
      reviewReason: "Bonus is strictly at the sole discretion of the Board rather than tied to guaranteed metrics.",
      reviewSeverity: "review",
    },
    {
      id: "clause_3",
      section: "Section 3",
      title: "Probation Period",
      category: "Probation",
      sourceText: "3.1 Initial probationary period of three (3) months... 3.2 Company reserves right to extend probation by an additional thirty (30) days.",
      plainLanguage: "Initial probation lasts 3 months, extendable by 30 days if the company needs additional performance evaluation.",
      obligations: ["Complete 3 months probation"],
      importantDates: ["Probation duration: 3 months (extendable by 30 days)"],
      questionsToConsider: ["What notice period applies during the probation period?"],
      reviewReason: null,
      reviewSeverity: "info",
    },
    {
      id: "clause_4",
      section: "Section 4",
      title: "Working Hours and Leave Entitlement",
      category: "Working Hours",
      sourceText: "4.1 Standard 40 hours per week... reasonable additional hours without overtime pay. 4.2 18 days paid annual leave, 10 days casual/sick leave.",
      plainLanguage: "40 hours per week (Mon-Fri). No overtime pay for extra hours. Entitled to 18 days annual leave and 10 days casual/sick leave.",
      obligations: ["Work standard 40 hours per week plus necessary additional hours"],
      importantDates: ["18 days annual leave / year", "10 days casual/sick leave / year"],
      questionsToConsider: ["Can unused annual leaves be encashed or carried forward?"],
      reviewReason: null,
      reviewSeverity: "info",
    },
    {
      id: "clause_5",
      section: "Section 5",
      title: "Code of Conduct and Exclusivity",
      category: "Exclusivity",
      sourceText: "5.2 The Employee shall not engage in any outside commercial activity, consultancies, or secondary employment without prior express written approval from the Managing Director.",
      plainLanguage: "You cannot do any outside commercial work, consulting, or moonlighting without written permission from the Managing Director.",
      obligations: ["Must obtain written approval before taking on any outside work or consultancies"],
      importantDates: [],
      questionsToConsider: ["Does this prohibit unpaid open-source contributions or advisory roles?"],
      reviewReason: "Strict blanket exclusivity requires written Managing Director sign-off for any outside activity.",
      reviewSeverity: "review",
    },
    {
      id: "clause_6",
      section: "Section 6",
      title: "Confidentiality and Non-Disclosure",
      category: "Confidentiality",
      sourceText: "6.1 Protection of Information: Maintain strict confidentiality during or after employment without time limitation... 6.2 Non-Misappropriation of proprietary data.",
      plainLanguage: "You must keep company trade secrets, customer details, and code confidential both while employed and permanently after leaving.",
      obligations: ["Must protect confidential information indefinitely without expiration"],
      importantDates: ["Duration: Indefinite / without time limitation"],
      questionsToConsider: ["Is there a standard carve-out for publicly available information?"],
      reviewReason: null,
      reviewSeverity: "info",
    },
    {
      id: "clause_7",
      section: "Section 7.1",
      title: "Intellectual Property Rights - Assignment of Inventions",
      category: "Intellectual Property",
      sourceText: "7.1 Assignment of Inventions: All inventions, code, improvements authored or conceived during employment—whether created during normal working hours, on Company premises, using Company equipment, or relating directly or indirectly to the business—shall be sole property of Company... 7.2 Prior Inventions must be listed in Exhibit A.",
      plainLanguage: "The company claims ownership of everything you build during employment that relates directly or indirectly to their business, even outside working hours or off premises unless pre-registered in Exhibit A.",
      obligations: [
        "Assign all authored inventions and code to Company",
        "Disclose any pre-existing personal inventions in Exhibit A immediately",
      ],
      importantDates: [],
      questionsToConsider: [
        "Does this cover personal side-projects or open-source libraries built on personal time?",
        "Have I completed Exhibit A with all pre-existing repositories?",
      ],
      reviewReason: "Broad wording ('relating directly or indirectly') could encompass personal open-source projects unless explicitly excluded.",
      reviewSeverity: "caution",
    },
    {
      id: "clause_8",
      section: "Section 8.2",
      title: "Termination Without Cause & Notice Period",
      category: "Termination",
      sourceText: "8.2 Termination Without Cause & Notice Period: Either party may terminate this Agreement without cause by giving at least sixty (60) days' prior written notice to the other party. 8.3 Pay in Lieu: Company may waive notice by paying salary. Employee cannot buy out notice without Company approval. 8.4 Garden Leave applicable.",
      plainLanguage: "Both you and the company must give 60 days' written notice to resign or terminate. The company can pay you to leave early, but you cannot buy out your notice period unless the company explicitly agrees.",
      obligations: [
        "Must provide at least 60 days' prior written notice before resigning",
        "Must serve out notice unless Company agrees in writing to buy-out",
      ],
      importantDates: ["Notice period: 60 calendar days written notice"],
      questionsToConsider: [
        "What happens if a new employer needs me to join in 30 days?",
        "Will accrued bonuses be paid if notice is given?",
      ],
      reviewReason: "One-sided buyout option: Company can buy out notice, but employee has no unilateral right to buy out.",
      reviewSeverity: "review",
    },
    {
      id: "clause_9",
      section: "Section 9",
      title: "Return of Company Property",
      category: "Offboarding",
      sourceText: "9.1 Return laptops, access tokens, documentation immediately upon notice... 9.2 Written certification that electronic copies deleted from personal backups.",
      plainLanguage: "Return all company hardware and access cards upon notice of leaving. Provide written certification that all company data was erased from personal drives.",
      obligations: [
        "Immediately return laptops and tokens",
        "Provide written certification of data deletion",
      ],
      importantDates: [],
      questionsToConsider: ["What is the timeline for device return?"],
      reviewReason: null,
      reviewSeverity: "info",
    },
    {
      id: "clause_10",
      section: "Section 10.1",
      title: "Restrictive Covenants - Non-Compete",
      category: "Restrictions",
      sourceText: "10.1 Non-Compete: For a period of six (6) months following termination, Employee shall not directly or indirectly accept employment with, consult for, or establish an entity providing competitive cloud orchestration solutions in India. 10.2 Non-solicitation of employees (12 months). 10.3 Non-solicitation of clients (12 months).",
      plainLanguage: "You agree not to work for a competitor in cloud orchestration across India for 6 months after leaving, and not to recruit company colleagues or clients for 12 months.",
      obligations: [
        "Must refrain from joining direct competitors for 6 months post-employment",
        "Must not solicit colleagues or clients for 12 months post-employment",
      ],
      importantDates: [
        "Non-compete duration: 6 months post-termination",
        "Non-solicitation duration: 12 months post-termination",
      ],
      questionsToConsider: [
        "Under Section 27 of the Indian Contract Act, post-employment non-compete clauses are generally unenforceable in Indian courts, but could cause friction with new employers.",
        "How strictly does the company enforce this clause in practice?",
      ],
      reviewReason: "Post-termination restrictive covenant may restrict future employment opportunities.",
      reviewSeverity: "caution",
    },
    {
      id: "clause_11",
      section: "Section 11",
      title: "Indemnification and Liability",
      category: "Liability",
      sourceText: "11.1 Employee agrees to indemnify the Company against direct damages, claims, or regulatory penalties arising out of intentional malfeasance or gross negligence.",
      plainLanguage: "You only indemnify the company if you commit intentional fraud or gross negligence. Standard honest errors are not penalized.",
      obligations: ["Indemnify Company against intentional misconduct or gross negligence"],
      importantDates: [],
      questionsToConsider: ["Is there a reciprocal indemnification by the company for employee defense?"],
      reviewReason: null,
      reviewSeverity: "info",
    },
    {
      id: "clause_12",
      section: "Section 12",
      title: "Dispute Resolution and Governing Law",
      category: "Legal Jurisdiction",
      sourceText: "12.1 Governed by substantive laws of India. 12.2 Sole arbitrator mutually appointed, seated in Bengaluru under Arbitration and Conciliation Act, 1996.",
      plainLanguage: "Indian law applies. Any disputes go to private arbitration in Bengaluru with a mutually agreed arbitrator.",
      obligations: ["Submit legal disputes to arbitration in Bengaluru"],
      importantDates: [],
      questionsToConsider: ["Who covers the costs and fees of the arbitration proceeding?"],
      reviewReason: null,
      reviewSeverity: "info",
    },
    {
      id: "clause_13",
      section: "Section 13",
      title: "Severability and Entire Agreement",
      category: "Boilerplate",
      sourceText: "13.1 Invalidity of one clause does not void the rest. 13.2 Supersedes all prior verbal or written understandings.",
      plainLanguage: "This written agreement replaces all previous verbal promises or offer letters. If any clause is held invalid, the remainder continues in effect.",
      obligations: ["Rely only on this written agreement, not prior verbal discussions"],
      importantDates: [],
      questionsToConsider: ["Were any verbal promises made during interviews that need to be added here?"],
      reviewReason: null,
      reviewSeverity: "info",
    },
    {
      id: "clause_14",
      section: "Section 14",
      title: "Amendment and Waiver",
      category: "Boilerplate",
      sourceText: "14.1 No modification shall be valid unless in writing and signed by an authorized director and the Employee.",
      plainLanguage: "Any changes to this contract must be signed on paper or formal document by a Company Director and you.",
      obligations: ["Obtain written signed addendum for any contractual modifications"],
      importantDates: [],
      questionsToConsider: [],
      reviewReason: null,
      reviewSeverity: "info",
    },
  ],
  importantDates: [
    {
      id: "date_1",
      label: "Agreement Effective Date",
      dateOrPeriod: "October 1, 2026",
      section: "Preamble",
      type: "effectiveDate",
      consequence: "Employment term and confidentiality covenants commence.",
    },
    {
      id: "date_2",
      label: "Notice Period Duration",
      dateOrPeriod: "60 Days Written Notice",
      section: "Section 8.2",
      type: "noticePeriod",
      consequence: "Required prior to resigning or termination without cause.",
    },
    {
      id: "date_3",
      label: "Post-Employment Non-Compete Restriction",
      dateOrPeriod: "6 Months Post-Termination",
      section: "Section 10.1",
      type: "milestone",
      consequence: "Restricts joining direct cloud orchestration competitors.",
    },
    {
      id: "date_4",
      label: "Probationary Review Window",
      dateOrPeriod: "3 Months (Extendable by 30 days)",
      section: "Section 3.1",
      type: "deadline",
      consequence: "Evaluation of role confirmation or probation extension.",
    },
  ],
  userObligations: [
    {
      id: "ob_user_1",
      who: "user",
      text: "Must provide at least 60 days' prior written notice to terminate employment without cause.",
      section: "Section 8.2",
      priority: "high",
    },
    {
      id: "ob_user_2",
      who: "user",
      text: "Must assign all inventions, discoveries, and software code authored during employment to the Company.",
      section: "Section 7.1",
      priority: "high",
    },
    {
      id: "ob_user_3",
      who: "user",
      text: "Must maintain strict confidentiality of proprietary trade secrets without time limitation.",
      section: "Section 6.1",
      priority: "high",
    },
    {
      id: "ob_user_4",
      who: "user",
      text: "Must disclose all pre-existing personal inventions in Exhibit A upon signing.",
      section: "Section 7.2",
      priority: "medium",
    },
    {
      id: "ob_user_5",
      who: "user",
      text: "Must refrain from outside commercial activities or consultancies without prior written consent from Managing Director.",
      section: "Section 5.2",
      priority: "medium",
    },
    {
      id: "ob_user_6",
      who: "user",
      text: "Must return all company laptops, credentials, and documentation immediately upon notice.",
      section: "Section 9.1",
      priority: "medium",
    },
    {
      id: "ob_user_7",
      who: "user",
      text: "Must refrain from soliciting company employees or clients for 12 months post-termination.",
      section: "Section 10.2",
      priority: "medium",
    },
  ],
  otherPartyObligations: [
    {
      id: "ob_comp_1",
      who: "otherParty",
      text: "Must pay annual gross base salary of INR 32,00,000/- in monthly installments on or before the last working day.",
      section: "Section 2.1",
      priority: "high",
    },
    {
      id: "ob_comp_2",
      who: "otherParty",
      text: "Must provide 60 days' prior written notice for termination without cause (or pay salary in lieu).",
      section: "Section 8.2",
      priority: "high",
    },
    {
      id: "ob_comp_3",
      who: "otherParty",
      text: "Must provide 18 days of paid annual leave and 10 days of casual/sick leave annually.",
      section: "Section 4.2",
      priority: "medium",
    },
  ],
  financialTerms: [
    {
      title: "Base Salary",
      terms: "INR 32,00,000/- gross per annum",
      section: "Section 2.1",
      notes: "Payable monthly on or before the last working day.",
    },
    {
      title: "Performance Bonus",
      terms: "Up to 15% of annual base salary",
      section: "Section 2.2",
      notes: "Discretionary based on Board evaluation; not guaranteed.",
    },
    {
      title: "Notice Period Buyout",
      terms: "Gross salary in lieu of unserved notice",
      section: "Section 8.3",
      notes: "Company has unilateral right to pay salary in lieu; Employee buyout requires explicit approval.",
    },
  ],
  restrictions: [
    {
      title: "Post-Employment Non-Compete",
      description: "Cannot work for, consult with, or start a competitor in cloud orchestration in India.",
      section: "Section 10.1",
      durationOrScope: "6 months post-termination; India",
    },
    {
      title: "Exclusivity / Moonlighting Restriction",
      description: "Cannot perform outside commercial work or consultancies without written MD approval.",
      section: "Section 5.2",
      durationOrScope: "Duration of employment",
    },
    {
      title: "Employee & Client Non-Solicitation",
      description: "Cannot hire colleagues or solicit clients with whom you worked.",
      section: "Section 10.2 & 10.3",
      durationOrScope: "12 months post-termination",
    },
    {
      title: "Perpetual Confidentiality",
      description: "Trade secrets, codebase, and business data cannot be disclosed even after leaving.",
      section: "Section 6.1",
      durationOrScope: "Indefinite / permanent",
    },
  ],
  potentialAmbiguities: [
    {
      section: "Section 7.1",
      issue: "Scope of Intellectual Property Assignment for Personal Projects",
      whyItMatters: "The phrase 'relating directly or indirectly to the business' could be interpreted broadly to claim ownership of independent open-source contributions or personal hobby coding developed at home.",
      suggestedClarification: "Request a written carve-out clarifying that personal open-source projects created on personal equipment outside working hours with no company confidential data remain the employee's property.",
    },
    {
      section: "Section 8.3",
      issue: "Asymmetrical Notice Buyout Right",
      whyItMatters: "The Company has the unilateral right to waive notice by paying in lieu, but the employee is barred from buying out notice without written approval, risking delays in joining a future employer.",
      suggestedClarification: "Request mutual buyout rights allowing either party to buy out up to 30 days of notice.",
    },
    {
      section: "Section 2.2",
      issue: "Discretionary Bonus Measurement Criteria",
      whyItMatters: "Bonus eligibility is stated as 'discretionary' with no published objective benchmark or pro-rata payment if leaving midway through the financial year.",
      suggestedClarification: "Ask for an objective bonus scorecard and clarity on whether bonus is paid pro-rata upon resignation after notice.",
    },
    {
      section: "Section 10.1",
      issue: "Enforceability of Post-Employment Non-Compete",
      whyItMatters: "Section 27 of the Indian Contract Act voids agreements in restraint of trade. While often included for deterrence, it may cause friction with prospective employers.",
      suggestedClarification: "Ask a legal professional how Indian labor jurisprudence views this specific restriction for your technical domain.",
    },
  ],
  questionsForProfessional: [
    {
      category: "Intellectual Property",
      question: "Does Section 7.1's IP assignment grant the company ownership of my personal open-source libraries if I develop them on weekends on my own laptop?",
      relevantSection: "Section 7.1",
      context: "Need to safeguard existing open-source repositories and personal indie hacking projects.",
    },
    {
      category: "Restraint of Trade",
      question: "Is the 6-month non-compete clause in Section 10.1 enforceable under Indian Contract Act Section 27, and could the company obtain an injunction against joining a tech startup?",
      relevantSection: "Section 10.1",
      context: "Evaluating career mobility in the Indian cloud orchestration ecosystem.",
    },
    {
      category: "Notice Period",
      question: "If a future employer requests a 30-day joining date, can the company legally reject my notice buyout under Section 8.3 and force me to serve the full 60 days?",
      relevantSection: "Section 8.2 & 8.3",
      context: "Checking legal options for notice period negotiation or waiver.",
    },
    {
      category: "Tax & Bonus",
      question: "Does the contract protect my earned bonus if the company terminates my employment without cause near the end of the financial year?",
      relevantSection: "Section 2.2",
      context: "Clarifying discretionary bonus rights before year-end payout.",
    },
  ],
};

export const SAMPLE_EMPLOYMENT_V2_TEXT = `EMPLOYMENT AGREEMENT (AMENDED VERSION 2)

This Amended Employment Agreement is entered into on October 15, 2026, by and between ABC Technologies Private Limited and Arjun Mehta.

KEY AMENDMENTS & TERMS:

1. APPOINTMENT: Principal Systems Architect. Full-time dedication required.
2. COMPENSATION: Base salary adjusted to INR 35,00,000/- gross per annum. Discretionary bonus up to 20%.
3. NOTICE PERIOD: Either party may terminate without cause by giving at least ninety (90) days' prior written notice. Notice period buyout requires mutual written consent.
4. INTELLECTUAL PROPERTY: Works made for hire assigned to Company. Exception: Pre-disclosed open-source repositories listed in Schedule 1 are explicitly retained by the Employee.
5. NON-COMPETE COVENANT: For a period of twelve (12) months following termination, the Employee shall not engage with direct competitors in cloud architecture across India.
6. CONFIDENTIALITY: Indefinite confidentiality obligation.
7. GOVERNING LAW: Laws of India, arbitration in Bengaluru.
`;

export const SAMPLE_FREELANCE_MSA_TEXT = `MASTER SERVICES AGREEMENT (FREELANCE / CONSULTING)

This Master Services Agreement ("MSA") is entered into as of November 1, 2026, between:
NextWave Labs Inc. ("Client"), a Delaware corporation,
AND
Arjun Mehta ("Consultant"), an independent professional software architect.

1. SCOPE OF SERVICES
Consultant shall provide distributed systems design, backend API development, and architectural audits as detailed in subsequent Statements of Work (SOW).

2. INDEPENDENT CONTRACTOR STATUS
Consultant is an independent contractor, not an employee. Consultant is solely responsible for all taxes, insurance, and benefits.

3. FEES AND PAYMENT
3.1 Hourly Rate: USD $95 per hour.
3.2 Invoicing: Consultant shall submit bi-weekly invoices. Invoices are payable Net 15 days via wire transfer.
3.3 Late Payments: Past due balances incur a late interest fee of 1.5% per month.

4. TERM AND TERMINATION
4.1 Term: This Agreement continues for 12 months unless terminated earlier.
4.2 Termination for Convenience: Either party may terminate with thirty (30) days' written notice.
4.3 Immediate Termination: For breach of confidentiality or failure to cure material default within 10 days.

5. INTELLECTUAL PROPERTY
5.1 Work Product: Upon full payment of all undisputed fees, Client shall own all custom deliverables created under an active SOW.
5.2 Consultant Pre-Existing IP: Consultant retains all rights to pre-existing toolkits, frameworks, and reusable code libraries. Consultant grants Client a perpetual, royalty-free license to use such background IP as embedded in deliverables.

6. CONFIDENTIALITY
Each party agrees to protect proprietary information for a period of three (3) years from disclosure.

7. LIMITATION OF LIABILITY
Neither party's aggregate liability under this Agreement shall exceed the total fees paid or payable by Client in the three (3) months preceding the claim.

8. GOVERNING LAW AND JURISDICTION
This Agreement is governed by the laws of the State of California, without regard to conflict of law principles.
`;

export const SAMPLE_DOCUMENTS: SampleDocumentItem[] = [
  {
    id: "sample-employment-1",
    title: "Employment Agreement — ABC Tech (60d Notice, IP Scope)",
    type: "Employment Agreement",
    description: "Full agreement featuring 60-day notice (Section 8.2), IP assignment (Section 7.1), 6-month non-compete, and 7 user obligations. Ideal for hero voice call & demo.",
    rawText: SAMPLE_EMPLOYMENT_AGREEMENT_TEXT,
    precomputedAnalysis: SAMPLE_EMPLOYMENT_AGREEMENT_ANALYSIS,
  },
  {
    id: "sample-employment-2",
    title: "Employment Agreement (Amended V2 — 90d Notice)",
    type: "Employment Agreement (Amendment)",
    description: "Revised contract with 90-day notice, 12-month non-compete, INR 35L salary, and open-source exception. Perfect for Contract Comparison testing.",
    rawText: SAMPLE_EMPLOYMENT_V2_TEXT,
    precomputedAnalysis: {
      ...SAMPLE_EMPLOYMENT_AGREEMENT_ANALYSIS,
      documentId: "doc_sample_employment_v2",
      title: "Employment Agreement (Amended V2) - ABC Technologies",
      importantDates: [
        {
          id: "date_v2_1",
          label: "Notice Period Duration",
          dateOrPeriod: "90 Days Written Notice",
          section: "Section 3",
          type: "noticePeriod",
          consequence: "Increased by 30 days compared to previous 60-day agreement.",
        },
        {
          id: "date_v2_2",
          label: "Non-Compete Duration",
          dateOrPeriod: "12 Months Post-Termination",
          section: "Section 5",
          type: "milestone",
          consequence: "Doubled from 6 months to 12 months.",
        },
      ],
      financialTerms: [
        {
          title: "Base Salary",
          terms: "INR 35,00,000/- gross per annum",
          section: "Section 2",
          notes: "Increased from INR 32,00,000/-.",
        },
      ],
    },
  },
  {
    id: "sample-freelance-msa",
    title: "Freelance Master Services Agreement — NextWave Labs",
    type: "Freelance Agreement",
    description: "Independent contractor agreement with Net 15 payments ($95/hr), IP transfer on payment, 30-day notice, and 3-year confidentiality.",
    rawText: SAMPLE_FREELANCE_MSA_TEXT,
    precomputedAnalysis: {
      documentId: "doc_sample_freelance_001",
      documentType: "Freelance Agreement",
      title: "Master Services Agreement - NextWave Labs & Arjun Mehta",
      parties: [
        { name: "NextWave Labs Inc.", role: "Client", jurisdictionOrAddress: "Delaware, USA" },
        { name: "Arjun Mehta", role: "Consultant", jurisdictionOrAddress: "Independent Architect" },
      ],
      effectiveDate: "2026-11-01",
      expirationDate: "2027-11-01",
      governingLaw: "Laws of the State of California",
      summary: "Master Services Agreement for independent consulting services. Consultant bills $95/hr on Net 15 terms. IP assignment occurs only upon full fee payment. Either party may terminate with 30 days' notice.",
      pageCount: 3,
      clauses: [
        {
          id: "fl_clause_1",
          section: "Section 3",
          title: "Fees and Payment Terms",
          category: "Payment",
          sourceText: "3.1 Hourly Rate: USD $95/hr. 3.2 Invoicing: Net 15 days via wire transfer. 3.3 Late Payments: 1.5% interest per month.",
          plainLanguage: "You bill $95/hr bi-weekly. Client has 15 days to pay. Late payments accrue 1.5% interest per month.",
          obligations: ["Submit bi-weekly invoices", "Client must pay within 15 days"],
          importantDates: ["Payment terms: Net 15 days"],
          questionsToConsider: ["Who covers wire transfer fees and foreign exchange conversion?"],
          reviewReason: null,
          reviewSeverity: "info",
        },
        {
          id: "fl_clause_2",
          section: "Section 4",
          title: "Term and Termination",
          category: "Termination",
          sourceText: "4.2 Termination for Convenience: Either party may terminate with thirty (30) days' written notice.",
          plainLanguage: "Either party can cancel the contract at any time by giving 30 days' notice.",
          obligations: ["Provide 30 days' written notice to terminate"],
          importantDates: ["Notice period: 30 days"],
          questionsToConsider: ["Are partially completed milestones compensated upon termination?"],
          reviewReason: null,
          reviewSeverity: "info",
        },
        {
          id: "fl_clause_3",
          section: "Section 5",
          title: "Intellectual Property Ownership",
          category: "Intellectual Property",
          sourceText: "5.1 Deliverables owned by Client upon full payment of fees. 5.2 Consultant retains pre-existing tools and background IP.",
          plainLanguage: "Client only owns deliverables after paying you in full. You keep all rights to your own pre-existing code libraries.",
          obligations: ["Transfer rights only after receiving full payment"],
          importantDates: [],
          questionsToConsider: [],
          reviewReason: null,
          reviewSeverity: "info",
        },
      ],
      importantDates: [
        {
          label: "Payment Due Date",
          dateOrPeriod: "Net 15 Days",
          section: "Section 3.2",
          type: "deadline",
          consequence: "1.5% monthly late fee applies if unpaid.",
        },
        {
          label: "Termination Notice",
          dateOrPeriod: "30 Days Notice",
          section: "Section 4.2",
          type: "noticePeriod",
          consequence: "Convenience termination notice.",
        },
      ],
      userObligations: [
        {
          id: "fl_ob_1",
          who: "user",
          text: "Deliver consulting work per active Statements of Work (SOW).",
          section: "Section 1",
          priority: "high",
        },
        {
          id: "fl_ob_2",
          who: "user",
          text: "Provide 30 days' written notice to terminate.",
          section: "Section 4.2",
          priority: "medium",
        },
      ],
      otherPartyObligations: [
        {
          id: "fl_ob_3",
          who: "otherParty",
          text: "Pay invoices within 15 days of receipt at $95/hour.",
          section: "Section 3.2",
          priority: "high",
        },
      ],
      financialTerms: [
        {
          title: "Consulting Rate",
          terms: "USD $95 per hour",
          section: "Section 3.1",
        },
        {
          title: "Payment Window",
          terms: "Net 15 days",
          section: "Section 3.2",
        },
      ],
      restrictions: [
        {
          title: "Confidentiality",
          description: "3-year confidentiality on proprietary information.",
          section: "Section 6",
          durationOrScope: "3 years",
        },
      ],
      potentialAmbiguities: [],
      questionsForProfessional: [
        {
          category: "Cross-Border Tax",
          question: "How do US withholding tax regulations (Form W-8BEN) apply to an Indian resident software consultant billing a Delaware company?",
          relevantSection: "Section 2 & 3",
          context: "Cross-border tax compliance and DTAA benefits.",
        },
      ],
    },
  },
];
