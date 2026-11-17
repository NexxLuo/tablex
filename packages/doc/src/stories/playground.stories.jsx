/**
 * Playground：大数据量性能测试场
 * 用于验证虚拟滚动 / perfCache（缺省关闭，可显式开启）在不同数据规模下的表现。
 * 可通过工具栏(Controls)切换：数据量、perfCache、行高、列数。
 */
import React, { useMemo, useState } from "react";
import Table from "tablex";

const CITIES = ["北京", "上海", "深圳", "杭州", "广州", "成都", "南京", "武汉"];

function makeData(count) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      id: "row-" + i,
      name: "名称-" + i,
      age: 20 + (i % 40),
      city: CITIES[i % CITIES.length],
      dept: "部门-" + (i % 30),
      amount: ((i * 137) % 100000) / 100,
      remark: "备注信息-" + (i % 500),
    });
  }
  return arr;
}

function makeColumns(columnCount) {
  const base = [
    { title: "ID", dataIndex: "id", width: 130 },
    { title: "名称", dataIndex: "name", width: 150 },
    { title: "年龄", dataIndex: "age", width: 100, align: "right" },
    { title: "城市", dataIndex: "city", width: 110 },
    { title: "部门", dataIndex: "dept", width: 130 },
    { title: "金额", dataIndex: "amount", width: 140, align: "right" },
    { title: "备注", dataIndex: "remark", width: 200 },
  ];
  const cols = base.slice(0, Math.min(columnCount, base.length));
  // 列数超过基础列时，追加动态列
  for (let i = base.length; i < columnCount; i++) {
    cols.push({
      title: "扩展列" + i,
      dataIndex: "ext" + i,
      width: 120,
      render: (v, row) => row.id + "-" + i,
    });
  }
  return cols;
}

function Playground({ rows = 50000, columns = 7, perfCache, rowHeight = 40 }) {
  const [tick, setTick] = useState(0);

  const data = useMemo(() => makeData(rows), [rows]);
  const cols = useMemo(() => makeColumns(columns), [columns]);

  const t0 = React.useRef(0);
  React.useLayoutEffect(() => {
    if (t0.current) {
      // 重渲耗时打点（父组件空转重渲场景）
      // eslint-disable-next-line no-console
      console.log(`[playground] 空转重渲耗时: ${(performance.now() - t0.current).toFixed(1)}ms`);
    }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "4px 0 8px" }}>
        <button onClick={() => { t0.current = performance.now(); setTick(t => t + 1); }}>
          触发父组件重渲（测 perfCache）(tick={tick})
        </button>
        <span style={{ marginLeft: 12, color: "#888", fontSize: 12 }}>
          {rows} 行 × {columns} 列 · perfCache={String(perfCache === true)}（缺省关闭）
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Table
          columns={cols}
          data={data}
          rowKey="id"
          rowHeight={rowHeight}
          orderNumber
          striped
          sortable
          perfCache={perfCache}
        />
      </div>
    </div>
  );
}

export default {
  title: "性能测试场",
  component: Playground,
  parameters: {
    layout: "fullscreen",
  },
};

export const VirtualScroll = {
  name: "虚拟滚动性能",
  args: { rows: 50000, columns: 7, perfCache: undefined, rowHeight: 40 },
  render: (args) => <Playground {...args} />,
};

export const HundredThousandRows = {
  name: "10万行极限",
  args: { rows: 100000, columns: 5, perfCache: undefined, rowHeight: 36 },
  render: (args) => <Playground {...args} />,
};

export const PerfCacheOn = {
  name: "perfCache开启对照（引用缓存优化）",
  args: { rows: 50000, columns: 7, perfCache: true, rowHeight: 40 },
  render: (args) => <Playground {...args} />,
};
