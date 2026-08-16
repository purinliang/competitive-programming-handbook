# 分阶段学习路线

这条路线从 C++ 基础出发，到高中竞赛一等奖常见的知识主干为止。它给出 [模块目录](catalog.md) 中核心教程的教学顺序，也把适合在当前阶段阅读的独立扩展放回对应学习单元；不试图在正文尚未写完时维护一张精确的前置依赖图。

路线使用学习单元表示一次相对完整的学习任务，文章仍然保持足够小且聚焦；同一单元可以把需要共同理解或反复对照的不同模块专题放在一起。路线允许先学会最小用法、以后再回访底层规则，不承诺所有概念都能排成一条没有交叉的直线。单元边界按阶段逐章审计，不能为了表面整齐把只有前置关系的主题强行合并。

标为代码路径的文章尚在计划中；可点击链接表示已经存在正文。`*` 前缀表示扩展阅读，难度通常更高或使用频率更低，暂时不学也不影响后续主线。高中进阶之后不再虚构统一的难度顺序，目录中的其余内容统一收录在文末的 [扩展阅读索引](#扩展阅读索引) 中。

常见 XCPC 路线图中的“铜牌、银牌、金牌”描述的是达到相应竞赛能力时应覆盖的知识集合，不是严格的教学阶段：同一档会同时包含很早学习的基础技巧和依赖较多的专题。本路线把入门到铜牌知识进一步拆成 01–06，再用 07 收录高中进阶主干；扩展阅读覆盖金牌及更远专题。两套分级只能相互校准，不能逐项机械换算。

## 下标与区间约定

本书自己定义的数组、字符串、图、树和算法状态默认使用 1-based 下标：长度为 `n` 的对象使用 `1..n`，位置 `0` 留给空前缀、空节点、边界或哨兵。自定义区间默认是闭区间 `[l, r]`，长度为 `r - l + 1`；动态存储在逻辑容量之外统一保留 `+5` 余量，并单独保存真实长度。

直接讲解或调用 C++ / STL 时保留原生规则，例如 `string`、`vector` 和内置数组的下标从 `0` 开始，迭代器区间通常左闭右开。正文会在接口边界明确转换，不会让同一个算法内部交替使用两套约定。

## 01 C++ 基础

本章只学习写竞赛程序和继续学习算法必需的 C++ 能力。最小输入输出从第一份程序
开始使用；数值、条件、循环、数组、文本和函数随后逐步补全，最后系统归纳输入输出。
进制表示、位运算、指针等更接近底层表示的知识集中放入第 02 章。

### 单元 01：第一个程序

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 010101 | Hello World! | C++ | [learning-path/cpp/hello-world.md](learning-path/cpp/hello-world.md) |
| 010102 | A+B Problem | C++ | [learning-path/cpp/a-plus-b-problem.md](learning-path/cpp/a-plus-b-problem.md) |

### 单元 02：整数类型

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 010201 | 整数类型 | C++ | [cpp/integer-types.md](cpp/integer-types.md) |
| 010202 | 算术运算符 | C++ | [cpp/arithmetic-operators.md](cpp/arithmetic-operators.md) |
| 010203 | 复合赋值运算符 | C++ | [cpp/compound-assignment-operators.md](cpp/compound-assignment-operators.md) |

### 单元 03：浮点类型

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 010301 | 浮点类型 | C++ | [cpp/floating-point-types.md](cpp/floating-point-types.md) |
| 010302 | 类型转换 | C++ | [cpp/type-conversions.md](cpp/type-conversions.md) |
| 010303 | 数学函数 | C++ | [cpp/cmath-functions.md](cpp/cmath-functions.md) |

### 单元 04：布尔类型

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 010401 | 布尔类型 | C++ | [cpp/boolean-type.md](cpp/boolean-type.md) |

### 单元 05：条件语句

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 010501 | 比较运算符 | C++ | [cpp/comparison-operators.md](cpp/comparison-operators.md) |
| 010502 | 逻辑运算符 | C++ | [cpp/logical-operators.md](cpp/logical-operators.md) |
| 010503 | if 与 else | C++ | [cpp/if-and-else.md](cpp/if-and-else.md) |
| 010504 | switch | C++ | [cpp/switch.md](cpp/switch.md) |

### 单元 06：循环语句

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 010601 | while | C++ | [cpp/while.md](cpp/while.md) |
| 010602 | for | C++ | [cpp/for.md](cpp/for.md) |
| 010603 | 自增与自减运算符 | C++ | [cpp/increment-decrement-operators.md](cpp/increment-decrement-operators.md) |
| 010604 | do while | C++ | [cpp/do-while.md](cpp/do-while.md) |

### 单元 07：数组

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 010701 | 常量 | C++ | [cpp/const.md](cpp/const.md) |
| 010702 | 一维数组 | C++ | [cpp/one-dimensional-arrays.md](cpp/one-dimensional-arrays.md) |
| 010703 | 多维数组 | C++ | [cpp/multidimensional-arrays.md](cpp/multidimensional-arrays.md) |

### 单元 08：字符类型

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 010801 | 字符类型 | C++ | [cpp/character-type.md](cpp/character-type.md) |
| 010802 | 字符分类与转换 | C++ | [cpp/character-classification-and-conversion.md](cpp/character-classification-and-conversion.md) |

### 单元 09：字符串

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 010901 | C 字符串 | C++ | [cpp/c-strings.md](cpp/c-strings.md) |
| 010902 | string | C++ | [cpp/string.md](cpp/string.md) |
| 010903 | 整行输入 | C++ | [cpp/whole-line-input.md](cpp/whole-line-input.md) |

### 单元 10：函数

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 011001 | 函数的定义与调用 | C++ | [cpp/function-definition-and-calls.md](cpp/function-definition-and-calls.md) |
| 011002 | 函数的返回值 | C++ | [cpp/function-return-values.md](cpp/function-return-values.md) |
| 011003 | 函数的形参与实参 | C++ | [cpp/function-parameters-and-arguments.md](cpp/function-parameters-and-arguments.md) |
| 011004 | 调用栈 | C++ | [cpp/function-call-stack.md](cpp/function-call-stack.md) |
| 011005 | 递归 | C++ | [cpp/recursion.md](cpp/recursion.md) |

### 单元 11：输入输出

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 011101 | 标准输入 | C++ | [cpp/standard-input.md](cpp/standard-input.md) |
| 011102 | 标准输出 | C++ | [cpp/standard-output.md](cpp/standard-output.md) |
| 011103 | 输出格式控制 | C++ | [cpp/output-formatting.md](cpp/output-formatting.md) |
| 011104 | 文件重定向 | C++ | [cpp/file-redirection.md](cpp/file-redirection.md) |

## 02 C++ 进阶

本章先学习进制表示、位运算、指针、引用与结构体，再把类、编译、名称和内存明确
标为扩展阅读。前五个单元属于连续核心路线；扩展单元不作为第 03 章的前置。

### 单元 01：进制表示

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 020101 | 位、字节与存储单位 | C++ | [cpp/bits-bytes-and-storage-units.md](cpp/bits-bytes-and-storage-units.md) |
| 020102 | 进制表示 | C++ | [cpp/base-notation.md](cpp/base-notation.md) |
| 020103 | 整数的二进制表示 | C++ | [cpp/integer-binary-representation.md](cpp/integer-binary-representation.md) |
| 020104 | 进制转换 | C++ | [cpp/base-conversion.md](cpp/base-conversion.md) |

IEEE 754 和整数类型的平台位宽继续作为浮点类型与整数类型的附属扩展，不占用核心
上一篇、下一篇；本单元只把理解进制和完成转换程序所需的主干排入学习路线。

### 单元 02：位运算

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 020201 | 按位运算 | C++ | [cpp/bitwise-operators.md](cpp/bitwise-operators.md) |
| 020202 | 移位运算 | C++ | [cpp/shift-operators.md](cpp/shift-operators.md) |

### 单元 03：指针

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 020301 | 指针 | C++ | [cpp/pointers.md](cpp/pointers.md) |

### 单元 04：引用

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 020401 | 引用 | C++ | [cpp/references.md](cpp/references.md) |
| 020402 | 参数传递 | C++ | [cpp/parameter-passing.md](cpp/parameter-passing.md) |

### 单元 05：结构体

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 020501 | 结构体 | C++ | [cpp/struct.md](cpp/struct.md) |
| 020502 | 结构体指针与箭头运算符 | C++ | [cpp/struct-pointers-and-arrow.md](cpp/struct-pointers-and-arrow.md) |

### 单元 06：*类

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| *020601 | 类 | C++ | [cpp/class.md](cpp/class.md) |
| *020602 | 类的成员 | C++ | [cpp/class-members.md](cpp/class-members.md) |
| *020603 | 封装 | C++ | [cpp/encapsulation.md](cpp/encapsulation.md) |
| *020604 | 访问权限 | C++ | [cpp/access-control.md](cpp/access-control.md) |
| *020605 | 构造函数 | C++ | [cpp/constructors.md](cpp/constructors.md) |
| *020606 | 析构函数 | C++ | [cpp/destructors.md](cpp/destructors.md) |
| *020607 | 函数重载 | C++ | [cpp/function-overloading.md](cpp/function-overloading.md) |
| *020608 | 运算符重载 | C++ | [cpp/operator-overloading.md](cpp/operator-overloading.md) |
| *020609 | 继承 | C++ | [cpp/inheritance.md](cpp/inheritance.md) |
| *020610 | 多态 | C++ | [cpp/polymorphism.md](cpp/polymorphism.md) |

### 单元 07：*编译

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| *020701 | 预处理 | C++ | [cpp/preprocessing.md](cpp/preprocessing.md) |
| *020702 | 预处理：#include | C++ | [cpp/include.md](cpp/include.md) |
| *020703 | 预处理：#define | C++ | [cpp/define.md](cpp/define.md) |
| *020704 | 条件编译 | C++ | [cpp/conditional-compilation.md](cpp/conditional-compilation.md) |
| *020705 | 编译 | C++ | [cpp/compilation.md](cpp/compilation.md) |
| *020706 | 链接 | C++ | [cpp/linking.md](cpp/linking.md) |

### 单元 08：*名称

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| *020801 | 关键字 | C++ | [cpp/keywords.md](cpp/keywords.md) |
| *020802 | 标识符 | C++ | [cpp/identifiers.md](cpp/identifiers.md) |
| *020803 | 作用域 | C++ | [cpp/scope.md](cpp/scope.md) |
| *020804 | 命名空间与 std | C++ | [cpp/namespace-and-std.md](cpp/namespace-and-std.md) |
| *020805 | typedef 类型别名 | C++ | [cpp/typedef-type-alias.md](cpp/typedef-type-alias.md) |
| *020806 | using 类型别名 | C++ | [cpp/using-type-aliases.md](cpp/using-type-aliases.md) |

### 单元 09：*内存

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| *020901 | 竞赛程序的常见内存分区 | C++ | [cpp/competitive-program-memory-layout.md](cpp/competitive-program-memory-layout.md) |
| *020902 | static 局部变量 | C++ | [cpp/static-local-variables.md](cpp/static-local-variables.md) |
| *020903 | 对象生命周期 | C++ | [cpp/object-lifetime.md](cpp/object-lifetime.md) |

本章仍只从 C++ 竞赛代码的需要解释这些机制，不代替计算机组成、体系结构、操作
系统或编译原理课程。变量、联合体、枚举、字面量、`inline` 和 `volatile` 等没有
形成当前学习任务的独立扩展仍只由模块目录和文末索引收录，不为了目录齐全强行
塞进九个学习单元。类、编译、名称和内存明确标为扩展阅读，不作为后续算法文章的
前置；常量已经在第 01 章的数组单元按实际用途引入。

## 03 算法入门

本章先用复杂度、算法设计思想和标准库基础建立共同语言，再完整学习前缀和、排序、
二分、离散化和双指针。后五个单元是读者第一次从问题出发推导并实现一类完整算法；
具体枚举、贪心以及需要线性数据结构的应用从第 04 章开始展开。

### 单元 01：复杂度

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 030101 | 复杂度 | 算法基础 | [algorithm-basics/complexity.md](algorithm-basics/complexity.md) |
| 030102 | 从代码分析复杂度 | 算法基础 | [algorithm-basics/complexity-analysis.md](algorithm-basics/complexity-analysis.md) |

### 单元 02：算法设计思想

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 030201 | 枚举 | 算法基础 | [algorithm-basics/enumeration.md](algorithm-basics/enumeration.md) |
| 030202 | 模拟 | 算法基础 | [algorithm-basics/simulation.md](algorithm-basics/simulation.md) |
| 030203 | 递归与问题分解 | 算法基础 | [algorithm-basics/recursive-problem-solving.md](algorithm-basics/recursive-problem-solving.md) |
| 030204 | 递推 | 算法基础 | [algorithm-basics/recurrence.md](algorithm-basics/recurrence.md) |
| 030205 | 分治 | 算法基础 | [algorithm-basics/divide-and-conquer.md](algorithm-basics/divide-and-conquer.md) |
| 030206 | 贪心选择与正确性证明 | 算法基础 | [algorithm-basics/greedy-selection-and-proof.md](algorithm-basics/greedy-selection-and-proof.md) |

### 单元 03：标准库基础

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 030301 | vector | C++ | [cpp/vector.md](cpp/vector.md) |
| 030302 | fill | C++ | [cpp/fill.md](cpp/fill.md) |
| 030303 | pair | C++ | [cpp/pair.md](cpp/pair.md) |
| 030304 | tuple | C++ | [cpp/tuple.md](cpp/tuple.md) |
| *030305 | array | C++ | [cpp/array.md](cpp/array.md) |
| 030306 | sort | C++ | [cpp/sort.md](cpp/sort.md) |
| 030307 | unique | C++ | [cpp/unique.md](cpp/unique.md) |

枚举、模拟、递归、递推、分治和贪心在这里组成方法地图。普通循环枚举与最小示例留
在本阶段；子集、排列、组合和 DFS 枚举等学过状态空间与深度优先搜索以后再展开。
快速排序与归并排序在本章正式回访分治；邻项交换和反悔贪心进入第 04 章。

### 单元 04：前缀和

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 030401 | 前缀和 | 算法基础 | [algorithm-basics/prefix-sums.md](algorithm-basics/prefix-sums.md) |
| 030402 | 差分 | 算法基础 | [algorithm-basics/difference-array.md](algorithm-basics/difference-array.md) |

### 单元 05：排序

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 030501 | 冒泡排序 | 算法基础 | [algorithm-basics/bubble-sort.md](algorithm-basics/bubble-sort.md) |
| 030502 | 选择排序 | 算法基础 | [algorithm-basics/selection-sort.md](algorithm-basics/selection-sort.md) |
| 030503 | 插入排序 | 算法基础 | [algorithm-basics/insertion-sort.md](algorithm-basics/insertion-sort.md) |
| 030504 | 计数排序 | 算法基础 | [algorithm-basics/counting-sort.md](algorithm-basics/counting-sort.md) |
| 030505 | 快速排序 | 算法基础 | [algorithm-basics/quicksort.md](algorithm-basics/quicksort.md) |
| 030506 | 归并排序 | 算法基础 | [algorithm-basics/merge-sort.md](algorithm-basics/merge-sort.md) |
| 030507 | 排序方法比较 | 算法基础 | [algorithm-basics/sorting-comparison.md](algorithm-basics/sorting-comparison.md) |
| *030508 | 基数排序 | 算法基础 | `algorithm-basics/radix-sort.md` |
| *030509 | 桶排序 | 算法基础 | `algorithm-basics/bucket-sort.md` |

### 单元 06：二分

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 030601 | 二分查找 | 算法基础 | [algorithm-basics/binary-search.md](algorithm-basics/binary-search.md) |
| 030602 | 二分边界 | 算法基础 | [algorithm-basics/binary-search-boundaries.md](algorithm-basics/binary-search-boundaries.md) |
| 030603 | 标准库二分查找 | C++ | [cpp/stl-binary-search.md](cpp/stl-binary-search.md) |
| 030604 | 二分答案 | 算法基础 | [algorithm-basics/binary-search-on-answer.md](algorithm-basics/binary-search-on-answer.md) |
| 030605 | 浮点数二分 | 算法基础 | [algorithm-basics/floating-point-binary-search.md](algorithm-basics/floating-point-binary-search.md) |

### 单元 07：离散化

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 030701 | 离散化 | 算法基础 | [algorithm-basics/coordinate-compression.md](algorithm-basics/coordinate-compression.md) |

### 单元 08：双指针

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 030801 | 双指针 | 算法基础 | [algorithm-basics/two-pointers.md](algorithm-basics/two-pointers.md) |
| 030802 | 滑动窗口 | 算法基础 | [algorithm-basics/sliding-window.md](algorithm-basics/sliding-window.md) |

## 04 初中基础

本章从线性表、栈与队列开始建立基本存储模型，再展开贪心、数论、图、树、动态规划
与字符串等能够独立解决问题的初中竞赛主干。第 03 章已经完整学习的前缀和、排序、
二分、离散化和双指针不在这里重复登记。

### 单元 01：数据结构：线性表

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 040101 | 数组 | 算法基础 | [algorithm-basics/array.md](algorithm-basics/array.md) |
| 040102 | 链表 | 算法基础 | [algorithm-basics/linked-list.md](algorithm-basics/linked-list.md) |

### 单元 02：数据结构：栈

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 040201 | 栈 | 算法基础 | [algorithm-basics/stack.md](algorithm-basics/stack.md) |
| 040202 | stack | C++ | [cpp/stack.md](cpp/stack.md) |
| 040203 | 出栈序列判定 | 算法基础 | [algorithm-basics/stack-pop-sequence-validation.md](algorithm-basics/stack-pop-sequence-validation.md) |
| 040204 | 表达式求值 | 算法基础 | [algorithm-basics/expression-evaluation.md](algorithm-basics/expression-evaluation.md) |

### 单元 03：数据结构：队列

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 040301 | 队列 | 算法基础 | [algorithm-basics/queue.md](algorithm-basics/queue.md) |
| 040302 | queue | C++ | [cpp/queue.md](cpp/queue.md) |
| 040303 | 双端队列 | 算法基础 | [algorithm-basics/deque.md](algorithm-basics/deque.md) |
| 040304 | deque | C++ | [cpp/deque.md](cpp/deque.md) |

### 单元 04：算法基础：贪心

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 040401 | 邻项交换证明 | 算法基础 | [algorithm-basics/greedy-adjacent-exchange.md](algorithm-basics/greedy-adjacent-exchange.md) |
| 040402 | 反悔贪心 | 算法基础 | [algorithm-basics/greedy-regret.md](algorithm-basics/greedy-regret.md) |

### 单元 05：数学：数论基础

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 040501 | 整除 | 数学 | [math/divisibility.md](math/divisibility.md) |
| 040502 | 质数 | 数学 | [math/prime-numbers.md](math/prime-numbers.md) |
| 040503 | 试除法：质数检测 | 数学 | [math/trial-division-primality-test.md](math/trial-division-primality-test.md) |
| 040504 | 算术基本定理 | 数学 | [math/fundamental-theorem-of-arithmetic.md](math/fundamental-theorem-of-arithmetic.md) |
| 040505 | 质因数分解 | 数学 | [math/prime-factorization.md](math/prime-factorization.md) |
| 040506 | 埃拉托斯特尼筛法 | 数学 | [math/sieve-of-eratosthenes.md](math/sieve-of-eratosthenes.md) |
| 040507 | 最大公约数与最小公倍数 | 数学 | [math/greatest-common-divisor-and-least-common-multiple.md](math/greatest-common-divisor-and-least-common-multiple.md) |
| 040508 | 欧几里得算法 | 数学 | [math/euclidean-algorithm.md](math/euclidean-algorithm.md) |
| 040509 | 快速幂 | 数学 | [math/fast-exponentiation.md](math/fast-exponentiation.md) |

### 单元 06：图论：图的概念与存储

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 040601 | 点与边 | 图论 | [graph-theory/vertices-and-edges.md](graph-theory/vertices-and-edges.md) |
| 040602 | 路径与环 | 图论 | [graph-theory/paths-and-cycles.md](graph-theory/paths-and-cycles.md) |
| 040603 | 度数 | 图论 | [graph-theory/vertex-degrees.md](graph-theory/vertex-degrees.md) |
| 040604 | 图的存储：基础概念 | 图论 | [graph-theory/graph-representation.md](graph-theory/graph-representation.md) |
| 040605 | 图的存储：邻接表（vector 实现） | 图论 | [graph-theory/vector-adjacency-list.md](graph-theory/vector-adjacency-list.md) |

### 单元 07：图论：深度优先搜索

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 040701 | 图的遍历：深度优先搜索（DFS） | 图论 | [graph-theory/graph-depth-first-search.md](graph-theory/graph-depth-first-search.md) |
| 040702 | 状态空间与隐式图 | 算法基础 | [algorithm-basics/state-space-and-implicit-graphs.md](algorithm-basics/state-space-and-implicit-graphs.md) |
| 040703 | 子集与位掩码枚举 | 算法基础 | [algorithm-basics/subset-bitmask-enumeration.md](algorithm-basics/subset-bitmask-enumeration.md) |
| 040704 | 排列枚举 | 算法基础 | [algorithm-basics/permutation-enumeration.md](algorithm-basics/permutation-enumeration.md) |
| 040705 | 组合枚举 | 算法基础 | [algorithm-basics/combination-enumeration.md](algorithm-basics/combination-enumeration.md) |
| 040706 | DFS、回溯与剪枝 | 图论 | [graph-theory/dfs-backtracking-pruning.md](graph-theory/dfs-backtracking-pruning.md) |

### 单元 08：图论：广度优先搜索

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 040801 | 图的遍历：广度优先搜索（BFS） | 图论 | [graph-theory/graph-breadth-first-search.md](graph-theory/graph-breadth-first-search.md) |
| 040802 | 连通块 | 图论 | [graph-theory/connected-components.md](graph-theory/connected-components.md) |

### 单元 09：图论：树

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 040901 | 无根树 | 图论 | [graph-theory/unrooted-trees.md](graph-theory/unrooted-trees.md) |
| 040902 | 有根树 | 图论 | [graph-theory/rooted-trees.md](graph-theory/rooted-trees.md) |
| 040903 | 树的遍历：深度优先搜索（DFS） | 图论 | [graph-theory/tree-depth-first-search.md](graph-theory/tree-depth-first-search.md) |
| 040904 | 树的遍历：广度优先搜索（BFS） | 图论 | [graph-theory/tree-breadth-first-search.md](graph-theory/tree-breadth-first-search.md) |

### 单元 10：动态规划：动态规划基础

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 041001 | 动态规划的状态与转移 | 动态规划 | [dynamic-programming/dp-state-transition.md](dynamic-programming/dp-state-transition.md) |
| 041002 | 数字三角形 | 动态规划 | [dynamic-programming/number-triangle.md](dynamic-programming/number-triangle.md) |
| 041003 | 最大子段和 | 动态规划 | [dynamic-programming/maximum-subarray-sum.md](dynamic-programming/maximum-subarray-sum.md) |
| 041004 | 最长上升子序列 | 动态规划 | [dynamic-programming/longest-increasing-subsequence.md](dynamic-programming/longest-increasing-subsequence.md) |
| 041005 | 最长公共子序列 | 动态规划 | [dynamic-programming/longest-common-subsequence.md](dynamic-programming/longest-common-subsequence.md) |

### 单元 11：动态规划：背包

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 041101 | 0-1 背包 | 动态规划 | [dynamic-programming/zero-one-knapsack.md](dynamic-programming/zero-one-knapsack.md) |
| 041102 | 完全背包 | 动态规划 | [dynamic-programming/complete-knapsack.md](dynamic-programming/complete-knapsack.md) |
| 041103 | 多重背包 | 动态规划 | [dynamic-programming/multiple-knapsack.md](dynamic-programming/multiple-knapsack.md) |

### 单元 12：字符串：字符串基础

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 041201 | 字符串比较与字典序 | 字符串 | [strings/comparison-and-lexicographic-order.md](strings/comparison-and-lexicographic-order.md) |
| 041202 | 朴素字符串匹配 | 字符串 | [strings/naive-pattern-matching.md](strings/naive-pattern-matching.md) |

## 05 初中进阶

本阶段加入依赖更完整背景或适用范围更专门的工具。二叉树先提供左右孩子、遍历与完全二叉树编号，随后分别学习二叉堆与哈希表原理。标准库进阶集中比较 `priority_queue`、有序关联容器与无序关联容器；前一阶段的反悔贪心可以在这里回访，并把线性查找最不合适选项的步骤替换成优先队列。图搜索应用、高精度整数和编码各自保持清楚的主题边界。

### 单元 01：数据结构：二叉树

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 050101 | 二叉树的结构与存储 | 数据结构 | [data-structures/binary-tree-structure-and-storage.md](data-structures/binary-tree-structure-and-storage.md) |
| 050102 | 二叉树的遍历：前序、中序与后序 | 数据结构 | [data-structures/binary-tree-traversals.md](data-structures/binary-tree-traversals.md) |

### 单元 02：数据结构：二叉堆

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 050201 | 二叉堆 | 算法基础 | [algorithm-basics/binary-heap.md](algorithm-basics/binary-heap.md) |
| *050202 | 堆排序 | 算法基础 | [algorithm-basics/heap-sort.md](algorithm-basics/heap-sort.md) |

### 单元 03：数据结构：哈希表

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 050301 | 哈希表 | 算法基础 | [algorithm-basics/hash-table.md](algorithm-basics/hash-table.md) |

### 单元 04：标准库进阶

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 050401 | priority_queue | C++ | [cpp/priority-queue.md](cpp/priority-queue.md) |
| 050402 | set | C++ | [cpp/set.md](cpp/set.md) |
| 050403 | multiset | C++ | [cpp/multiset.md](cpp/multiset.md) |
| 050404 | map | C++ | [cpp/map.md](cpp/map.md) |
| 050405 | multimap | C++ | [cpp/multimap.md](cpp/multimap.md) |
| 050406 | unordered_set | C++ | [cpp/unordered-set.md](cpp/unordered-set.md) |
| 050407 | unordered_map | C++ | [cpp/unordered-map.md](cpp/unordered-map.md) |

### 单元 05：数学：高精度整数

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 050501 | 高精度整数：加法、减法与乘法 | 数学 | [math/big-integer-addition-subtraction-multiplication.md](math/big-integer-addition-subtraction-multiplication.md) |

### 单元 06：图论：图搜索的应用

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 050601 | 多源 BFS | 图论 | [graph-theory/multi-source-bfs.md](graph-theory/multi-source-bfs.md) |
| 050602 | 二分图：判定 | 图论 | [graph-theory/bipartite-graph.md](graph-theory/bipartite-graph.md) |

### 单元 07：编码：哈夫曼编码与格雷码

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 050701 | 哈夫曼编码 | 其他 | [other/huffman-coding.md](other/huffman-coding.md) |
| 050702 | 格雷码 | 其他 | [other/gray-code.md](other/gray-code.md) |

## 06 高中基础

本阶段进入高中竞赛一等奖常见主干：先补充均摊分析和标准库位集合，再学习区间查询、并查集、单调结构与倍增；随后系统推进模运算、筛法、计数、数论函数和矩阵，并完成最短路、生成树、树上基础问题、常见动态规划模型、经典字符串算法与计算几何基础。

### 单元 01：算法基础：复杂度进阶

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 060101 | 均摊复杂度 | 算法基础 | [algorithm-basics/amortized-complexity.md](algorithm-basics/amortized-complexity.md) |
| 060102 | 均摊复杂度：势能法 | 算法基础 | [algorithm-basics/potential-method.md](algorithm-basics/potential-method.md) |

### 单元 02：标准库：位集合

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 060201 | bitset | C++ | [cpp/bitset.md](cpp/bitset.md) |

### 单元 03：数据结构：区间查询

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 060301 | 线段树：基础 | 数据结构 | [data-structures/segment-tree.md](data-structures/segment-tree.md) |
| 060302 | 树状数组：基础 | 数据结构 | [data-structures/fenwick-tree.md](data-structures/fenwick-tree.md) |
| 060303 | 稀疏表（ST 表） | 数据结构 | [data-structures/sparse-table.md](data-structures/sparse-table.md) |

### 单元 04：数据结构：并查集

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 060401 | 并查集：基础 | 数据结构 | [data-structures/disjoint-set-union.md](data-structures/disjoint-set-union.md) |

### 单元 05：数据结构：单调结构

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 060501 | 单调栈 | 算法基础 | [algorithm-basics/monotonic-stack.md](algorithm-basics/monotonic-stack.md) |
| 060502 | 单调队列 | 算法基础 | [algorithm-basics/monotonic-queue.md](algorithm-basics/monotonic-queue.md) |

### 单元 06：算法基础：倍增

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 060601 | 倍增：基础 | 算法基础 | [algorithm-basics/doubling.md](algorithm-basics/doubling.md) |

### 单元 07：数学：模运算与线性同余

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 060701 | 模运算 | 数学 | [math/modular-arithmetic.md](math/modular-arithmetic.md) |
| 060702 | 数论：扩展欧几里得算法 | 数学 | [math/extended-euclidean-algorithm.md](math/extended-euclidean-algorithm.md) |
| 060703 | 线性不定方程 | 数学 | [math/linear-diophantine-equations.md](math/linear-diophantine-equations.md) |
| 060704 | 线性同余方程 | 数学 | [math/linear-congruences.md](math/linear-congruences.md) |
| 060705 | 费马小定理 | 数学 | [math/fermat-little-theorem.md](math/fermat-little-theorem.md) |
| 060706 | 模逆元 | 数学 | [math/modular-inverse.md](math/modular-inverse.md) |

### 单元 08：数学：筛法与因数函数

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 060801 | 筛法：欧拉筛（线性筛） | 数学 | [math/euler-sieve.md](math/euler-sieve.md) |
| 060802 | 正因数个数 | 数学 | [math/divisor-count.md](math/divisor-count.md) |
| 060803 | 正因数和 | 数学 | [math/divisor-sum.md](math/divisor-sum.md) |

### 单元 09：数学：计数原理与组合数

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 060901 | 计数原理：加法原理 | 数学 | [math/addition-principle.md](math/addition-principle.md) |
| 060902 | 计数原理：乘法原理 | 数学 | [math/multiplication-principle.md](math/multiplication-principle.md) |
| 060903 | 排列数 | 数学 | [math/permutations-count.md](math/permutations-count.md) |
| 060904 | 组合数：定义与递推 | 数学 | [math/binomial-coefficients.md](math/binomial-coefficients.md) |
| 060905 | 组合数：阶乘与逆元预处理 | 数学 | [math/binomial-coefficients-factorials.md](math/binomial-coefficients-factorials.md) |

### 单元 10：数学：数论函数

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 061001 | 欧拉函数 | 数学 | [math/euler-totient.md](math/euler-totient.md) |
| 061002 | 欧拉定理 | 数学 | [math/euler-theorem.md](math/euler-theorem.md) |
| 061003 | 莫比乌斯函数 | 数学 | [math/mobius-function.md](math/mobius-function.md) |

### 单元 11：数学：矩阵与线性变换

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 061101 | 矩阵：表示 | 数学 | [math/matrix-representation.md](math/matrix-representation.md) |
| 061102 | 矩阵：加法与减法 | 数学 | [math/matrix-addition-subtraction.md](math/matrix-addition-subtraction.md) |
| 061103 | 矩阵：乘法 | 数学 | [math/matrix-multiplication.md](math/matrix-multiplication.md) |
| 061104 | 线性变换：矩阵表示 | 数学 | [math/linear-transformations-as-matrices.md](math/linear-transformations-as-matrices.md) |
| 061105 | 矩阵快速幂 | 数学 | [math/matrix-exponentiation.md](math/matrix-exponentiation.md) |

### 单元 12：数学：概率与期望

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 061201 | 概率与期望基础 | 数学 | `math/probability-expectation.md` |

### 单元 13：图论：图的存储实现

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 061301 | 图的存储：边集 | 图论 | [graph-theory/edge-list.md](graph-theory/edge-list.md) |
| 061302 | 图的存储：邻接表（链式前向星实现） | 图论 | [graph-theory/chained-forward-star.md](graph-theory/chained-forward-star.md) |

### 单元 14：图论：拓扑排序

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 061401 | 有向无环图：拓扑排序 | 图论 | [graph-theory/topological-sort.md](graph-theory/topological-sort.md) |

### 单元 15：图论：最短路

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 061501 | 最短路：Dijkstra | 图论 | `graph-theory/dijkstra.md` |
| 061502 | 最短路：Bellman–Ford 与负环 | 图论 | `graph-theory/bellman-ford.md` |
| 061503 | 最短路：Floyd–Warshall | 图论 | `graph-theory/floyd-warshall.md` |
| 061504 | 最短路：0-1 BFS | 图论 | [graph-theory/zero-one-bfs.md](graph-theory/zero-one-bfs.md) |

### 单元 16：图论：最小生成树

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 061601 | 最小生成树：Kruskal | 图论 | `graph-theory/kruskal.md` |
| 061602 | 最小生成树：Prim | 图论 | `graph-theory/prim.md` |

### 单元 17：图论：树上基础问题

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 061701 | 树：直径与中心 | 图论 | [graph-theory/tree-diameter-center.md](graph-theory/tree-diameter-center.md) |
| 061702 | 树：重心 | 图论 | [graph-theory/tree-centroid.md](graph-theory/tree-centroid.md) |
| 061703 | 树的遍历：DFS 序与子树区间 | 图论 | `graph-theory/tree-euler-tour.md` |
| 061704 | 树上查询：倍增 LCA | 图论 | [graph-theory/lca-binary-lifting.md](graph-theory/lca-binary-lifting.md) |

### 单元 18：图论：特殊图结构

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 061801 | 图：基环树 | 图论 | `graph-theory/unicyclic-graph.md` |
| 061802 | 图：函数图 | 图论 | `graph-theory/functional-graph.md` |

### 单元 19：图论：欧拉与哈密顿问题

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 061901 | 欧拉问题：路径、回路与图 | 图论 | [graph-theory/eulerian-paths-and-circuits.md](graph-theory/eulerian-paths-and-circuits.md) |
| 061902 | 哈密顿问题：路径、回路与图 | 图论 | [graph-theory/hamiltonian-paths-and-circuits.md](graph-theory/hamiltonian-paths-and-circuits.md) |

### 单元 20：动态规划：常见模型

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 062001 | 状态机动态规划 | 动态规划 | [dynamic-programming/state-machine-dp.md](dynamic-programming/state-machine-dp.md) |
| 062002 | 动态规划：区间 DP | 动态规划 | `dynamic-programming/interval-dp.md` |
| 062003 | 动态规划：DAG 上的 DP | 动态规划 | `dynamic-programming/dag-dp.md` |
| 062004 | 动态规划：树形 DP | 动态规划 | `dynamic-programming/tree-dp.md` |
| 062005 | 动态规划：状压 DP | 动态规划 | `dynamic-programming/bitmask-dp.md` |

### 单元 21：字符串：经典算法

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 062101 | 字符串：哈希 | 字符串 | `strings/rolling-hash.md` |
| 062102 | 字符串：KMP 与前缀函数 | 字符串 | `strings/kmp-prefix-function.md` |
| 062103 | 字符串：Z 函数 | 字符串 | `strings/z-function.md` |
| 062104 | 字符串：Trie | 字符串 | `strings/trie.md` |

### 单元 22：计算几何：基础

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 062201 | 坐标、点、向量与精度 | 计算几何 | `computational-geometry/points-vectors-precision.md` |
| 062202 | 点积、叉积与方向判断 | 计算几何 | `computational-geometry/dot-cross-orientation.md` |

## 07 高中进阶

本阶段在前面的稳定模型上继续组合技巧：折半枚举与离线处理扩展候选组织方式，并查集、图连通性和树上数据结构增加维护能力；状态图最短路、中国剩余定理、容斥、平面几何与进阶动态规划分别完成高中竞赛主干中更专门的专题。

### 单元 01：算法基础：折半枚举

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 070101 | 枚举：Meet-in-the-Middle | 算法基础 | `algorithm-basics/meet-in-the-middle.md` |

### 单元 02：算法基础：离线处理

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 070201 | 离线算法 | 算法基础 | `algorithm-basics/offline-algorithms.md` |
| 070202 | 扫描线与事件排序 | 算法基础 | `algorithm-basics/sweep-line.md` |

### 单元 03：数据结构：并查集扩展

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 070301 | 并查集：扩展域 | 数据结构 | `data-structures/extended-domain-disjoint-set.md` |
| 070302 | 并查集：带权 | 数据结构 | `data-structures/weighted-disjoint-set.md` |

### 单元 04：图论：连通性

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 070401 | 有向图：强连通分量 | 图论 | `graph-theory/strongly-connected-components.md` |
| 070402 | 无向图：割点与桥 | 图论 | `graph-theory/articulation-points-bridges.md` |

### 单元 05：图论：树上数据结构

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 070501 | 树上数据结构：树链剖分 | 图论 | `graph-theory/heavy-light-decomposition.md` |
| 070502 | 树上技巧：树上差分 | 图论 | `graph-theory/tree-difference.md` |

### 单元 06：图论：状态图最短路

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 070601 | 最短路：分层图与状态图 | 图论 | `graph-theory/layered-state-shortest-path.md` |

### 单元 07：数学：中国剩余定理

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 070701 | 数论：中国剩余定理（CRT） | 数学 | [math/chinese-remainder-theorem.md](math/chinese-remainder-theorem.md) |
| 070702 | 数论：扩展中国剩余定理（exCRT） | 数学 | [math/extended-chinese-remainder-theorem.md](math/extended-chinese-remainder-theorem.md) |

### 单元 08：数学：容斥原理

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 070801 | 容斥原理 | 数学 | `math/inclusion-exclusion.md` |

### 单元 09：计算几何：平面几何算法

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 070901 | 直线、线段与相交判定 | 计算几何 | `computational-geometry/lines-segments-intersections.md` |
| 070902 | 多边形面积与点的位置 | 计算几何 | `computational-geometry/polygon-area-point-location.md` |
| 070903 | 凸包 | 计算几何 | `computational-geometry/convex-hull.md` |

### 单元 10：动态规划：进阶

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 071001 | 动态规划：数位 DP | 动态规划 | `dynamic-programming/digit-dp.md` |
| 071002 | 动态规划：概率与期望 | 动态规划 | `dynamic-programming/probability-expectation-dp.md` |
| 071003 | 动态规划优化：单调队列 | 动态规划 | `dynamic-programming/monotone-queue-optimization.md` |

完成 06 高中进阶后，读者已经具备独立阅读题解、按题目补充专题和判断新算法依赖的能力。这里不把高中竞赛一等奖与大学竞赛奖牌、Codeforces rating 做机械换算。

## 扩展阅读索引

以下独立扩展不属于 01–07 的必学顺序，其中一部分可能明显高于高中竞赛一等奖的常见范围。它们按模块和 ID 排列，便于查找；开始某篇之前可以回到 [模块目录](catalog.md) 查看状态和所属模块。使用 `*CCUUPPe1`、`*CCUUPPe2` 等编号的附属扩展只从对应基础文章进入，不在这里重复平铺。

### 01 C++

| ID | 知识点 | 文件 |
| --- | --- | --- |
| *020601 | 类 | [cpp/class.md](cpp/class.md) |
| *020602 | 类的成员 | [cpp/class-members.md](cpp/class-members.md) |
| *020603 | 封装 | [cpp/encapsulation.md](cpp/encapsulation.md) |
| *020604 | 访问权限 | [cpp/access-control.md](cpp/access-control.md) |
| *020605 | 构造函数 | [cpp/constructors.md](cpp/constructors.md) |
| *020606 | 析构函数 | [cpp/destructors.md](cpp/destructors.md) |
| *020607 | 函数重载 | [cpp/function-overloading.md](cpp/function-overloading.md) |
| *020608 | 运算符重载 | [cpp/operator-overloading.md](cpp/operator-overloading.md) |
| *020609 | 继承 | [cpp/inheritance.md](cpp/inheritance.md) |
| *020610 | 多态 | [cpp/polymorphism.md](cpp/polymorphism.md) |
| *020701 | 预处理 | [cpp/preprocessing.md](cpp/preprocessing.md) |
| *020702 | 预处理：#include | [cpp/include.md](cpp/include.md) |
| *020703 | 预处理：#define | [cpp/define.md](cpp/define.md) |
| *020704 | 条件编译 | [cpp/conditional-compilation.md](cpp/conditional-compilation.md) |
| *020705 | 编译 | [cpp/compilation.md](cpp/compilation.md) |
| *020706 | 链接 | [cpp/linking.md](cpp/linking.md) |
| *020801 | 关键字 | [cpp/keywords.md](cpp/keywords.md) |
| *020802 | 标识符 | [cpp/identifiers.md](cpp/identifiers.md) |
| *020803 | 作用域 | [cpp/scope.md](cpp/scope.md) |
| *020804 | 命名空间与 std | [cpp/namespace-and-std.md](cpp/namespace-and-std.md) |
| *020805 | typedef 类型别名 | [cpp/typedef-type-alias.md](cpp/typedef-type-alias.md) |
| *020806 | using 类型别名 | [cpp/using-type-aliases.md](cpp/using-type-aliases.md) |
| *020901 | 竞赛程序的常见内存分区 | [cpp/competitive-program-memory-layout.md](cpp/competitive-program-memory-layout.md) |
| *020902 | static 局部变量 | [cpp/static-local-variables.md](cpp/static-local-variables.md) |
| *020903 | 对象生命周期 | [cpp/object-lifetime.md](cpp/object-lifetime.md) |
| *030305 | array | [cpp/array.md](cpp/array.md) |
| *990101 | 变量 | [cpp/variable.md](cpp/variable.md) |
| *990102 | 字面量 | [cpp/literals.md](cpp/literals.md) |
| *990103 | constexpr | [cpp/constexpr.md](cpp/constexpr.md) |
| *990104 | inline | [cpp/inline.md](cpp/inline.md) |
| *990105 | 字节寻址 | [cpp/byte-addressing.md](cpp/byte-addressing.md) |
| *990106 | 指针与引用中的 const | [cpp/const-pointers-and-references.md](cpp/const-pointers-and-references.md) |
| *990107 | 联合体 | [cpp/union.md](cpp/union.md) |
| *990108 | 枚举 | [cpp/enum.md](cpp/enum.md) |
| *990109 | volatile | [cpp/volatile.md](cpp/volatile.md) |
| *990110 | order-statistics tree（GNU PBDS） | `cpp/gnu-pbds.md` |

### 02 算法基础

| ID | 知识点 | 文件 |
| --- | --- | --- |
| *030508 | 基数排序 | `algorithm-basics/radix-sort.md` |
| *030509 | 桶排序 | `algorithm-basics/bucket-sort.md` |
| *050202 | 堆排序 | [algorithm-basics/heap-sort.md](algorithm-basics/heap-sort.md) |
| *990201 | CDQ 分治 | `algorithm-basics/cdq-divide-and-conquer.md` |
| *990202 | 三分搜索 | `algorithm-basics/ternary-search.md` |
| *990203 | 整体二分与并行二分 | `algorithm-basics/parallel-binary-search.md` |
| *990204 | 搜索：迭代加深 | `algorithm-basics/iterative-deepening.md` |
| *990205 | 搜索：A* | `algorithm-basics/a-star.md` |
| *990206 | 精确覆盖：Dancing Links（DLX） | `algorithm-basics/dancing-links.md` |
| *990207 | 随机化算法 | `algorithm-basics/randomized-algorithms.md` |
| *990208 | 随机化：爬山法 | `algorithm-basics/hill-climbing.md` |
| *990209 | 随机化：模拟退火 | `algorithm-basics/simulated-annealing.md` |
| *990210 | 工程：对拍 | `algorithm-basics/stress-testing.md` |

### 03 数据结构

| ID | 知识点 | 文件 |
| --- | --- | --- |
| *990301 | 线段树：懒标记的组合顺序 | [data-structures/segment-tree-lazy-tags.md](data-structures/segment-tree-lazy-tags.md) |
| *990302 | 可撤销并查集 | `data-structures/rollback-disjoint-set.md` |
| *990303 | 分块 | `data-structures/square-root-decomposition.md` |
| *990304 | 莫队算法 | `data-structures/mo-algorithm.md` |
| *990305 | 线段树二分与树上下降 | `data-structures/segment-tree-descent.md` |
| *990306 | 可持久化线段树 | `data-structures/persistent-segment-tree.md` |
| *990307 | 动态开点线段树 | `data-structures/dynamic-segment-tree.md` |
| *990308 | Segment Tree Beats | `data-structures/segment-tree-beats.md` |
| *990309 | 树状数组的区间修改变体 | `data-structures/fenwick-range-updates.md` |
| *990310 | 树状数组维护区间最值 | `data-structures/fenwick-range-extrema.md` |
| *990311 | 左偏树 | `data-structures/leftist-tree.md` |
| *990312 | Treap 与随机平衡树 | `data-structures/treap.md` |
| *990313 | Splay | `data-structures/splay.md` |
| *990314 | B 树与 B+ 树 | `data-structures/b-tree-and-b-plus-tree.md` |
| *990315 | 笛卡尔树 | `data-structures/cartesian-tree.md` |
| *990316 | Wavelet Matrix | `data-structures/wavelet-matrix.md` |
| *990317 | 启发式合并（small-to-large） | `data-structures/small-to-large-merging.md` |
| *990318 | 斜堆 | `data-structures/skew-heap.md` |
| *990319 | 配对堆 | `data-structures/pairing-heap.md` |
| *990320 | 可持久化并查集 | `data-structures/persistent-disjoint-set-union.md` |
| *990321 | 线段树：合并 | `data-structures/segment-tree-merging.md` |
| *990322 | 树套树：线段树套线段树 | `data-structures/segment-tree-of-segment-trees.md` |
| *990323 | 树套树：线段树套平衡树 | `data-structures/segment-tree-of-balanced-trees.md` |
| *990324 | 可持久化平衡树 | `data-structures/persistent-balanced-tree.md` |
| *990325 | 替罪羊树 | `data-structures/scapegoat-tree.md` |
| *990326 | 动态树：Link-Cut Tree | `data-structures/link-cut-tree.md` |
| *990327 | KD 树 | `data-structures/kd-tree.md` |
| *990328 | 链上分块 | `data-structures/chain-block-decomposition.md` |
| *990329 | 树上分块 | `data-structures/tree-block-decomposition.md` |

### 04 图论

| ID | 知识点 | 文件 |
| --- | --- | --- |
| *990401 | 二分图：最大匹配 | `graph-theory/bipartite-matching.md` |
| *990402 | 无向图：双连通分量与圆方树 | `graph-theory/biconnected-components-block-cut-tree.md` |
| *990403 | 2-SAT | `graph-theory/two-sat.md` |
| *990404 | 网络流：Dinic | `graph-theory/dinic-max-flow.md` |
| *990405 | 最小费用最大流 | `graph-theory/min-cost-max-flow.md` |
| *990406 | 虚树 | `graph-theory/virtual-tree.md` |
| *990407 | 点分治 | `graph-theory/centroid-decomposition.md` |
| *990408 | SPFA 与队列优化最短路 | `graph-theory/spfa.md` |
| *990409 | DSU on Tree | `graph-theory/dsu-on-tree.md` |
| *990410 | 差分约束 | `graph-theory/difference-constraints.md` |
| *990411 | 树哈希 | `graph-theory/tree-hashing.md` |
| *990412 | 最短路：最短路树 | `graph-theory/shortest-path-tree.md` |
| *990413 | 最小生成树：Borůvka | `graph-theory/boruvka.md` |
| *990414 | 网络流：SAP | `graph-theory/sap-max-flow.md` |
| *990415 | 网络流：可行流 | `graph-theory/feasible-flow.md` |
| *990416 | 网络流：上下界 | `graph-theory/bounded-flow.md` |
| *990417 | 竞赛图 | `graph-theory/tournament-graph.md` |
| *990418 | Steiner 树 | `graph-theory/steiner-tree.md` |
| *990419 | 仙人掌 | `graph-theory/cactus-graph.md` |
| *990420 | 有向最小生成树：Chu–Liu/Edmonds | `graph-theory/directed-minimum-spanning-tree.md` |
| *990421 | 一般图最大匹配 | `graph-theory/general-graph-matching.md` |
| *990422 | 最短路：$k$ 短路 | `graph-theory/k-shortest-paths.md` |
| *990423 | 支配树 | `graph-theory/dominator-tree.md` |
| *990424 | 无向图：全局最小割 | `graph-theory/global-minimum-cut.md` |
| *990425 | 弦图 | `graph-theory/chordal-graph.md` |
| *990426 | 树分治：边分治 | `graph-theory/edge-decomposition.md` |
| *990427 | 树分治：动态点分治 | `graph-theory/dynamic-centroid-decomposition.md` |
| *990428 | 长链剖分 | `graph-theory/long-chain-decomposition.md` |

### 05 数学

| ID | 知识点 | 文件 |
| --- | --- | --- |
| *990501 | Nim、SG 函数与基础博弈论 | `math/nim-sg-game-theory.md` |
| *990502 | XOR 线性基 | `math/xor-linear-basis.md` |
| *990503 | 高斯消元 | `math/gaussian-elimination.md` |
| *990504 | 多项式：NTT | `math/ntt.md` |
| *990505 | BSGS 与离散对数 | `math/discrete-logarithm.md` |
| *990506 | 多项式：表示、加法与减法 | `math/polynomial-representation-addition-subtraction.md` |
| *990507 | 多项式：卷积与朴素乘法 | `math/convolution-naive-multiplication.md` |
| *990508 | 复数与单位根 | `math/complex-numbers-roots-of-unity.md` |
| *990509 | 多项式：FFT | `math/fft.md` |
| *990510 | 形式幂级数：求逆 | `math/formal-power-series-inverse.md` |
| *990511 | 形式幂级数：形式导数 | `math/formal-derivative.md` |
| *990512 | 形式幂级数：形式积分 | `math/formal-integral.md` |
| *990513 | 形式幂级数：对数 | `math/formal-power-series-logarithm.md` |
| *990514 | 形式幂级数：指数 | `math/formal-power-series-exponential.md` |
| *990515 | 形式幂级数：平方根 | `math/formal-power-series-square-root.md` |
| *990516 | 形式幂级数：幂 | `math/formal-power-series-power.md` |
| *990517 | 多项式：除法与余数 | `math/polynomial-division-remainder.md` |
| *990518 | 多项式：多点求值 | `math/multipoint-evaluation.md` |
| *990519 | 多项式：插值 | `math/polynomial-interpolation.md` |
| *990520 | 莫比乌斯反演 | `math/mobius-inversion.md` |
| *990521 | 素性测试：Miller–Rabin | `math/miller-rabin.md` |
| *990522 | 整数分解：Pollard–Rho | `math/pollard-rho.md` |
| *990523 | 原根 | `math/primitive-roots.md` |
| *990524 | 二次剩余与勒让德符号 | `math/quadratic-residues-legendre-symbol.md` |
| *990525 | 二次剩余：Cipolla 算法 | `math/cipolla.md` |
| *990526 | 佩尔方程 | `math/pell-equation.md` |
| *990527 | 线性代数：行列式 | `math/determinant.md` |
| *990528 | 线性递推：Berlekamp–Massey | `math/berlekamp-massey.md` |
| *990529 | 图论计数：矩阵树定理 | `math/matrix-tree-theorem.md` |
| *990530 | 欧拉回路计数：BEST 定理 | `math/best-theorem.md` |
| *990531 | 树的编码：Prüfer 序列 | `math/prufer-sequence.md` |
| *990532 | 路径计数：LGV 引理 | `math/lindstrom-gessel-viennot-lemma.md` |
| *990533 | 生成函数：基础 | `math/generating-functions.md` |
| *990534 | 群论：置换 | `math/permutations.md` |
| *990535 | 群作用计数：Burnside 引理 | `math/burnside-lemma.md` |
| *990536 | 群作用计数：Pólya 定理 | `math/polya-enumeration.md` |
| *990537 | 线性规划 | `math/linear-programming.md` |
| *990538 | 组合计数：抽屉原理 | `math/pigeonhole-principle.md` |
| *990539 | 组合计数：最值容斥 | `math/min-max-inclusion-exclusion.md` |
| *990540 | 组合计数：二项式反演 | `math/binomial-inversion.md` |
| *990541 | 常见数列：错排数 | `math/derangement-numbers.md` |
| *990542 | 常见数列：Catalan 数 | `math/catalan-numbers.md` |
| *990543 | 常见数列：Stirling 数 | `math/stirling-numbers.md` |
| *990544 | 常见数列：Bell 数 | `math/bell-numbers.md` |
| *990545 | 常见数列：Bernoulli 数 | `math/bernoulli-numbers.md` |
| *990546 | 组合计数：杨表 | `math/young-tableaux.md` |
| *990547 | 数值积分：Simpson 公式 | `math/simpson-rule.md` |
| *990548 | 数值积分：自适应 Simpson | `math/adaptive-simpson.md` |
| *990549 | 集合幂级数：FWT/FMT | `math/fast-subset-transforms.md` |
| *990550 | 筛法：分段筛 | `math/segmented-sieve.md` |

### 06 计算几何

| ID | 知识点 | 文件 |
| --- | --- | --- |
| *990601 | 圆与圆的关系 | `computational-geometry/circles.md` |
| *990602 | 旋转卡壳 | `computational-geometry/rotating-calipers.md` |
| *990603 | 几何扫描线 | `computational-geometry/geometric-sweep-line.md` |
| *990604 | 最近点对 | `computational-geometry/closest-pair-of-points.md` |
| *990605 | 凸多边形：点包含 | `computational-geometry/point-in-convex-polygon.md` |
| *990606 | 凸多边形：切线与极值查询 | `computational-geometry/convex-polygon-tangents-extrema.md` |
| *990607 | 半平面交 | `computational-geometry/half-plane-intersection.md` |
| *990608 | 闵可夫斯基和 | `computational-geometry/minkowski-sum.md` |
| *990609 | 极角排序 | `computational-geometry/polar-angle-sort.md` |
| *990610 | 圆：切线 | `computational-geometry/circle-tangents.md` |
| *990611 | 圆：面积交与面积并 | `computational-geometry/circle-area-intersection-union.md` |
| *990612 | 三维计算几何 | `computational-geometry/three-dimensional-geometry.md` |
| *990613 | 平面点定位 | `computational-geometry/point-location.md` |
| *990614 | 最小圆覆盖 | `computational-geometry/minimum-enclosing-circle.md` |
| *990615 | Voronoi 图 | `computational-geometry/voronoi-diagram.md` |
| *990616 | 反演几何 | `computational-geometry/inversive-geometry.md` |
| *990617 | Pick 定理 | `computational-geometry/pick-theorem.md` |

### 07 动态规划

| ID | 知识点 | 文件 |
| --- | --- | --- |
| *990701 | 动态规划优化：斜率 | `dynamic-programming/convex-hull-trick.md` |
| *990702 | 动态规划优化：分治 | `dynamic-programming/divide-conquer-optimization.md` |
| *990703 | 动态规划：Slope Trick | `dynamic-programming/slope-trick.md` |
| *990704 | 记忆化搜索 | `dynamic-programming/memoized-search.md` |
| *990705 | 背包：分组背包 | `dynamic-programming/group-knapsack.md` |
| *990706 | 背包：混合背包 | `dynamic-programming/mixed-knapsack.md` |
| *990707 | 背包：多维背包 | `dynamic-programming/multidimensional-knapsack.md` |
| *990708 | 背包：树上背包 | `dynamic-programming/tree-knapsack.md` |
| *990709 | 状态压缩：轮廓线 DP | `dynamic-programming/profile-dp.md` |
| *990710 | 状态压缩：插头 DP | `dynamic-programming/plug-dp.md` |
| *990711 | 括号序列 DP | `dynamic-programming/bracket-sequence-dp.md` |
| *990712 | 自动机 DP | `dynamic-programming/automaton-dp.md` |
| *990713 | 划分 DP | `dynamic-programming/partition-dp.md` |
| *990714 | 动态 DP | `dynamic-programming/dynamic-dp.md` |
| *990715 | 动态规划优化：单调栈 | `dynamic-programming/monotone-stack-optimization.md` |
| *990716 | 动态规划优化：四边形不等式 | `dynamic-programming/quadrangle-inequality-optimization.md` |

### 08 字符串

| ID | 知识点 | 文件 |
| --- | --- | --- |
| *990801 | 字符串：AC 自动机 | `strings/aho-corasick.md` |
| *990802 | 字符串：Manacher | `strings/manacher.md` |
| *990803 | 字符串：后缀数组 | `strings/suffix-array.md` |
| *990804 | 字符串：后缀自动机 | `strings/suffix-automaton.md` |
| *990805 | 字符串：回文树 | `strings/palindromic-tree.md` |
| *990806 | 字符串：后缀树 | `strings/suffix-tree.md` |
| *990807 | 最小表示法 | `strings/minimum-representation.md` |
| *990808 | Lyndon 分解 | `strings/lyndon-factorization.md` |
