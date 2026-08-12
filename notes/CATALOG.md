# 按模块浏览

这里是教程正文的唯一知识注册表。文章 ID 按模块稳定编号，不表示学习先后；核心教程的推荐顺序见 [LEARNING-PATH.md](LEARNING-PATH.md)。

四位数字 ID 表示核心教程，带 `*` 的 ID 表示独立扩展专题。直接配套某篇基础文章的扩展使用 `e1`、`e2` 等后缀并共享基础编号，例如 `0102e1`；配套扩展不进入核心学习路线，也不占用新的四位编号。表中“直接前置”只列不可跳过的直接依赖。`计划`节点尚未创建文件，因此文件列只显示预定路径；`草稿`和`定稿`节点使用可点击链接。

以下现有文件是在新规范建立前形成的遗留草稿，第一次正式修订时必须补齐文章信息块，并从本清单移除对应 ID。

<!-- legacy-drafts: 0107,0111,0113,0115,0117,0118,0121,0125,0128,0152,0153,0207,0304,0305,0306,0403,0501,0502,0503,0510 -->

## 01 C++ 基础

| ID | 知识点 | 状态 | 直接前置 | 文件 |
| --- | --- | --- | --- | --- |
| 0101 | 入门：Hello World! | 定稿 | — | [hello-world.md](cpp/hello-world.md) |
| 0102 | 基本类型：整数 | 草稿 | 0101 | [integer-types.md](cpp/integer-types.md) |
| 0102e1 | 基础：位、字节与存储单位 | 草稿 | 0101 | [bits-bytes-and-storage-units.md](cpp/bits-bytes-and-storage-units.md) |
| 0102e2 | 基本类型：整数的二进制表示 | 草稿 | 0102 | [signed-integer-representations.md](cpp/signed-integer-representations.md) |
| 0102e3 | 基本类型：整数的位宽与平台差异 | 草稿 | 0102 | [integer-type-widths.md](cpp/integer-type-widths.md) |
| 0103 | 基本类型：浮点数 | 草稿 | 0102 | [floating-point-types.md](cpp/floating-point-types.md) |
| 0103e1 | 浮点数表示：IEEE 754 | 草稿 | 0103 | [ieee-754.md](cpp/ieee-754.md) |
| 0104 | 基本类型：字符 | 计划 | 0102 | `cpp/0104-character-types.md` |
| 0105 | 基本类型：布尔 | 计划 | 0102 | `cpp/0105-boolean-type.md` |
| 0106 | 变量：声明与初始化 | 计划 | 0101,0102 | `cpp/0106-variable-declaration-initialization.md` |
| 0107 | 表达式：算术运算符 | 草稿 | 0106 | [0107-arithmetic-operators.md](cpp/0107-arithmetic-operators.md) |
| 0108 | 表达式：比较运算符 | 计划 | 0105,0107 | `cpp/0108-comparison-operators.md` |
| 0109 | 表达式：逻辑运算符 | 计划 | 0105,0108 | `cpp/0109-logical-operators.md` |
| 0110 | 表达式：类型转换 | 计划 | 0102,0103,0104,0105,0107 | `cpp/0110-type-conversions.md` |
| 0111 | 控制流：条件分支 | 草稿 | 0108 | [0111-conditional-branches.md](cpp/0111-conditional-branches.md) |
| 0112 | 控制流：循环 | 计划 | 0108 | `cpp/0112-loops.md` |
| 0113 | 函数：定义与调用 | 草稿 | 0101 | [0113-functions-definition-call.md](cpp/0113-functions-definition-call.md) |
| 0114 | 名称：作用域 | 计划 | 0106,0113 | `cpp/0114-scope.md` |
| 0115 | 输入输出：标准输入 | 草稿 | 0101,0102 | [0115-standard-input.md](cpp/0115-standard-input.md) |
| 0116 | 输入输出：标准输出 | 计划 | 0101,0102 | `cpp/0116-standard-output.md` |
| 0117 | 输入输出：文件重定向 | 草稿 | 0115,0116 | [0117-file-redirection.md](cpp/0117-file-redirection.md) |
| 0118 | 数组：一维数组 | 草稿 | 0106,0112 | [0118-one-dimensional-arrays.md](cpp/0118-one-dimensional-arrays.md) |
| 0119 | 数组：多维数组 | 计划 | 0118 | `cpp/0119-multidimensional-arrays.md` |
| 0120 | 字符串：C 字符串 | 计划 | 0104,0118 | `cpp/0120-c-strings.md` |
| 0121 | 复合类型：struct | 草稿 | 0106 | [0121-struct.md](cpp/0121-struct.md) |
| 0122 | 复合类型：union | 计划 | 0106 | `cpp/0122-union.md` |
| 0123 | 复合类型：enum | 计划 | 0106 | `cpp/0123-enum.md` |
| 0124 | 内存：字节寻址 | 计划 | 0102,0106 | `cpp/0124-byte-addressing.md` |
| 0125 | 内存与别名：指针 | 草稿 | 0118,0124 | [0125-pointers.md](cpp/0125-pointers.md) |
| 0126 | 内存与别名：引用 | 计划 | 0124 | `cpp/0126-references.md` |
| 0127 | 函数：参数传递 | 计划 | 0113,0125,0126 | `cpp/0127-parameter-passing.md` |
| 0128 | 修饰符：const | 草稿 | 0106,0125,0126 | [0128-const.md](cpp/0128-const.md) |
| 0129 | 修饰符：static | 计划 | 0114,0128 | `cpp/0129-static.md` |
| 0130 | 内存：竞赛程序的常见分区 | 计划 | 0124,0129 | `cpp/0130-competitive-program-memory-layout.md` |
| 0131 | 函数：调用栈 | 计划 | 0113,0130 | `cpp/0131-function-call-stack.md` |
| 0132 | 函数：递归 | 计划 | 0113,0131 | `cpp/0132-recursion.md` |
| 0133 | 表达式：位运算符 | 计划 | 0102,0107 | `cpp/0133-bitwise-operators.md` |
| 0134 | 工具类型：pair | 计划 | 0106 | `cpp/0134-pair.md` |
| 0135 | 工具类型：tuple | 计划 | 0134 | `cpp/0135-tuple.md` |
| 0136 | 序列容器：array | 计划 | 0118 | `cpp/0136-array.md` |
| 0137 | 字符串：std::string | 计划 | 0104,0106 | `cpp/0137-std-string.md` |
| 0138 | 序列容器：vector | 计划 | 0118 | `cpp/0138-vector.md` |
| 0139 | 序列容器：deque | 计划 | 0138 | `cpp/0139-deque.md` |
| 0140 | STL 算法：排序 | 计划 | 0138 | `cpp/0140-stl-sorting.md` |
| 0141 | STL 算法：去重 | 计划 | 0140 | `cpp/0141-stl-deduplication.md` |
| 0142 | 容器适配器：stack | 计划 | 0138 | `cpp/0142-stack.md` |
| 0143 | 容器适配器：queue | 计划 | 0139 | `cpp/0143-queue.md` |
| 0144 | 容器适配器：priority_queue | 计划 | 0138,0140 | `cpp/0144-priority-queue.md` |
| 0145 | 有序关联容器：set | 计划 | 0140 | `cpp/0145-set.md` |
| 0146 | 有序关联容器：multiset | 计划 | 0145 | `cpp/0146-multiset.md` |
| 0147 | 有序关联容器：map | 计划 | 0134,0145 | `cpp/0147-map.md` |
| 0148* | 有序关联容器：multimap | 计划 | 0146,0147 | `cpp/0148-multimap.md` |
| 0149 | 无序关联容器：unordered_set | 计划 | 0138 | `cpp/0149-unordered-set.md` |
| 0150 | 无序关联容器：unordered_map | 计划 | 0134,0149 | `cpp/0150-unordered-map.md` |
| 0151 | 工具类型：bitset | 计划 | 0133 | `cpp/0151-bitset.md` |
| 0152* | 预处理：include | 草稿 | 0101 | [0152-include.md](cpp/0152-include.md) |
| 0153* | 名称：命名空间与 std | 草稿 | 0152 | [0153-namespace-and-std.md](cpp/0153-namespace-and-std.md) |
| 0154* | 修饰符：inline | 计划 | 0113 | `cpp/0154-inline.md` |
| 0155* | 修饰符：volatile | 计划 | 0124,0128 | `cpp/0155-volatile.md` |
| 0156* | 扩展容器：order-statistics tree（GNU PBDS） | 计划 | 0145,0147 | `cpp/0156-gnu-pbds.md` |
| 0157* | C++ 对象：生命周期 | 计划 | 0106,0125,0129,0130 | `cpp/0157-object-lifetime.md` |
| 0158 | 入门：A+B Problem | 定稿 | 0101 | [a-plus-b-problem.md](cpp/a-plus-b-problem.md) |

## 02 基础算法与通用技巧

| ID | 知识点 | 状态 | 直接前置 | 文件 |
| --- | --- | --- | --- | --- |
| 0201 | 时间空间复杂度 | 计划 | 0102,0113 | `algorithm-basics/0201-complexity.md` |
| 0202 | 不变量、正确性与边界 | 计划 | 0112,0113 | `algorithm-basics/0202-invariants-correctness.md` |
| 0203 | 排序原理与常用排序 | 计划 | 0118,0201 | `algorithm-basics/0203-sorting.md` |
| 0204 | 二分查找与答案二分 | 计划 | 0202,0203 | `algorithm-basics/0204-binary-search.md` |
| 0205 | 双指针与滑动窗口 | 计划 | 0118,0201 | `algorithm-basics/0205-two-pointers-sliding-window.md` |
| 0206 | 离散化 | 计划 | 0203 | `algorithm-basics/0206-coordinate-compression.md` |
| 0207 | 前缀和与差分 | 草稿 | 0118,0201 | [0207-prefix-sums-and-difference.md](algorithm-basics/0207-prefix-sums-and-difference.md) |
| 0208 | 贪心的选择与证明 | 计划 | 0202,0203 | `algorithm-basics/0208-greedy.md` |
| 0209 | 分治 | 计划 | 0132,0201 | `algorithm-basics/0209-divide-and-conquer.md` |
| 0210 | 枚举、回溯与剪枝 | 计划 | 0132,0201 | `algorithm-basics/0210-enumeration-backtracking.md` |
| 0211 | 子集与位掩码枚举 | 计划 | 0133,0210 | `algorithm-basics/0211-bitmask-enumeration.md` |
| 0212 | Meet-in-the-Middle | 计划 | 0210,0211 | `algorithm-basics/0212-meet-in-the-middle.md` |
| 0213 | 离线算法 | 计划 | 0203,0206 | `algorithm-basics/0213-offline-algorithms.md` |
| 0214 | 扫描线与事件排序 | 计划 | 0203,0206 | `algorithm-basics/0214-sweep-line.md` |
| 0215* | 三分搜索 | 计划 | 0204 | `algorithm-basics/0215-ternary-search.md` |
| 0216* | 随机化算法 | 计划 | 0201 | `algorithm-basics/0216-randomized-algorithms.md` |
| 0217* | 整体二分与并行二分 | 计划 | 0204,0213 | `algorithm-basics/0217-parallel-binary-search.md` |
| 0218* | CDQ 分治 | 计划 | 0206,0209,0213 | `algorithm-basics/0218-cdq-divide-and-conquer.md` |

## 03 数据结构

| ID | 知识点 | 状态 | 直接前置 | 文件 |
| --- | --- | --- | --- | --- |
| 0301 | 单向、双向与环形链表 | 计划 | 0121,0125,0201 | `data-structures/0301-linked-lists.md` |
| 0302 | 二叉堆 | 计划 | 0118,0144,0201 | `data-structures/0302-binary-heap.md` |
| 0303 | 哈希表 | 计划 | 0118,0150,0201 | `data-structures/0303-hash-table.md` |
| 0304 | 线段树基础 | 草稿 | 0118,0132,0201 | [0304-segment-tree.md](data-structures/0304-segment-tree.md) |
| 0305* | 线段树懒标记的组合顺序 | 草稿 | 0304 | [0305-segment-tree-lazy-tags.md](data-structures/0305-segment-tree-lazy-tags.md) |
| 0306 | 树状数组 | 草稿 | 0133,0207,0201 | [0306-fenwick-tree.md](data-structures/0306-fenwick-tree.md) |
| 0307 | 并查集 | 计划 | 0118,0132,0201 | `data-structures/0307-disjoint-set-union.md` |
| 0308 | 稀疏表 ST | 计划 | 0118,0133,0201 | `data-structures/0308-sparse-table.md` |
| 0309 | 单调栈与单调队列 | 计划 | 0142,0139,0205 | `data-structures/0309-monotonic-stack-queue.md` |
| 0310 | 带权并查集 | 计划 | 0307 | `data-structures/0310-weighted-disjoint-set.md` |
| 0311 | 二叉树：结构与存储 | 草稿 | 0118,0121,0125,0433 | [binary-tree-structure-and-storage.md](data-structures/binary-tree-structure-and-storage.md) |
| 0312* | 可撤销并查集 | 计划 | 0307,0213 | `data-structures/0312-rollback-disjoint-set.md` |
| 0313* | 分块 | 计划 | 0207,0201 | `data-structures/0313-square-root-decomposition.md` |
| 0314* | 莫队算法 | 计划 | 0313,0213 | `data-structures/0314-mo-algorithm.md` |
| 0315* | 线段树二分与树上下降 | 计划 | 0304,0204 | `data-structures/0315-segment-tree-descent.md` |
| 0316* | 可持久化线段树 | 计划 | 0125,0304 | `data-structures/0316-persistent-segment-tree.md` |
| 0317* | 动态开点线段树 | 计划 | 0125,0304 | `data-structures/0317-dynamic-segment-tree.md` |
| 0318* | Segment Tree Beats | 计划 | 0304 | `data-structures/0318-segment-tree-beats.md` |
| 0319* | 树状数组的区间修改变体 | 计划 | 0306,0207 | `data-structures/0319-fenwick-range-updates.md` |
| 0320* | 树状数组维护区间最值 | 计划 | 0306 | `data-structures/0320-fenwick-range-extrema.md` |
| 0321* | 左偏堆、斜堆与配对堆 | 计划 | 0125,0302 | `data-structures/0321-mergeable-heaps.md` |
| 0322* | Treap 与随机平衡树 | 计划 | 0302,0209,0216 | `data-structures/0322-treap.md` |
| 0323* | Splay | 计划 | 0301 | `data-structures/0323-splay.md` |
| 0324* | B 树与 B+ 树 | 计划 | 0301,0302 | `data-structures/0324-b-tree-and-b-plus-tree.md` |
| 0325* | 笛卡尔树 | 计划 | 0309 | `data-structures/0325-cartesian-tree.md` |
| 0326* | Wavelet Matrix | 计划 | 0304,0206 | `data-structures/0326-wavelet-matrix.md` |
| 0327* | 启发式合并（small-to-large） | 计划 | 0145,0201 | `data-structures/0327-small-to-large-merging.md` |
| 0328 | 二叉树：前序、中序与后序遍历 | 计划 | 0311,0434 | `data-structures/binary-tree-traversals.md` |

## 04 图论

| ID | 知识点 | 状态 | 直接前置 | 文件 |
| --- | --- | --- | --- | --- |
| 0401 | 图：点与边 | 草稿 | — | [vertices-and-edges.md](graph-theory/vertices-and-edges.md) |
| 0402 | 图的存储 | 草稿 | 0119,0121,0138,0401 | [graph-representation.md](graph-theory/graph-representation.md) |
| 0403 | 倍增 LCA | 草稿 | 0133,0434 | [0403-lca-binary-lifting.md](graph-theory/0403-lca-binary-lifting.md) |
| 0404 | 连通块与洪水填充 | 计划 | 0436 | `graph-theory/0404-connected-components.md` |
| 0405 | 拓扑排序 | 计划 | 0143,0402,0432 | `graph-theory/0405-topological-sort.md` |
| 0406 | BFS、0-1 BFS 与多源最短路 | 计划 | 0437 | `graph-theory/0406-unweighted-shortest-path.md` |
| 0407 | Dijkstra | 计划 | 0302,0401,0201 | `graph-theory/0407-dijkstra.md` |
| 0408 | Bellman-Ford 与负环 | 计划 | 0401,0201 | `graph-theory/0408-bellman-ford.md` |
| 0409 | Floyd 与传递闭包 | 计划 | 0119,0401,0201 | `graph-theory/0409-floyd-warshall.md` |
| 0410 | 最小生成树 | 计划 | 0302,0307,0401 | `graph-theory/0410-minimum-spanning-tree.md` |
| 0411 | 二分图判定 | 计划 | 0437 | `graph-theory/0411-bipartite-graph.md` |
| 0412 | 二分图匹配 | 计划 | 0132,0411 | `graph-theory/0412-bipartite-matching.md` |
| 0413 | 强连通分量 | 计划 | 0405,0436 | `graph-theory/0413-strongly-connected-components.md` |
| 0414 | 割点与桥 | 计划 | 0436 | `graph-theory/0414-articulation-points-bridges.md` |
| 0415* | 点双、边双与圆方树 | 计划 | 0414 | `graph-theory/0415-biconnected-components-block-cut-tree.md` |
| 0416 | 欧拉路径、欧拉回路与欧拉图 | 计划 | 0132,0402,0432 | `graph-theory/eulerian-paths-and-circuits.md` |
| 0417 | 树的直径与中心 | 计划 | 0434 | `graph-theory/0417-tree-diameter-center.md` |
| 0418 | DFS 序、子树区间与树上差分 | 计划 | 0207,0434 | `graph-theory/0418-tree-euler-tour-difference.md` |
| 0419 | 树链剖分 | 计划 | 0304,0403,0418 | `graph-theory/0419-heavy-light-decomposition.md` |
| 0420 | 2-SAT | 计划 | 0133,0413 | `graph-theory/0420-two-sat.md` |
| 0421 | Dinic 最大流 | 计划 | 0132,0401,0406 | `graph-theory/0421-dinic-max-flow.md` |
| 0422* | 最小费用最大流 | 计划 | 0407,0421 | `graph-theory/0422-min-cost-max-flow.md` |
| 0423* | 虚树 | 计划 | 0403,0418 | `graph-theory/0423-virtual-tree.md` |
| 0424* | 点分治 | 计划 | 0132,0417 | `graph-theory/0424-centroid-decomposition.md` |
| 0425* | SPFA 与队列优化最短路 | 计划 | 0408 | `graph-theory/0425-spfa.md` |
| 0426 | 基环树与函数图 | 计划 | 0403,0436 | `graph-theory/0426-unicyclic-functional-graphs.md` |
| 0427* | DSU on Tree | 计划 | 0327,0418 | `graph-theory/0427-dsu-on-tree.md` |
| 0428* | 差分约束 | 计划 | 0408 | `graph-theory/0428-difference-constraints.md` |
| 0429 | 分层图与状态最短路 | 计划 | 0406,0407 | `graph-theory/0429-layered-state-shortest-path.md` |
| 0430* | 树哈希 | 计划 | 0417,0434 | `graph-theory/0430-tree-hashing.md` |
| 0431 | 图：路径与环 | 草稿 | 0401 | [paths-and-cycles.md](graph-theory/paths-and-cycles.md) |
| 0432 | 图：度数 | 草稿 | 0401 | [vertex-degrees.md](graph-theory/vertex-degrees.md) |
| 0433 | 树与有根树 | 草稿 | 0401,0431 | [trees-and-rooted-trees.md](graph-theory/trees-and-rooted-trees.md) |
| 0434 | 树的深度优先搜索 | 草稿 | 0132,0402,0433 | [tree-depth-first-search.md](graph-theory/tree-depth-first-search.md) |
| 0435 | 树的广度优先搜索 | 草稿 | 0143,0402,0433 | [tree-breadth-first-search.md](graph-theory/tree-breadth-first-search.md) |
| 0436 | 图的深度优先搜索 | 草稿 | 0402,0434 | [graph-depth-first-search.md](graph-theory/graph-depth-first-search.md) |
| 0437 | 图的广度优先搜索 | 计划 | 0402,0435 | `graph-theory/graph-breadth-first-search.md` |
| 0438 | 哈密顿路径、哈密顿回路与哈密顿图 | 计划 | 0201,0431,0436 | `graph-theory/hamiltonian-paths-and-circuits.md` |

## 05 数学

| ID | 知识点 | 状态 | 直接前置 | 文件 |
| --- | --- | --- | --- | --- |
| 0501 | 整除、gcd 与 lcm | 草稿 | 0107 | [0501-divisibility-gcd-lcm.md](math/0501-divisibility-gcd-lcm.md) |
| 0502 | 质数与唯一分解定理 | 草稿 | 0501 | [0502-prime-factorization.md](math/0502-prime-factorization.md) |
| 0503 | 扩展欧几里得 | 草稿 | 0501 | [0503-extended-euclid.md](math/0503-extended-euclid.md) |
| 0504 | 模运算与快速幂 | 计划 | 0107,0133 | `math/0504-modular-arithmetic-fast-power.md` |
| 0505 | 筛法与质因数预处理 | 计划 | 0502 | `math/0505-sieve.md` |
| 0506 | 模逆元 | 计划 | 0503,0504 | `math/0506-modular-inverse.md` |
| 0507 | 组合数与基础计数 | 计划 | 0505,0506 | `math/0507-combinatorics.md` |
| 0508 | Euler 函数 | 计划 | 0502,0504 | `math/0508-euler-totient.md` |
| 0509 | 矩阵运算与线性变换 | 计划 | 0107,0119 | `math/0509-matrix-operations.md` |
| 0510 | CRT 与 exCRT | 草稿 | 0503,0504 | [0510-crt-and-excrt.md](math/0510-crt-and-excrt.md) |
| 0511 | 矩阵快速幂与递推加速 | 计划 | 0504,0509 | `math/0511-matrix-exponentiation.md` |
| 0512 | 概率与期望基础 | 计划 | 0107 | `math/0512-probability-expectation.md` |
| 0513 | Nim、SG 函数与基础博弈论 | 计划 | 0133,0202 | `math/0513-nim-sg-game-theory.md` |
| 0514 | XOR 线性基 | 计划 | 0133,0202 | `math/0514-xor-linear-basis.md` |
| 0515 | 高斯消元 | 计划 | 0107,0202 | `math/0515-gaussian-elimination.md` |
| 0516 | 容斥原理 | 计划 | 0507,0211 | `math/0516-inclusion-exclusion.md` |
| 0517* | 多项式：NTT | 计划 | 0504,0506,0521 | `math/0517-ntt.md` |
| 0518 | Möbius 函数与反演 | 计划 | 0505,0508 | `math/0518-mobius-function-inversion.md` |
| 0519* | BSGS 与离散对数 | 计划 | 0504,0506 | `math/0519-discrete-logarithm.md` |
| 0520* | 多项式：表示、加法与减法 | 计划 | 0118 | `math/0520-polynomial-representation-addition-subtraction.md` |
| 0521* | 多项式：卷积与朴素乘法 | 计划 | 0201,0520 | `math/0521-convolution-naive-multiplication.md` |
| 0522* | 复数与单位根 | 计划 | 0103,0509 | `math/0522-complex-numbers-roots-of-unity.md` |
| 0523* | 多项式：FFT | 计划 | 0521,0522 | `math/0523-fft.md` |
| 0524* | 形式幂级数：求逆 | 计划 | 0506,0517,0520 | `math/0524-formal-power-series-inverse.md` |
| 0525* | 形式幂级数：形式导数 | 计划 | 0520 | `math/0525-formal-derivative.md` |
| 0526* | 形式幂级数：形式积分 | 计划 | 0506,0520 | `math/0526-formal-integral.md` |
| 0527* | 形式幂级数：对数 | 计划 | 0517,0524,0525,0526 | `math/0527-formal-power-series-logarithm.md` |
| 0528* | 形式幂级数：指数 | 计划 | 0517,0527 | `math/0528-formal-power-series-exponential.md` |
| 0529* | 形式幂级数：平方根 | 计划 | 0517,0524,0528 | `math/0529-formal-power-series-square-root.md` |
| 0530* | 形式幂级数：幂 | 计划 | 0527,0528 | `math/0530-formal-power-series-power.md` |
| 0531* | 多项式：除法与余数 | 计划 | 0517,0524 | `math/0531-polynomial-division-remainder.md` |
| 0532* | 多项式：多点求值 | 计划 | 0209,0531 | `math/0532-multipoint-evaluation.md` |
| 0533* | 多项式：插值 | 计划 | 0506,0532 | `math/0533-polynomial-interpolation.md` |

## 06 计算几何

| ID | 知识点 | 状态 | 直接前置 | 文件 |
| --- | --- | --- | --- | --- |
| 0601 | 坐标、点、向量与精度 | 计划 | 0103,0121,0202 | `computational-geometry/0601-points-vectors-precision.md` |
| 0602 | 点积、叉积与方向判断 | 计划 | 0601 | `computational-geometry/0602-dot-cross-orientation.md` |
| 0603 | 直线、线段与相交判定 | 计划 | 0602 | `computational-geometry/0603-lines-segments-intersections.md` |
| 0604 | 多边形面积与点的位置 | 计划 | 0602 | `computational-geometry/0604-polygon-area-point-location.md` |
| 0605 | 凸包 | 计划 | 0203,0602 | `computational-geometry/0605-convex-hull.md` |
| 0606* | 圆与圆的关系 | 计划 | 0601,0603 | `computational-geometry/0606-circles.md` |
| 0607* | 旋转卡壳 | 计划 | 0605 | `computational-geometry/0607-rotating-calipers.md` |
| 0608* | 几何扫描线 | 计划 | 0147,0214,0603 | `computational-geometry/0608-geometric-sweep-line.md` |
| 0609* | 最近点对 | 计划 | 0203,0209,0601 | `computational-geometry/0609-closest-pair-of-points.md` |
| 0610* | 凸多边形：点包含 | 计划 | 0204,0602,0605 | `computational-geometry/0610-point-in-convex-polygon.md` |
| 0611* | 凸多边形：切线与极值查询 | 计划 | 0204,0602,0605 | `computational-geometry/0611-convex-polygon-tangents-extrema.md` |
| 0612* | 半平面交 | 计划 | 0139,0203,0603,0605 | `computational-geometry/0612-half-plane-intersection.md` |
| 0613* | 闵可夫斯基和 | 计划 | 0203,0602,0605 | `computational-geometry/0613-minkowski-sum.md` |

## 07 动态规划

| ID | 知识点 | 状态 | 直接前置 | 文件 |
| --- | --- | --- | --- | --- |
| 0701 | 状态、转移与 DP 入门 | 计划 | 0118,0201,0202 | `dynamic-programming/0701-dp-foundations.md` |
| 0702 | 线性与状态机 DP | 计划 | 0701 | `dynamic-programming/0702-linear-state-machine-dp.md` |
| 0703 | 0/1、完全与多重背包 | 计划 | 0701 | `dynamic-programming/0703-knapsack.md` |
| 0704 | 最长上升子序列 | 计划 | 0204,0702 | `dynamic-programming/0704-longest-increasing-subsequence.md` |
| 0705 | 区间 DP | 计划 | 0701 | `dynamic-programming/0705-interval-dp.md` |
| 0706 | DAG 上的动态规划 | 计划 | 0405,0701 | `dynamic-programming/0706-dag-dp.md` |
| 0707 | 树形 DP 与换根 DP | 计划 | 0434,0701 | `dynamic-programming/0707-tree-rerooting-dp.md` |
| 0708 | 状压 DP | 计划 | 0211,0701 | `dynamic-programming/0708-bitmask-dp.md` |
| 0709 | 数位 DP | 计划 | 0133,0701 | `dynamic-programming/0709-digit-dp.md` |
| 0710 | 概率与期望 DP | 计划 | 0512,0701 | `dynamic-programming/0710-probability-expectation-dp.md` |
| 0711 | 单调队列优化 DP | 计划 | 0309,0703 | `dynamic-programming/0711-monotone-queue-optimization.md` |
| 0712* | 斜率优化 DP | 计划 | 0214,0702 | `dynamic-programming/0712-convex-hull-trick.md` |
| 0713* | 分治优化 DP | 计划 | 0209,0701 | `dynamic-programming/0713-divide-conquer-optimization.md` |
| 0714* | Slope Trick | 计划 | 0208,0702 | `dynamic-programming/0714-slope-trick.md` |

## 08 字符串

| ID | 知识点 | 状态 | 直接前置 | 文件 |
| --- | --- | --- | --- | --- |
| 0801 | 字符串比较与字典序 | 计划 | 0137 | `strings/0801-string-comparison-lexicographic-order.md` |
| 0802 | 模式匹配问题与朴素匹配 | 计划 | 0137,0201 | `strings/0802-naive-pattern-matching.md` |
| 0803 | 字符串哈希 | 计划 | 0504,0802 | `strings/0803-rolling-hash.md` |
| 0804 | KMP 与前缀函数 | 计划 | 0202,0802 | `strings/0804-kmp-prefix-function.md` |
| 0805 | Z 函数 | 计划 | 0202,0802 | `strings/0805-z-function.md` |
| 0806 | Trie | 计划 | 0125,0801 | `strings/0806-trie.md` |
| 0807 | AC 自动机 | 计划 | 0437,0804,0806 | `strings/0807-aho-corasick.md` |
| 0808 | Manacher | 计划 | 0202,0801 | `strings/0808-manacher.md` |
| 0809* | 后缀数组 | 计划 | 0206,0801 | `strings/0809-suffix-array.md` |
| 0810* | 后缀自动机 | 计划 | 0806 | `strings/0810-suffix-automaton.md` |
| 0811* | 回文树 | 计划 | 0806,0808 | `strings/0811-palindromic-tree.md` |
| 0812* | 后缀树 | 计划 | 0806 | `strings/0812-suffix-tree.md` |
