import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
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

describe("selection（signal 直达重渲）", () => {
  it("点击行选中：高亮类直达重渲，不经过引用传播", async () => {
    const onSelectChange = vi.fn();
    const { container } = render(
      <DataGrid
        rowKey="id"
        columns={columns}
        data={makeData(20)}
        selectMode="multiple"
        rowSelectClassName="my-selected"
        onSelectChange={onSelectChange}
        __testHeight={400}
      />
    );
    await waitFor(() =>
      expect(container.querySelectorAll(".tablex-table-row").length).toBeGreaterThan(0)
    );

    // 点击首行数据区（onRow click 选中）
    const row0 = container.querySelector('[data-rowindex="0"]');
    fireEvent.click(row0);
    await waitFor(() => {
      expect(row0.className).toContain("my-selected");
    });

    // 勾选其他行不影响首行（signal selector 布尔化，粒度=订阅粒度）
    const row1 = container.querySelector('[data-rowindex="1"]');
    fireEvent.click(row1);
    await waitFor(() => expect(row1.className).toContain("my-selected"));
    expect(row0.className).toContain("my-selected");

    expect(onSelectChange).toHaveBeenCalled();
  });

  it("表头全选：全部行高亮", async () => {
    const { container } = render(
      <DataGrid
        rowKey="id"
        columns={columns}
        data={makeData(10)}
        selectMode="multiple"
        rowSelectClassName="my-selected"
        onSelectChange={() => {}}
        __testHeight={400}
      />
    );
    await waitFor(() =>
      expect(container.querySelectorAll(".tablex-table-row").length).toBeGreaterThan(0)
    );

    // 表头全选 checkbox
    const headCheckbox = container.querySelector(
      '.tablex-table-head-container input[type="checkbox"]'
    );
    expect(headCheckbox).toBeTruthy();
    fireEvent.click(headCheckbox);

    await waitFor(() => {
      const selected = container.querySelectorAll(".my-selected");
      expect(selected.length).toBe(10);
    });
  });
});
