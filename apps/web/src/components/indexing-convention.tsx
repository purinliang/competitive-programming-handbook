export function IndexingConvention() {
  return (
    <aside className="route-convention" aria-label="阅读约定">
      <p>
        <strong>下标与区间约定</strong>
        <span>本书自定义的对象默认从 1 开始编号并使用闭区间；讲解 C++ 与 STL 接口时，保留其原生的从 0 开始编号和左闭右开区间。</span>
      </p>
      <p>
        <strong>扩展阅读</strong>
        <span><code>*</code> 前缀表示扩展阅读，难度通常更高或使用频率更低，暂时不学也不影响后续主线。</span>
      </p>
    </aside>
  );
}
