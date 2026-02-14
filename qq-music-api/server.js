const qqMusic = require('qq-music-api');
const http = require('http');
const url = require('url');

// 从环境变量读取 QQ 音乐 Cookie（可选）
const QQ_COOKIE = process.env.QQ_MUSIC_COOKIE;
if (QQ_COOKIE) {
  qqMusic.setCookie(QQ_COOKIE);
  console.log('已配置 QQ 音乐 Cookie');
  console.log('Cookie 内容:', QQ_COOKIE.slice(0, 100) + '...');
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  const parsed = url.parse(req.url, true);
  const path = parsed.pathname;
  const query = parsed.query;
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${path}`, query);
  
  try {
    let result;
    switch (path) {
      case '/search':
        console.log('调用搜索 API, key:', query.key);
        result = await qqMusic.api('search', { 
          key: query.key, 
          pageNo: parseInt(query.pageNo) || 1, 
          pageSize: parseInt(query.pageSize) || 20 
        });
        console.log('搜索结果:', JSON.stringify(result).slice(0, 200));
        break;
      case '/song/urls':
        console.log('调用 song/urls API, id:', query.id);
        result = await qqMusic.api('song/urls', { id: query.id, ownCookie: 1 });
        console.log('song/urls 结果:', JSON.stringify(result).slice(0, 200));
        break;
      case '/lyric':
        console.log('调用 lyric API, songmid:', query.songmid);
        result = await qqMusic.api('lyric', { songmid: query.songmid });
        break;
      case '/singer/songs':
        console.log('调用 singer/songs API, singermid:', query.singermid);
        result = await qqMusic.api('singer/songs', { 
          singermid: query.singermid, 
          page: parseInt(query.page) || 1, 
          num: parseInt(query.num) || 20 
        });
        break;
      default:
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Not Found' }));
        return;
    }
    res.end(JSON.stringify(result));
  } catch (e) {
    console.error('API 错误:', e);
    res.statusCode = 500;
    res.end(JSON.stringify({ 
      error: e.message || 'Unknown error',
      details: e
    }));
  }
});

server.listen(3300, () => console.log('QQ Music API running on port 3300'));
