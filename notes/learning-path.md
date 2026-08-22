# 分阶段学习路线

这条路线从 C++ 基础出发，到高中竞赛一等奖常见的知识主干为止。它给出 [模块目录](catalog.md) 中核心教程的教学顺序，也把适合在当前阶段阅读的独立扩展放回对应学习单元；不试图在正文尚未写完时维护一张精确的前置依赖图。

路线使用学习单元表示一次相对完整的学习任务，文章仍然保持足够小且聚焦；同一单元可以把需要共同理解或反复对照的不同模块专题放在一起。路线允许先学会最小用法、以后再回访底层规则，不承诺所有概念都能排成一条没有交叉的直线。单元边界按阶段逐章审计，不能为了表面整齐把只有前置关系的主题强行合并。

标为代码路径的文章尚在计划中；可点击链接表示已经存在正文。`*` 前缀表示扩展阅读，难度通常更高或使用频率更低，暂时不学也不影响后续主线。第 08–09 章分别按照区域赛银牌与金牌能力组织；更远内容只在模块目录登记为“推迟”，不建立第 10 章。其余可选内容统一收录在文末的 [扩展阅读索引](#扩展阅读索引) 中。

常见 XCPC 路线图中的“铜牌、银牌、金牌”描述的是达到相应竞赛能力时应覆盖的知识集合，不是严格的教学阶段：同一档会同时包含很早学习的基础技巧和依赖较多的专题。本路线把入门到铜牌知识进一步拆成 01–06，用 07 收录高中进阶主干，再用 08–09 补齐没有适合前移的银牌与金牌算法。已经在 01–07 学过的内容不因同属银牌集合而重复出现。

[CCF 2025 年 NOI 系列活动竞赛大纲](https://www.noi.cn/xw/2025-04-18/841584.shtml)
把知识点分为入门级、提高级和 NOI 级，并另外标注 `[1]`–`[10]` 的学习难度系数：
入门级知识点通常为 `1–5`，提高级通常为 `5–8`，NOI 级通常为 `7–10`。这些区间
故意重叠，不是学校年级或本书章节编号。本书 04–05 大致对应入门级后半段并在难度
`5` 附近接触提高级，06–07 承接提高级主干。NOI 级标签只用于核对是否漏项；文章
进入 08、09 还是长期推迟，由区域赛能力分级和实际教学价值共同决定。

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
| 010202 | 算术表达式 | C++ | [cpp/arithmetic-expressions.md](cpp/arithmetic-expressions.md) |
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
| 010504 | 条件运算符 | C++ | [cpp/conditional-operator.md](cpp/conditional-operator.md) |
| 010505 | switch | C++ | [cpp/switch.md](cpp/switch.md) |

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
| 011101 | scanf 与 printf | C++ | [cpp/scanf-and-printf.md](cpp/scanf-and-printf.md) |
| 011102 | cin 与 cout | C++ | [cpp/cin-and-cout.md](cpp/cin-and-cout.md) |
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
| *020705 | 编译器与解释器 | C++ | [cpp/compiler-and-interpreter.md](cpp/compiler-and-interpreter.md) |
| *020706 | 编译 | C++ | [cpp/compilation.md](cpp/compilation.md) |
| *020707 | 链接 | C++ | [cpp/linking.md](cpp/linking.md) |
| *020708 | 调试与调试器 | C++ | [cpp/debugging-and-debuggers.md](cpp/debugging-and-debuggers.md) |

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
| *020904 | 初始化 | C++ | [cpp/initialization.md](cpp/initialization.md) |

### 单元 10：*联合体与枚举

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| *021001 | 联合体 | C++ | [cpp/union.md](cpp/union.md) |
| *021002 | 枚举 | C++ | [cpp/enum.md](cpp/enum.md) |

本章仍只从 C++ 竞赛代码的需要解释这些机制，不代替计算机组成、体系结构、操作
系统或编译原理课程。变量、字面量、`inline` 和 `volatile` 等没有形成当前学习任务
的独立扩展仍只由模块目录和文末索引收录，不为了目录齐全强行塞进学习路线。联合体
与枚举因官方入门大纲仍然收录而恢复为末尾的独立扩展单元，但不把它们误写成结构体
的下级类型。类、编译、名称、内存、联合体和枚举不作为后续算法文章的前置；常量已
经在第 01 章的数组单元按实际用途引入。

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
| 030203 | 贪心选择与正确性证明 | 算法基础 | [algorithm-basics/greedy-selection-and-proof.md](algorithm-basics/greedy-selection-and-proof.md) |
| 030204 | 递推 | 算法基础 | [algorithm-basics/recurrence.md](algorithm-basics/recurrence.md) |
| 030205 | 递归与问题分解 | 算法基础 | [algorithm-basics/recursive-problem-solving.md](algorithm-basics/recursive-problem-solving.md) |
| 030206 | 分治 | 算法基础 | [algorithm-basics/divide-and-conquer.md](algorithm-basics/divide-and-conquer.md) |

### 单元 03：标准库基础

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 030301 | vector | C++ | [cpp/vector.md](cpp/vector.md) |
| 030302 | fill | C++ | [cpp/fill.md](cpp/fill.md) |
| 030303 | pair | C++ | [cpp/pair.md](cpp/pair.md) |
| 030304 | tuple | C++ | [cpp/tuple.md](cpp/tuple.md) |
| 030305 | min 与 max | C++ | [cpp/min-and-max.md](cpp/min-and-max.md) |
| 030306 | swap | C++ | [cpp/swap.md](cpp/swap.md) |
| 030307 | sort | C++ | [cpp/sort.md](cpp/sort.md) |
| 030308 | unique | C++ | [cpp/unique.md](cpp/unique.md) |

枚举、模拟、贪心、递推、递归和分治在这里组成方法地图。普通循环枚举与最小示例留
在本阶段；子集、排列、组合和 DFS 枚举等学过状态空间与深度优先搜索以后再展开。
快速排序与归并排序在本章正式回访分治；邻项交换和反悔贪心进入第 04 章。

### 单元 04：数据结构：线性表

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 030401 | 数组 | 算法基础 | [algorithm-basics/array.md](algorithm-basics/array.md) |
| 030402 | array | C++ | [cpp/array.md](cpp/array.md) |
| 030403 | 链表的基本概念 | 算法基础 | [algorithm-basics/linked-list.md](algorithm-basics/linked-list.md) |
| 030404 | 单向链表 | 算法基础 | [algorithm-basics/singly-linked-list.md](algorithm-basics/singly-linked-list.md) |
| 030405 | 双向链表 | 算法基础 | [algorithm-basics/doubly-linked-list.md](algorithm-basics/doubly-linked-list.md) |
| 030406 | 循环链表 | 算法基础 | [algorithm-basics/circular-linked-list.md](algorithm-basics/circular-linked-list.md) |
| 030407 | list | C++ | [cpp/list.md](cpp/list.md) |

本单元从连续存储与链接存储两种模型出发，再回访前一单元的 `vector`：它是连续
存储、可以动态扩容的数组，不是数组与链表之间的混合结构。`array` 为固定长度数组
提供标准库接口；`list` 是标准库双向链表。循环链表正文首次注明也常称环形链表。

### 单元 05：前缀和

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 030501 | 前缀和 | 算法基础 | [algorithm-basics/prefix-sums.md](algorithm-basics/prefix-sums.md) |
| 030502 | 差分 | 算法基础 | [algorithm-basics/difference-array.md](algorithm-basics/difference-array.md) |

### 单元 06：排序

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 030601 | 冒泡排序 | 算法基础 | [algorithm-basics/bubble-sort.md](algorithm-basics/bubble-sort.md) |
| 030602 | 选择排序 | 算法基础 | [algorithm-basics/selection-sort.md](algorithm-basics/selection-sort.md) |
| 030603 | 插入排序 | 算法基础 | [algorithm-basics/insertion-sort.md](algorithm-basics/insertion-sort.md) |
| 030604 | 计数排序 | 算法基础 | [algorithm-basics/counting-sort.md](algorithm-basics/counting-sort.md) |
| 030605 | 快速排序 | 算法基础 | [algorithm-basics/quicksort.md](algorithm-basics/quicksort.md) |
| 030606 | 归并排序 | 算法基础 | [algorithm-basics/merge-sort.md](algorithm-basics/merge-sort.md) |
| 030607 | 排序方法比较 | 算法基础 | [algorithm-basics/sorting-comparison.md](algorithm-basics/sorting-comparison.md) |
| *030608 | 基数排序 | 算法基础 | [algorithm-basics/radix-sort.md](algorithm-basics/radix-sort.md) |
| *030609 | 桶排序 | 算法基础 | [algorithm-basics/bucket-sort.md](algorithm-basics/bucket-sort.md) |

### 单元 07：二分与倍增

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 030701 | 二分查找 | 算法基础 | [algorithm-basics/binary-search.md](algorithm-basics/binary-search.md) |
| 030702 | 二分边界 | 算法基础 | [algorithm-basics/binary-search-boundaries.md](algorithm-basics/binary-search-boundaries.md) |
| 030703 | 标准库二分查找 | C++ | [cpp/stl-binary-search.md](cpp/stl-binary-search.md) |
| 030704 | 二分答案 | 算法基础 | [algorithm-basics/binary-search-on-answer.md](algorithm-basics/binary-search-on-answer.md) |
| 030705 | 浮点数二分 | 算法基础 | [algorithm-basics/floating-point-binary-search.md](algorithm-basics/floating-point-binary-search.md) |
| 030706 | 倍增 | 算法基础 | [algorithm-basics/doubling.md](algorithm-basics/doubling.md) |

二分每次把仍可能包含答案的范围缩小一半；倍增则预处理或尝试 $1,2,4,\ldots$
这些二的幂次步长，再把所需步数按二进制拆开。两者都利用二的幂，但倍增不是
“反过来的二分”，因此在同一单元相邻学习、分别成篇。

### 单元 08：离散化

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 030801 | 离散化 | 算法基础 | [algorithm-basics/coordinate-compression.md](algorithm-basics/coordinate-compression.md) |

### 单元 09：双指针

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 030901 | 双指针 | 算法基础 | [algorithm-basics/two-pointers.md](algorithm-basics/two-pointers.md) |
| 030902 | 滑动窗口 | 算法基础 | [algorithm-basics/sliding-window.md](algorithm-basics/sliding-window.md) |

## 04 初中基础

本章从栈、队列与双端队列开始建立线性结构的抽象接口，再展开数论、图、树、枚举、
贪心、动态规划与字符串等能够独立解决问题的初中竞赛主干。第 03 章已经完整学习的
线性表、前缀和、排序、二分、离散化和双指针不在这里重复登记。

### 单元 01：数据结构：栈与队列

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 040101 | 栈 | 算法基础 | [algorithm-basics/stack.md](algorithm-basics/stack.md) |
| 040102 | 队列 | 算法基础 | [algorithm-basics/queue.md](algorithm-basics/queue.md) |
| 040103 | 双端队列 | 算法基础 | [algorithm-basics/deque.md](algorithm-basics/deque.md) |
| 040104 | deque | C++ | [cpp/deque.md](cpp/deque.md) |
| 040105 | stack | C++ | [cpp/stack.md](cpp/stack.md) |
| 040106 | queue | C++ | [cpp/queue.md](cpp/queue.md) |
| 040107 | 出栈序列判定 | 算法基础 | [algorithm-basics/stack-pop-sequence-validation.md](algorithm-basics/stack-pop-sequence-validation.md) |
| 040108 | 表达式求值 | 算法基础 | [algorithm-basics/expression-evaluation.md](algorithm-basics/expression-evaluation.md) |

栈、队列和双端队列先作为线性抽象结构学习，再用 `deque` 认识能够直接操作两端的
序列容器。此后学习的 `stack` 与 `queue` 是容器适配器，默认都以 `deque` 作为
底层容器。标准不规定 `deque` 的具体内部实现；常见实现使用分段连续存储，不能把
它定义成链表。

### 单元 02：数学：数论基础

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 040201 | 因数、倍数与整除 | 数学 | [math/divisibility.md](math/divisibility.md) |
| 040202 | 质数 | 数学 | [math/prime-numbers.md](math/prime-numbers.md) |
| 040203 | 试除法：质数检测 | 数学 | [math/trial-division-primality-test.md](math/trial-division-primality-test.md) |
| 040204 | 算术基本定理 | 数学 | [math/fundamental-theorem-of-arithmetic.md](math/fundamental-theorem-of-arithmetic.md) |
| 040205 | 质因数分解 | 数学 | [math/prime-factorization.md](math/prime-factorization.md) |
| 040206 | 埃拉托斯特尼筛法 | 数学 | [math/sieve-of-eratosthenes.md](math/sieve-of-eratosthenes.md) |
| 040207 | 最大公约数与最小公倍数 | 数学 | [math/greatest-common-divisor-and-least-common-multiple.md](math/greatest-common-divisor-and-least-common-multiple.md) |
| 040208 | 欧几里得算法 | 数学 | [math/euclidean-algorithm.md](math/euclidean-algorithm.md) |
| 040209 | 快速幂 | 数学 | [math/fast-exponentiation.md](math/fast-exponentiation.md) |

### 单元 03：图论：图

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 040301 | 点与边 | 图论 | [graph-theory/vertices-and-edges.md](graph-theory/vertices-and-edges.md) |
| 040302 | 路径与环 | 图论 | [graph-theory/paths-and-cycles.md](graph-theory/paths-and-cycles.md) |
| 040303 | 度数 | 图论 | [graph-theory/vertex-degrees.md](graph-theory/vertex-degrees.md) |
| 040304 | 图的存储：基础概念 | 图论 | [graph-theory/graph-representation.md](graph-theory/graph-representation.md) |
| 040305 | 图的存储：邻接矩阵 | 图论 | [graph-theory/adjacency-matrix.md](graph-theory/adjacency-matrix.md) |
| 040306 | 图的存储：邻接表（`vector` 实现） | 图论 | [graph-theory/vector-adjacency-list.md](graph-theory/vector-adjacency-list.md) |
| 040307 | 图的遍历：深度优先搜索（DFS） | 图论 | [graph-theory/graph-depth-first-search.md](graph-theory/graph-depth-first-search.md) |
| 040308 | 图的遍历：广度优先搜索（BFS） | 图论 | [graph-theory/graph-breadth-first-search.md](graph-theory/graph-breadth-first-search.md) |
| 040309 | 连通分量 | 图论 | [graph-theory/connected-components.md](graph-theory/connected-components.md) |
| 040310 | 泛洪算法（Flood Fill） | 图论 | [graph-theory/flood-fill.md](graph-theory/flood-fill.md) |
| 040311 | 多源 BFS | 图论 | [graph-theory/multi-source-bfs.md](graph-theory/multi-source-bfs.md) |
| 040312 | 二分图：判定 | 图论 | [graph-theory/bipartite-graph.md](graph-theory/bipartite-graph.md) |

### 单元 04：图论：树

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 040401 | 无根树 | 图论 | [graph-theory/unrooted-trees.md](graph-theory/unrooted-trees.md) |
| 040402 | 有根树 | 图论 | [graph-theory/rooted-trees.md](graph-theory/rooted-trees.md) |
| 040403 | 树的遍历：深度优先搜索（DFS） | 图论 | [graph-theory/tree-depth-first-search.md](graph-theory/tree-depth-first-search.md) |
| 040404 | 树的遍历：广度优先搜索（BFS） | 图论 | [graph-theory/tree-breadth-first-search.md](graph-theory/tree-breadth-first-search.md) |

### 单元 05：算法基础：枚举

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 040501 | 状态空间与隐式图 | 算法基础 | [algorithm-basics/state-space-and-implicit-graphs.md](algorithm-basics/state-space-and-implicit-graphs.md) |
| 040502 | 子集与位掩码枚举 | 算法基础 | [algorithm-basics/subset-bitmask-enumeration.md](algorithm-basics/subset-bitmask-enumeration.md) |
| 040503 | 排列枚举 | 算法基础 | [algorithm-basics/permutation-enumeration.md](algorithm-basics/permutation-enumeration.md) |
| 040504 | 组合枚举 | 算法基础 | [algorithm-basics/combination-enumeration.md](algorithm-basics/combination-enumeration.md) |
| 040505 | DFS、回溯与剪枝 | 算法基础 | [algorithm-basics/dfs-backtracking-pruning.md](algorithm-basics/dfs-backtracking-pruning.md) |

### 单元 06：算法基础：贪心

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 040601 | 邻项交换证明 | 算法基础 | [algorithm-basics/greedy-adjacent-exchange.md](algorithm-basics/greedy-adjacent-exchange.md) |
| 040602 | 反悔贪心 | 算法基础 | [algorithm-basics/greedy-regret.md](algorithm-basics/greedy-regret.md) |

### 单元 07：动态规划：动态规划基础

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 040701 | 动态规划的状态与转移 | 动态规划 | [dynamic-programming/dp-state-transition.md](dynamic-programming/dp-state-transition.md) |
| 040702 | 数字三角形 | 动态规划 | [dynamic-programming/number-triangle.md](dynamic-programming/number-triangle.md) |
| 040703 | 最大子段和 | 动态规划 | [dynamic-programming/maximum-subarray-sum.md](dynamic-programming/maximum-subarray-sum.md) |
| 040704 | 最长上升子序列 | 动态规划 | [dynamic-programming/longest-increasing-subsequence.md](dynamic-programming/longest-increasing-subsequence.md) |
| 040705 | 最长公共子序列 | 动态规划 | [dynamic-programming/longest-common-subsequence.md](dynamic-programming/longest-common-subsequence.md) |

### 单元 08：动态规划：背包

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 040801 | 0-1 背包 | 动态规划 | [dynamic-programming/zero-one-knapsack.md](dynamic-programming/zero-one-knapsack.md) |
| 040802 | 完全背包 | 动态规划 | [dynamic-programming/complete-knapsack.md](dynamic-programming/complete-knapsack.md) |
| 040803 | 多重背包 | 动态规划 | [dynamic-programming/multiple-knapsack.md](dynamic-programming/multiple-knapsack.md) |

### 单元 09：字符串：字符串基础

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 040901 | 字符串的基本概念 | 字符串 | [strings/string-concepts.md](strings/string-concepts.md) |
| 040902 | 字符串比较与字典序 | 字符串 | [strings/comparison-and-lexicographic-order.md](strings/comparison-and-lexicographic-order.md) |
| 040903 | 朴素字符串匹配 | 字符串 | [strings/naive-pattern-matching.md](strings/naive-pattern-matching.md) |

### 单元 10：*数学基础回顾

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| *041001 | 数系：自然数、整数、有理数与实数 | 数学 | [math/number-systems-review.md](math/number-systems-review.md) |
| *041002 | 集合：基本概念与交、并、补 | 数学 | [math/sets-review.md](math/sets-review.md) |
| *041003 | 代数：方程与不等式 | 数学 | [math/equations-and-inequalities-review.md](math/equations-and-inequalities-review.md) |
| *041004 | 几何：平面几何基础 | 数学 | [math/plane-geometry-basics.md](math/plane-geometry-basics.md) |

本单元只复习竞赛题面会直接使用的术语、符号和运算，不重新讲授完整的初中数学
课程；暂时跳过不会阻塞后续算法学习。

## 05 初中进阶

本阶段加入依赖更完整背景或适用范围更专门的工具。二叉树先区分基本概念、普通
二叉树存储与完全二叉树的连续编号，再学习前序、中序和后序遍历。随后从完全二叉树
推导二叉堆与 `priority_queue`，并用哈夫曼编码完成一次取最小值的实际应用；堆排序
只作为扩展。哈希、哈希表、标准库进阶和高精度整数各自保持清楚的主题边界。

### 单元 01：数据结构：二叉树

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 050101 | 二叉树的基本概念 | 数据结构 | [data-structures/binary-tree-concepts.md](data-structures/binary-tree-concepts.md) |
| 050102 | 二叉树的存储 | 数据结构 | [data-structures/binary-tree-storage.md](data-structures/binary-tree-storage.md) |
| 050103 | 完全二叉树 | 数据结构 | [data-structures/complete-binary-tree.md](data-structures/complete-binary-tree.md) |
| 050104 | 二叉树的遍历：前序、中序与后序 | 数据结构 | [data-structures/binary-tree-traversals.md](data-structures/binary-tree-traversals.md) |
| 050105 | 二叉搜索树的概念与构造 | 数据结构 | [data-structures/binary-search-tree-construction.md](data-structures/binary-search-tree-construction.md) |

### 单元 02：数据结构：二叉堆

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 050201 | 二叉堆 | 算法基础 | [algorithm-basics/binary-heap.md](algorithm-basics/binary-heap.md) |
| 050202 | priority_queue | C++ | [cpp/priority-queue.md](cpp/priority-queue.md) |
| 050203 | 哈夫曼编码 | 其他 | [other/huffman-coding.md](other/huffman-coding.md) |
| *050204 | 堆排序 | 算法基础 | [algorithm-basics/heap-sort.md](algorithm-basics/heap-sort.md) |

### 单元 03：数据结构：哈希表

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 050301 | 哈希 | 算法基础 | [algorithm-basics/hashing.md](algorithm-basics/hashing.md) |
| 050302 | 哈希表 | 算法基础 | [algorithm-basics/hash-table.md](algorithm-basics/hash-table.md) |

### 单元 04：标准库进阶

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 050401 | set | C++ | [cpp/set.md](cpp/set.md) |
| 050402 | map | C++ | [cpp/map.md](cpp/map.md) |
| 050403 | multiset | C++ | [cpp/multiset.md](cpp/multiset.md) |
| 050404 | multimap | C++ | [cpp/multimap.md](cpp/multimap.md) |
| 050405 | unordered_set | C++ | [cpp/unordered-set.md](cpp/unordered-set.md) |
| 050406 | unordered_map | C++ | [cpp/unordered-map.md](cpp/unordered-map.md) |

### 单元 05：数学：高精度整数

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 050501 | 高精度整数：加法、减法与乘法 | 数学 | [math/big-integer-addition-subtraction-multiplication.md](math/big-integer-addition-subtraction-multiplication.md) |
| 050502 | 高精度整数：除以低精度整数 | 数学 | [math/big-integer-division-by-small-integer.md](math/big-integer-division-by-small-integer.md) |

### 单元 06：数学：组合数学

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 050601 | 加法原理 | 数学 | [math/addition-principle.md](math/addition-principle.md) |
| 050602 | 乘法原理 | 数学 | [math/multiplication-principle.md](math/multiplication-principle.md) |
| *050603 | 容斥原理 | 数学 | [math/inclusion-exclusion.md](math/inclusion-exclusion.md) |
| 050604 | 排列数 | 数学 | [math/permutations-count.md](math/permutations-count.md) |
| 050605 | 组合数与二项式系数 | 数学 | [math/binomial-coefficients.md](math/binomial-coefficients.md) |
| 050606 | 二项式定理 | 数学 | [math/binomial-theorem.md](math/binomial-theorem.md) |
| 050607 | 杨辉三角 | 数学 | [math/pascal-triangle.md](math/pascal-triangle.md) |

组合数与二项式系数是同一个数学对象的两种名称。杨辉三角从组合数递推式推导，并
作为递推和二维动态规划的直接例子。

### 单元 07：动态规划：区间 DP

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 050701 | 区间 DP | 动态规划 | [dynamic-programming/interval-dp.md](dynamic-programming/interval-dp.md) |

区间 DP 按区间长度从短到长推进：区间长度 `len` 是阶段，当前区间 `[l,r]` 是
状态，分割点或最后一次操作是决策。代码通常直接保存 `f[l][r]`，而
`len = r - l + 1` 仍然决定状态的计算顺序。

## 06 高中基础

本阶段进入高中竞赛一等奖常见主干。目录从本阶段开始改用较粗的模块单元组织内容；
只有最短路、最小生成树这类边界稳定且内部包含多种算法的专题单独成单元。

### 单元 01：算法基础

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 060101 | 均摊复杂度 | 算法基础 | [algorithm-basics/amortized-complexity.md](algorithm-basics/amortized-complexity.md) |
| 060102 | 均摊复杂度：势能法 | 算法基础 | [algorithm-basics/potential-method.md](algorithm-basics/potential-method.md) |

### 单元 02：数据结构

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 060201 | 线段树 | 数据结构 | [data-structures/segment-tree.md](data-structures/segment-tree.md) |
| 060202 | 树状数组 | 数据结构 | [data-structures/fenwick-tree.md](data-structures/fenwick-tree.md) |
| *060203 | 稀疏表（ST 表） | 数据结构 | [data-structures/sparse-table.md](data-structures/sparse-table.md) |
| 060204 | 单调栈 | 算法基础 | [algorithm-basics/monotonic-stack.md](algorithm-basics/monotonic-stack.md) |
| 060205 | 单调队列 | 算法基础 | [algorithm-basics/monotonic-queue.md](algorithm-basics/monotonic-queue.md) |

### 单元 03：数学

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 060301 | 模运算 | 数学 | [math/modular-arithmetic.md](math/modular-arithmetic.md) |
| 060302 | 模快速幂 | 数学 | [math/modular-exponentiation.md](math/modular-exponentiation.md) |
| 060303 | 正因数个数 | 数学 | [math/divisor-count.md](math/divisor-count.md) |
| 060304 | 正因数和 | 数学 | [math/divisor-sum.md](math/divisor-sum.md) |
| 060305 | 矩阵：表示 | 数学 | [math/matrix-representation.md](math/matrix-representation.md) |
| 060306 | 矩阵：加法与减法 | 数学 | [math/matrix-addition-subtraction.md](math/matrix-addition-subtraction.md) |
| 060307 | 矩阵：乘法 | 数学 | [math/matrix-multiplication.md](math/matrix-multiplication.md) |
| 060308 | 线性变换：矩阵表示 | 数学 | [math/linear-transformations-as-matrices.md](math/linear-transformations-as-matrices.md) |
| 060309 | 矩阵快速幂 | 数学 | [math/matrix-exponentiation.md](math/matrix-exponentiation.md) |

### 单元 04：图论

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 060401 | 树的直径与中心 | 图论 | [graph-theory/tree-diameter-center.md](graph-theory/tree-diameter-center.md) |
| 060402 | 树的重心 | 图论 | [graph-theory/tree-centroid.md](graph-theory/tree-centroid.md) |
| 060403 | 树的 DFS 序与子树区间 | 图论 | [graph-theory/tree-euler-tour.md](graph-theory/tree-euler-tour.md) |
| 060404 | 倍增 LCA | 图论 | [graph-theory/lca-binary-lifting.md](graph-theory/lca-binary-lifting.md) |
| 060405 | 树上差分 | 图论 | [graph-theory/tree-difference.md](graph-theory/tree-difference.md) |
| 060406 | 拓扑排序 | 图论 | [graph-theory/topological-sort.md](graph-theory/topological-sort.md) |
| *060407 | 基环树 | 图论 | [graph-theory/unicyclic-graph.md](graph-theory/unicyclic-graph.md) |

### 单元 05：图论：最短路

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 060501 | 最短路：Dijkstra | 图论 | [graph-theory/dijkstra.md](graph-theory/dijkstra.md) |
| 060502 | 最短路：Bellman–Ford 与负环 | 图论 | [graph-theory/bellman-ford.md](graph-theory/bellman-ford.md) |
| 060503 | 最短路：Floyd–Warshall | 图论 | [graph-theory/floyd-warshall.md](graph-theory/floyd-warshall.md) |
| 060504 | 最短路：0-1 BFS | 图论 | [graph-theory/zero-one-bfs.md](graph-theory/zero-one-bfs.md) |

### 单元 06：图论：最小生成树

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 060601 | 图的存储：边集 | 图论 | [graph-theory/edge-list.md](graph-theory/edge-list.md) |
| 060602 | 并查集 | 数据结构 | [data-structures/disjoint-set-union.md](data-structures/disjoint-set-union.md) |
| 060603 | 最小生成树：Kruskal | 图论 | [graph-theory/kruskal.md](graph-theory/kruskal.md) |
| 060604 | 最小生成树：Prim | 图论 | [graph-theory/prim.md](graph-theory/prim.md) |

### 单元 07：字符串

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 060701 | 字符串哈希 | 字符串 | [strings/rolling-hash.md](strings/rolling-hash.md) |
| 060702 | KMP 与前缀函数 | 字符串 | [strings/kmp-prefix-function.md](strings/kmp-prefix-function.md) |
| *060703 | Z 函数 | 字符串 | [strings/z-function.md](strings/z-function.md) |
| 060704 | Trie | 字符串 | [strings/trie.md](strings/trie.md) |
| 060705 | 字符串构造 | 字符串 | [strings/string-construction.md](strings/string-construction.md) |

## 07 高中进阶

本阶段在前面的稳定模型上继续组合技巧。与高中基础相同，目录默认按知识模块组织，
不再为一两篇文章制造单独单元。

### 单元 01：算法基础

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 070101 | 枚举：Meet-in-the-Middle | 算法基础 | [algorithm-basics/meet-in-the-middle.md](algorithm-basics/meet-in-the-middle.md) |
| 070102 | 离线算法 | 算法基础 | [algorithm-basics/offline-algorithms.md](algorithm-basics/offline-algorithms.md) |
| 070103 | 扫描线与事件排序 | 算法基础 | [algorithm-basics/sweep-line.md](algorithm-basics/sweep-line.md) |

### 单元 02：图论

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 070201 | 有向图：强连通分量 | 图论 | [graph-theory/strongly-connected-components.md](graph-theory/strongly-connected-components.md) |
| 070202 | 无向图：割点与桥 | 图论 | [graph-theory/articulation-points-bridges.md](graph-theory/articulation-points-bridges.md) |
| 070203 | 最短路：分层图与状态图 | 图论 | [graph-theory/layered-state-shortest-path.md](graph-theory/layered-state-shortest-path.md) |
| 070204 | 图的存储：邻接表（链式前向星实现） | 图论 | [graph-theory/chained-forward-star.md](graph-theory/chained-forward-star.md) |
| 070205 | 欧拉问题：路径、回路与图 | 图论 | [graph-theory/eulerian-paths-and-circuits.md](graph-theory/eulerian-paths-and-circuits.md) |
| 070206 | 哈密顿问题：路径、回路与图 | 图论 | [graph-theory/hamiltonian-paths-and-circuits.md](graph-theory/hamiltonian-paths-and-circuits.md) |

### 单元 03：数学

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 070301 | 数论：扩展欧几里得算法 | 数学 | [math/extended-euclidean-algorithm.md](math/extended-euclidean-algorithm.md) |
| 070302 | 线性不定方程 | 数学 | [math/linear-diophantine-equations.md](math/linear-diophantine-equations.md) |
| 070303 | 线性同余方程 | 数学 | [math/linear-congruences.md](math/linear-congruences.md) |
| 070304 | 费马小定理 | 数学 | [math/fermat-little-theorem.md](math/fermat-little-theorem.md) |
| 070305 | 模逆元 | 数学 | [math/modular-inverse.md](math/modular-inverse.md) |
| 070306 | 组合数：阶乘与逆元预处理 | 数学 | [math/binomial-coefficients-factorials.md](math/binomial-coefficients-factorials.md) |
| 070307 | 筛法：欧拉筛（线性筛） | 数学 | [math/euler-sieve.md](math/euler-sieve.md) |
| 070308 | 欧拉函数 | 数学 | [math/euler-totient.md](math/euler-totient.md) |
| 070309 | 莫比乌斯函数 | 数学 | [math/mobius-function.md](math/mobius-function.md) |
| 070310 | 数论：中国剩余定理（CRT） | 数学 | [math/chinese-remainder-theorem.md](math/chinese-remainder-theorem.md) |
| 070311 | 数论：扩展中国剩余定理（exCRT） | 数学 | [math/extended-chinese-remainder-theorem.md](math/extended-chinese-remainder-theorem.md) |

### 单元 04：计算几何

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 070401 | 坐标、点、向量与精度 | 计算几何 | [computational-geometry/points-vectors-precision.md](computational-geometry/points-vectors-precision.md) |
| 070402 | 点积、叉积与方向判断 | 计算几何 | [computational-geometry/dot-cross-orientation.md](computational-geometry/dot-cross-orientation.md) |
| 070403 | 直线、线段与相交判定 | 计算几何 | [computational-geometry/lines-segments-intersections.md](computational-geometry/lines-segments-intersections.md) |
| 070404 | 多边形面积与点的位置 | 计算几何 | [computational-geometry/polygon-area-point-location.md](computational-geometry/polygon-area-point-location.md) |
| 070405 | 凸包 | 计算几何 | [computational-geometry/convex-hull.md](computational-geometry/convex-hull.md) |

### 单元 05：动态规划

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 070501 | DAG 上的 DP | 动态规划 | [dynamic-programming/dag-dp.md](dynamic-programming/dag-dp.md) |
| 070502 | 树形 DP | 动态规划 | [dynamic-programming/tree-dp.md](dynamic-programming/tree-dp.md) |
| 070503 | 状态压缩 DP | 动态规划 | [dynamic-programming/bitmask-dp.md](dynamic-programming/bitmask-dp.md) |
| 070504 | 数位 DP | 动态规划 | [dynamic-programming/digit-dp.md](dynamic-programming/digit-dp.md) |
| 070505 | 概率与期望基础 | 数学 | [math/probability-expectation.md](math/probability-expectation.md) |
| 070506 | 概率与期望 DP | 动态规划 | [dynamic-programming/probability-expectation-dp.md](dynamic-programming/probability-expectation-dp.md) |
| 070507 | 单调队列优化 | 动态规划 | [dynamic-programming/monotone-queue-optimization.md](dynamic-programming/monotone-queue-optimization.md) |
| 070508 | 单调栈优化 | 动态规划 | [dynamic-programming/monotone-stack-optimization.md](dynamic-programming/monotone-stack-optimization.md) |
| 070509 | 斜率优化 | 动态规划 | [dynamic-programming/convex-hull-trick.md](dynamic-programming/convex-hull-trick.md) |

完成 07 高中进阶后，读者已经具备独立阅读题解、按题目补充专题和判断新算法依赖的能力。后续阶段改用区域赛奖牌能力描述覆盖范围，不再借用“大学基础”或 NOI 难度系数充当课程名称。

## 08 区域赛银牌

本阶段补齐达到区域赛银牌所需、且没有必要提前放入高中路线的知识。章内既可以包含
参考技能树中的蓝色银牌算法，也可以包含此前遗漏的更简单前置，或为了连续推导而与
蓝色文章共同学习的基础篇；章节位置不等于单篇难度标签。生成函数、Treap 和
FHQ Treap 高于银牌，但作为明确的主动学习例外保留在本阶段。

### 单元 01：数据结构

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 080101 | 并查集：扩展域 | 数据结构 | [data-structures/extended-domain-disjoint-set.md](data-structures/extended-domain-disjoint-set.md) |
| 080102 | 并查集：带权 | 数据结构 | [data-structures/weighted-disjoint-set.md](data-structures/weighted-disjoint-set.md) |
| 080103 | 分块 | 数据结构 | [data-structures/square-root-decomposition.md](data-structures/square-root-decomposition.md) |
| 080104 | 莫队算法 | 数据结构 | [data-structures/mo-algorithm.md](data-structures/mo-algorithm.md) |
| 080105 | 启发式合并 | 数据结构 | [data-structures/small-to-large-merging.md](data-structures/small-to-large-merging.md) |
| 080106 | 树上启发式合并 | 数据结构 | [graph-theory/dsu-on-tree.md](graph-theory/dsu-on-tree.md) |
| 080107 | 重链剖分 | 数据结构 | [graph-theory/heavy-light-decomposition.md](graph-theory/heavy-light-decomposition.md) |
| 080108 | 笛卡尔树 | 数据结构 | [data-structures/cartesian-tree.md](data-structures/cartesian-tree.md) |
| 080109 | Treap | 数据结构 | [data-structures/treap.md](data-structures/treap.md) |
| 080110 | FHQ Treap | 数据结构 | [data-structures/fhq-treap.md](data-structures/fhq-treap.md) |

### 单元 02：图论

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 080201 | 二分图：最大匹配 | 图论 | [graph-theory/bipartite-matching.md](graph-theory/bipartite-matching.md) |
| 080202 | 2-SAT | 图论 | [graph-theory/two-sat.md](graph-theory/two-sat.md) |

### 单元 03：数学

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 080301 | 数论：欧拉定理 | 数学 | [math/euler-theorem.md](math/euler-theorem.md) |
| 080302 | 数论：扩展欧拉定理 | 数学 | [math/extended-euler-theorem.md](math/extended-euler-theorem.md) |
| 080303 | 线性代数：异或线性基 | 数学 | [math/xor-linear-basis.md](math/xor-linear-basis.md) |
| 080304 | 线性代数：高斯消元 | 数学 | [math/gaussian-elimination.md](math/gaussian-elimination.md) |
| 080305 | 线性代数：行列式 | 数学 | [math/determinant.md](math/determinant.md) |
| 080306 | Nim、SG 函数与基础博弈论 | 数学 | [math/nim-sg-game-theory.md](math/nim-sg-game-theory.md) |
| 080307 | 组合数学：错位排列 | 数学 | [math/derangement-numbers.md](math/derangement-numbers.md) |
| 080308 | 组合数学：整数划分 | 数学 | [math/integer-partitions.md](math/integer-partitions.md) |
| 080309 | 组合数学：Catalan 数 | 数学 | [math/catalan-numbers.md](math/catalan-numbers.md) |
| 080310 | 组合数学：Stirling 数 | 数学 | [math/stirling-numbers.md](math/stirling-numbers.md) |
| 080311 | 多项式：表示、加法与减法 | 数学 | [math/polynomial-representation-addition-subtraction.md](math/polynomial-representation-addition-subtraction.md) |
| 080312 | 多项式：卷积与朴素乘法 | 数学 | [math/convolution-naive-multiplication.md](math/convolution-naive-multiplication.md) |
| 080313 | 多项式：FFT | 数学 | [math/fft.md](math/fft.md) |
| 080314 | 多项式：NTT | 数学 | [math/ntt.md](math/ntt.md) |
| 080315 | 生成函数：基础 | 数学 | [math/generating-functions.md](math/generating-functions.md) |

### 单元 04：字符串

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 080401 | AC 自动机 | 字符串 | [strings/aho-corasick.md](strings/aho-corasick.md) |
| 080402 | Manacher | 字符串 | [strings/manacher.md](strings/manacher.md) |

### 单元 05：计算几何

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 080501 | 极角排序 | 计算几何 | [computational-geometry/polar-angle-sort.md](computational-geometry/polar-angle-sort.md) |
| 080502 | 圆：位置关系与交点 | 计算几何 | [computational-geometry/circles.md](computational-geometry/circles.md) |
| 080503 | 圆：切线 | 计算几何 | [computational-geometry/circle-tangents.md](computational-geometry/circle-tangents.md) |

## 09 区域赛金牌

本阶段收录区域赛金牌范围内已经形成稳定问题模型的内容。银牌与金牌阶段不再预先
细分专题，只按模块组织；等正文数量和真实依赖稳定以后，再判断是否需要增加中间层级。

### 单元 01：算法基础

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 090101 | CDQ 分治 | 算法基础 | [algorithm-basics/cdq-divide-and-conquer.md](algorithm-basics/cdq-divide-and-conquer.md) |

### 单元 02：数据结构

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 090201 | Splay | 数据结构 | [data-structures/splay.md](data-structures/splay.md) |
| 090202 | 可持久化线段树 | 数据结构 | [data-structures/persistent-segment-tree.md](data-structures/persistent-segment-tree.md) |
| 090203 | 树套树：线段树套线段树 | 数据结构 | [data-structures/segment-tree-of-segment-trees.md](data-structures/segment-tree-of-segment-trees.md) |
| 090204 | 树套树：线段树套平衡树 | 数据结构 | [data-structures/segment-tree-of-balanced-trees.md](data-structures/segment-tree-of-balanced-trees.md) |
| 090205 | 动态树：Link-Cut Tree | 数据结构 | [data-structures/link-cut-tree.md](data-structures/link-cut-tree.md) |
| 090206 | KD 树 | 数据结构 | [data-structures/kd-tree.md](data-structures/kd-tree.md) |
| 090207 | 可持久化并查集 | 数据结构 | [data-structures/persistent-disjoint-set-union.md](data-structures/persistent-disjoint-set-union.md) |

### 单元 03：图论

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 090301 | 点分治 | 图论 | [graph-theory/centroid-decomposition.md](graph-theory/centroid-decomposition.md) |
| 090302 | 边分治 | 图论 | `graph-theory/edge-decomposition.md` |
| 090303 | 虚树 | 图论 | [graph-theory/virtual-tree.md](graph-theory/virtual-tree.md) |
| 090304 | 树哈希 | 图论 | [graph-theory/tree-hashing.md](graph-theory/tree-hashing.md) |
| 090305 | 最短路树 | 图论 | [graph-theory/shortest-path-tree.md](graph-theory/shortest-path-tree.md) |
| 090306 | Boruvka 算法 | 图论 | [graph-theory/boruvka.md](graph-theory/boruvka.md) |
| 090307 | 点双连通分量与圆方树 | 图论 | `graph-theory/biconnected-components-block-cut-tree.md` |
| 090308 | 最大流与残量网络 | 图论 | `graph-theory/max-flow-residual-network.md` |
| 090309 | Dinic 算法 | 图论 | `graph-theory/dinic-max-flow.md` |
| 090310 | SAP 算法 | 图论 | `graph-theory/sap-max-flow.md` |
| 090311 | 可行流 | 图论 | `graph-theory/feasible-flow.md` |
| 090312 | 最小费用最大流 | 图论 | `graph-theory/min-cost-max-flow.md` |
| 090313 | 上下界网络流 | 图论 | `graph-theory/bounded-flow.md` |
| 090314 | 二分图最大权匹配：KM 算法 | 图论 | `graph-theory/kuhn-munkres.md` |
| 090315 | Steiner 树 | 图论 | `graph-theory/steiner-tree.md` |
| 090316 | 仙人掌 | 图论 | `graph-theory/cactus-graph.md` |

### 单元 04：数学

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 090401 | 原根与阶 | 数学 | `math/primitive-roots.md` |
| 090402 | BSGS 与离散对数 | 数学 | `math/discrete-logarithm.md` |
| 090403 | 扩展卢卡斯定理 | 数学 | `math/extended-lucas-theorem.md` |
| 090404 | 矩阵求逆 | 数学 | `math/matrix-inverse.md` |
| 090405 | 矩阵树定理 | 数学 | `math/matrix-tree-theorem.md` |
| 090406 | 最值容斥 | 数学 | `math/min-max-inclusion-exclusion.md` |
| 090407 | 二项式反演 | 数学 | `math/binomial-inversion.md` |
| 090408 | Prufer 序列 | 数学 | `math/prufer-sequence.md` |
| 090409 | 拉格朗日插值 | 数学 | `math/lagrange-interpolation.md` |
| 090410 | FWT 与 FMT | 数学 | `math/fast-subset-transforms.md` |
| 090411 | Burnside 引理 | 数学 | `math/burnside-lemma.md` |
| 090412 | Polya 定理 | 数学 | `math/polya-enumeration.md` |
| 090413 | Simpson 公式 | 数学 | `math/simpson-rule.md` |
| 090414 | 自适应 Simpson | 数学 | `math/adaptive-simpson.md` |
| 090415 | 类欧几里得算法 | 数学 | `math/euclidean-like-algorithm.md` |
| 090416 | 杜教筛 | 数学 | `math/du-jiao-sieve.md` |
| 090417 | Min_25 筛 | 数学 | `math/min-25-sieve.md` |
| 090418 | 线性递推：Berlekamp-Massey | 数学 | `math/berlekamp-massey.md` |
| 090419 | 线性规划与单纯形法 | 数学 | `math/linear-programming.md` |

### 单元 05：动态规划

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 090501 | 自动机 DP | 动态规划 | `dynamic-programming/automaton-dp.md` |
| 090502 | 决策单调性 | 动态规划 | `dynamic-programming/decision-monotonicity.md` |
| 090503 | 分治优化 | 动态规划 | `dynamic-programming/divide-conquer-optimization.md` |
| 090504 | 四边形不等式优化 | 动态规划 | `dynamic-programming/quadrangle-inequality-optimization.md` |

### 单元 06：字符串

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 090601 | 后缀数组 | 字符串 | `strings/suffix-array.md` |
| 090602 | 后缀自动机 | 字符串 | `strings/suffix-automaton.md` |
| 090603 | 回文自动机 | 字符串 | `strings/palindromic-tree.md` |
| 090604 | 本质不同子串计数 | 字符串 | `strings/distinct-substring-counting.md` |
| 090605 | 字典序第 k 小子串 | 字符串 | `strings/kth-lexicographic-substring.md` |
| 090606 | 子串出现次数 | 字符串 | `strings/substring-occurrence-counting.md` |
| 090607 | 最长重复子串 | 字符串 | `strings/longest-repeated-substring.md` |
| 090608 | 最长公共子串 | 字符串 | `strings/longest-common-substring.md` |

### 单元 07：计算几何

| ID | 知识点 | 模块 | 文件 |
| --- | --- | --- | --- |
| 090701 | 凸多边形点包含 | 计算几何 | `computational-geometry/point-in-convex-polygon.md` |
| 090702 | 旋转卡壳 | 计算几何 | `computational-geometry/rotating-calipers.md` |
| 090703 | 半平面交 | 计算几何 | `computational-geometry/half-plane-intersection.md` |
| 090704 | 圆面积交与面积并 | 计算几何 | `computational-geometry/circle-area-intersection-union.md` |
| 090705 | 平面点定位 | 计算几何 | `computational-geometry/point-location.md` |
| 090706 | 最小圆覆盖 | 计算几何 | `computational-geometry/minimum-enclosing-circle.md` |

红色争冠内容不建立第 10 章。它们只在模块目录中以“推迟”状态保留资料身份，除非
以后出现明确学习需求，否则不进入写作和审核队列。

## 扩展阅读索引

以下独立扩展不属于核心必学顺序，其中一部分可能明显高于高中竞赛一等奖的常见范围。它们按模块和 ID 排列，便于查找；开始某篇之前可以回到 [模块目录](catalog.md) 查看状态和所属模块。使用 `*CCUUPPe1`、`*CCUUPPe2` 等编号的附属扩展只从对应基础文章进入，不在这里重复平铺。

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
| *020705 | 编译器与解释器 | [cpp/compiler-and-interpreter.md](cpp/compiler-and-interpreter.md) |
| *020706 | 编译 | [cpp/compilation.md](cpp/compilation.md) |
| *020707 | 链接 | [cpp/linking.md](cpp/linking.md) |
| *020708 | 调试与调试器 | [cpp/debugging-and-debuggers.md](cpp/debugging-and-debuggers.md) |
| *020801 | 关键字 | [cpp/keywords.md](cpp/keywords.md) |
| *020802 | 标识符 | [cpp/identifiers.md](cpp/identifiers.md) |
| *020803 | 作用域 | [cpp/scope.md](cpp/scope.md) |
| *020804 | 命名空间与 std | [cpp/namespace-and-std.md](cpp/namespace-and-std.md) |
| *020805 | typedef 类型别名 | [cpp/typedef-type-alias.md](cpp/typedef-type-alias.md) |
| *020806 | using 类型别名 | [cpp/using-type-aliases.md](cpp/using-type-aliases.md) |
| *020901 | 竞赛程序的常见内存分区 | [cpp/competitive-program-memory-layout.md](cpp/competitive-program-memory-layout.md) |
| *020902 | static 局部变量 | [cpp/static-local-variables.md](cpp/static-local-variables.md) |
| *020903 | 对象生命周期 | [cpp/object-lifetime.md](cpp/object-lifetime.md) |
| *020904 | 初始化 | [cpp/initialization.md](cpp/initialization.md) |
| *021001 | 联合体 | [cpp/union.md](cpp/union.md) |
| *021002 | 枚举 | [cpp/enum.md](cpp/enum.md) |
| *990101 | 变量 | [cpp/variable.md](cpp/variable.md) |
| *990102 | 字面量 | [cpp/literals.md](cpp/literals.md) |
| *990103 | constexpr | [cpp/constexpr.md](cpp/constexpr.md) |
| *990104 | inline | [cpp/inline.md](cpp/inline.md) |
| *990105 | 字节寻址 | [cpp/byte-addressing.md](cpp/byte-addressing.md) |
| *990106 | 指针与引用中的 const | [cpp/const-pointers-and-references.md](cpp/const-pointers-and-references.md) |
| *990109 | volatile | [cpp/volatile.md](cpp/volatile.md) |
| *990110 | GNU PBDS | `cpp/gnu-pbds.md` |
| *990111 | bitset | [cpp/bitset.md](cpp/bitset.md) |

### 02 算法基础

| ID | 知识点 | 文件 |
| --- | --- | --- |
| *030608 | 基数排序 | [algorithm-basics/radix-sort.md](algorithm-basics/radix-sort.md) |
| *030609 | 桶排序 | [algorithm-basics/bucket-sort.md](algorithm-basics/bucket-sort.md) |
| *050204 | 堆排序 | [algorithm-basics/heap-sort.md](algorithm-basics/heap-sort.md) |
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
| *060203 | 稀疏表（ST 表） | [data-structures/sparse-table.md](data-structures/sparse-table.md) |
| *990301 | 线段树：懒标记的组合顺序 | [data-structures/segment-tree-lazy-tags.md](data-structures/segment-tree-lazy-tags.md) |
| *990302 | 可撤销并查集 | `data-structures/rollback-disjoint-set.md` |
| *990305 | 线段树二分与树上下降 | `data-structures/segment-tree-descent.md` |
| *990307 | 动态开点线段树 | `data-structures/dynamic-segment-tree.md` |
| *990308 | Segment Tree Beats | `data-structures/segment-tree-beats.md` |
| *990309 | 树状数组的区间修改变体 | `data-structures/fenwick-range-updates.md` |
| *990310 | 树状数组维护区间最值 | `data-structures/fenwick-range-extrema.md` |
| *990311 | 左偏树 | `data-structures/leftist-tree.md` |
| *990314 | B 树与 B+ 树 | `data-structures/b-tree-and-b-plus-tree.md` |
| *990316 | Wavelet Matrix | `data-structures/wavelet-matrix.md` |
| *990318 | 斜堆 | `data-structures/skew-heap.md` |
| *990319 | 配对堆 | `data-structures/pairing-heap.md` |
| *990321 | 线段树：合并 | `data-structures/segment-tree-merging.md` |
| *990325 | 替罪羊树 | `data-structures/scapegoat-tree.md` |
| *990328 | 链上分块 | `data-structures/chain-block-decomposition.md` |
| *990329 | 树上分块 | `data-structures/tree-block-decomposition.md` |
| *990330 | 01 Trie | `data-structures/binary-trie.md` |

### 04 图论

| ID | 知识点 | 文件 |
| --- | --- | --- |
| *060407 | 基环树 | [graph-theory/unicyclic-graph.md](graph-theory/unicyclic-graph.md) |
| *990408 | SPFA 与队列优化最短路 | `graph-theory/spfa.md` |
| *990410 | 差分约束 | `graph-theory/difference-constraints.md` |
| *990417 | 竞赛图 | `graph-theory/tournament-graph.md` |
| *990420 | 有向最小生成树：Chu–Liu/Edmonds | `graph-theory/directed-minimum-spanning-tree.md` |
| *990421 | 一般图最大匹配 | `graph-theory/general-graph-matching.md` |
| *990422 | 最短路：k 短路 | `graph-theory/k-shortest-paths.md` |
| *990423 | 支配树 | `graph-theory/dominator-tree.md` |
| *990424 | 无向图：全局最小割 | `graph-theory/global-minimum-cut.md` |
| *990425 | 弦图 | `graph-theory/chordal-graph.md` |
| *990427 | 树分治：动态点分治 | `graph-theory/dynamic-centroid-decomposition.md` |
| *990428 | 长链剖分 | `graph-theory/long-chain-decomposition.md` |
| *990429 | 函数图 | [graph-theory/functional-graph.md](graph-theory/functional-graph.md) |

### 05 数学

| ID | 知识点 | 文件 |
| --- | --- | --- |
| *041001 | 数系：自然数、整数、有理数与实数 | [math/number-systems-review.md](math/number-systems-review.md) |
| *041002 | 集合：基本概念与交、并、补 | [math/sets-review.md](math/sets-review.md) |
| *041003 | 代数：方程与不等式 | [math/equations-and-inequalities-review.md](math/equations-and-inequalities-review.md) |
| *041004 | 几何：平面几何基础 | [math/plane-geometry-basics.md](math/plane-geometry-basics.md) |
| *050603 | 容斥原理 | [math/inclusion-exclusion.md](math/inclusion-exclusion.md) |
| *990506 | 离散对数：Pohlig-Hellman | `math/pohlig-hellman.md` |
| *990510 | 形式幂级数：求逆 | `math/formal-power-series-inverse.md` |
| *990511 | 形式幂级数：形式导数 | `math/formal-derivative.md` |
| *990512 | 形式幂级数：形式积分 | `math/formal-integral.md` |
| *990513 | 形式幂级数：对数 | `math/formal-power-series-logarithm.md` |
| *990514 | 形式幂级数：指数 | `math/formal-power-series-exponential.md` |
| *990515 | 形式幂级数：平方根 | `math/formal-power-series-square-root.md` |
| *990516 | 形式幂级数：幂 | `math/formal-power-series-power.md` |
| *990517 | 多项式：除法与余数 | `math/polynomial-division-remainder.md` |
| *990518 | 多项式：多点求值 | `math/multipoint-evaluation.md` |
| *990521 | 质数检测：Miller–Rabin | `math/miller-rabin.md` |
| *990522 | 整数分解：Pollard–Rho | `math/pollard-rho.md` |
| *990524 | 二次剩余与勒让德符号 | `math/quadratic-residues-legendre-symbol.md` |
| *990525 | 二次剩余：Cipolla 算法 | `math/cipolla.md` |
| *990526 | 佩尔方程 | `math/pell-equation.md` |
| *990530 | 欧拉回路计数：BEST 定理 | `math/best-theorem.md` |
| *990532 | 路径计数：LGV 引理 | `math/lindstrom-gessel-viennot-lemma.md` |
| *990534 | 群论：置换 | `math/permutations.md` |
| *990538 | 组合计数：抽屉原理 | `math/pigeonhole-principle.md` |
| *990544 | 常见数列：Bell 数 | `math/bell-numbers.md` |
| *990545 | 常见数列：Bernoulli 数 | `math/bernoulli-numbers.md` |
| *990546 | 组合计数：杨表 | `math/young-tableaux.md` |
| *990550 | 筛法：分段筛 | `math/segmented-sieve.md` |

### 06 计算几何

| ID | 知识点 | 文件 |
| --- | --- | --- |
| *990603 | 几何扫描线 | `computational-geometry/geometric-sweep-line.md` |
| *990604 | 最近点对 | `computational-geometry/closest-pair-of-points.md` |
| *990606 | 凸多边形：切线与极值查询 | `computational-geometry/convex-polygon-tangents-extrema.md` |
| *990608 | 闵可夫斯基和 | `computational-geometry/minkowski-sum.md` |
| *990612 | 三维计算几何 | `computational-geometry/three-dimensional-geometry.md` |
| *990615 | Voronoi 图 | `computational-geometry/voronoi-diagram.md` |
| *990616 | 反演几何 | `computational-geometry/inversive-geometry.md` |
| *990617 | Pick 定理 | `computational-geometry/pick-theorem.md` |

### 07 动态规划

| ID | 知识点 | 文件 |
| --- | --- | --- |
| *990703 | 分段线性凸函数维护 | `dynamic-programming/slope-trick.md` |
| *990704 | 记忆化搜索 | `dynamic-programming/memoized-search.md` |
| *990705 | 分组背包 | `dynamic-programming/group-knapsack.md` |
| *990706 | 混合背包 | `dynamic-programming/mixed-knapsack.md` |
| *990707 | 多维背包 | `dynamic-programming/multidimensional-knapsack.md` |
| *990708 | 树上背包 | `dynamic-programming/tree-knapsack.md` |
| *990709 | 轮廓线 DP | `dynamic-programming/profile-dp.md` |
| *990710 | 插头 DP | `dynamic-programming/plug-dp.md` |
| *990711 | 括号序列 DP | `dynamic-programming/bracket-sequence-dp.md` |
| *990713 | 划分 DP | `dynamic-programming/partition-dp.md` |
| *990714 | 动态 DP | `dynamic-programming/dynamic-dp.md` |

### 08 字符串

| ID | 知识点 | 文件 |
| --- | --- | --- |
| *060703 | Z 函数 | [strings/z-function.md](strings/z-function.md) |
| *990806 | 后缀树 | `strings/suffix-tree.md` |
| *990807 | 最小表示法 | `strings/minimum-representation.md` |
| *990808 | Lyndon 分解 | `strings/lyndon-factorization.md` |
