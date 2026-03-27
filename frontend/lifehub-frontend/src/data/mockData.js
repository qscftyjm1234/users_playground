export const MOCK_GROUPS = [
  {
    id: '1',
    name: '我的家庭群組',
    description: '管理家庭日常支出與生活家務',
    inviteCode: 'A1B2C3D4',
    role: 'Admin',
    membersCount: 3,
    members: [
      { id: 'u1', name: '小明', role: '管理員', avatar: 'M' },
      { id: 'u2', name: '小華', role: '成員', avatar: 'H' },
      { id: 'u3', name: '小強', role: '成員', avatar: 'D' }
    ],
    monthlyStats: {
      total: 12500,
      personal: 4166,
      status: '平衡中',
    }
  },
  {
    id: '2',
    name: '好友旅遊群組',
    description: '與好友出國旅遊的費用分擔',
    inviteCode: 'X9Y8Z7W6',
    role: 'Member',
    membersCount: 5,
    members: [
      { id: 'u1', name: '小明', role: '成員', avatar: 'M' },
      { id: 'u4', name: '大周', role: '管理員', avatar: 'Z' },
      { id: 'u5', name: '老李', role: '成員', avatar: 'L' }
    ],
    monthlyStats: {
      total: 8900,
      personal: 1780,
      status: '已結清',
    }
  }
];

