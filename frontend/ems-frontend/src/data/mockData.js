export const MOCK_GROUPS = [
  {
    id: '1',
    name: '溫馨小窩',
    description: '室友生活費與家務互助會',
    inviteCode: 'A1B2C3D4',
    role: 'Admin',
    membersCount: 3,
    members: [
      { id: 'u1', name: '王小明', role: '管理員', avatar: 'M' },
      { id: 'u2', name: '李小華', role: '成員', avatar: 'H' },
      { id: 'u3', name: '陳阿滴', role: '成員', avatar: 'D' }
    ],
    monthlyStats: {
      total: 12500,
      personal: 4166,
      status: '未結清'
    }
  },
  {
    id: '2',
    name: '台南耍廢群',
    description: '週末出遊與聚餐記帳',
    inviteCode: 'X9Y8Z7W6',
    role: 'Member',
    membersCount: 5,
    members: [
      { id: 'u1', name: '王小明', role: '成員', avatar: 'M' },
      { id: 'u4', name: '張大千', role: '管理員', avatar: 'Z' },
      { id: 'u5', name: '林口阿龍', role: '成員', avatar: 'L' }
    ],
    monthlyStats: {
      total: 8900,
      personal: 1780,
      status: '已結清'
    }
  }
];
