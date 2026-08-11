# 按模块浏览

这里是教程正文的唯一知识注册表。文章 ID 按模块稳定编号，不表示学习先后；核心教程的推荐顺序见 [LEARNING-PATH.md](LEARNING-PATH.md)。

无星号 ID 表示核心教程，带 `*` 的 ID 表示扩展专题。表中“直接前置”只列不可跳过的直接依赖。`计划`节点尚未创建文件，因此文件列只显示预定路径；`草稿`和`已固化`节点使用可点击链接。

以下现有文件是在新规范建立前形成的遗留草稿，第一次正式修订时必须补齐文章信息块，并从本清单移除对应 ID。

<!-- legacy-drafts: 0101,0102,0103,0104,0105,0106,0107,0108,0109,0110,0111,0112,0113,0207,0304,0305,0306,0403,0501,0502,0503,0510 -->

## 01 C++ 基础

| ID | 知识点 | 状态 | 直接前置 | 文件 |
| --- | --- | --- | --- | --- |
| 0101 | 程序入口与竞赛代码骨架 | 草稿 | — | [0101-program-entry-and-skeleton.md](cpp/0101-program-entry-and-skeleton.md) |
| 0102 | include 与头文件 | 草稿 | 0101 | [0102-include.md](cpp/0102-include.md) |
| 0103 | 命名空间与 std | 草稿 | 0102 | [0103-namespace-and-std.md](cpp/0103-namespace-and-std.md) |
| 0104 | 基本类型、范围与 ASCII | 草稿 | 0101 | [0104-basic-types.md](cpp/0104-basic-types.md) |
| 0105 | 运算符与类型转换 | 草稿 | 0104 | [0105-operators-and-conversions.md](cpp/0105-operators-and-conversions.md) |
| 0106 | 分支、循环与控制流 | 草稿 | 0105 | [0106-control-flow.md](cpp/0106-control-flow.md) |
| 0107 | 函数、参数与作用域 | 草稿 | 0106 | [0107-functions.md](cpp/0107-functions.md) |
| 0108 | 标准输入输出 | 草稿 | 0104 | [0108-io.md](cpp/0108-io.md) |
| 0109 | 文件输入输出 | 草稿 | 0108 | [0109-file-io.md](cpp/0109-file-io.md) |
| 0110 | 数组、二维数组与 C 字符串 | 草稿 | 0106 | [0110-arrays-and-strings.md](cpp/0110-arrays-and-strings.md) |
| 0111 | 指针、引用与传参 | 草稿 | 0107,0110 | [0111-pointers-references-parameters.md](cpp/0111-pointers-references-parameters.md) |
| 0112 | struct、enum 与复合类型 | 草稿 | 0104,0110 | [0112-composite-types.md](cpp/0112-composite-types.md) |
| 0113 | const、static 与常用修饰符 | 草稿 | 0107,0111 | [0113-modifier-keywords.md](cpp/0113-modifier-keywords.md) |
| 0114 | std::string | 计划 | 0110 | `cpp/0114-std-string.md` |
| 0115 | vector 与迭代器 | 计划 | 0110,0112 | `cpp/0115-vector-and-iterators.md` |
| 0116 | STL 算法与比较器 | 计划 | 0107,0115 | `cpp/0116-stl-algorithms-and-comparators.md` |
| 0117 | stack | 计划 | 0115 | `cpp/0117-stack.md` |
| 0118 | queue 与 deque | 计划 | 0115 | `cpp/0118-queue-and-deque.md` |
| 0119 | priority_queue | 计划 | 0115,0116 | `cpp/0119-priority-queue.md` |
| 0120 | set、multiset 与 map | 计划 | 0115,0116 | `cpp/0120-ordered-associative-containers.md` |
| 0121 | unordered_set 与 unordered_map | 计划 | 0115 | `cpp/0121-unordered-associative-containers.md` |
| 0122 | 位运算与二进制表示 | 计划 | 0105 | `cpp/0122-bit-operations.md` |
| 0123 | 递归与调用栈 | 计划 | 0106,0107 | `cpp/0123-recursion-and-call-stack.md` |

## 02 基础算法与通用技巧

| ID | 知识点 | 状态 | 直接前置 | 文件 |
| --- | --- | --- | --- | --- |
| 0201 | 时间空间复杂度 | 计划 | 0104,0107 | `algorithm-basics/0201-complexity.md` |
| 0202 | 不变量、正确性与边界 | 计划 | 0106,0107 | `algorithm-basics/0202-invariants-correctness.md` |
| 0203 | 排序原理与常用排序 | 计划 | 0110,0201 | `algorithm-basics/0203-sorting.md` |
| 0204 | 二分查找与答案二分 | 计划 | 0202,0203 | `algorithm-basics/0204-binary-search.md` |
| 0205 | 双指针与滑动窗口 | 计划 | 0110,0201 | `algorithm-basics/0205-two-pointers-sliding-window.md` |
| 0206 | 离散化 | 计划 | 0203 | `algorithm-basics/0206-coordinate-compression.md` |
| 0207 | 前缀和与差分 | 草稿 | 0110,0201 | [0207-prefix-sums-and-difference.md](algorithm-basics/0207-prefix-sums-and-difference.md) |
| 0208 | 贪心的选择与证明 | 计划 | 0202,0203 | `algorithm-basics/0208-greedy.md` |
| 0209 | 分治 | 计划 | 0123,0201 | `algorithm-basics/0209-divide-and-conquer.md` |
| 0210 | 枚举、回溯与剪枝 | 计划 | 0123,0201 | `algorithm-basics/0210-enumeration-backtracking.md` |
| 0211 | 子集与位掩码枚举 | 计划 | 0122,0210 | `algorithm-basics/0211-bitmask-enumeration.md` |
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
| 0301 | 单向、双向与环形链表 | 计划 | 0111,0112,0201 | `data-structures/0301-linked-lists.md` |
| 0302 | 二叉堆 | 计划 | 0110,0119,0201 | `data-structures/0302-binary-heap.md` |
| 0303 | 哈希表 | 计划 | 0110,0121,0201 | `data-structures/0303-hash-table.md` |
| 0304 | 线段树基础 | 草稿 | 0110,0123,0201 | [0304-segment-tree.md](data-structures/0304-segment-tree.md) |
| 0305* | 线段树懒标记的组合顺序 | 草稿 | 0304 | [0305-segment-tree-lazy-tags.md](data-structures/0305-segment-tree-lazy-tags.md) |
| 0306 | 树状数组 | 草稿 | 0122,0207,0201 | [0306-fenwick-tree.md](data-structures/0306-fenwick-tree.md) |
| 0307 | 并查集 | 计划 | 0110,0123,0201 | `data-structures/0307-disjoint-set-union.md` |
| 0308 | 稀疏表 ST | 计划 | 0110,0122,0201 | `data-structures/0308-sparse-table.md` |
| 0309 | 单调栈与单调队列 | 计划 | 0117,0118,0205 | `data-structures/0309-monotonic-stack-queue.md` |
| 0310 | 带权并查集 | 计划 | 0307 | `data-structures/0310-weighted-disjoint-set.md` |
| 0311 | 二叉树与前中后序遍历 | 计划 | 0111,0112,0123,0118 | `data-structures/0311-binary-tree-traversals.md` |
| 0312* | 可撤销并查集 | 计划 | 0307,0213 | `data-structures/0312-rollback-disjoint-set.md` |
| 0313* | 分块 | 计划 | 0207,0201 | `data-structures/0313-square-root-decomposition.md` |
| 0314* | 莫队算法 | 计划 | 0313,0213 | `data-structures/0314-mo-algorithm.md` |
| 0315* | 线段树二分与树上下降 | 计划 | 0304,0204 | `data-structures/0315-segment-tree-descent.md` |
| 0316* | 可持久化线段树 | 计划 | 0111,0304 | `data-structures/0316-persistent-segment-tree.md` |
| 0317* | 动态开点线段树 | 计划 | 0111,0304 | `data-structures/0317-dynamic-segment-tree.md` |
| 0318* | Segment Tree Beats | 计划 | 0304 | `data-structures/0318-segment-tree-beats.md` |
| 0319* | 树状数组的区间修改变体 | 计划 | 0306,0207 | `data-structures/0319-fenwick-range-updates.md` |
| 0320* | 树状数组维护区间最值 | 计划 | 0306 | `data-structures/0320-fenwick-range-extrema.md` |
| 0321* | 左偏堆、斜堆与配对堆 | 计划 | 0111,0302 | `data-structures/0321-mergeable-heaps.md` |
| 0322* | Treap 与随机平衡树 | 计划 | 0302,0209,0216 | `data-structures/0322-treap.md` |
| 0323* | Splay | 计划 | 0301 | `data-structures/0323-splay.md` |
| 0324* | B 树与 B+ 树 | 计划 | 0301,0302 | `data-structures/0324-b-tree-and-b-plus-tree.md` |
| 0325* | 笛卡尔树 | 计划 | 0309 | `data-structures/0325-cartesian-tree.md` |
| 0326* | Wavelet Matrix | 计划 | 0304,0206 | `data-structures/0326-wavelet-matrix.md` |

## 04 图论

| ID | 知识点 | 状态 | 直接前置 | 文件 |
| --- | --- | --- | --- | --- |
| 0401 | 图的存储与边模型 | 计划 | 0115,0117 | `graph-theory/0401-graph-representation.md` |
| 0402 | DFS、BFS 与生成树 | 计划 | 0123,0118,0401 | `graph-theory/0402-dfs-bfs.md` |
| 0403 | 倍增 LCA | 草稿 | 0122,0402 | [0403-lca-binary-lifting.md](graph-theory/0403-lca-binary-lifting.md) |
| 0404 | 连通块与洪水填充 | 计划 | 0402 | `graph-theory/0404-connected-components.md` |
| 0405 | 拓扑排序 | 计划 | 0402 | `graph-theory/0405-topological-sort.md` |
| 0406 | BFS、0-1 BFS 与多源最短路 | 计划 | 0402 | `graph-theory/0406-unweighted-shortest-path.md` |
| 0407 | Dijkstra | 计划 | 0302,0401,0201 | `graph-theory/0407-dijkstra.md` |
| 0408 | Bellman-Ford 与负环 | 计划 | 0401,0201 | `graph-theory/0408-bellman-ford.md` |
| 0409 | Floyd 与传递闭包 | 计划 | 0110,0401,0201 | `graph-theory/0409-floyd-warshall.md` |
| 0410 | 最小生成树 | 计划 | 0302,0307,0401 | `graph-theory/0410-minimum-spanning-tree.md` |
| 0411 | 二分图判定 | 计划 | 0402 | `graph-theory/0411-bipartite-graph.md` |
| 0412 | 二分图匹配 | 计划 | 0123,0411 | `graph-theory/0412-bipartite-matching.md` |
| 0413 | 强连通分量 | 计划 | 0402,0405 | `graph-theory/0413-strongly-connected-components.md` |
| 0414 | 割点与桥 | 计划 | 0402 | `graph-theory/0414-articulation-points-bridges.md` |
| 0415* | 点双、边双与圆方树 | 计划 | 0414 | `graph-theory/0415-biconnected-components-block-cut-tree.md` |
| 0416 | 欧拉路径与欧拉回路 | 计划 | 0401,0202 | `graph-theory/0416-euler-trail-circuit.md` |
| 0417 | 树的直径与中心 | 计划 | 0402 | `graph-theory/0417-tree-diameter-center.md` |
| 0418 | DFS 序、子树区间与树上差分 | 计划 | 0207,0402 | `graph-theory/0418-tree-euler-tour-difference.md` |
| 0419 | 树链剖分 | 计划 | 0304,0403,0418 | `graph-theory/0419-heavy-light-decomposition.md` |
| 0420 | 2-SAT | 计划 | 0122,0413 | `graph-theory/0420-two-sat.md` |
| 0421 | Dinic 最大流 | 计划 | 0123,0401,0406 | `graph-theory/0421-dinic-max-flow.md` |
| 0422* | 最小费用最大流 | 计划 | 0407,0421 | `graph-theory/0422-min-cost-max-flow.md` |
| 0423* | 虚树 | 计划 | 0403,0418 | `graph-theory/0423-virtual-tree.md` |
| 0424* | 点分治 | 计划 | 0123,0417 | `graph-theory/0424-centroid-decomposition.md` |
| 0425* | SPFA 与队列优化最短路 | 计划 | 0408 | `graph-theory/0425-spfa.md` |
| 0426 | 基环树与函数图 | 计划 | 0403,0402 | `graph-theory/0426-unicyclic-functional-graphs.md` |

## 05 数学

| ID | 知识点 | 状态 | 直接前置 | 文件 |
| --- | --- | --- | --- | --- |
| 0501 | 整除、gcd 与 lcm | 草稿 | 0105 | [0501-divisibility-gcd-lcm.md](math/0501-divisibility-gcd-lcm.md) |
| 0502 | 质数与唯一分解定理 | 草稿 | 0501 | [0502-prime-factorization.md](math/0502-prime-factorization.md) |
| 0503 | 扩展欧几里得 | 草稿 | 0501 | [0503-extended-euclid.md](math/0503-extended-euclid.md) |
| 0504 | 模运算与快速幂 | 计划 | 0105,0122 | `math/0504-modular-arithmetic-fast-power.md` |
| 0505 | 筛法与质因数预处理 | 计划 | 0502 | `math/0505-sieve.md` |
| 0506 | 模逆元 | 计划 | 0503,0504 | `math/0506-modular-inverse.md` |
| 0507 | 组合数与基础计数 | 计划 | 0505,0506 | `math/0507-combinatorics.md` |
| 0508 | Euler 函数 | 计划 | 0502,0504 | `math/0508-euler-totient.md` |
| 0509 | 矩阵运算与线性变换 | 计划 | 0105,0110 | `math/0509-matrix-operations.md` |
| 0510 | CRT 与 exCRT | 草稿 | 0503,0504 | [0510-crt-and-excrt.md](math/0510-crt-and-excrt.md) |
| 0511 | 矩阵快速幂与递推加速 | 计划 | 0504,0509 | `math/0511-matrix-exponentiation.md` |
| 0512 | 概率与期望基础 | 计划 | 0105 | `math/0512-probability-expectation.md` |
| 0513 | Nim 与基础博弈论 | 计划 | 0122,0202 | `math/0513-nim-game-theory.md` |
| 0514 | XOR 线性基 | 计划 | 0122,0202 | `math/0514-xor-linear-basis.md` |
| 0515 | 高斯消元 | 计划 | 0105,0202 | `math/0515-gaussian-elimination.md` |
| 0516 | 容斥原理 | 计划 | 0507,0211 | `math/0516-inclusion-exclusion.md` |
| 0517* | NTT | 计划 | 0504,0506 | `math/0517-ntt.md` |
| 0518* | Möbius 反演 | 计划 | 0505,0508 | `math/0518-mobius-inversion.md` |
| 0519* | BSGS 与离散对数 | 计划 | 0504,0506 | `math/0519-discrete-logarithm.md` |

## 06 计算几何

| ID | 知识点 | 状态 | 直接前置 | 文件 |
| --- | --- | --- | --- | --- |
| 0601 | 坐标、点、向量与精度 | 计划 | 0104,0112,0202 | `computational-geometry/0601-points-vectors-precision.md` |
| 0602 | 点积、叉积与方向判断 | 计划 | 0601 | `computational-geometry/0602-dot-cross-orientation.md` |
| 0603 | 直线、线段与相交判定 | 计划 | 0602 | `computational-geometry/0603-lines-segments-intersections.md` |
| 0604 | 多边形面积与点的位置 | 计划 | 0602 | `computational-geometry/0604-polygon-area-point-location.md` |
| 0605 | 凸包 | 计划 | 0203,0602 | `computational-geometry/0605-convex-hull.md` |
| 0606* | 圆与圆的关系 | 计划 | 0601,0603 | `computational-geometry/0606-circles.md` |
| 0607* | 旋转卡壳 | 计划 | 0605 | `computational-geometry/0607-rotating-calipers.md` |
| 0608* | 几何扫描线 | 计划 | 0120,0214,0603 | `computational-geometry/0608-geometric-sweep-line.md` |

## 07 动态规划

| ID | 知识点 | 状态 | 直接前置 | 文件 |
| --- | --- | --- | --- | --- |
| 0701 | 状态、转移与 DP 入门 | 计划 | 0110,0201,0202 | `dynamic-programming/0701-dp-foundations.md` |
| 0702 | 线性与状态机 DP | 计划 | 0701 | `dynamic-programming/0702-linear-state-machine-dp.md` |
| 0703 | 0/1、完全与多重背包 | 计划 | 0701 | `dynamic-programming/0703-knapsack.md` |
| 0704 | 最长上升子序列 | 计划 | 0204,0702 | `dynamic-programming/0704-longest-increasing-subsequence.md` |
| 0705 | 区间 DP | 计划 | 0701 | `dynamic-programming/0705-interval-dp.md` |
| 0706 | DAG 上的动态规划 | 计划 | 0405,0701 | `dynamic-programming/0706-dag-dp.md` |
| 0707 | 树形 DP | 计划 | 0402,0701 | `dynamic-programming/0707-tree-dp.md` |
| 0708 | 状压 DP | 计划 | 0211,0701 | `dynamic-programming/0708-bitmask-dp.md` |
| 0709 | 数位 DP | 计划 | 0122,0701 | `dynamic-programming/0709-digit-dp.md` |
| 0710 | 概率与期望 DP | 计划 | 0512,0701 | `dynamic-programming/0710-probability-expectation-dp.md` |
| 0711 | 单调队列优化 DP | 计划 | 0309,0703 | `dynamic-programming/0711-monotone-queue-optimization.md` |
| 0712* | 斜率优化 DP | 计划 | 0214,0702 | `dynamic-programming/0712-convex-hull-trick.md` |
| 0713* | 分治优化 DP | 计划 | 0209,0701 | `dynamic-programming/0713-divide-conquer-optimization.md` |
| 0714* | Slope Trick | 计划 | 0208,0702 | `dynamic-programming/0714-slope-trick.md` |

## 08 字符串

| ID | 知识点 | 状态 | 直接前置 | 文件 |
| --- | --- | --- | --- | --- |
| 0801 | 字符串比较与模式匹配问题 | 计划 | 0114,0201 | `strings/0801-string-matching-foundations.md` |
| 0802 | 字符串哈希 | 计划 | 0504,0801 | `strings/0802-rolling-hash.md` |
| 0803 | KMP 与前缀函数 | 计划 | 0202,0801 | `strings/0803-kmp-prefix-function.md` |
| 0804 | Z 函数 | 计划 | 0202,0801 | `strings/0804-z-function.md` |
| 0805 | Trie | 计划 | 0111,0801 | `strings/0805-trie.md` |
| 0806 | AC 自动机 | 计划 | 0402,0803,0805 | `strings/0806-aho-corasick.md` |
| 0807 | Manacher | 计划 | 0202,0801 | `strings/0807-manacher.md` |
| 0808* | 后缀数组 | 计划 | 0206,0801 | `strings/0808-suffix-array.md` |
| 0809* | 后缀自动机 | 计划 | 0402,0805 | `strings/0809-suffix-automaton.md` |
| 0810* | 回文树 | 计划 | 0805,0807 | `strings/0810-palindromic-tree.md` |
| 0811* | 后缀树 | 计划 | 0805 | `strings/0811-suffix-tree.md` |
