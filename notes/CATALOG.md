# 按模块浏览

这里是教程正文的唯一知识注册表。文章 ID 按模块稳定编号，不表示学习先后；核心教程的推荐顺序见 [LEARNING-PATH.md](LEARNING-PATH.md)。

四位数字 ID 表示核心教程，带 `*` 的 ID 表示独立扩展专题。直接配套某篇基础文章的扩展使用 `e1`、`e2` 等后缀并共享基础编号，例如 `0102e1`；配套扩展不进入核心学习路线，也不占用新的四位编号。`计划`节点尚未创建文件，因此文件列只显示预定路径；`草稿`和`定稿`节点使用可点击链接。正文尚未齐全时不维护前置编号，等实际引用稳定后再统一梳理。

新规范建立前形成的遗留草稿已经全部完成首次正式修订；下方空标记保留给目录校验脚本。

<!-- legacy-drafts: -->

## 01 C++ 基础

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0101 | 入门：Hello World! | 定稿 | [hello-world.md](cpp/hello-world.md) |
| 0102 | 基本类型：整数 | 定稿 | [integer-types.md](cpp/integer-types.md) |
| 0102e1 | 基础：位、字节与存储单位 | 定稿 | [bits-bytes-and-storage-units.md](cpp/bits-bytes-and-storage-units.md) |
| 0102e2 | 基本类型：整数的二进制表示 | 定稿 | [signed-integer-representations.md](cpp/signed-integer-representations.md) |
| 0102e3 | 基本类型：整数的位宽与平台差异 | 定稿 | [integer-type-widths.md](cpp/integer-type-widths.md) |
| 0103 | 基本类型：浮点数 | 定稿 | [floating-point-types.md](cpp/floating-point-types.md) |
| 0103e1 | 浮点数表示：IEEE 754 | 定稿 | [ieee-754.md](cpp/ieee-754.md) |
| 0104 | 基本类型：字符 | 计划 | `cpp/0104-character-types.md` |
| 0105 | 基本类型：布尔 | 计划 | `cpp/0105-boolean-type.md` |
| 0106 | 变量：声明与初始化 | 计划 | `cpp/0106-variable-declaration-initialization.md` |
| 0107 | 表达式：算术运算符 | 定稿 | [arithmetic-operators.md](cpp/arithmetic-operators.md) |
| 0108 | 表达式：比较运算符 | 计划 | `cpp/0108-comparison-operators.md` |
| 0109 | 表达式：逻辑运算符 | 计划 | `cpp/0109-logical-operators.md` |
| 0110 | 表达式：类型转换 | 计划 | `cpp/0110-type-conversions.md` |
| 0111 | 控制流：条件分支 | 定稿 | [conditional-branches.md](cpp/conditional-branches.md) |
| 0112 | 控制流：循环 | 计划 | `cpp/0112-loops.md` |
| 0113 | 函数：定义与调用 | 定稿 | [function-definition-and-calls.md](cpp/function-definition-and-calls.md) |
| 0114 | 名称：作用域 | 计划 | `cpp/0114-scope.md` |
| 0115 | 输入输出：标准输入 | 定稿 | [standard-input.md](cpp/standard-input.md) |
| 0116 | 输入输出：标准输出 | 计划 | `cpp/0116-standard-output.md` |
| 0117 | 输入输出：文件重定向 | 定稿 | [file-redirection.md](cpp/file-redirection.md) |
| 0118 | 数组：一维数组 | 定稿 | [one-dimensional-arrays.md](cpp/one-dimensional-arrays.md) |
| 0119 | 数组：多维数组 | 计划 | `cpp/0119-multidimensional-arrays.md` |
| 0120 | 字符串：C 字符串 | 计划 | `cpp/0120-c-strings.md` |
| 0121 | 复合类型：struct | 定稿 | [struct.md](cpp/struct.md) |
| 0122 | 复合类型：union | 计划 | `cpp/0122-union.md` |
| 0123 | 复合类型：enum | 计划 | `cpp/0123-enum.md` |
| 0124 | 内存：字节寻址 | 计划 | `cpp/0124-byte-addressing.md` |
| 0125 | 内存与别名：指针 | 定稿 | [pointers.md](cpp/pointers.md) |
| 0126 | 内存与别名：引用 | 计划 | `cpp/0126-references.md` |
| 0127 | 函数：参数传递 | 计划 | `cpp/0127-parameter-passing.md` |
| 0128 | 修饰符：const | 定稿 | [const.md](cpp/const.md) |
| 0129 | 修饰符：static | 计划 | `cpp/0129-static.md` |
| 0130 | 内存：竞赛程序的常见分区 | 计划 | `cpp/0130-competitive-program-memory-layout.md` |
| 0131 | 函数：调用栈 | 计划 | `cpp/0131-function-call-stack.md` |
| 0132 | 函数：递归 | 计划 | `cpp/0132-recursion.md` |
| 0133 | 表达式：位运算符 | 计划 | `cpp/0133-bitwise-operators.md` |
| 0134 | 工具类型：pair | 计划 | `cpp/0134-pair.md` |
| 0135 | 工具类型：tuple | 计划 | `cpp/0135-tuple.md` |
| 0136 | 序列容器：array | 计划 | `cpp/0136-array.md` |
| 0137 | 字符串：string | 计划 | `cpp/0137-std-string.md` |
| 0138 | 序列容器：vector | 计划 | `cpp/0138-vector.md` |
| 0139 | 序列容器：deque | 计划 | `cpp/0139-deque.md` |
| 0140 | STL 算法：排序 | 计划 | `cpp/0140-stl-sorting.md` |
| 0141 | STL 算法：去重 | 计划 | `cpp/0141-stl-deduplication.md` |
| 0142 | 容器适配器：stack | 计划 | `cpp/0142-stack.md` |
| 0143 | 容器适配器：queue | 计划 | `cpp/0143-queue.md` |
| 0144 | 容器适配器：priority_queue | 计划 | `cpp/0144-priority-queue.md` |
| 0145 | 有序关联容器：set | 计划 | `cpp/0145-set.md` |
| 0146 | 有序关联容器：multiset | 计划 | `cpp/0146-multiset.md` |
| 0147 | 有序关联容器：map | 计划 | `cpp/0147-map.md` |
| 0148 | 有序关联容器：multimap | 计划 | `cpp/0148-multimap.md` |
| 0149 | 无序关联容器：unordered_set | 计划 | `cpp/0149-unordered-set.md` |
| 0150 | 无序关联容器：unordered_map | 计划 | `cpp/0150-unordered-map.md` |
| 0151 | 工具类型：bitset | 计划 | `cpp/0151-bitset.md` |
| 0152* | 预处理：include | 定稿 | [include.md](cpp/include.md) |
| 0153* | 名称：命名空间与 std | 定稿 | [namespace-and-std.md](cpp/namespace-and-std.md) |
| 0154* | 修饰符：inline | 计划 | `cpp/0154-inline.md` |
| 0155* | 修饰符：volatile | 计划 | `cpp/0155-volatile.md` |
| 0156* | 扩展容器：order-statistics tree（GNU PBDS） | 计划 | `cpp/0156-gnu-pbds.md` |
| 0157* | C++ 对象：生命周期 | 计划 | `cpp/0157-object-lifetime.md` |
| 0158 | 入门：A+B Problem | 定稿 | [a-plus-b-problem.md](cpp/a-plus-b-problem.md) |

## 02 基础算法

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0201 | 时间空间复杂度 | 计划 | `algorithm-basics/0201-complexity.md` |
| 0203 | 排序：基础排序 | 计划 | `algorithm-basics/0203-sorting.md` |
| 0204 | 查找：二分查找 | 计划 | `algorithm-basics/0204-binary-search.md` |
| 0205 | 双指针 | 计划 | `algorithm-basics/0205-two-pointers.md` |
| 0206 | 离散化 | 计划 | `algorithm-basics/0206-coordinate-compression.md` |
| 0207 | 前缀和 | 定稿 | [prefix-sums.md](algorithm-basics/prefix-sums.md) |
| 0208 | 贪心：选择与证明 | 计划 | `algorithm-basics/0208-greedy.md` |
| 0209 | 分治：基础 | 计划 | `algorithm-basics/0209-divide-and-conquer.md` |
| 0210 | 枚举 | 计划 | `algorithm-basics/0210-enumeration.md` |
| 0211 | 枚举：子集与位掩码 | 计划 | `algorithm-basics/0211-bitmask-enumeration.md` |
| 0212 | 枚举：Meet-in-the-Middle | 计划 | `algorithm-basics/0212-meet-in-the-middle.md` |
| 0213 | 离线算法 | 计划 | `algorithm-basics/0213-offline-algorithms.md` |
| 0214 | 扫描线与事件排序 | 计划 | `algorithm-basics/0214-sweep-line.md` |
| 0215* | 三分搜索 | 计划 | `algorithm-basics/0215-ternary-search.md` |
| 0216* | 随机化算法 | 计划 | `algorithm-basics/0216-randomized-algorithms.md` |
| 0217* | 整体二分与并行二分 | 计划 | `algorithm-basics/0217-parallel-binary-search.md` |
| 0218* | CDQ 分治 | 计划 | `algorithm-basics/0218-cdq-divide-and-conquer.md` |
| 0219 | 二分答案 | 计划 | `algorithm-basics/0219-binary-search-on-answer.md` |
| 0220 | 双指针：滑动窗口 | 计划 | `algorithm-basics/0220-sliding-window.md` |
| 0221 | 差分 | 计划 | `algorithm-basics/0221-difference-array.md` |
| 0222 | 模拟 | 计划 | `algorithm-basics/0222-simulation.md` |
| 0223 | 数组 | 计划 | `algorithm-basics/0223-array.md` |
| 0224 | 链表 | 计划 | `algorithm-basics/0224-linked-list.md` |
| 0225 | 栈 | 计划 | `algorithm-basics/0225-stack.md` |
| 0226 | 队列 | 计划 | `algorithm-basics/0226-queue.md` |
| 0227 | 二叉堆 | 计划 | `algorithm-basics/0227-binary-heap.md` |
| 0228 | 哈希表 | 计划 | `algorithm-basics/0228-hash-table.md` |
| 0229 | 单调栈 | 计划 | `algorithm-basics/0229-monotonic-stack.md` |
| 0230 | 单调队列 | 计划 | `algorithm-basics/0230-monotonic-queue.md` |
| 0231 | 排序：快速排序 | 计划 | `algorithm-basics/0231-quicksort.md` |
| 0232 | 排序：归并排序 | 计划 | `algorithm-basics/0232-merge-sort.md` |
| 0233* | 排序：堆排序 | 计划 | `algorithm-basics/0233-heap-sort.md` |
| 0234* | 排序：基数排序 | 计划 | `algorithm-basics/0234-radix-sort.md` |
| 0235* | 排序：桶排序 | 计划 | `algorithm-basics/0235-bucket-sort.md` |

## 03 数据结构

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0304 | 线段树：基础 | 定稿 | [data-structures/segment-tree.md](data-structures/segment-tree.md) |
| 0305* | 线段树：懒标记的组合顺序 | 定稿 | [data-structures/segment-tree-lazy-tags.md](data-structures/segment-tree-lazy-tags.md) |
| 0306 | 树状数组：基础 | 定稿 | [data-structures/fenwick-tree.md](data-structures/fenwick-tree.md) |
| 0307 | 并查集 | 计划 | `data-structures/0307-disjoint-set-union.md` |
| 0308 | 稀疏表 ST | 计划 | `data-structures/0308-sparse-table.md` |
| 0310 | 带权并查集 | 计划 | `data-structures/0310-weighted-disjoint-set.md` |
| 0311 | 二叉树：结构与存储 | 草稿 | [binary-tree-structure-and-storage.md](data-structures/binary-tree-structure-and-storage.md) |
| 0312* | 可撤销并查集 | 计划 | `data-structures/0312-rollback-disjoint-set.md` |
| 0313* | 分块 | 计划 | `data-structures/0313-square-root-decomposition.md` |
| 0314* | 莫队算法 | 计划 | `data-structures/0314-mo-algorithm.md` |
| 0315* | 线段树二分与树上下降 | 计划 | `data-structures/0315-segment-tree-descent.md` |
| 0316* | 可持久化线段树 | 计划 | `data-structures/0316-persistent-segment-tree.md` |
| 0317* | 动态开点线段树 | 计划 | `data-structures/0317-dynamic-segment-tree.md` |
| 0318* | Segment Tree Beats | 计划 | `data-structures/0318-segment-tree-beats.md` |
| 0319* | 树状数组的区间修改变体 | 计划 | `data-structures/0319-fenwick-range-updates.md` |
| 0320* | 树状数组维护区间最值 | 计划 | `data-structures/0320-fenwick-range-extrema.md` |
| 0321* | 左偏树 | 计划 | `data-structures/0321-leftist-tree.md` |
| 0322* | Treap 与随机平衡树 | 计划 | `data-structures/0322-treap.md` |
| 0323* | Splay | 计划 | `data-structures/0323-splay.md` |
| 0324* | B 树与 B+ 树 | 计划 | `data-structures/0324-b-tree-and-b-plus-tree.md` |
| 0325* | 笛卡尔树 | 计划 | `data-structures/0325-cartesian-tree.md` |
| 0326* | Wavelet Matrix | 计划 | `data-structures/0326-wavelet-matrix.md` |
| 0327* | 启发式合并（small-to-large） | 计划 | `data-structures/0327-small-to-large-merging.md` |
| 0328 | 二叉树的遍历：前序、中序与后序 | 草稿 | [binary-tree-traversals.md](data-structures/binary-tree-traversals.md) |
| 0330* | 斜堆 | 计划 | `data-structures/0330-skew-heap.md` |
| 0331* | 配对堆 | 计划 | `data-structures/0331-pairing-heap.md` |

## 04 图论

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0401 | 图：点与边 | 定稿 | [vertices-and-edges.md](graph-theory/vertices-and-edges.md) |
| 0402 | 图的存储：基础概念 | 定稿 | [graph-representation.md](graph-theory/graph-representation.md) |
| 0403 | 树上查询：倍增 LCA | 定稿 | [lca-binary-lifting.md](graph-theory/lca-binary-lifting.md) |
| 0404 | 图的遍历：连通块 | 计划 | `graph-theory/0404-connected-components.md` |
| 0405 | 有向无环图：拓扑排序 | 计划 | `graph-theory/0405-topological-sort.md` |
| 0406 | 图的遍历：多源 BFS | 计划 | `graph-theory/0406-multi-source-bfs.md` |
| 0407 | 最短路：Dijkstra | 计划 | `graph-theory/0407-dijkstra.md` |
| 0408 | 最短路：Bellman–Ford 与负环 | 计划 | `graph-theory/0408-bellman-ford.md` |
| 0409 | 最短路：Floyd–Warshall | 计划 | `graph-theory/0409-floyd-warshall.md` |
| 0410 | 最小生成树：Kruskal | 计划 | `graph-theory/0410-kruskal.md` |
| 0411 | 二分图：判定 | 计划 | `graph-theory/0411-bipartite-graph.md` |
| 0412* | 二分图：最大匹配 | 计划 | `graph-theory/0412-bipartite-matching.md` |
| 0413 | 有向图：强连通分量 | 计划 | `graph-theory/0413-strongly-connected-components.md` |
| 0414 | 无向图：割点与桥 | 计划 | `graph-theory/0414-articulation-points-bridges.md` |
| 0415* | 无向图：双连通分量与圆方树 | 计划 | `graph-theory/0415-biconnected-components-block-cut-tree.md` |
| 0416 | 欧拉问题：路径、回路与图 | 草稿 | [eulerian-paths-and-circuits.md](graph-theory/eulerian-paths-and-circuits.md) |
| 0417 | 树：直径与中心 | 计划 | `graph-theory/0417-tree-diameter-center.md` |
| 0418 | 树的遍历：DFS 序与子树区间 | 计划 | `graph-theory/0418-tree-euler-tour.md` |
| 0419 | 树上数据结构：树链剖分 | 计划 | `graph-theory/0419-heavy-light-decomposition.md` |
| 0420* | 2-SAT | 计划 | `graph-theory/0420-two-sat.md` |
| 0421* | 网络流：Dinic | 计划 | `graph-theory/0421-dinic-max-flow.md` |
| 0422* | 最小费用最大流 | 计划 | `graph-theory/0422-min-cost-max-flow.md` |
| 0423* | 虚树 | 计划 | `graph-theory/0423-virtual-tree.md` |
| 0424* | 点分治 | 计划 | `graph-theory/0424-centroid-decomposition.md` |
| 0425* | SPFA 与队列优化最短路 | 计划 | `graph-theory/0425-spfa.md` |
| 0426 | 图：基环树 | 计划 | `graph-theory/0426-unicyclic-graph.md` |
| 0427* | DSU on Tree | 计划 | `graph-theory/0427-dsu-on-tree.md` |
| 0428* | 差分约束 | 计划 | `graph-theory/0428-difference-constraints.md` |
| 0429 | 最短路：分层图与状态图 | 计划 | `graph-theory/0429-layered-state-shortest-path.md` |
| 0430* | 树哈希 | 计划 | `graph-theory/0430-tree-hashing.md` |
| 0431 | 图：路径与环 | 定稿 | [paths-and-cycles.md](graph-theory/paths-and-cycles.md) |
| 0432 | 图：度数 | 定稿 | [vertex-degrees.md](graph-theory/vertex-degrees.md) |
| 0433 | 树：无根树 | 草稿 | [unrooted-trees.md](graph-theory/unrooted-trees.md) |
| 0434 | 树的遍历：深度优先搜索（DFS） | 草稿 | [tree-depth-first-search.md](graph-theory/tree-depth-first-search.md) |
| 0435 | 树的遍历：广度优先搜索（BFS） | 草稿 | [tree-breadth-first-search.md](graph-theory/tree-breadth-first-search.md) |
| 0436 | 图的遍历：深度优先搜索（DFS） | 草稿 | [graph-depth-first-search.md](graph-theory/graph-depth-first-search.md) |
| 0437 | 图的遍历：广度优先搜索（BFS） | 草稿 | [graph-breadth-first-search.md](graph-theory/graph-breadth-first-search.md) |
| 0438 | 哈密顿问题：路径、回路与图 | 草稿 | [hamiltonian-paths-and-circuits.md](graph-theory/hamiltonian-paths-and-circuits.md) |
| 0438e1 | 哈密顿问题：小规模回溯 | 草稿 | [hamiltonian-backtracking.md](graph-theory/hamiltonian-backtracking.md) |
| 0439 | 图的存储：邻接表（vector 实现） | 定稿 | [vector-adjacency-list.md](graph-theory/vector-adjacency-list.md) |
| 0440 | 图的存储：邻接表（链式前向星实现） | 草稿 | [chained-forward-star.md](graph-theory/chained-forward-star.md) |
| 0441 | 图的存储：边集 | 草稿 | [edge-list.md](graph-theory/edge-list.md) |
| 0442 | 树：有根树 | 草稿 | [rooted-trees.md](graph-theory/rooted-trees.md) |
| 0443 | 搜索：DFS、回溯与剪枝 | 计划 | `graph-theory/0443-dfs-backtracking-pruning.md` |
| 0444 | 最短路：0-1 BFS | 计划 | `graph-theory/0444-zero-one-bfs.md` |
| 0445 | 树：重心 | 计划 | `graph-theory/0445-tree-centroid.md` |
| 0446 | 树上技巧：树上差分 | 计划 | `graph-theory/0446-tree-difference.md` |
| 0447 | 图：函数图 | 计划 | `graph-theory/0447-functional-graph.md` |
| 0448 | 最小生成树：Prim | 计划 | `graph-theory/0448-prim.md` |

## 05 数学

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0501 | 数论：整除 | 草稿 | [divisibility.md](math/divisibility.md) |
| 0502 | 数论：质数 | 草稿 | [prime-numbers.md](math/prime-numbers.md) |
| 0503 | 数论：扩展欧几里得算法 | 草稿 | [extended-euclidean-algorithm.md](math/extended-euclidean-algorithm.md) |
| 0504 | 模运算与快速幂 | 计划 | `math/0504-modular-arithmetic-fast-power.md` |
| 0505 | 筛法与质因数预处理 | 计划 | `math/0505-sieve.md` |
| 0506 | 模逆元 | 计划 | `math/0506-modular-inverse.md` |
| 0507 | 组合数与基础计数 | 计划 | `math/0507-combinatorics.md` |
| 0508 | 欧拉函数 | 计划 | `math/0508-euler-totient.md` |
| 0509 | 矩阵运算与线性变换 | 计划 | `math/0509-matrix-operations.md` |
| 0510 | 数论：中国剩余定理（CRT） | 草稿 | [chinese-remainder-theorem.md](math/chinese-remainder-theorem.md) |
| 0511 | 矩阵快速幂与递推加速 | 计划 | `math/0511-matrix-exponentiation.md` |
| 0512 | 概率与期望基础 | 计划 | `math/0512-probability-expectation.md` |
| 0513* | Nim、SG 函数与基础博弈论 | 计划 | `math/0513-nim-sg-game-theory.md` |
| 0514* | XOR 线性基 | 计划 | `math/0514-xor-linear-basis.md` |
| 0515* | 高斯消元 | 计划 | `math/0515-gaussian-elimination.md` |
| 0516 | 容斥原理 | 计划 | `math/0516-inclusion-exclusion.md` |
| 0517* | 多项式：NTT | 计划 | `math/0517-ntt.md` |
| 0518 | 莫比乌斯函数 | 计划 | `math/0518-mobius-function.md` |
| 0519* | BSGS 与离散对数 | 计划 | `math/0519-discrete-logarithm.md` |
| 0520* | 多项式：表示、加法与减法 | 计划 | `math/0520-polynomial-representation-addition-subtraction.md` |
| 0521* | 多项式：卷积与朴素乘法 | 计划 | `math/0521-convolution-naive-multiplication.md` |
| 0522* | 复数与单位根 | 计划 | `math/0522-complex-numbers-roots-of-unity.md` |
| 0523* | 多项式：FFT | 计划 | `math/0523-fft.md` |
| 0524* | 形式幂级数：求逆 | 计划 | `math/0524-formal-power-series-inverse.md` |
| 0525* | 形式幂级数：形式导数 | 计划 | `math/0525-formal-derivative.md` |
| 0526* | 形式幂级数：形式积分 | 计划 | `math/0526-formal-integral.md` |
| 0527* | 形式幂级数：对数 | 计划 | `math/0527-formal-power-series-logarithm.md` |
| 0528* | 形式幂级数：指数 | 计划 | `math/0528-formal-power-series-exponential.md` |
| 0529* | 形式幂级数：平方根 | 计划 | `math/0529-formal-power-series-square-root.md` |
| 0530* | 形式幂级数：幂 | 计划 | `math/0530-formal-power-series-power.md` |
| 0531* | 多项式：除法与余数 | 计划 | `math/0531-polynomial-division-remainder.md` |
| 0532* | 多项式：多点求值 | 计划 | `math/0532-multipoint-evaluation.md` |
| 0533* | 多项式：插值 | 计划 | `math/0533-polynomial-interpolation.md` |
| 0534* | 莫比乌斯反演 | 计划 | `math/0534-mobius-inversion.md` |
| 0535 | 数论：算术基本定理 | 草稿 | [fundamental-theorem-of-arithmetic.md](math/fundamental-theorem-of-arithmetic.md) |
| 0536 | 数论：最大公约数与最小公倍数 | 草稿 | [greatest-common-divisor-and-least-common-multiple.md](math/greatest-common-divisor-and-least-common-multiple.md) |
| 0537 | 数论：欧几里得算法 | 草稿 | [euclidean-algorithm.md](math/euclidean-algorithm.md) |
| 0538 | 数论：扩展中国剩余定理（exCRT） | 草稿 | [extended-chinese-remainder-theorem.md](math/extended-chinese-remainder-theorem.md) |
| 0539 | 数论：质因数分解 | 计划 | `math/0539-prime-factorization.md` |
| 0540 | 数论：正因数个数 | 计划 | `math/0540-divisor-count.md` |
| 0541 | 数论：正因数和 | 计划 | `math/0541-divisor-sum.md` |
| 0542 | 数论：线性不定方程 | 计划 | `math/0542-linear-diophantine-equations.md` |
| 0543 | 数论：线性同余方程 | 计划 | `math/0543-linear-congruences.md` |

## 06 计算几何

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0601 | 坐标、点、向量与精度 | 计划 | `computational-geometry/0601-points-vectors-precision.md` |
| 0602 | 点积、叉积与方向判断 | 计划 | `computational-geometry/0602-dot-cross-orientation.md` |
| 0603 | 直线、线段与相交判定 | 计划 | `computational-geometry/0603-lines-segments-intersections.md` |
| 0604 | 多边形面积与点的位置 | 计划 | `computational-geometry/0604-polygon-area-point-location.md` |
| 0605 | 凸包 | 计划 | `computational-geometry/0605-convex-hull.md` |
| 0606* | 圆与圆的关系 | 计划 | `computational-geometry/0606-circles.md` |
| 0607* | 旋转卡壳 | 计划 | `computational-geometry/0607-rotating-calipers.md` |
| 0608* | 几何扫描线 | 计划 | `computational-geometry/0608-geometric-sweep-line.md` |
| 0609* | 最近点对 | 计划 | `computational-geometry/0609-closest-pair-of-points.md` |
| 0610* | 凸多边形：点包含 | 计划 | `computational-geometry/0610-point-in-convex-polygon.md` |
| 0611* | 凸多边形：切线与极值查询 | 计划 | `computational-geometry/0611-convex-polygon-tangents-extrema.md` |
| 0612* | 半平面交 | 计划 | `computational-geometry/0612-half-plane-intersection.md` |
| 0613* | 闵可夫斯基和 | 计划 | `computational-geometry/0613-minkowski-sum.md` |

## 07 动态规划

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0701 | 动态规划：状态与转移 | 计划 | `dynamic-programming/0701-dp-foundations.md` |
| 0702 | 动态规划：线性 DP | 计划 | `dynamic-programming/0702-linear-dp.md` |
| 0703 | 背包：0-1 背包 | 计划 | `dynamic-programming/0703-zero-one-knapsack.md` |
| 0704 | 动态规划：最长上升子序列 | 计划 | `dynamic-programming/0704-longest-increasing-subsequence.md` |
| 0705 | 动态规划：区间 DP | 计划 | `dynamic-programming/0705-interval-dp.md` |
| 0706 | 动态规划：DAG 上的 DP | 计划 | `dynamic-programming/0706-dag-dp.md` |
| 0707 | 动态规划：树形 DP | 计划 | `dynamic-programming/0707-tree-dp.md` |
| 0708 | 动态规划：状压 DP | 计划 | `dynamic-programming/0708-bitmask-dp.md` |
| 0709 | 动态规划：数位 DP | 计划 | `dynamic-programming/0709-digit-dp.md` |
| 0710 | 动态规划：概率与期望 | 计划 | `dynamic-programming/0710-probability-expectation-dp.md` |
| 0711 | 动态规划优化：单调队列 | 计划 | `dynamic-programming/0711-monotone-queue-optimization.md` |
| 0712* | 动态规划优化：斜率 | 计划 | `dynamic-programming/0712-convex-hull-trick.md` |
| 0713* | 动态规划优化：分治 | 计划 | `dynamic-programming/0713-divide-conquer-optimization.md` |
| 0714* | 动态规划：Slope Trick | 计划 | `dynamic-programming/0714-slope-trick.md` |
| 0715 | 背包：完全背包 | 计划 | `dynamic-programming/0715-complete-knapsack.md` |
| 0716 | 背包：多重背包 | 计划 | `dynamic-programming/0716-multiple-knapsack.md` |
| 0717 | 动态规划：状态机 DP | 计划 | `dynamic-programming/0717-state-machine-dp.md` |

## 08 字符串

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0801 | 字符串：比较与字典序 | 计划 | `strings/0801-string-comparison-lexicographic-order.md` |
| 0802 | 字符串：模式匹配与朴素算法 | 计划 | `strings/0802-naive-pattern-matching.md` |
| 0803 | 字符串：哈希 | 计划 | `strings/0803-rolling-hash.md` |
| 0804 | 字符串：KMP 与前缀函数 | 计划 | `strings/0804-kmp-prefix-function.md` |
| 0805 | 字符串：Z 函数 | 计划 | `strings/0805-z-function.md` |
| 0806 | 字符串：Trie | 计划 | `strings/0806-trie.md` |
| 0807* | 字符串：AC 自动机 | 计划 | `strings/0807-aho-corasick.md` |
| 0808* | 字符串：Manacher | 计划 | `strings/0808-manacher.md` |
| 0809* | 字符串：后缀数组 | 计划 | `strings/0809-suffix-array.md` |
| 0810* | 字符串：后缀自动机 | 计划 | `strings/0810-suffix-automaton.md` |
| 0811* | 字符串：回文树 | 计划 | `strings/0811-palindromic-tree.md` |
| 0812* | 字符串：后缀树 | 计划 | `strings/0812-suffix-tree.md` |
