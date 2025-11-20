// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Upload as UploadIcon, FileText, Image, X, Check } from 'lucide-react';

export default function UploadPage(props) {
  const {
    $w
  } = props;
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: '',
    location: '',
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const handleInputChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    // 模拟提交过程
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // 重置表单
        setFormData({
          title: '',
          content: '',
          date: '',
          location: '',
          image: ''
        });
      }, 2000);
    }, 1500);
  };
  const goBack = () => {
    $w.utils.navigateBack();
  };
  return <div className="min-h-screen bg-gray-900 text-white">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900 to-gray-900"></div>
      
      {/* 顶部导航 */}
      <header className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button onClick={goBack} variant="ghost" className="text-gray-300 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回主页
          </Button>
          <h1 className="text-2xl font-bold text-red-600">上传红色故事</h1>
          <div className="w-20"></div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 标题输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FileText className="inline w-4 h-4 mr-1" />
                故事标题
              </label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="请输入红色故事标题" />
            </div>

            {/* 时间和地点 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  时间时期
                </label>
                <input type="text" name="date" value={formData.date} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="如：1927-1930" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  发生地点
                </label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="如：江西井冈山" />
              </div>
            </div>

            {/* 内容输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                故事内容
              </label>
              <textarea name="content" value={formData.content} onChange={handleInputChange} required rows={6} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none" placeholder="请详细描述红色故事的内容和意义..." />
            </div>

            {/* 图片上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Image className="inline w-4 h-4 mr-1" />
                配图链接（可选）
              </label>
              <input type="url" name="image" value={formData.image} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="请输入图片URL地址" />
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" onClick={goBack} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white px-8">
                {isSubmitting ? <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    上传中...
                  </> : <>
                    <UploadIcon className="w-4 h-4 mr-2" />
                    提交故事
                  </>}
              </Button>
            </div>
          </form>
        </div>

        {/* 成功提示 */}
        {showSuccess && <div className="fixed top-20 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-pulse">
            <Check className="w-5 h-5" />
            <span>红色故事上传成功！</span>
          </div>}
      </main>
    </div>;
}