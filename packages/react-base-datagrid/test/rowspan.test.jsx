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

// 第2列：index===2 起向下合并 4 行（antd 契约：render 返回 {children, props}）
const spanColumns = [
  { key: "id", dataIndex: "id", title: "ID", width: 150 },
  {
    key: "name",
    dataIndex: "name",
    title: "名称",
    width: 200,
    render: (value, row, index) => {
      if (index === 2) {
        return { children: "合并内容", props: { rowSpan: 4 } };
      }
      return value;
    }
  },
  { key: "v", dataIndex: "id", title: "V", width: 100 }
];

function spanCells(container) {
  return container.querySelectorAll(".tablex-table-row-cell-rowspan");
}

function scrollTo(container, offset) {
  const scroller = container.querySelector(".tablex-main .tablex-table-body > div");
  scroller.scrollTop = offset;
  scroller.dispatchEvent(new Event("scroll", { bubbles: true }));
  return scroller;
}

describe("rowSpan 合并（声明索引 + 接管渲染）", () => {
  it("主渲染：起始行渲染合并格，覆盖行渲染同宽空占位格", async () => {
    const { container } = render(
      <DataGrid rowKey="id" columns={spanColumns} data={makeData(50)} __testHeight={400} />
    );
    await waitFor(() => expect(spanCells(container).length).toBe(1));

    // 合并格：起始行 index=2，高度 4×40=160
    const cell = spanCells(container)[0];
    expect(cell.style.height).toBe("160px");
    expect(cell.textContent).toContain("合并内容");
    expect(cell.closest(".tablex-table-row").dataset.rowindex).toBe("2");

    // 覆盖行(3/4/5)：name 列为无内容占位格，列位保持(后续列不前移)
    for (const idx of [3, 4, 5]) {
      const row = container.querySelector('[data-rowindex="' + idx + '"]');
      const cells = row.querySelectorAll(".tablex-table-row-cell");
      expect(cells.length).toBe(3);
      const nameCell = row.querySelector('[data-columnkey="name"]');
      expect(nameCell.children.length).toBe(0);
    }
  });

  it("被覆盖行整体垫底（zIndex:-1），起始行正常层序", async () => {
    const { container } = render(
      <DataGrid rowKey="id" columns={spanColumns} data={makeData(50)} __testHeight={400} />
    );
    await waitFor(() => expect(spanCells(container).length).toBe(1));

    const coveredRow = container.querySelector('[data-rowindex="3"]');
    const startRow = container.querySelector('[data-rowindex="2"]');
    expect(coveredRow.style.zIndex).toBe("-1");
    expect(startRow.style.zIndex).toBe("");
  });

  it("起始行滚出窗口后由窗口第一行接管：单份渲染 + 负偏移回退", async () => {
    const { container } = render(
      <DataGrid rowKey="id" columns={spanColumns} data={makeData(50)} __testHeight={400} />
    );
    await waitFor(() => expect(spanCells(container).length).toBe(1));

    // 起始行(2)滚出窗口上方(含 overscan 区)：
    // 视口 358/40 ≈ 9 行，overscan 5 → scrollTop=400 时 windowMin = 10-5 = 5 > 2
    scrollTo(container, 400);
    await waitFor(() => {
      expect(spanCells(container).length).toBe(1);
      const cell = spanCells(container)[0];
      // 接管格渲染在窗口第一行，top = -(起始行→该行的累计高度)
      const hostRow = cell.closest(".tablex-table-row");
      const rowIndex = Number(hostRow.dataset.rowindex);
      expect(rowIndex).toBeGreaterThanOrEqual(3);
      expect(cell.style.top).toBe("-" + (rowIndex - 2) * 40 + "px");
      expect(cell.textContent).toContain("合并内容");
    });

    // 滚回：接管权归还起始行
    scrollTo(container, 0);
    await waitFor(() => {
      const cell = spanCells(container)[0];
      expect(cell.closest(".tablex-table-row").dataset.rowindex).toBe("2");
      expect(cell.style.top).toBe("");
    });
  });

  it("rowSpan=0 的单元格不渲染内容", async () => {
    const zeroColumns = [
      { key: "id", dataIndex: "id", title: "ID", width: 150 },
      {
        key: "name",
        dataIndex: "name",
        title: "名称",
        width: 200,
        render: (value, row, index) => {
          if (index === 1) return { children: value, props: { rowSpan: 0 } };
          return value;
        }
      }
    ];
    const { container } = render(
      <DataGrid rowKey="id" columns={zeroColumns} data={makeData(10)} __testHeight={400} />
    );
    await waitFor(() =>
      expect(container.querySelectorAll(".tablex-table-row").length).toBeGreaterThan(0)
    );
    const row1 = container.querySelector('[data-rowindex="1"]');
    expect(row1.querySelector('[data-columnkey="name"]').textContent).toBe("");
  });
});

describe("colSpan 列合并", () => {
  it("被吃列整格跳过，合并格宽度为跨列和", async () => {
    const colSpanColumns = [
      { key: "id", dataIndex: "id", title: "ID", width: 150 },
      {
        key: "name",
        dataIndex: "name",
        title: "名称",
        width: 200,
        render: (value, row, index) => {
          if (index === 0) {
            return { children: "跨两列", props: { colSpan: 2 } };
          }
          return value;
        }
      },
      { key: "v", dataIndex: "id", title: "V", width: 100 }
    ];
    const { container } = render(
      <DataGrid rowKey="id" columns={colSpanColumns} data={makeData(10)} __testHeight={400} />
    );
    await waitFor(() =>
      expect(container.querySelectorAll(".tablex-table-row").length).toBeGreaterThan(0)
    );

    const row0 = container.querySelector('[data-rowindex="0"]');
    const cells = row0.querySelectorAll(".tablex-table-row-cell");
    // colSpan=2：id + 合并格(吃掉 v 列)，共 2 格
    expect(cells.length).toBe(2);
    expect(cells[1].style.width).toBe("300px"); // 200 + 100
    expect(cells[1].textContent).toContain("跨两列");

    // 其余行正常 3 格
    const row1 = container.querySelector('[data-rowindex="1"]');
    expect(row1.querySelectorAll(".tablex-table-row-cell").length).toBe(3);
  });
});
