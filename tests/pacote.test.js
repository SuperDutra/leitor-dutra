const { test } = require('node:test');
const assert = require('node:assert');
const P = require('../lib/pacote.js');

const PACOTE = {
  versao: 1,
  gerado: '2026-08-22T14:30:00-03:00',
  linhas: 2,
  produtos: [
    { barcode: '0000078912345', codigo: '012345', nome: 'ARROZ TIPO 1 5KG',
      compra: 18.5, anterior: 17.9, venda: 24.9, um: 'UN',
      dataCompra: '2026-08-21', dataVenda: '2026-07-13' },
    { barcode: '7891000100103', codigo: '000602', nome: 'LEITE INTEGRAL 1L',
      compra: 4.2, anterior: null, venda: 5.99, um: 'UN',
      dataCompra: null, dataVenda: null },
  ],
};

test('ida e volta preserva todos os campos, inclusive os nulos', () => {
  const volta = P.expandir(P.compactar(PACOTE));
  assert.deepStrictEqual(volta.produtos, PACOTE.produtos);
  assert.strictEqual(volta.gerado, PACOTE.gerado);
});

test('null continua null — nunca vira 0 nem string vazia', () => {
  const volta = P.expandir(P.compactar(PACOTE));
  const leite = volta.produtos[1];
  assert.strictEqual(leite.anterior, null);
  assert.strictEqual(leite.dataCompra, null);
  assert.strictEqual(leite.dataVenda, null);
});

test('a forma compacta é bem menor que a forma legível', () => {
  // Afirma a PROPRIEDADE (a compactação vale a pena), não um número calibrado.
  // Com 2 produtos a folga é pequena — o rótulo pesa proporcionalmente menos que
  // nos 17.756 reais, onde a razão fica bem abaixo disto.
  const cru      = JSON.stringify(PACOTE).length;
  const compacto = JSON.stringify(P.compactar(PACOTE)).length;
  assert.ok(compacto < cru * 0.75, `compacto=${compacto} cru=${cru}`);
});

test('indexar usa a MESMA chave da câmera — o barcode do banco acha o da câmera', () => {
  const idx = P.indexar(PACOTE.produtos);
  const R = require('../lib/relatorios.js');
  // O produto entrou com o formato do banco; a busca vem com o formato da câmera.
  assert.ok(idx[R.normBarcode('78912345')], 'EAN-8 da câmera não achou o produto do banco');
  assert.strictEqual(idx[R.normBarcode('78912345')].nome, 'ARROZ TIPO 1 5KG');
});
