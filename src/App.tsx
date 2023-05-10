import { useEffect, useMemo, useState } from "react";
import VirtualList from "./VirtualList";

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
  const [dataSource, setDataSource] = useState(() => {
    return new Array(10).fill("").map((i, index) => ({
      name: Math.random().toString().slice(0, 10),
      color: getRandomColor(),
      height: 100 || getRandomHeight(),
      delayHeight: getRandomHeight(),
      id: index + "",
    }));
  });

  return (
    <div style={{ height: 400 }}>
      <VirtualList<Data>
        dataSource={dataSource}
        total={dataSource.length}
        renderItem={(data) => {
          return <Item {...data} />;
        }}
        onScrollToEnd={() => {
          setDataSource(() =>
            dataSource.concat(
              new Array(10).fill("").map((i, index) => ({
                name: Math.random().toString().slice(0, 10),
                color: getRandomColor(),
                height: getRandomHeight(),
                delayHeight: getRandomHeight(),
                id: dataSource.length + index + "",
              }))
            )
          );
        }}
      />
    </div>
  );
};

export default App;
