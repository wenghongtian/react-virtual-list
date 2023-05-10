import {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import "./index.css";
import { CompareResult, binarySearch } from "./utils";
import Item from "./Item";
import { useDebounceFn } from "./useDebounceFn";

interface VirtualListProps<T extends object> {
  renderItem(data: T, index: number): ReactNode;
  dataSource: T[];
  total: number;
  bufferSize?: number;
  itemOffset?: number;
  estimateHeight?: number;
  empty?: ReactNode;
  rowKey?: keyof T;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
  onScrollToEnd?: () => void;
}

interface CachePosition {
  index: number;
  top: number;
  bottom: number;
  height: number;
}

function VirtualList<T extends object>(props: VirtualListProps<T>) {
  const {
    total,
    estimateHeight = 100,
    empty,
    dataSource,
    bufferSize = 5,
    itemOffset = 10,
    renderItem,
    rowKey,
  } = props;
  const [height, setHeight] = useState(window.innerHeight);
  const [dataPositionMap] = useState(() => new Map<T, CachePosition>());

  const [, forceUpdate] = useReducer((n) => n + 1, 0);

  useLayoutEffect(() => {
    const { height } = containerRef.current!.getBoundingClientRect();
    setHeight(height);
  }, []);

  const limit = useMemo(() => (height / estimateHeight) | 0, [height]);
  const [scrollTop, setScrollTop] = useState(0);

  const cachePositions = useMemo(() => {
    const positions: CachePosition[] = new Array(dataSource.length);
    console.log(dataSource.length, dataPositionMap.size);
    for (let i = 0; i < dataSource.length; i++) {
      const data = dataSource[i];
      if (dataPositionMap.has(data)) {
        positions[i] = dataPositionMap.get(data)!;
        continue;
      }
      if (i == 0) {
        positions[i] = {
          index: i,
          top: 0,
          bottom: estimateHeight,
          height: estimateHeight,
        };
      } else {
        positions[i] = {
          index: i,
          top: positions[i - 1].bottom + itemOffset,
          bottom: positions[i - 1].bottom + itemOffset + estimateHeight,
          height: estimateHeight,
        };
      }
      dataPositionMap.set(data, positions[i]);
    }
    return positions;
  }, [dataSource]);

  useEffect(() => {
    updateCachePosition(cachePositions);
  }, [cachePositions]);

  const containerInfo = useRef({
    startIndex: 0,
    originIndex: 0,
    endIndex: Math.min(total, limit + bufferSize),
  });

  function getStartIndex(scrollTop: number) {
    const index = binarySearch<CachePosition, number>(
      cachePositions,
      scrollTop,
      (cur, val) => {
        if (cur.top === val) {
          return CompareResult.eq;
        }
        return cur.top > val ? CompareResult.gt : CompareResult.lt;
      }
    );
    return cachePositions[index].top === scrollTop ? index : index + 1;
  }

  const { run: triggerOnScrollToEnd } = useDebounceFn(
    () => {
      props.onScrollToEnd?.();
    },
    { wait: 100 }
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const handleScroll: React.UIEventHandler<HTMLDivElement> = (evt) => {
    const st: number = (evt.target as any).scrollTop;
    const originIndex = getStartIndex(st);
    containerInfo.current.originIndex = originIndex;
    containerInfo.current.startIndex = Math.max(0, originIndex - bufferSize);
    containerInfo.current.endIndex = Math.min(
      total,
      originIndex + limit + bufferSize
    );
    setScrollTop(st);
    props.onScroll?.(evt);
    const totalHeight = cachePositions.at(-1)?.bottom || 0;
    if (st > scrollTop && st >= totalHeight - height - 100) {
      triggerOnScrollToEnd();
    }
  };

  const { run: debounceUpdateCachePosition } =
    useDebounceFn(updateCachePosition);
  function updateCachePosition(cachePositions: CachePosition[]) {
    for (let i = 1; i < cachePositions.length; i++) {
      const position = cachePositions[i];
      const prevPosition = cachePositions[i - 1];
      position.top = prevPosition.bottom + itemOffset;
      position.bottom = position.top + position.height;
    }
    forceUpdate();
  }
  // console.log(cachePositions.length, dataPositionMap.size, dataSource.length);

  function onHeightUpdate(index: number, height: number) {
    const position = cachePositions[index];
    position.height = height;
    position.bottom = position.top + height;
    debounceUpdateCachePosition(cachePositions);
  }

  function renderRow(data: T, index: number) {
    const positionInfo = cachePositions[index];
    return (
      <Item
        offsetTop={positionInfo.top}
        onUpdate={(height) => onHeightUpdate(index, height)}
        key={rowKey ? data[rowKey] + "" : index}
        index={index}
      >
        {renderItem(data, index)}
      </Item>
    );
  }

  function renderRowContent() {
    const rows: ReactNode[] = [];
    const { startIndex, endIndex } = containerInfo.current;
    for (let i = startIndex; i < endIndex; i++) {
      rows.push(renderRow(dataSource[i], i));
    }
    return rows;
  }

  return (
    <div className="rvl-container" onScroll={handleScroll} ref={containerRef}>
      <div
        className="rvl-placeholder"
        style={{ height: cachePositions.at(-1)?.bottom || 0 }}
      />
      {!total && empty}
      {renderRowContent()}
    </div>
  );
}

export default VirtualList;
