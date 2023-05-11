# react-virtual-list

react不定高虚拟列表，支持高度自动计算。

### VirtualListProps

| 名称           | 描述                 | 默认值                                |
| -------------- | -------------------- | ------------------------------------- |
| renderItem     | *子项渲染函数*       | `(data: T, index: number)=>ReactNode` |
| bufferSize     | 缓存大小             | 5                                     |
| itemOffset     | 每一项的间隔         | 10                                    |
| estimateHeight | 每一项预期高度       | 100                                   |
| empty          | 数据为空时渲染的节点 | `'暂无数据～'`                        |
| rowKey         | 每行的key值          | 无                                    |
| onScroll       |                      | 无                                    |
| request        | 请求数据方式         |                                       |
| pagination     | 分页配置             | `{current: 1, pageSize: 20}`          |
| loadingRender  | loading时渲染的节点  |                                       |
| noMoreRender   | 没有更多时渲染的节点 |                                       |

### Example

```tsx
import { useState } from "react";
import VirtualList from "@wenghongtian/react-virtual-list";

const sleep = (timeout: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
};

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandomHeight() {
  return (Math.random() * 300 + 100) | 0;
}

function Item(props: {
  name: string;
  color: string;
  delayHeight: number;
  height: number;
}) {
  const [height, setHeight] = useState(props.height);

  // useEffect(() => {
  //   setTimeout(() => {
  //     setHeight(props.delayHeight);
  //   }, 500);
  // }, []);

  return (
    <div style={{ backgroundColor: props.color, height }}>
      <div>{props.name}</div>
      <button onClick={() => setHeight(getRandomHeight)}>设置高度</button>
    </div>
  );
}

type Data = {
  name: string;
  color: string;
  height: number;
  delayHeight: number;
  id: string;
};

const App = () => {
  return (
    <div style={{ height: "100%" }}>
      <VirtualList<Data>
        renderItem={(data) => {
          return <Item {...data} />;
        }}
        request={async ({ pageSize, current }) => {
          await sleep(1000);
          return {
            list: new Array(10).fill("").map((_i, index) => ({
              name: Math.random() + "",
              color: getRandomColor(),
              height: getRandomHeight(),
              delayHeight: getRandomHeight(),
              id: pageSize * (current - 1) + index + "",
            })),
            noMore: current > 5,
          };
        }}
      />
    </div>
  );
};

export default App;
```

