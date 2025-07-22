# 🛠️ ArangoForge

> Criador de collections em lote para o ArangoDB com suporte completo a schemas, validações e relações ACID-like via [ArangoACID](https://github.com/Honinbou02/ArangoACID)

O **ArangoForge** é um microserviço para o ArangoDB (via Foxx) que permite criar múltiplas collections com suas respectivas validações e relacionamentos em **uma única requisição**. Ele funciona como um módulo complementar ao **ArangoACID**, que fornece a lógica de integridade relacional.

---

## ⚙️ Requisitos

- ArangoDB 3.9+
- Plugin [ArangoACID](https://github.com/Honinbou02/ArangoACID) instalado e funcionando
- Coleção `relations_config` já criada (pelo ArangoACID)

---

## 🚀 O que ele faz?

- Cria múltiplas collections com:
  - Nome
  - Campos e tipos
  - Validações customizadas (ex: min/max)
  - Campos obrigatórios
  - Documento inicial de teste
- Cria automaticamente os documentos na `relations_config` para que o **ArangoACID** valide as relações entre collections

---

## 📦 Exemplo de Requisição

Envie um `POST` para `/forge/batch` com o seguinte payload:

```json
{
  "collections": [
    {
      "name": "clientes",
      "fields": [
        { "name": "nome", "type": "string", "required": true },
        { "name": "email", "type": "string", "validations": { "min": 5, "max": 100 } }
      ]
    },
    {
      "name": "pedidos",
      "fields": [
        { "name": "cliente_id", "type": "string", "required": true },
        { "name": "valor", "type": "number", "validations": { "min": 1 } }
      ],
      "relations": [
        {
          "localField": "cliente_id",
          "refCollection": "clientes",
          "refField": "_key",
          "onDelete": "cascade"
        }
      ]
    }
  ]
}
````

---

## 📚 Estrutura Interna

* Cada `collection` recebe:

  * Schema JSON compatível com o ArangoDB
  * Documento inicial automático
* As `relations` são salvas em:

  * Collection: `relations_config`
  * Formato:

    ```json
    {
      "_key": "pedidos",
      "relations": [
        {
          "localField": "cliente_id",
          "refCollection": "clientes",
          "refField": "_key",
          "onDelete": "cascade"
        }
      ]
    }
    ```

---

## 🛡️ Validações Suportadas

* `string`: `min`, `max`
* `number`: `min`, `max`
* Campo `required`: `true | false`
* Campos booleanos simples também suportados

---

## ✅ Como usar

1. Instale o plugin **ArangoACID** e configure a collection `relations_config`.
2. Faça o deploy do Foxx service `ArangoForge` pela interface ou API.
3. Envie sua requisição `POST /forge/batch` com o JSON acima.
4. Pronto! Todas as collections, schemas e relações serão criadas.

---

## ✨ Por que usar?

* Poupa horas criando collections manualmente
* Garante integridade relacional com **ArangoACID**
* Útil para **protótipos rápidos**, **ambientes de staging** ou **criação programática de modelos**
* Ideal para **painéis administrativos**, **no-code/low-code builders** e **SaaS dinâmicos**

---

## 🧱 Roadmap

* [ ] Adicionar suporte a campos do tipo `array`, `object` e `vector`
* [ ] Criar interface visual standalone (React ou outro, ainda a decidir)
* [ ] Suporte à edição de collections existentes
* [ ] CLI para geração local

---

## 🧠 Licença

MIT — Use, quebre, aprenda, melhore e contribua.
Com ❤️ por [@Honinbou02](https://github.com/Honinbou02)
