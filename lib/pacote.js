// lib/pacote.js
// Forma de ARMAZENAMENTO do pacote no aparelho. O formato que trafega é o legível
// (um objeto por produto, ver a spec §3.3); o que vai para o localStorage é colunar,
// porque o nome dos campos repetido 17.756 vezes é ~0,6 MB de puro rótulo.
// Funciona no browser (window.PacoteLeitor) e no Node (module.exports).
(function (root) {
  'use strict';

  var CAMPOS = ['barcode','codigo','nome','compra','anterior','venda','um','dataCompra','dataVenda'];

  function compactar(pacote) {
    var p = pacote || {};
    var linhas = (p.produtos || []).map(function (x) {
      return CAMPOS.map(function (c) { return x[c] === undefined ? null : x[c]; });
    });
    return [p.versao || 1, p.gerado || null, linhas];
  }

  function expandir(compacto) {
    var c = compacto || [];
    var linhas = c[2] || [];
    return {
      versao: c[0] || 1,
      gerado: c[1] || null,
      produtos: linhas.map(function (l) {
        var o = {};
        for (var i = 0; i < CAMPOS.length; i++) o[CAMPOS[i]] = l[i] === undefined ? null : l[i];
        return o;
      }),
    };
  }

  // Indexa pela MESMA chave que a câmera produz. Sem isto o pacote entraria com o
  // formato do banco (zeros à esquerda) e a busca nunca acharia nada.
  function indexar(produtos) {
    var norm = (typeof require === 'function')
      ? require('./relatorios.js').normBarcode
      : root.RelatoriosImport.normBarcode;
    var idx = {};
    (produtos || []).forEach(function (p) {
      var k = norm(p.barcode);
      if (k) idx[k] = p;
    });
    return idx;
  }

  var api = { CAMPOS: CAMPOS, compactar: compactar, expandir: expandir, indexar: indexar };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PacoteLeitor = api;
})(typeof self !== 'undefined' ? self : this);
