import prisma from '../src/utils/prisma';
import bcrypt from 'bcryptjs';

// =============================================================================
// 真实热门华语歌曲数据
// 注意：音频链接使用的是示例音乐，请替换为你自己的音乐资源
// =============================================================================

// 热门华语歌曲 - 真实歌名和歌手
const realSongs = [
  // 周杰伦
  { title: '稻香', artistName: '周杰伦', duration: 223, audioId: 1 },
  { title: '晴天', artistName: '周杰伦', duration: 269, audioId: 2 },
  { title: '七里香', artistName: '周杰伦', duration: 299, audioId: 3 },
  { title: '告白气球', artistName: '周杰伦', duration: 203, audioId: 4 },
  { title: '青花瓷', artistName: '周杰伦', duration: 239, audioId: 5 },
  { title: '听妈妈的话', artistName: '周杰伦', duration: 264, audioId: 6 },
  { title: '简单爱', artistName: '周杰伦', duration: 288, audioId: 7 },
  { title: '夜曲', artistName: '周杰伦', duration: 226, audioId: 8 },
  
  // 林俊杰
  { title: '江南', artistName: '林俊杰', duration: 267, audioId: 9 },
  { title: '曹操', artistName: '林俊杰', duration: 252, audioId: 10 },
  { title: '修炼爱情', artistName: '林俊杰', duration: 286, audioId: 11 },
  { title: '可惜没如果', artistName: '林俊杰', duration: 298, audioId: 12 },
  { title: '背对背拥抱', artistName: '林俊杰', duration: 234, audioId: 13 },
  
  // 陈奕迅
  { title: '十年', artistName: '陈奕迅', duration: 206, audioId: 14 },
  { title: '浮夸', artistName: '陈奕迅', duration: 287, audioId: 15 },
  { title: 'K歌之王', artistName: '陈奕迅', duration: 224, audioId: 16 },
  { title: '爱情转移', artistName: '陈奕迅', duration: 258, audioId: 17 },
  { title: '孤勇者', artistName: '陈奕迅', duration: 271, audioId: 18 },
  { title: '富士山下', artistName: '陈奕迅', duration: 259, audioId: 19 },
  
  // 薛之谦
  { title: '演员', artistName: '薛之谦', duration: 258, audioId: 20 },
  { title: '丑八怪', artistName: '薛之谦', duration: 264, audioId: 21 },
  { title: '绅士', artistName: '薛之谦', duration: 294, audioId: 22 },
  { title: '认真的雪', artistName: '薛之谦', duration: 262, audioId: 23 },
  { title: '刚刚好', artistName: '薛之谦', duration: 246, audioId: 24 },
  
  // 毛不易
  { title: '消愁', artistName: '毛不易', duration: 325, audioId: 25 },
  { title: '像我这样的人', artistName: '毛不易', duration: 267, audioId: 26 },
  { title: '借', artistName: '毛不易', duration: 291, audioId: 27 },
  { title: '不染', artistName: '毛不易', duration: 303, audioId: 28 },
  
  // 赵雷
  { title: '成都', artistName: '赵雷', duration: 335, audioId: 29 },
  { title: '南方姑娘', artistName: '赵雷', duration: 345, audioId: 30 },
  { title: '理想', artistName: '赵雷', duration: 329, audioId: 31 },
  { title: '画', artistName: '赵雷', duration: 287, audioId: 32 },
  
  // 民谣
  { title: '南山南', artistName: '马頔', duration: 284, audioId: 33 },
  { title: '董小姐', artistName: '宋冬野', duration: 308, audioId: 34 },
  { title: '斑马斑马', artistName: '宋冬野', duration: 327, audioId: 35 },
  { title: '安和桥', artistName: '宋冬野', duration: 258, audioId: 36 },
  { title: '当你老了', artistName: '赵照', duration: 294, audioId: 37 },
  
  // 女歌手
  { title: '遇见', artistName: '孙燕姿', duration: 217, audioId: 38 },
  { title: '天黑黑', artistName: '孙燕姿', duration: 238, audioId: 39 },
  { title: '绿光', artistName: '孙燕姿', duration: 212, audioId: 40 },
  { title: '开始懂了', artistName: '孙燕姿', duration: 266, audioId: 41 },
  { title: '勇气', artistName: '梁静茹', duration: 244, audioId: 42 },
  { title: '宁夏', artistName: '梁静茹', duration: 178, audioId: 43 },
  { title: '暖暖', artistName: '梁静茹', duration: 242, audioId: 44 },
  { title: '红豆', artistName: '王菲', duration: 278, audioId: 45 },
  { title: '传奇', artistName: '王菲', duration: 308, audioId: 46 },
  { title: '匆匆那年', artistName: '王菲', duration: 238, audioId: 47 },
  
  // 其他热门
  { title: '漠河舞厅', artistName: '柳爽', duration: 325, audioId: 48 },
  { title: '如愿', artistName: '王菲', duration: 254, audioId: 49 },
  { title: '人世间', artistName: '雷佳', duration: 296, audioId: 50 },
  { title: '孤勇者', artistName: '陈奕迅', duration: 271, audioId: 51 },
  { title: '起风了', artistName: '买辣椒也用券', duration: 305, audioId: 52 },
  { title: '体面', artistName: '于文文', duration: 282, audioId: 53 },
  { title: '后来', artistName: '刘若英', duration: 341, audioId: 54 },
  { title: '小幸运', artistName: '田馥甄', duration: 274, audioId: 55 },
  { title: '平凡之路', artistName: '朴树', duration: 301, audioId: 56 },
  { title: '夜空中最亮的星', artistName: '逃跑计划', duration: 252, audioId: 57 },
  { title: '童话', artistName: '光良', duration: 249, audioId: 58 },
  { title: '第一次', artistName: '光良', duration: 285, audioId: 59 },
  { title: '红色高跟鞋', artistName: '蔡健雅', duration: 203, audioId: 60 },
  { title: '追光者', artistName: '岑宁儿', duration: 236, audioId: 61 },
  { title: '水星记', artistName: '郭顶', duration: 325, audioId: 62 },
  { title: '年少有为', artistName: '李荣浩', duration: 279, audioId: 63 },
  { title: '光年之外', artistName: 'G.E.M.邓紫棋', duration: 234, audioId: 64 },
  { title: '芒种', artistName: '音阙诗听', duration: 227, audioId: 65 },
];

// 封面图片库
const coverImages = [
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1459749411177-0473ef716175?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1496293455970-f8581aae0e3c?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1465847899078-b413929f7120?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1573871669414-010dbf73ca84?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1484876065684-b683cf17d276?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1458560871784-56d23406c091?w=400&h=400&fit=crop',
];

// 示例音频链接（使用 SoundHelix 的示例音乐，你需要替换为真实的音频链接）
const sampleAudioBase = 'https://www.soundhelix.com/examples/mp3';
const audioUrls = [
  `${sampleAudioBase}/SoundHelix-Song-1.mp3`,
  `${sampleAudioBase}/SoundHelix-Song-2.mp3`,
  `${sampleAudioBase}/SoundHelix-Song-3.mp3`,
  `${sampleAudioBase}/SoundHelix-Song-4.mp3`,
  `${sampleAudioBase}/SoundHelix-Song-5.mp3`,
  `${sampleAudioBase}/SoundHelix-Song-6.mp3`,
  `${sampleAudioBase}/SoundHelix-Song-7.mp3`,
  `${sampleAudioBase}/SoundHelix-Song-8.mp3`,
  `${sampleAudioBase}/SoundHelix-Song-9.mp3`,
  `${sampleAudioBase}/SoundHelix-Song-10.mp3`,
  `${sampleAudioBase}/SoundHelix-Song-11.mp3`,
  `${sampleAudioBase}/SoundHelix-Song-12.mp3`,
  `${sampleAudioBase}/SoundHelix-Song-13.mp3`,
  `${sampleAudioBase}/SoundHelix-Song-14.mp3`,
  `${sampleAudioBase}/SoundHelix-Song-15.mp3`,
];

// 歌单配置
type SongType = { id: number; title: string; artistName: string; artistId: number; audioUrl: string; coverUrl: string | null; duration: number; lyrics: string | null; isPublic: boolean; createdAt: Date; updatedAt: Date; };

const playlistConfigs: Array<{
  name: string;
  description: string;
  coverIndex: number;
  filter: (songs: SongType[]) => SongType[];
}> = [
  {
    name: '🔥 抖音热歌榜2024',
    description: '全网最火的流行歌曲合集，抖音热歌一网打尽',
    coverIndex: 0,
    filter: (songs) => songs.filter(s => 
      ['孤勇者', '漠河舞厅', '如愿', '人世间'].includes(s.title) || 
      s.id <= 15
    ),
  },
  {
    name: '👑 周杰伦全集',
    description: 'Jay Chou 经典歌曲完整收录，青春的回忆',
    coverIndex: 2,
    filter: (songs) => songs.filter(s => s.artistName === '周杰伦'),
  },
  {
    name: '💔 深夜emo时刻',
    description: '适合深夜独自聆听的治愈系音乐，让心灵沉淀',
    coverIndex: 1,
    filter: (songs) => songs.filter(s => 
      ['消愁', '像我这样的人', '南山南', '成都', '安和桥', '水星记'].includes(s.title)
    ),
  },
  {
    name: '✨ 林氏情歌',
    description: 'JJ林俊杰经典情歌精选，行走的CD',
    coverIndex: 8,
    filter: (songs) => songs.filter(s => s.artistName === '林俊杰'),
  },
  {
    name: '🎸 民谣小酒馆',
    description: '赵雷、宋冬野、马頔等民谣歌手经典作品',
    coverIndex: 5,
    filter: (songs) => songs.filter(s => 
      ['赵雷', '宋冬野', '马頔', '赵照'].includes(s.artistName)
    ),
  },
  {
    name: '🌸 女神之声',
    description: '王菲、孙燕姿、梁静茹经典女声精选',
    coverIndex: 14,
    filter: (songs) => songs.filter(s => 
      ['王菲', '孙燕姿', '梁静茹', '田馥甄', '于文文', '蔡健雅'].includes(s.artistName)
    ),
  },
  {
    name: '🎹 陈奕迅精选',
    description: 'Eason Chan 粤语国语经典，十年浮夸孤勇者',
    coverIndex: 4,
    filter: (songs) => songs.filter(s => s.artistName === '陈奕迅'),
  },
  {
    name: '📝 毛不易作品集',
    description: '像我这样的人、消愁、借、不染完整收录',
    coverIndex: 11,
    filter: (songs) => songs.filter(s => s.artistName === '毛不易'),
  },
  {
    name: '🎤 薛之谦金曲',
    description: '演员、丑八怪、绅士等热门单曲',
    coverIndex: 6,
    filter: (songs) => songs.filter(s => s.artistName === '薛之谦'),
  },
  {
    name: '❤️ 华语经典老歌',
    description: '那些年我们一起听过的经典华语歌曲',
    coverIndex: 3,
    filter: (songs) => songs.filter(s => 
      ['后来', '红豆', '勇气', '童话', '遇见', '天黑黑', '十年'].includes(s.title)
    ),
  },
];

async function main() {
  console.log('🌱 开始预置真实歌曲数据...\n');

  try {
    // 1. 创建示例歌手账号
    console.log('👤 创建演示账号...');
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const jayChou = await prisma.user.upsert({
      where: { username: 'jay_chou' },
      update: {},
      create: {
        username: 'jay_chou',
        email: 'jay@demo.com',
        password: hashedPassword,
        role: 'ARTIST',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop',
      },
    });

    const jjLin = await prisma.user.upsert({
      where: { username: 'jj_lin' },
      update: {},
      create: {
        username: 'jj_lin',
        email: 'jj@demo.com',
        password: hashedPassword,
        role: 'ARTIST',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      },
    });

    const easonChan = await prisma.user.upsert({
      where: { username: 'eason_chan' },
      update: {},
      create: {
        username: 'eason_chan',
        email: 'eason@demo.com',
        password: hashedPassword,
        role: 'ARTIST',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      },
    });

    const normalUser = await prisma.user.upsert({
      where: { username: 'music_lover' },
      update: {},
      create: {
        username: 'music_lover',
        email: 'lover@demo.com',
        password: hashedPassword,
        role: 'USER',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
      },
    });

    console.log(`✅ 演示账号已创建: jay_chou, jj_lin, eason_chan, music_lover`);

    // 2. 先清理旧数据
    console.log('\n🧹 清理旧数据...');
    await prisma.playlistSong.deleteMany({});
    await prisma.userFavorite.deleteMany({});
    await prisma.playlist.deleteMany({});
    await prisma.song.deleteMany({});
    console.log('✅ 旧数据已清理');

    // 3. 创建歌曲
    console.log('\n🎵 创建热门歌曲...');
    const createdSongs = [];
    
    // 分配歌手
    const getArtistId = (artistName: string) => {
      if (artistName === '周杰伦') return jayChou.id;
      if (artistName === '林俊杰') return jjLin.id;
      if (artistName === '陈奕迅') return easonChan.id;
      return jayChou.id; // 默认
    };
    
    for (const songData of realSongs) {
      const coverUrl = coverImages[songData.audioId % coverImages.length];
      const audioUrl = audioUrls[songData.audioId % audioUrls.length];
      
      const song = await prisma.song.create({
        data: {
          title: songData.title,
          artistName: songData.artistName,
          artistId: getArtistId(songData.artistName),
          coverUrl,
          audioUrl,
          duration: songData.duration,
          isPublic: true,
        },
      });
      createdSongs.push(song);
      process.stdout.write('.');
    }
    console.log(`\n✅ 已创建 ${createdSongs.length} 首歌曲`);

    // 4. 创建歌单
    console.log('\n📋 创建精选歌单...');
    
    for (const config of playlistConfigs) {
      const selectedSongs = config.filter(createdSongs);
      
      if (selectedSongs.length === 0) continue;
      
      const playlist = await prisma.playlist.create({
        data: {
          name: config.name,
          description: config.description,
          coverUrl: coverImages[config.coverIndex],
          userId: [jayChou.id, jjLin.id, easonChan.id, normalUser.id][Math.floor(Math.random() * 4)],
          isPublic: true,
          songs: {
            create: selectedSongs.map((song, index) => ({
              songId: song.id,
              order: index,
            })),
          },
        },
      });
      
      console.log(`  ✅ ${config.name} (${selectedSongs.length} 首)`);
    }

    // 5. 添加一些收藏
    console.log('\n❤️ 添加用户收藏...');
    const randomSongs = createdSongs.sort(() => 0.5 - Math.random()).slice(0, 10);
    for (const song of randomSongs) {
      await prisma.userFavorite.create({
        data: {
          userId: normalUser.id,
          songId: song.id,
        },
      });
    }
    console.log(`✅ 已添加 ${randomSongs.length} 个收藏`);

    console.log('\n' + '='.repeat(50));
    console.log('🎉 数据预置完成！');
    console.log('='.repeat(50));
    console.log('\n📌 演示账号:');
    console.log('  🎤 jay_chou   / 123456  (歌手)');
    console.log('  🎤 jj_lin     / 123456  (歌手)');
    console.log('  🎤 eason_chan / 123456  (歌手)');
    console.log('  👤 music_lover/ 123456  (用户)');
    console.log('\n📊 数据概览:');
    console.log(`  🎵 歌曲数量: ${createdSongs.length} 首`);
    console.log(`  📁 歌单数量: ${playlistConfigs.length} 个`);
    console.log(`  ❤️ 收藏数量: ${randomSongs.length} 个`);
    console.log('\n⚠️  提示: 音频链接使用的是示例音乐');
    console.log('    如需真实歌曲，请自行替换 audioUrl 为真实音频链接');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ 错误:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
