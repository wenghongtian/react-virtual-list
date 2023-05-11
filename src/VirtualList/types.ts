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

export interface VirtualListProps<T extends object> {
  renderItem(data: T, index: number): ReactNode;
  bufferSize?: number;
  itemOffset?: number;
  estimateHeight?: number;
  empty?: ReactNode;
  rowKey?: keyof T;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
  request: Request<T>;
  pagination?: Pagination;
  loadingRender?: ReactNode;
  noMoreRender?: ReactNode;
}
