import { QueryClient } from '@tanstack/react-query'

/**
 * 全局查询客户端。
 * 索引站的数据以「读」为主，缓存策略偏保守：
 * - staleTime 60s：翻页/返回列表时不重复打库
 * - retry 1：外链数据库偶发抖动时不至于让用户空等三轮
 * - 不跟随窗口聚焦重取：浏览型站点，避免来回切标签页造成请求风暴
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
