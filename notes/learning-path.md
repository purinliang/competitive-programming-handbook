# 分阶段学习路线

这条路线从 C++ 基础出发，到高中竞赛一等奖常见的知识主干为止。它给出 [模块目录](catalog.md) 中核心教程的大致教学顺序，不试图在正文尚未写完时维护一张精确的前置依赖图。

路线会逐步整理成学习单元；目前先以 01 C++ 基础作为样板，其余部分仍保留原有顺序，等待对应正文和教学边界一起审查。单元表示一次相对完整的学习任务，文章仍然保持足够小且聚焦；同一单元可以把需要共同理解或反复对照的不同知识族放在一起。路线允许先学会最小用法、以后再回访底层规则，不承诺所有概念都能排成一条没有交叉的直线。

标为代码路径的文章尚在计划中；可点击链接表示已经存在正文。高中进阶之后不再虚构统一的难度顺序，目录中的其余内容统一收录在文末的 [扩展阅读索引](#扩展阅读索引) 中。

常见 XCPC 路线图中的“铜牌、银牌、金牌”描述的是达到相应竞赛能力时应覆盖的知识集合，不是严格的教学阶段：同一档会同时包含很早学习的基础技巧和依赖较多的专题。本路线把入门到铜牌知识进一步拆成 01–05，再用 06 收录高中进阶主干；扩展阅读覆盖金牌及更远专题。两套分级只能相互校准，不能逐项机械换算。

## 下标与区间约定

本书自己定义的数组、字符串、图、树和算法状态默认使用 1-based 下标：长度为 `n` 的对象使用 `1..n`，位置 `0` 留给空前缀、空节点、边界或哨兵。自定义区间默认是闭区间 `[l, r]`，长度为 `r - l + 1`；动态存储在逻辑容量之外统一保留 `+5` 余量，并单独保存真实长度。

直接讲解或调用 C++ / STL 时保留原生规则，例如 `string`、`vector` 和内置数组的下标从 `0` 开始，迭代器区间通常左闭右开。正文会在接口边界明确转换，不会让同一个算法内部交替使用两套约定。

## 01 C++ 基础

### 学习单元：第一个竞赛程序

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0101 | Hello World! | C++ | [learning-path/cpp/hello-world.md](learning-path/cpp/hello-world.md) |
| 0158 | A+B Problem | C++ | [learning-path/cpp/a-plus-b-problem.md](learning-path/cpp/a-plus-b-problem.md) |

### 学习单元：基本类型

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0102 | 整数类型 | C++ | [cpp/integer-types.md](cpp/integer-types.md) |
| 0103 | 浮点类型 | C++ | [cpp/floating-point-types.md](cpp/floating-point-types.md) |
| 0104 | 字符类型 | C++ | [cpp/character-types.md](cpp/character-types.md) |
| 0105 | 布尔类型 | C++ | [cpp/boolean-type.md](cpp/boolean-type.md) |
| 0110 | 类型转换 | C++ | [cpp/type-conversions.md](cpp/type-conversions.md) |

### 学习单元：变量、常量与字面量

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0106 | 变量 | C++ | [cpp/variable-declaration-initialization.md](cpp/variable-declaration-initialization.md) |
| 0128 | 常量 | C++ | [cpp/const.md](cpp/const.md) |
| 0161 | 字面量 | C++ | [cpp/literals.md](cpp/literals.md) |

### 学习单元：表达式与控制流

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0107 | 算术运算符 | C++ | [cpp/arithmetic-operators.md](cpp/arithmetic-operators.md) |
| 0108 | 比较运算符 | C++ | [cpp/comparison-operators.md](cpp/comparison-operators.md) |
| 0109 | 逻辑运算符 | C++ | [cpp/logical-operators.md](cpp/logical-operators.md) |
| 0164 | 自增与自减运算符 | C++ | [cpp/increment-decrement-operators.md](cpp/increment-decrement-operators.md) |
| 0165 | 复合赋值运算符 | C++ | [cpp/compound-assignment-operators.md](cpp/compound-assignment-operators.md) |
| 0133 | 位运算符 | C++ | [cpp/bitwise-operators.md](cpp/bitwise-operators.md) |
| 0111 | if 与 else | C++ | [cpp/conditional-branches.md](cpp/conditional-branches.md) |
| 0166 | switch | C++ | [cpp/switch.md](cpp/switch.md) |
| 0167 | while | C++ | [cpp/while.md](cpp/while.md) |
| 0112 | for | C++ | [cpp/loops.md](cpp/loops.md) |
| 0168 | do while | C++ | [cpp/do-while.md](cpp/do-while.md) |

### 学习单元：函数与作用域

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0113 | 函数的定义与调用 | C++ | [cpp/function-definition-and-calls.md](cpp/function-definition-and-calls.md) |
| 0169 | 函数的返回值 | C++ | [cpp/function-return-values.md](cpp/function-return-values.md) |
| 0170 | 函数的形参与实参 | C++ | [cpp/function-parameters-and-arguments.md](cpp/function-parameters-and-arguments.md) |
| 0171 | 关键字与标识符 | C++ | [cpp/keywords-and-identifiers.md](cpp/keywords-and-identifiers.md) |
| 0114 | 作用域 | C++ | [cpp/scope.md](cpp/scope.md) |
| 0129 | static 局部变量 | C++ | [cpp/static-local-variables.md](cpp/static-local-variables.md) |

### 学习单元：输入输出

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0115 | 标准输入 | C++ | [cpp/standard-input.md](cpp/standard-input.md) |
| 0116 | 标准输出 | C++ | [cpp/standard-output.md](cpp/standard-output.md) |
| 0172 | 输出格式控制 | C++ | [cpp/output-formatting.md](cpp/output-formatting.md) |
| 0117 | 文件重定向 | C++ | [cpp/file-redirection.md](cpp/file-redirection.md) |

### 学习单元：数组、字符串与结构体

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0118 | 一维数组 | C++ | [cpp/one-dimensional-arrays.md](cpp/one-dimensional-arrays.md) |
| 0119 | 多维数组 | C++ | [cpp/multidimensional-arrays.md](cpp/multidimensional-arrays.md) |
| 0120 | C 字符串 | C++ | [cpp/c-strings.md](cpp/c-strings.md) |
| 0137 | string | C++ | [cpp/string.md](cpp/string.md) |
| 0173 | 整行输入 | C++ | [cpp/whole-line-input.md](cpp/whole-line-input.md) |

### 学习单元：地址、别名与参数

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0124 | 字节寻址 | C++ | [cpp/byte-addressing.md](cpp/byte-addressing.md) |
| 0125 | 指针 | C++ | [cpp/pointers.md](cpp/pointers.md) |
| 0126 | 引用 | C++ | [cpp/references.md](cpp/references.md) |
| 0174 | 指针与引用中的 const | C++ | [cpp/const-pointers-and-references.md](cpp/const-pointers-and-references.md) |
| 0127 | 参数传递 | C++ | [cpp/parameter-passing.md](cpp/parameter-passing.md) |

### 学习单元：结构体

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0121 | struct | C++ | [cpp/struct.md](cpp/struct.md) |
| 0175 | 结构体指针与箭头运算符 | C++ | [cpp/struct-pointers-and-arrow.md](cpp/struct-pointers-and-arrow.md) |

### 学习单元：内存、调用栈与递归

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0130 | 竞赛程序的常见内存分区 | C++ | [cpp/competitive-program-memory-layout.md](cpp/competitive-program-memory-layout.md) |
| 0131 | 调用栈 | C++ | [cpp/function-call-stack.md](cpp/function-call-stack.md) |
| 0132 | 递归 | C++ | [cpp/recursion.md](cpp/recursion.md) |

本阶段只讲从 C++ 视角写程序所需的语言知识和少量机器直觉，不代替计算机组成、体系结构、操作系统或编译原理课程。`include`、命名空间和对象生命周期等不影响入门主线的细节放在扩展阅读中。

### 扩展单元：C++ 扩展阅读

这一单元不属于主线的上一篇/下一篇顺序。它集中收录竞赛中很少主动使用、但可能在阅读代码或基础考试中遇到的语言机制。

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0176* | 预处理 | C++ | [cpp/preprocessing.md](cpp/preprocessing.md) |
| 0177* | 编译 | C++ | [cpp/compilation.md](cpp/compilation.md) |
| 0178* | 链接 | C++ | [cpp/linking.md](cpp/linking.md) |
| 0179* | constexpr | C++ | [cpp/constexpr.md](cpp/constexpr.md) |
| 0152* | #include | C++ | [cpp/include.md](cpp/include.md) |
| 0153* | 命名空间与 std | C++ | [cpp/namespace-and-std.md](cpp/namespace-and-std.md) |
| 0159* | #define 宏 | C++ | [cpp/define-macros.md](cpp/define-macros.md) |
| 0160* | typedef 与 using 类型别名 | C++ | [cpp/type-aliases.md](cpp/type-aliases.md) |
| 0121e2 | class 与对象 | C++ | [cpp/class.md](cpp/class.md) |
| 0121e3 | 类的成员 | C++ | [cpp/class-members.md](cpp/class-members.md) |
| 0121e4 | 访问权限与 friend | C++ | [cpp/class-access-control.md](cpp/class-access-control.md) |
| 0121e5 | 构造函数 | C++ | [cpp/constructors.md](cpp/constructors.md) |
| 0121e6 | 析构函数 | C++ | [cpp/destructors.md](cpp/destructors.md) |
| 0121e7 | 函数重载与运算符重载 | C++ | [cpp/overloading.md](cpp/overloading.md) |
| 0121e8 | 继承 | C++ | [cpp/inheritance.md](cpp/inheritance.md) |
| 0121e9 | 多态 | C++ | [cpp/polymorphism.md](cpp/polymorphism.md) |
| 0122* | union | C++ | [cpp/union.md](cpp/union.md) |
| 0123* | enum | C++ | [cpp/enum.md](cpp/enum.md) |
| 0154* | inline | C++ | [cpp/inline.md](cpp/inline.md) |
| 0155* | volatile | C++ | [cpp/volatile.md](cpp/volatile.md) |
| 0157* | 对象生命周期 | C++ | [cpp/object-lifetime.md](cpp/object-lifetime.md) |

## 02 算法基础

### 学习单元：复杂度

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0201 | 复杂度 | 算法基础 | [algorithm-basics/complexity.md](algorithm-basics/complexity.md) |
| 0254 | 从代码分析复杂度 | 算法基础 | [algorithm-basics/complexity-analysis.md](algorithm-basics/complexity-analysis.md) |

### 学习单元：基础 STL

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0138 | vector | C++ | [cpp/vector.md](cpp/vector.md) |
| 0163 | fill | C++ | [cpp/fill.md](cpp/fill.md) |
| 0140 | sort | C++ | [cpp/sorting.md](cpp/sorting.md) |
| 0141 | unique | C++ | [cpp/deduplication.md](cpp/deduplication.md) |

### 学习单元：递归与递推

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0250 | 递归与问题分解 | 算法基础 | [algorithm-basics/recursive-problem-solving.md](algorithm-basics/recursive-problem-solving.md) |
| 0202 | 递推 | 算法基础 | [algorithm-basics/recurrence.md](algorithm-basics/recurrence.md) |

### 学习单元：排序

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0203 | 冒泡排序 | 算法基础 | [algorithm-basics/sorting.md](algorithm-basics/sorting.md) |
| 0257 | 选择排序 | 算法基础 | [algorithm-basics/selection-sort.md](algorithm-basics/selection-sort.md) |
| 0258 | 插入排序 | 算法基础 | `algorithm-basics/insertion-sort.md` |
| 0259 | 计数排序 | 算法基础 | `algorithm-basics/counting-sort.md` |
| 0231 | 排序：快速排序 | 算法基础 | [algorithm-basics/quicksort.md](algorithm-basics/quicksort.md) |
| 0232 | 排序：归并排序 | 算法基础 | [algorithm-basics/merge-sort.md](algorithm-basics/merge-sort.md) |
| 0260 | 排序方法比较 | 算法基础 | `algorithm-basics/sorting-comparison.md` |
| 0206 | 离散化 | 算法基础 | [algorithm-basics/coordinate-compression.md](algorithm-basics/coordinate-compression.md) |

### 学习单元：分治

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0209 | 分治：基础 | 算法基础 | [algorithm-basics/divide-and-conquer.md](algorithm-basics/divide-and-conquer.md) |

### 学习单元：二分

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0204 | 查找：二分查找 | 算法基础 | [algorithm-basics/binary-search.md](algorithm-basics/binary-search.md) |
| 0251 | 二分边界 | 算法基础 | `algorithm-basics/binary-search-boundaries.md` |
| 0162 | STL 二分查找 | C++ | `cpp/stl-binary-search.md` |
| 0219 | 二分答案 | 算法基础 | [algorithm-basics/binary-search-on-answer.md](algorithm-basics/binary-search-on-answer.md) |
| 0252 | 浮点数二分 | 算法基础 | `algorithm-basics/floating-point-binary-search.md` |

### 学习单元：双指针与滑动窗口

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0205 | 双指针 | 算法基础 | [algorithm-basics/two-pointers.md](algorithm-basics/two-pointers.md) |
| 0220 | 双指针：滑动窗口 | 算法基础 | [algorithm-basics/sliding-window.md](algorithm-basics/sliding-window.md) |

### 学习单元：前缀和与差分

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0207 | 前缀和 | 算法基础 | [algorithm-basics/prefix-sums.md](algorithm-basics/prefix-sums.md) |
| 0221 | 差分 | 算法基础 | [algorithm-basics/difference-array.md](algorithm-basics/difference-array.md) |

### 学习单元：枚举与模拟

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0210 | 枚举 | 算法基础 | [algorithm-basics/enumeration.md](algorithm-basics/enumeration.md) |
| 0211 | 枚举：子集与位掩码 | 算法基础 | [algorithm-basics/subset-bitmask-enumeration.md](algorithm-basics/subset-bitmask-enumeration.md) |
| 0222 | 模拟 | 算法基础 | [algorithm-basics/simulation.md](algorithm-basics/simulation.md) |

本阶段先独立建立复杂度，再学习后续代码马上需要的 `vector`、`sort` 和 `unique`。这里只学习基础 STL 的真实用途，不预先背诵全部容器。数组、链表、栈、队列和双端队列连同对应标准库接口放在初中基础；`pair` 等到图的带权邻接表以前再学习。

## 03 初中基础

### 学习单元：线性结构与对应接口

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0223 | 线性结构：数组 | 算法基础 | [algorithm-basics/array.md](algorithm-basics/array.md) |
| 0224 | 链表 | 算法基础 | [algorithm-basics/linked-list.md](algorithm-basics/linked-list.md) |
| 0225 | 栈 | 算法基础 | [algorithm-basics/stack.md](algorithm-basics/stack.md) |
| 0142 | stack | C++ | [cpp/stack.md](cpp/stack.md) |
| 0236 | 栈的应用：出栈序列判定 | 算法基础 | [algorithm-basics/stack-pop-sequence-validation.md](algorithm-basics/stack-pop-sequence-validation.md) |
| 0237 | 栈的应用：表达式求值 | 算法基础 | [algorithm-basics/expression-evaluation.md](algorithm-basics/expression-evaluation.md) |
| 0226 | 队列 | 算法基础 | [algorithm-basics/queue.md](algorithm-basics/queue.md) |
| 0253 | 双端队列 | 算法基础 | `algorithm-basics/deque.md` |
| 0139 | deque | C++ | [cpp/deque.md](cpp/deque.md) |
| 0143 | queue | C++ | [cpp/queue.md](cpp/queue.md) |

### 学习单元：整除、质数与最大公约数

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0501 | 数论：整除 | 数学 | [math/divisibility.md](math/divisibility.md) |
| 0502 | 数论：质数 | 数学 | [math/prime-numbers.md](math/prime-numbers.md) |
| 0535 | 数论：算术基本定理 | 数学 | [math/fundamental-theorem-of-arithmetic.md](math/fundamental-theorem-of-arithmetic.md) |
| 0539 | 数论：质因数分解 | 数学 | [math/prime-factorization.md](math/prime-factorization.md) |
| 0536 | 数论：最大公约数与最小公倍数 | 数学 | [math/greatest-common-divisor-and-least-common-multiple.md](math/greatest-common-divisor-and-least-common-multiple.md) |
| 0537 | 数论：欧几里得算法 | 数学 | [math/euclidean-algorithm.md](math/euclidean-algorithm.md) |

### 学习单元：哈希表

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0228 | 哈希表 | 算法基础 | [algorithm-basics/hash-table.md](algorithm-basics/hash-table.md) |

### 学习单元：pair

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0134 | pair | C++ | [cpp/pair.md](cpp/pair.md) |

### 学习单元：图的概念与存储

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0401 | 图：点与边 | 图论 | [graph-theory/vertices-and-edges.md](graph-theory/vertices-and-edges.md) |
| 0431 | 图：路径与环 | 图论 | [graph-theory/paths-and-cycles.md](graph-theory/paths-and-cycles.md) |
| 0432 | 图：度数 | 图论 | [graph-theory/vertex-degrees.md](graph-theory/vertex-degrees.md) |
| 0402 | 图的存储：基础概念 | 图论 | [graph-theory/graph-representation.md](graph-theory/graph-representation.md) |
| 0439 | 图的存储：邻接表（vector 实现） | 图论 | [graph-theory/vector-adjacency-list.md](graph-theory/vector-adjacency-list.md) |

### 学习单元：图的搜索与连通性

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0436 | 图的遍历：深度优先搜索（DFS） | 图论 | [graph-theory/graph-depth-first-search.md](graph-theory/graph-depth-first-search.md) |
| 0443 | 搜索：DFS、回溯与剪枝 | 图论 | [graph-theory/dfs-backtracking-pruning.md](graph-theory/dfs-backtracking-pruning.md) |
| 0437 | 图的遍历：广度优先搜索（BFS） | 图论 | [graph-theory/graph-breadth-first-search.md](graph-theory/graph-breadth-first-search.md) |
| 0404 | 图的遍历：连通块 | 图论 | [graph-theory/connected-components.md](graph-theory/connected-components.md) |

### 学习单元：树的概念与遍历

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0433 | 树：无根树 | 图论 | [graph-theory/unrooted-trees.md](graph-theory/unrooted-trees.md) |
| 0442 | 树：有根树 | 图论 | [graph-theory/rooted-trees.md](graph-theory/rooted-trees.md) |
| 0434 | 树的遍历：深度优先搜索（DFS） | 图论 | [graph-theory/tree-depth-first-search.md](graph-theory/tree-depth-first-search.md) |
| 0435 | 树的遍历：广度优先搜索（BFS） | 图论 | [graph-theory/tree-breadth-first-search.md](graph-theory/tree-breadth-first-search.md) |

### 学习单元：动态规划入门

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0701 | 动态规划：状态与转移 | 动态规划 | [dynamic-programming/dp-state-transition.md](dynamic-programming/dp-state-transition.md) |
| 0702 | 动态规划：线性 DP | 动态规划 | [dynamic-programming/linear-dp.md](dynamic-programming/linear-dp.md) |
| 0704 | 动态规划：最长上升子序列 | 动态规划 | [dynamic-programming/longest-increasing-subsequence.md](dynamic-programming/longest-increasing-subsequence.md) |
| 0717 | 动态规划：状态机 DP | 动态规划 | [dynamic-programming/state-machine-dp.md](dynamic-programming/state-machine-dp.md) |

### 学习单元：背包动态规划

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0703 | 背包：0-1 背包 | 动态规划 | [dynamic-programming/zero-one-knapsack.md](dynamic-programming/zero-one-knapsack.md) |
| 0715 | 背包：完全背包 | 动态规划 | [dynamic-programming/complete-knapsack.md](dynamic-programming/complete-knapsack.md) |
| 0716 | 背包：多重背包 | 动态规划 | [dynamic-programming/multiple-knapsack.md](dynamic-programming/multiple-knapsack.md) |

### 学习单元：字符串比较与朴素匹配

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0801 | 字符串：比较与字典序 | 字符串 | [strings/comparison-and-lexicographic-order.md](strings/comparison-and-lexicographic-order.md) |
| 0802 | 字符串：模式匹配与朴素算法 | 字符串 | [strings/naive-pattern-matching.md](strings/naive-pattern-matching.md) |

## 04 初中进阶

### 学习单元：堆与 priority_queue

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0227 | 二叉堆 | 算法基础 | [algorithm-basics/binary-heap.md](algorithm-basics/binary-heap.md) |
| 0144 | priority_queue | C++ | [cpp/priority-queue.md](cpp/priority-queue.md) |

### 学习单元：贪心

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0208 | 贪心：选择与证明 | 算法基础 | [algorithm-basics/greedy-selection-and-proof.md](algorithm-basics/greedy-selection-and-proof.md) |
| 0238 | 贪心证明：邻项交换 | 算法基础 | `algorithm-basics/greedy-adjacent-exchange.md` |
| 0239 | 贪心：反悔 | 算法基础 | `algorithm-basics/greedy-regret.md` |

### 学习单元：有序关联容器

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0145 | set | C++ | [cpp/set.md](cpp/set.md) |
| 0146 | multiset | C++ | [cpp/multiset.md](cpp/multiset.md) |
| 0147 | map | C++ | [cpp/map.md](cpp/map.md) |
| 0148 | multimap | C++ | [cpp/multimap.md](cpp/multimap.md) |

### 学习单元：哈希容器

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0149 | unordered_set | C++ | [cpp/unordered-set.md](cpp/unordered-set.md) |
| 0150 | unordered_map | C++ | [cpp/unordered-map.md](cpp/unordered-map.md) |

### 学习单元：高精度整数

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0544 | 高精度整数：加法、减法与乘法 | 数学 | [math/big-integer-addition-subtraction-multiplication.md](math/big-integer-addition-subtraction-multiplication.md) |

### 学习单元：BFS 扩展与二分图

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0406 | 图的遍历：多源 BFS | 图论 | [graph-theory/multi-source-bfs.md](graph-theory/multi-source-bfs.md) |
| 0411 | 二分图：判定 | 图论 | [graph-theory/bipartite-graph.md](graph-theory/bipartite-graph.md) |

### 学习单元：二叉树的存储与遍历

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0311 | 二叉树：结构与存储 | 数据结构 | [data-structures/binary-tree-structure-and-storage.md](data-structures/binary-tree-structure-and-storage.md) |
| 0328 | 二叉树的遍历：前序、中序与后序 | 数据结构 | [data-structures/binary-tree-traversals.md](data-structures/binary-tree-traversals.md) |

### 学习单元：编码与树形表示

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0240 | 编码：哈夫曼编码 | 算法基础 | [algorithm-basics/huffman-coding.md](algorithm-basics/huffman-coding.md) |
| 0241 | 编码：格雷码 | 算法基础 | [algorithm-basics/gray-code.md](algorithm-basics/gray-code.md) |

## 05 高中基础

### 学习单元：复杂度进阶

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0255 | 均摊复杂度 | 算法基础 | `algorithm-basics/amortized-complexity.md` |
| 0256 | 均摊复杂度：势能法 | 算法基础 | `algorithm-basics/potential-method.md` |

### 学习单元：bitset

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0151 | bitset | C++ | [cpp/bitset.md](cpp/bitset.md) |

### 学习单元：区间查询数据结构

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0304 | 线段树：基础 | 数据结构 | [data-structures/segment-tree.md](data-structures/segment-tree.md) |
| 0306 | 树状数组：基础 | 数据结构 | [data-structures/fenwick-tree.md](data-structures/fenwick-tree.md) |
| 0308 | 稀疏表（ST 表） | 数据结构 | [data-structures/sparse-table.md](data-structures/sparse-table.md) |

### 学习单元：并查集

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0307 | 并查集：基础 | 数据结构 | [data-structures/disjoint-set-union.md](data-structures/disjoint-set-union.md) |

### 学习单元：单调结构与倍增

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0229 | 单调栈 | 算法基础 | [algorithm-basics/monotonic-stack.md](algorithm-basics/monotonic-stack.md) |
| 0230 | 单调队列 | 算法基础 | [algorithm-basics/monotonic-queue.md](algorithm-basics/monotonic-queue.md) |
| 0242 | 倍增：基础 | 算法基础 | [algorithm-basics/doubling.md](algorithm-basics/doubling.md) |

### 学习单元：模运算与线性同余

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0504 | 模运算 | 数学 | [math/modular-arithmetic.md](math/modular-arithmetic.md) |
| 0574 | 快速幂 | 数学 | [math/fast-power.md](math/fast-power.md) |
| 0575 | 费马小定理 | 数学 | [math/fermat-little-theorem.md](math/fermat-little-theorem.md) |
| 0503 | 数论：扩展欧几里得算法 | 数学 | [math/extended-euclidean-algorithm.md](math/extended-euclidean-algorithm.md) |
| 0542 | 线性不定方程 | 数学 | [math/linear-diophantine-equations.md](math/linear-diophantine-equations.md) |
| 0543 | 线性同余方程 | 数学 | [math/linear-congruences.md](math/linear-congruences.md) |
| 0506 | 模逆元 | 数学 | [math/modular-inverse.md](math/modular-inverse.md) |

### 学习单元：筛法与因数函数

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0505 | 筛法：埃氏筛 | 数学 | [math/sieve-of-eratosthenes.md](math/sieve-of-eratosthenes.md) |
| 0576 | 筛法：欧拉筛（线性筛） | 数学 | [math/euler-sieve.md](math/euler-sieve.md) |
| 0540 | 正因数个数 | 数学 | [math/divisor-count.md](math/divisor-count.md) |
| 0541 | 正因数和 | 数学 | [math/divisor-sum.md](math/divisor-sum.md) |

### 学习单元：基础计数与组合数

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0578 | 计数原理：加法原理 | 数学 | [math/addition-principle.md](math/addition-principle.md) |
| 0579 | 计数原理：乘法原理 | 数学 | [math/multiplication-principle.md](math/multiplication-principle.md) |
| 0580 | 排列数 | 数学 | [math/permutations-count.md](math/permutations-count.md) |
| 0507 | 组合数：定义与递推 | 数学 | [math/binomial-coefficients.md](math/binomial-coefficients.md) |
| 0581 | 组合数：阶乘与逆元预处理 | 数学 | [math/binomial-coefficients-factorials.md](math/binomial-coefficients-factorials.md) |

### 学习单元：欧拉函数与莫比乌斯函数

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0508 | 欧拉函数 | 数学 | [math/euler-totient.md](math/euler-totient.md) |
| 0582 | 欧拉定理 | 数学 | [math/euler-theorem.md](math/euler-theorem.md) |
| 0518 | 莫比乌斯函数 | 数学 | [math/mobius-function.md](math/mobius-function.md) |

### 学习单元：矩阵与线性变换

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0509 | 矩阵：表示 | 数学 | [math/matrix-representation.md](math/matrix-representation.md) |
| 0583 | 矩阵：加法与减法 | 数学 | [math/matrix-addition-subtraction.md](math/matrix-addition-subtraction.md) |
| 0584 | 矩阵：乘法 | 数学 | [math/matrix-multiplication.md](math/matrix-multiplication.md) |
| 0585 | 线性变换：矩阵表示 | 数学 | [math/linear-transformations-as-matrices.md](math/linear-transformations-as-matrices.md) |
| 0511 | 矩阵快速幂 | 数学 | [math/matrix-exponentiation.md](math/matrix-exponentiation.md) |

### 学习单元：概率与期望

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0512 | 概率与期望基础 | 数学 | `math/0512-probability-expectation.md` |

### 学习单元：图的存储实现

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0441 | 图的存储：边集 | 图论 | [graph-theory/edge-list.md](graph-theory/edge-list.md) |
| 0440 | 图的存储：邻接表（链式前向星实现） | 图论 | [graph-theory/chained-forward-star.md](graph-theory/chained-forward-star.md) |

### 学习单元：拓扑排序与最短路

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0405 | 有向无环图：拓扑排序 | 图论 | [graph-theory/topological-sort.md](graph-theory/topological-sort.md) |
| 0407 | 最短路：Dijkstra | 图论 | `graph-theory/0407-dijkstra.md` |
| 0408 | 最短路：Bellman–Ford 与负环 | 图论 | `graph-theory/0408-bellman-ford.md` |
| 0409 | 最短路：Floyd–Warshall | 图论 | `graph-theory/0409-floyd-warshall.md` |
| 0444 | 最短路：0-1 BFS | 图论 | [graph-theory/zero-one-bfs.md](graph-theory/zero-one-bfs.md) |

### 学习单元：最小生成树

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0410 | 最小生成树：Kruskal | 图论 | `graph-theory/0410-kruskal.md` |
| 0448 | 最小生成树：Prim | 图论 | `graph-theory/0448-prim.md` |

### 学习单元：树的路径与子树

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0417 | 树：直径与中心 | 图论 | [graph-theory/tree-diameter-center.md](graph-theory/tree-diameter-center.md) |
| 0445 | 树：重心 | 图论 | [graph-theory/tree-centroid.md](graph-theory/tree-centroid.md) |
| 0418 | 树的遍历：DFS 序与子树区间 | 图论 | `graph-theory/0418-tree-euler-tour.md` |
| 0403 | 树上查询：倍增 LCA | 图论 | [graph-theory/lca-binary-lifting.md](graph-theory/lca-binary-lifting.md) |

### 学习单元：特殊图结构与路径问题

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0426 | 图：基环树 | 图论 | `graph-theory/0426-unicyclic-graph.md` |
| 0447 | 图：函数图 | 图论 | `graph-theory/0447-functional-graph.md` |
| 0416 | 欧拉问题：路径、回路与图 | 图论 | [graph-theory/eulerian-paths-and-circuits.md](graph-theory/eulerian-paths-and-circuits.md) |
| 0438 | 哈密顿问题：路径、回路与图 | 图论 | [graph-theory/hamiltonian-paths-and-circuits.md](graph-theory/hamiltonian-paths-and-circuits.md) |

### 学习单元：常见动态规划模型

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0705 | 动态规划：区间 DP | 动态规划 | `dynamic-programming/0705-interval-dp.md` |
| 0706 | 动态规划：DAG 上的 DP | 动态规划 | `dynamic-programming/0706-dag-dp.md` |
| 0707 | 动态规划：树形 DP | 动态规划 | `dynamic-programming/0707-tree-dp.md` |
| 0708 | 动态规划：状压 DP | 动态规划 | `dynamic-programming/0708-bitmask-dp.md` |

### 学习单元：字符串算法基础

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0803 | 字符串：哈希 | 字符串 | `strings/0803-rolling-hash.md` |
| 0804 | 字符串：KMP 与前缀函数 | 字符串 | `strings/0804-kmp-prefix-function.md` |
| 0805 | 字符串：Z 函数 | 字符串 | `strings/0805-z-function.md` |
| 0806 | 字符串：Trie | 字符串 | `strings/0806-trie.md` |

### 学习单元：计算几何基础

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0601 | 坐标、点、向量与精度 | 计算几何 | `computational-geometry/0601-points-vectors-precision.md` |
| 0602 | 点积、叉积与方向判断 | 计算几何 | `computational-geometry/0602-dot-cross-orientation.md` |

## 06 高中进阶

### 学习单元：折半枚举与离线处理

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0212 | 枚举：Meet-in-the-Middle | 算法基础 | `algorithm-basics/0212-meet-in-the-middle.md` |
| 0213 | 离线算法 | 算法基础 | `algorithm-basics/0213-offline-algorithms.md` |
| 0214 | 扫描线与事件排序 | 算法基础 | `algorithm-basics/0214-sweep-line.md` |

### 学习单元：并查集扩展

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0309 | 并查集：扩展域 | 数据结构 | `data-structures/extended-domain-disjoint-set.md` |
| 0310 | 并查集：带权 | 数据结构 | `data-structures/weighted-disjoint-set.md` |

### 学习单元：图的连通性与树上数据结构

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0413 | 有向图：强连通分量 | 图论 | `graph-theory/0413-strongly-connected-components.md` |
| 0414 | 无向图：割点与桥 | 图论 | `graph-theory/0414-articulation-points-bridges.md` |
| 0419 | 树上数据结构：树链剖分 | 图论 | `graph-theory/0419-heavy-light-decomposition.md` |
| 0446 | 树上技巧：树上差分 | 图论 | `graph-theory/0446-tree-difference.md` |

### 学习单元：状态图最短路

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0429 | 最短路：分层图与状态图 | 图论 | `graph-theory/0429-layered-state-shortest-path.md` |

### 学习单元：中国剩余定理

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0510 | 数论：中国剩余定理（CRT） | 数学 | [math/chinese-remainder-theorem.md](math/chinese-remainder-theorem.md) |
| 0538 | 数论：扩展中国剩余定理（exCRT） | 数学 | [math/extended-chinese-remainder-theorem.md](math/extended-chinese-remainder-theorem.md) |

### 学习单元：容斥原理

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0516 | 容斥原理 | 数学 | `math/0516-inclusion-exclusion.md` |

### 学习单元：平面几何算法

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0603 | 直线、线段与相交判定 | 计算几何 | `computational-geometry/0603-lines-segments-intersections.md` |
| 0604 | 多边形面积与点的位置 | 计算几何 | `computational-geometry/0604-polygon-area-point-location.md` |
| 0605 | 凸包 | 计算几何 | `computational-geometry/0605-convex-hull.md` |

### 学习单元：动态规划进阶

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 0709 | 动态规划：数位 DP | 动态规划 | `dynamic-programming/0709-digit-dp.md` |
| 0710 | 动态规划：概率与期望 | 动态规划 | `dynamic-programming/0710-probability-expectation-dp.md` |
| 0711 | 动态规划优化：单调队列 | 动态规划 | `dynamic-programming/0711-monotone-queue-optimization.md` |

完成 06 高中进阶后，读者已经具备独立阅读题解、按题目补充专题和判断新算法依赖的能力。这里不把高中竞赛一等奖与大学竞赛奖牌、Codeforces rating 做机械换算。

## 扩展阅读索引

以下内容不属于 01–06 的必学顺序，其中一部分可能明显高于高中竞赛一等奖的常见范围。它们按模块和 ID 排列，便于查找；开始某篇之前可以回到 [模块目录](catalog.md) 查看状态和所属模块。

### 01 C++

| ID | 知识点 | 文件 |
| --- | --- | --- |
| 0102e1 | 位、字节与存储单位 | [cpp/bits-bytes-and-storage-units.md](cpp/bits-bytes-and-storage-units.md) |
| 0102e2 | 整数的二进制表示 | [cpp/signed-integer-representations.md](cpp/signed-integer-representations.md) |
| 0102e3 | 整数类型的位宽与平台差异 | [cpp/integer-type-widths.md](cpp/integer-type-widths.md) |
| 0103e1 | IEEE 754 浮点数表示 | [cpp/ieee-754.md](cpp/ieee-754.md) |
| 0119e1 | 多维数组的布局与参数传递 | [cpp/multidimensional-array-layout-and-parameters.md](cpp/multidimensional-array-layout-and-parameters.md) |
| 0121e1 | struct 的内存布局 | [cpp/struct-memory-layout.md](cpp/struct-memory-layout.md) |
| 0121e2 | class 与对象 | [cpp/class.md](cpp/class.md) |
| 0121e3 | 类的成员 | [cpp/class-members.md](cpp/class-members.md) |
| 0121e4 | 访问权限与 friend | [cpp/class-access-control.md](cpp/class-access-control.md) |
| 0121e5 | 构造函数 | [cpp/constructors.md](cpp/constructors.md) |
| 0121e6 | 析构函数 | [cpp/destructors.md](cpp/destructors.md) |
| 0121e7 | 函数重载与运算符重载 | [cpp/overloading.md](cpp/overloading.md) |
| 0121e8 | 继承 | [cpp/inheritance.md](cpp/inheritance.md) |
| 0121e9 | 多态 | [cpp/polymorphism.md](cpp/polymorphism.md) |
| 0122* | union | [cpp/union.md](cpp/union.md) |
| 0123* | enum | [cpp/enum.md](cpp/enum.md) |
| 0135* | tuple | [cpp/tuple.md](cpp/tuple.md) |
| 0136* | array | [cpp/array.md](cpp/array.md) |
| 0152* | #include | [cpp/include.md](cpp/include.md) |
| 0153* | 命名空间与 std | [cpp/namespace-and-std.md](cpp/namespace-and-std.md) |
| 0154* | inline | [cpp/inline.md](cpp/inline.md) |
| 0155* | volatile | [cpp/volatile.md](cpp/volatile.md) |
| 0156* | order-statistics tree（GNU PBDS） | `cpp/gnu-pbds.md` |
| 0157* | 对象生命周期 | [cpp/object-lifetime.md](cpp/object-lifetime.md) |
| 0159* | #define 宏 | [cpp/define-macros.md](cpp/define-macros.md) |
| 0160* | typedef 与 using 类型别名 | [cpp/type-aliases.md](cpp/type-aliases.md) |
| 0176* | 预处理 | [cpp/preprocessing.md](cpp/preprocessing.md) |
| 0177* | 编译 | [cpp/compilation.md](cpp/compilation.md) |
| 0178* | 链接 | [cpp/linking.md](cpp/linking.md) |
| 0179* | constexpr | [cpp/constexpr.md](cpp/constexpr.md) |

### 02 算法基础

| ID | 知识点 | 文件 |
| --- | --- | --- |
| 0201e1 | 复杂度：渐近记号 | [algorithm-basics/asymptotic-notation.md](algorithm-basics/asymptotic-notation.md) |
| 0215* | 三分搜索 | `algorithm-basics/0215-ternary-search.md` |
| 0216* | 随机化算法 | `algorithm-basics/0216-randomized-algorithms.md` |
| 0217* | 整体二分与并行二分 | `algorithm-basics/0217-parallel-binary-search.md` |
| 0218* | CDQ 分治 | `algorithm-basics/0218-cdq-divide-and-conquer.md` |
| 0232e1 | 归并排序：逆序对计数 | `algorithm-basics/merge-sort-inversion-count.md` |
| 0233* | 排序：堆排序 | `algorithm-basics/0233-heap-sort.md` |
| 0234* | 排序：基数排序 | `algorithm-basics/0234-radix-sort.md` |
| 0235* | 排序：桶排序 | `algorithm-basics/0235-bucket-sort.md` |
| 0243* | 搜索：迭代加深 | `algorithm-basics/iterative-deepening.md` |
| 0244* | 搜索：A* | `algorithm-basics/a-star.md` |
| 0245* | 精确覆盖：Dancing Links（DLX） | `algorithm-basics/dancing-links.md` |
| 0246* | 随机化：爬山法 | `algorithm-basics/hill-climbing.md` |
| 0247* | 随机化：模拟退火 | `algorithm-basics/simulated-annealing.md` |
| 0248* | 工程：对拍 | `algorithm-basics/stress-testing.md` |

### 03 数据结构

| ID | 知识点 | 文件 |
| --- | --- | --- |
| 0305* | 线段树：懒标记的组合顺序 | [data-structures/segment-tree-lazy-tags.md](data-structures/segment-tree-lazy-tags.md) |
| 0312* | 可撤销并查集 | `data-structures/0312-rollback-disjoint-set.md` |
| 0313* | 分块 | `data-structures/0313-square-root-decomposition.md` |
| 0314* | 莫队算法 | `data-structures/0314-mo-algorithm.md` |
| 0315* | 线段树二分与树上下降 | `data-structures/0315-segment-tree-descent.md` |
| 0316* | 可持久化线段树 | `data-structures/0316-persistent-segment-tree.md` |
| 0317* | 动态开点线段树 | `data-structures/0317-dynamic-segment-tree.md` |
| 0318* | Segment Tree Beats | `data-structures/0318-segment-tree-beats.md` |
| 0319* | 树状数组的区间修改变体 | `data-structures/0319-fenwick-range-updates.md` |
| 0320* | 树状数组维护区间最值 | `data-structures/0320-fenwick-range-extrema.md` |
| 0321* | 左偏树 | `data-structures/0321-leftist-tree.md` |
| 0322* | Treap 与随机平衡树 | `data-structures/0322-treap.md` |
| 0323* | Splay | `data-structures/0323-splay.md` |
| 0324* | B 树与 B+ 树 | `data-structures/0324-b-tree-and-b-plus-tree.md` |
| 0325* | 笛卡尔树 | `data-structures/0325-cartesian-tree.md` |
| 0326* | Wavelet Matrix | `data-structures/0326-wavelet-matrix.md` |
| 0327* | 启发式合并（small-to-large） | `data-structures/0327-small-to-large-merging.md` |
| 0330* | 斜堆 | `data-structures/0330-skew-heap.md` |
| 0331* | 配对堆 | `data-structures/0331-pairing-heap.md` |
| 0332* | 可持久化并查集 | `data-structures/persistent-disjoint-set-union.md` |
| 0333* | 线段树：合并 | `data-structures/segment-tree-merging.md` |
| 0334* | 树套树：线段树套线段树 | `data-structures/segment-tree-of-segment-trees.md` |
| 0335* | 树套树：线段树套平衡树 | `data-structures/segment-tree-of-balanced-trees.md` |
| 0336* | 可持久化平衡树 | `data-structures/persistent-balanced-tree.md` |
| 0337* | 替罪羊树 | `data-structures/scapegoat-tree.md` |
| 0338* | 动态树：Link-Cut Tree | `data-structures/link-cut-tree.md` |
| 0339* | KD 树 | `data-structures/kd-tree.md` |
| 0340* | 链上分块 | `data-structures/chain-block-decomposition.md` |
| 0341* | 树上分块 | `data-structures/tree-block-decomposition.md` |

### 04 图论

| ID | 知识点 | 文件 |
| --- | --- | --- |
| 0412* | 二分图：最大匹配 | `graph-theory/0412-bipartite-matching.md` |
| 0412e1 | 二分图最大匹配：Hopcroft–Karp | `graph-theory/hopcroft-karp.md` |
| 0412e2 | 二分图最大权匹配：Kuhn–Munkres（KM） | `graph-theory/kuhn-munkres.md` |
| 0415* | 无向图：双连通分量与圆方树 | `graph-theory/0415-biconnected-components-block-cut-tree.md` |
| 0420* | 2-SAT | `graph-theory/0420-two-sat.md` |
| 0421* | 网络流：Dinic | `graph-theory/0421-dinic-max-flow.md` |
| 0422* | 最小费用最大流 | `graph-theory/0422-min-cost-max-flow.md` |
| 0423* | 虚树 | `graph-theory/0423-virtual-tree.md` |
| 0424* | 点分治 | `graph-theory/0424-centroid-decomposition.md` |
| 0425* | SPFA 与队列优化最短路 | `graph-theory/0425-spfa.md` |
| 0427* | DSU on Tree | `graph-theory/0427-dsu-on-tree.md` |
| 0428* | 差分约束 | `graph-theory/0428-difference-constraints.md` |
| 0430* | 树哈希 | `graph-theory/0430-tree-hashing.md` |
| 0438e1 | 哈密顿问题：小规模回溯 | [graph-theory/hamiltonian-backtracking.md](graph-theory/hamiltonian-backtracking.md) |
| 0449* | 最短路：最短路树 | `graph-theory/shortest-path-tree.md` |
| 0450* | 最小生成树：Borůvka | `graph-theory/boruvka.md` |
| 0451* | 网络流：SAP | `graph-theory/sap-max-flow.md` |
| 0452* | 网络流：可行流 | `graph-theory/feasible-flow.md` |
| 0453* | 网络流：上下界 | `graph-theory/bounded-flow.md` |
| 0454* | 竞赛图 | `graph-theory/tournament-graph.md` |
| 0455* | Steiner 树 | `graph-theory/steiner-tree.md` |
| 0456* | 仙人掌 | `graph-theory/cactus-graph.md` |
| 0457* | 有向最小生成树：Chu–Liu/Edmonds | `graph-theory/directed-minimum-spanning-tree.md` |
| 0458* | 一般图最大匹配 | `graph-theory/general-graph-matching.md` |
| 0459* | 最短路：$k$ 短路 | `graph-theory/k-shortest-paths.md` |
| 0460* | 支配树 | `graph-theory/dominator-tree.md` |
| 0461* | 无向图：全局最小割 | `graph-theory/global-minimum-cut.md` |
| 0462* | 弦图 | `graph-theory/chordal-graph.md` |
| 0463* | 树分治：边分治 | `graph-theory/edge-decomposition.md` |
| 0464* | 树分治：动态点分治 | `graph-theory/dynamic-centroid-decomposition.md` |
| 0465* | 长链剖分 | `graph-theory/long-chain-decomposition.md` |

### 05 数学

| ID | 知识点 | 文件 |
| --- | --- | --- |
| 0504e1 | 模运算：modint | [math/mod-int.md](math/mod-int.md) |
| 0505e1 | 杜教筛 | `math/du-jiao-sieve.md` |
| 0505e2 | Min_25 筛 | `math/min-25-sieve.md` |
| 0506e1 | 模逆元：线性预处理 | `math/linear-modular-inverses.md` |
| 0506e2 | 模逆元：批量求逆 | `math/batch-modular-inverses.md` |
| 0507e1 | 组合数：Lucas 定理 | `math/lucas-theorem.md` |
| 0507e2 | 组合数：扩展 Lucas 定理 | `math/extended-lucas-theorem.md` |
| 0508e1 | 扩展欧拉定理 | `math/extended-euler-theorem.md` |
| 0508e2 | 欧拉函数：筛法预处理 | `math/euler-totient-sieve.md` |
| 0513* | Nim、SG 函数与基础博弈论 | `math/0513-nim-sg-game-theory.md` |
| 0514* | XOR 线性基 | `math/0514-xor-linear-basis.md` |
| 0515* | 高斯消元 | `math/0515-gaussian-elimination.md` |
| 0517* | 多项式：NTT | `math/0517-ntt.md` |
| 0519* | BSGS 与离散对数 | `math/0519-discrete-logarithm.md` |
| 0519e1 | 离散对数：Pohlig–Hellman | `math/pohlig-hellman.md` |
| 0520* | 多项式：表示、加法与减法 | `math/0520-polynomial-representation-addition-subtraction.md` |
| 0521* | 多项式：卷积与朴素乘法 | `math/0521-convolution-naive-multiplication.md` |
| 0522* | 复数与单位根 | `math/0522-complex-numbers-roots-of-unity.md` |
| 0523* | 多项式：FFT | `math/0523-fft.md` |
| 0524* | 形式幂级数：求逆 | `math/0524-formal-power-series-inverse.md` |
| 0525* | 形式幂级数：形式导数 | `math/0525-formal-derivative.md` |
| 0526* | 形式幂级数：形式积分 | `math/0526-formal-integral.md` |
| 0527* | 形式幂级数：对数 | `math/0527-formal-power-series-logarithm.md` |
| 0528* | 形式幂级数：指数 | `math/0528-formal-power-series-exponential.md` |
| 0529* | 形式幂级数：平方根 | `math/0529-formal-power-series-square-root.md` |
| 0530* | 形式幂级数：幂 | `math/0530-formal-power-series-power.md` |
| 0531* | 多项式：除法与余数 | `math/0531-polynomial-division-remainder.md` |
| 0532* | 多项式：多点求值 | `math/0532-multipoint-evaluation.md` |
| 0533* | 多项式：插值 | `math/0533-polynomial-interpolation.md` |
| 0534* | 莫比乌斯反演 | `math/0534-mobius-inversion.md` |
| 0544e1 | 高精度整数：除法与余数 | `math/big-integer-division-remainder.md` |
| 0544e2 | 高精度整数：负数 | `math/big-integer-negative-numbers.md` |
| 0545* | 素性测试：Miller–Rabin | `math/miller-rabin.md` |
| 0546* | 整数分解：Pollard–Rho | `math/pollard-rho.md` |
| 0547* | 原根 | `math/primitive-roots.md` |
| 0548* | 二次剩余与勒让德符号 | `math/quadratic-residues-legendre-symbol.md` |
| 0549* | 二次剩余：Cipolla 算法 | `math/cipolla.md` |
| 0550* | 佩尔方程 | `math/pell-equation.md` |
| 0551* | 线性代数：行列式 | `math/determinant.md` |
| 0552* | 线性递推：Berlekamp–Massey | `math/berlekamp-massey.md` |
| 0553* | 图论计数：矩阵树定理 | `math/matrix-tree-theorem.md` |
| 0554* | 欧拉回路计数：BEST 定理 | `math/best-theorem.md` |
| 0555* | 树的编码：Prüfer 序列 | `math/prufer-sequence.md` |
| 0556* | 路径计数：LGV 引理 | `math/lindstrom-gessel-viennot-lemma.md` |
| 0557* | 生成函数：基础 | `math/generating-functions.md` |
| 0558* | 群论：置换 | `math/permutations.md` |
| 0559* | 群作用计数：Burnside 引理 | `math/burnside-lemma.md` |
| 0560* | 群作用计数：Pólya 定理 | `math/polya-enumeration.md` |
| 0561* | 线性规划 | `math/linear-programming.md` |
| 0562* | 组合计数：抽屉原理 | `math/pigeonhole-principle.md` |
| 0563* | 组合计数：最值容斥 | `math/min-max-inclusion-exclusion.md` |
| 0564* | 组合计数：二项式反演 | `math/binomial-inversion.md` |
| 0565* | 常见数列：错排数 | `math/derangement-numbers.md` |
| 0566* | 常见数列：Catalan 数 | `math/catalan-numbers.md` |
| 0567* | 常见数列：Stirling 数 | `math/stirling-numbers.md` |
| 0568* | 常见数列：Bell 数 | `math/bell-numbers.md` |
| 0569* | 常见数列：Bernoulli 数 | `math/bernoulli-numbers.md` |
| 0570* | 组合计数：杨表 | `math/young-tableaux.md` |
| 0571* | 数值积分：Simpson 公式 | `math/simpson-rule.md` |
| 0572* | 数值积分：自适应 Simpson | `math/adaptive-simpson.md` |
| 0573* | 集合幂级数：FWT/FMT | `math/fast-subset-transforms.md` |
| 0577* | 筛法：分段筛 | `math/segmented-sieve.md` |
| 0585e1 | 线性变换：齐次坐标与仿射变换 | [math/homogeneous-coordinates-affine-transformations.md](math/homogeneous-coordinates-affine-transformations.md) |

### 06 计算几何

| ID | 知识点 | 文件 |
| --- | --- | --- |
| 0606* | 圆与圆的关系 | `computational-geometry/0606-circles.md` |
| 0607* | 旋转卡壳 | `computational-geometry/0607-rotating-calipers.md` |
| 0608* | 几何扫描线 | `computational-geometry/0608-geometric-sweep-line.md` |
| 0609* | 最近点对 | `computational-geometry/0609-closest-pair-of-points.md` |
| 0610* | 凸多边形：点包含 | `computational-geometry/0610-point-in-convex-polygon.md` |
| 0611* | 凸多边形：切线与极值查询 | `computational-geometry/0611-convex-polygon-tangents-extrema.md` |
| 0612* | 半平面交 | `computational-geometry/0612-half-plane-intersection.md` |
| 0613* | 闵可夫斯基和 | `computational-geometry/0613-minkowski-sum.md` |
| 0614* | 极角排序 | `computational-geometry/polar-angle-sort.md` |
| 0615* | 圆：切线 | `computational-geometry/circle-tangents.md` |
| 0616* | 圆：面积交与面积并 | `computational-geometry/circle-area-intersection-union.md` |
| 0617* | 三维计算几何 | `computational-geometry/three-dimensional-geometry.md` |
| 0618* | 平面点定位 | `computational-geometry/point-location.md` |
| 0619* | 最小圆覆盖 | `computational-geometry/minimum-enclosing-circle.md` |
| 0620* | Voronoi 图 | `computational-geometry/voronoi-diagram.md` |
| 0621* | 反演几何 | `computational-geometry/inversive-geometry.md` |
| 0622* | Pick 定理 | `computational-geometry/pick-theorem.md` |

### 07 动态规划

| ID | 知识点 | 文件 |
| --- | --- | --- |
| 0704e1 | 最长上升子序列：$O(n\log n)$ 优化 | `dynamic-programming/lis-n-log-n.md` |
| 0712* | 动态规划优化：斜率 | `dynamic-programming/0712-convex-hull-trick.md` |
| 0713* | 动态规划优化：分治 | `dynamic-programming/0713-divide-conquer-optimization.md` |
| 0714* | 动态规划：Slope Trick | `dynamic-programming/0714-slope-trick.md` |
| 0718* | 记忆化搜索 | `dynamic-programming/memoized-search.md` |
| 0719* | 背包：分组背包 | `dynamic-programming/group-knapsack.md` |
| 0720* | 背包：混合背包 | `dynamic-programming/mixed-knapsack.md` |
| 0721* | 背包：多维背包 | `dynamic-programming/multidimensional-knapsack.md` |
| 0722* | 背包：树上背包 | `dynamic-programming/tree-knapsack.md` |
| 0723* | 状态压缩：轮廓线 DP | `dynamic-programming/profile-dp.md` |
| 0724* | 状态压缩：插头 DP | `dynamic-programming/plug-dp.md` |
| 0725* | 括号序列 DP | `dynamic-programming/bracket-sequence-dp.md` |
| 0726* | 自动机 DP | `dynamic-programming/automaton-dp.md` |
| 0727* | 划分 DP | `dynamic-programming/partition-dp.md` |
| 0728* | 动态 DP | `dynamic-programming/dynamic-dp.md` |
| 0729* | 动态规划优化：单调栈 | `dynamic-programming/monotone-stack-optimization.md` |
| 0730* | 动态规划优化：四边形不等式 | `dynamic-programming/quadrangle-inequality-optimization.md` |

### 08 字符串

| ID | 知识点 | 文件 |
| --- | --- | --- |
| 0807* | 字符串：AC 自动机 | `strings/0807-aho-corasick.md` |
| 0808* | 字符串：Manacher | `strings/0808-manacher.md` |
| 0809* | 字符串：后缀数组 | `strings/0809-suffix-array.md` |
| 0810* | 字符串：后缀自动机 | `strings/0810-suffix-automaton.md` |
| 0811* | 字符串：回文树 | `strings/0811-palindromic-tree.md` |
| 0812* | 字符串：后缀树 | `strings/0812-suffix-tree.md` |
| 0813* | 最小表示法 | `strings/minimum-representation.md` |
| 0814* | Lyndon 分解 | `strings/lyndon-factorization.md` |
