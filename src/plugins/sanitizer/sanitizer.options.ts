import * as Joi from 'joi';

export const SanitizerSchema = Joi.object().keys({
  enabled: Joi.boolean().optional()
});

export interface SanitizerOptions {
  enabled: boolean;
}

export const defaults: SanitizerOptions = {
  enabled: true
};
