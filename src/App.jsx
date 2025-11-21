// @ts-ignore;
import React from 'react';

import { SidebarProvider } from '@/components/SidebarStore';

// 动态导入所有页面
const pages = import.meta.glob('./pages/*.jsx', {
  eager: true
});

// 创建页面组件映射
const pageComponents = {};
Object.keys(pages).forEach(path => {
  const pageName = path.replace('./pages/', '').replace('.jsx', '');
  pageComponents[pageName] = pages[path].default;
});
function App() {
  // 简易路由实现
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);
  React.useEffect(() => {
    const onPopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  const navigateTo = ({
    pageId,
    params
  }) => {
    const path = pageId === 'index' ? '/' : `/${pageId}`;
    const searchParams = new URLSearchParams(params);
    const url = searchParams.toString() ? `${path}?${searchParams}` : path;
    window.history.pushState({}, '', url);
    setCurrentPath(window.location.pathname);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  const redirectTo = ({
    pageId,
    params
  }) => {
    const path = pageId === 'index' ? '/' : `/${pageId}`;
    const searchParams = new URLSearchParams(params);
    const url = searchParams.toString() ? `${path}?${searchParams}` : path;
    window.location.href = url;
  };
  const navigateBack = () => {
    window.history.back();
  };

  // 根据当前路径匹配页面
  const route = currentPath === '/' ? 'index' : currentPath.slice(1);
  const PageComponent = pageComponents[route] || pageComponents['404'] || pageComponents['index'];
  return <SidebarProvider>
      {PageComponent && React.createElement(PageComponent, {
      $w: {
        auth: {
          currentUser: {
            type: 'anonymous',
            userId: 'anonymous',
            name: '访客',
            nickName: '访客',
            avatarUrl: null
          }
        },
        utils: {
          navigateTo,
          redirectTo,
          navigateBack
        },
        page: {
          dataset: {
            params: Object.fromEntries(new URLSearchParams(window.location.search))
          }
        },
        cloud: {
          callFunction: async ({
            name,
            data
          }) => {
            console.log('Calling function:', name, data);
            return {
              success: true
            };
          },
          getCloudInstance: async () => {
            return {
              database: () => ({
                collection: () => ({
                  doc: () => ({
                    get: async () => ({
                      data: null
                    }),
                    update: async () => ({})
                  }),
                  where: () => ({
                    orderBy: () => ({
                      limit: () => ({
                        get: async () => ({
                          data: []
                        })
                      })
                    })
                  })
                })
              })
            };
          }
        }
      }
    })}
    </SidebarProvider>;
}
export default App;