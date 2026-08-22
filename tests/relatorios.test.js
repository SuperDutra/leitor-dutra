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

// A JUNÇÃO: o banco guarda com zeros à esquerda (varchar(14)), a câmera devolve cru.
// Este teste alimenta os DOIS formatos de propósito. Com um formato só, ele
// concordaria consigo mesmo e esconderia exatamente o defeito que existe para pegar.
test('junção: EAN-8 do banco (com zeros) e da câmera (cru) viram a mesma chave', () => {
  const doBanco  = '0000078912345';   // como es1a.es1_codbarra guarda
  const daCamera = '78912345';        // como o leitor devolve
  assert.strictEqual(R.normBarcode(doBanco), R.normBarcode(daCamera));
});

test('junção: EAN-13 sem zeros é idêntico dos dois lados', () => {
  assert.strictEqual(R.normBarcode('7891000100103'), R.normBarcode('7891000100103'));
  assert.strictEqual(R.normBarcode('7891000100103'), '7891000100103');
});

test('normBarcode nunca encurta abaixo de 8 dígitos', () => {
  // Código interno curto: preserva o que sobra em vez de virar string vazia.
  assert.strictEqual(R.normBarcode('0000000000031').length >= 8, true);
});

test('normBarcode descarta separadores que a câmera às vezes devolve', () => {
  assert.strictEqual(R.normBarcode('789 1000-100103'), '7891000100103');
});
