import { ReactNode, useLayoutEffect, useRef } from "react";

interface VirtualListItemProps {
  children: ReactNode;
  offsetTop: number;
  onUpdate: (height: number) => void;
  index: number;
}

export default function Item(props: VirtualListItemProps) {
  const { offsetTop, onUpdate } = props;
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const option = {
      childList: true, // 子节点的变动（新增、删除或者更改）
      attributes: true, // 属性的变动
      characterData: true, // 节点内容或节点文本的变动

      subtree: true, // 是否将观察器应用于该节点的所有后代节点
      attributeFilter: ["class", "style"], // 观察特定属性
      attributeOldValue: true, // 观察 attributes 变动时，是否需要记录变动前的属性值
      characterDataOldValue: true, // 观察 characterData 变动，是否需要记录变动前的值
    };
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          const { height } = ref.current!.getBoundingClientRect();
          onUpdate(height);
        }
      });
    });
    observer.observe(ref.current!, option);
    const { height } = ref.current!.getBoundingClientRect();
    onUpdate(height);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="rvl-item"
      ref={ref}
      style={{ transform: `translate3d(0,${offsetTop}px, 0)` }}
      data-index={props.index}
    >
      {props.children}
    </div>
  );
}
