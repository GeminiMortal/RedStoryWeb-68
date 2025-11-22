// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, Clock, Download, Upload } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { offlineStorage } from '@/lib/offlineStorage';
export function SyncStatusIndicator({
  className,
  showDetails = false,
  onSyncClick
}) {
  const [syncStatus, setSyncStatus] = useState({
    isOnline: navigator.onLine,
    pendingCount: 0,
    lastSyncTime: null
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  useEffect(() => {
    // 更新同步状态
    const updateSyncStatus = () => {
      const status = offlineStorage.getSyncStatus();
      setSyncStatus(status);
    };

    // 初始状态
    updateSyncStatus();

    // 监听网络状态变化
    const handleOnline = () => {
      setSyncStatus(prev => ({
        ...prev,
        isOnline: true
      }));
      // 自动触发同步
      handleSync();
    };
    const handleOffline = () => {
      setSyncStatus(prev => ({
        ...prev,
        isOnline: false
      }));
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 监听离线存储事件
    offlineStorage.addEventListener('sync', updateSyncStatus);
    offlineStorage.addEventListener('online', updateSyncStatus);
    offlineStorage.addEventListener('offline', updateSyncStatus);

    // 定期更新状态
    const interval = setInterval(updateSyncStatus, 5000);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      offlineStorage.removeEventListener('sync', updateSyncStatus);
      offlineStorage.removeEventListener('online', updateSyncStatus);
      offlineStorage.removeEventListener('offline', updateSyncStatus);
      clearInterval(interval);
    };
  }, []);

  // 手动同步
  const handleSync = async () => {
    if (isSyncing) return;
    try {
      setIsSyncing(true);
      await offlineStorage.processSyncQueue();

      // 通知父组件
      if (onSyncClick) {
        onSyncClick();
      }

      // 更新状态
      const status = offlineStorage.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('同步失败:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // 获取状态图标和颜色
  const getStatusIcon = () => {
    if (isSyncing) {
      return <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />;
    }
    if (!syncStatus.isOnline) {
      return <WifiOff className="w-4 h-4 text-red-400" />;
    }
    if (syncStatus.pendingCount > 0) {
      return <Clock className="w-4 h-4 text-yellow-400" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-400" />;
  };
  const getStatusColor = () => {
    if (isSyncing) return 'text-blue-400';
    if (!syncStatus.isOnline) return 'text-red-400';
    if (syncStatus.pendingCount > 0) return 'text-yellow-400';
    return 'text-green-400';
  };
  const getStatusText = () => {
    if (isSyncing) return '同步中...';
    if (!syncStatus.isOnline) return '离线';
    if (syncStatus.pendingCount > 0) return `${syncStatus.pendingCount}项待同步`;
    return '已同步';
  };

  // 格式化最后同步时间
  const formatLastSyncTime = timestamp => {
    if (!timestamp) return '从未同步';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  };
  if (showDetails) {
    return <div className={cn("bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Download className="w-5 h-5 mr-2 text-blue-400" />
            同步状态
          </h3>
          <Button onClick={handleSync} disabled={isSyncing || !syncStatus.isOnline} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
            {isSyncing ? '同步中' : '立即同步'}
          </Button>
        </div>
        
        <div className="space-y-3">
          {/* 网络状态 */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400">网络状态</span>
            <div className="flex items-center space-x-2">
              {syncStatus.isOnline ? <Wifi className="w-4 h-4 text-green-400" /> : <WifiOff className="w-4 h-4 text-red-400" />}
              <span className={cn("text-sm", syncStatus.isOnline ? "text-green-400" : "text-red-400")}>
                {syncStatus.isOnline ? '在线' : '离线'}
              </span>
            </div>
          </div>
          
          {/* 待同步项目 */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400">待同步项目</span>
            <span className={cn("text-sm font-semibold", syncStatus.pendingCount > 0 ? "text-yellow-400" : "text-green-400")}>
              {syncStatus.pendingCount} 项
            </span>
          </div>
          
          {/* 最后同步时间 */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400">最后同步</span>
            <span className="text-sm text-slate-300">
              {formatLastSyncTime(syncStatus.lastSyncTime)}
            </span>
          </div>
          
          {/* 同步队列详情 */}
          {syncStatus.pendingCount > 0 && <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">有 {syncStatus.pendingCount} 项内容等待同步</span>
              </div>
              <p className="text-xs text-yellow-300 mt-1">
                网络恢复后将自动同步，或点击"立即同步"手动同步
              </p>
            </div>}
        </div>
      </div>;
  }

  // 简化版本 - 用于导航栏等小空间
  return <div className={cn("relative", className)}>
      <Button onClick={() => setShowDropdown(!showDropdown)} variant="ghost" size="sm" className={cn("flex items-center space-x-2 transition-colors", getStatusColor())}>
        {getStatusIcon()}
        <span className="hidden sm:inline text-sm">{getStatusText()}</span>
        {syncStatus.pendingCount > 0 && <span className="bg-yellow-500 text-yellow-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {syncStatus.pendingCount > 99 ? '99+' : syncStatus.pendingCount}
          </span>}
      </Button>
      
      {/* 下拉详情 */}
      {showDropdown && <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">同步状态</span>
              <Button onClick={handleSync} disabled={isSyncing || !syncStatus.isOnline} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                {isSyncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              </Button>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">网络</span>
                <span className={syncStatus.isOnline ? "text-green-400" : "text-red-400"}>
                  {syncStatus.isOnline ? '在线' : '离线'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">待同步</span>
                <span className={syncStatus.pendingCount > 0 ? "text-yellow-400" : "text-green-400"}>
                  {syncStatus.pendingCount} 项
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">最后同步</span>
                <span className="text-slate-300">
                  {formatLastSyncTime(syncStatus.lastSyncTime)}
                </span>
              </div>
            </div>
            
            {syncStatus.pendingCount > 0 && !syncStatus.isOnline && <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-400 text-xs">
                网络恢复后将自动同步
              </div>}
          </div>
        </div>}
      
      {/* 点击外部关闭下拉 */}
      {showDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>}
    </div>;
}

// 同步状态提供者
export function SyncStatusProvider({
  children
}) {
  const [syncStatus, setSyncStatus] = useState({
    isOnline: navigator.onLine,
    pendingCount: 0,
    lastSyncTime: null
  });
  useEffect(() => {
    const updateStatus = () => {
      const status = offlineStorage.getSyncStatus();
      setSyncStatus(status);
    };
    updateStatus();

    // 监听离线存储事件
    offlineStorage.addEventListener('sync', updateStatus);
    offlineStorage.addEventListener('online', updateStatus);
    offlineStorage.addEventListener('offline', updateStatus);
    return () => {
      offlineStorage.removeEventListener('sync', updateStatus);
      offlineStorage.removeEventListener('online', updateStatus);
      offlineStorage.removeEventListener('offline', updateStatus);
    };
  }, []);
  return <SyncStatusContext.Provider value={syncStatus}>
      {children}
    </SyncStatusContext.Provider>;
}

// 同步状态上下文
export const SyncStatusContext = React.createContext({
  isOnline: true,
  pendingCount: 0,
  lastSyncTime: null
});

// 同步状态钩子
export function useSyncStatus() {
  const context = React.useContext(SyncStatusContext);
  if (!context) {
    throw new Error('useSyncStatus must be used within a SyncStatusProvider');
  }
  return context;
}