
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');

    exports.main = async (event, context) => {
      try {
        // 初始化云开发 SDK
        const app = cloudbase.init({
          env: cloudbase.SYMBOL_CURRENT_ENV
        });
        const models = app.models;

        // 计算7天前的时间戳
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        console.log(`开始清理7天前(${sevenDaysAgo.toISOString()})的过期草稿`);

        // 查询过期的草稿
        const queryResult = await models.red_story_draft.list({
          filter: {
            where: {
              lastSavedAt: {
                $lt: sevenDaysAgo.getTime()
              }
            }
          },
          select: {
            _id: true
          },
          pageSize: 1000, // 单次最多处理1000条
          getCount: true
        });

        const expiredDrafts = queryResult.data.records;
        const totalCount = queryResult.data.total;

        console.log(`找到 ${totalCount} 条过期草稿`);

        if (totalCount === 0) {
          return {
            deletedCount: 0,
            message: '没有需要清理的过期草稿'
          };
        }

        // 批量删除过期草稿
        const deleteResult = await models.red_story_draft.deleteMany({
          filter: {
            where: {
              lastSavedAt: {
                $lt: sevenDaysAgo.getTime()
              }
            }
          }
        });

        console.log(`成功删除 ${deleteResult.data.deletedCount} 条过期草稿`);

        return {
          deletedCount: deleteResult.data.deletedCount,
          message: `成功清理 ${deleteResult.data.deletedCount} 条过期草稿`
        };

      } catch (error) {
        console.error('清理过期草稿失败:', error);
        return {
          deletedCount: 0,
          error: error.message || '清理过期草稿时发生未知错误'
        };
      }
    };
  