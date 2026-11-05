window.BLACK_CONFIG = Object.freeze({ experiment: 'black2026-v1', endpoint: 'https://script.google.com/macros/s/AKfycbyZfwxF8OYl4v58ojrtkjOI5GYFqewjig-NPuA0bp9KfWlLn6UV_8ToXOkPl7JlPCcDHA/exec' });

/* Redirecionamento da inscrição para a página de vendas.
   A partir de 05/11/2026 às 23h (Brasília) quem abrir a inscrição vai para vendas.html (mantendo UTMs).
   Quem já estiver com a página aberta nessa hora também é levado. Para ver a inscrição depois disso: adicione ?inscricao=1 ao endereço. */
(function () {
  if (new URLSearchParams(location.search).get('inscricao') === '1') return;
  var quando = Date.parse('2026-11-05T23:00:00-03:00');
  function ir() { location.replace('vendas.html' + location.search + location.hash); }
  var falta = quando - Date.now();
  if (falta <= 0) { ir(); return; }
  if (falta < 2147483647) setTimeout(ir, falta);
})();
