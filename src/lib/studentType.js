'use strict';

/**
 * Student Type codes + new/returning/extension flags (spec §5).
 *
 * The flags come from the Student Type codes the dashboard shows as badges, read from
 * the application's CRM "Status Detail" tags. The raw tag text is never served.
 *
 * In the real EduDash this mirrors the dashboard's own matcher (server copy kept identical
 * to lib/student-type.js on the page). Here it reads the same tag input the feed provides.
 *
 * Code map (spec §5):
 *   RS   tag "Re-enrolling"
 *   RN   tag "RN"
 *   XT   tag "Extension"            (the January XT programs)
 *   AX/BX  invoicing school contains AX / BX
 *   VIP · DP · SP · ER · DM · TRF
 *          VIP · Direct Placement · Self-Placement · Early Return · Dismissal · Edu USA Transfer
 *
 *   isReturning = RS or RN   ·   isExtension = XT   ·   isNew = none of RS, RN, XT
 *   Tags sit on the application, so every program row of one application carries the same flags.
 */

// tag text (as it appears in CRM Status Detail) -> Student Type code
const TAG_CODES = [
  { code: 'RS', test: (t) => t === 're-enrolling' },
  { code: 'RN', test: (t) => t === 'rn' },
  { code: 'XT', test: (t) => t === 'extension' },
  { code: 'VIP', test: (t) => t === 'vip' },
  { code: 'DP', test: (t) => t === 'direct placement' },
  { code: 'SP', test: (t) => t === 'self-placement' },
  { code: 'ER', test: (t) => t === 'early return' },
  { code: 'DM', test: (t) => t === 'dismissal' },
  { code: 'TRF', test: (t) => t === 'edu usa transfer' },
];

/**
 * Resolve the Student Type codes and flags for a row.
 *
 * @param {object} input
 * @param {string[]} input.statusDetailTags  Raw CRM Status Detail tags on the application.
 * @param {string}   input.invoicingSchool   Invoicing school name (for AX / BX).
 * @returns {{ studentTypes: string[], isNew: boolean, isReturning: boolean,
 *            isExtension: boolean, flagSource: string }}
 */
function resolveStudentType({ statusDetailTags = [], invoicingSchool = '' } = {}) {
  const codes = [];
  const sources = [];

  const normTags = statusDetailTags.map((t) => String(t).trim().toLowerCase());
  for (const { code, test } of TAG_CODES) {
    if (normTags.some(test)) {
      codes.push(code);
      sources.push(`studentTypes:${code}`);
    }
  }

  // AX / BX come from the invoicing school name, not from a tag.
  const school = String(invoicingSchool || '').toUpperCase();
  if (/\bAX\b/.test(school)) {
    codes.push('AX');
    sources.push('invoicingSchool:AX');
  }
  if (/\bBX\b/.test(school)) {
    codes.push('BX');
    sources.push('invoicingSchool:BX');
  }

  const has = (c) => codes.includes(c);
  const isReturning = has('RS') || has('RN');
  const isExtension = has('XT');
  const isNew = !isReturning && !isExtension;

  return {
    studentTypes: codes,
    isNew,
    isReturning,
    isExtension,
    flagSource: sources.join(','),
  };
}

module.exports = { resolveStudentType };
