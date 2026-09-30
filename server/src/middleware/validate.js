import { ValidationError } from '../utils/errors.js';

/**
 * Validates request data against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message
        }));
        throw new ValidationError('Validation failed for request data', details);
      }

      // Replace with sanitized/coerced data
      req[source] = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
}
