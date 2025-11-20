// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Trash2, Edit, Eye, Search, Filter, MoreVertical } from 'lucide-react';

export default function Admin(props) {
  const {
    $w
  } = props;
  const [stories, setStories] = useState([{
    id: 1,
    title: "井冈山精神",
    content: "井冈山精神是中国共产党在井冈山革命斗争中形成的伟大革命精神...",
    date: "1927-1930",
    location: "江西井冈山",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    createdAt: "2024-01-15",
    status: "published"
  }, {
    id: 2,
    title: "长征精神",
    content: "长征精神是中国共产党人和红军将士用生命和热血铸就的伟大革命精神...",
    date: "1934-1936",
    location: "瑞金-延安",
    image: "https://images.unsplash.com/photo-1579532585305-4bf9442b3d5b?w=400&h=300&fit=crop",
    createdAt: "2024-01-14",
    status: "published"
  }, {
    id: 3,
    title: "延安精神",
    content: "延安精神是中国共产党在延安时期培育的伟大革命精神...",
    date: "1935-1948",
    location: "陕西延安",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    createdAt: "2024-01-13",
    status: "draft"
  }, {
    id: 4,
    title: "西柏坡精神",
    content: "西柏坡精神是中国共产党在西柏坡时期形成的伟大革命精神...",
    date: "1948-1949",
    location: "河北西柏坡",
    image: "https://images.unsplash.com/photo-1579532585305-4bf9442b3d5b?w=400&h=300&fit=crop",
    createdAt: "2024-01-12",
    status: "published"
  }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStories, setSelectedStories] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const goBack = () => {
    $w.utils.navigateBack();
  };
  const handleSelectStory = id => {
    setSelectedStories(prev => prev.includes(id) ? prev.filter(storyId => storyId !== id) : [...prev, id]);
  };
  const handleSelectAll = () => {
    if (selectedStories.length === stories.length) {
      setSelectedStories([]);
    } else {
      setSelectedStories(stories.map(story => story.id));
    }
  };
  const handleDelete = id => {
    setStories(prev => prev.filter(story => story.id !== id));
    setSelectedStories(prev => prev.filter(storyId => storyId !== id));
  };
  const handleBatchDelete = () => {
    setStories(prev => prev.filter(story => !selectedStories.includes(story.id)));
    setSelectedStories([]);
    setShowDeleteConfirm(false);
  };
  const filteredStories = stories.filter(story => story.title.toLowerCase().includes(searchTerm.toLowerCase()) || story.content.toLowerCase().includes(searchTerm.toLowerCase()) || story.location.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="min-h-screen bg-gray-900 text-white">
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900 to-gray-900"></div>
          
          {/* 顶部导航 */}
          <header className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <Button onClick={goBack} variant="ghost" className="text-gray-300 hover:text-white">
                <ArrowLeft className="w-5 h-5 mr-2" />
                返回主页
              </Button>
              <h1 className="text-2xl font-bold text-red-600">后台管理</h1>
              <div className="text-sm text-gray-400">
                共 {stories.length} 个故事
              </div>
            </div>
          </header>

          {/* 主要内容 */}
          <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
            {/* 工具栏 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-700">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* 搜索框 */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索故事标题、内容或地点..." className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  {selectedStories.length > 0 && <>
                      <Button onClick={() => setShowDeleteConfirm(true)} className="bg-red-600 hover:bg-red-700 text-white">
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除选中 ({selectedStories.length})
                      </Button>
                    </>}
                  <Button variant="outline" className="border-gray-600 text-gray-300">
                    <Filter className="w-4 h-4 mr-2" />
                    筛选
                  </Button>
                </div>
              </div>
            </div>

            {/* 故事列表 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
              {/* 表头 */}
              <div className="bg-gray-900/50 px-6 py-3 border-b border-gray-700">
                <div className="flex items-center gap-4">
                  <input type="checkbox" checked={selectedStories.length === stories.length} onChange={handleSelectAll} className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-600" />
                  <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-gray-300">
                    <div className="col-span-4">故事标题</div>
                    <div className="col-span-2">时间</div>
                    <div className="col-span-2">地点</div>
                    <div className="col-span-2">状态</div>
                    <div className="col-span-1">创建时间</div>
                    <div className="col-span-1">操作</div>
                  </div>
                </div>
              </div>

              {/* 列表内容 */}
              <div className="divide-y divide-gray-700">
                {filteredStories.map(story => <div key={story.id} className="px-6 py-4 hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <input type="checkbox" checked={selectedStories.includes(story.id)} onChange={() => handleSelectStory(story.id)} className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-600" />
                      <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                        {/* 标题和图片 */}
                        <div className="col-span-4 flex items-center gap-3">
                          <img src={story.image} alt={story.title} className="w-12 h-12 rounded-lg object-cover" />
                          <div>
                            <h3 className="font-medium text-white">{story.title}</h3>
                            <p className="text-sm text-gray-400 truncate max-w-xs">
                              {story.content}
                            </p>
                          </div>
                        </div>

                        {/* 时间 */}
                        <div className="col-span-2 text-sm text-gray-300">
                          {story.date}
                        </div>

                        {/* 地点 */}
                        <div className="col-span-2 text-sm text-gray-300">
                          {story.location}
                        </div>

                        {/* 状态 */}
                        <div className="col-span-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${story.status === 'published' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'}`}>
                            {story.status === 'published' ? '已发布' : '草稿'}
                          </span>
                        </div>

                        {/* 创建时间 */}
                        <div className="col-span-1 text-sm text-gray-400">
                          {story.createdAt}
                        </div>

                        {/* 操作按钮 */}
                        <div className="col-span-1 flex gap-1">
                          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white p-1">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white p-1">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(story.id)} className="text-gray-400 hover:text-red-400 p-1">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>)}
              </div>
            </div>

            {/* 空状态 */}
            {filteredStories.length === 0 && <div className="text-center py-12">
                <div className="text-gray-400 text-lg">暂无匹配的红色故事</div>
              </div>}
          </main>

          {/* 删除确认弹窗 */}
          {showDeleteConfirm && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">确认删除</h3>
                <p className="text-gray-300 mb-6">
                  确定要删除选中的 {selectedStories.length} 个红色故事吗？此操作不可恢复。
                </p>
                <div className="flex justify-end gap-3">
                  <Button onClick={() => setShowDeleteConfirm(false)} variant="outline" className="border-gray-600 text-gray-300">
                    取消
                  </Button>
                  <Button onClick={handleBatchDelete} className="bg-red-600 hover:bg-red-700 text-white">
                    确认删除
                  </Button>
                </div>
              </div>
            </div>}
        </div>;
}