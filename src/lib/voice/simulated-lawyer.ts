export type CounselPresence = 'away' | 'joining' | 'joined';

export function simulatedCounselRemark(section?: string): string {
  if (section) {
    return `I have the call. I would want to read ${section} with you before anything is signed. I am a simulated participant for this demo, not your lawyer, and I am not giving legal advice.`;
  }
  return 'I have joined this call. Tell me which clause you are looking at. I am a simulated participant for this demo, not a lawyer, and this is not legal advice.';
}
