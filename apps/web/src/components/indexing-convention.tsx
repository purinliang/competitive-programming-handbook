export function IndexingConvention() {
  return (
    <aside className="route-convention" aria-label="阅读约定">
      <p>
        <strong>下标约定</strong>
        <span>
          本书自定义的数组、数据结构、图和树默认从 1 开始编号，0 留给空节点、
          空前缀、边界或哨兵。原生 <code>string</code> 的字符位置保留 0-based；
          后缀数组、自动机等自定义结构仍从 1 开始编号。
        </span>
      </p>
      <p>
        <strong>区间约定</strong>
        <span>
          本书自定义的操作默认使用闭区间 <code>[l, r]</code>；讲解 C++ 与 STL
          接口时，保留其原生的左闭右开区间、起点加长度等规则。
        </span>
      </p>
      <p>
        <strong>扩展阅读</strong>
        <span><code>*</code> 前缀表示扩展阅读，难度通常更高或使用频率更低，暂时不学也不影响后续主线。</span>
      </p>
    </aside>
  );
}
