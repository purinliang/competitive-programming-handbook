# 按模块浏览

这里是教程正文的唯一知识注册表。六位文章 ID 编码权威学习入口，核心教程的推荐顺序见 [learning-path.md](learning-path.md)。每个模块可以先列“常用”入口，再按稳定专题收录全部内容；只有数论、组合数学、图论等确实形成多个文章家族的大专题，才用 `#### 专题：名称` 增加一层。同一篇文章可以同时属于多个专题乃至模块；不同入口仍指向同一个稳定正文和阅读状态。

六位 `CCUUPP` ID 表示核心教程的章、单元和篇序。`*` 前缀表示扩展阅读，难度通常更高或使用频率更低，暂时不学也不影响后续主线。不进入学习路线的独立扩展使用 `*99MMPP`；直接配套基础篇的附属扩展共享六位编号并追加 `e1`、`e2` 等后缀，例如 `*010201e1`。完整规则见 [文章编号与语义路径](../docs/article-identity.md)。`计划` 节点尚未创建文件，文件列只显示预定路径；已有正文的节点使用可点击链接。

新规范建立前形成的遗留草稿已经全部完成首次正式修订；下方空标记保留给目录校验脚本。

<!-- legacy-drafts: -->

## 下标与区间约定

本书自定义的对象默认从 1 开始编号并使用闭区间；讲解 C++ 与 STL 接口时，保留其原生的从 0 开始编号和左闭右开区间。完整的容量、哨兵和接口转换规则见 [learning-path.md](learning-path.md#下标与区间约定)。

## 01 C++

### 程序入门

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 010101 | Hello World! | 定稿 | [hello-world.md](cpp/hello-world.md) |
| 010102 | A+B Problem | 待审阅 | [a-plus-b-problem.md](cpp/a-plus-b-problem.md) |

### 基本类型

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 010201 | 整数类型 | 待审阅 | [integer-types.md](cpp/integer-types.md) |
| *010201e3 | 整数类型的位宽与平台差异 | 定稿 | [integer-type-widths.md](cpp/integer-type-widths.md) |
| 010301 | 浮点类型 | 待审阅 | [floating-point-types.md](cpp/floating-point-types.md) |
| *010301e1 | IEEE 754 浮点数表示 | 定稿 | [ieee-754.md](cpp/ieee-754.md) |
| 010801 | 字符类型 | 待审阅 | [character-type.md](cpp/character-type.md) |
| 010802 | 字符分类与转换 | 待审阅 | [character-classification-and-conversion.md](cpp/character-classification-and-conversion.md) |
| 010401 | 布尔类型 | 待审阅 | [boolean-type.md](cpp/boolean-type.md) |
| 010302 | 类型转换 | 待审阅 | [type-conversions.md](cpp/type-conversions.md) |

### 进制与机器表示

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 020101 | 位、字节与存储单位 | 定稿 | [bits-bytes-and-storage-units.md](cpp/bits-bytes-and-storage-units.md) |
| 020102 | 进制表示 | 待审阅 | [base-notation.md](cpp/base-notation.md) |
| 020103 | 整数的二进制表示 | 定稿 | [integer-binary-representation.md](cpp/integer-binary-representation.md) |
| *010201e3 | 整数类型的位宽与平台差异 | 定稿 | [integer-type-widths.md](cpp/integer-type-widths.md) |
| *010301e1 | IEEE 754 浮点数表示 | 定稿 | [ieee-754.md](cpp/ieee-754.md) |
| 020104 | 进制转换 | 待审阅 | [base-conversion.md](cpp/base-conversion.md) |

### 变量、常量与字面量

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *990101 | 变量 | 待审阅 | [variable.md](cpp/variable.md) |
| 010701 | 常量 | 待审阅 | [const.md](cpp/const.md) |
| *990102 | 字面量 | 待审阅 | [literals.md](cpp/literals.md) |
| *990103 | constexpr | 待审阅 | [constexpr.md](cpp/constexpr.md) |

### 运算符

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 010202 | 算术表达式 | 待审阅 | [arithmetic-expressions.md](cpp/arithmetic-expressions.md) |
| 010501 | 比较运算符 | 待审阅 | [comparison-operators.md](cpp/comparison-operators.md) |
| 010502 | 逻辑运算符 | 待审阅 | [logical-operators.md](cpp/logical-operators.md) |
| 010603 | 自增与自减运算符 | 待审阅 | [increment-decrement-operators.md](cpp/increment-decrement-operators.md) |
| 010203 | 复合赋值运算符 | 待审阅 | [compound-assignment-operators.md](cpp/compound-assignment-operators.md) |
| 020201 | 按位运算 | 待审阅 | [bitwise-operators.md](cpp/bitwise-operators.md) |
| 020202 | 移位运算 | 待审阅 | [shift-operators.md](cpp/shift-operators.md) |
| *020608 | 运算符重载 | 待审阅 | [operator-overloading.md](cpp/operator-overloading.md) |

### 数值计算

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 010202 | 算术表达式 | 待审阅 | [arithmetic-expressions.md](cpp/arithmetic-expressions.md) |
| 010203 | 复合赋值运算符 | 待审阅 | [compound-assignment-operators.md](cpp/compound-assignment-operators.md) |
| 010302 | 类型转换 | 待审阅 | [type-conversions.md](cpp/type-conversions.md) |
| 010303 | 数学函数 | 待审阅 | [cmath-functions.md](cpp/cmath-functions.md) |

### 控制流

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 010503 | if 与 else | 待审阅 | [if-and-else.md](cpp/if-and-else.md) |
| 010504 | 条件运算符 | 待审阅 | [conditional-operator.md](cpp/conditional-operator.md) |
| 010505 | switch | 待审阅 | [switch.md](cpp/switch.md) |
| 010601 | while | 待审阅 | [while.md](cpp/while.md) |
| 010602 | for | 待审阅 | [for.md](cpp/for.md) |
| 010604 | do while | 待审阅 | [do-while.md](cpp/do-while.md) |
| 010603 | 自增与自减运算符 | 待审阅 | [increment-decrement-operators.md](cpp/increment-decrement-operators.md) |

### 函数与递归

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 011001 | 函数的定义与调用 | 待审阅 | [function-definition-and-calls.md](cpp/function-definition-and-calls.md) |
| 011002 | 函数的返回值 | 待审阅 | [function-return-values.md](cpp/function-return-values.md) |
| 011003 | 函数的形参与实参 | 待审阅 | [function-parameters-and-arguments.md](cpp/function-parameters-and-arguments.md) |
| 011004 | 调用栈 | 待审阅 | [function-call-stack.md](cpp/function-call-stack.md) |
| 011005 | 递归 | 待审阅 | [recursion.md](cpp/recursion.md) |
| *990104 | inline | 待审阅 | [inline.md](cpp/inline.md) |
| *020607 | 函数重载 | 待审阅 | [function-overloading.md](cpp/function-overloading.md) |

### 数组

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 010702 | 一维数组 | 待审阅 | [one-dimensional-arrays.md](cpp/one-dimensional-arrays.md) |
| 010703 | 多维数组 | 待审阅 | [multidimensional-arrays.md](cpp/multidimensional-arrays.md) |
| *010703e1 | 多维数组的布局与参数传递 | 待审阅 | [multidimensional-array-layout-and-parameters.md](cpp/multidimensional-array-layout-and-parameters.md) |
| 030402 | array | 待审阅 | [array.md](cpp/array.md) |

### 字符串

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 010801 | 字符类型 | 待审阅 | [character-type.md](cpp/character-type.md) |
| 010802 | 字符分类与转换 | 待审阅 | [character-classification-and-conversion.md](cpp/character-classification-and-conversion.md) |
| 010901 | C 字符串 | 待审阅 | [c-strings.md](cpp/c-strings.md) |
| 010902 | string | 待审阅 | [string.md](cpp/string.md) |
| 010903 | 整行输入 | 待审阅 | [whole-line-input.md](cpp/whole-line-input.md) |

### 输入输出

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 011101 | scanf 与 printf | 待审阅 | [scanf-and-printf.md](cpp/scanf-and-printf.md) |
| 011102 | cin 与 cout | 待审阅 | [cin-and-cout.md](cpp/cin-and-cout.md) |
| 011103 | 输出格式控制 | 待审阅 | [output-formatting.md](cpp/output-formatting.md) |
| 011104 | 文件重定向 | 待审阅 | [file-redirection.md](cpp/file-redirection.md) |

### 名称与作用域

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *020802 | 标识符 | 待审阅 | [identifiers.md](cpp/identifiers.md) |
| *020801 | 关键字 | 待审阅 | [keywords.md](cpp/keywords.md) |
| *020803 | 作用域 | 待审阅 | [scope.md](cpp/scope.md) |
| *020804 | 命名空间与 std | 待审阅 | [namespace-and-std.md](cpp/namespace-and-std.md) |
| *020805 | typedef 类型别名 | 待审阅 | [typedef-type-alias.md](cpp/typedef-type-alias.md) |
| *020806 | using 类型别名 | 待审阅 | [using-type-aliases.md](cpp/using-type-aliases.md) |

### 地址、指针与引用

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *990105 | 字节寻址 | 待审阅 | [byte-addressing.md](cpp/byte-addressing.md) |
| 020301 | 指针 | 待审阅 | [pointers.md](cpp/pointers.md) |
| 020401 | 引用 | 待审阅 | [references.md](cpp/references.md) |
| *990106 | 指针与引用中的 const | 待审阅 | [const-pointers-and-references.md](cpp/const-pointers-and-references.md) |
| 020402 | 参数传递 | 待审阅 | [parameter-passing.md](cpp/parameter-passing.md) |

### 复合类型

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 020501 | 结构体 | 待审阅 | [struct.md](cpp/struct.md) |
| 020502 | 结构体指针与箭头运算符 | 待审阅 | [struct-pointers-and-arrow.md](cpp/struct-pointers-and-arrow.md) |
| *020501e1 | 结构体的内存布局 | 待审阅 | [struct-memory-layout.md](cpp/struct-memory-layout.md) |
| *021001 | 联合体 | 待审阅 | [union.md](cpp/union.md) |
| *021002 | 枚举 | 待审阅 | [enum.md](cpp/enum.md) |

### 内存与存储期

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *020901 | 竞赛程序的常见内存分区 | 待审阅 | [competitive-program-memory-layout.md](cpp/competitive-program-memory-layout.md) |
| *020902 | static 局部变量 | 待审阅 | [static-local-variables.md](cpp/static-local-variables.md) |
| *020903 | 对象生命周期 | 待审阅 | [object-lifetime.md](cpp/object-lifetime.md) |
| *020904 | 初始化 | 待审阅 | [initialization.md](cpp/initialization.md) |
| *990109 | volatile | 待审阅 | [volatile.md](cpp/volatile.md) |

### 标准库

#### 专题：基础工具

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030303 | pair | 待审阅 | [pair.md](cpp/pair.md) |
| 030304 | tuple | 待审阅 | [tuple.md](cpp/tuple.md) |
| 030305 | min 与 max | 待审阅 | [min-and-max.md](cpp/min-and-max.md) |
| 030306 | swap | 待审阅 | [swap.md](cpp/swap.md) |
| 030402 | array | 待审阅 | [array.md](cpp/array.md) |
| 030301 | vector | 待审阅 | [vector.md](cpp/vector.md) |
| 030307 | sort | 待审阅 | [sort.md](cpp/sort.md) |
| 030308 | unique | 待审阅 | [unique.md](cpp/unique.md) |
| 030703 | 标准库二分查找 | 待审阅 | [stl-binary-search.md](cpp/stl-binary-search.md) |
| 030302 | fill | 待审阅 | [fill.md](cpp/fill.md) |
| 010902 | string | 待审阅 | [string.md](cpp/string.md) |

#### 专题：序列容器与容器适配器

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040104 | deque | 待审阅 | [deque.md](cpp/deque.md) |
| 040105 | stack | 待审阅 | [stack.md](cpp/stack.md) |
| 040106 | queue | 待审阅 | [queue.md](cpp/queue.md) |

#### 专题：关联容器

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 050401 | set | 待审阅 | [set.md](cpp/set.md) |
| 050402 | map | 待审阅 | [map.md](cpp/map.md) |
| 050403 | multiset | 待审阅 | [multiset.md](cpp/multiset.md) |
| 050404 | multimap | 待审阅 | [multimap.md](cpp/multimap.md) |
| 050405 | unordered_set | 待审阅 | [unordered-set.md](cpp/unordered-set.md) |
| 050406 | unordered_map | 待审阅 | [unordered-map.md](cpp/unordered-map.md) |

#### 专题：其他工具

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *990111 | bitset | 待审阅 | [bitset.md](cpp/bitset.md) |
| *990110 | GNU PBDS | 推迟 | `cpp/gnu-pbds.md` |

### 编译与调试

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *020701 | 预处理 | 待审阅 | [preprocessing.md](cpp/preprocessing.md) |
| *020702 | 预处理：#include | 待审阅 | [include.md](cpp/include.md) |
| *020703 | 预处理：#define | 待审阅 | [define.md](cpp/define.md) |
| *020704 | 条件编译 | 待审阅 | [conditional-compilation.md](cpp/conditional-compilation.md) |
| *020705 | 编译器与解释器 | 待审阅 | [compiler-and-interpreter.md](cpp/compiler-and-interpreter.md) |
| *020706 | 编译 | 待审阅 | [compilation.md](cpp/compilation.md) |
| *020707 | 链接 | 待审阅 | [linking.md](cpp/linking.md) |
| *020708 | 调试与调试器 | 待审阅 | [debugging-and-debuggers.md](cpp/debugging-and-debuggers.md) |

### 面向对象

#### 专题：类

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

### 常用

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030101 | 复杂度 | 待审阅 | [complexity.md](algorithm-basics/complexity.md) |
| 030201 | 枚举 | 待审阅 | [enumeration.md](algorithm-basics/enumeration.md) |
| 030202 | 模拟 | 待审阅 | [simulation.md](algorithm-basics/simulation.md) |
| 030203 | 贪心选择与正确性证明 | 待审阅 | [greedy-selection-and-proof.md](algorithm-basics/greedy-selection-and-proof.md) |
| 030501 | 前缀和 | 待审阅 | [prefix-sums.md](algorithm-basics/prefix-sums.md) |
| 030502 | 差分 | 待审阅 | [difference-array.md](algorithm-basics/difference-array.md) |
| 030605 | 快速排序 | 待审阅 | [quicksort.md](algorithm-basics/quicksort.md) |
| 030606 | 归并排序 | 待审阅 | [merge-sort.md](algorithm-basics/merge-sort.md) |
| 030701 | 二分查找 | 待审阅 | [binary-search.md](algorithm-basics/binary-search.md) |
| 030704 | 二分答案 | 待审阅 | [binary-search-on-answer.md](algorithm-basics/binary-search-on-answer.md) |
| 030801 | 离散化 | 待审阅 | [coordinate-compression.md](algorithm-basics/coordinate-compression.md) |
| 030901 | 双指针 | 待审阅 | [two-pointers.md](algorithm-basics/two-pointers.md) |
| 030902 | 滑动窗口 | 待审阅 | [sliding-window.md](algorithm-basics/sliding-window.md) |

### 复杂度

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030101 | 复杂度 | 待审阅 | [complexity.md](algorithm-basics/complexity.md) |
| *030101e1 | 渐近记号 | 待审阅 | [asymptotic-notation.md](algorithm-basics/asymptotic-notation.md) |
| 030102 | 从代码分析复杂度 | 待审阅 | [complexity-analysis.md](algorithm-basics/complexity-analysis.md) |
| 060101 | 均摊复杂度 | 待审阅 | [amortized-complexity.md](algorithm-basics/amortized-complexity.md) |
| 060102 | 均摊复杂度：势能法 | 待审阅 | [potential-method.md](algorithm-basics/potential-method.md) |

### 算法设计思想

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030201 | 枚举 | 待审阅 | [enumeration.md](algorithm-basics/enumeration.md) |
| 030202 | 模拟 | 待审阅 | [simulation.md](algorithm-basics/simulation.md) |
| 030203 | 贪心选择与正确性证明 | 待审阅 | [greedy-selection-and-proof.md](algorithm-basics/greedy-selection-and-proof.md) |
| 030204 | 递推 | 待审阅 | [recurrence.md](algorithm-basics/recurrence.md) |
| *030204e1 | 格雷码 | 待审阅 | [gray-code.md](other/gray-code.md) |
| 030205 | 递归与问题分解 | 待审阅 | [recursive-problem-solving.md](algorithm-basics/recursive-problem-solving.md) |
| 030206 | 分治 | 待审阅 | [divide-and-conquer.md](algorithm-basics/divide-and-conquer.md) |

### 枚举

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030201 | 枚举 | 待审阅 | [enumeration.md](algorithm-basics/enumeration.md) |
| 040501 | 状态空间与隐式图 | 待审阅 | [state-space-and-implicit-graphs.md](algorithm-basics/state-space-and-implicit-graphs.md) |
| 040502 | 子集与位掩码枚举 | 待审阅 | [subset-bitmask-enumeration.md](algorithm-basics/subset-bitmask-enumeration.md) |
| 040503 | 排列枚举 | 待审阅 | [permutation-enumeration.md](algorithm-basics/permutation-enumeration.md) |
| 040504 | 组合枚举 | 待审阅 | [combination-enumeration.md](algorithm-basics/combination-enumeration.md) |
| 040505 | DFS、回溯与剪枝 | 待审阅 | [dfs-backtracking-pruning.md](algorithm-basics/dfs-backtracking-pruning.md) |
| 070101 | 枚举：Meet-in-the-Middle | 待审阅 | [meet-in-the-middle.md](algorithm-basics/meet-in-the-middle.md) |

### 前缀和

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030501 | 前缀和 | 待审阅 | [prefix-sums.md](algorithm-basics/prefix-sums.md) |
| 030502 | 差分 | 待审阅 | [difference-array.md](algorithm-basics/difference-array.md) |

### 排序

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030601 | 冒泡排序 | 待审阅 | [bubble-sort.md](algorithm-basics/bubble-sort.md) |
| 030602 | 选择排序 | 待审阅 | [selection-sort.md](algorithm-basics/selection-sort.md) |
| 030603 | 插入排序 | 待审阅 | [insertion-sort.md](algorithm-basics/insertion-sort.md) |
| 030604 | 计数排序 | 待审阅 | [counting-sort.md](algorithm-basics/counting-sort.md) |
| 030607 | 排序方法比较 | 待审阅 | [sorting-comparison.md](algorithm-basics/sorting-comparison.md) |
| 030605 | 快速排序 | 待审阅 | [quicksort.md](algorithm-basics/quicksort.md) |
| 030606 | 归并排序 | 待审阅 | [merge-sort.md](algorithm-basics/merge-sort.md) |
| *030606e1 | 用归并排序统计逆序对 | 待审阅 | [merge-sort-inversion-count.md](algorithm-basics/merge-sort-inversion-count.md) |

### 分治

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030206 | 分治 | 待审阅 | [divide-and-conquer.md](algorithm-basics/divide-and-conquer.md) |
| 030605 | 快速排序 | 待审阅 | [quicksort.md](algorithm-basics/quicksort.md) |
| 030606 | 归并排序 | 待审阅 | [merge-sort.md](algorithm-basics/merge-sort.md) |
| *030606e1 | 用归并排序统计逆序对 | 待审阅 | [merge-sort-inversion-count.md](algorithm-basics/merge-sort-inversion-count.md) |
| 090101 | CDQ 分治 | 待审阅 | [cdq-divide-and-conquer.md](algorithm-basics/cdq-divide-and-conquer.md) |

### 其他排序

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *050204 | 堆排序 | 待审阅 | [heap-sort.md](algorithm-basics/heap-sort.md) |
| *030608 | 基数排序 | 待审阅 | [radix-sort.md](algorithm-basics/radix-sort.md) |
| *030609 | 桶排序 | 待审阅 | [bucket-sort.md](algorithm-basics/bucket-sort.md) |

### 二分与数值搜索

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030701 | 二分查找 | 待审阅 | [binary-search.md](algorithm-basics/binary-search.md) |
| 030702 | 二分边界 | 待审阅 | [binary-search-boundaries.md](algorithm-basics/binary-search-boundaries.md) |
| 030704 | 二分答案 | 待审阅 | [binary-search-on-answer.md](algorithm-basics/binary-search-on-answer.md) |
| 030705 | 浮点数二分 | 待审阅 | [floating-point-binary-search.md](algorithm-basics/floating-point-binary-search.md) |
| 030706 | 倍增 | 待审阅 | [doubling.md](algorithm-basics/doubling.md) |
| *990202 | 三分搜索 | 计划 | `algorithm-basics/ternary-search.md` |
| *990203 | 整体二分与并行二分 | 计划 | `algorithm-basics/parallel-binary-search.md` |

### 离散化与离线处理

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030801 | 离散化 | 待审阅 | [coordinate-compression.md](algorithm-basics/coordinate-compression.md) |
| 070102 | 离线算法 | 待审阅 | [offline-algorithms.md](algorithm-basics/offline-algorithms.md) |
| 070103 | 扫描线与事件排序 | 待审阅 | [sweep-line.md](algorithm-basics/sweep-line.md) |
| 090101 | CDQ 分治 | 待审阅 | [cdq-divide-and-conquer.md](algorithm-basics/cdq-divide-and-conquer.md) |

### 线性表

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030401 | 数组 | 待审阅 | [array.md](algorithm-basics/array.md) |
| 030403 | 链表的基本概念 | 待审阅 | [linked-list.md](algorithm-basics/linked-list.md) |
| 030404 | 单向链表 | 待审阅 | [singly-linked-list.md](algorithm-basics/singly-linked-list.md) |
| 030405 | 双向链表 | 待审阅 | [doubly-linked-list.md](algorithm-basics/doubly-linked-list.md) |
| 030406 | 循环链表 | 待审阅 | [circular-linked-list.md](algorithm-basics/circular-linked-list.md) |
| 030407 | list | 待审阅 | [list.md](cpp/list.md) |

### 栈

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040101 | 栈 | 待审阅 | [stack.md](algorithm-basics/stack.md) |
| 060204 | 单调栈 | 待审阅 | [monotonic-stack.md](algorithm-basics/monotonic-stack.md) |
| 040107 | 出栈序列判定 | 待审阅 | [stack-pop-sequence-validation.md](algorithm-basics/stack-pop-sequence-validation.md) |
| 040108 | 表达式求值 | 待审阅 | [expression-evaluation.md](algorithm-basics/expression-evaluation.md) |

### 队列

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040102 | 队列 | 待审阅 | [queue.md](algorithm-basics/queue.md) |
| 040103 | 双端队列 | 待审阅 | [deque.md](algorithm-basics/deque.md) |
| 060205 | 单调队列 | 待审阅 | [monotonic-queue.md](algorithm-basics/monotonic-queue.md) |

### 二叉堆

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 050201 | 二叉堆 | 待审阅 | [binary-heap.md](algorithm-basics/binary-heap.md) |
| 050202 | priority_queue | 待审阅 | [priority-queue.md](cpp/priority-queue.md) |
| 050203 | 哈夫曼编码 | 待审阅 | [huffman-coding.md](other/huffman-coding.md) |
| *050204 | 堆排序 | 待审阅 | [heap-sort.md](algorithm-basics/heap-sort.md) |

### 哈希与哈希表

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 050301 | 哈希 | 待审阅 | [hashing.md](algorithm-basics/hashing.md) |
| 050302 | 哈希表 | 待审阅 | [hash-table.md](algorithm-basics/hash-table.md) |

### 双指针

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030901 | 双指针 | 待审阅 | [two-pointers.md](algorithm-basics/two-pointers.md) |
| 030902 | 滑动窗口 | 待审阅 | [sliding-window.md](algorithm-basics/sliding-window.md) |

### 贪心策略

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030203 | 贪心选择与正确性证明 | 待审阅 | [greedy-selection-and-proof.md](algorithm-basics/greedy-selection-and-proof.md) |
| 040601 | 邻项交换证明 | 待审阅 | [greedy-adjacent-exchange.md](algorithm-basics/greedy-adjacent-exchange.md) |
| 040602 | 反悔贪心 | 待审阅 | [greedy-regret.md](algorithm-basics/greedy-regret.md) |

### 倍增

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 030706 | 倍增 | 待审阅 | [doubling.md](algorithm-basics/doubling.md) |

### 搜索与状态空间

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040501 | 状态空间与隐式图 | 待审阅 | [state-space-and-implicit-graphs.md](algorithm-basics/state-space-and-implicit-graphs.md) |
| 040505 | DFS、回溯与剪枝 | 待审阅 | [dfs-backtracking-pruning.md](algorithm-basics/dfs-backtracking-pruning.md) |
| *990204 | 搜索：迭代加深 | 计划 | `algorithm-basics/iterative-deepening.md` |
| *990205 | 搜索：A* | 推迟 | `algorithm-basics/a-star.md` |
| *990206 | 精确覆盖：Dancing Links（DLX） | 推迟 | `algorithm-basics/dancing-links.md` |

### 随机化

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *990207 | 随机化算法 | 计划 | `algorithm-basics/randomized-algorithms.md` |
| *990208 | 随机化：爬山法 | 计划 | `algorithm-basics/hill-climbing.md` |
| *990209 | 随机化：模拟退火 | 计划 | `algorithm-basics/simulated-annealing.md` |

### 竞赛工程

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *990210 | 工程：对拍 | 计划 | `algorithm-basics/stress-testing.md` |

## 03 数据结构

### 常用

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 050201 | 二叉堆 | 待审阅 | [binary-heap.md](algorithm-basics/binary-heap.md) |
| 060602 | 并查集 | 待审阅 | [disjoint-set-union.md](data-structures/disjoint-set-union.md) |
| 060202 | 树状数组 | 待审阅 | [fenwick-tree.md](data-structures/fenwick-tree.md) |
| 060201 | 线段树 | 待审阅 | [segment-tree.md](data-structures/segment-tree.md) |
| *060203 | 稀疏表（ST 表） | 待审阅 | [sparse-table.md](data-structures/sparse-table.md) |
| 060704 | Trie | 待审阅 | [trie.md](strings/trie.md) |
| 080107 | 重链剖分 | 待审阅 | [heavy-light-decomposition.md](graph-theory/heavy-light-decomposition.md) |

### 二叉树

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 050101 | 二叉树的基本概念 | 待审阅 | [binary-tree-concepts.md](data-structures/binary-tree-concepts.md) |
| 050102 | 二叉树的存储 | 待审阅 | [binary-tree-storage.md](data-structures/binary-tree-storage.md) |
| 050103 | 完全二叉树 | 待审阅 | [complete-binary-tree.md](data-structures/complete-binary-tree.md) |
| 050104 | 二叉树的遍历：前序、中序与后序 | 待审阅 | [binary-tree-traversals.md](data-structures/binary-tree-traversals.md) |
| 050105 | 二叉搜索树的概念与构造 | 待审阅 | [binary-search-tree-construction.md](data-structures/binary-search-tree-construction.md) |

### 并查集

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 060602 | 并查集 | 待审阅 | [disjoint-set-union.md](data-structures/disjoint-set-union.md) |
| 080101 | 并查集：扩展域 | 待审阅 | [extended-domain-disjoint-set.md](data-structures/extended-domain-disjoint-set.md) |
| 080102 | 并查集：带权 | 待审阅 | [weighted-disjoint-set.md](data-structures/weighted-disjoint-set.md) |
| *990302 | 可撤销并查集 | 计划 | `data-structures/rollback-disjoint-set.md` |
| 090207 | 可持久化并查集 | 待审阅 | [persistent-disjoint-set-union.md](data-structures/persistent-disjoint-set-union.md) |

### 树状数组

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 060202 | 树状数组 | 待审阅 | [fenwick-tree.md](data-structures/fenwick-tree.md) |
| *990309 | 树状数组的区间修改变体 | 推迟 | `data-structures/fenwick-range-updates.md` |
| *990310 | 树状数组维护区间最值 | 推迟 | `data-structures/fenwick-range-extrema.md` |

### 线段树

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 060201 | 线段树 | 待审阅 | [segment-tree.md](data-structures/segment-tree.md) |
| *990301 | 线段树：懒标记的组合顺序 | 待审阅 | [segment-tree-lazy-tags.md](data-structures/segment-tree-lazy-tags.md) |
| *990305 | 线段树二分与树上下降 | 计划 | `data-structures/segment-tree-descent.md` |
| 090202 | 可持久化线段树 | 待审阅 | [persistent-segment-tree.md](data-structures/persistent-segment-tree.md) |
| *990307 | 动态开点线段树 | 推迟 | `data-structures/dynamic-segment-tree.md` |
| *990308 | Segment Tree Beats | 推迟 | `data-structures/segment-tree-beats.md` |
| *990321 | 线段树：合并 | 推迟 | `data-structures/segment-tree-merging.md` |

### 稀疏表

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *060203 | 稀疏表（ST 表） | 待审阅 | [sparse-table.md](data-structures/sparse-table.md) |

### 分块与莫队

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 080103 | 分块 | 待审阅 | [data-structures/square-root-decomposition.md](data-structures/square-root-decomposition.md) |
| 080104 | 莫队算法 | 待审阅 | [data-structures/mo-algorithm.md](data-structures/mo-algorithm.md) |
| *990328 | 链上分块 | 推迟 | `data-structures/chain-block-decomposition.md` |
| *990329 | 树上分块 | 推迟 | `data-structures/tree-block-decomposition.md` |

### 可并堆

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *990311 | 左偏树 | 计划 | `data-structures/leftist-tree.md` |
| *990318 | 斜堆 | 推迟 | `data-structures/skew-heap.md` |
| *990319 | 配对堆 | 推迟 | `data-structures/pairing-heap.md` |

### 平衡树

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 080109 | Treap | 待审阅 | [data-structures/treap.md](data-structures/treap.md) |
| 080110 | FHQ Treap | 待审阅 | [data-structures/fhq-treap.md](data-structures/fhq-treap.md) |
| 090201 | Splay | 待审阅 | [splay.md](data-structures/splay.md) |
| *990325 | 替罪羊树 | 推迟 | `data-structures/scapegoat-tree.md` |
| *990314 | B 树与 B+ 树 | 推迟 | `data-structures/b-tree-and-b-plus-tree.md` |
| *080110e1 | 可持久化 FHQ Treap | 推迟 | `data-structures/persistent-fhq-treap.md` |

### 可持久化数据结构

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 090202 | 可持久化线段树 | 待审阅 | [persistent-segment-tree.md](data-structures/persistent-segment-tree.md) |
| 090207 | 可持久化并查集 | 待审阅 | [persistent-disjoint-set-union.md](data-structures/persistent-disjoint-set-union.md) |
| *080110e1 | 可持久化 FHQ Treap | 推迟 | `data-structures/persistent-fhq-treap.md` |

### 树上数据结构

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 080105 | 启发式合并 | 待审阅 | [data-structures/small-to-large-merging.md](data-structures/small-to-large-merging.md) |
| 080106 | 树上启发式合并 | 待审阅 | [graph-theory/dsu-on-tree.md](graph-theory/dsu-on-tree.md) |
| 080107 | 重链剖分 | 待审阅 | [heavy-light-decomposition.md](graph-theory/heavy-light-decomposition.md) |
| *990428 | 长链剖分 | 推迟 | `graph-theory/long-chain-decomposition.md` |
| 090205 | 动态树：Link-Cut Tree | 待审阅 | [link-cut-tree.md](data-structures/link-cut-tree.md) |
| *990328 | 链上分块 | 推迟 | `data-structures/chain-block-decomposition.md` |
| *990329 | 树上分块 | 推迟 | `data-structures/tree-block-decomposition.md` |

### 字典树

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 060704 | Trie | 待审阅 | [trie.md](strings/trie.md) |
| *990330 | 01 Trie | 计划 | `data-structures/binary-trie.md` |
| *990330e1 | 可持久化 01 Trie | 推迟 | `data-structures/persistent-binary-trie.md` |

### 异或查询

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *990330 | 01 Trie | 计划 | `data-structures/binary-trie.md` |
| *990330e1 | 可持久化 01 Trie | 推迟 | `data-structures/persistent-binary-trie.md` |
| 080303 | 异或线性基 | 待审阅 | [math/xor-linear-basis.md](math/xor-linear-basis.md) |
| *080303e1 | 前缀线性基 | 推迟 | `math/prefix-xor-linear-basis.md` |

### 复合与空间数据结构

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 090203 | 树套树：线段树套线段树 | 待审阅 | [segment-tree-of-segment-trees.md](data-structures/segment-tree-of-segment-trees.md) |
| 090204 | 树套树：线段树套平衡树 | 待审阅 | [segment-tree-of-balanced-trees.md](data-structures/segment-tree-of-balanced-trees.md) |
| 090206 | KD 树 | 待审阅 | [kd-tree.md](data-structures/kd-tree.md) |
| 080108 | 笛卡尔树 | 待审阅 | [data-structures/cartesian-tree.md](data-structures/cartesian-tree.md) |
| *990316 | Wavelet Matrix | 推迟 | `data-structures/wavelet-matrix.md` |

## 04 图论

### 常用

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040301 | 点与边 | 待审阅 | [vertices-and-edges.md](graph-theory/vertices-and-edges.md) |
| 040304 | 图的存储：基础概念 | 待审阅 | [graph-representation.md](graph-theory/graph-representation.md) |
| 040306 | 图的存储：邻接表（`vector` 实现） | 待审阅 | [vector-adjacency-list.md](graph-theory/vector-adjacency-list.md) |
| 040307 | 图的遍历：深度优先搜索（DFS） | 待审阅 | [graph-depth-first-search.md](graph-theory/graph-depth-first-search.md) |
| 040308 | 图的遍历：广度优先搜索（BFS） | 待审阅 | [graph-breadth-first-search.md](graph-theory/graph-breadth-first-search.md) |
| 040402 | 有根树 | 待审阅 | [rooted-trees.md](graph-theory/rooted-trees.md) |
| 040403 | 树的遍历：深度优先搜索（DFS） | 待审阅 | [tree-depth-first-search.md](graph-theory/tree-depth-first-search.md) |
| 060406 | 拓扑排序 | 待审阅 | [topological-sort.md](graph-theory/topological-sort.md) |
| 060501 | 最短路：Dijkstra | 待审阅 | [dijkstra.md](graph-theory/dijkstra.md) |
| 060603 | 最小生成树：Kruskal | 待审阅 | [kruskal.md](graph-theory/kruskal.md) |
| 060404 | 倍增 LCA | 待审阅 | [lca-binary-lifting.md](graph-theory/lca-binary-lifting.md) |

### 概念与存储

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040301 | 点与边 | 待审阅 | [vertices-and-edges.md](graph-theory/vertices-and-edges.md) |
| 040302 | 路径与环 | 待审阅 | [paths-and-cycles.md](graph-theory/paths-and-cycles.md) |
| 040303 | 度数 | 待审阅 | [vertex-degrees.md](graph-theory/vertex-degrees.md) |
| 040304 | 图的存储：基础概念 | 待审阅 | [graph-representation.md](graph-theory/graph-representation.md) |
| 040305 | 图的存储：邻接矩阵 | 待审阅 | [adjacency-matrix.md](graph-theory/adjacency-matrix.md) |
| 040306 | 图的存储：邻接表（`vector` 实现） | 待审阅 | [vector-adjacency-list.md](graph-theory/vector-adjacency-list.md) |
| 060601 | 图的存储：边集 | 定稿 | [edge-list.md](graph-theory/edge-list.md) |
| 070204 | 图的存储：邻接表（链式前向星实现） | 待审阅 | [chained-forward-star.md](graph-theory/chained-forward-star.md) |

### 遍历

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040307 | 图的遍历：深度优先搜索（DFS） | 待审阅 | [graph-depth-first-search.md](graph-theory/graph-depth-first-search.md) |
| 040308 | 图的遍历：广度优先搜索（BFS） | 待审阅 | [graph-breadth-first-search.md](graph-theory/graph-breadth-first-search.md) |
| 040309 | 连通分量 | 待审阅 | [connected-components.md](graph-theory/connected-components.md) |
| 040310 | 泛洪算法（Flood Fill） | 待审阅 | [flood-fill.md](graph-theory/flood-fill.md) |
| 040311 | 多源 BFS | 待审阅 | [multi-source-bfs.md](graph-theory/multi-source-bfs.md) |

### 有向无环图

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 060406 | 拓扑排序 | 待审阅 | [topological-sort.md](graph-theory/topological-sort.md) |

### 最短路

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 060501 | 最短路：Dijkstra | 待审阅 | [dijkstra.md](graph-theory/dijkstra.md) |
| 060502 | 最短路：Bellman–Ford 与负环 | 待审阅 | [bellman-ford.md](graph-theory/bellman-ford.md) |
| 060503 | 最短路：Floyd–Warshall | 待审阅 | [floyd-warshall.md](graph-theory/floyd-warshall.md) |
| 060504 | 最短路：0-1 BFS | 待审阅 | [zero-one-bfs.md](graph-theory/zero-one-bfs.md) |
| 070203 | 最短路：分层图与状态图 | 待审阅 | [layered-state-shortest-path.md](graph-theory/layered-state-shortest-path.md) |
| *990408 | SPFA 与队列优化最短路 | 计划 | `graph-theory/spfa.md` |
| *990410 | 差分约束 | 计划 | `graph-theory/difference-constraints.md` |
| 090305 | 最短路树 | 待审阅 | [shortest-path-tree.md](graph-theory/shortest-path-tree.md) |
| *990422 | 最短路：k 短路 | 推迟 | `graph-theory/k-shortest-paths.md` |

### 生成树

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 060603 | 最小生成树：Kruskal | 待审阅 | [kruskal.md](graph-theory/kruskal.md) |
| 060604 | 最小生成树：Prim | 待审阅 | [prim.md](graph-theory/prim.md) |
| 090306 | Boruvka 算法 | 计划 | `graph-theory/boruvka.md` |
| *990420 | 有向最小生成树：Chu–Liu/Edmonds | 推迟 | `graph-theory/directed-minimum-spanning-tree.md` |

### 二分图与匹配

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040312 | 二分图：判定 | 待审阅 | [bipartite-graph.md](graph-theory/bipartite-graph.md) |
| 080201 | 二分图：最大匹配 | 待审阅 | [graph-theory/bipartite-matching.md](graph-theory/bipartite-matching.md) |
| *080201e1 | 二分图最大匹配：Hopcroft–Karp | 推迟 | `graph-theory/hopcroft-karp.md` |
| 090314 | 二分图最大权匹配：KM 算法 | 计划 | `graph-theory/kuhn-munkres.md` |
| *990421 | 一般图最大匹配 | 推迟 | `graph-theory/general-graph-matching.md` |

### 连通性

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 070201 | 有向图：强连通分量 | 待审阅 | [strongly-connected-components.md](graph-theory/strongly-connected-components.md) |
| 070202 | 无向图：割点与桥 | 待审阅 | [articulation-points-bridges.md](graph-theory/articulation-points-bridges.md) |
| 090307 | 点双连通分量与圆方树 | 计划 | `graph-theory/biconnected-components-block-cut-tree.md` |
| 080202 | 2-SAT | 待审阅 | [graph-theory/two-sat.md](graph-theory/two-sat.md) |
| *990423 | 支配树 | 推迟 | `graph-theory/dominator-tree.md` |
| *990424 | 无向图：全局最小割 | 推迟 | `graph-theory/global-minimum-cut.md` |

### 欧拉与哈密顿问题

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 070205 | 欧拉问题：路径、回路与图 | 待审阅 | [eulerian-paths-and-circuits.md](graph-theory/eulerian-paths-and-circuits.md) |
| 070206 | 哈密顿问题：路径、回路与图 | 定稿 | [hamiltonian-paths-and-circuits.md](graph-theory/hamiltonian-paths-and-circuits.md) |
| *070206e1 | 哈密顿问题：小规模回溯 | 定稿 | [hamiltonian-backtracking.md](graph-theory/hamiltonian-backtracking.md) |

### 树的基础

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040401 | 无根树 | 待审阅 | [unrooted-trees.md](graph-theory/unrooted-trees.md) |
| 040402 | 有根树 | 待审阅 | [rooted-trees.md](graph-theory/rooted-trees.md) |
| 040403 | 树的遍历：深度优先搜索（DFS） | 待审阅 | [tree-depth-first-search.md](graph-theory/tree-depth-first-search.md) |
| 040404 | 树的遍历：广度优先搜索（BFS） | 待审阅 | [tree-breadth-first-search.md](graph-theory/tree-breadth-first-search.md) |
| 060401 | 树的直径与中心 | 待审阅 | [tree-diameter-center.md](graph-theory/tree-diameter-center.md) |
| 060402 | 树的重心 | 待审阅 | [tree-centroid.md](graph-theory/tree-centroid.md) |
| 060403 | 树的 DFS 序与子树区间 | 待审阅 | [tree-euler-tour.md](graph-theory/tree-euler-tour.md) |

### 树上查询与数据结构

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 060404 | 倍增 LCA | 待审阅 | [lca-binary-lifting.md](graph-theory/lca-binary-lifting.md) |
| 080107 | 重链剖分 | 待审阅 | [heavy-light-decomposition.md](graph-theory/heavy-light-decomposition.md) |
| 060405 | 树上差分 | 待审阅 | [tree-difference.md](graph-theory/tree-difference.md) |
| 090303 | 虚树 | 待审阅 | [virtual-tree.md](graph-theory/virtual-tree.md) |
| 090304 | 树哈希 | 待审阅 | [tree-hashing.md](graph-theory/tree-hashing.md) |
| *990428 | 长链剖分 | 推迟 | `graph-theory/long-chain-decomposition.md` |

### 树分治

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 090301 | 点分治 | 待审阅 | [centroid-decomposition.md](graph-theory/centroid-decomposition.md) |
| 090302 | 边分治 | 计划 | `graph-theory/edge-decomposition.md` |
| *990427 | 树分治：动态点分治 | 推迟 | `graph-theory/dynamic-centroid-decomposition.md` |

### 特殊图结构

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *060407 | 基环树 | 待审阅 | [unicyclic-graph.md](graph-theory/unicyclic-graph.md) |
| *990429 | 函数图 | 待审阅 | [functional-graph.md](graph-theory/functional-graph.md) |
| *990417 | 竞赛图 | 计划 | `graph-theory/tournament-graph.md` |
| 090316 | 仙人掌 | 计划 | `graph-theory/cactus-graph.md` |
| *990425 | 弦图 | 推迟 | `graph-theory/chordal-graph.md` |

### 网络流

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 090308 | 最大流与残量网络 | 计划 | `graph-theory/max-flow-residual-network.md` |
| 090309 | Dinic 算法 | 计划 | `graph-theory/dinic-max-flow.md` |
| 090310 | SAP 算法 | 计划 | `graph-theory/sap-max-flow.md` |
| 090311 | 可行流 | 计划 | `graph-theory/feasible-flow.md` |
| 090312 | 最小费用最大流 | 计划 | `graph-theory/min-cost-max-flow.md` |
| 090313 | 上下界网络流 | 计划 | `graph-theory/bounded-flow.md` |

### 其他图问题

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 090315 | Steiner 树 | 计划 | `graph-theory/steiner-tree.md` |

## 05 数学

### 常用

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040207 | 最大公约数与最小公倍数 | 待审阅 | [greatest-common-divisor-and-least-common-multiple.md](math/greatest-common-divisor-and-least-common-multiple.md) |
| 040208 | 欧几里得算法 | 待审阅 | [euclidean-algorithm.md](math/euclidean-algorithm.md) |
| 060301 | 模运算 | 待审阅 | [modular-arithmetic.md](math/modular-arithmetic.md) |
| 060302 | 模快速幂 | 待审阅 | [modular-exponentiation.md](math/modular-exponentiation.md) |
| 070305 | 模逆元 | 待审阅 | [modular-inverse.md](math/modular-inverse.md) |
| 070307 | 筛法：欧拉筛（线性筛） | 待审阅 | [euler-sieve.md](math/euler-sieve.md) |
| 050605 | 组合数与二项式系数 | 待审阅 | [binomial-coefficients.md](math/binomial-coefficients.md) |
| 050501 | 高精度整数：加法、减法与乘法 | 待审阅 | [big-integer-addition-subtraction-multiplication.md](math/big-integer-addition-subtraction-multiplication.md) |
| 050502 | 高精度整数：除以低精度整数 | 待审阅 | [big-integer-division-by-small-integer.md](math/big-integer-division-by-small-integer.md) |
| 060305 | 矩阵：表示 | 待审阅 | [matrix-representation.md](math/matrix-representation.md) |
| 060307 | 矩阵：乘法 | 待审阅 | [matrix-multiplication.md](math/matrix-multiplication.md) |
| 060309 | 矩阵快速幂 | 待审阅 | [matrix-exponentiation.md](math/matrix-exponentiation.md) |

### 数学基础

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *041001 | 数系：自然数、整数、有理数与实数 | 待审阅 | [number-systems-review.md](math/number-systems-review.md) |
| *041002 | 集合：基本概念与交、并、补 | 待审阅 | [sets-review.md](math/sets-review.md) |
| *041003 | 代数：方程与不等式 | 待审阅 | [equations-and-inequalities-review.md](math/equations-and-inequalities-review.md) |
| *041004 | 几何：平面几何基础 | 待审阅 | [plane-geometry-basics.md](math/plane-geometry-basics.md) |

### 数论

#### 专题：整除、质数与因数

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040201 | 因数、倍数与整除 | 待审阅 | [divisibility.md](math/divisibility.md) |
| 040202 | 质数 | 待审阅 | [prime-numbers.md](math/prime-numbers.md) |
| 040203 | 试除法：质数检测 | 待审阅 | [trial-division-primality-test.md](math/trial-division-primality-test.md) |
| 040204 | 算术基本定理 | 待审阅 | [fundamental-theorem-of-arithmetic.md](math/fundamental-theorem-of-arithmetic.md) |
| 040205 | 质因数分解 | 待审阅 | [prime-factorization.md](math/prime-factorization.md) |

#### 专题：最大公约数与欧几里得算法

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040207 | 最大公约数与最小公倍数 | 待审阅 | [greatest-common-divisor-and-least-common-multiple.md](math/greatest-common-divisor-and-least-common-multiple.md) |
| 040208 | 欧几里得算法 | 待审阅 | [euclidean-algorithm.md](math/euclidean-algorithm.md) |
| 070301 | 数论：扩展欧几里得算法 | 待审阅 | [extended-euclidean-algorithm.md](math/extended-euclidean-algorithm.md) |
| 070302 | 线性不定方程 | 待审阅 | [linear-diophantine-equations.md](math/linear-diophantine-equations.md) |

#### 专题：模运算与同余

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040209 | 快速幂 | 待审阅 | [fast-exponentiation.md](math/fast-exponentiation.md) |
| 060301 | 模运算 | 待审阅 | [modular-arithmetic.md](math/modular-arithmetic.md) |
| *060601e1 | 模运算：modint | 待审阅 | [mod-int.md](math/mod-int.md) |
| 060302 | 模快速幂 | 待审阅 | [modular-exponentiation.md](math/modular-exponentiation.md) |
| 070304 | 费马小定理 | 待审阅 | [fermat-little-theorem.md](math/fermat-little-theorem.md) |
| 080301 | 欧拉定理 | 待审阅 | [euler-theorem.md](math/euler-theorem.md) |
| 080302 | 扩展欧拉定理 | 待审阅 | [math/extended-euler-theorem.md](math/extended-euler-theorem.md) |
| 070303 | 线性同余方程 | 待审阅 | [linear-congruences.md](math/linear-congruences.md) |
| 070305 | 模逆元 | 待审阅 | [modular-inverse.md](math/modular-inverse.md) |
| *070305e1 | 模逆元：线性预处理 | 计划 | `math/linear-modular-inverses.md` |
| *070305e2 | 模逆元：批量求逆 | 计划 | `math/batch-modular-inverses.md` |

#### 专题：筛法与数论函数

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040206 | 埃拉托斯特尼筛法 | 待审阅 | [sieve-of-eratosthenes.md](math/sieve-of-eratosthenes.md) |
| 070307 | 筛法：欧拉筛（线性筛） | 待审阅 | [euler-sieve.md](math/euler-sieve.md) |
| *990550 | 筛法：分段筛 | 计划 | `math/segmented-sieve.md` |
| 060303 | 正因数个数 | 待审阅 | [divisor-count.md](math/divisor-count.md) |
| 060304 | 正因数和 | 待审阅 | [divisor-sum.md](math/divisor-sum.md) |
| 070308 | 欧拉函数 | 待审阅 | [euler-totient.md](math/euler-totient.md) |
| *070308e2 | 欧拉函数：筛法预处理 | 计划 | `math/euler-totient-sieve.md` |
| 070309 | 莫比乌斯函数 | 待审阅 | [mobius-function.md](math/mobius-function.md) |
| *070309e1 | 莫比乌斯反演 | 计划 | `math/mobius-inversion.md` |
| 090416 | 杜教筛 | 计划 | `math/du-jiao-sieve.md` |
| 090417 | Min_25 筛 | 计划 | `math/min-25-sieve.md` |

#### 专题：中国剩余定理

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 070310 | 数论：中国剩余定理（CRT） | 待审阅 | [chinese-remainder-theorem.md](math/chinese-remainder-theorem.md) |
| 070311 | 数论：扩展中国剩余定理（exCRT） | 待审阅 | [extended-chinese-remainder-theorem.md](math/extended-chinese-remainder-theorem.md) |

#### 专题：原根与离散对数

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 090401 | 原根与阶 | 计划 | `math/primitive-roots.md` |
| 090402 | BSGS 与离散对数 | 计划 | `math/discrete-logarithm.md` |
| *990506 | 离散对数：Pohlig-Hellman | 推迟 | `math/pohlig-hellman.md` |
| 090415 | 类欧几里得算法 | 计划 | `math/euclidean-like-algorithm.md` |

#### 专题：质数检测与整数分解

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *990521 | 质数检测：Miller–Rabin | 推迟 | `math/miller-rabin.md` |
| *990522 | 整数分解：Pollard–Rho | 推迟 | `math/pollard-rho.md` |

#### 专题：数论方程与二次剩余

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *990524 | 二次剩余与勒让德符号 | 推迟 | `math/quadratic-residues-legendre-symbol.md` |
| *990525 | 二次剩余：Cipolla 算法 | 推迟 | `math/cipolla.md` |
| *990526 | 佩尔方程 | 推迟 | `math/pell-equation.md` |

### 高精度整数

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 050501 | 高精度整数：加法、减法与乘法 | 待审阅 | [big-integer-addition-subtraction-multiplication.md](math/big-integer-addition-subtraction-multiplication.md) |
| *050501e1 | 高精度整数：负数 | 待审阅 | [big-integer-negative-numbers.md](math/big-integer-negative-numbers.md) |
| *050501e2 | 压位高精度整数 | 待审阅 | [packed-big-integer.md](math/packed-big-integer.md) |
| 050502 | 高精度整数：除以低精度整数 | 待审阅 | [big-integer-division-by-small-integer.md](math/big-integer-division-by-small-integer.md) |
| *050502e1 | 高精度整数：除以高精度整数 | 待审阅 | [big-integer-division-remainder.md](math/big-integer-division-remainder.md) |
| *050501e3 | 高精度整数：快速乘法 | 待审阅 | [big-integer-fast-multiplication.md](math/big-integer-fast-multiplication.md) |

### 组合数学

#### 专题：计数原理与二项式系数

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 050601 | 加法原理 | 待审阅 | [addition-principle.md](math/addition-principle.md) |
| 050602 | 乘法原理 | 待审阅 | [multiplication-principle.md](math/multiplication-principle.md) |
| 050604 | 排列数 | 待审阅 | [permutations-count.md](math/permutations-count.md) |
| 050605 | 组合数与二项式系数 | 待审阅 | [binomial-coefficients.md](math/binomial-coefficients.md) |
| 050606 | 二项式定理 | 待审阅 | [binomial-theorem.md](math/binomial-theorem.md) |
| 050607 | 杨辉三角 | 待审阅 | [pascal-triangle.md](math/pascal-triangle.md) |
| 070306 | 组合数：阶乘与逆元预处理 | 待审阅 | [binomial-coefficients-factorials.md](math/binomial-coefficients-factorials.md) |
| *050605e1 | 组合数：卢卡斯定理 | 计划 | `math/lucas-theorem.md` |
| 090403 | 扩展卢卡斯定理 | 计划 | `math/extended-lucas-theorem.md` |
| *990538 | 组合计数：抽屉原理 | 计划 | `math/pigeonhole-principle.md` |

#### 专题：容斥与反演

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *050603 | 容斥原理 | 待审阅 | [inclusion-exclusion.md](math/inclusion-exclusion.md) |
| 090406 | 最值容斥 | 计划 | `math/min-max-inclusion-exclusion.md` |
| 090407 | 二项式反演 | 计划 | `math/binomial-inversion.md` |

#### 专题：常见数列

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 080307 | 错位排列 | 待审阅 | [math/derangement-numbers.md](math/derangement-numbers.md) |
| 080308 | 整数划分 | 待审阅 | [math/integer-partitions.md](math/integer-partitions.md) |
| 080309 | Catalan 数 | 待审阅 | [math/catalan-numbers.md](math/catalan-numbers.md) |
| 080310 | Stirling 数 | 待审阅 | [math/stirling-numbers.md](math/stirling-numbers.md) |
| *990544 | 常见数列：Bell 数 | 计划 | `math/bell-numbers.md` |
| *990545 | 常见数列：Bernoulli 数 | 计划 | `math/bernoulli-numbers.md` |

#### 专题：群作用计数

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *990534 | 群论：置换 | 计划 | `math/permutations.md` |
| 090411 | Burnside 引理 | 计划 | `math/burnside-lemma.md` |
| 090412 | Polya 定理 | 计划 | `math/polya-enumeration.md` |

#### 专题：图与路径计数

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 090405 | 矩阵树定理 | 计划 | `math/matrix-tree-theorem.md` |
| *990530 | 欧拉回路计数：BEST 定理 | 推迟 | `math/best-theorem.md` |
| 090408 | Prufer 序列 | 计划 | `math/prufer-sequence.md` |
| *990532 | 路径计数：LGV 引理 | 推迟 | `math/lindstrom-gessel-viennot-lemma.md` |
| *990546 | 组合计数：杨表 | 计划 | `math/young-tableaux.md` |

#### 专题：生成函数

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 080315 | 生成函数：基础 | 待审阅 | [math/generating-functions.md](math/generating-functions.md) |

### 线性代数

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 060305 | 矩阵：表示 | 待审阅 | [matrix-representation.md](math/matrix-representation.md) |
| 060306 | 矩阵：加法与减法 | 待审阅 | [matrix-addition-subtraction.md](math/matrix-addition-subtraction.md) |
| 060307 | 矩阵：乘法 | 待审阅 | [matrix-multiplication.md](math/matrix-multiplication.md) |
| 060308 | 线性变换：矩阵表示 | 待审阅 | [linear-transformations-as-matrices.md](math/linear-transformations-as-matrices.md) |
| *060308e1 | 线性变换：齐次坐标与仿射变换 | 待审阅 | [homogeneous-coordinates-affine-transformations.md](math/homogeneous-coordinates-affine-transformations.md) |
| 060309 | 矩阵快速幂 | 待审阅 | [matrix-exponentiation.md](math/matrix-exponentiation.md) |
| 080303 | 异或线性基 | 待审阅 | [math/xor-linear-basis.md](math/xor-linear-basis.md) |
| *080303e1 | 前缀线性基 | 推迟 | `math/prefix-xor-linear-basis.md` |
| 080304 | 高斯消元 | 待审阅 | [math/gaussian-elimination.md](math/gaussian-elimination.md) |
| 080305 | 线性代数：行列式 | 待审阅 | [math/determinant.md](math/determinant.md) |
| 090404 | 矩阵求逆 | 计划 | `math/matrix-inverse.md` |

### 概率与期望

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 070505 | 概率与期望基础 | 待审阅 | [probability-expectation.md](math/probability-expectation.md) |

### 博弈论

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 080306 | Nim、SG 函数与基础博弈论 | 待审阅 | [math/nim-sg-game-theory.md](math/nim-sg-game-theory.md) |

### 多项式与形式幂级数

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 080311 | 多项式：表示、加法与减法 | 待审阅 | [math/polynomial-representation-addition-subtraction.md](math/polynomial-representation-addition-subtraction.md) |
| 080312 | 多项式：卷积与朴素乘法 | 待审阅 | [math/convolution-naive-multiplication.md](math/convolution-naive-multiplication.md) |
| 080313 | 多项式：FFT | 待审阅 | [math/fft.md](math/fft.md) |
| 080314 | 多项式：NTT | 待审阅 | [math/ntt.md](math/ntt.md) |
| *050501e3 | 高精度整数：快速乘法 | 待审阅 | [big-integer-fast-multiplication.md](math/big-integer-fast-multiplication.md) |
| *990517 | 多项式：除法与余数 | 推迟 | `math/polynomial-division-remainder.md` |
| *990518 | 多项式：多点求值 | 推迟 | `math/multipoint-evaluation.md` |
| 090409 | 拉格朗日插值 | 计划 | `math/lagrange-interpolation.md` |
| *990511 | 形式幂级数：形式导数 | 推迟 | `math/formal-derivative.md` |
| *990512 | 形式幂级数：形式积分 | 推迟 | `math/formal-integral.md` |
| *990510 | 形式幂级数：求逆 | 推迟 | `math/formal-power-series-inverse.md` |
| *990513 | 形式幂级数：对数 | 推迟 | `math/formal-power-series-logarithm.md` |
| *990514 | 形式幂级数：指数 | 推迟 | `math/formal-power-series-exponential.md` |
| *990515 | 形式幂级数：平方根 | 推迟 | `math/formal-power-series-square-root.md` |
| *990516 | 形式幂级数：幂 | 推迟 | `math/formal-power-series-power.md` |
| 080315 | 生成函数：基础 | 待审阅 | [math/generating-functions.md](math/generating-functions.md) |
| 090418 | 线性递推：Berlekamp-Massey | 计划 | `math/berlekamp-massey.md` |

### 集合幂级数

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 090410 | FWT 与 FMT | 计划 | `math/fast-subset-transforms.md` |

### 数值方法

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 090413 | Simpson 公式 | 计划 | `math/simpson-rule.md` |
| 090414 | 自适应 Simpson | 计划 | `math/adaptive-simpson.md` |

### 优化

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 090419 | 线性规划与单纯形法 | 计划 | `math/linear-programming.md` |

## 06 计算几何

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 070401 | 坐标、点、向量与精度 | 待审阅 | [points-vectors-precision.md](computational-geometry/points-vectors-precision.md) |
| 070402 | 点积、叉积与方向判断 | 待审阅 | [dot-cross-orientation.md](computational-geometry/dot-cross-orientation.md) |
| 070403 | 直线、线段与相交判定 | 待审阅 | [lines-segments-intersections.md](computational-geometry/lines-segments-intersections.md) |
| 070404 | 多边形面积与点的位置 | 待审阅 | [polygon-area-point-location.md](computational-geometry/polygon-area-point-location.md) |
| 070405 | 凸包 | 待审阅 | [convex-hull.md](computational-geometry/convex-hull.md) |
| 080502 | 圆：位置关系与交点 | 待审阅 | [computational-geometry/circles.md](computational-geometry/circles.md) |
| 090702 | 旋转卡壳 | 计划 | `computational-geometry/rotating-calipers.md` |
| *990603 | 几何扫描线 | 计划 | `computational-geometry/geometric-sweep-line.md` |
| *990604 | 最近点对 | 计划 | `computational-geometry/closest-pair-of-points.md` |
| 090701 | 凸多边形点包含 | 计划 | `computational-geometry/point-in-convex-polygon.md` |
| *990606 | 凸多边形：切线与极值查询 | 推迟 | `computational-geometry/convex-polygon-tangents-extrema.md` |
| 090703 | 半平面交 | 计划 | `computational-geometry/half-plane-intersection.md` |
| *990608 | 闵可夫斯基和 | 推迟 | `computational-geometry/minkowski-sum.md` |
| 080501 | 极角排序 | 待审阅 | [computational-geometry/polar-angle-sort.md](computational-geometry/polar-angle-sort.md) |
| 080503 | 圆：切线 | 待审阅 | [computational-geometry/circle-tangents.md](computational-geometry/circle-tangents.md) |
| 090704 | 圆面积交与面积并 | 计划 | `computational-geometry/circle-area-intersection-union.md` |
| *990612 | 三维计算几何 | 推迟 | `computational-geometry/three-dimensional-geometry.md` |
| 090705 | 平面点定位 | 计划 | `computational-geometry/point-location.md` |
| 090706 | 最小圆覆盖 | 计划 | `computational-geometry/minimum-enclosing-circle.md` |
| *990615 | Voronoi 图 | 推迟 | `computational-geometry/voronoi-diagram.md` |
| *990616 | 反演几何 | 推迟 | `computational-geometry/inversive-geometry.md` |
| *990617 | Pick 定理 | 计划 | `computational-geometry/pick-theorem.md` |

## 07 动态规划

### 常用

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040701 | 动态规划的状态与转移 | 待审阅 | [dp-state-transition.md](dynamic-programming/dp-state-transition.md) |
| 040702 | 数字三角形 | 待审阅 | [number-triangle.md](dynamic-programming/number-triangle.md) |
| 040703 | 最大子段和 | 待审阅 | [maximum-subarray-sum.md](dynamic-programming/maximum-subarray-sum.md) |
| 040704 | 最长上升子序列 | 待审阅 | [longest-increasing-subsequence.md](dynamic-programming/longest-increasing-subsequence.md) |
| 040705 | 最长公共子序列 | 待审阅 | [longest-common-subsequence.md](dynamic-programming/longest-common-subsequence.md) |
| 040801 | 0-1 背包 | 待审阅 | [zero-one-knapsack.md](dynamic-programming/zero-one-knapsack.md) |
| 040802 | 完全背包 | 待审阅 | [complete-knapsack.md](dynamic-programming/complete-knapsack.md) |
| 040803 | 多重背包 | 待审阅 | [multiple-knapsack.md](dynamic-programming/multiple-knapsack.md) |
| 050701 | 区间 DP | 待审阅 | [interval-dp.md](dynamic-programming/interval-dp.md) |

### 基础模型

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040701 | 动态规划的状态与转移 | 待审阅 | [dp-state-transition.md](dynamic-programming/dp-state-transition.md) |
| *990704 | 记忆化搜索 | 计划 | `dynamic-programming/memoized-search.md` |
| 040702 | 数字三角形 | 待审阅 | [number-triangle.md](dynamic-programming/number-triangle.md) |

### 序列 DP

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040703 | 最大子段和 | 待审阅 | [maximum-subarray-sum.md](dynamic-programming/maximum-subarray-sum.md) |
| 040704 | 最长上升子序列 | 待审阅 | [longest-increasing-subsequence.md](dynamic-programming/longest-increasing-subsequence.md) |
| *040704e1 | 最长上升子序列：$O(n\log n)$ 优化 | 待审阅 | [lis-n-log-n.md](dynamic-programming/lis-n-log-n.md) |
| 040705 | 最长公共子序列 | 待审阅 | [longest-common-subsequence.md](dynamic-programming/longest-common-subsequence.md) |

### 背包 DP

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040801 | 0-1 背包 | 待审阅 | [zero-one-knapsack.md](dynamic-programming/zero-one-knapsack.md) |
| 040802 | 完全背包 | 待审阅 | [complete-knapsack.md](dynamic-programming/complete-knapsack.md) |
| 040803 | 多重背包 | 待审阅 | [multiple-knapsack.md](dynamic-programming/multiple-knapsack.md) |
| *990705 | 分组背包 | 计划 | `dynamic-programming/group-knapsack.md` |
| *990706 | 混合背包 | 计划 | `dynamic-programming/mixed-knapsack.md` |
| *990707 | 多维背包 | 计划 | `dynamic-programming/multidimensional-knapsack.md` |
| *990708 | 树上背包 | 计划 | `dynamic-programming/tree-knapsack.md` |

### 区间 DP

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 050701 | 区间 DP | 待审阅 | [interval-dp.md](dynamic-programming/interval-dp.md) |

### 树形 DP

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 070502 | 树形 DP | 待审阅 | [tree-dp.md](dynamic-programming/tree-dp.md) |
| *990708 | 树上背包 | 计划 | `dynamic-programming/tree-knapsack.md` |

### 状态压缩 DP

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 070503 | 状态压缩 DP | 待审阅 | [bitmask-dp.md](dynamic-programming/bitmask-dp.md) |
| *990709 | 轮廓线 DP | 计划 | `dynamic-programming/profile-dp.md` |
| *990710 | 插头 DP | 推迟 | `dynamic-programming/plug-dp.md` |

### 数位 DP

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 070504 | 数位 DP | 待审阅 | [digit-dp.md](dynamic-programming/digit-dp.md) |

### 图与自动机 DP

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 070501 | DAG 上的 DP | 待审阅 | [dag-dp.md](dynamic-programming/dag-dp.md) |
| 090501 | 自动机 DP | 计划 | `dynamic-programming/automaton-dp.md` |

### 计数 DP

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *990711 | 括号序列 DP | 计划 | `dynamic-programming/bracket-sequence-dp.md` |
| *990713 | 划分 DP | 推迟 | `dynamic-programming/partition-dp.md` |

### 概率与期望 DP

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 070506 | 概率与期望 DP | 待审阅 | [probability-expectation-dp.md](dynamic-programming/probability-expectation-dp.md) |

### DP 优化

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 070507 | 单调队列优化 | 待审阅 | [monotone-queue-optimization.md](dynamic-programming/monotone-queue-optimization.md) |
| 070508 | 单调栈优化 | 待审阅 | [dynamic-programming/monotone-stack-optimization.md](dynamic-programming/monotone-stack-optimization.md) |
| 070509 | 斜率优化 | 待审阅 | [dynamic-programming/convex-hull-trick.md](dynamic-programming/convex-hull-trick.md) |
| 090502 | 决策单调性 | 计划 | `dynamic-programming/decision-monotonicity.md` |
| 090503 | 分治优化 | 计划 | `dynamic-programming/divide-conquer-optimization.md` |
| 090504 | 四边形不等式优化 | 计划 | `dynamic-programming/quadrangle-inequality-optimization.md` |
| *990703 | 分段线性凸函数维护 | 推迟 | `dynamic-programming/slope-trick.md` |

### 动态 DP

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *990714 | 动态 DP | 推迟 | `dynamic-programming/dynamic-dp.md` |

## 08 字符串

### 常用

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040901 | 字符串的基本概念 | 待审阅 | [string-concepts.md](strings/string-concepts.md) |
| 040903 | 朴素字符串匹配 | 待审阅 | [naive-pattern-matching.md](strings/naive-pattern-matching.md) |
| 060701 | 字符串哈希 | 待审阅 | [rolling-hash.md](strings/rolling-hash.md) |
| 060702 | KMP 与前缀函数 | 待审阅 | [kmp-prefix-function.md](strings/kmp-prefix-function.md) |
| *060703 | Z 函数 | 待审阅 | [z-function.md](strings/z-function.md) |
| 060704 | Trie | 待审阅 | [trie.md](strings/trie.md) |
| 060705 | 字符串构造 | 待审阅 | [strings/string-construction.md](strings/string-construction.md) |
| 080401 | AC 自动机 | 待审阅 | [strings/aho-corasick.md](strings/aho-corasick.md) |
| 080402 | Manacher | 待审阅 | [strings/manacher.md](strings/manacher.md) |
| 090601 | 后缀数组 | 计划 | `strings/suffix-array.md` |
| 090602 | 后缀自动机 | 计划 | `strings/suffix-automaton.md` |

### 字符串基础

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040901 | 字符串的基本概念 | 待审阅 | [string-concepts.md](strings/string-concepts.md) |
| 040902 | 字符串比较与字典序 | 待审阅 | [comparison-and-lexicographic-order.md](strings/comparison-and-lexicographic-order.md) |

### 字符串构造

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 060705 | 字符串构造 | 待审阅 | [strings/string-construction.md](strings/string-construction.md) |

### 字符串哈希

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 060701 | 字符串哈希 | 待审阅 | [rolling-hash.md](strings/rolling-hash.md) |

### 模式匹配

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 040903 | 朴素字符串匹配 | 待审阅 | [naive-pattern-matching.md](strings/naive-pattern-matching.md) |
| 060702 | KMP 与前缀函数 | 待审阅 | [kmp-prefix-function.md](strings/kmp-prefix-function.md) |
| *060703 | Z 函数 | 待审阅 | [z-function.md](strings/z-function.md) |

### 前缀结构

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 060704 | Trie | 待审阅 | [trie.md](strings/trie.md) |
| 080401 | AC 自动机 | 待审阅 | [strings/aho-corasick.md](strings/aho-corasick.md) |

### 回文结构

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 080402 | Manacher | 待审阅 | [strings/manacher.md](strings/manacher.md) |
| 090603 | 回文自动机 | 计划 | `strings/palindromic-tree.md` |

### 后缀结构

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 090601 | 后缀数组 | 计划 | `strings/suffix-array.md` |
| 090602 | 后缀自动机 | 计划 | `strings/suffix-automaton.md` |
| *990806 | 后缀树 | 推迟 | `strings/suffix-tree.md` |

### 子串问题

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| 090604 | 本质不同子串计数 | 计划 | `strings/distinct-substring-counting.md` |
| 090605 | 字典序第 k 小子串 | 计划 | `strings/kth-lexicographic-substring.md` |
| 090606 | 子串出现次数 | 计划 | `strings/substring-occurrence-counting.md` |
| 090607 | 最长重复子串 | 计划 | `strings/longest-repeated-substring.md` |
| 090608 | 最长公共子串 | 计划 | `strings/longest-common-substring.md` |

### 字符串表示与分解

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *990807 | 最小表示法 | 推迟 | `strings/minimum-representation.md` |
| *990808 | Lyndon 分解 | 推迟 | `strings/lyndon-factorization.md` |

## 09 其他

### 编码

| ID | 知识点 | 状态 | 文件 |
| --- | --- | --- | --- |
| *030204e1 | 格雷码 | 待审阅 | [gray-code.md](other/gray-code.md) |
| 050203 | 哈夫曼编码 | 待审阅 | [huffman-coding.md](other/huffman-coding.md) |
