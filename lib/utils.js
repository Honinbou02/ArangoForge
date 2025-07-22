'use strict';
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;

function buildSchema(fields) {
  const props = {};
  const required = [];
  fields.forEach(f => {
    props[f.name] = { type: f.type };
    if (f.type === 'array') props[f.name].items = { type: 'object' };
    if (f.type === 'string') {
      if (f.validations?.min) props[f.name].minLength = f.validations.min;
      if (f.validations?.max) props[f.name].maxLength = f.validations.max;
    }
    if (f.required) required.push(f.name);
  });
  return {
    rule: { type: 'object', properties: props, required, additionalProperties: false },
    level: 'moderate',
    message: 'Schema validation failed'
  };
}

function atomicCreate(collections) {
  const collNames = collections.map(c => c.name);

  // Pré-cheque
  const existing = collNames.filter(n => db._collection(n));
  if (existing.length) {
    throw new Error(`Collections already exist: ${existing.join(', ')}`);
  }

  const created = [];  // guarda o que já criou para rollback

  try {
    // 1) Criar relations_config se precisar
    let relColl = db._collection('relations_config');
    if (!relColl) relColl = db._createDocumentCollection('relations_config');

    // 2) Criar collections/schemas
    collections.forEach(col => {
      const c = db._createDocumentCollection(col.name);
      c.properties({ schema: buildSchema(col.fields) });
      created.push(col.name);
    });

    // 3) Gravar relações
    collections.forEach(col => {
      if (col.relations.length) {
        db._query(aql`
          UPSERT { _key: ${col.name} }
          INSERT { _key: ${col.name}, relations: ${col.relations} }
          UPDATE { relations: ${col.relations} }
          IN relations_config
        `);
      }
    });

    return created;
  } catch (err) {
    // Rollback manual: apagar tudo que criou
    created.forEach(name => {
      const c = db._collection(name);
      if (c) c.drop();
    });
    console.error('[rollback]', err.stack || err.message);
    throw new Error(`Atomic create failed: ${err.message}`);
  }
}

module.exports = { atomicCreate };