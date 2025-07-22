'use strict';
const joi = require('joi');
const createRouter = require('@arangodb/foxx/router');
const router = createRouter();
const utils = require('./lib/utils');

module.context.use(router);

// agora a rota é a raiz do mount
router.post('/', function (req, res) {
  const bodySchema = joi.object({
    collections: joi.array().items(
      joi.object({
        name: joi.string().required(),
        fields: joi.array().items(
          joi.object({
            name: joi.string().required(),
            type: joi.string().valid('string', 'number', 'boolean', 'object', 'array').required(),
            required: joi.boolean().default(false),
            validations: joi.object().optional()
          })
        ).required(),
        relations: joi.array().items(
          joi.object({
            localField: joi.string().required(),
            refCollection: joi.string().required(),
            refField: joi.string().required(),
            onDelete: joi.string().valid('cascade', 'restrict', 'setNull').default('restrict')
          })
        ).required()
      })
    ).required()
  }).required();

  const { error, value } = bodySchema.validate(req.body);
  if (error) res.throw(400, `Invalid payload: ${error.message}`);

  try {
    const created = utils.atomicCreate(value.collections);
    res.json({ success: true, created });
  } catch (e) {
    console.error('[POST]', e.stack || e.message);
    res.throw(500, { message: e.message, stack: e.stack });
  }
})
.response(['application/json']);