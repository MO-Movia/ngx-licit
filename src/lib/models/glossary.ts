/**
 * @license MIT
 * @copyright Copyright 2025 Modus Operandi Inc. All Rights Reserved.
 */

export interface Glossary {
  id: string;
  term: string;
  description: string;
}

const GlossaryEntry = (
  id: string,
  term: string,
  description: string
): Glossary => ({ id, term, description });

export const ACRONYMS_CONTENT = [
  GlossaryEntry(
    '1',
    'ASAP',
    'ASAP is an acronym for as soon as possible. This common phrase means you will do something when you have the chance.'
  ),
  GlossaryEntry(
    '2',
    'IMAX',
    'The IMAX in IMAX Theater actually stands for Image Maximum. This is a large-format movie theater.'
  ),
  GlossaryEntry(
    '3',
    'PIN',
    'When in all-caps, the word PIN stands for personal identification number. This is a secret number you create to access private documents, files and account information.'
  ),
  GlossaryEntry(
    '4',
    'RADAR',
    'RADAR stands for radio detection and ranging. This technology is rarely called anything other than its acronym.'
  ),
  GlossaryEntry(
    '5',
    'TASER',
    'The electrical weapon actually is an acronym for Thomas A. Swifts Electric Rifle.'
  ),
  GlossaryEntry(
    '6',
    'SCUBA',
    'This piece of diving equipment is an acronym for self-contained underwater breathing apparatus.'
  ),
  GlossaryEntry(
    '7',
    'NASA',
    'NASA stands for National Aeronautics and Space Administration, and this organization once took a man to the moon.'
  ),
  GlossaryEntry(
    '8',
    'NAFTA',
    'NAFTA is the acronym or the North American Free Trade Agreement. This organization governs trade among North American countries.'
  ),
  GlossaryEntry(
    '9',
    'HIPAA',
    'The Health Insurance Portability Accountability Act is responsible for keeping medical information private.'
  ),
  GlossaryEntry(
    '10',
    'DARE',
    'Most people no longer remember that DARE stands for Drug Abuse Resistance Education'
  ),
  GlossaryEntry('11', 'AEF', 'air expeditionary force'),
  GlossaryEntry('12', 'AFDP', 'Air Force Doctrine Publication'),
  GlossaryEntry('13', 'AvFID', 'aviation foreign internal defense'),
  GlossaryEntry('14', 'BSZ', 'base security zone'),
  GlossaryEntry('15', 'CS', 'combat support'),
  GlossaryEntry('16', 'COMAFFOR', 'commander, Air Force forces'),
  GlossaryEntry(
    '17',
    'COMAFSOF',
    'commander, Air Force special operations forces'
  ),
  GlossaryEntry('18', 'CoL', 'continuum of learning'),
  GlossaryEntry('19', 'CTO', 'counterthreat operations; cyber tasking order'),
  GlossaryEntry('20', 'DFC', 'defense force commander'),
  GlossaryEntry('21', 'DCS', 'defensive counterspace'),
  GlossaryEntry('22', 'DIRSPACEFOR', 'director of space forces'),
  GlossaryEntry('23', 'EBAO', 'effects-based approach to operations'),
  GlossaryEntry('24', 'EWIR', 'electronic warfare integrated reprogramming'),
  GlossaryEntry('25', 'FPI', 'force protection intelligence'),
  GlossaryEntry('26', 'GAMSS', 'Global Air Mobility Support System'),
  GlossaryEntry('27', 'JPPA', 'joint planning process for air'),
  GlossaryEntry('28', 'OA', 'operational-level assessment'),
  GlossaryEntry('29', 'OCS', 'offensive counterspace'),
  GlossaryEntry('30', 'OWS', 'operational weather squadron'),
];

export const GLOSSARY_CONTENT = [
  GlossaryEntry('1', 'IAS', 'Indian Administrative Service'),
  GlossaryEntry('2', 'IIT', 'Indian Institute of Technology'),
  GlossaryEntry('3', 'CAS', 'Close Air Support'),
  GlossaryEntry('4', 'CAS', 'Continuous Aerial Surveillance'),
  GlossaryEntry(
    '5',
    'Analysis of Variance (ANOVA)',
    'A statistical tool used to analyze the differences among means.'
  ),
  GlossaryEntry(
    '6',
    'Confidence Interval (CI)',
    'The mean of an estimate 4/- the variation in the estimate.'
  ),
  GlossaryEntry(
    '7',
    'Comma Separated Value (CSV)',
    'A text file that uses a comma (,) to separate each value inputted.'
  ),
  GlossaryEntry(
    '8',
    'Mean Squared Error (MSE)',
    'A measurement of how close a fitted line is to plotted data points.'
  ),
  GlossaryEntry(
    '9',
    'Odds Ratio (OR)',
    'A quantification of the strength of association between two events.'
  ),
  GlossaryEntry(
    '10',
    'Process Behavior Analysis (PBA)',
    'Written analysis of a Process Behavior Chart (PBC.)'
  ),
  GlossaryEntry(
    '11',
    'Quality Assurance (QA)',
    'Systematic monitoring and evaluation to ensure standards are met.'
  ),
  GlossaryEntry(
    '12',
    'Root Mean Square (RMC)',
    'The square root of the mean square, or the quadratic mean.'
  ),
];
