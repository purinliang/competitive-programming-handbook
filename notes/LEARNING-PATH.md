# 分阶段学习路线

这条路线从 C++ 基础出发，覆盖约 Codeforces 2100 前高频、通用、值得反复使用的知识。它是 [模块目录](CATALOG.md) 中“核心教程”节点的一种拓扑排序，不包含低优先级扩展专题。

阶段不是严格 rating：同一阶段中的数学、图论、数据结构等分支可以并行学习，但表内直接前置始终先出现。标为代码路径的文章尚在计划中；可点击链接表示已有草稿或定稿正文。

## 阶段 1：C++ 基础与必要的计算机知识

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0101 | 入门：Hello World! | C++ | [cpp/hello-world.md](cpp/hello-world.md) |
| 0158 | 入门：A+B Problem | C++ | [cpp/a-plus-b-problem.md](cpp/a-plus-b-problem.md) |
| 0102 | 基本类型：整数 | C++ | [cpp/integer-types.md](cpp/integer-types.md) |
| 0103 | 基本类型：浮点数 | C++ | [cpp/floating-point-types.md](cpp/floating-point-types.md) |
| 0104 | 基本类型：字符 | C++ | `cpp/0104-character-types.md` |
| 0105 | 基本类型：布尔 | C++ | `cpp/0105-boolean-type.md` |
| 0106 | 变量：声明与初始化 | C++ | `cpp/0106-variable-declaration-initialization.md` |
| 0107 | 表达式：算术运算符 | C++ | [cpp/0107-arithmetic-operators.md](cpp/0107-arithmetic-operators.md) |
| 0108 | 表达式：比较运算符 | C++ | `cpp/0108-comparison-operators.md` |
| 0109 | 表达式：逻辑运算符 | C++ | `cpp/0109-logical-operators.md` |
| 0110 | 表达式：类型转换 | C++ | `cpp/0110-type-conversions.md` |
| 0133 | 表达式：位运算符 | C++ | `cpp/0133-bitwise-operators.md` |
| 0111 | 控制流：条件分支 | C++ | [cpp/0111-conditional-branches.md](cpp/0111-conditional-branches.md) |
| 0112 | 控制流：循环 | C++ | `cpp/0112-loops.md` |
| 0113 | 函数：定义与调用 | C++ | [cpp/0113-functions-definition-call.md](cpp/0113-functions-definition-call.md) |
| 0114 | 名称：作用域 | C++ | `cpp/0114-scope.md` |
| 0115 | 输入输出：标准输入 | C++ | [cpp/0115-standard-input.md](cpp/0115-standard-input.md) |
| 0116 | 输入输出：标准输出 | C++ | `cpp/0116-standard-output.md` |
| 0117 | 输入输出：文件重定向 | C++ | [cpp/0117-file-redirection.md](cpp/0117-file-redirection.md) |
| 0118 | 数组：一维数组 | C++ | [cpp/0118-one-dimensional-arrays.md](cpp/0118-one-dimensional-arrays.md) |
| 0119 | 数组：多维数组 | C++ | `cpp/0119-multidimensional-arrays.md` |
| 0120 | 字符串：C 字符串 | C++ | `cpp/0120-c-strings.md` |
| 0121 | 复合类型：struct | C++ | [cpp/0121-struct.md](cpp/0121-struct.md) |
| 0122 | 复合类型：union | C++ | `cpp/0122-union.md` |
| 0123 | 复合类型：enum | C++ | `cpp/0123-enum.md` |
| 0124 | 内存：字节寻址 | C++ | `cpp/0124-byte-addressing.md` |
| 0125 | 内存与别名：指针 | C++ | [cpp/0125-pointers.md](cpp/0125-pointers.md) |
| 0126 | 内存与别名：引用 | C++ | `cpp/0126-references.md` |
| 0127 | 函数：参数传递 | C++ | `cpp/0127-parameter-passing.md` |
| 0128 | 修饰符：const | C++ | [cpp/0128-const.md](cpp/0128-const.md) |
| 0129 | 修饰符：static | C++ | `cpp/0129-static.md` |
| 0130 | 内存：竞赛程序的常见分区 | C++ | `cpp/0130-competitive-program-memory-layout.md` |
| 0131 | 函数：调用栈 | C++ | `cpp/0131-function-call-stack.md` |
| 0132 | 函数：递归 | C++ | `cpp/0132-recursion.md` |

0101 先让读者运行 Hello World，0158 再用 A+B 串起整数声明、输入输出和第一次 OJ 提交；它们只建立完整的实践经验，不负责系统教授其中每一项语法。基础类型、语法和必要的机器直觉随后交错推进，不再强行分成两条路线。整数文章内聚进制字面量、位宽和二进制表示；内存知识等数组、函数和指针可用后再引入。`include`、头文件、命名空间和 `using namespace std;` 的原理不进入主路线。

## 阶段 2：STL 专题

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0134 | 工具类型：pair | C++ | `cpp/0134-pair.md` |
| 0135 | 工具类型：tuple | C++ | `cpp/0135-tuple.md` |
| 0136 | 序列容器：array | C++ | `cpp/0136-array.md` |
| 0137 | 字符串：std::string | C++ | `cpp/0137-std-string.md` |
| 0138 | 序列容器：vector | C++ | `cpp/0138-vector.md` |
| 0139 | 序列容器：deque | C++ | `cpp/0139-deque.md` |
| 0140 | STL 算法：排序 | C++ | `cpp/0140-stl-sorting.md` |
| 0141 | STL 算法：去重 | C++ | `cpp/0141-stl-deduplication.md` |
| 0142 | 容器适配器：stack | C++ | `cpp/0142-stack.md` |
| 0143 | 容器适配器：queue | C++ | `cpp/0143-queue.md` |
| 0144 | 容器适配器：priority_queue | C++ | `cpp/0144-priority-queue.md` |
| 0145 | 有序关联容器：set | C++ | `cpp/0145-set.md` |
| 0146 | 有序关联容器：multiset | C++ | `cpp/0146-multiset.md` |
| 0147 | 有序关联容器：map | C++ | `cpp/0147-map.md` |
| 0149 | 无序关联容器：unordered_set | C++ | `cpp/0149-unordered-set.md` |
| 0150 | 无序关联容器：unordered_map | C++ | `cpp/0150-unordered-map.md` |
| 0151 | 工具类型：bitset | C++ | `cpp/0151-bitset.md` |

完成本阶段后，应能独立读写普通竞赛程序，并理解后续教程中的数组、函数、递归和 STL 代码。

## 阶段 3：复杂度与基础解题工具

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

## 阶段 4：初中竞赛基础

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0501 | 整除、gcd 与 lcm | 数学 | [math/0501-divisibility-gcd-lcm.md](math/0501-divisibility-gcd-lcm.md) |
| 0502 | 质数与唯一分解定理 | 数学 | [math/0502-prime-factorization.md](math/0502-prime-factorization.md) |
| 0401 | 图：顶点与边 | 图论 | `graph-theory/vertices-and-edges.md` |
| 0431 | 图：路径与环 | 图论 | `graph-theory/paths-and-cycles.md` |
| 0432 | 图：度数 | 图论 | `graph-theory/vertex-degrees.md` |
| 0402 | 图的存储 | 图论 | `graph-theory/graph-representation.md` |
| 0433 | 树与有根树 | 图论 | `graph-theory/trees-and-rooted-trees.md` |
| 0311 | 二叉树：结构与存储 | 数据结构 | `data-structures/binary-tree-structure-and-storage.md` |
| 0434 | 树的深度优先搜索 | 图论 | `graph-theory/tree-depth-first-search.md` |
| 0435 | 树的广度优先搜索 | 图论 | `graph-theory/tree-breadth-first-search.md` |
| 0436 | 图的深度优先搜索 | 图论 | `graph-theory/graph-depth-first-search.md` |
| 0437 | 图的广度优先搜索 | 图论 | `graph-theory/graph-breadth-first-search.md` |
| 0328 | 二叉树：前序、中序与后序遍历 | 数据结构 | `data-structures/binary-tree-traversals.md` |
| 0404 | 连通块与洪水填充 | 图论 | `graph-theory/0404-connected-components.md` |
| 0405 | 拓扑排序 | 图论 | `graph-theory/0405-topological-sort.md` |
| 0406 | BFS、0-1 BFS 与多源最短路 | 图论 | `graph-theory/0406-unweighted-shortest-path.md` |
| 0411 | 二分图判定 | 图论 | `graph-theory/0411-bipartite-graph.md` |
| 0701 | 状态、转移与 DP 入门 | 动态规划 | `dynamic-programming/0701-dp-foundations.md` |
| 0702 | 线性与状态机 DP | 动态规划 | `dynamic-programming/0702-linear-state-machine-dp.md` |
| 0703 | 0/1、完全与多重背包 | 动态规划 | `dynamic-programming/0703-knapsack.md` |
| 0704 | 最长上升子序列 | 动态规划 | `dynamic-programming/0704-longest-increasing-subsequence.md` |
| 0801 | 字符串比较与字典序 | 字符串 | `strings/0801-string-comparison-lexicographic-order.md` |
| 0802 | 模式匹配问题与朴素匹配 | 字符串 | `strings/0802-naive-pattern-matching.md` |

这一阶段要建立基础数学、树与图遍历、常规 DP 和朴素字符串算法的完整直觉。线性 DP、背包和 LIS 是 DP 基础的具体落点，不留到中级阶段。

## 阶段 5：高中竞赛基础

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0503 | 扩展欧几里得 | 数学 | [math/0503-extended-euclid.md](math/0503-extended-euclid.md) |
| 0504 | 模运算与快速幂 | 数学 | `math/0504-modular-arithmetic-fast-power.md` |
| 0505 | 筛法与质因数预处理 | 数学 | `math/0505-sieve.md` |
| 0506 | 模逆元 | 数学 | `math/0506-modular-inverse.md` |
| 0507 | 组合数与基础计数 | 数学 | `math/0507-combinatorics.md` |
| 0508 | Euler 函数 | 数学 | `math/0508-euler-totient.md` |
| 0509 | 矩阵运算与线性变换 | 数学 | `math/0509-matrix-operations.md` |
| 0518 | Möbius 函数与反演 | 数学 | `math/0518-mobius-function-inversion.md` |
| 0304 | 线段树基础 | 数据结构 | [data-structures/0304-segment-tree.md](data-structures/0304-segment-tree.md) |
| 0306 | 树状数组 | 数据结构 | [data-structures/0306-fenwick-tree.md](data-structures/0306-fenwick-tree.md) |
| 0307 | 并查集 | 数据结构 | `data-structures/0307-disjoint-set-union.md` |
| 0308 | 稀疏表 ST | 数据结构 | `data-structures/0308-sparse-table.md` |
| 0309 | 单调栈与单调队列 | 数据结构 | `data-structures/0309-monotonic-stack-queue.md` |
| 0310 | 带权并查集 | 数据结构 | `data-structures/0310-weighted-disjoint-set.md` |
| 0403 | 倍增 LCA | 图论 | [graph-theory/0403-lca-binary-lifting.md](graph-theory/0403-lca-binary-lifting.md) |
| 0416 | 欧拉路径、欧拉回路与欧拉图 | 图论 | `graph-theory/eulerian-paths-and-circuits.md` |
| 0438 | 哈密顿路径、哈密顿回路与哈密顿图 | 图论 | `graph-theory/hamiltonian-paths-and-circuits.md` |
| 0417 | 树的直径与中心 | 图论 | `graph-theory/0417-tree-diameter-center.md` |
| 0418 | DFS 序、子树区间与树上差分 | 图论 | `graph-theory/0418-tree-euler-tour-difference.md` |
| 0601 | 坐标、点、向量与精度 | 计算几何 | `computational-geometry/0601-points-vectors-precision.md` |
| 0602 | 点积、叉积与方向判断 | 计算几何 | `computational-geometry/0602-dot-cross-orientation.md` |

这些主题仍可以按数据结构、图论、数学和几何分支并行学习；表内依赖顺序保证后续文章只引用已经出现的基础。

## 阶段 6：经典中级算法

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
| 0705 | 区间 DP | 动态规划 | `dynamic-programming/0705-interval-dp.md` |
| 0706 | DAG 上的动态规划 | 动态规划 | `dynamic-programming/0706-dag-dp.md` |
| 0707 | 树形 DP 与换根 DP | 动态规划 | `dynamic-programming/0707-tree-rerooting-dp.md` |
| 0803 | 字符串哈希 | 字符串 | `strings/0803-rolling-hash.md` |
| 0804 | KMP 与前缀函数 | 字符串 | `strings/0804-kmp-prefix-function.md` |
| 0805 | Z 函数 | 字符串 | `strings/0805-z-function.md` |
| 0806 | Trie | 字符串 | `strings/0806-trie.md` |
| 0603 | 直线、线段与相交判定 | 计算几何 | `computational-geometry/0603-lines-segments-intersections.md` |
| 0604 | 多边形面积与点的位置 | 计算几何 | `computational-geometry/0604-polygon-area-point-location.md` |

## 阶段 7：约 2100 前的高阶主干

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
| 0807 | AC 自动机 | 字符串 | `strings/0807-aho-corasick.md` |
| 0808 | Manacher | 字符串 | `strings/0808-manacher.md` |
| 0605 | 凸包 | 计算几何 | `computational-geometry/0605-convex-hull.md` |

完成阶段 7 不意味着必须学习模块目录中的全部扩展。遇到具体题目或产生兴趣时，再从基础文章末尾或模块目录进入相应专题。
