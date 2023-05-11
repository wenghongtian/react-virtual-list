import { ReactNode } from "react";

export type ResponseData<T extends object> = {
  list: T[];
  noMore: boolean;
};

export interface Pagination {
  current: number;
  pageSize: number;
}

export type Request<T extends object> = (
  page: Pagination
) => Promise<ResponseData<T>>;

export interface CachePosition {
  index: number;
  top: number;
  bottom: number;
  height: number;
}

/**
 * VirtualListProps
 */
export interface VirtualListProps<T extends object> {
  /**
   * 子项渲染函数
   */
  renderItem(data: T, index: number): ReactNode;
  /**
   * 缓存大小
   */
  bufferSize?: number;
  /**
   * 每一项的间距
   */
  itemOffset?: number;
  /**
   * 每一项的最小高度（默认100）
   */
  estimateHeight?: number;
  /**
   * 数据为空时渲染
   */
  empty?: ReactNode;
  /**
   * 每一项的key值
   */
  rowKey?: keyof T;
  /**
   * onScroll
   */
  onScroll?: React.UIEventHandler<HTMLDivElement>;
  /**
   * 请求函数
   */
  request: Request<T>;
  /**
   * 分页属性
   */
  pagination?: Pagination;
  /**
   * loading时渲染
   */
  loadingRender?: ReactNode;
  /**
   * 没有更多时渲染
   */
  noMoreRender?: ReactNode;
}
