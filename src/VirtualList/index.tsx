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
import { VirtualListProps, CachePosition } from "./types";
import Spin from "./Spin";

function VirtualList<T extends object>(props: VirtualListProps<T>) {
  const {
    estimateHeight = 100,
    empty = "暂无数据~",
    bufferSize = 5,
    itemOffset = 10,
    renderItem,
    rowKey,
    pagination: { current = 1, pageSize = 20 } = {},
    request,
    noMoreRender = "---我也是有底线的---",
    loadingRender = (
      <>
        <Spin />
        <span>正在加载</span>
      </>
    ),
  } = props;
  const [height, setHeight] = useState(window.innerHeight);
  const [dataPositionMap] = useState(() => new Map<T, CachePosition>());

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<T[]>([]);
  const pageRef = useRef({
    pageSize,
    current,
    noMore: false,
  });

  async function fetchData() {
    const pageInfo = pageRef.current;
    setLoading(true);
    const { list, noMore } = await request({
      current: pageInfo.current,
      pageSize: pageInfo.pageSize,
    });
    setLoading(false);
    setDataSource(dataSource.concat(list));
    pageInfo.current++;
    pageInfo.pageSize++;
    pageInfo.noMore = noMore;
    containerInfo.current.endIndex = Math.min(
      limit + containerInfo.current.startIndex,
      list.length + containerInfo.current.startIndex
    );
    return {
      list,
      noMore,
    };
  }

  useEffect(() => {
    fetchData();
  }, []);

  const [, forceUpdate] = useReducer((n) => n + 1, 0);

  useLayoutEffect(() => {
    const { height } = containerRef.current!.getBoundingClientRect();
    setHeight(height);
  }, []);

  const limit = useMemo(() => (height / estimateHeight) | 0, [height]);
  const [scrollTop, setScrollTop] = useState(0);

  const cachePositions = useMemo(() => {
    const positions: CachePosition[] = new Array(dataSource.length);
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
    endIndex: Math.min(dataSource.length, limit + bufferSize),
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

  const containerRef = useRef<HTMLDivElement>(null);
  const handleScroll: React.UIEventHandler<HTMLDivElement> = (evt) => {
    if (evt.target !== containerRef.current) return;
    const st: number = (evt.target as any).scrollTop;
    const originIndex = getStartIndex(st);
    containerInfo.current.originIndex = originIndex;
    containerInfo.current.startIndex = Math.max(0, originIndex - bufferSize);
    containerInfo.current.endIndex = Math.min(
      dataSource.length,
      originIndex + limit + bufferSize
    );
    setScrollTop(st);
    props.onScroll?.(evt);
    const totalHeight = cachePositions.at(-1)?.bottom || 0;
    if (
      st > scrollTop &&
      st == totalHeight - height &&
      !pageRef.current.noMore &&
      !loading
    ) {
      fetchData();
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
      <div>
        <div
          className="rvl-placeholder"
          style={{ height: cachePositions.at(-1)?.bottom || 0 }}
        />
        {pageRef.current.noMore && !!dataSource.length && (
          <div className="rvl-no-more">{noMoreRender}</div>
        )}
        {!dataSource.length && pageRef.current.noMore && (
          <div className="rvl-empty">{empty}</div>
        )}
        {loading && <div className="rvl-loading">{loadingRender}</div>}
      </div>
      {renderRowContent()}
    </div>
  );
}

export default VirtualList;
