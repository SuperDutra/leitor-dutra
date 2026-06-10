const { test } = require('node:test');
const assert = require('node:assert');
const R = require('../lib/relatorios.js');

test('detecta Compras (barra + descrição, sem preço de venda)', () => {
  const headers = ['Código', 'Cód. Barra', 'Descrição', 'Anterior', 'Compra', 'UM'];
  assert.strictEqual(R.detectarRelatorio(headers), 'compras');
});

test('detecta Vendas pela coluna de preço de venda (mesmo com descrição)', () => {
  const headers = ['Cód. Barra', 'Descrição', 'Venda'];
  assert.strictEqual(R.detectarRelatorio(headers), 'vendas');
});

test('detecta Vendas com cabeçalhos abreviados', () => {
  assert.strictEqual(R.detectarRelatorio(['Barras', 'P. Venda']), 'vendas');
});

test('arquivo sem código de barras não é reconhecido', () => {
  assert.strictEqual(R.detectarRelatorio(['Descrição', 'Venda']), null);
});

test('arquivo totalmente fora do padrão retorna null', () => {
  assert.strictEqual(R.detectarRelatorio(['Foo', 'Bar', 'Baz']), null);
});

test('cabeçalhos vazios/indefinidos não quebram', () => {
  assert.strictEqual(R.detectarRelatorio([]), null);
  assert.strictEqual(R.detectarRelatorio(undefined), null);
});

test('RELATORIOS está na ordem Compras → Vendas', () => {
  assert.deepStrictEqual(R.RELATORIOS.map(r => r.id), ['compras', 'vendas']);
});

test('relatorioPorId devolve o nome amigável', () => {
  assert.strictEqual(R.relatorioPorId('vendas').nome, 'Vendas');
  assert.strictEqual(R.relatorioPorId('xxx'), null);
});
