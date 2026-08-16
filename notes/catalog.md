# 按模块浏览

这里是教程正文的唯一知识注册表。文章 ID 按模块稳定编号，不表示学习先后；核心教程的推荐顺序见 [learning-path.md](learning-path.md)。

四位数字 ID 表示核心教程，带 `*` 的 ID 表示独立扩展专题。直接配套某篇基础文章的扩展使用 `e1`、`e2` 等后缀并共享基础编号，同时保留星号，例如 `0102e1*`；配套扩展不进入学习路线或扩展阅读索引，但由本模块目录完整收录，也不占用新的四位编号。`计划` 节点尚未创建文件，因此文件列只显示预定路径；已有正文的节点使用可点击链接。正文尚未齐全时不维护前置编号，等实际引用稳定后再统一梳理。

新规范建立前形成的遗留草稿已经全部完成首次正式修订；下方空标记保留给目录校验脚本。

<!-- legacy-drafts: -->

## 下标与区间约定

本书自定义的对象默认从 1 开始编号并使用闭区间；讲解 C++ 与 STL 接口时，保留其原生的从 0 开始编号和左闭右开区间。完整的容量、哨兵和接口转换规则见 [学习路线中的约定](learning-path.md#下标与区间约定)。

## 01 C++ 基础

### 知识族：程序入门

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0101 | Hello World! | 定稿 | [hello-world.md](cpp/hello-world.md) |
| 0158 | A+B Problem | 待审阅 | [a-plus-b-problem.md](cpp/a-plus-b-problem.md) |

### 知识族：基本类型与机器表示

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0102 | 整数类型 | 定稿 | [integer-types.md](cpp/integer-types.md) |
| 0102e1* | 位、字节与存储单位 | 定稿 | [bits-bytes-and-storage-units.md](cpp/bits-bytes-and-storage-units.md) |
| 0102e2* | 整数的二进制表示 | 定稿 | [signed-integer-representations.md](cpp/signed-integer-representations.md) |
| 0102e3* | 整数类型的位宽与平台差异 | 定稿 | [integer-type-widths.md](cpp/integer-type-widths.md) |
| 0103 | 浮点类型 | 定稿 | [floating-point-types.md](cpp/floating-point-types.md) |
| 0103e1* | IEEE 754 浮点数表示 | 定稿 | [ieee-754.md](cpp/ieee-754.md) |
| 0104 | 字符类型 | 待审阅 | [character-types.md](cpp/character-types.md) |
| 0105 | 布尔类型 | 待审阅 | [boolean-type.md](cpp/boolean-type.md) |
| 0110 | 类型转换 | 待审阅 | [type-conversions.md](cpp/type-conversions.md) |

### 知识族：变量、常量与字面量

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0106 | 变量 | 待审阅 | [variable-declaration-initialization.md](cpp/variable-declaration-initialization.md) |
| 0128 | 常量 | 待审阅 | [const.md](cpp/const.md) |
| 0161 | 字面量 | 待审阅 | [literals.md](cpp/literals.md) |

### 知识族：表达式与控制流

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0107 | 算术运算符 | 待审阅 | [arithmetic-operators.md](cpp/arithmetic-operators.md) |
| 0108 | 比较运算符 | 待审阅 | [comparison-operators.md](cpp/comparison-operators.md) |
| 0109 | 逻辑运算符 | 待审阅 | [logical-operators.md](cpp/logical-operators.md) |
| 0164 | 自增与自减运算符 | 待审阅 | [increment-decrement-operators.md](cpp/increment-decrement-operators.md) |
| 0165 | 复合赋值运算符 | 待审阅 | [compound-assignment-operators.md](cpp/compound-assignment-operators.md) |
| 0133 | 位运算符 | 待审阅 | [bitwise-operators.md](cpp/bitwise-operators.md) |
| 0111 | if 与 else | 待审阅 | [conditional-branches.md](cpp/conditional-branches.md) |
| 0166 | switch | 待审阅 | [switch.md](cpp/switch.md) |
| 0167 | while | 待审阅 | [while.md](cpp/while.md) |
| 0112 | for | 待审阅 | [loops.md](cpp/loops.md) |
| 0168 | do while | 待审阅 | [do-while.md](cpp/do-while.md) |

### 知识族：函数与输入输出

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0113 | 函数的定义与调用 | 待审阅 | [function-definition-and-calls.md](cpp/function-definition-and-calls.md) |
| 0169 | 函数的返回值 | 待审阅 | [function-return-values.md](cpp/function-return-values.md) |
| 0170 | 函数的形参与实参 | 待审阅 | [function-parameters-and-arguments.md](cpp/function-parameters-and-arguments.md) |
| 0171 | 关键字与标识符 | 待审阅 | [keywords-and-identifiers.md](cpp/keywords-and-identifiers.md) |
| 0114 | 作用域 | 待审阅 | [scope.md](cpp/scope.md) |
| 0115 | 标准输入 | 待审阅 | [standard-input.md](cpp/standard-input.md) |
| 0116 | 标准输出 | 待审阅 | [standard-output.md](cpp/standard-output.md) |
| 0172 | 输出格式控制 | 待审阅 | [output-formatting.md](cpp/output-formatting.md) |
| 0173 | 整行输入 | 待审阅 | [whole-line-input.md](cpp/whole-line-input.md) |
| 0117 | 文件重定向 | 待审阅 | [file-redirection.md](cpp/file-redirection.md) |

### 知识族：数组、字符串与结构体

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0118 | 一维数组 | 待审阅 | [one-dimensional-arrays.md](cpp/one-dimensional-arrays.md) |
| 0119 | 多维数组 | 待审阅 | [multidimensional-arrays.md](cpp/multidimensional-arrays.md) |
| 0119e1* | 多维数组的布局与参数传递 | 待审阅 | [multidimensional-array-layout-and-parameters.md](cpp/multidimensional-array-layout-and-parameters.md) |
| 0120 | C 字符串 | 待审阅 | [c-strings.md](cpp/c-strings.md) |
| 0121 | 结构体 | 待审阅 | [struct.md](cpp/struct.md) |
| 0175 | 结构体指针与箭头运算符 | 待审阅 | [struct-pointers-and-arrow.md](cpp/struct-pointers-and-arrow.md) |
| 0121e1* | 结构体的内存布局 | 待审阅 | [struct-memory-layout.md](cpp/struct-memory-layout.md) |

### 知识族：内存、别名与递归

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0124 | 字节寻址 | 待审阅 | [byte-addressing.md](cpp/byte-addressing.md) |
| 0125 | 指针 | 待审阅 | [pointers.md](cpp/pointers.md) |
| 0126 | 引用 | 待审阅 | [references.md](cpp/references.md) |
| 0174 | 指针与引用中的 const | 待审阅 | [const-pointers-and-references.md](cpp/const-pointers-and-references.md) |
| 0127 | 参数传递 | 待审阅 | [parameter-passing.md](cpp/parameter-passing.md) |
| 0129 | static 局部变量 | 待审阅 | [static-local-variables.md](cpp/static-local-variables.md) |
| 0130 | 竞赛程序的常见内存分区 | 待审阅 | [competitive-program-memory-layout.md](cpp/competitive-program-memory-layout.md) |
| 0131 | 调用栈 | 待审阅 | [function-call-stack.md](cpp/function-call-stack.md) |
| 0132 | 递归 | 待审阅 | [recursion.md](cpp/recursion.md) |

### 知识族：STL 工具与容器

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0134 | pair | 待审阅 | [pair.md](cpp/pair.md) |
| 0135 | tuple | 待审阅 | [tuple.md](cpp/tuple.md) |
| 0136* | array | 待审阅 | [array.md](cpp/array.md) |
| 0137 | string | 待审阅 | [string.md](cpp/string.md) |
| 0138 | vector | 待审阅 | [vector.md](cpp/vector.md) |
| 0139 | deque | 待审阅 | [deque.md](cpp/deque.md) |
| 0140 | sort | 待审阅 | [sorting.md](cpp/sorting.md) |
| 0141 | unique | 待审阅 | [deduplication.md](cpp/deduplication.md) |
| 0162 | 标准库二分查找 | 待审阅 | [stl-binary-search.md](cpp/stl-binary-search.md) |
| 0163 | fill | 待审阅 | [fill.md](cpp/fill.md) |
| 0142 | stack | 待审阅 | [stack.md](cpp/stack.md) |
| 0143 | queue | 待审阅 | [queue.md](cpp/queue.md) |
| 0144 | priority_queue | 待审阅 | [priority-queue.md](cpp/priority-queue.md) |
| 0145 | set | 待审阅 | [set.md](cpp/set.md) |
| 0146 | multiset | 待审阅 | [multiset.md](cpp/multiset.md) |
| 0147 | map | 待审阅 | [map.md](cpp/map.md) |
| 0148 | multimap | 待审阅 | [multimap.md](cpp/multimap.md) |
| 0149 | unordered_set | 待审阅 | [unordered-set.md](cpp/unordered-set.md) |
| 0150 | unordered_map | 待审阅 | [unordered-map.md](cpp/unordered-map.md) |
| 0151 | bitset | 待审阅 | [bitset.md](cpp/bitset.md) |
| 0156* | order-statistics tree（GNU PBDS） | 计划 | `cpp/gnu-pbds.md` |

### 知识族：C++ 扩展阅读

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0180* | 类与对象 | 待审阅 | [class.md](cpp/class.md) |
| 0181* | 类的成员 | 待审阅 | [class-members.md](cpp/class-members.md) |
| 0182* | 访问权限 | 待审阅 | [class-access-control.md](cpp/class-access-control.md) |
| 0183* | 构造函数 | 待审阅 | [constructors.md](cpp/constructors.md) |
| 0184* | 析构函数 | 待审阅 | [destructors.md](cpp/destructors.md) |
| 0185* | 函数重载与运算符重载 | 待审阅 | [overloading.md](cpp/overloading.md) |
| 0186* | 继承 | 待审阅 | [inheritance.md](cpp/inheritance.md) |
| 0187* | 多态 | 待审阅 | [polymorphism.md](cpp/polymorphism.md) |
| 0122* | 联合体 | 待审阅 | [union.md](cpp/union.md) |
| 0123* | 枚举 | 待审阅 | [enum.md](cpp/enum.md) |
| 0152* | 预处理：#include | 待审阅 | [include.md](cpp/include.md) |
| 0153* | 命名空间与 std | 待审阅 | [namespace-and-std.md](cpp/namespace-and-std.md) |
| 0154* | inline | 待审阅 | [inline.md](cpp/inline.md) |
| 0155* | volatile | 待审阅 | [volatile.md](cpp/volatile.md) |
| 0157* | 对象生命周期 | 待审阅 | [object-lifetime.md](cpp/object-lifetime.md) |
| 0159* | 预处理：#define | 待审阅 | [define-macros.md](cpp/define-macros.md) |
| 0160* | typedef 类型别名 | 待审阅 | [type-aliases.md](cpp/type-aliases.md) |
| 0188* | using 类型别名 | 待审阅 | [using-type-aliases.md](cpp/using-type-aliases.md) |
| 0176* | 预处理 | 待审阅 | [preprocessing.md](cpp/preprocessing.md) |
| 0189* | 条件编译 | 待审阅 | [conditional-compilation.md](cpp/conditional-compilation.md) |
| 0177* | 编译 | 待审阅 | [compilation.md](cpp/compilation.md) |
| 0178* | 链接 | 待审阅 | [linking.md](cpp/linking.md) |
| 0179* | constexpr | 待审阅 | [constexpr.md](cpp/constexpr.md) |

## 02 算法基础

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0201 | 复杂度 | 待审阅 | [complexity.md](algorithm-basics/complexity.md) |
| 0201e1* | 渐近记号 | 待审阅 | [asymptotic-notation.md](algorithm-basics/asymptotic-notation.md) |
| 0202 | 递推 | 待审阅 | [recurrence.md](algorithm-basics/recurrence.md) |
| 0203 | 冒泡排序 | 待审阅 | [sorting.md](algorithm-basics/sorting.md) |
| 0204 | 二分查找 | 待审阅 | [binary-search.md](algorithm-basics/binary-search.md) |
| 0205 | 双指针 | 待审阅 | [two-pointers.md](algorithm-basics/two-pointers.md) |
| 0206 | 离散化 | 待审阅 | [coordinate-compression.md](algorithm-basics/coordinate-compression.md) |
| 0207 | 前缀和 | 定稿 | [prefix-sums.md](algorithm-basics/prefix-sums.md) |
| 0208 | 贪心选择与正确性证明 | 待审阅 | [greedy-selection-and-proof.md](algorithm-basics/greedy-selection-and-proof.md) |
| 0209 | 分治 | 待审阅 | [divide-and-conquer.md](algorithm-basics/divide-and-conquer.md) |
| 0210 | 枚举 | 待审阅 | [enumeration.md](algorithm-basics/enumeration.md) |
| 0211 | 子集与位掩码枚举 | 待审阅 | [subset-bitmask-enumeration.md](algorithm-basics/subset-bitmask-enumeration.md) |
| 0212 | 枚举：Meet-in-the-Middle | 计划 | `algorithm-basics/0212-meet-in-the-middle.md` |
| 0213 | 离线算法 | 计划 | `algorithm-basics/0213-offline-algorithms.md` |
| 0214 | 扫描线与事件排序 | 计划 | `algorithm-basics/0214-sweep-line.md` |
| 0215* | 三分搜索 | 计划 | `algorithm-basics/0215-ternary-search.md` |
| 0216* | 随机化算法 | 计划 | `algorithm-basics/0216-randomized-algorithms.md` |
| 0217* | 整体二分与并行二分 | 计划 | `algorithm-basics/0217-parallel-binary-search.md` |
| 0218* | CDQ 分治 | 计划 | `algorithm-basics/0218-cdq-divide-and-conquer.md` |
| 0219 | 二分答案 | 待审阅 | [binary-search-on-answer.md](algorithm-basics/binary-search-on-answer.md) |
| 0220 | 滑动窗口 | 待审阅 | [sliding-window.md](algorithm-basics/sliding-window.md) |
| 0221 | 差分 | 待审阅 | [difference-array.md](algorithm-basics/difference-array.md) |
| 0222 | 模拟 | 待审阅 | [simulation.md](algorithm-basics/simulation.md) |
| 0223 | 数组 | 待审阅 | [array.md](algorithm-basics/array.md) |
| 0224 | 链表 | 待审阅 | [linked-list.md](algorithm-basics/linked-list.md) |
| 0225 | 栈 | 待审阅 | [stack.md](algorithm-basics/stack.md) |
| 0226 | 队列 | 待审阅 | [queue.md](algorithm-basics/queue.md) |
| 0227 | 二叉堆 | 待审阅 | [binary-heap.md](algorithm-basics/binary-heap.md) |
| 0228 | 哈希表 | 待审阅 | [hash-table.md](algorithm-basics/hash-table.md) |
| 0229 | 单调栈 | 待审阅 | [monotonic-stack.md](algorithm-basics/monotonic-stack.md) |
| 0230 | 单调队列 | 待审阅 | [monotonic-queue.md](algorithm-basics/monotonic-queue.md) |
| 0231 | 快速排序 | 待审阅 | [quicksort.md](algorithm-basics/quicksort.md) |
| 0232 | 归并排序 | 待审阅 | [merge-sort.md](algorithm-basics/merge-sort.md) |
| 0232e1* | 用归并排序统计逆序对 | 计划 | `algorithm-basics/merge-sort-inversion-count.md` |
| 0233* | 堆排序 | 计划 | `algorithm-basics/0233-heap-sort.md` |
| 0234* | 基数排序 | 计划 | `algorithm-basics/0234-radix-sort.md` |
| 0235* | 桶排序 | 计划 | `algorithm-basics/0235-bucket-sort.md` |
| 0236 | 出栈序列判定 | 待审阅 | [stack-pop-sequence-validation.md](algorithm-basics/stack-pop-sequence-validation.md) |
| 0237 | 表达式求值 | 待审阅 | [expression-evaluation.md](algorithm-basics/expression-evaluation.md) |
| 0238 | 邻项交换证明 | 计划 | `algorithm-basics/greedy-adjacent-exchange.md` |
| 0239 | 反悔贪心 | 计划 | `algorithm-basics/greedy-regret.md` |
| 0242 | 倍增：基础 | 待审阅 | [doubling.md](algorithm-basics/doubling.md) |
| 0243* | 搜索：迭代加深 | 计划 | `algorithm-basics/iterative-deepening.md` |
| 0244* | 搜索：A* | 计划 | `algorithm-basics/a-star.md` |
| 0245* | 精确覆盖：Dancing Links（DLX） | 计划 | `algorithm-basics/dancing-links.md` |
| 0246* | 随机化：爬山法 | 计划 | `algorithm-basics/hill-climbing.md` |
| 0247* | 随机化：模拟退火 | 计划 | `algorithm-basics/simulated-annealing.md` |
| 0248* | 工程：对拍 | 计划 | `algorithm-basics/stress-testing.md` |
| 0250 | 递归与问题分解 | 待审阅 | [recursive-problem-solving.md](algorithm-basics/recursive-problem-solving.md) |
| 0251 | 二分边界 | 待审阅 | [binary-search-boundaries.md](algorithm-basics/binary-search-boundaries.md) |
| 0252 | 浮点数二分 | 待审阅 | [floating-point-binary-search.md](algorithm-basics/floating-point-binary-search.md) |
| 0253 | 双端队列 | 待审阅 | [deque.md](algorithm-basics/deque.md) |
| 0254 | 从代码分析复杂度 | 待审阅 | [complexity-analysis.md](algorithm-basics/complexity-analysis.md) |
| 0255 | 均摊复杂度 | 计划 | `algorithm-basics/amortized-complexity.md` |
| 0256 | 均摊复杂度：势能法 | 计划 | `algorithm-basics/potential-method.md` |
| 0257 | 选择排序 | 待审阅 | [selection-sort.md](algorithm-basics/selection-sort.md) |
| 0258 | 插入排序 | 待审阅 | [insertion-sort.md](algorithm-basics/insertion-sort.md) |
| 0259 | 计数排序 | 待审阅 | [counting-sort.md](algorithm-basics/counting-sort.md) |
| 0260 | 排序方法比较 | 待审阅 | [sorting-comparison.md](algorithm-basics/sorting-comparison.md) |

## 03 数据结构

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0304 | 线段树：基础 | 待审阅 | [data-structures/segment-tree.md](data-structures/segment-tree.md) |
| 0305* | 线段树：懒标记的组合顺序 | 待审阅 | [data-structures/segment-tree-lazy-tags.md](data-structures/segment-tree-lazy-tags.md) |
| 0306 | 树状数组：基础 | 待审阅 | [data-structures/fenwick-tree.md](data-structures/fenwick-tree.md) |
| 0307 | 并查集：基础 | 待审阅 | [disjoint-set-union.md](data-structures/disjoint-set-union.md) |
| 0308 | 稀疏表（ST 表） | 待审阅 | [sparse-table.md](data-structures/sparse-table.md) |
| 0309 | 并查集：扩展域 | 计划 | `data-structures/extended-domain-disjoint-set.md` |
| 0310 | 并查集：带权 | 计划 | `data-structures/weighted-disjoint-set.md` |
| 0311 | 二叉树：结构与存储 | 定稿 | [binary-tree-structure-and-storage.md](data-structures/binary-tree-structure-and-storage.md) |
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
| 0328 | 二叉树的遍历：前序、中序与后序 | 定稿 | [binary-tree-traversals.md](data-structures/binary-tree-traversals.md) |
| 0330* | 斜堆 | 计划 | `data-structures/0330-skew-heap.md` |
| 0331* | 配对堆 | 计划 | `data-structures/0331-pairing-heap.md` |
| 0332* | 可持久化并查集 | 计划 | `data-structures/persistent-disjoint-set-union.md` |
| 0333* | 线段树：合并 | 计划 | `data-structures/segment-tree-merging.md` |
| 0334* | 树套树：线段树套线段树 | 计划 | `data-structures/segment-tree-of-segment-trees.md` |
| 0335* | 树套树：线段树套平衡树 | 计划 | `data-structures/segment-tree-of-balanced-trees.md` |
| 0336* | 可持久化平衡树 | 计划 | `data-structures/persistent-balanced-tree.md` |
| 0337* | 替罪羊树 | 计划 | `data-structures/scapegoat-tree.md` |
| 0338* | 动态树：Link-Cut Tree | 计划 | `data-structures/link-cut-tree.md` |
| 0339* | KD 树 | 计划 | `data-structures/kd-tree.md` |
| 0340* | 链上分块 | 计划 | `data-structures/chain-block-decomposition.md` |
| 0341* | 树上分块 | 计划 | `data-structures/tree-block-decomposition.md` |

## 04 图论

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0401 | 点与边 | 待审阅 | [vertices-and-edges.md](graph-theory/vertices-and-edges.md) |
| 0402 | 图的存储：基础概念 | 待审阅 | [graph-representation.md](graph-theory/graph-representation.md) |
| 0403 | 树上查询：倍增 LCA | 定稿 | [lca-binary-lifting.md](graph-theory/lca-binary-lifting.md) |
| 0404 | 连通块 | 待审阅 | [connected-components.md](graph-theory/connected-components.md) |
| 0405 | 有向无环图：拓扑排序 | 待审阅 | [topological-sort.md](graph-theory/topological-sort.md) |
| 0406 | 图的遍历：多源 BFS | 待审阅 | [multi-source-bfs.md](graph-theory/multi-source-bfs.md) |
| 0407 | 最短路：Dijkstra | 计划 | `graph-theory/0407-dijkstra.md` |
| 0408 | 最短路：Bellman–Ford 与负环 | 计划 | `graph-theory/0408-bellman-ford.md` |
| 0409 | 最短路：Floyd–Warshall | 计划 | `graph-theory/0409-floyd-warshall.md` |
| 0410 | 最小生成树：Kruskal | 计划 | `graph-theory/0410-kruskal.md` |
| 0411 | 二分图：判定 | 待审阅 | [bipartite-graph.md](graph-theory/bipartite-graph.md) |
| 0412* | 二分图：最大匹配 | 计划 | `graph-theory/0412-bipartite-matching.md` |
| 0412e1* | 二分图最大匹配：Hopcroft–Karp | 计划 | `graph-theory/hopcroft-karp.md` |
| 0412e2* | 二分图最大权匹配：Kuhn–Munkres（KM） | 计划 | `graph-theory/kuhn-munkres.md` |
| 0413 | 有向图：强连通分量 | 计划 | `graph-theory/0413-strongly-connected-components.md` |
| 0414 | 无向图：割点与桥 | 计划 | `graph-theory/0414-articulation-points-bridges.md` |
| 0415* | 无向图：双连通分量与圆方树 | 计划 | `graph-theory/0415-biconnected-components-block-cut-tree.md` |
| 0416 | 欧拉问题：路径、回路与图 | 定稿 | [eulerian-paths-and-circuits.md](graph-theory/eulerian-paths-and-circuits.md) |
| 0417 | 树：直径与中心 | 待审阅 | [tree-diameter-center.md](graph-theory/tree-diameter-center.md) |
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
| 0431 | 路径与环 | 待审阅 | [paths-and-cycles.md](graph-theory/paths-and-cycles.md) |
| 0432 | 度数 | 待审阅 | [vertex-degrees.md](graph-theory/vertex-degrees.md) |
| 0433 | 无根树 | 待审阅 | [unrooted-trees.md](graph-theory/unrooted-trees.md) |
| 0434 | 树的遍历：深度优先搜索（DFS） | 定稿 | [tree-depth-first-search.md](graph-theory/tree-depth-first-search.md) |
| 0435 | 树的遍历：广度优先搜索（BFS） | 定稿 | [tree-breadth-first-search.md](graph-theory/tree-breadth-first-search.md) |
| 0436 | 图的遍历：深度优先搜索（DFS） | 待审阅 | [graph-depth-first-search.md](graph-theory/graph-depth-first-search.md) |
| 0437 | 图的遍历：广度优先搜索（BFS） | 待审阅 | [graph-breadth-first-search.md](graph-theory/graph-breadth-first-search.md) |
| 0438 | 哈密顿问题：路径、回路与图 | 定稿 | [hamiltonian-paths-and-circuits.md](graph-theory/hamiltonian-paths-and-circuits.md) |
| 0438e1* | 哈密顿问题：小规模回溯 | 定稿 | [hamiltonian-backtracking.md](graph-theory/hamiltonian-backtracking.md) |
| 0439 | 图的存储：邻接表（vector 实现） | 待审阅 | [vector-adjacency-list.md](graph-theory/vector-adjacency-list.md) |
| 0440 | 图的存储：邻接表（链式前向星实现） | 定稿 | [chained-forward-star.md](graph-theory/chained-forward-star.md) |
| 0441 | 图的存储：边集 | 定稿 | [edge-list.md](graph-theory/edge-list.md) |
| 0442 | 有根树 | 待审阅 | [rooted-trees.md](graph-theory/rooted-trees.md) |
| 0443 | DFS、回溯与剪枝 | 待审阅 | [dfs-backtracking-pruning.md](graph-theory/dfs-backtracking-pruning.md) |
| 0444 | 最短路：0-1 BFS | 待审阅 | [zero-one-bfs.md](graph-theory/zero-one-bfs.md) |
| 0445 | 树：重心 | 待审阅 | [tree-centroid.md](graph-theory/tree-centroid.md) |
| 0446 | 树上技巧：树上差分 | 计划 | `graph-theory/0446-tree-difference.md` |
| 0447 | 图：函数图 | 计划 | `graph-theory/0447-functional-graph.md` |
| 0448 | 最小生成树：Prim | 计划 | `graph-theory/0448-prim.md` |
| 0449* | 最短路：最短路树 | 计划 | `graph-theory/shortest-path-tree.md` |
| 0450* | 最小生成树：Borůvka | 计划 | `graph-theory/boruvka.md` |
| 0451* | 网络流：SAP | 计划 | `graph-theory/sap-max-flow.md` |
| 0452* | 网络流：可行流 | 计划 | `graph-theory/feasible-flow.md` |
| 0453* | 网络流：上下界 | 计划 | `graph-theory/bounded-flow.md` |
| 0454* | 竞赛图 | 计划 | `graph-theory/tournament-graph.md` |
| 0455* | Steiner 树 | 计划 | `graph-theory/steiner-tree.md` |
| 0456* | 仙人掌 | 计划 | `graph-theory/cactus-graph.md` |
| 0457* | 有向最小生成树：Chu–Liu/Edmonds | 计划 | `graph-theory/directed-minimum-spanning-tree.md` |
| 0458* | 一般图最大匹配 | 计划 | `graph-theory/general-graph-matching.md` |
| 0459* | 最短路：$k$ 短路 | 计划 | `graph-theory/k-shortest-paths.md` |
| 0460* | 支配树 | 计划 | `graph-theory/dominator-tree.md` |
| 0461* | 无向图：全局最小割 | 计划 | `graph-theory/global-minimum-cut.md` |
| 0462* | 弦图 | 计划 | `graph-theory/chordal-graph.md` |
| 0463* | 树分治：边分治 | 计划 | `graph-theory/edge-decomposition.md` |
| 0464* | 树分治：动态点分治 | 计划 | `graph-theory/dynamic-centroid-decomposition.md` |
| 0465* | 长链剖分 | 计划 | `graph-theory/long-chain-decomposition.md` |

## 05 数学

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0501 | 整除 | 待审阅 | [divisibility.md](math/divisibility.md) |
| 0502 | 质数 | 待审阅 | [prime-numbers.md](math/prime-numbers.md) |
| 0503 | 数论：扩展欧几里得算法 | 待审阅 | [extended-euclidean-algorithm.md](math/extended-euclidean-algorithm.md) |
| 0504 | 模运算 | 待审阅 | [modular-arithmetic.md](math/modular-arithmetic.md) |
| 0504e1* | 模运算：modint | 待审阅 | [mod-int.md](math/mod-int.md) |
| 0505 | 筛法：埃氏筛 | 待审阅 | [sieve-of-eratosthenes.md](math/sieve-of-eratosthenes.md) |
| 0505e1* | 杜教筛 | 计划 | `math/du-jiao-sieve.md` |
| 0505e2* | Min_25 筛 | 计划 | `math/min-25-sieve.md` |
| 0506 | 模逆元 | 待审阅 | [modular-inverse.md](math/modular-inverse.md) |
| 0506e1* | 模逆元：线性预处理 | 计划 | `math/linear-modular-inverses.md` |
| 0506e2* | 模逆元：批量求逆 | 计划 | `math/batch-modular-inverses.md` |
| 0507 | 组合数：定义与递推 | 待审阅 | [binomial-coefficients.md](math/binomial-coefficients.md) |
| 0507e1* | 组合数：Lucas 定理 | 计划 | `math/lucas-theorem.md` |
| 0507e2* | 组合数：扩展 Lucas 定理 | 计划 | `math/extended-lucas-theorem.md` |
| 0508 | 欧拉函数 | 待审阅 | [euler-totient.md](math/euler-totient.md) |
| 0508e1* | 扩展欧拉定理 | 计划 | `math/extended-euler-theorem.md` |
| 0508e2* | 欧拉函数：筛法预处理 | 计划 | `math/euler-totient-sieve.md` |
| 0509 | 矩阵：表示 | 待审阅 | [matrix-representation.md](math/matrix-representation.md) |
| 0510 | 数论：中国剩余定理（CRT） | 待审阅 | [chinese-remainder-theorem.md](math/chinese-remainder-theorem.md) |
| 0511 | 矩阵快速幂 | 待审阅 | [matrix-exponentiation.md](math/matrix-exponentiation.md) |
| 0512 | 概率与期望基础 | 计划 | `math/0512-probability-expectation.md` |
| 0513* | Nim、SG 函数与基础博弈论 | 计划 | `math/0513-nim-sg-game-theory.md` |
| 0514* | XOR 线性基 | 计划 | `math/0514-xor-linear-basis.md` |
| 0515* | 高斯消元 | 计划 | `math/0515-gaussian-elimination.md` |
| 0516 | 容斥原理 | 计划 | `math/0516-inclusion-exclusion.md` |
| 0517* | 多项式：NTT | 计划 | `math/0517-ntt.md` |
| 0518 | 莫比乌斯函数 | 待审阅 | [mobius-function.md](math/mobius-function.md) |
| 0519* | BSGS 与离散对数 | 计划 | `math/0519-discrete-logarithm.md` |
| 0519e1* | 离散对数：Pohlig–Hellman | 计划 | `math/pohlig-hellman.md` |
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
| 0535 | 算术基本定理 | 待审阅 | [fundamental-theorem-of-arithmetic.md](math/fundamental-theorem-of-arithmetic.md) |
| 0536 | 最大公约数与最小公倍数 | 待审阅 | [greatest-common-divisor-and-least-common-multiple.md](math/greatest-common-divisor-and-least-common-multiple.md) |
| 0537 | 欧几里得算法 | 待审阅 | [euclidean-algorithm.md](math/euclidean-algorithm.md) |
| 0538 | 数论：扩展中国剩余定理（exCRT） | 待审阅 | [extended-chinese-remainder-theorem.md](math/extended-chinese-remainder-theorem.md) |
| 0539 | 质因数分解 | 待审阅 | [prime-factorization.md](math/prime-factorization.md) |
| 0540 | 正因数个数 | 待审阅 | [divisor-count.md](math/divisor-count.md) |
| 0541 | 正因数和 | 待审阅 | [divisor-sum.md](math/divisor-sum.md) |
| 0542 | 线性不定方程 | 待审阅 | [linear-diophantine-equations.md](math/linear-diophantine-equations.md) |
| 0543 | 线性同余方程 | 待审阅 | [linear-congruences.md](math/linear-congruences.md) |
| 0544 | 高精度整数：加法、减法与乘法 | 待审阅 | [big-integer-addition-subtraction-multiplication.md](math/big-integer-addition-subtraction-multiplication.md) |
| 0544e1* | 高精度整数：除法与余数 | 计划 | `math/big-integer-division-remainder.md` |
| 0544e2* | 高精度整数：负数 | 计划 | `math/big-integer-negative-numbers.md` |
| 0545* | 素性测试：Miller–Rabin | 计划 | `math/miller-rabin.md` |
| 0546* | 整数分解：Pollard–Rho | 计划 | `math/pollard-rho.md` |
| 0547* | 原根 | 计划 | `math/primitive-roots.md` |
| 0548* | 二次剩余与勒让德符号 | 计划 | `math/quadratic-residues-legendre-symbol.md` |
| 0549* | 二次剩余：Cipolla 算法 | 计划 | `math/cipolla.md` |
| 0550* | 佩尔方程 | 计划 | `math/pell-equation.md` |
| 0551* | 线性代数：行列式 | 计划 | `math/determinant.md` |
| 0552* | 线性递推：Berlekamp–Massey | 计划 | `math/berlekamp-massey.md` |
| 0553* | 图论计数：矩阵树定理 | 计划 | `math/matrix-tree-theorem.md` |
| 0554* | 欧拉回路计数：BEST 定理 | 计划 | `math/best-theorem.md` |
| 0555* | 树的编码：Prüfer 序列 | 计划 | `math/prufer-sequence.md` |
| 0556* | 路径计数：LGV 引理 | 计划 | `math/lindstrom-gessel-viennot-lemma.md` |
| 0557* | 生成函数：基础 | 计划 | `math/generating-functions.md` |
| 0558* | 群论：置换 | 计划 | `math/permutations.md` |
| 0559* | 群作用计数：Burnside 引理 | 计划 | `math/burnside-lemma.md` |
| 0560* | 群作用计数：Pólya 定理 | 计划 | `math/polya-enumeration.md` |
| 0561* | 线性规划 | 计划 | `math/linear-programming.md` |
| 0562* | 组合计数：抽屉原理 | 计划 | `math/pigeonhole-principle.md` |
| 0563* | 组合计数：最值容斥 | 计划 | `math/min-max-inclusion-exclusion.md` |
| 0564* | 组合计数：二项式反演 | 计划 | `math/binomial-inversion.md` |
| 0565* | 常见数列：错排数 | 计划 | `math/derangement-numbers.md` |
| 0566* | 常见数列：Catalan 数 | 计划 | `math/catalan-numbers.md` |
| 0567* | 常见数列：Stirling 数 | 计划 | `math/stirling-numbers.md` |
| 0568* | 常见数列：Bell 数 | 计划 | `math/bell-numbers.md` |
| 0569* | 常见数列：Bernoulli 数 | 计划 | `math/bernoulli-numbers.md` |
| 0570* | 组合计数：杨表 | 计划 | `math/young-tableaux.md` |
| 0571* | 数值积分：Simpson 公式 | 计划 | `math/simpson-rule.md` |
| 0572* | 数值积分：自适应 Simpson | 计划 | `math/adaptive-simpson.md` |
| 0573* | 集合幂级数：FWT/FMT | 计划 | `math/fast-subset-transforms.md` |
| 0574 | 快速幂 | 待审阅 | [fast-power.md](math/fast-power.md) |
| 0575 | 费马小定理 | 待审阅 | [fermat-little-theorem.md](math/fermat-little-theorem.md) |
| 0576 | 筛法：欧拉筛（线性筛） | 待审阅 | [euler-sieve.md](math/euler-sieve.md) |
| 0577* | 筛法：分段筛 | 计划 | `math/segmented-sieve.md` |
| 0578 | 计数原理：加法原理 | 待审阅 | [addition-principle.md](math/addition-principle.md) |
| 0579 | 计数原理：乘法原理 | 待审阅 | [multiplication-principle.md](math/multiplication-principle.md) |
| 0580 | 排列数 | 待审阅 | [permutations-count.md](math/permutations-count.md) |
| 0581 | 组合数：阶乘与逆元预处理 | 待审阅 | [binomial-coefficients-factorials.md](math/binomial-coefficients-factorials.md) |
| 0582 | 欧拉定理 | 待审阅 | [euler-theorem.md](math/euler-theorem.md) |
| 0583 | 矩阵：加法与减法 | 待审阅 | [matrix-addition-subtraction.md](math/matrix-addition-subtraction.md) |
| 0584 | 矩阵：乘法 | 待审阅 | [matrix-multiplication.md](math/matrix-multiplication.md) |
| 0585 | 线性变换：矩阵表示 | 待审阅 | [linear-transformations-as-matrices.md](math/linear-transformations-as-matrices.md) |
| 0585e1* | 线性变换：齐次坐标与仿射变换 | 待审阅 | [homogeneous-coordinates-affine-transformations.md](math/homogeneous-coordinates-affine-transformations.md) |

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
| 0614* | 极角排序 | 计划 | `computational-geometry/polar-angle-sort.md` |
| 0615* | 圆：切线 | 计划 | `computational-geometry/circle-tangents.md` |
| 0616* | 圆：面积交与面积并 | 计划 | `computational-geometry/circle-area-intersection-union.md` |
| 0617* | 三维计算几何 | 计划 | `computational-geometry/three-dimensional-geometry.md` |
| 0618* | 平面点定位 | 计划 | `computational-geometry/point-location.md` |
| 0619* | 最小圆覆盖 | 计划 | `computational-geometry/minimum-enclosing-circle.md` |
| 0620* | Voronoi 图 | 计划 | `computational-geometry/voronoi-diagram.md` |
| 0621* | 反演几何 | 计划 | `computational-geometry/inversive-geometry.md` |
| 0622* | Pick 定理 | 计划 | `computational-geometry/pick-theorem.md` |

## 07 动态规划

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0701 | 动态规划：状态与转移 | 待审阅 | [dp-state-transition.md](dynamic-programming/dp-state-transition.md) |
| 0702 | 动态规划：线性 DP | 待审阅 | [linear-dp.md](dynamic-programming/linear-dp.md) |
| 0703 | 背包：0-1 背包 | 待审阅 | [zero-one-knapsack.md](dynamic-programming/zero-one-knapsack.md) |
| 0704 | 动态规划：最长上升子序列 | 待审阅 | [longest-increasing-subsequence.md](dynamic-programming/longest-increasing-subsequence.md) |
| 0704e1* | 最长上升子序列：$O(n\log n)$ 优化 | 计划 | `dynamic-programming/lis-n-log-n.md` |
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
| 0715 | 背包：完全背包 | 待审阅 | [complete-knapsack.md](dynamic-programming/complete-knapsack.md) |
| 0716 | 背包：多重背包 | 待审阅 | [multiple-knapsack.md](dynamic-programming/multiple-knapsack.md) |
| 0717 | 动态规划：状态机 DP | 待审阅 | [state-machine-dp.md](dynamic-programming/state-machine-dp.md) |
| 0718* | 记忆化搜索 | 计划 | `dynamic-programming/memoized-search.md` |
| 0719* | 背包：分组背包 | 计划 | `dynamic-programming/group-knapsack.md` |
| 0720* | 背包：混合背包 | 计划 | `dynamic-programming/mixed-knapsack.md` |
| 0721* | 背包：多维背包 | 计划 | `dynamic-programming/multidimensional-knapsack.md` |
| 0722* | 背包：树上背包 | 计划 | `dynamic-programming/tree-knapsack.md` |
| 0723* | 状态压缩：轮廓线 DP | 计划 | `dynamic-programming/profile-dp.md` |
| 0724* | 状态压缩：插头 DP | 计划 | `dynamic-programming/plug-dp.md` |
| 0725* | 括号序列 DP | 计划 | `dynamic-programming/bracket-sequence-dp.md` |
| 0726* | 自动机 DP | 计划 | `dynamic-programming/automaton-dp.md` |
| 0727* | 划分 DP | 计划 | `dynamic-programming/partition-dp.md` |
| 0728* | 动态 DP | 计划 | `dynamic-programming/dynamic-dp.md` |
| 0729* | 动态规划优化：单调栈 | 计划 | `dynamic-programming/monotone-stack-optimization.md` |
| 0730* | 动态规划优化：四边形不等式 | 计划 | `dynamic-programming/quadrangle-inequality-optimization.md` |

## 08 字符串

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0801 | 字符串：比较与字典序 | 待审阅 | [comparison-and-lexicographic-order.md](strings/comparison-and-lexicographic-order.md) |
| 0802 | 字符串：模式匹配与朴素算法 | 待审阅 | [naive-pattern-matching.md](strings/naive-pattern-matching.md) |
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
| 0813* | 最小表示法 | 计划 | `strings/minimum-representation.md` |
| 0814* | Lyndon 分解 | 计划 | `strings/lyndon-factorization.md` |

## 09 其他

### 知识族：编码

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 0901 | 哈夫曼编码 | 待审阅 | [huffman-coding.md](other/huffman-coding.md) |
| 0902 | 格雷码 | 待审阅 | [gray-code.md](other/gray-code.md) |
