import { useSyncExternalStore } from "use-sync-external-store/shim";
// shim 包为 React 官方实现：16.8+ 使用内部兼容实现，18+ 自动切换原生 useSyncExternalStore

/**
 * 细粒度响应式 signal —— 供跨层状态(选中/编辑等)绕开引用缓存直达订阅组件。
 *
 * 背景：表格的渲染链上有多层引用缓存(itemData memoize、行级memo、列缓存)，
 * 内部状态(如勾选)不产生新引用时缓存全部命中导致视觉不更新——引用契约
 * 维护成本高且易漏(曾导致选中失效/受控编辑死锁两类回归)。
 * signal 订阅触发重渲不经过任何 memo 比较，从机制上消除该类问题。
 *
 * 值语义：set 传入新值(引用比较)，相同引用不通知。
 */
export function createSignal(initialValue) {
  let value = initialValue;
  const listeners = new Set();

  const get = () => value;

  const set = next => {
    const v = typeof next === "function" ? next(value) : next;
    if (v !== value) {
      value = v;
      listeners.forEach(l => l());
    }
  };

  const subscribe = listener => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return { get, set, subscribe };
}

/**
 * 订阅 signal 并在变化时重渲当前组件。
 * 返回值即 signal 当前值(更新时自动触发重渲，不经过父级 memo 比较)。
 *
 * selector(可选)：派生本组件关心的局部值(如某格子的编辑值/某行是否选中)。
 * useSyncExternalStore 以 Object.is 比较 selector 结果——store 通知时
 * 局部值未变的订阅组件直接跳过重渲，实现"通知粒度=订阅粒度"。
 * 注意 selector 必须返回原始值或稳定引用(不可每次新建对象)。
 */
export function useSelector(signal, selector) {
  const getSnapshot = selector
    ? () => selector(signal.get())
    : signal.get;
  return useSyncExternalStore(signal.subscribe, getSnapshot);
}

/** 常量空 signal：无选择功能的表格也保证 hook 引用稳定 */
export const EMPTY_KEYS_SIGNAL = createSignal([]);

/** 常量空编辑态 signal：无编辑功能的表格也保证 hook 引用稳定 */
export const EMPTY_EDIT_SIGNAL = createSignal({ editKeys: [], editAll: false });

/** 常量空 map signal：校验版本等 map 型状态的兜底（hook 引用稳定） */
export const EMPTY_MAP_SIGNAL = createSignal({});
