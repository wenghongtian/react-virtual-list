import { ReactNode } from "react";

interface VirtualListProps<T extends object> {
  renderItem(data: T): ReactNode;
  dataSource: T[];
  total: number;
}
