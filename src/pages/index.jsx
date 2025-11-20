// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Search, Plus, Calendar, MapPin, Eye, Heart, BookOpen, Filter, Grid, List, Clock, User, Tag } from 'lucide-react';

export default function IndexPage(props) {
  const {
    $w,
    page
  } = props;
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allTags, setAllTags] = useState([]);

  // 从URL参数获取初始状态
  useEffect(() => {
    const params = page?.dataset?.params || {};
    if (params.search) {
      setSearchTerm(params.search);
    }
    if (params.tag) {
      setFilterTag(params.tag);
    }
    if (params.view) {
      setViewMode(params.view);
    }
    if (params.sort) {
      setSortBy(params.sort);
    }
    if (params.page) {
      setCurrentPage(parseInt(params.page) || 1);
    }
  }, [page]);

  // 从数据模型加载红色故事
  useEffect(() => {
    const loadStories = async () => {
      try {
        setLoading(true);
        setError(null);

        // 构建查询条件
        const filter = {
          where: {
            status: {
              $eq: 'published' // 只显示已发布的故事
            }
          }
        };

        // 添加搜索条件
        if (searchTerm) {
          filter.where.$or = [{
            title: {
              $regex: searchTerm,
              $options: 'i'
            }
          }, {
            content: {
              $regex: searchTerm,
              $options: 'i'
            }
          }, {
            author: {
              $regex: searchTerm,
              $options: 'i'
            }
          }];
        }

        // 添加标签过滤
        if (filterTag !== 'all') {
          filter.where.tags = {
            $elemMatch: {
              $eq: filterTag
            }
          };
        }

        // 排序条件
        let orderBy = [];
        switch (sortBy) {
          case 'latest':
            orderBy = [{
              createdAt: 'desc'
            }];
            break;
          case 'oldest':
            orderBy = [{
              createdAt: 'asc'
            }];
            break;
          case 'title':
            orderBy = [{
              title: 'asc'
            }];
            break;
          case 'author':
            orderBy = [{
              author: 'asc'
            }];
            break;
          default:
            orderBy = [{
              createdAt: 'desc'
            }];
        }
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'red_story',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter,
            select: {
              $master: true // 返回所有字段
            },
            orderBy,
            getCount: true,
            pageSize: 12,
            // 每页12条
            offset: (currentPage - 1) * 12
          }
        });
        if (result.records && result.records.length > 0) {
          // 将数据库字段映射为前端所需格式
          const mappedStories = result.records.map(record => ({
            id: record._id,
            title: record.title || '未命名故事',
            content: record.content || '',
            image: record.image,
            date: record.date,
            location: record.location,
            author: record.author,
            readTime: record.read_time,
            tags: record.tags || [],
            status: record.status,
            order: record.order,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
          }));
          setStories(mappedStories);

          // 计算总页数
          const totalCount = result.total || 0;
          setTotalPages(Math.ceil(totalCount / 12));

          // 提取所有标签
          const tags = new Set();
          result.records.forEach(record => {
            if (record.tags && Array.isArray(record.tags)) {
              record.tags.forEach(tag => tags.add(tag));
            }
          });
          setAllTags(Array.from(tags));
        } else {
          setStories([]);
          setTotalPages(0);
        }
      } catch (err) {
        console.error('加载红色故事失败:', err);
        setError('加载红色故事失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    loadStories();
  }, [$w, searchTerm, filterTag, sortBy, currentPage]);

  // 更新URL参数
  const updateURLParams = newParams => {
    const currentParams = page?.dataset?.params || {};
    const updatedParams = {
      ...currentParams,
      ...newParams
    };

    // 移除空值参数
    Object.keys(updatedParams).forEach(key => {
      if (!updatedParams[key] || updatedParams[key] === 'all') {
        delete updatedParams[key];
      }
    });

    // 使用导航更新URL
    $w.utils.navigateTo({
      pageId: 'index',
      params: updatedParams
    });
  };

  // 搜索处理
  const handleSearch = value => {
    setSearchTerm(value);
    setCurrentPage(1);
    updateURLParams({
      search: value,
      page: 1
    });
  };

  // 标签过滤处理
  const handleTagFilter = tag => {
    setFilterTag(tag);
    setCurrentPage(1);
    updateURLParams({
      tag: tag === 'all' ? undefined : tag,
      page: 1
    });
  };

  // 排序处理
  const handleSort = sort => {
    setSortBy(sort);
    setCurrentPage(1);
    updateURLParams({
      sort,
      page: 1
    });
  };

  // 视图模式切换
  const handleViewModeChange = mode => {
    setViewMode(mode);
    updateURLParams({
      view: mode
    });
  };

  // 分页处理
  const handlePageChange = page => {
    setCurrentPage(page);
    updateURLParams({
      page
    });
  };

  // 导航函数
  const navigateToUpload = () => {
    $w.utils.navigateTo({
      pageId: 'upload',
      params: {
        from: 'index'
      }
    });
  };
  const navigateToAdmin = () => {
    $w.utils.navigateTo({
      pageId: 'admin',
      params: {
        from: 'index'
      }
    });
  };
  const navigateToDetail = storyId => {
    $w.utils.navigateTo({
      pageId: 'detail',
      params: {
        id: storyId,
        from: 'index',
        search: searchTerm,
        tag: filterTag !== 'all' ? filterTag : undefined,
        page: currentPage.toString()
      }
    });
  };

  // 格式化日期
  const formatDate = dateString => {
    if (!dateString) return '未知时间';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 截取内容预览
  const getContentPreview = (content, maxLength = 100) => {
    if (!content) return '暂无内容';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // 加载状态
  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">加载红色故事中...</p>
        </div>
      </div>;
  }

  // 错误状态
  if (error) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400 mb-4">{error}</h2>
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white">
            重新加载
          </Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900 to-gray-900"></div>
      
      {/* 顶部导航 */}
      <header className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-red-600">红色记忆</h1>
              <span className="text-gray-400">传承红色基因，弘扬革命精神</span>
            </div>
            <div className="flex gap-3">
              <Button onClick={navigateToUpload} className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                上传故事
              </Button>
              <Button onClick={navigateToAdmin} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                管理后台
              </Button>
            </div>
          </div>
          
          {/* 搜索栏 */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={searchTerm} onChange={e => handleSearch(e.target.value)} placeholder="搜索红色故事..." className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* 过滤和排序 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* 标签过滤 */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Button onClick={() => handleTagFilter('all')} variant={filterTag === 'all' ? 'default' : 'ghost'} className={filterTag === 'all' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white'}>
                全部
              </Button>
              {allTags.map(tag => <Button key={tag} onClick={() => handleTagFilter(tag)} variant={filterTag === tag ? 'default' : 'ghost'} className={filterTag === tag ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white'}>
                  {tag}
                </Button>)}
            </div>

            {/* 排序和视图 */}
            <div className="flex items-center gap-4">
              {/* 排序 */}
              <select value={sortBy} onChange={e => handleSort(e.target.value)} className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent">
                <option value="latest">最新发布</option>
                <option value="oldest">最早发布</option>
                <option value="title">按标题排序</option>
                <option value="author">按作者排序</option>
              </select>

              {/* 视图切换 */}
              <div className="flex bg-gray-900/50 border border-gray-700 rounded-lg">
                <Button onClick={() => handleViewModeChange('grid')} variant="ghost" className={`p-2 ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white'}`}>
                  <Grid className="w-4 h-4" />
                </Button>
                <Button onClick={() => handleViewModeChange('list')} variant="ghost" className={`p-2 ${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white'}`}>
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="flex gap-6 mt-4 text-sm text-gray-300">
            <span>共找到 {stories.length} 个红色故事</span>
            {searchTerm && <span>搜索: "{searchTerm}"</span>}
            {filterTag !== 'all' && <span>标签: {filterTag}</span>}
          </div>
        </div>

        {/* 故事列表 */}
        {stories.length === 0 ? <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 shadow-2xl border border-gray-700 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {searchTerm || filterTag !== 'all' ? '没有找到匹配的红色故事' : '暂无红色故事'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filterTag !== 'all' ? '尝试调整搜索条件或筛选标签' : '快来上传第一个红色故事吧'}
            </p>
            {!searchTerm && filterTag === 'all' && <Button onClick={navigateToUpload} className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                上传红色故事
              </Button>}
          </div> : <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
            {stories.map(story => viewMode === 'grid' ? <div key={story.id} onClick={() => navigateToDetail(story.id)} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-gray-700 hover:border-red-600/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-red-600/20">
                {/* 头图 */}
                <div className="relative h-48">
                  {story.image ? <img src={story.image} alt={story.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-red-900/30 to-gray-800/30 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-gray-400" />
                    </div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* 标签 */}
                  {story.tags && story.tags.length > 0 && <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                      {story.tags.slice(0, 2).map((tag, index) => <span key={index} className="px-2 py-1 bg-red-900/80 text-red-200 rounded-full text-xs">
                          {tag}
                        </span>)}
                    </div>}
                </div>

                {/* 内容 */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="text-gray-300 mb-4 line-clamp-3">
                    {getContentPreview(story.content, 120)}
                  </p>
                  
                  {/* 元信息 */}
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-3">
                      {story.author && <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {story.author}
                        </span>}
                      {story.date && <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {story.date}
                        </span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-3 h-3" />
                      <span>{Math.floor(Math.random() * 1000) + 100}</span>
                    </div>
                  </div>
                </div>
              </div> : <div key={story.id} onClick={() => navigateToDetail(story.id)} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700 hover:border-red-600/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-red-600/20">
                <div className="flex gap-6">
                  {/* 图片 */}
                  <div className="flex-shrink-0">
                    {story.image ? <img src={story.image} alt={story.title} className="w-32 h-32 rounded-lg object-cover" /> : <div className="w-32 h-32 bg-gradient-to-br from-red-900/30 to-gray-800/30 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-white line-clamp-2">
                        {story.title}
                      </h3>
                      {story.tags && story.tags.length > 0 && <div className="flex flex-wrap gap-1 ml-4">
                          {story.tags.slice(0, 3).map((tag, index) => <span key={index} className="px-2 py-1 bg-red-900/30 text-red-300 rounded-full text-xs">
                              {tag}
                            </span>)}
                        </div>}
                    </div>
                    
                    <p className="text-gray-300 mb-4 line-clamp-2">
                      {getContentPreview(story.content, 150)}
                    </p>
                    
                    {/* 元信息 */}
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center gap-4">
                        {story.author && <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {story.author}
                          </span>}
                        {story.date && <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {story.date}
                          </span>}
                        {story.location && <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {story.location}
                          </span>}
                        {story.readTime && <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {story.readTime}
                          </span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <Eye className="w-3 h-3" />
                        <span>{Math.floor(Math.random() * 1000) + 100}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>)}
          </div>}

        {/* 分页 */}
        {totalPages > 1 && <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50">
                上一页
              </Button>
              
              {/* 页码 */}
              {Array.from({
            length: Math.min(5, totalPages)
          }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return <Button key={pageNum} onClick={() => handlePageChange(pageNum)} variant={currentPage === pageNum ? 'default' : 'ghost'} className={currentPage === pageNum ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white'}>
                    {pageNum}
                  </Button>;
          })}
              
              <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50">
                下一页
              </Button>
            </div>
          </div>}
      </main>
    </div>;
}