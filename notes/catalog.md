# 按模块浏览

这里是教程正文的唯一知识注册表。六位文章 ID 编码权威学习入口，核心教程的推荐顺序见 [learning-path.md](learning-path.md)。同一篇文章可以同时属于多个专题；不同目录入口仍指向同一个稳定正文和阅读状态。

六位 `CCUUPP` ID 表示核心教程的章、单元和篇序。`*` 前缀表示扩展阅读，难度通常更高或使用频率更低，暂时不学也不影响后续主线。不进入学习路线的独立扩展使用 `*99MMPP`；直接配套基础篇的附属扩展共享六位编号并追加 `e1`、`e2` 等后缀，例如 `*010201e1`。完整规则见 [ARTICLE-IDENTITY.md](../docs/ARTICLE-IDENTITY.md)。`计划` 节点尚未创建文件，文件列只显示预定路径；已有正文的节点使用可点击链接。

新规范建立前形成的遗留草稿已经全部完成首次正式修订；下方空标记保留给目录校验脚本。

<!-- legacy-drafts: -->

## 下标与区间约定

本书自定义的对象默认从 1 开始编号并使用闭区间；讲解 C++ 与 STL 接口时，保留其原生的从 0 开始编号和左闭右开区间。完整的容量、哨兵和接口转换规则见 [learning-path.md](learning-path.md#下标与区间约定)。

## 01 C++

### 专题：程序入门

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 010101 | Hello World! | 定稿 | [hello-world.md](cpp/hello-world.md) |
| 010102 | A+B Problem | 待审阅 | [a-plus-b-problem.md](cpp/a-plus-b-problem.md) |

### 专题：基本类型

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 010201 | 整数类型 | 定稿 | [integer-types.md](cpp/integer-types.md) |
| *010201e3 | 整数类型的位宽与平台差异 | 定稿 | [integer-type-widths.md](cpp/integer-type-widths.md) |
| 010301 | 浮点类型 | 定稿 | [floating-point-types.md](cpp/floating-point-types.md) |
| *010301e1 | IEEE 754 浮点数表示 | 定稿 | [ieee-754.md](cpp/ieee-754.md) |
| 010801 | 字符类型 | 待审阅 | [character-type.md](cpp/character-type.md) |
| 010802 | 字符分类与转换 | 待审阅 | [character-classification-and-conversion.md](cpp/character-classification-and-conversion.md) |
| 010401 | 布尔类型 | 待审阅 | [boolean-type.md](cpp/boolean-type.md) |
| 010302 | 类型转换 | 待审阅 | [type-conversions.md](cpp/type-conversions.md) |

### 专题：进制与机器表示

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 020101 | 位、字节与存储单位 | 定稿 | [bits-bytes-and-storage-units.md](cpp/bits-bytes-and-storage-units.md) |
| 020102 | 进制表示 | 待审阅 | [base-notation.md](cpp/base-notation.md) |
| 020103 | 整数的二进制表示 | 定稿 | [integer-binary-representation.md](cpp/integer-binary-representation.md) |
| *010201e3 | 整数类型的位宽与平台差异 | 定稿 | [integer-type-widths.md](cpp/integer-type-widths.md) |
| *010301e1 | IEEE 754 浮点数表示 | 定稿 | [ieee-754.md](cpp/ieee-754.md) |
| 020104 | 进制转换 | 待审阅 | [base-conversion.md](cpp/base-conversion.md) |

### 专题：变量、常量与字面量

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *990101 | 变量 | 待审阅 | [variable.md](cpp/variable.md) |
| 010701 | 常量 | 待审阅 | [const.md](cpp/const.md) |
| *990102 | 字面量 | 待审阅 | [literals.md](cpp/literals.md) |
| *990103 | constexpr | 待审阅 | [constexpr.md](cpp/constexpr.md) |

### 专题：运算符

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 010202 | 算术运算符 | 待审阅 | [arithmetic-operators.md](cpp/arithmetic-operators.md) |
| 010501 | 比较运算符 | 待审阅 | [comparison-operators.md](cpp/comparison-operators.md) |
| 010502 | 逻辑运算符 | 待审阅 | [logical-operators.md](cpp/logical-operators.md) |
| 010603 | 自增与自减运算符 | 待审阅 | [increment-decrement-operators.md](cpp/increment-decrement-operators.md) |
| 010203 | 复合赋值运算符 | 待审阅 | [compound-assignment-operators.md](cpp/compound-assignment-operators.md) |
| 020201 | 按位运算 | 待审阅 | [bitwise-operators.md](cpp/bitwise-operators.md) |
| 020202 | 移位运算 | 待审阅 | [shift-operators.md](cpp/shift-operators.md) |
| *020608 | 运算符重载 | 待审阅 | [operator-overloading.md](cpp/operator-overloading.md) |

### 专题：数值计算

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 010202 | 算术运算符 | 待审阅 | [arithmetic-operators.md](cpp/arithmetic-operators.md) |
| 010203 | 复合赋值运算符 | 待审阅 | [compound-assignment-operators.md](cpp/compound-assignment-operators.md) |
| 010302 | 类型转换 | 待审阅 | [type-conversions.md](cpp/type-conversions.md) |
| 010303 | 数学函数 | 待审阅 | [cmath-functions.md](cpp/cmath-functions.md) |

### 专题：控制流

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 010503 | if 与 else | 待审阅 | [if-and-else.md](cpp/if-and-else.md) |
| 010504 | switch | 待审阅 | [switch.md](cpp/switch.md) |
| 010601 | while | 待审阅 | [while.md](cpp/while.md) |
| 010602 | for | 待审阅 | [for.md](cpp/for.md) |
| 010604 | do while | 待审阅 | [do-while.md](cpp/do-while.md) |
| 010603 | 自增与自减运算符 | 待审阅 | [increment-decrement-operators.md](cpp/increment-decrement-operators.md) |

### 专题：函数与递归

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 011001 | 函数的定义与调用 | 待审阅 | [function-definition-and-calls.md](cpp/function-definition-and-calls.md) |
| 011002 | 函数的返回值 | 待审阅 | [function-return-values.md](cpp/function-return-values.md) |
| 011003 | 函数的形参与实参 | 待审阅 | [function-parameters-and-arguments.md](cpp/function-parameters-and-arguments.md) |
| 011004 | 调用栈 | 待审阅 | [function-call-stack.md](cpp/function-call-stack.md) |
| 011005 | 递归 | 待审阅 | [recursion.md](cpp/recursion.md) |
| *990104 | inline | 待审阅 | [inline.md](cpp/inline.md) |
| *020607 | 函数重载 | 待审阅 | [function-overloading.md](cpp/function-overloading.md) |

### 专题：数组

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 010702 | 一维数组 | 待审阅 | [one-dimensional-arrays.md](cpp/one-dimensional-arrays.md) |
| 010703 | 多维数组 | 待审阅 | [multidimensional-arrays.md](cpp/multidimensional-arrays.md) |
| *010703e1 | 多维数组的布局与参数传递 | 待审阅 | [multidimensional-array-layout-and-parameters.md](cpp/multidimensional-array-layout-and-parameters.md) |
| *030305 | array | 待审阅 | [array.md](cpp/array.md) |

### 专题：字符串

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 010801 | 字符类型 | 待审阅 | [character-type.md](cpp/character-type.md) |
| 010802 | 字符分类与转换 | 待审阅 | [character-classification-and-conversion.md](cpp/character-classification-and-conversion.md) |
| 010901 | C 字符串 | 待审阅 | [c-strings.md](cpp/c-strings.md) |
| 010902 | string | 待审阅 | [string.md](cpp/string.md) |
| 010903 | 整行输入 | 待审阅 | [whole-line-input.md](cpp/whole-line-input.md) |

### 专题：输入输出

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 011101 | 标准输入 | 待审阅 | [standard-input.md](cpp/standard-input.md) |
| 011102 | 标准输出 | 待审阅 | [standard-output.md](cpp/standard-output.md) |
| 011103 | 输出格式控制 | 待审阅 | [output-formatting.md](cpp/output-formatting.md) |
| 011104 | 文件重定向 | 待审阅 | [file-redirection.md](cpp/file-redirection.md) |

### 专题：名称与作用域

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *020802 | 标识符 | 待审阅 | [identifiers.md](cpp/identifiers.md) |
| *020801 | 关键字 | 待审阅 | [keywords.md](cpp/keywords.md) |
| *020803 | 作用域 | 待审阅 | [scope.md](cpp/scope.md) |
| *020804 | 命名空间与 std | 待审阅 | [namespace-and-std.md](cpp/namespace-and-std.md) |
| *020805 | typedef 类型别名 | 待审阅 | [typedef-type-alias.md](cpp/typedef-type-alias.md) |
| *020806 | using 类型别名 | 待审阅 | [using-type-aliases.md](cpp/using-type-aliases.md) |

### 专题：地址、指针与引用

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *990105 | 字节寻址 | 待审阅 | [byte-addressing.md](cpp/byte-addressing.md) |
| 020301 | 指针 | 待审阅 | [pointers.md](cpp/pointers.md) |
| 020401 | 引用 | 待审阅 | [references.md](cpp/references.md) |
| *990106 | 指针与引用中的 const | 待审阅 | [const-pointers-and-references.md](cpp/const-pointers-and-references.md) |
| 020402 | 参数传递 | 待审阅 | [parameter-passing.md](cpp/parameter-passing.md) |

### 专题：复合类型

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 020501 | 结构体 | 待审阅 | [struct.md](cpp/struct.md) |
| 020502 | 结构体指针与箭头运算符 | 待审阅 | [struct-pointers-and-arrow.md](cpp/struct-pointers-and-arrow.md) |
| *020501e1 | 结构体的内存布局 | 待审阅 | [struct-memory-layout.md](cpp/struct-memory-layout.md) |
| *990107 | 联合体 | 待审阅 | [union.md](cpp/union.md) |
| *990108 | 枚举 | 待审阅 | [enum.md](cpp/enum.md) |

### 专题：内存与存储期

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *020902 | static 局部变量 | 待审阅 | [static-local-variables.md](cpp/static-local-variables.md) |
| *020901 | 竞赛程序的常见内存分区 | 待审阅 | [competitive-program-memory-layout.md](cpp/competitive-program-memory-layout.md) |
| *020903 | 对象生命周期 | 待审阅 | [object-lifetime.md](cpp/object-lifetime.md) |
| *990109 | volatile | 待审阅 | [volatile.md](cpp/volatile.md) |

### 专题：标准库基础

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030303 | pair | 待审阅 | [pair.md](cpp/pair.md) |
| 030304 | tuple | 待审阅 | [tuple.md](cpp/tuple.md) |
| *030305 | array | 待审阅 | [array.md](cpp/array.md) |
| 030301 | vector | 待审阅 | [vector.md](cpp/vector.md) |
| 030306 | sort | 待审阅 | [sort.md](cpp/sort.md) |
| 030307 | unique | 待审阅 | [unique.md](cpp/unique.md) |
| 030603 | 标准库二分查找 | 待审阅 | [stl-binary-search.md](cpp/stl-binary-search.md) |
| 030302 | fill | 待审阅 | [fill.md](cpp/fill.md) |
| 010902 | string | 待审阅 | [string.md](cpp/string.md) |

### 专题：序列容器与容器适配器

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040304 | deque | 待审阅 | [deque.md](cpp/deque.md) |
| 040202 | stack | 待审阅 | [stack.md](cpp/stack.md) |
| 040302 | queue | 待审阅 | [queue.md](cpp/queue.md) |
| 050401 | priority_queue | 待审阅 | [priority-queue.md](cpp/priority-queue.md) |

### 专题：标准库关联容器

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 050402 | set | 待审阅 | [set.md](cpp/set.md) |
| 050403 | multiset | 待审阅 | [multiset.md](cpp/multiset.md) |
| 050404 | map | 待审阅 | [map.md](cpp/map.md) |
| 050405 | multimap | 待审阅 | [multimap.md](cpp/multimap.md) |
| 050406 | unordered_set | 待审阅 | [unordered-set.md](cpp/unordered-set.md) |
| 050407 | unordered_map | 待审阅 | [unordered-map.md](cpp/unordered-map.md) |

### 专题：其他标准库工具

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 060201 | bitset | 待审阅 | [bitset.md](cpp/bitset.md) |
| *990110 | order-statistics tree（GNU PBDS） | 计划 | `cpp/gnu-pbds.md` |

### 专题：从源码到程序

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *020701 | 预处理 | 待审阅 | [preprocessing.md](cpp/preprocessing.md) |
| *020702 | 预处理：#include | 待审阅 | [include.md](cpp/include.md) |
| *020703 | 预处理：#define | 待审阅 | [define.md](cpp/define.md) |
| *020704 | 条件编译 | 待审阅 | [conditional-compilation.md](cpp/conditional-compilation.md) |
| *020705 | 编译 | 待审阅 | [compilation.md](cpp/compilation.md) |
| *020706 | 链接 | 待审阅 | [linking.md](cpp/linking.md) |

### 专题：类

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *020601 | 类 | 待审阅 | [class.md](cpp/class.md) |
| *020602 | 类的成员 | 待审阅 | [class-members.md](cpp/class-members.md) |
| *020603 | 封装 | 待审阅 | [encapsulation.md](cpp/encapsulation.md) |
| *020604 | 访问权限 | 待审阅 | [access-control.md](cpp/access-control.md) |
| *020605 | 构造函数 | 待审阅 | [constructors.md](cpp/constructors.md) |
| *020606 | 析构函数 | 待审阅 | [destructors.md](cpp/destructors.md) |
| *020607 | 函数重载 | 待审阅 | [function-overloading.md](cpp/function-overloading.md) |
| *020609 | 继承 | 待审阅 | [inheritance.md](cpp/inheritance.md) |
| *020610 | 多态 | 待审阅 | [polymorphism.md](cpp/polymorphism.md) |
| *020608 | 运算符重载 | 待审阅 | [operator-overloading.md](cpp/operator-overloading.md) |

## 02 算法基础

### 专题：复杂度

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030101 | 复杂度 | 待审阅 | [complexity.md](algorithm-basics/complexity.md) |
| *030101e1 | 渐近记号 | 待审阅 | [asymptotic-notation.md](algorithm-basics/asymptotic-notation.md) |
| 030102 | 从代码分析复杂度 | 待审阅 | [complexity-analysis.md](algorithm-basics/complexity-analysis.md) |
| 060101 | 均摊复杂度 | 待审阅 | [amortized-complexity.md](algorithm-basics/amortized-complexity.md) |
| 060102 | 均摊复杂度：势能法 | 待审阅 | [potential-method.md](algorithm-basics/potential-method.md) |

### 专题：算法设计思想

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030201 | 枚举 | 待审阅 | [enumeration.md](algorithm-basics/enumeration.md) |
| 030202 | 模拟 | 待审阅 | [simulation.md](algorithm-basics/simulation.md) |
| 030203 | 递归与问题分解 | 待审阅 | [recursive-problem-solving.md](algorithm-basics/recursive-problem-solving.md) |
| 030204 | 递推 | 待审阅 | [recurrence.md](algorithm-basics/recurrence.md) |
| 030205 | 分治 | 待审阅 | [divide-and-conquer.md](algorithm-basics/divide-and-conquer.md) |
| 030206 | 贪心选择与正确性证明 | 待审阅 | [greedy-selection-and-proof.md](algorithm-basics/greedy-selection-and-proof.md) |

### 专题：枚举

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030201 | 枚举 | 待审阅 | [enumeration.md](algorithm-basics/enumeration.md) |
| 040703 | 子集与位掩码枚举 | 待审阅 | [subset-bitmask-enumeration.md](algorithm-basics/subset-bitmask-enumeration.md) |
| 070101 | 枚举：Meet-in-the-Middle | 计划 | `algorithm-basics/meet-in-the-middle.md` |
| 040704 | 排列枚举 | 待审阅 | [permutation-enumeration.md](algorithm-basics/permutation-enumeration.md) |
| 040705 | 组合枚举 | 待审阅 | [combination-enumeration.md](algorithm-basics/combination-enumeration.md) |
| 040702 | 状态空间与隐式图 | 待审阅 | [state-space-and-implicit-graphs.md](algorithm-basics/state-space-and-implicit-graphs.md) |

### 专题：前缀和

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030401 | 前缀和 | 定稿 | [prefix-sums.md](algorithm-basics/prefix-sums.md) |
| 030402 | 差分 | 待审阅 | [difference-array.md](algorithm-basics/difference-array.md) |

### 专题：排序

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030501 | 冒泡排序 | 待审阅 | [bubble-sort.md](algorithm-basics/bubble-sort.md) |
| 030502 | 选择排序 | 待审阅 | [selection-sort.md](algorithm-basics/selection-sort.md) |
| 030503 | 插入排序 | 待审阅 | [insertion-sort.md](algorithm-basics/insertion-sort.md) |
| 030504 | 计数排序 | 待审阅 | [counting-sort.md](algorithm-basics/counting-sort.md) |
| 030507 | 排序方法比较 | 待审阅 | [sorting-comparison.md](algorithm-basics/sorting-comparison.md) |
| 030505 | 快速排序 | 待审阅 | [quicksort.md](algorithm-basics/quicksort.md) |
| 030506 | 归并排序 | 待审阅 | [merge-sort.md](algorithm-basics/merge-sort.md) |
| *030506e1 | 用归并排序统计逆序对 | 计划 | `algorithm-basics/merge-sort-inversion-count.md` |

### 专题：分治

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030205 | 分治 | 待审阅 | [divide-and-conquer.md](algorithm-basics/divide-and-conquer.md) |
| 030505 | 快速排序 | 待审阅 | [quicksort.md](algorithm-basics/quicksort.md) |
| 030506 | 归并排序 | 待审阅 | [merge-sort.md](algorithm-basics/merge-sort.md) |
| *030506e1 | 用归并排序统计逆序对 | 计划 | `algorithm-basics/merge-sort-inversion-count.md` |
| *990201 | CDQ 分治 | 计划 | `algorithm-basics/cdq-divide-and-conquer.md` |

### 专题：其他排序

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *050202 | 堆排序 | 待审阅 | [heap-sort.md](algorithm-basics/heap-sort.md) |
| *030508 | 基数排序 | 计划 | `algorithm-basics/radix-sort.md` |
| *030509 | 桶排序 | 计划 | `algorithm-basics/bucket-sort.md` |

### 专题：二分与数值搜索

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030601 | 二分查找 | 待审阅 | [binary-search.md](algorithm-basics/binary-search.md) |
| 030602 | 二分边界 | 待审阅 | [binary-search-boundaries.md](algorithm-basics/binary-search-boundaries.md) |
| 030604 | 二分答案 | 待审阅 | [binary-search-on-answer.md](algorithm-basics/binary-search-on-answer.md) |
| 030605 | 浮点数二分 | 待审阅 | [floating-point-binary-search.md](algorithm-basics/floating-point-binary-search.md) |
| *990202 | 三分搜索 | 计划 | `algorithm-basics/ternary-search.md` |
| *990203 | 整体二分与并行二分 | 计划 | `algorithm-basics/parallel-binary-search.md` |

### 专题：离散化与离线处理

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030701 | 离散化 | 待审阅 | [coordinate-compression.md](algorithm-basics/coordinate-compression.md) |
| 070201 | 离线算法 | 计划 | `algorithm-basics/offline-algorithms.md` |
| 070202 | 扫描线与事件排序 | 计划 | `algorithm-basics/sweep-line.md` |
| *990201 | CDQ 分治 | 计划 | `algorithm-basics/cdq-divide-and-conquer.md` |

### 专题：线性表

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040101 | 数组 | 待审阅 | [array.md](algorithm-basics/array.md) |
| 040102 | 链表 | 待审阅 | [linked-list.md](algorithm-basics/linked-list.md) |

### 专题：栈

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040201 | 栈 | 待审阅 | [stack.md](algorithm-basics/stack.md) |
| 060501 | 单调栈 | 待审阅 | [monotonic-stack.md](algorithm-basics/monotonic-stack.md) |
| 040203 | 出栈序列判定 | 待审阅 | [stack-pop-sequence-validation.md](algorithm-basics/stack-pop-sequence-validation.md) |
| 040204 | 表达式求值 | 待审阅 | [expression-evaluation.md](algorithm-basics/expression-evaluation.md) |

### 专题：队列

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040301 | 队列 | 待审阅 | [queue.md](algorithm-basics/queue.md) |
| 040303 | 双端队列 | 待审阅 | [deque.md](algorithm-basics/deque.md) |
| 060502 | 单调队列 | 待审阅 | [monotonic-queue.md](algorithm-basics/monotonic-queue.md) |

### 专题：二叉堆与哈希表

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 050201 | 二叉堆 | 待审阅 | [binary-heap.md](algorithm-basics/binary-heap.md) |
| 050301 | 哈希表 | 待审阅 | [hash-table.md](algorithm-basics/hash-table.md) |

### 专题：双指针

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030801 | 双指针 | 待审阅 | [two-pointers.md](algorithm-basics/two-pointers.md) |
| 030802 | 滑动窗口 | 待审阅 | [sliding-window.md](algorithm-basics/sliding-window.md) |

### 专题：贪心策略

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030206 | 贪心选择与正确性证明 | 待审阅 | [greedy-selection-and-proof.md](algorithm-basics/greedy-selection-and-proof.md) |
| 040401 | 邻项交换证明 | 待审阅 | [greedy-adjacent-exchange.md](algorithm-basics/greedy-adjacent-exchange.md) |
| 040402 | 反悔贪心 | 待审阅 | [greedy-regret.md](algorithm-basics/greedy-regret.md) |

### 专题：倍增

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 060601 | 倍增：基础 | 待审阅 | [doubling.md](algorithm-basics/doubling.md) |

### 专题：搜索与状态空间

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040702 | 状态空间与隐式图 | 待审阅 | [state-space-and-implicit-graphs.md](algorithm-basics/state-space-and-implicit-graphs.md) |
| *990204 | 搜索：迭代加深 | 计划 | `algorithm-basics/iterative-deepening.md` |
| *990205 | 搜索：A* | 计划 | `algorithm-basics/a-star.md` |
| *990206 | 精确覆盖：Dancing Links（DLX） | 计划 | `algorithm-basics/dancing-links.md` |

### 专题：随机化

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *990207 | 随机化算法 | 计划 | `algorithm-basics/randomized-algorithms.md` |
| *990208 | 随机化：爬山法 | 计划 | `algorithm-basics/hill-climbing.md` |
| *990209 | 随机化：模拟退火 | 计划 | `algorithm-basics/simulated-annealing.md` |

### 专题：竞赛工程

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *990210 | 工程：对拍 | 计划 | `algorithm-basics/stress-testing.md` |

## 03 数据结构

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 060301 | 线段树：基础 | 待审阅 | [segment-tree.md](data-structures/segment-tree.md) |
| *990301 | 线段树：懒标记的组合顺序 | 待审阅 | [segment-tree-lazy-tags.md](data-structures/segment-tree-lazy-tags.md) |
| 060302 | 树状数组：基础 | 待审阅 | [fenwick-tree.md](data-structures/fenwick-tree.md) |
| 060401 | 并查集：基础 | 待审阅 | [disjoint-set-union.md](data-structures/disjoint-set-union.md) |
| 060303 | 稀疏表（ST 表） | 待审阅 | [sparse-table.md](data-structures/sparse-table.md) |
| 070301 | 并查集：扩展域 | 计划 | `data-structures/extended-domain-disjoint-set.md` |
| 070302 | 并查集：带权 | 计划 | `data-structures/weighted-disjoint-set.md` |
| 050101 | 二叉树的结构与存储 | 待审阅 | [binary-tree-structure-and-storage.md](data-structures/binary-tree-structure-and-storage.md) |
| *990302 | 可撤销并查集 | 计划 | `data-structures/rollback-disjoint-set.md` |
| *990303 | 分块 | 计划 | `data-structures/square-root-decomposition.md` |
| *990304 | 莫队算法 | 计划 | `data-structures/mo-algorithm.md` |
| *990305 | 线段树二分与树上下降 | 计划 | `data-structures/segment-tree-descent.md` |
| *990306 | 可持久化线段树 | 计划 | `data-structures/persistent-segment-tree.md` |
| *990307 | 动态开点线段树 | 计划 | `data-structures/dynamic-segment-tree.md` |
| *990308 | Segment Tree Beats | 计划 | `data-structures/segment-tree-beats.md` |
| *990309 | 树状数组的区间修改变体 | 计划 | `data-structures/fenwick-range-updates.md` |
| *990310 | 树状数组维护区间最值 | 计划 | `data-structures/fenwick-range-extrema.md` |
| *990311 | 左偏树 | 计划 | `data-structures/leftist-tree.md` |
| *990312 | Treap 与随机平衡树 | 计划 | `data-structures/treap.md` |
| *990313 | Splay | 计划 | `data-structures/splay.md` |
| *990314 | B 树与 B+ 树 | 计划 | `data-structures/b-tree-and-b-plus-tree.md` |
| *990315 | 笛卡尔树 | 计划 | `data-structures/cartesian-tree.md` |
| *990316 | Wavelet Matrix | 计划 | `data-structures/wavelet-matrix.md` |
| *990317 | 启发式合并（small-to-large） | 计划 | `data-structures/small-to-large-merging.md` |
| 050102 | 二叉树的遍历：前序、中序与后序 | 待审阅 | [binary-tree-traversals.md](data-structures/binary-tree-traversals.md) |
| *990318 | 斜堆 | 计划 | `data-structures/skew-heap.md` |
| *990319 | 配对堆 | 计划 | `data-structures/pairing-heap.md` |
| *990320 | 可持久化并查集 | 计划 | `data-structures/persistent-disjoint-set-union.md` |
| *990321 | 线段树：合并 | 计划 | `data-structures/segment-tree-merging.md` |
| *990322 | 树套树：线段树套线段树 | 计划 | `data-structures/segment-tree-of-segment-trees.md` |
| *990323 | 树套树：线段树套平衡树 | 计划 | `data-structures/segment-tree-of-balanced-trees.md` |
| *990324 | 可持久化平衡树 | 计划 | `data-structures/persistent-balanced-tree.md` |
| *990325 | 替罪羊树 | 计划 | `data-structures/scapegoat-tree.md` |
| *990326 | 动态树：Link-Cut Tree | 计划 | `data-structures/link-cut-tree.md` |
| *990327 | KD 树 | 计划 | `data-structures/kd-tree.md` |
| *990328 | 链上分块 | 计划 | `data-structures/chain-block-decomposition.md` |
| *990329 | 树上分块 | 计划 | `data-structures/tree-block-decomposition.md` |

## 04 图论

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040601 | 点与边 | 待审阅 | [vertices-and-edges.md](graph-theory/vertices-and-edges.md) |
| 040604 | 图的存储：基础概念 | 待审阅 | [graph-representation.md](graph-theory/graph-representation.md) |
| 061704 | 树上查询：倍增 LCA | 定稿 | [lca-binary-lifting.md](graph-theory/lca-binary-lifting.md) |
| 040802 | 连通块 | 待审阅 | [connected-components.md](graph-theory/connected-components.md) |
| 061401 | 有向无环图：拓扑排序 | 待审阅 | [topological-sort.md](graph-theory/topological-sort.md) |
| 050601 | 多源 BFS | 待审阅 | [multi-source-bfs.md](graph-theory/multi-source-bfs.md) |
| 061501 | 最短路：Dijkstra | 计划 | `graph-theory/dijkstra.md` |
| 061502 | 最短路：Bellman–Ford 与负环 | 计划 | `graph-theory/bellman-ford.md` |
| 061503 | 最短路：Floyd–Warshall | 计划 | `graph-theory/floyd-warshall.md` |
| 061601 | 最小生成树：Kruskal | 计划 | `graph-theory/kruskal.md` |
| 050602 | 二分图：判定 | 待审阅 | [bipartite-graph.md](graph-theory/bipartite-graph.md) |
| *990401 | 二分图：最大匹配 | 计划 | `graph-theory/bipartite-matching.md` |
| *990401e1 | 二分图最大匹配：Hopcroft–Karp | 计划 | `graph-theory/hopcroft-karp.md` |
| *990401e2 | 二分图最大权匹配：Kuhn–Munkres（KM） | 计划 | `graph-theory/kuhn-munkres.md` |
| 070401 | 有向图：强连通分量 | 计划 | `graph-theory/strongly-connected-components.md` |
| 070402 | 无向图：割点与桥 | 计划 | `graph-theory/articulation-points-bridges.md` |
| *990402 | 无向图：双连通分量与圆方树 | 计划 | `graph-theory/biconnected-components-block-cut-tree.md` |
| 061901 | 欧拉问题：路径、回路与图 | 定稿 | [eulerian-paths-and-circuits.md](graph-theory/eulerian-paths-and-circuits.md) |
| 061701 | 树：直径与中心 | 待审阅 | [tree-diameter-center.md](graph-theory/tree-diameter-center.md) |
| 061703 | 树的遍历：DFS 序与子树区间 | 计划 | `graph-theory/tree-euler-tour.md` |
| 070501 | 树上数据结构：树链剖分 | 计划 | `graph-theory/heavy-light-decomposition.md` |
| *990403 | 2-SAT | 计划 | `graph-theory/two-sat.md` |
| *990404 | 网络流：Dinic | 计划 | `graph-theory/dinic-max-flow.md` |
| *990405 | 最小费用最大流 | 计划 | `graph-theory/min-cost-max-flow.md` |
| *990406 | 虚树 | 计划 | `graph-theory/virtual-tree.md` |
| *990407 | 点分治 | 计划 | `graph-theory/centroid-decomposition.md` |
| *990408 | SPFA 与队列优化最短路 | 计划 | `graph-theory/spfa.md` |
| 061801 | 图：基环树 | 计划 | `graph-theory/unicyclic-graph.md` |
| *990409 | DSU on Tree | 计划 | `graph-theory/dsu-on-tree.md` |
| *990410 | 差分约束 | 计划 | `graph-theory/difference-constraints.md` |
| 070601 | 最短路：分层图与状态图 | 计划 | `graph-theory/layered-state-shortest-path.md` |
| *990411 | 树哈希 | 计划 | `graph-theory/tree-hashing.md` |
| 040602 | 路径与环 | 待审阅 | [paths-and-cycles.md](graph-theory/paths-and-cycles.md) |
| 040603 | 度数 | 待审阅 | [vertex-degrees.md](graph-theory/vertex-degrees.md) |
| 040901 | 无根树 | 待审阅 | [unrooted-trees.md](graph-theory/unrooted-trees.md) |
| 040903 | 树的遍历：深度优先搜索（DFS） | 待审阅 | [tree-depth-first-search.md](graph-theory/tree-depth-first-search.md) |
| 040904 | 树的遍历：广度优先搜索（BFS） | 待审阅 | [tree-breadth-first-search.md](graph-theory/tree-breadth-first-search.md) |
| 040701 | 图的遍历：深度优先搜索（DFS） | 待审阅 | [graph-depth-first-search.md](graph-theory/graph-depth-first-search.md) |
| 040801 | 图的遍历：广度优先搜索（BFS） | 待审阅 | [graph-breadth-first-search.md](graph-theory/graph-breadth-first-search.md) |
| 061902 | 哈密顿问题：路径、回路与图 | 定稿 | [hamiltonian-paths-and-circuits.md](graph-theory/hamiltonian-paths-and-circuits.md) |
| *061902e1 | 哈密顿问题：小规模回溯 | 定稿 | [hamiltonian-backtracking.md](graph-theory/hamiltonian-backtracking.md) |
| 040605 | 图的存储：邻接表（vector 实现） | 待审阅 | [vector-adjacency-list.md](graph-theory/vector-adjacency-list.md) |
| 061302 | 图的存储：邻接表（链式前向星实现） | 定稿 | [chained-forward-star.md](graph-theory/chained-forward-star.md) |
| 061301 | 图的存储：边集 | 定稿 | [edge-list.md](graph-theory/edge-list.md) |
| 040902 | 有根树 | 待审阅 | [rooted-trees.md](graph-theory/rooted-trees.md) |
| 040706 | DFS、回溯与剪枝 | 待审阅 | [dfs-backtracking-pruning.md](graph-theory/dfs-backtracking-pruning.md) |
| 061504 | 最短路：0-1 BFS | 待审阅 | [zero-one-bfs.md](graph-theory/zero-one-bfs.md) |
| 061702 | 树：重心 | 待审阅 | [tree-centroid.md](graph-theory/tree-centroid.md) |
| 070502 | 树上技巧：树上差分 | 计划 | `graph-theory/tree-difference.md` |
| 061802 | 图：函数图 | 计划 | `graph-theory/functional-graph.md` |
| 061602 | 最小生成树：Prim | 计划 | `graph-theory/prim.md` |
| *990412 | 最短路：最短路树 | 计划 | `graph-theory/shortest-path-tree.md` |
| *990413 | 最小生成树：Borůvka | 计划 | `graph-theory/boruvka.md` |
| *990414 | 网络流：SAP | 计划 | `graph-theory/sap-max-flow.md` |
| *990415 | 网络流：可行流 | 计划 | `graph-theory/feasible-flow.md` |
| *990416 | 网络流：上下界 | 计划 | `graph-theory/bounded-flow.md` |
| *990417 | 竞赛图 | 计划 | `graph-theory/tournament-graph.md` |
| *990418 | Steiner 树 | 计划 | `graph-theory/steiner-tree.md` |
| *990419 | 仙人掌 | 计划 | `graph-theory/cactus-graph.md` |
| *990420 | 有向最小生成树：Chu–Liu/Edmonds | 计划 | `graph-theory/directed-minimum-spanning-tree.md` |
| *990421 | 一般图最大匹配 | 计划 | `graph-theory/general-graph-matching.md` |
| *990422 | 最短路：$k$ 短路 | 计划 | `graph-theory/k-shortest-paths.md` |
| *990423 | 支配树 | 计划 | `graph-theory/dominator-tree.md` |
| *990424 | 无向图：全局最小割 | 计划 | `graph-theory/global-minimum-cut.md` |
| *990425 | 弦图 | 计划 | `graph-theory/chordal-graph.md` |
| *990426 | 树分治：边分治 | 计划 | `graph-theory/edge-decomposition.md` |
| *990427 | 树分治：动态点分治 | 计划 | `graph-theory/dynamic-centroid-decomposition.md` |
| *990428 | 长链剖分 | 计划 | `graph-theory/long-chain-decomposition.md` |

## 05 数学

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040501 | 整除 | 待审阅 | [divisibility.md](math/divisibility.md) |
| 040502 | 质数 | 待审阅 | [prime-numbers.md](math/prime-numbers.md) |
| 040503 | 试除法：质数检测 | 待审阅 | [trial-division-primality-test.md](math/trial-division-primality-test.md) |
| 060702 | 数论：扩展欧几里得算法 | 待审阅 | [extended-euclidean-algorithm.md](math/extended-euclidean-algorithm.md) |
| 060701 | 模运算 | 待审阅 | [modular-arithmetic.md](math/modular-arithmetic.md) |
| *060701e1 | 模运算：modint | 待审阅 | [mod-int.md](math/mod-int.md) |
| 040506 | 埃拉托斯特尼筛法 | 待审阅 | [sieve-of-eratosthenes.md](math/sieve-of-eratosthenes.md) |
| 060706 | 模逆元 | 待审阅 | [modular-inverse.md](math/modular-inverse.md) |
| *060706e1 | 模逆元：线性预处理 | 计划 | `math/linear-modular-inverses.md` |
| *060706e2 | 模逆元：批量求逆 | 计划 | `math/batch-modular-inverses.md` |
| 060904 | 组合数：定义与递推 | 待审阅 | [binomial-coefficients.md](math/binomial-coefficients.md) |
| *060904e1 | 组合数：Lucas 定理 | 计划 | `math/lucas-theorem.md` |
| *060904e2 | 组合数：扩展 Lucas 定理 | 计划 | `math/extended-lucas-theorem.md` |
| 061001 | 欧拉函数 | 待审阅 | [euler-totient.md](math/euler-totient.md) |
| *061001e1 | 扩展欧拉定理 | 计划 | `math/extended-euler-theorem.md` |
| *061001e2 | 欧拉函数：筛法预处理 | 计划 | `math/euler-totient-sieve.md` |
| 061101 | 矩阵：表示 | 待审阅 | [matrix-representation.md](math/matrix-representation.md) |
| 070701 | 数论：中国剩余定理（CRT） | 待审阅 | [chinese-remainder-theorem.md](math/chinese-remainder-theorem.md) |
| 061105 | 矩阵快速幂 | 待审阅 | [matrix-exponentiation.md](math/matrix-exponentiation.md) |
| 061201 | 概率与期望基础 | 计划 | `math/probability-expectation.md` |
| *990501 | Nim、SG 函数与基础博弈论 | 计划 | `math/nim-sg-game-theory.md` |
| *990502 | XOR 线性基 | 计划 | `math/xor-linear-basis.md` |
| *990503 | 高斯消元 | 计划 | `math/gaussian-elimination.md` |
| 070801 | 容斥原理 | 计划 | `math/inclusion-exclusion.md` |
| *990504 | 多项式：NTT | 计划 | `math/ntt.md` |
| 061003 | 莫比乌斯函数 | 待审阅 | [mobius-function.md](math/mobius-function.md) |
| *990505 | BSGS 与离散对数 | 计划 | `math/discrete-logarithm.md` |
| *990505e1 | 离散对数：Pohlig–Hellman | 计划 | `math/pohlig-hellman.md` |
| *990506 | 多项式：表示、加法与减法 | 计划 | `math/polynomial-representation-addition-subtraction.md` |
| *990507 | 多项式：卷积与朴素乘法 | 计划 | `math/convolution-naive-multiplication.md` |
| *990508 | 复数与单位根 | 计划 | `math/complex-numbers-roots-of-unity.md` |
| *990509 | 多项式：FFT | 计划 | `math/fft.md` |
| *990510 | 形式幂级数：求逆 | 计划 | `math/formal-power-series-inverse.md` |
| *990511 | 形式幂级数：形式导数 | 计划 | `math/formal-derivative.md` |
| *990512 | 形式幂级数：形式积分 | 计划 | `math/formal-integral.md` |
| *990513 | 形式幂级数：对数 | 计划 | `math/formal-power-series-logarithm.md` |
| *990514 | 形式幂级数：指数 | 计划 | `math/formal-power-series-exponential.md` |
| *990515 | 形式幂级数：平方根 | 计划 | `math/formal-power-series-square-root.md` |
| *990516 | 形式幂级数：幂 | 计划 | `math/formal-power-series-power.md` |
| *990517 | 多项式：除法与余数 | 计划 | `math/polynomial-division-remainder.md` |
| *990518 | 多项式：多点求值 | 计划 | `math/multipoint-evaluation.md` |
| *990519 | 多项式：插值 | 计划 | `math/polynomial-interpolation.md` |
| *990520 | 莫比乌斯反演 | 计划 | `math/mobius-inversion.md` |
| 040504 | 算术基本定理 | 待审阅 | [fundamental-theorem-of-arithmetic.md](math/fundamental-theorem-of-arithmetic.md) |
| 040507 | 最大公约数与最小公倍数 | 待审阅 | [greatest-common-divisor-and-least-common-multiple.md](math/greatest-common-divisor-and-least-common-multiple.md) |
| 040508 | 欧几里得算法 | 待审阅 | [euclidean-algorithm.md](math/euclidean-algorithm.md) |
| 070702 | 数论：扩展中国剩余定理（exCRT） | 待审阅 | [extended-chinese-remainder-theorem.md](math/extended-chinese-remainder-theorem.md) |
| 040505 | 质因数分解 | 待审阅 | [prime-factorization.md](math/prime-factorization.md) |
| 060802 | 正因数个数 | 待审阅 | [divisor-count.md](math/divisor-count.md) |
| 060803 | 正因数和 | 待审阅 | [divisor-sum.md](math/divisor-sum.md) |
| 060703 | 线性不定方程 | 待审阅 | [linear-diophantine-equations.md](math/linear-diophantine-equations.md) |
| 060704 | 线性同余方程 | 待审阅 | [linear-congruences.md](math/linear-congruences.md) |
| 050501 | 高精度整数：加法、减法与乘法 | 待审阅 | [big-integer-addition-subtraction-multiplication.md](math/big-integer-addition-subtraction-multiplication.md) |
| *050501e1 | 高精度整数：除法与余数 | 计划 | `math/big-integer-division-remainder.md` |
| *050501e2 | 高精度整数：负数 | 计划 | `math/big-integer-negative-numbers.md` |
| *990521 | 素性测试：Miller–Rabin | 计划 | `math/miller-rabin.md` |
| *990522 | 整数分解：Pollard–Rho | 计划 | `math/pollard-rho.md` |
| *990523 | 原根 | 计划 | `math/primitive-roots.md` |
| *990524 | 二次剩余与勒让德符号 | 计划 | `math/quadratic-residues-legendre-symbol.md` |
| *990525 | 二次剩余：Cipolla 算法 | 计划 | `math/cipolla.md` |
| *990526 | 佩尔方程 | 计划 | `math/pell-equation.md` |
| *990527 | 线性代数：行列式 | 计划 | `math/determinant.md` |
| *990528 | 线性递推：Berlekamp–Massey | 计划 | `math/berlekamp-massey.md` |
| *990529 | 图论计数：矩阵树定理 | 计划 | `math/matrix-tree-theorem.md` |
| *990530 | 欧拉回路计数：BEST 定理 | 计划 | `math/best-theorem.md` |
| *990531 | 树的编码：Prüfer 序列 | 计划 | `math/prufer-sequence.md` |
| *990532 | 路径计数：LGV 引理 | 计划 | `math/lindstrom-gessel-viennot-lemma.md` |
| *990533 | 生成函数：基础 | 计划 | `math/generating-functions.md` |
| *990534 | 群论：置换 | 计划 | `math/permutations.md` |
| *990535 | 群作用计数：Burnside 引理 | 计划 | `math/burnside-lemma.md` |
| *990536 | 群作用计数：Pólya 定理 | 计划 | `math/polya-enumeration.md` |
| *990537 | 线性规划 | 计划 | `math/linear-programming.md` |
| *990538 | 组合计数：抽屉原理 | 计划 | `math/pigeonhole-principle.md` |
| *990539 | 组合计数：最值容斥 | 计划 | `math/min-max-inclusion-exclusion.md` |
| *990540 | 组合计数：二项式反演 | 计划 | `math/binomial-inversion.md` |
| *990541 | 常见数列：错排数 | 计划 | `math/derangement-numbers.md` |
| *990542 | 常见数列：Catalan 数 | 计划 | `math/catalan-numbers.md` |
| *990543 | 常见数列：Stirling 数 | 计划 | `math/stirling-numbers.md` |
| *990544 | 常见数列：Bell 数 | 计划 | `math/bell-numbers.md` |
| *990545 | 常见数列：Bernoulli 数 | 计划 | `math/bernoulli-numbers.md` |
| *990546 | 组合计数：杨表 | 计划 | `math/young-tableaux.md` |
| *990547 | 数值积分：Simpson 公式 | 计划 | `math/simpson-rule.md` |
| *990548 | 数值积分：自适应 Simpson | 计划 | `math/adaptive-simpson.md` |
| *990549 | 集合幂级数：FWT/FMT | 计划 | `math/fast-subset-transforms.md` |
| 040509 | 快速幂 | 待审阅 | [fast-exponentiation.md](math/fast-exponentiation.md) |
| 060705 | 费马小定理 | 待审阅 | [fermat-little-theorem.md](math/fermat-little-theorem.md) |
| 060801 | 筛法：欧拉筛（线性筛） | 待审阅 | [euler-sieve.md](math/euler-sieve.md) |
| *060801e1 | 杜教筛 | 计划 | `math/du-jiao-sieve.md` |
| *060801e2 | Min_25 筛 | 计划 | `math/min-25-sieve.md` |
| *990550 | 筛法：分段筛 | 计划 | `math/segmented-sieve.md` |
| 060901 | 计数原理：加法原理 | 待审阅 | [addition-principle.md](math/addition-principle.md) |
| 060902 | 计数原理：乘法原理 | 待审阅 | [multiplication-principle.md](math/multiplication-principle.md) |
| 060903 | 排列数 | 待审阅 | [permutations-count.md](math/permutations-count.md) |
| 060905 | 组合数：阶乘与逆元预处理 | 待审阅 | [binomial-coefficients-factorials.md](math/binomial-coefficients-factorials.md) |
| 061002 | 欧拉定理 | 待审阅 | [euler-theorem.md](math/euler-theorem.md) |
| 061102 | 矩阵：加法与减法 | 待审阅 | [matrix-addition-subtraction.md](math/matrix-addition-subtraction.md) |
| 061103 | 矩阵：乘法 | 待审阅 | [matrix-multiplication.md](math/matrix-multiplication.md) |
| 061104 | 线性变换：矩阵表示 | 待审阅 | [linear-transformations-as-matrices.md](math/linear-transformations-as-matrices.md) |
| *061104e1 | 线性变换：齐次坐标与仿射变换 | 待审阅 | [homogeneous-coordinates-affine-transformations.md](math/homogeneous-coordinates-affine-transformations.md) |

## 06 计算几何

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 062201 | 坐标、点、向量与精度 | 计划 | `computational-geometry/points-vectors-precision.md` |
| 062202 | 点积、叉积与方向判断 | 计划 | `computational-geometry/dot-cross-orientation.md` |
| 070901 | 直线、线段与相交判定 | 计划 | `computational-geometry/lines-segments-intersections.md` |
| 070902 | 多边形面积与点的位置 | 计划 | `computational-geometry/polygon-area-point-location.md` |
| 070903 | 凸包 | 计划 | `computational-geometry/convex-hull.md` |
| *990601 | 圆与圆的关系 | 计划 | `computational-geometry/circles.md` |
| *990602 | 旋转卡壳 | 计划 | `computational-geometry/rotating-calipers.md` |
| *990603 | 几何扫描线 | 计划 | `computational-geometry/geometric-sweep-line.md` |
| *990604 | 最近点对 | 计划 | `computational-geometry/closest-pair-of-points.md` |
| *990605 | 凸多边形：点包含 | 计划 | `computational-geometry/point-in-convex-polygon.md` |
| *990606 | 凸多边形：切线与极值查询 | 计划 | `computational-geometry/convex-polygon-tangents-extrema.md` |
| *990607 | 半平面交 | 计划 | `computational-geometry/half-plane-intersection.md` |
| *990608 | 闵可夫斯基和 | 计划 | `computational-geometry/minkowski-sum.md` |
| *990609 | 极角排序 | 计划 | `computational-geometry/polar-angle-sort.md` |
| *990610 | 圆：切线 | 计划 | `computational-geometry/circle-tangents.md` |
| *990611 | 圆：面积交与面积并 | 计划 | `computational-geometry/circle-area-intersection-union.md` |
| *990612 | 三维计算几何 | 计划 | `computational-geometry/three-dimensional-geometry.md` |
| *990613 | 平面点定位 | 计划 | `computational-geometry/point-location.md` |
| *990614 | 最小圆覆盖 | 计划 | `computational-geometry/minimum-enclosing-circle.md` |
| *990615 | Voronoi 图 | 计划 | `computational-geometry/voronoi-diagram.md` |
| *990616 | 反演几何 | 计划 | `computational-geometry/inversive-geometry.md` |
| *990617 | Pick 定理 | 计划 | `computational-geometry/pick-theorem.md` |

## 07 动态规划

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 041001 | 动态规划的状态与转移 | 待审阅 | [dp-state-transition.md](dynamic-programming/dp-state-transition.md) |
| 041003 | 最大子段和 | 待审阅 | [maximum-subarray-sum.md](dynamic-programming/maximum-subarray-sum.md) |
| 041101 | 0-1 背包 | 待审阅 | [zero-one-knapsack.md](dynamic-programming/zero-one-knapsack.md) |
| 041004 | 最长上升子序列 | 待审阅 | [longest-increasing-subsequence.md](dynamic-programming/longest-increasing-subsequence.md) |
| *041004e1 | 最长上升子序列：$O(n\log n)$ 优化 | 计划 | `dynamic-programming/lis-n-log-n.md` |
| 062002 | 动态规划：区间 DP | 计划 | `dynamic-programming/interval-dp.md` |
| 062003 | 动态规划：DAG 上的 DP | 计划 | `dynamic-programming/dag-dp.md` |
| 062004 | 动态规划：树形 DP | 计划 | `dynamic-programming/tree-dp.md` |
| 062005 | 动态规划：状压 DP | 计划 | `dynamic-programming/bitmask-dp.md` |
| 071001 | 动态规划：数位 DP | 计划 | `dynamic-programming/digit-dp.md` |
| 071002 | 动态规划：概率与期望 | 计划 | `dynamic-programming/probability-expectation-dp.md` |
| 071003 | 动态规划优化：单调队列 | 计划 | `dynamic-programming/monotone-queue-optimization.md` |
| *990701 | 动态规划优化：斜率 | 计划 | `dynamic-programming/convex-hull-trick.md` |
| *990702 | 动态规划优化：分治 | 计划 | `dynamic-programming/divide-conquer-optimization.md` |
| *990703 | 动态规划：Slope Trick | 计划 | `dynamic-programming/slope-trick.md` |
| 041102 | 完全背包 | 待审阅 | [complete-knapsack.md](dynamic-programming/complete-knapsack.md) |
| 041103 | 多重背包 | 待审阅 | [multiple-knapsack.md](dynamic-programming/multiple-knapsack.md) |
| 062001 | 状态机动态规划 | 待审阅 | [state-machine-dp.md](dynamic-programming/state-machine-dp.md) |
| *990704 | 记忆化搜索 | 计划 | `dynamic-programming/memoized-search.md` |
| *990705 | 背包：分组背包 | 计划 | `dynamic-programming/group-knapsack.md` |
| *990706 | 背包：混合背包 | 计划 | `dynamic-programming/mixed-knapsack.md` |
| *990707 | 背包：多维背包 | 计划 | `dynamic-programming/multidimensional-knapsack.md` |
| *990708 | 背包：树上背包 | 计划 | `dynamic-programming/tree-knapsack.md` |
| *990709 | 状态压缩：轮廓线 DP | 计划 | `dynamic-programming/profile-dp.md` |
| *990710 | 状态压缩：插头 DP | 计划 | `dynamic-programming/plug-dp.md` |
| *990711 | 括号序列 DP | 计划 | `dynamic-programming/bracket-sequence-dp.md` |
| *990712 | 自动机 DP | 计划 | `dynamic-programming/automaton-dp.md` |
| *990713 | 划分 DP | 计划 | `dynamic-programming/partition-dp.md` |
| *990714 | 动态 DP | 计划 | `dynamic-programming/dynamic-dp.md` |
| *990715 | 动态规划优化：单调栈 | 计划 | `dynamic-programming/monotone-stack-optimization.md` |
| *990716 | 动态规划优化：四边形不等式 | 计划 | `dynamic-programming/quadrangle-inequality-optimization.md` |
| 041002 | 数字三角形 | 待审阅 | [number-triangle.md](dynamic-programming/number-triangle.md) |
| 041005 | 最长公共子序列 | 待审阅 | [longest-common-subsequence.md](dynamic-programming/longest-common-subsequence.md) |

## 08 字符串

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 041201 | 字符串比较与字典序 | 待审阅 | [comparison-and-lexicographic-order.md](strings/comparison-and-lexicographic-order.md) |
| 041202 | 朴素字符串匹配 | 待审阅 | [naive-pattern-matching.md](strings/naive-pattern-matching.md) |
| 062101 | 字符串：哈希 | 计划 | `strings/rolling-hash.md` |
| 062102 | 字符串：KMP 与前缀函数 | 计划 | `strings/kmp-prefix-function.md` |
| 062103 | 字符串：Z 函数 | 计划 | `strings/z-function.md` |
| 062104 | 字符串：Trie | 计划 | `strings/trie.md` |
| *990801 | 字符串：AC 自动机 | 计划 | `strings/aho-corasick.md` |
| *990802 | 字符串：Manacher | 计划 | `strings/manacher.md` |
| *990803 | 字符串：后缀数组 | 计划 | `strings/suffix-array.md` |
| *990804 | 字符串：后缀自动机 | 计划 | `strings/suffix-automaton.md` |
| *990805 | 字符串：回文树 | 计划 | `strings/palindromic-tree.md` |
| *990806 | 字符串：后缀树 | 计划 | `strings/suffix-tree.md` |
| *990807 | 最小表示法 | 计划 | `strings/minimum-representation.md` |
| *990808 | Lyndon 分解 | 计划 | `strings/lyndon-factorization.md` |

## 09 其他

### 专题：编码

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 050701 | 哈夫曼编码 | 待审阅 | [huffman-coding.md](other/huffman-coding.md) |
| 050702 | 格雷码 | 待审阅 | [gray-code.md](other/gray-code.md) |
