  🌐 访问地址

   服务       地址
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   前端页面   http://152.136.132.69
   后端 API   http://152.136.132.69:3001

  👤 演示账号

   账号          密码     角色
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   jay_chou      123456   歌手
   jj_lin        123456   歌手
   eason_chan    123456   歌手
   music_lover   123456   用户

  📊 数据概览

  • 🎵 65 首歌曲 已预置
  • 📁 10 个歌单 已创建
  • ❤️ 10 个收藏 已添加

  📝 常用管理命令

  # 查看后端日志
  tail -f /tmp/backend.log

  # 查看 Nginx 日志
  tail -f /var/log/nginx/access.log

  # 重启后端服务
  pkill -f "node dist/index.js"
  cd /root/music_app/local_music_app/backend && nohup node dist/index.js > /tmp/backend.log 2>&1 &

  # 重启 Nginx
  sudo systemctl restart nginx
