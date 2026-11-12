import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DataGrid from "../src/index.js";

function makeData(count, prefix = "row") {
  return new Array(count).fill(0).map((_, i) => ({
    id: prefix + "-" + i,
    name: "名称-" + i,
    value: i % 10
  }));
}

const columns = [
  { key: "id", dataIndex: "id", title: "ID", width: 150 },
  { key: "name", dataIndex: "name", title: "名称", width: 200 },
  { key: "value", dataIndex: "value", title: "值", width: 100 }
];

// 挂载的行元素集合（虚拟窗口内）
function mountedRows(container) {
  return Array.from(container.querySelectorAll(".tablex-table-row"));
}

function rowIndexes(container) {
  return mountedRows(container)
    .map(r => Number(r.dataset.rowindex))
    .filter(i => !isNaN(i));
}

describe("基础渲染与虚拟窗口", () => {
  it("渲染表头与视口内的行", async () => {
    const { container } = render(
      <DataGrid
        rowKey="id"
        columns={columns}
        data={makeData(1000)}
        __testHeight={400}
      />
    );

    await waitFor(() => {
      expect(mountedRows(container).length).toBeGreaterThan(0);
    });

    // 视口 400 - 表头 40 - 2 = 358px / 40px ≈ 9 行 + 两侧 overscan
    const idxs = rowIndexes(container);
    expect(idxs).toContain(0);
    expect(mountedRows(container).length).toBeLessThan(30);
    // 首行内容正确
    expect(container.querySelector('[data-rowindex="0"]').textContent).toContain(
      "row-0"
    );
  });

  it("列引用稳定时行级 memo 生效：无关重渲不重建行 DOM", async () => {
    const data = makeData(50);
    const { container, rerender } = render(
      <DataGrid
        rowKey="id"
        columns={columns}
        data={data}
        __testHeight={400}
      />
    );
    await waitFor(() => expect(mountedRows(container).length).toBeGreaterThan(0));

    const firstRowBefore = container.querySelector('[data-rowindex="0"]');
    // 无关 props 变化（引用稳定的数据/列）
    rerender(
      <DataGrid
        rowKey="id"
        columns={columns}
        data={data}
        bordered={true}
        __testHeight={400}
      />
    );
    const firstRowAfter = container.querySelector('[data-rowindex="0"]');
    expect(firstRowAfter).toBe(firstRowBefore);
  });
});
