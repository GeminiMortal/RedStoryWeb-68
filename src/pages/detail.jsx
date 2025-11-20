// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Calendar, MapPin, Users, Clock, Share2, Heart } from 'lucide-react';

export default function Detail(props) {
  const {
    $w,
    page
  } = props;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  // 安全获取页面参数
  const storyId = page?.dataset?.params?.id;

  // 模拟故事数据
  const storiesData = [{
    id: 1,
    title: "井冈山精神",
    content: "井冈山精神是中国共产党在井冈山革命斗争中形成的伟大革命精神，它体现了坚定信念、艰苦奋斗、实事求是、敢闯新路、依靠群众、勇于胜利的丰富内涵。这种精神是中国革命精神的源头，是激励中国人民不断前进的强大精神力量。\n\n井冈山精神的核心是：坚定不移的革命信念，坚持党的绝对领导，密切联系人民群众的思想作风，一切从实际出发的思想路线，艰苦奋斗的作风。\n\n井冈山精神是中国共产党创造的一种革命精神，诞生于土地革命时期的井冈山根据地，是中华民族精神的有机组成部分。井冈山精神的形成和发展，标志着中国共产党在政治上、思想上、组织上的成熟，为后来的革命胜利奠定了重要基础。\n\n井冈山精神的历史意义：\n1. 开辟了农村包围城市、武装夺取政权的革命道路\n2. 培育了党和人民军队的优良作风\n3. 积累了革命斗争的宝贵经验\n4. 为中国革命的胜利指明了方向",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop",
    date: "1927-1930",
    location: "江西井冈山",
    author: "中国共产党",
    readTime: "8分钟",
    tags: ["革命精神", "井冈山", "红色教育"]
  }, {
    id: 2,
    title: "长征精神",
    content: "长征精神是中国共产党人和红军将士用生命和热血铸就的伟大革命精神，它体现了把全国人民和中华民族的根本利益看得高于一切，坚定革命的理想和信念，坚信正义事业必然胜利的精神；就是为了救国救民，不怕任何艰难险阻，不惜付出一切牺牲的精神；就是坚持独立自主、实事求是，一切从实际出发的精神；就是顾全大局、严守纪律、紧密团结的精神；就是紧紧依靠人民群众，同人民群众生死相依、患难与共、艰苦奋斗的精神。\n\n长征精神是中国共产党人革命精神的集中体现，是中华民族精神的升华。长征的胜利，是中国共产党和中国革命事业从挫折走向胜利的伟大转折点。\n\n长征精神的主要内涵：\n1. 崇高的理想和坚定的信念\n2. 不怕牺牲、勇往直前的革命英雄主义\n3. 实事求是、独立自主的创新胆略\n4. 顾全大局、严守纪律、紧密团结的崇高品德\n5. 紧紧依靠人民群众、同人民群众生死相依、患难与共的优良作风\n\n长征精神的时代价值：\n- 是激励中国人民不断攻坚克难、从胜利走向胜利的强大精神动力\n- 是推进中国特色社会主义事业的精神支柱\n- 是实现中华民族伟大复兴中国梦的力量源泉",
    image: "https://images.unsplash.com/photo-1579532585305-4bf9442b3d5b?w=1200&h=800&fit=crop",
    date: "1934-1936",
    location: "瑞金-延安",
    author: "中国工农红军",
    readTime: "10分钟",
    tags: ["长征", "革命精神", "红军"]
  }, {
    id: 3,
    title: "延安精神",
    content: "延安精神是中国共产党在延安时期培育的伟大革命精神，它体现了坚定正确的政治方向，解放思想、实事求是的思想路线，全心全意为人民服务的根本宗旨，自力更生、艰苦奋斗的创业精神。延安精神是中国共产党的传家宝，是中华民族宝贵的精神财富。\n\n延安精神的主要内容是：坚定正确的政治方向，解放思想、实事求是的思想路线，全心全意为人民服务的根本宗旨，自力更生、艰苦奋斗的创业精神。\n\n延安精神是马克思主义中国化的重要成果，是中华民族精神的升华。延安时期，中国共产党在极其艰苦的条件下，领导中国人民进行了伟大的抗日战争和解放战争，创造了辉煌的历史业绩。\n\n延安精神的基本特征：\n1. 坚定正确的政治方向\n2. 解放思想、实事求是的思想路线\n3. 全心全意为人民服务的根本宗旨\n4. 自力更生、艰苦奋斗的创业精神\n5. 理论联系实际的优良学风\n6. 密切联系群众的工作作风\n7. 批评与自我批评的党内生活作风\n\n延安精神的现实意义：\n- 为新时代坚持和发展中国特色社会主义提供了精神滋养\n- 为推进党的建设新的伟大工程提供了重要借鉴\n- 为实现中华民族伟大复兴提供了强大精神动力",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop",
    date: "1935-1948",
    location: "陕西延安",
    author: "中国共产党",
    readTime: "12分钟",
    tags: ["延安精神", "革命圣地", "红色教育"]
  }, {
    id: 4,
    title: "西柏坡精神",
    content: "西柏坡精神是中国共产党在西柏坡时期形成的伟大革命精神，它体现了敢于斗争、敢于胜利的开拓进取精神，依靠群众和团结统一的民主精神，戒骄戒躁的谦虚精神，艰苦奋斗的创业精神。西柏坡精神是中国共产党人宝贵的精神财富，是中华民族精神的重要组成部分。\n\n西柏坡精神的核心是：两个务必——务必使同志们继续地保持谦虚、谨慎、不骄、不躁的作风，务必使同志们继续地保持艰苦奋斗的作风。这种精神对于中国共产党执政具有重要意义。\n\n西柏坡精神的历史背景：\n1948年5月，毛泽东同志率领中共中央和人民解放军总部移驻西柏坡，在这里指挥了震惊中外的辽沈、淮海、平津三大战役，召开了具有伟大历史意义的七届二中全会，描绘了新中国的宏伟蓝图。\n\n西柏坡精神的基本内涵：\n1. 敢于斗争、敢于胜利的开拓进取精神\n2. 依靠群众、团结统一的民主精神\n3. 戒骄戒躁、谦虚谨慎的进取精神\n4. 艰苦奋斗、自强不息的创业精神\n5. 实事求是、与时俱进的科学精神\n\n西柏坡精神的时代价值：\n- 是中国共产党执政兴国的重要精神资源\n- 是推进全面从严治党的重要思想武器\n- 是实现中华民族伟大复兴的强大精神动力",
    image: "https://images.unsplash.com/photo-1579532585305-4bf9442b3d5b?w=1200&h=800&fit=crop",
    date: "1948-1949",
    location: "河北西柏坡",
    author: "中国共产党",
    readTime: "9分钟",
    tags: ["西柏坡精神", "革命精神", "红色教育"]
  }];
  useEffect(() => {
    // 模拟加载过程
    const loadStory = () => {
      setTimeout(() => {
        const foundStory = storiesData.find(s => s.id === parseInt(storyId));
        setStory(foundStory || null);
        setLoading(false);
      }, 500);
    };

    // 如果没有storyId，直接设置为加载完成
    if (!storyId) {
      setLoading(false);
      return;
    }
    loadStory();
  }, [storyId]);
  const goBack = () => {
    $w.utils.navigateBack();
  };
  const handleShare = () => {
    // 模拟分享功能
    if (navigator.share) {
      navigator.share({
        title: story?.title,
        text: story?.content?.substring(0, 100) + '...',
        url: window.location.href
      });
    } else {
      // 降级处理：复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };
  const handleLike = () => {
    setIsLiked(!isLiked);
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>;
  }
  if (!story) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400 mb-4">故事未找到</h2>
          <Button onClick={goBack} className="bg-red-600 hover:bg-red-700 text-white">
            返回主页
          </Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900 to-gray-900"></div>
      
      {/* 顶部导航 */}
      <header className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button onClick={goBack} variant="ghost" className="text-gray-300 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回主页
          </Button>
          <h1 className="text-xl font-bold text-red-600">红色故事详情</h1>
          <div className="flex gap-2">
            <Button onClick={handleShare} variant="ghost" className="text-gray-300 hover:text-white">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button onClick={handleLike} variant="ghost" className={`${isLiked ? 'text-red-600' : 'text-gray-300'} hover:text-red-600`}>
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* 头图 */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl relative">
          <img src={story.image} alt={story.title} className="w-full h-64 md:h-96 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        {/* 文章信息 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
          {/* 标题 */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {story.title}
          </h1>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {story.date}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {story.location}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {story.author}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {story.readTime}
            </span>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2 mb-8">
            {story.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-red-900/30 text-red-300 rounded-full text-sm">
                {tag}
              </span>)}
          </div>

          {/* 内容 */}
          <div className="prose prose-invert max-w-none">
            {story.content.split('\n\n').map((paragraph, index) => <p key={index} className="text-gray-200 leading-relaxed mb-6 text-lg">
                {paragraph}
              </p>)}
          </div>

          {/* 底部操作 */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              革命精神永垂不朽 · 红色基因代代相传
            </div>
            <div className="flex gap-2">
              <Button onClick={handleShare} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
              <Button onClick={handleLike} className={`${isLiked ? 'bg-red-600' : 'bg-gray-700'} hover:bg-red-700 text-white`}>
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? '已收藏' : '收藏'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>;
}