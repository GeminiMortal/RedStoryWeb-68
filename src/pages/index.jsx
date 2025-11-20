// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ChevronLeft, ChevronRight, Upload, Plus, Calendar, MapPin, Users } from 'lucide-react';

export default function Index(props) {
  const {
    $w
  } = props;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 从数据模型加载红色故事
  useEffect(() => {
    const loadStories = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'red_story',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                status: {
                  $eq: 'published' // 只查询已发布的故事
                }
              }
            },
            orderBy: [{
              order: 'asc' // 按照排序字段升序排列
            }, {
              createdAt: 'desc' // 如果排序相同，按创建时间降序
            }],
            select: {
              $master: true // 返回所有字段
            },
            getCount: true,
            pageSize: 100 // 获取最多100条记录
          }
        });
        if (result.records && result.records.length > 0) {
          // 将数据库字段映射为前端所需格式
          const mappedStories = result.records.map(record => ({
            id: record._id,
            title: record.title,
            content: record.content,
            image: record.image,
            date: record.date,
            location: record.location,
            author: record.author,
            readTime: record.read_time,
            tags: record.tags || [],
            status: record.status
          }));
          setStories(mappedStories);
        } else {
          setStories([]);
        }
      } catch (err) {
        console.error('加载红色故事失败:', err);
        setError('加载红色故事失败，请稍后重试');

        // 如果数据加载失败，使用默认数据作为降级处理
        const defaultStories = [{
          id: 'default-1',
          title: "井冈山精神",
          content: "井冈山精神是中国共产党在井冈山革命斗争中形成的伟大革命精神，它体现了坚定信念、艰苦奋斗、实事求是、敢闯新路、依靠群众、勇于胜利的丰富内涵。这种精神是中国革命精神的源头，是激励中国人民不断前进的强大精神力量。井冈山精神的核心是：坚定不移的革命信念，坚持党的绝对领导，密切联系人民群众的思想作风，一切从实际出发的思想路线，艰苦奋斗的作风。井冈山精神是中国共产党创造的一种革命精神，诞生于土地革命时期的井冈山根据地，是中华民族精神的有机组成部分。",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
          date: "1927-1930",
          location: "江西井冈山"
        }, {
          id: 'default-2',
          title: "长征精神",
          content: "长征精神是中国共产党人和红军将士用生命和热血铸就的伟大革命精神，它体现了把全国人民和中华民族的根本利益看得高于一切，坚定革命的理想和信念，坚信正义事业必然胜利的精神；就是为了救国救民，不怕任何艰难险阻，不惜付出一切牺牲的精神；就是坚持独立自主、实事求是，一切从实际出发的精神；就是顾全大局、严守纪律、紧密团结的精神；就是紧紧依靠人民群众，同人民群众生死相依、患难与共、艰苦奋斗的精神。长征精神是中国共产党人革命精神的集中体现，是中华民族精神的升华。",
          image: "https://images.unsplash.com/photo-1579532585305-4bf9442b3d5b?w=800&h=600&fit=crop",
          date: "1934-1936",
          location: "瑞金-延安"
        }, {
          id: 'default-3',
          title: "延安精神",
          content: "延安精神是中国共产党在延安时期培育的伟大革命精神，它体现了坚定正确的政治方向，解放思想、实事求是的思想路线，全心全意为人民服务的根本宗旨，自力更生、艰苦奋斗的创业精神。延安精神是中国共产党的传家宝，是中华民族宝贵的精神财富。延安精神的主要内容是：坚定正确的政治方向，解放思想、实事求是的思想路线，全心全意为人民服务的根本宗旨，自力更生、艰苦奋斗的创业精神。延安精神是马克思主义中国化的重要成果，是中华民族精神的升华。",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
          date: "1935-1948",
          location: "陕西延安"
        }, {
          id: 'default-4',
          title: "西柏坡精神",
          content: "西柏坡精神是中国共产党在西柏坡时期形成的伟大革命精神，它体现了敢于斗争、敢于胜利的开拓进取精神，依靠群众和团结统一的民主精神，戒骄戒躁的谦虚精神，艰苦奋斗的创业精神。西柏坡精神是中国共产党人宝贵的精神财富，是中华民族精神的重要组成部分。西柏坡精神的核心是：两个务必——务必使同志们继续地保持谦虚、谨慎、不骄、不躁的作风，务必使同志们继续地保持艰苦奋斗的作风。这种精神对于中国共产党执政具有重要意义。",
          image: "https://images.unsplash.com/photo-1579532585305-4bf9442b3d5b?w=800&h=600&fit=crop",
          date: "1948-1949",
          location: "河北西柏坡"
        }];
        setStories(defaultStories);
      } finally {
        setLoading(false);
      }
    };
    loadStories();
  }, [$w]);

  // 轮播自动播放逻辑
  useEffect(() => {
    if (stories.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % stories.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [stories.length]);
  const goToSlide = index => {
    setCurrentSlide(index);
  };
  const goToPrevious = () => {
    setCurrentSlide(prev => (prev - 1 + stories.length) % stories.length);
  };
  const goToNext = () => {
    setCurrentSlide(prev => (prev + 1) % stories.length);
  };
  const navigateToUpload = () => {
    $w.utils.navigateTo({
      pageId: 'upload',
      params: {}
    });
  };
  const navigateToAdmin = () => {
    $w.utils.navigateTo({
      pageId: 'admin',
      params: {}
    });
  };
  const navigateToDetail = storyId => {
    $w.utils.navigateTo({
      pageId: 'detail',
      params: {
        id: storyId
      }
    });
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
  if (error && stories.length === 0) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400 mb-4">{error}</h2>
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white">
            重新加载
          </Button>
        </div>
      </div>;
  }

  // 无数据状态
  if (stories.length === 0) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400 mb-4">暂无红色故事</h2>
          <p className="text-gray-500 mb-6">请先上传一些红色故事内容</p>
          <Button onClick={navigateToUpload} className="bg-red-600 hover:bg-red-700 text-white">
            <Upload className="w-4 h-4 mr-2" />
            上传红色故事
          </Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900 to-gray-900"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-700/10 rounded-full blur-3xl"></div>

          {/* 顶部标题 */}
          <header className="relative z-10 text-center py-8 px-4">
            <h1 className="text-5xl md:text-6xl font-bold text-red-600 mb-2 tracking-wider">
              代码里的红色记忆
            </h1>
            <p className="text-gray-300 text-lg">传承红色基因 · 弘扬革命精神</p>
            {error && <div className="mt-2 text-sm text-yellow-400">
                {error} (显示默认内容)
              </div>}
          </header>

          {/* 轮播内容 */}
          <div className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
            <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              {stories.map((story, index) => <div key={story.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="relative h-full">
                    {/* 背景图片 */}
                    <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url(${story.image})`
            }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    </div>
                    
                    {/* 内容覆盖层 */}
                    <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
                      <div className="max-w-3xl">
                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-300">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {story.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {story.location}
                          </span>
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                          {story.title}
                        </h2>
                        
                        <p className="text-lg text-gray-200 leading-relaxed mb-6">
                          {story.content.substring(0, 150)}...
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Users className="w-4 h-4" />
                            <span>革命先辈用鲜血和生命铸就的精神丰碑</span>
                          </div>
                          
                          <Button onClick={() => navigateToDetail(story.id)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition-all hover:scale-105">
                            查看详情
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>)}
            </div>

            {/* 轮播控制按钮 */}
            <button onClick={goToPrevious} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* 轮播指示器 */}
            <div className="flex justify-center gap-2 mt-6">
              {stories.map((_, index) => <button key={index} onClick={() => goToSlide(index)} className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-red-600 w-8' : 'bg-gray-600 hover:bg-gray-500'}`} />)}
            </div>
          </div>

          {/* 左下角上传按钮 */}
          <div className="fixed bottom-8 left-8 z-20">
            <Button onClick={navigateToUpload} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-105">
              <Upload className="w-5 h-5" />
              上传红色故事
            </Button>
          </div>

          {/* 右下角管理按钮 */}
          <div className="fixed bottom-8 right-8 z-20">
            <Button onClick={navigateToAdmin} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all">
              <Plus className="w-5 h-5" />
              后台管理
            </Button>
          </div>
        </div>;
}