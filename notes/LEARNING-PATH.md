# 分阶段学习路线

这条路线从 C++ 基础出发，覆盖约 Codeforces 2100 前高频、通用、值得反复使用的知识。它是 [模块目录](CATALOG.md) 中“核心教程”节点的一种拓扑排序，不包含低优先级扩展专题。

阶段不是严格 rating：同一阶段中的数学、图论、数据结构等分支可以并行学习，但表内直接前置始终先出现。标为代码路径的文章尚在计划中；可点击链接表示已有草稿或已固化正文。

## 阶段 0：读写竞赛 C++

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0101 | 程序入口与竞赛代码骨架 | C++ | [cpp/0101-program-entry-and-skeleton.md](cpp/0101-program-entry-and-skeleton.md) |
| 0102 | include 与头文件 | C++ | [cpp/0102-include.md](cpp/0102-include.md) |
| 0103 | 命名空间与 std | C++ | [cpp/0103-namespace-and-std.md](cpp/0103-namespace-and-std.md) |
| 0104 | 基本类型、范围与 ASCII | C++ | [cpp/0104-basic-types.md](cpp/0104-basic-types.md) |
| 0105 | 运算符与类型转换 | C++ | [cpp/0105-operators-and-conversions.md](cpp/0105-operators-and-conversions.md) |
| 0106 | 分支、循环与控制流 | C++ | [cpp/0106-control-flow.md](cpp/0106-control-flow.md) |
| 0107 | 函数、参数与作用域 | C++ | [cpp/0107-functions.md](cpp/0107-functions.md) |
| 0108 | 标准输入输出 | C++ | [cpp/0108-io.md](cpp/0108-io.md) |
| 0109 | 文件输入输出 | C++ | [cpp/0109-file-io.md](cpp/0109-file-io.md) |
| 0110 | 数组、二维数组与 C 字符串 | C++ | [cpp/0110-arrays-and-strings.md](cpp/0110-arrays-and-strings.md) |
| 0111 | 指针、引用与传参 | C++ | [cpp/0111-pointers-references-parameters.md](cpp/0111-pointers-references-parameters.md) |
| 0112 | struct、enum 与复合类型 | C++ | [cpp/0112-composite-types.md](cpp/0112-composite-types.md) |
| 0113 | const、static 与常用修饰符 | C++ | [cpp/0113-modifier-keywords.md](cpp/0113-modifier-keywords.md) |
| 0114 | 位运算、二进制表示与 bitset | C++ | `cpp/0114-bit-operations-and-bitset.md` |
| 0115 | 递归与调用栈 | C++ | `cpp/0115-recursion-and-call-stack.md` |
| 0116 | pair、tuple 与 array | C++ | `cpp/0116-pair-tuple-array.md` |
| 0117 | std::string | C++ | `cpp/0117-std-string.md` |
| 0118 | vector 与迭代器 | C++ | `cpp/0118-vector-and-iterators.md` |
| 0119 | STL 算法与比较器 | C++ | `cpp/0119-stl-algorithms-and-comparators.md` |
| 0120 | stack | C++ | `cpp/0120-stack.md` |
| 0121 | queue 与 deque | C++ | `cpp/0121-queue-and-deque.md` |
| 0122 | priority_queue | C++ | `cpp/0122-priority-queue.md` |
| 0123 | set、multiset 与 map | C++ | `cpp/0123-ordered-associative-containers.md` |
| 0124 | unordered_set 与 unordered_map | C++ | `cpp/0124-unordered-associative-containers.md` |

完成本阶段后，应能独立读写普通竞赛程序，并理解后续教程中的数组、函数、递归和 STL 代码。

## 阶段 1：复杂度与基础解题工具

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0201 | 时间空间复杂度 | 基础算法 | `algorithm-basics/0201-complexity.md` |
| 0202 | 不变量、正确性与边界 | 基础算法 | `algorithm-basics/0202-invariants-correctness.md` |
| 0203 | 排序原理与常用排序 | 基础算法 | `algorithm-basics/0203-sorting.md` |
| 0204 | 二分查找与答案二分 | 基础算法 | `algorithm-basics/0204-binary-search.md` |
| 0205 | 双指针与滑动窗口 | 基础算法 | `algorithm-basics/0205-two-pointers-sliding-window.md` |
| 0206 | 离散化 | 基础算法 | `algorithm-basics/0206-coordinate-compression.md` |
| 0207 | 前缀和与差分 | 基础算法 | [algorithm-basics/0207-prefix-sums-and-difference.md](algorithm-basics/0207-prefix-sums-and-difference.md) |
| 0208 | 贪心的选择与证明 | 基础算法 | `algorithm-basics/0208-greedy.md` |
| 0209 | 分治 | 基础算法 | `algorithm-basics/0209-divide-and-conquer.md` |
| 0210 | 枚举、回溯与剪枝 | 基础算法 | `algorithm-basics/0210-enumeration-backtracking.md` |
| 0211 | 子集与位掩码枚举 | 基础算法 | `algorithm-basics/0211-bitmask-enumeration.md` |
| 0301 | 单向、双向与环形链表 | 数据结构 | `data-structures/0301-linked-lists.md` |
| 0302 | 二叉堆 | 数据结构 | `data-structures/0302-binary-heap.md` |
| 0303 | 哈希表 | 数据结构 | `data-structures/0303-hash-table.md` |

本阶段重点是把暴力复杂度、数组预处理、边界移动和常用容器连接起来，而不是记忆孤立模板。

## 阶段 2：基础数据结构、图、数学与 DP

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0501 | 整除、gcd 与 lcm | 数学 | [math/0501-divisibility-gcd-lcm.md](math/0501-divisibility-gcd-lcm.md) |
| 0502 | 质数与唯一分解定理 | 数学 | [math/0502-prime-factorization.md](math/0502-prime-factorization.md) |
| 0503 | 扩展欧几里得 | 数学 | [math/0503-extended-euclid.md](math/0503-extended-euclid.md) |
| 0504 | 模运算与快速幂 | 数学 | `math/0504-modular-arithmetic-fast-power.md` |
| 0505 | 筛法与质因数预处理 | 数学 | `math/0505-sieve.md` |
| 0506 | 模逆元 | 数学 | `math/0506-modular-inverse.md` |
| 0507 | 组合数与基础计数 | 数学 | `math/0507-combinatorics.md` |
| 0508 | Euler 函数 | 数学 | `math/0508-euler-totient.md` |
| 0304 | 线段树基础 | 数据结构 | [data-structures/0304-segment-tree.md](data-structures/0304-segment-tree.md) |
| 0306 | 树状数组 | 数据结构 | [data-structures/0306-fenwick-tree.md](data-structures/0306-fenwick-tree.md) |
| 0307 | 并查集 | 数据结构 | `data-structures/0307-disjoint-set-union.md` |
| 0308 | 稀疏表 ST | 数据结构 | `data-structures/0308-sparse-table.md` |
| 0309 | 单调栈与单调队列 | 数据结构 | `data-structures/0309-monotonic-stack-queue.md` |
| 0310 | 带权并查集 | 数据结构 | `data-structures/0310-weighted-disjoint-set.md` |
| 0311 | 二叉树与前中后序遍历 | 数据结构 | `data-structures/0311-binary-tree-traversals.md` |
| 0401 | 图的存储与边模型 | 图论 | `graph-theory/0401-graph-representation.md` |
| 0402 | DFS、BFS 与生成树 | 图论 | `graph-theory/0402-dfs-bfs.md` |
| 0403 | 倍增 LCA | 图论 | [graph-theory/0403-lca-binary-lifting.md](graph-theory/0403-lca-binary-lifting.md) |
| 0404 | 连通块与洪水填充 | 图论 | `graph-theory/0404-connected-components.md` |
| 0405 | 拓扑排序 | 图论 | `graph-theory/0405-topological-sort.md` |
| 0406 | BFS、0-1 BFS 与多源最短路 | 图论 | `graph-theory/0406-unweighted-shortest-path.md` |
| 0411 | 二分图判定 | 图论 | `graph-theory/0411-bipartite-graph.md` |
| 0417 | 树的直径与中心 | 图论 | `graph-theory/0417-tree-diameter-center.md` |
| 0418 | DFS 序、子树区间与树上差分 | 图论 | `graph-theory/0418-tree-euler-tour-difference.md` |
| 0701 | 状态、转移与 DP 入门 | 动态规划 | `dynamic-programming/0701-dp-foundations.md` |
| 0801 | 字符串比较与模式匹配问题 | 字符串 | `strings/0801-string-matching-foundations.md` |
| 0601 | 坐标、点、向量与精度 | 计算几何 | `computational-geometry/0601-points-vectors-precision.md` |
| 0602 | 点积、叉积与方向判断 | 计算几何 | `computational-geometry/0602-dot-cross-orientation.md` |
| 0509 | 矩阵运算与线性变换 | 数学 | `math/0509-matrix-operations.md` |

这些分支可以并行学习。进入下一阶段前，应至少掌握一种区间结构、图遍历、基础数论和 DP 状态表达。

## 阶段 3：经典中级算法

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0212 | Meet-in-the-Middle | 基础算法 | `algorithm-basics/0212-meet-in-the-middle.md` |
| 0213 | 离线算法 | 基础算法 | `algorithm-basics/0213-offline-algorithms.md` |
| 0214 | 扫描线与事件排序 | 基础算法 | `algorithm-basics/0214-sweep-line.md` |
| 0510 | CRT 与 exCRT | 数学 | [math/0510-crt-and-excrt.md](math/0510-crt-and-excrt.md) |
| 0511 | 矩阵快速幂与递推加速 | 数学 | `math/0511-matrix-exponentiation.md` |
| 0512 | 概率与期望基础 | 数学 | `math/0512-probability-expectation.md` |
| 0513 | Nim、SG 函数与基础博弈论 | 数学 | `math/0513-nim-sg-game-theory.md` |
| 0407 | Dijkstra | 图论 | `graph-theory/0407-dijkstra.md` |
| 0408 | Bellman-Ford 与负环 | 图论 | `graph-theory/0408-bellman-ford.md` |
| 0409 | Floyd 与传递闭包 | 图论 | `graph-theory/0409-floyd-warshall.md` |
| 0410 | 最小生成树 | 图论 | `graph-theory/0410-minimum-spanning-tree.md` |
| 0412 | 二分图匹配 | 图论 | `graph-theory/0412-bipartite-matching.md` |
| 0413 | 强连通分量 | 图论 | `graph-theory/0413-strongly-connected-components.md` |
| 0414 | 割点与桥 | 图论 | `graph-theory/0414-articulation-points-bridges.md` |
| 0416 | 欧拉路径与欧拉回路 | 图论 | `graph-theory/0416-euler-trail-circuit.md` |
| 0702 | 线性与状态机 DP | 动态规划 | `dynamic-programming/0702-linear-state-machine-dp.md` |
| 0703 | 0/1、完全与多重背包 | 动态规划 | `dynamic-programming/0703-knapsack.md` |
| 0704 | 最长上升子序列 | 动态规划 | `dynamic-programming/0704-longest-increasing-subsequence.md` |
| 0705 | 区间 DP | 动态规划 | `dynamic-programming/0705-interval-dp.md` |
| 0706 | DAG 上的动态规划 | 动态规划 | `dynamic-programming/0706-dag-dp.md` |
| 0707 | 树形 DP 与换根 DP | 动态规划 | `dynamic-programming/0707-tree-rerooting-dp.md` |
| 0802 | 字符串哈希 | 字符串 | `strings/0802-rolling-hash.md` |
| 0803 | KMP 与前缀函数 | 字符串 | `strings/0803-kmp-prefix-function.md` |
| 0804 | Z 函数 | 字符串 | `strings/0804-z-function.md` |
| 0805 | Trie | 字符串 | `strings/0805-trie.md` |
| 0603 | 直线、线段与相交判定 | 计算几何 | `computational-geometry/0603-lines-segments-intersections.md` |
| 0604 | 多边形面积与点的位置 | 计算几何 | `computational-geometry/0604-polygon-area-point-location.md` |

## 阶段 4：约 2100 前的高阶主干

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0514 | XOR 线性基 | 数学 | `math/0514-xor-linear-basis.md` |
| 0515 | 高斯消元 | 数学 | `math/0515-gaussian-elimination.md` |
| 0516 | 容斥原理 | 数学 | `math/0516-inclusion-exclusion.md` |
| 0419 | 树链剖分 | 图论 | `graph-theory/0419-heavy-light-decomposition.md` |
| 0420 | 2-SAT | 图论 | `graph-theory/0420-two-sat.md` |
| 0421 | Dinic 最大流 | 图论 | `graph-theory/0421-dinic-max-flow.md` |
| 0426 | 基环树与函数图 | 图论 | `graph-theory/0426-unicyclic-functional-graphs.md` |
| 0429 | 分层图与状态最短路 | 图论 | `graph-theory/0429-layered-state-shortest-path.md` |
| 0708 | 状压 DP | 动态规划 | `dynamic-programming/0708-bitmask-dp.md` |
| 0709 | 数位 DP | 动态规划 | `dynamic-programming/0709-digit-dp.md` |
| 0710 | 概率与期望 DP | 动态规划 | `dynamic-programming/0710-probability-expectation-dp.md` |
| 0711 | 单调队列优化 DP | 动态规划 | `dynamic-programming/0711-monotone-queue-optimization.md` |
| 0806 | AC 自动机 | 字符串 | `strings/0806-aho-corasick.md` |
| 0807 | Manacher | 字符串 | `strings/0807-manacher.md` |
| 0605 | 凸包 | 计算几何 | `computational-geometry/0605-convex-hull.md` |

完成阶段 4 不意味着必须学习模块目录中的全部扩展。遇到具体题目或产生兴趣时，再从基础文章末尾或模块目录进入相应专题。
