# QQ Music API 服务

基于 [qq-music-api](https://github.com/jsososo/QQMusicApi) npm 包的简单 HTTP 包装服务。

## 说明

获取歌曲播放链接需要 QQ 音乐登录 Cookie（最好是 VIP 账号）。

## 配置 Cookie（可选）

如需获取播放链接，需要设置 QQ 音乐 Cookie：

1. 登录 [QQ音乐](https://y.qq.com)
2. 打开浏览器开发者工具，复制 Cookie
3. 修改 `server.js` 添加 `qqMusic.setCookie('your-cookie-here')`

```javascript
const qqMusic = require('qq-music-api');

// 设置 Cookie（需要在 createServer 之前）
qqMusic.setCookie('uin=123456; qqmusic_key=xxx; ...');
```

## API 端点

- `GET /search?key=关键词&pageNo=1&pageSize=20` - 搜索歌曲
- `GET /song/urls?id=songmid` - 获取歌曲播放链接（需登录）
- `GET /lyric?songmid=songmid` - 获取歌词
- `GET /singer/songs?singermid=singermid&page=1&num=20` - 获取歌手歌曲

## 注意

- 搜索功能无需登录
- 获取播放链接需要登录（部分歌曲可免费播放，VIP 歌曲需要 VIP 账号）
