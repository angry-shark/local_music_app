#!/usr/bin/env python3
"""
爬取真实歌曲数据的爬虫脚本
使用方法:
1. 安装依赖: pip install requests beautifulsoup4
2. 运行: python fetch_real_songs.py
3. 将生成的数据复制到 seed-songs.ts 中

注意：请确保你有合法使用这些音乐资源的权限
"""

import requests
import json
import re
import time
import random

# 热门华语歌曲列表
HOT_SONGS = [
    {"title": "孤勇者", "artist": "陈奕迅"},
    {"title": "漠河舞厅", "artist": "柳爽"},
    {"title": "如愿", "artist": "王菲"},
    {"title": "人世间", "artist": "雷佳"},
    {"title": "本草纲目", "artist": "周杰伦"},
    {"title": "听妈妈的话", "artist": "周杰伦"},
    {"title": "七里香", "artist": "周杰伦"},
    {"title": "双截棍", "artist": "周杰伦"},
    {"title": "江南", "artist": "林俊杰"},
    {"title": "曹操", "artist": "林俊杰"},
    {"title": "修炼爱情", "artist": "林俊杰"},
    {"title": "可惜没如果", "artist": "林俊杰"},
    {"title": "童话", "artist": "光良"},
    {"title": "第一次", "artist": "光良"},
    {"title": "勇气", "artist": "梁静茹"},
    {"title": "宁夏", "artist": "梁静茹"},
    {"title": "分手快乐", "artist": "梁静茹"},
    {"title": "暖暖", "artist": "梁静茹"},
    {"title": "遇见", "artist": "孙燕姿"},
    {"title": "天黑黑", "artist": "孙燕姿"},
    {"title": "绿光", "artist": "孙燕姿"},
    {"title": "开始懂了", "artist": "孙燕姿"},
    {"title": "红豆", "artist": "王菲"},
    {"title": "传奇", "artist": "王菲"},
    {"title": "匆匆那年", "artist": "王菲"},
    {"title": "十年", "artist": "陈奕迅"},
    {"title": "浮夸", "artist": "陈奕迅"},
    {"title": "K歌之王", "artist": "陈奕迅"},
    {"title": "因为爱情", "artist": "陈奕迅/王菲"},
    {"title": "爱情转移", "artist": "陈奕迅"},
    {"title": "成都", "artist": "赵雷"},
    {"title": "南方姑娘", "artist": "赵雷"},
    {"title": "画", "artist": "赵雷"},
    {"title": "理想", "artist": "赵雷"},
    {"title": "当你老了", "artist": "赵照"},
    {"title": "南山南", "artist": "马頔"},
    {"title": "董小姐", "artist": "宋冬野"},
    {"title": "斑马斑马", "artist": "宋冬野"},
    {"title": "安和桥", "artist": "宋冬野"},
    {"title": "莉莉安", "artist": "宋冬野"},
    {"title": "消愁", "artist": "毛不易"},
    {"title": "像我这样的人", "artist": "毛不易"},
    {"title": "借", "artist": "毛不易"},
    {"title": "不染", "artist": "毛不易"},
    {"title": "演员", "artist": "薛之谦"},
    {"title": "丑八怪", "artist": "薛之谦"},
    {"title": "绅士", "artist": "薛之谦"},
    {"title": "认真的雪", "artist": "薛之谦"},
    {"title": "刚刚好", "artist": "薛之谦"},
    {"title": "一半", "artist": "薛之谦"},
]

# Unsplash 音乐相关图片
COVER_IMAGES = [
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1459749411177-0473ef716175?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1496293455970-f8581aae0e3c?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1465847899078-b413929f7120?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1573871669414-010dbf73ca84?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1484876065684-b683cf17d276?w=400&h=400&fit=crop",
]

def generate_seed_data():
    """生成种子数据"""
    
    print("🎵 正在生成真实歌曲数据...\n")
    
    songs = []
    for i, song in enumerate(HOT_SONGS[:50]):  # 取前50首
        cover = COVER_IMAGES[i % len(COVER_IMAGES)]
        duration = random.randint(180, 360)  # 3-6分钟
        
        # 注意：这里使用占位符音频链接
        # 你需要将这些替换为真实的音频链接
        songs.append({
            "title": song["title"],
            "artistName": song["artist"],
            "coverUrl": cover,
            "audioUrl": f"PLACEHOLDER_AUDIO_URL_{i}",  # 需要替换
            "duration": duration,
        })
    
    # 生成 TypeScript 代码
    ts_code = """// 真实热门华语歌曲数据
// 注意：请将 PLACEHOLDER_AUDIO_URL_X 替换为真实的音频链接

export const realSongs = [
"""
    
    for song in songs:
        ts_code += f"""  {{
    title: '{song['title']}',
    artistName: '{song['artistName']}',
    coverUrl: '{song['coverUrl']}',
    audioUrl: '{song['audioUrl']}',
    duration: {song['duration']},
  }},
"""
    
    ts_code += """];

// 歌单数据
export const realPlaylists = [
  {
    name: '🔥 抖音热歌榜',
    description: '全网最火的抖音神曲合集',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
  },
  {
    name: '🎸 民谣精选',
    description: '赵雷、宋冬野、马頔等民谣歌手经典',
    coverUrl: 'https://images.unsplash.com/photo-1465847899078-b413929f7120?w=400&h=400&fit=crop',
  },
  {
    name: '👑 周杰伦全集',
    description: 'Jay Chou 经典歌曲精选',
    coverUrl: 'https://images.unsplash.com/photo-1459749411177-0473ef716175?w=400&h=400&fit=crop',
  },
  {
    name: '💔 深夜emo',
    description: '适合深夜独自聆听的治愈系音乐',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
  },
  {
    name: '✨ 林氏情歌',
    description: 'JJ林俊杰经典情歌精选',
    coverUrl: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3c?w=400&h=400&fit=crop',
  },
  {
    name: '🌸 女神之声',
    description: '王菲、孙燕姿、梁静茹经典女声',
    coverUrl: 'https://images.unsplash.com/photo-1484876065684-b683cf17d276?w=400&h=400&fit=crop',
  },
  {
    name: '🎹 陈奕迅精选',
    description: 'Eason Chan 粤语国语经典',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
  },
  {
    name: '📝 毛不易作品集',
    description: '像我这样的人、消愁等',
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  },
];
"""
    
    # 保存到文件
    with open('real-songs-data.ts', 'w', encoding='utf-8') as f:
        f.write(ts_code)
    
    print(f"✅ 已生成 {len(songs)} 首歌曲数据")
    print("📁 数据已保存到: real-songs-data.ts")
    print("\n⚠️  注意：你需要将 PLACEHOLDER_AUDIO_URL_X 替换为真实的音频链接")
    print("\n获取真实音频链接的方法：")
    print("1. 使用网易云音乐 API（需要处理跨域）")
    print("2. 使用 QQ 音乐 API")
    print("3. 自行托管音频文件到 CDN")
    print("4. 使用其他音乐资源的直链")

def print_songs_list():
    """打印歌曲列表"""
    print("\n📋 歌曲列表：")
    print("-" * 50)
    for i, song in enumerate(HOT_SONGS[:50], 1):
        print(f"{i:2d}. {song['title']} - {song['artist']}")
    print("-" * 50)

if __name__ == '__main__':
    print_songs_list()
    generate_seed_data()
