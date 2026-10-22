/**
 * Yggdrasill: небольшой сервер для списка реальных лотов.
 * Требования: Node.js 18+ (встроенный fetch).
 * Запуск: node server.js
 * Порт по умолчанию: http://localhost:3000
 *
 * Чтобы обновлять список из внешнего API/JSON-фида, задай REAL_LOTS_FEED_URL.
 * Источник должен возвращать JSON-массив лотов или объект {"lots": [...]}.
 * Каждый лот: {"title":"...", "artist":"...", "source":"...",
 * "category":"...", "estimate":"...", "status":"...", "url":"https://..."}.
 * Не используй неофициальный фид без проверки его условий и надёжности.
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const PORT = Number(process.env.PORT || 3000);
const FEED_URL = process.env.REAL_LOTS_FEED_URL || '';
const ROOT = __dirname;
const fallbackLots = [
  {source:'Phillips',title:'Yellow Nights',artist:'Eva Helene Pade',category:'Живопись',estimate:'£30,000–50,000',url:'https://www.phillips.com/detail/eva-helene-pade/238647',symbol:'🌙',status:'Проверьте статус торгов на сайте аукциона.'},
  {source:'Phillips',title:'The Smile and Shudder',artist:'Cecily Brown',category:'Современное искусство',estimate:'£250,000–350,000',url:'https://www.phillips.com/detail/cecily-brown/238329',symbol:'🎨',status:'Проверьте статус торгов на сайте аукциона.'},
  {source:'Phillips',title:'Keep Ou T',artist:'Banksy',category:'Современное искусство',estimate:'£1,200,000–1,800,000',url:'https://www.phillips.com/detail/banksy/238143',symbol:'🖼️',status:'Проверьте статус торгов на сайте аукциона.'}
];
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/api/real-lots') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    try {
      if (!FEED_URL) {
        res.writeHead(200);
        return res.end(JSON.stringify({lots:fallbackLots,updatedAt:new Date().toISOString(),source:'fallback',message:'REAL_LOTS_FEED_URL не настроен'}));
      }
      const feed = new URL(FEED_URL);
      if (!['http:','https:'].includes(feed.protocol)) throw new Error('Разрешены только HTTP(S) источники');
      const upstream = await fetch(feed, {headers:{Accept:'application/json'}, signal:AbortSignal.timeout(12000)});
      if (!upstream.ok) throw new Error(`Источник вернул HTTP ${upstream.status}`);
      const body = await upstream.json();
      const lots = Array.isArray(body) ? body : body.lots;
      if (!Array.isArray(lots)) throw new Error('Источник должен возвращать массив лотов или объект { lots: [...] }');
      const cleaned = lots.filter(x => x && typeof x === 'object').map(x => {
        let lotUrl = '';
        try { const u = new URL(String(x.url || x.link || '')); if (['http:','https:'].includes(u.protocol)) lotUrl = u.href; } catch {}
        return {
          title:String(x.title || x.name || 'Без названия').slice(0,250),
          artist:String(x.artist || x.creator || x.auction || 'Автор не указан').slice(0,200),
          source:String(x.source || x.auctionHouse || 'Аукцион').slice(0,100),
          category:String(x.category || 'Предмет искусства').slice(0,100),
          estimate:String(x.estimate || x.priceEstimate || 'Оценка не указана').slice(0,100),
          status:String(x.status || 'Статус проверьте на сайте аукциона').slice(0,250),
          symbol:String(x.symbol || '🖼️').slice(0,8), url:lotUrl
        };
      });
      res.writeHead(200);
      res.end(JSON.stringify({lots:cleaned,updatedAt:new Date().toISOString(),source:'feed'}));
    } catch (err) {
      res.writeHead(502);
      res.end(JSON.stringify({error:'Не удалось обновить данные',detail:err.message}));
    }
    return;
  }
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.resolve(ROOT, '.' + pathname);
  if (!filePath.startsWith(ROOT + path.sep) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404); return res.end('Not found');
  }
  const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8'};
  res.writeHead(200, {'Content-Type':types[path.extname(filePath)] || 'application/octet-stream'});
  fs.createReadStream(filePath).pipe(res);
});
server.listen(PORT, '0.0.0.0', () => console.log(`Yggdrasill открыт на порту ${PORT}`));
