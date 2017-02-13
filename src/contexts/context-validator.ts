import * as Joi from "joi";

export const createContextModel = Joi.object().keys({
    scope: Joi.string().required()
});

export const updateContextModel = Joi.object().keys({
    scope: Joi.string().required()
    // description: Joi.string().required(),
    // completed: Joi.boolean()
});
