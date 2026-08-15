# vector

> 最近修订：2026-08-16 09:36 +10:00（未审阅）

[一维数组](one-dimensional-arrays.md) 需要在声明时决定容量，并由另一个变量记录
当前实际使用了多少格。题目的元素数量经常要到运行时才能读入；筛选、搜索和建图
时，结果数量甚至要到处理过程中才逐渐确定。

`vector` 保存一段连续的同类型元素，并在需要时自动调整长度。它保留数组按下标
快速访问的能力，又不要求手动管理当前长度，因此是竞赛代码中最常用的序列容器。

## 元素类型

`vector<T>` 中的 `T` 是元素类型：

```cpp
vector<int> values;
```

这里声明了一个保存 `int` 的空 `vector`。元素也可以是已经学过的其他类型：

```cpp
vector<string> names;
```

同一个 `vector` 中的所有元素类型相同。它们在内存中连续存放，因此可以通过下标快速访问任意位置。

## 初始长度

只声明类型时，初始长度是 $0$：

```cpp
vector<int> values;
```

元素数量在运行时已经知道时，可以把长度写入圆括号：

```cpp
int n;
scanf("%d", &n);
vector<int> values(n);
```

这会直接建立 $n$ 个 `int` 元素，并将它们值初始化为 $0$。也可以为全部元素指定同一个初始值：

```cpp
vector<int> distance(n, -1);
```

花括号表示直接列出各个元素：

```cpp
vector<int> values = {3, 1, 4, 1, 5};
```

圆括号 `(5, -1)` 表示五个值为 `-1` 的元素，花括号 `{5, -1}` 则表示两个元素 `5,-1`。两种形式不能混淆。

## 长度与下标

`size()` 返回当前元素数量，`empty()` 判断是否没有元素：

```cpp
int n = values.size();

if (values.empty()) {
    printf("empty\n");
}
```

`vector` 是标准库原生容器，使用 0-based 下标。长度为 $n$ 时，有效下标是 `0..n-1`：

```cpp
for (int i = 0; i < n; i++) {
    printf("%d\n", values[i]);
}
```

`operator[]` 不检查越界。非空 `vector` 可以用 `front()` 和 `back()` 访问首尾元素：

```cpp
int first = values.front();
int last = values.back();
```

它们返回元素的引用，也可以直接修改。空 `vector` 没有首尾元素，不能调用这两个接口。

## 自定义算法中的 1-based 下标

直接教学标准库接口时保留 `vector` 原生的 0-based 下标；但本书自定义的数组、图和数据结构通常与题目编号一致，使用 1-based 下标并预留 `+5` 空间：

```cpp
int n;
scanf("%d", &n);
vector<int> a(n + 5);

for (int i = 1; i <= n; i++) {
    scanf("%d", &a[i]);
}
```

这里的逻辑元素仍然只有 `a[1]..a[n]`。`a.size()` 得到的是实际分配的 `n + 5` 格，包含没有参与问题的第 `0` 格和尾部余量，不能代替逻辑长度 `n`。

这不是修改 `vector` 的接口约定，而是把标准容器当作自定义算法的存储空间。只要在同一段代码中明确保存 `n` 并始终遵守一种区间约定，就不会产生歧义。

## 嵌套 vector

元素本身也可以是 `vector`。运行时读入行数 `n` 和列数 `m` 后，可以建立二维表格：

```cpp
vector<vector<int>> grid(n, vector<int>(m, 0));
```

外层包含 $n$ 个元素，每个元素又是一个包含 $m$ 个零的 `vector<int>`。因此 `grid[i][j]` 表示第 `i` 行第 `j` 列，两层都使用标准库原生的 0-based 下标。

每一行都是独立的 `vector`，所以各行也可以具有不同长度。这很适合邻接表等本来
就不规则的结构；普通矩形表格还可以根据空间和传参需要改用一维 `vector`。
多种二维存储方式的区别见
[多维数组的布局与参数传递](multidimensional-array-layout-and-parameters.md)。

## 在末尾增加与删除

结果数量逐渐产生时，从空 `vector` 开始，用 `push_back(value)` 把新元素放到末尾：

```cpp
vector<int> answer;
answer.push_back(3);
answer.push_back(5);
```

此时 `answer` 依次包含 `3,5`，长度从 $0$ 变成 $2$。

`pop_back()` 删除最后一个元素：

```cpp
if (!answer.empty()) {
    answer.pop_back();
}
```

它不返回被删除的值，而且不能用于空 `vector`。需要保存该值时，先读取 `back()`，再调用 `pop_back()`。

`clear()` 一次删除全部元素，使 `size()` 变成 $0$：

```cpp
answer.clear();
```

它不保证立即归还已经申请的容量。竞赛代码通常只关心元素已经全部删除，不需要主动压缩内存。

连续执行 $n$ 次 `push_back` 的总时间是 $O(n)$。虽然少数某一次扩容需要搬动已有元素，但平均到每次追加仍是常数时间，这称为均摊 $O(1)$。

## size 与 capacity

`size()` 是当前真实存在、可以访问的元素数量。为了避免每次追加都重新申请内存，`vector` 内部可能提前保留更多位置；`capacity()` 表示不再次申请内存时最多能够容纳的元素数量：

```cpp
int n = values.size();
int capacity = values.capacity();
```

只有 `0..size()-1` 是已经存在的元素。`capacity()` 比 `size()` 大，不代表可以访问多出的那些位置。

`resize(new_size)` 真正改变元素数量：

```cpp
values.resize(10);
```

长度增大时，新增加的 `int` 值初始化为 $0$；长度缩小时，末尾多出的元素被删除。

`reserve(new_capacity)` 只预留存储空间，不建立新元素：

```cpp
vector<int> values;
values.reserve(1000);
```

这时 `values.size()` 仍然是 $0$，所以 `values[0]` 仍然越界。已经知道将要追加很多元素时，`reserve` 可以减少扩容次数；普通题目不需要为了微小常数到处使用它。

## 范围遍历与引用

只需要依次读取每个元素时，可以使用范围 `for`：

```cpp
for (int value : values) {
    printf("%d\n", value);
}
```

这里的 `value` 是当前元素的副本，修改它不会改变 `vector`。需要修改原元素时使用引用：

```cpp
for (int& value : values) {
    value *= 2;
}
```

元素是 `string`、`pair` 等对象，只读遍历又不希望复制时，使用 `const` 引用：

```cpp
for (const string& name : names) {
    cout << name << '\n';
}
```

需要下标、相邻位置或闭区间边界时，普通下标循环通常更清楚；范围 `for` 不会同时提供当前位置。

## begin 与 end

标准库算法需要用两个位置描述处理范围。`begin()` 表示第一个元素的位置，`end()` 表示最后一个元素之后的位置：

```text
begin                              end
  |                                 |
  v                                 v
[ a[0], a[1], a[2], ..., a[n - 1] )
```

这种位置对象称为迭代器。`[values.begin(), values.end())` 恰好覆盖全部元素，
左端包含、右端不包含；`end()` 不指向元素，不能读取它。

可以像移动一个位置一样使用迭代器：

```cpp
for (auto it = values.begin(); it != values.end(); it++) {
    printf("%d\n", *it);
}
```

`*it` 表示当前位置的元素。普通遍历优先使用下标或范围 `for`；现在引入
`begin()` 和 `end()`，主要是因为 [sort](sorting.md) 中的
`sort(values.begin(), values.end())` 会用它们准确表示排序范围。

## 插入与删除

`insert` 在指定迭代器之前插入元素，`erase` 删除指定位置：

```cpp
values.insert(values.begin() + i, x);
values.erase(values.begin() + i);
```

这里 `i` 是 0-based 位置。中间插入或删除后，后面的元素必须整体移动，所以最坏时间复杂度是 $O(n)$。若算法反复在序列开头或中间做这些操作，`vector` 通常不是合适的结构。

删除一个左闭右开区间写作：

```cpp
values.erase(values.begin() + l, values.begin() + r);
```

这会删除下标 `[l,r)` 中的元素。

遍历过程中删除当前元素时，旧迭代器已经失效。`erase` 会返回删除后下一个元素的新位置，应当用它继续：

```cpp
for (auto it = values.begin(); it != values.end();) {
    if (*it < 0) {
        it = values.erase(it);
    } else {
        it++;
    }
}
```

这样可以安全删除全部负数，也不会在删除后跳过紧邻的下一个元素。

安全不代表高效：每次 `erase` 都可能移动后缀，连续删除很多元素最坏会达到 $O(n^2)$。若任务本质上是筛选，像本篇完整代码一样把保留元素追加到另一个 `vector`，可以在 $O(n)$ 时间内完成。

## 扩容与位置失效

`vector` 的元素连续存放。容量不足时继续 `push_back`，它会申请一段更大的连续空间，再把原元素搬过去。因此，扩容后以前保存的迭代器、元素指针和元素引用都不能继续使用。

`reserve`、扩大 `resize` 和 `insert` 也可能触发扩容；一旦重新分配，全部旧位置失效。没有扩容时，中间插入会让插入位置及其后的旧位置失效，`erase` 会让删除位置及其后的旧位置失效。

竞赛代码中最简单可靠的规则是：修改 `vector` 长度以后，不继续保存或使用修改前取得的迭代器、指针和引用；需要位置时重新通过下标、`begin()` 或 `end()` 取得。上一节在删除循环中立即接收 `erase` 返回的新位置，就是这条规则的实际写法。

## 复制与函数参数

`vector` 可以整体复制，但复制 $n$ 个元素需要 $O(n)$ 时间和空间：

```cpp
vector<int> copy = values;
```

相同元素类型的 `vector` 也可以使用 `==` 比较全部内容，并使用 `<` 等关系运算符按字典序比较。

函数只读一个 `vector` 时，使用 `const` 引用，避免无意义的整体复制：

```cpp
ll sum(const vector<int>& values) {
    ll result = 0;
    for (int value : values) {
        result += value;
    }
    return result;
}
```

函数需要修改原容器时使用普通引用：

```cpp
void replace_negative_with_zero(vector<int>& values) {
    for (int& value : values) {
        if (value < 0) {
            value = 0;
        }
    }
}
```

函数产生一整个新序列时，可以直接按值返回 `vector`；不需要为了避免复制改成输出引用参数。

## 完整代码

下面的程序读入非负整数 $n$ 和随后的 $n$ 个整数，按照原顺序保留其中的正数。保留下来的数量事先未知，因此从空 `positive` 开始，每找到一个正数就追加到末尾。

```cpp
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int n;
    scanf("%d", &n);

    vector<int> values(n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &values[i]);
    }

    vector<int> positive;
    for (int value : values) {
        if (value > 0) {
            positive.push_back(value);
        }
    }

    int count = positive.size();
    printf("%d\n", count);
    for (int i = 0; i < count; i++) {
        if (i > 0) {
            printf(" ");
        }
        printf("%d", positive[i]);
    }
    printf("\n");
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
8
3 -1 4 0 5 -9 2 6
```

输出：

```text
5
3 4 5 2 6
```

读入和筛选各扫描一次元素，时间复杂度是 $O(n)$。`values` 和最坏包含全部输入的 `positive` 共使用 $O(n)$ 空间。

## 常用操作复杂度

| 操作 | 时间复杂度 |
| --- | ---: |
| `size()`、`empty()`、下标、`front()`、`back()` | $O(1)$ |
| `push_back()` | 均摊 $O(1)$ |
| `pop_back()` | $O(1)$ |
| 中间 `insert` 或 `erase` | $O(n)$ |
| 整体复制 | $O(n)$ |

这些复杂度来自“连续存储”：下标能直接定位，但中间增删需要移动后缀。下一阶段会从数据结构角度重新比较数组、链表、栈和队列的操作差异。

## 基础练习

1. 读入运行时长度 `n`，建立 `vector<int> values(n)` 并输出全部元素。
2. 分别写出“五个值为 `-1` 的元素”和“两个元素 `5,-1`”的初始化形式。
3. 从空 `vector` 开始连续追加整数，再按相反顺序用 `back()` 和 `pop_back()` 删除。
4. 使用范围 `for` 分别复制读取、引用修改一组整数，比较两次结果。
5. 使用 `resize` 和 `reserve` 分别操作空 `vector`，检查每次操作后的 `size()`。
6. 安全删除 `vector` 中的全部负数，不跳过相邻元素。
7. 使用 `vector<int> a(n + 5)` 保存 1-based 题目数组，并说明 `n` 与 `a.size()` 为什么不同。

## 需要记住什么

1. `vector<T>` 解决了内置数组的什么长度限制？
2. `vector<int> a(n)`、`vector<int> a(n, -1)` 和 `vector<int> a = {n, -1}` 分别建立什么内容？
3. `size()`、`capacity()`、`resize()` 和 `reserve()` 分别改变什么？
4. `push_back()` 与 `pop_back()` 怎样改变末尾？为什么不能对空容器调用 `pop_back()`？
5. 范围 `for` 中的值、普通引用和 `const` 引用有什么区别？
6. `begin()` 与 `end()` 分别表示哪里？为什么不能读取 `end()`？
7. 为什么 `vector` 中间插入和删除是 $O(n)$？遍历中删除当前元素时怎样继续？
8. 哪些改变长度的操作可能使旧迭代器、指针和引用失效？最简单的安全规则是什么？
9. 自定义 1-based 算法使用 `vector<int> a(n + 5)` 时，哪些位置是逻辑元素？
10. 为什么只读的 `vector` 函数参数通常使用 `const` 引用？

`vector` 的增长倍率、内存分配器、异常保证和 `vector<bool>` 的特殊压位实现不属于本篇的竞赛基础用法，不要求理解或记忆。
