import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import Table from "../src/index.js";

function makeData(count, runLength = 3) {
  // name 每 runLength 行连续相同（相邻等值合并的输入）
  return new Array(count).fill(0).map((_, i) => ({
    id: "row-" + i,
    name: "名称-" + Math.floor(i / runLength),
    amount: i
  }));
}

const TextEditor = (value, row, index, onChange) => (
  <input value={value == null ? "" : value} onChange={e => onChange({ name: e.target.value })} />
);

describe("Editable 编辑输入（editValuesSignal 覆盖层）", () => {
  it("编辑行输入走覆盖层：单格更新，不触发全量数据重算", async () => {
    const data = makeData(100);
    const { container } = render(
      <Table
        rowKey="id"
        editable
        editAll
        data={data}
        columns={[
          { key: "id", dataIndex: "id", title: "ID", width: 120 },
          {
            key: "name",
            dataIndex: "name",
            title: "名称",
            width: 150,
            editor: TextEditor
          }
        ]}
        __testHeight={400}
      />
    );

    // 编辑器渲染（受控 input）
    const input = await waitFor(() => {
      const el = container.querySelector('[data-columnkey="name"] input');
      expect(el).toBeTruthy();
      return el;
    });
    expect(input.value).toBe("名称-0");

    // 模拟输入：onChange → setEditValue → 覆盖层 → 受控值更新
    fireEvent.change(input, { target: { value: "改了" } });
    await waitFor(() => expect(input.value).toBe("改了"));

    // 未落盘：数据层不变（其余行编辑器仍显示原值）
    const row1Input = container.querySelector(
      '[data-rowindex="1"] [data-columnkey="name"] input'
    );
    expect(row1Input.value).toBe("名称-0");
  });

  it("退出编辑时覆盖层落盘（applyEditValues 不可变替换）", async () => {
    const actions = {};
    const { container } = render(
      <Table
        rowKey="id"
        editable
        editAll
        data={makeData(5)}
        actions={actions}
        columns={[
          { key: "id", dataIndex: "id", title: "ID", width: 120 },
          {
            key: "name",
            dataIndex: "name",
            title: "名称",
            width: 150,
            editor: TextEditor
          }
        ]}
        __testHeight={400}
      />
    );

    const input = await waitFor(() => {
      const el = container.querySelector('[data-columnkey="name"] input');
      expect(el).toBeTruthy();
      return el;
    });
    fireEvent.change(input, { target: { value: "落盘值" } });

    // endEdit：覆盖层应用回数据，退出编辑态显示新值
    await actions.completeEdit();
    await waitFor(() => {
      const cell = container.querySelector('[data-rowindex="0"] [data-columnkey="name"]');
      expect(cell.textContent).toContain("落盘值");
      expect(container.querySelector('[data-columnkey="name"] input')).toBeNull();
    });
  });
});

describe("autoRowSpanColumns（列元素按列定义解析）", () => {
  it("key≠dataIndex 的列按 dataIndex 取值做相邻合并", async () => {
    // name 每 3 行循环：0-2 同值，3-5 同值……
    // 列 key 为 nameKey(≠dataIndex name)——旧版裸 dataIndex 语义会失效
    const { container } = render(
      <Table
        rowKey="id"
        data={makeData(12)}
        autoRowSpanColumns={["nameKey"]}
        columns={[
          { key: "id", dataIndex: "id", title: "ID", width: 120 },
          { key: "nameKey", dataIndex: "name", title: "名称", width: 150 }
        ]}
        __testHeight={400}
      />
    );

    await waitFor(() =>
      expect(container.querySelectorAll(".tablex-table-row").length).toBeGreaterThan(0)
    );

    // 第0行：name 合并 3 行(rowSpan=3 → height 120)
    const row0Cell = container.querySelector(
      '[data-rowindex="0"] [data-columnkey="nameKey"]'
    );
    expect(row0Cell.className).toContain("tablex-table-row-cell-rowspan");
    expect(row0Cell.style.height).toBe("120px");

    // 第1/2行：被覆盖（占位格，无内容）
    const row1Cell = container.querySelector(
      '[data-rowindex="1"] [data-columnkey="nameKey"]'
    );
    expect(row1Cell.children.length).toBe(0);
    expect(row1Cell.className).not.toContain("tablex-table-row-cell-rowspan");

    // 第3行：新 run 起始（不同值）
    const row3Cell = container.querySelector(
      '[data-rowindex="3"] [data-columnkey="nameKey"]'
    );
    expect(row3Cell.className).toContain("tablex-table-row-cell-rowspan");
  });
});
