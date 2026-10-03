'use strict';

/**
 * An error that carries the HTTP status and the exact JSON body the spec prescribes (§8).
 * Throw it anywhere in request handling; the error middleware renders { "error": message }.
 */
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

module.exports = { ApiError };
