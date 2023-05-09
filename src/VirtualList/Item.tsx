import { ReactNode } from "react";

interface VirtualListItemProps {
  children: ReactNode;
  offsetTop: number;
}

export default function Item(props: VirtualListItemProps) {
  return (
    <div className="rvl-item" style={{ top: props.offsetTop }}>
      {props.children}
    </div>
  );
}
