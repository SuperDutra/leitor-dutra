// lib/relatorios.js
// Manifesto e detecção dos relatórios do Linear que o Leitor precisa.
// Funciona no browser (global window.RelatoriosImport) e no Node (module.exports).
(function (root) {
  'use strict';

  // Mesma normalização do leitor-dutra.html (minúsculas, sem acento, só a-z0-9 espaço e ponto).
  function norm(s) {
    return String(s == null ? '' : s).toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9 .]/g, '').trim();
  }

  // true se algum cabeçalho contém algum dos termos (após normalizar).
  function temColuna(headers, termos) {
    var hs = Array.isArray(headers) ? headers : [];
    return hs.some(function (h) {
      var nh = norm(h);
      return termos.some(function (t) { return nh.indexOf(norm(t)) !== -1; });
    });
  }

  // Termos copiados de importCompras/importVendas (leitor-dutra.html) para não divergir.
  var TERMOS_BARRA     = ['cod. barra', 'cód. barra', 'cod barra', 'barras', 'ean', 'barcode'];
  var TERMOS_DESCRICAO = ['descri', 'nome', 'produto'];
  var TERMOS_VENDA     = ['venda', 'vlr. vend', 'vlr vend', 'preco vend', 'prec. vend',
                          'p. venda', 'preço venda', 'preco de venda', 'prec venda'];

  // Lista ordenada dos relatórios que o Leitor pede, na ordem da sequência guiada.
  var RELATORIOS = [
    { id: 'compras', nome: 'Compras' },
    { id: 'vendas',  nome: 'Vendas'  },
  ];

  // Decide qual relatório um conjunto de cabeçalhos representa.
  // Regra (ver spec — desambiguação): precisa ter código de barras;
  // coluna de preço de VENDA ⇒ 'vendas'; senão, coluna de descrição ⇒ 'compras'.
  function detectarRelatorio(headers) {
    if (!temColuna(headers, TERMOS_BARRA)) return null;
    if (temColuna(headers, TERMOS_VENDA)) return 'vendas';
    if (temColuna(headers, TERMOS_DESCRICAO)) return 'compras';
    return null;
  }

  function relatorioPorId(id) {
    for (var i = 0; i < RELATORIOS.length; i++) {
      if (RELATORIOS[i].id === id) return RELATORIOS[i];
    }
    return null;
  }

  // A CHAVE do produto, e ela tem UMA definição só — usada pelo PWA na câmera e no
  // pacote do servidor. O banco (es1a.es1_codbarra, varchar(14)) preenche com zeros
  // à esquerda; a câmera devolve cru. Tirar os zeros dos dois lados faz as duas
  // pontas casarem, e o piso de 8 dígitos evita comer um código curto inteiro.
  function normBarcode(s) {
    return String(s == null ? '' : s)
      .replace(/\D/g, '')
      .replace(/^0+(?=\d{8,})/, '') || String(s == null ? '' : s).trim();
  }

  var api = {
    RELATORIOS: RELATORIOS,
    detectarRelatorio: detectarRelatorio,
    relatorioPorId: relatorioPorId,
    normBarcode: normBarcode,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RelatoriosImport = api;
})(typeof self !== 'undefined' ? self : this);
