/**
 * 编辑性能测试场：
 * - 编辑态切换（显示 ↔ 编辑器）—— formatColumns 编辑列重建路径
 * - 模拟连续输入（受控数据行级更新）—— perfCache 行级引用比较的主场
 * - 保存校验（onEditSave）
 * 所有操作耗时在 UI 上打点，并在 console 输出明细
 */
import React, { useMemo, useRef, useState } from "react";
import { Input, InputNumber } from "antd";
import "antd/dist/antd.css";
import Table from "tablex";

const CITIES = ["北京", "上海", "深圳", "杭州", "广州", "成都"];

function makeData(count) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      id: "row-" + i,
      name: "名称-" + i,
      age: 20 + (i % 40),
      city: CITIES[i % CITIES.length],
      amount: ((i * 137) % 100000) / 100,
      remark: "备注-" + (i % 100),
      ...Object.fromEntries(Array.from({ length: 15 }, (_, k) => ["ext" + k, "值-" + k + "-" + (i % 60)]))
    });
  }
  return arr;
}

// editor 签名为位置参数: (value, row, index, onChange, ins, extra)
// onChange 必须传 { [列dataIndex]: 新值 } 对象（tablex editChange 按 key 合并到行）
// extra.columnDataIndex 为当前列的 dataIndex

// 形式一：defaultValue 非受控 —— antd 组件自管输入状态，初值注入，onChange 仅上报
const DefaultValueInputEditor = (value, row, index, onChange, ins, extra) => (
  <Input
    size="small"
    defaultValue={value == null ? "" : value}
    onChange={e => onChange && onChange({ [extra.columnDataIndex]: e.target.value })}
  />
);

// 形式二：value 受控 —— 值完全由 tablex 数据驱动（onChange → tablex 合并 → 新值回传）
const ControlledInputEditor = (value, row, index, onChange, ins, extra) => (
  <Input
    size="small"
    value={value == null ? "" : value}
    onChange={e => onChange && onChange({ [extra.columnDataIndex]: e.target.value })}
  />
);

// 数字列：受控 InputNumber（antd onChange 直接给值）
const ControlledNumberEditor = (value, row, index, onChange, ins, extra) => (
  <InputNumber
    size="small"
    style={{ width: "100%" }}
    value={value == null ? null : value}
    onChange={v => onChange && onChange({ [extra.columnDataIndex]: v })}
  />
);

function EditPerfPlayground({ rows = 5000 }) {
  const [data, setData] = useState(() => makeData(rows));
  const [editAll, setEditAll] = useState(false);
  const [log, setLog] = useState([]);
  const logRef = useRef([]);

  const record = (label, ms, extra) => {
    const line = `${label}: ${ms.toFixed(1)}ms${extra ? " · " + extra : ""}`;
    logRef.current = [line, ...logRef.current].slice(0, 9);
    setLog([...logRef.current]);
    // eslint-disable-next-line no-console
    console.log(`[edit-perf] ${line}`);
  };

  const columns = useMemo(() => {
    const cols = [
      { title: "ID", dataIndex: "id", width: 120 },
      { title: "名称·非受控", dataIndex: "name", width: 150, editor: DefaultValueInputEditor },
      { title: "城市", dataIndex: "city", width: 100 },
      { title: "金额·受控", dataIndex: "amount", width: 140, align: "right", editor: ControlledNumberEditor },
      { title: "备注·受控", dataIndex: "remark", width: 150, editor: ControlledInputEditor }
    ];
    // 扩展到 20 列：展示列/编辑列交替，非受控/受控交替（编辑列约一半）
    for (let i = 0; cols.length < 20; i++) {
      const editable = i % 2 === 1;
      cols.push({
        title: "扩展" + i + (editable ? (i % 4 === 1 ? "·非受控" : "·受控") : ""),
        dataIndex: "ext" + i,
        width: 140,
        editor: editable
          ? i % 4 === 1
            ? DefaultValueInputEditor
            : ControlledInputEditor
          : undefined
      });
    }
    return cols;
  }, []);

  // ── 操作与打点 ──────────────────────────────────────────────
  const toggleEdit = next => {
    const t = performance.now();
    setEditAll(next);
    // 耗时以提交完成时刻计（useEffect 在渲染+提交后触发）
    requestAnimationFrame(() => {
      record(next ? "进入编辑态(editAll)" : "退出编辑态", performance.now() - t,
        `${rows} 行`);
    });
  };

  // 模拟连续输入：受控数据更新（不可变替换第 5 行），等价于编辑器 onChange 后的数据流
  const simulateTyping = (n = 10) => {
    let total = 0;
    for (let i = 0; i < n; i++) {
      const t = performance.now();
      setData(d => d.map((row, idx) => (idx === 5 ? { ...row, amount: row.amount + 1, name: "编辑中-" + i } : row)));
      total += performance.now() - t;
    }
    record(`模拟输入×${n}（行级数据更新）`, total, `avg ${(total / n).toFixed(2)}ms/次`);
  };

  // 全表数据更新对照：所有行都变（最坏情况）
  const simulateUpdateAll = () => {
    const t = performance.now();
    setData(d => d.map(row => ({ ...row, amount: row.amount + 1 })));
    requestAnimationFrame(() => {
      record("全表数据更新（所有行引用变化）", performance.now() - t, `${rows} 行`);
    });
  };

  const onSave = (changedRows, newRows, editType) => {
    // 触发校验+保存链路，耗时由外层记录
    if (typeof window !== "undefined") {
      window.__onEditSaveFired = (window.__onEditSaveFired || 0) + 1;
    }
    setEditAll(false);
    return false; // 保留数据不动，纯测性能
  };

  const buttonStyle = { marginRight: 8, marginBottom: 4 };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "4px 0 8px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0 }}>
        <button style={buttonStyle} onClick={() => toggleEdit(!editAll)}>
          {editAll ? "退出编辑态" : "进入编辑态(editAll)"}
        </button>
        <button style={buttonStyle} onClick={() => simulateTyping(10)}>模拟输入×10</button>
        <button style={buttonStyle} onClick={() => simulateTyping(50)}>模拟输入×50</button>
        <button style={buttonStyle} onClick={simulateUpdateAll}>全表数据更新</button>
        <span style={{ color: "#888", fontSize: 12, marginRight: 12 }}>
          {rows} 行 × 20 列 · {editAll ? "编辑中" : "展示态"}
        </span>
        {log.length > 0 && (
          <span style={{ fontSize: 12, color: "#0a7" }}>{log[0]}</span>
        )}
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <Table
            columns={columns}
            data={data}
            rowKey="id"
            editable
            editAll={editAll}
            editTools={["edit", "add"]}
            onEditSave={onSave}
            onSelectChange={() => {}}
            pagination={{ showSizeChanger: true, pageSizeOptions: ["10", "50", "100", "500"] }}
          />
        </div>
        <div
          style={{
            width: 260, marginLeft: 8, fontSize: 12, lineHeight: "20px",
            borderLeft: "1px solid #eee", paddingLeft: 10, overflow: "auto",
            color: "#555", whiteSpace: "pre"
          }}
        >
          <b>耗时记录（新→旧）</b>
          {"\n"}{log.join("\n") || "点击上方按钮开始测量"}
        </div>
      </div>
    </div>
  );
}

export default {
  title: "性能测试场/编辑性能",
  parameters: { layout: "fullscreen" },
};

export const EditFiveThousandRows = {
  name: "编辑性能 5000 行",
  args: { rows: 5000 },
  render: args => <EditPerfPlayground {...args} />,
};

export const EditFiftyThousandRows = {
  name: "编辑性能 5 万行",
  args: { rows: 50000 },
  render: args => <EditPerfPlayground {...args} />,
};
