import "./loading.css";

export default () => {
  return (
    <div className="tablex-loading">
      <div class="tablex-spin  tablex-spin-spinning">
        <span class="tablex-spin-dot tablex-spin-dot-spin">
          <i class="tablex-spin-dot-item" />
          <i class="tablex-spin-dot-item" />
          <i class="tablex-spin-dot-item" />
          <i class="tablex-spin-dot-item" />
        </span>
      </div>
      <div>数据加载中...</div>
    </div>
  );
};
