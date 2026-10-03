'use strict';

const crypto = require('crypto');

/**
 * rowHash — a 64-char SHA-256 fingerprint of the fields that matter for invoicing.
 * When it changes, the row changed (spec §7).
 *
 * Recipe — SHA-256 (hex, lowercase) of these values joined by "|", in this order:
 *
 *   rowId|progStatus|appStatus|readyForInvoice|duration|programDuration|
 *   addOnName|invoicingSchoolDbId|schoolDbId|creatorInvoice.number|creatorInvoice.amount
 *
 * Rules (spec §7):
 *   - null is an empty string.
 *   - readyForInvoice is the literal "true" / "false".
 *   - creatorInvoice.number / .amount are empty when there is no invoice.
 *   - the amount prints exactly as JSON prints a number (25695, 24995.5) — so String(Number).
 *
 * Every input is a field of the row itself, so Bubble can recompute it independently.
 */
function computeRowHash(row) {
  const invoice = row.creatorInvoice || null;

  const parts = [
    str(row.rowId),
    str(row.progStatus),
    str(row.appStatus),
    row.readyForInvoice ? 'true' : 'false',
    str(row.duration),
    str(row.programDuration),
    str(row.addOnName),
    str(row.invoicingSchoolDbId),
    str(row.schoolDbId),
    invoice && invoice.number != null ? String(invoice.number) : '',
    invoice && invoice.amount != null ? String(invoice.amount) : '',
  ];

  return crypto.createHash('sha256').update(parts.join('|')).digest('hex');
}

// null / undefined -> "" ; everything else -> its string form.
function str(v) {
  return v == null ? '' : String(v);
}

module.exports = { computeRowHash };
