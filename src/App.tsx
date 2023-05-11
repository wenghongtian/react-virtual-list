import { useState } from "react";
import VirtualList from "./VirtualList";

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
            list: new Array(10).fill("").map((i, index) => ({
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
