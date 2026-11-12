import React from "react";
import { describe, it, expect } from "vitest";
import { render, waitFor } from "@testing-library/react";
import DataGrid from "../src/index.js";

function makeData(count) {
  return new Array(count).fill(0).map((_, i) => ({
    id: "row-" + i,
    name: "名称-" + i
  }));
}

const columns = [
  { key: "id", dataIndex: "id", title: "ID", width: 150 },
  { key: "name", dataIndex: "name", title: "名称", width: 200 }
];

// jsdom 中 scrollTop 赋值不派发 scroll 事件，手动派发（与 applyOffset 的
// jsdom 同步路径一致）
function scrollTo(container, offset) {
  const scroller = container.querySelector(".tablex-main .tablex-table-body > div");
  if (!scroller) throw new Error("primary scroller not found");
  scroller.scrollTop = offset;
  scroller.dispatchEvent(new Event("scroll", { bubbles: true }));
  return scroller;
}

function rowIndexes(container) {
  return Array.from(container.querySelectorAll(".tablex-table-row"))
    .map(r => Number(r.dataset.rowindex))
    .filter(i => !isNaN(i));
}

describe("虚拟滚动", () => {
  it("滚动后虚拟窗口移动且行内容正确", async () => {
    const { container } = render(
      <DataGrid rowKey="id" columns={columns} data={makeData(500)} __testHeight={400} />
    );
    await waitFor(() => expect(rowIndexes(container)).toContain(0));

    scrollTo(container, 2000);
    await waitFor(() => {
      const idxs = rowIndexes(container);
      expect(idxs).not.toContain(0);
      // 2000/40 = 第50行进入视口
      expect(idxs).toContain(50);
    });
    expect(container.querySelector('[data-rowindex="50"]').textContent).toContain(
      "row-50"
    );

    scrollTo(container, 0);
    await waitFor(() => expect(rowIndexes(container)).toContain(0));
  });

  it("冻结列下侧栏 scrollTop 与主栏同步（共享 virtualizer）", async () => {
    const frozenColumns = [
      { key: "id", dataIndex: "id", title: "ID", width: 120, fixed: "left" },
      { key: "name", dataIndex: "name", title: "名称", width: 200 },
      { key: "v", dataIndex: "id", title: "V", width: 100, fixed: "right" }
    ];
    const { container } = render(
      <DataGrid
        rowKey="id"
        columns={frozenColumns}
        data={makeData(500)}
        __testHeight={400}
        __testWidth={600}
      />
    );
    await waitFor(() =>
      expect(container.querySelectorAll(".tablex-table-row").length).toBeGreaterThan(0)
    );

    scrollTo(container, 1600);
    await waitFor(() => {
      const left = container.querySelector(
        ".tablex-frozen-left .tablex-table-body > div"
      );
      const right = container.querySelector(
        ".tablex-frozen-right .tablex-table-body > div"
      );
      expect(left.scrollTop).toBe(1600);
      expect(right.scrollTop).toBe(1600);
    });

    // 左右栏与主栏同一窗口行集
    const mainIdxs = Array.from(
      container.querySelectorAll(".tablex-main .tablex-table-row")
    ).map(r => r.dataset.rowindex);
    const leftIdxs = Array.from(
      container.querySelectorAll(".tablex-frozen-left .tablex-table-row")
    ).map(r => r.dataset.rowindex);
    expect(leftIdxs).toEqual(mainIdxs);
  });

  it("固定列区域发起滚动：主栏与其他侧栏联动（防回声）", async () => {
    const frozenColumns = [
      { key: "id", dataIndex: "id", title: "ID", width: 120, fixed: "left" },
      { key: "name", dataIndex: "name", title: "名称", width: 200 }
    ];
    const { container } = render(
      <DataGrid rowKey="id" columns={frozenColumns} data={makeData(500)} __testHeight={400} />
    );
    await waitFor(() =>
      expect(container.querySelectorAll(".tablex-table-row").length).toBeGreaterThan(0)
    );

    // 在左侧栏上滚动（dispatch 到侧栏滚动容器）
    const left = container.querySelector(".tablex-frozen-left .tablex-table-body > div");
    left.scrollTop = 800;
    left.dispatchEvent(new Event("scroll", { bubbles: true }));
    await waitFor(() => {
      const main = container.querySelector(".tablex-main .tablex-table-body > div");
      expect(Math.round(main.scrollTop)).toBe(800);
    });
    // 侧栏自身保持一致，页面稳定（无循环写入）
    expect(Math.round(left.scrollTop)).toBe(800);
  });

  it("scrollToRow 命中预期偏移（对齐数学）", async () => {
    const actions = {};
    const { container } = render(
      <DataGrid
        rowKey="id"
        columns={columns}
        data={makeData(500)}
        __testHeight={400}
        actions={actions}
      />
    );
    await waitFor(() => expect(rowIndexes(container)).toContain(0));
    expect(typeof actions.scrollToRow).toBe("function");

    actions.scrollToRow("row-100", "start");
    const scroller = container.querySelector(".tablex-main .tablex-table-body > div");
    // start 对齐：第100行顶部 = 100*40 = 4000
    await waitFor(() => expect(Math.round(scroller.scrollTop)).toBe(4000));
  });
});
