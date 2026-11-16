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

describe("新增行编辑流程（addRange → 输入 → completeEdit）", () => {
  it("新增行输入后完成：触发 onEditSave，行与数据保留在列表中", async () => {
    const actions = {};
    const onEditSave = vi.fn();
    const { container } = render(
      <Table
        rowKey="id"
        editable
        editTools={["edit", "add", "delete"]}
        actions={actions}
        data={makeData(3)}
        onEditSave={onEditSave}
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
    await waitFor(() =>
      expect(container.querySelectorAll(".tablex-table-row").length).toBeGreaterThan(0)
    );

    // 新增一行（进入编辑态）
    actions.addRange();
    const input = await waitFor(() => {
      const inputs = container.querySelectorAll(".tablex-table-row input");
      expect(inputs.length).toBeGreaterThan(0);
      return inputs[inputs.length - 1];
    });

    // 输入数据
    fireEvent.change(input, { target: { value: "新增甲" } });
    await waitFor(() => expect(input.value).toBe("新增甲"));

    // 完成：新增行应保留并显示输入值
    await actions.completeEdit();
    expect(onEditSave).toHaveBeenCalledTimes(1);
    const [changedRows, newRows, editType] = onEditSave.mock.calls[0];
    expect(changedRows).toHaveLength(1);
    expect(changedRows[0].name).toBe("新增甲");
    expect(newRows).toHaveLength(4);
    expect(newRows[3].name).toBe("新增甲");
    expect(editType).toBe("add");
    await waitFor(() => {
      expect(container.textContent).toContain("新增甲");
    });
    // 退出编辑态
    expect(container.querySelector(".tablex-table-row input")).toBeNull();
  });
});

describe("新增行编辑流程（大数据量 + 受控 story 语义）", () => {
  it("5000行：新增行输入后完成，数据完整且新增保留", async () => {
    const actions = {};
    const bigData = new Array(5000).fill(0).map((_, i) => ({
      id: "row-" + i,
      name: "名称-" + i
    }));
    const { container } = render(
      <Table
        rowKey="id"
        editable
        editTools={["edit", "add"]}
        actions={actions}
        data={bigData}
        pagination={{}}
        onEditSave={() => false}
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
    await waitFor(() =>
      expect(container.querySelectorAll(".tablex-table-row").length).toBeGreaterThan(0)
    );

    actions.addRange();
    const input = await waitFor(() => {
      const inputs = container.querySelectorAll(".tablex-table-row input");
      expect(inputs.length).toBeGreaterThan(0);
      return inputs[inputs.length - 1];
    });
    fireEvent.change(input, { target: { value: "新增甲" } });
    await waitFor(() => expect(input.value).toBe("新增甲"));

    // isAppend 缺省 false：新增编辑模式只显示新增行(隔离编辑视口，设计行为)
    const inner = container.querySelector(".tablex-table-body > div > div");
    expect(parseInt(inner.style.height)).toBe(40);

    await actions.completeEdit();
    // 退出编辑态 + 数据完整(5001行)且新增行带输入值(新增行在末尾，不在视口，
    // 以实例数据断言)
    await waitFor(() => {
      expect(container.querySelector(".tablex-table-row input")).toBeNull();
    });
    const finalData = actions.getData();
    expect(finalData.length).toBe(5001);
    expect(finalData[5000].name).toBe("新增甲");
  });
});

describe("autoRowSpanColumns（间隔 run）", () => {
  it("被不同行隔开的后续相同值 run 同样合并（1,1,2,3,1,1）", async () => {
    // name: 1,1,2,3,1,1 —— 两个被隔开的 run（行0-1 与 行4-5）
    const data = [1, 1, 2, 3, 1, 1].map((v, i) => ({
      id: "row-" + i,
      name: "值" + v
    }));
    const { container } = render(
      <Table
        rowKey="id"
        data={data}
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

    const cellOf = idx =>
      container.querySelector('[data-rowindex="' + idx + '"] [data-columnkey="nameKey"]');
    const info = idx => {
      const c = cellOf(idx);
      return c ? { span: c.className.includes("rowspan"), h: c.style.height, empty: c.children.length === 0 } : null;
    };
    // run1(行0-1)：行0 合并格80px、行1 占位
    expect(info(0)).toEqual({ span: true, h: "80px", empty: false });
    expect(info(1)).toEqual({ span: false, h: "", empty: true });
    // 独立行
    expect(info(2).span).toBe(false);
    expect(info(3).span).toBe(false);
    // run2(行4-5)：行4 合并格80px、行5 占位 —— 用户报告的失效点
    expect(info(4)).toEqual({ span: true, h: "80px", empty: false });
    expect(info(5)).toEqual({ span: false, h: "", empty: true });
  });
});

describe("autoRowSpanColumns（树形数据）", () => {
  it("树形展开后按显示序合并相邻等值（跨父子层级）", async () => {
    // 树形：父 a(X) 子 a1(X) a2(X)；父 b(Y) 子 b1(X)
    // 展开后显示序: a(X) a1(X) a2(X) b(Y) b1(X) —— X 的 run 是显示序前3行
    const data = [
      {
        id: "a", name: "值X",
        children: [
          { id: "a1", name: "值X" },
          { id: "a2", name: "值X" }
        ]
      },
      {
        id: "b", name: "值Y",
        children: [{ id: "b1", name: "值X" }]
      }
    ];
    const { container } = render(
      <Table
        rowKey="id"
        data={data}
        defaultExpandedRowKeys={["a", "b"]}
        autoRowSpanColumns={["nameKey"]}
        columns={[
          { key: "id", dataIndex: "id", title: "ID", width: 120 },
          { key: "nameKey", dataIndex: "name", title: "名称", width: 150 }
        ]}
        __testHeight={400}
      />
    );
    await new Promise(r => setTimeout(r, 300));
    const rows = Array.from(container.querySelectorAll(".tablex-table-row"));
    console.log("TREE_ROWS:", rows.length, JSON.stringify(rows.map(r => r.dataset.rowindex + ":" + r.textContent.replace(/\s+/g, "").slice(0, 12))));
    const cellOf = idx =>
      container.querySelector('[data-rowindex="' + idx + '"] [data-columnkey="nameKey"]');
    const info = idx => {
      const c = cellOf(idx);
      return c ? { span: c.className.includes("rowspan"), h: c.style.height, empty: c.children.length === 0 } : null;
    };
    return { r0: info(0), r1: info(1), r2: info(2), r3: info(3), r4: info(4) };
  });
});

describe("autoRowSpanColumns（滚动窗口）", () => {
  it("滚动穿越多个 run：合并保持且各 run 单份", async () => {
    // 60 行：0-9 值A / 10-19 值B / 20-29 值A(第二个被隔开的A run) / 30+ 值C
    const data = [];
    for (let i = 0; i < 60; i++) {
      let v = "值C";
      if (i < 10) v = "值A";
      else if (i < 20) v = "值B";
      else if (i < 30) v = "值A";
      data.push({ id: "row-" + i, name: v });
    }
    const { container } = render(
      <Table
        rowKey="id"
        data={data}
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

    const scrollTo = offset => {
      const scroller = container.querySelector(".tablex-table-body > div");
      scroller.scrollTop = offset;
      scroller.dispatchEvent(new Event("scroll", { bubbles: true }));
    };
    const spanInfo = () => {
      const cells = container.querySelectorAll(".tablex-table-row-cell-rowspan");
      return Array.from(cells).map(c => ({
        hostRow: c.closest(".tablex-table-row").dataset.rowindex,
        h: c.style.height
      }));
    };

    // 滚到第二个 A run 的中段（起始行20滚出窗口上方，从未渲染过）
    scrollTo(26 * 40);
    await waitFor(() => {
      const spans = spanInfo();
      // A run3 的接管格(400px=10行)必须存在——起始行未被渲染也合并(预声明)
      expect(spans).toContainEqual({ hostRow: expect.any(String), h: "400px" });
    });

    // 滚到第一个 A run（行0附近）
    scrollTo(0);
    await waitFor(() => {
      const spans = spanInfo();
      expect(spans).toContainEqual({ hostRow: "0", h: "400px" });
    });
  });
});

describe("分页 + 新增（追加语义）", () => {
  it("新增自动跳末页，会话中翻页有效，保存后正常", async () => {
    const actions = {};
    const data = new Array(25).fill(0).map((_, i) => ({
      id: "row-" + i,
      name: "名称-" + i
    }));
    const { container } = render(
      <Table
        rowKey="id"
        editable
        editTools={["edit", "add"]}
        actions={actions}
        data={data}
        pagination={{}}
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
    const items = () => container.querySelectorAll(".tablex-pagination-item");
    const rows = () =>
      Array.from(container.querySelectorAll(".tablex-table-row")).filter(
        r => r.dataset.rowindex !== undefined
      );
    const activePage = () =>
      container.querySelector(".tablex-pagination-item-active");

    // 初始第1页10行
    await waitFor(() => expect(rows().length).toBe(10));
    expect(rows()[0].textContent).toContain("row-0");

    // 回归：翻第2页
    fireEvent.click(items()[1]);
    await waitFor(() => expect(rows()[0].textContent).toContain("row-10"));

    // 回第1页 → 新增：追加语义，自动跳末页（26行 → 第3页，含新增行）
    fireEvent.click(items()[0]);
    await waitFor(() => expect(rows()[0].textContent).toContain("row-0"));
    actions.addRange();
    await waitFor(() => {
      // 末页：row-20..row-24 + 新增行(__id_)
      expect(activePage().textContent).toContain("3");
      expect(rows()[0].textContent).toContain("row-20");
      const last = rows()[rows().length - 1];
      expect(last.textContent).toContain("__id_");
      // 新增行编辑器出现
      expect(last.querySelector("input")).toBeTruthy();
    });

    // 会话中翻页有效：翻回第1页（非编辑态的已有数据）
    fireEvent.click(items()[0]);
    await waitFor(() => expect(rows()[0].textContent).toContain("row-0"));

    // 翻回末页，输入并保存
    fireEvent.click(items()[2]);
    await waitFor(() => expect(rows()[0].textContent).toContain("row-20"));
    const input = rows()[rows().length - 1].querySelector("input");
    fireEvent.change(input, { target: { value: "分页新增" } });
    await waitFor(() => expect(input.value).toBe("分页新增"));
    await actions.completeEdit();
    await waitFor(() =>
      expect(container.querySelector(".tablex-table-row input")).toBeNull()
    );

    // 保存后翻页正常（仍在末页，数据 26 行）
    expect(activePage().textContent).toContain("3");
    fireEvent.click(items()[1]);
    await waitFor(() => expect(rows()[0].textContent).toContain("row-10"));
  });
});

describe("服务端分页（pagination.serverSide，ArrayTable 模式）", () => {
  it("serverSide：页数据不被二次切片；dataControled 客户端分页翻页仍正常", async () => {
    const page1 = Array.from({ length: 20 }, (_, i) => ({
      id: "r-" + i,
      name: "第1页-" + i
    }));
    const page2 = Array.from({ length: 20 }, (_, i) => ({
      id: "p2-" + i,
      name: "第2页-" + i
    }));
    const allData = Array.from({ length: 50 }, (_, i) => ({
      id: "a-" + i,
      name: "全量-" + i
    }));
    const columns = [
      { key: "id", dataIndex: "id", title: "ID", width: 120 },
      { key: "name", dataIndex: "name", title: "名称", width: 150 }
    ];
    const pagination = {
      current: 1,
      pageSize: 20,
      total: 100,
      onPageChange: () => {}
    };
    const renderTable = (data, current, pag) =>
      render(
        <Table
          rowKey="id"
          dataControled
          data={data}
          columns={columns}
          pagination={{ ...pagination, ...pag, current }}
          __testHeight={400}
        />
      );

    // 数据量以虚拟内容总高断言（视口只挂载部分行）
    const totalH = c => {
      const inner = c.querySelector(".tablex-table-body > div > div");
      return inner ? parseInt(inner.style.height) : 0;
    };

    // ── serverSide 模式 ──
    const ss = { serverSide: true };
    // 第1页 20 行（800px）
    const { container, unmount } = renderTable(page1, 1, ss);
    await waitFor(() => expect(totalH(container)).toBe(20 * 40));
    unmount();

    // 新增行：21 行（840px），数据不被切片（旧行为滤掉第21行 → 800px）
    const withNew = [...page1, { id: "new-1", name: "新增行" }];
    const c2 = renderTable(withNew, 1, ss);
    await waitFor(() => expect(totalH(c2.container)).toBe(21 * 40));
    c2.unmount();

    // 翻到第2页：外部提供第2页数据，20 行正常显示
    // （旧行为 filter i∈[20,40) 把 20 行全滤光 → 0px）
    const c3 = renderTable(page2, 2, ss);
    await waitFor(() => {
      expect(totalH(c3.container)).toBe(20 * 40);
      expect(c3.container.textContent).toContain("第2页-0");
    });
    c3.unmount();

    // ── dataControled + 客户端分页（无 serverSide）：翻页必须仍有效 ──
    // 非受控(不传 current/onPageChange，内部管理页码)
    const c4 = render(
      <Table
        rowKey="id"
        dataControled
        data={allData}
        columns={columns}
        pagination={{ pageSize: 20, total: 50 }}
        __testHeight={400}
      />
    );
    await waitFor(() => expect(totalH(c4.container)).toBe(20 * 40));
    const items = c4.container.querySelectorAll(".tablex-pagination-item");
    fireEvent.click(items[1]);
    await waitFor(() => {
      expect(totalH(c4.container)).toBe(20 * 40);
      expect(c4.container.textContent).toContain("全量-20");
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
