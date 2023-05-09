import { ReactNode } from "react";
import "./index.scss";

interface VirtualListProps<T extends object> {
  renderItem(data: T): ReactNode;
  dataSource: T[];
  total: number;
  bufferSize?: number;
  itemOffset: number;
}

function VirtualList<T extends object>(props: VirtualListProps<T>) {
  return (
    <div className="rv-container">
      <div className="rv-placeholder" />
    </div>
  );
}
