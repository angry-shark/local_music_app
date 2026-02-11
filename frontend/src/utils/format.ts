// 格式化时间（秒 -> mm:ss）
export const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 格式化日期
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// 获取角色名称
export const getRoleName = (role: string): string => {
  const roleMap: Record<string, string> = {
    USER: '使用者',
    ARTIST: '歌手',
    ADMIN: '管理员',
  };
  return roleMap[role] || role;
};

// 获取角色颜色
export const getRoleColor = (role: string): string => {
  const colorMap: Record<string, string> = {
    USER: 'bg-blue-500',
    ARTIST: 'bg-purple-500',
    ADMIN: 'bg-red-500',
  };
  return colorMap[role] || 'bg-gray-500';
};
