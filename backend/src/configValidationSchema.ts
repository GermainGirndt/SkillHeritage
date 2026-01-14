import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  SKILL_HERITAGE_VECTOR_STORE_ID: Joi.string().required(),
  MONGODB_URI: Joi.string().required(),
  OPENAI_API_KEY: Joi.string().required(),
});
