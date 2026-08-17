# `deque`

> 最近修订：2026-08-17 10:11 +10:00（未审阅）

[双端队列](../algorithm-basics/deque.md) 已经说明两端操作的抽象语义与循环数组实现。[vector](vector.md) 能在末尾高效增加和删除元素，但在开头插入或删除时，后面的元素通常需要整体移动。某些算法需要同时从序列两端加入、查看和删除，标准库 `deque` 正是为这组操作提供的序列容器。

`deque` 是 double-ended queue 的缩写，中文称为双端队列。它不是 [`queue`](queue.md) 的另一种写法：`deque` 可以遍历、随机访问并修改两端，`queue` 则是故意只暴露先进先出接口的容器适配器。

## 声明一个 deque

`deque` 是类模板，尖括号中填写元素类型：

```cpp
deque<int> values;
```

这会建立一个保存 `int` 的空 `deque`。也可以保存其他已经学过的类型：

```cpp
deque<char> characters;
deque<string> messages;
```

标准头文件是 `<deque>`。本仓库完整竞赛代码使用 `#include <bits/stdc++.h>`，不需要另外列出。

已知初始长度时，可以像 `vector` 一样建立并初始化元素：

```cpp
deque<int> a(n);
deque<int> distance(n, -1);
deque<int> digits = {1, 2, 3};
```

圆括号 `(n, -1)` 表示 $n$ 个值为 `-1` 的元素，花括号 `{1, 2, 3}` 直接列出三个元素。

## 两端加入

在末尾加入元素使用：

```cpp
values.push_back(30);
```

在开头加入元素使用：

```cpp
values.push_front(20);
```

再执行：

```cpp
values.push_front(10);
values.push_back(40);
```

容器内容从前到后是：

```text
10 20 30 40
```

`push_front` 与 `push_back` 都是 $O(1)$。这正是 `deque` 相对 `vector` 最重要的新能力：在开头增加元素不需要移动整个已有序列。

## 两端访问

非空 `deque` 使用 `front()` 访问第一个元素，使用 `back()` 访问最后一个元素：

```cpp
int first = values.front();
int last = values.back();
```

二者都返回元素引用，也可以直接修改：

```cpp
values.front() = 5;
values.back() = 50;
```

空容器没有首尾元素，不能调用 `front()` 或 `back()`。题面不保证非空时，先判断：

```cpp
if (!values.empty()) {
    printf("%d %d\n", values.front(), values.back());
}
```

## 两端删除

删除开头元素使用：

```cpp
values.pop_front();
```

删除末尾元素使用：

```cpp
values.pop_back();
```

两个接口都不返回被删除的值。需要保留时先读取，再删除：

```cpp
int first = values.front();
values.pop_front();

int last = values.back();
values.pop_back();
```

`pop_front()` 与 `pop_back()` 都要求容器非空，并且时间复杂度都是 $O(1)$。

## 长度与清空

`size()` 返回当前元素数量，`empty()` 判断是否没有元素：

```cpp
int n = values.size();
bool no_value = values.empty();
```

竞赛题保证长度能放进 `int` 时，本书直接保存为 `int`。只判断有没有元素时优先使用语义更直接的 `empty()`。

删除全部元素使用：

```cpp
values.clear();
```

清空后 `values.empty()` 为真，`values.size()` 为 `0`。

## 下标与遍历

`deque` 是标准库原生序列容器，使用 0-based 下标。长度为 $n$ 时，有效下标是 `0..n-1`：

```cpp
int value = values[i];
```

下标访问任意元素是 $O(1)$。`operator[]` 不检查越界；只有已经保证 `0 <= i && i < values.size()` 时才能访问。

可以使用普通下标循环：

```cpp
int n = values.size();
for (int i = 0; i < n; i++) {
    printf("%d\n", values[i]);
}
```

也可以使用范围 `for`：

```cpp
for (int value : values) {
    printf("%d\n", value);
}
```

需要修改原元素时使用引用：

```cpp
for (int& value : values) {
    value *= 2;
}
```

`begin()` 与 `end()` 同样分别表示第一个元素和最后一个元素之后的位置，所以标准库算法可以直接使用：

```cpp
sort(values.begin(), values.end());
```

支持随机访问不代表元素必须连续存放；`sort` 依赖随机访问迭代器，不要求得到一整段原始数组内存。

## 非连续存储

`vector` 保证全部元素位于一段连续内存中。`deque` 为了在两端高效扩展，通常把元素放在若干存储块中，再维护定位这些块的信息。

标准只保证下标与迭代器能够在 $O(1)$ 时间定位元素，不保证相邻逻辑元素的地址也属于同一整段数组。因此不能把：

```cpp
&values[0]
```

当成一个包含全部 `deque` 元素的连续数组起点。在本书使用的 C++17 中，也没有与 `vector::data()` 对应的 `deque::data()` 接口。

需要向只接受连续内存的 C 接口传递数据，或常数性能主要来自连续扫描时，通常优先使用 `vector`。需要频繁操作两端时，`deque` 的接口更符合问题本身。

## 没有 capacity 与 reserve

`vector` 通过 `capacity()` 和 `reserve()` 管理一段连续容量。`deque` 不需要保留同样的一整段连续空间，因此不提供这两个接口：

```cpp
// values.capacity();  // 不存在
// values.reserve(n);  // 不存在
```

只需要通过 `size()` 了解真实元素数量。不要为了模仿 `vector` 给 `deque` 寻找不存在的容量操作。

## 中间插入与删除

`deque` 也提供迭代器位置上的 `insert` 与 `erase`：

```cpp
values.insert(values.begin() + i, x);
values.erase(values.begin() + i);
```

但在中间改变序列需要移动靠近一端的一批元素，时间复杂度是 $O(n)$。`deque` 的核心优势只在两端，不代表任意位置插入删除都成为 $O(1)$。

遍历中删除当前元素时，与其他标准序列容器一样接收 `erase` 返回的新位置：

```cpp
for (auto it = values.begin(); it != values.end();) {
    if (*it < 0) {
        it = values.erase(it);
    } else {
        it++;
    }
}
```

这种写法避免继续使用已经被删除的位置，但连续中间删除仍可能达到 $O(n^2)$。任务只是筛选时，重新建立结果序列通常更直接。

## 修改后的旧位置

`deque` 的迭代器、指针和引用失效规则会随具体操作和位置变化，不适合在基础文章中背完整表格。

竞赛代码采用一条简单安全规则：执行 `push_front`、`push_back`、`pop_front`、`pop_back`、`insert`、`erase` 或 `clear` 后，不继续使用修改前保存的迭代器、指针和引用；需要时重新通过容器取得位置或复制值。

这条规则可能比标准提供的某些具体保证更保守，但能避免代码依赖难以核对的细节。尤其不能在删除元素后继续使用指向该元素的引用。

## 与 vector 比较

| 需求 | `vector` | `deque` |
| --- | --- | --- |
| 末尾加入、删除 | 均摊 $O(1)$ / $O(1)$ | $O(1)$ / $O(1)$ |
| 开头加入、删除 | $O(n)$ | $O(1)$ |
| 下标访问 | $O(1)$ | $O(1)$ |
| 连续内存 | 保证 | 不保证 |
| `reserve` | 支持 | 不支持 |
| 中间插入、删除 | $O(n)$ | $O(n)$ |

普通动态数组优先使用 `vector`，它更常见、连续且通常具有更好的扫描局部性。只有算法真正需要频繁操作开头，或同时操作两端时，再选择 `deque`。

不要仅凭“`deque` 支持的操作更多”就把它当成更高级的默认容器。接口选择应当对应主要操作。

## 与 stack、queue 的关系

`deque` 本身暴露两端操作、下标和迭代器。`stack`、`queue` 则把一个底层容器限制成更明确的访问规则：

- `stack` 只在同一端加入、查看和删除；
- `queue` 在末端加入，在开头查看和删除。

标准库的 `stack<T>` 与 `queue<T>` 默认都使用 `deque<T>` 作为底层容器，因为 `deque` 能以 $O(1)$ 支持它们需要的端点操作。

若算法只需要后进先出或先进先出，使用适配器可以让语义更清楚；只有确实需要两端都开放或随机访问时，才直接使用 `deque`。

## 操作序列程序

下面用九类操作集中展示接口：

| 类型 | 输入 | 行为 |
| ---: | --- | --- |
| 1 | `1 value` | `push_front(value)` |
| 2 | `2 value` | `push_back(value)` |
| 3 | `3` | 输出并删除开头元素 |
| 4 | `4` | 输出并删除末尾元素 |
| 5 | `5` | 输出开头元素但不删除 |
| 6 | `6` | 输出末尾元素但不删除 |
| 7 | `7 index` | 输出 0-based 下标 `index` 的元素 |
| 8 | `8` | 输出元素数量 |
| 9 | `9` | 空容器输出 `1`，否则输出 `0` |

输入保证类型 `3..6` 出现时容器非空，类型 `7` 的下标合法。

## 完整代码

```cpp
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int q;
    scanf("%d", &q);

    deque<int> values;

    for (int i = 1; i <= q; i++) {
        int type;
        scanf("%d", &type);

        if (type == 1) {
            int value;
            scanf("%d", &value);
            values.push_front(value);
        } else if (type == 2) {
            int value;
            scanf("%d", &value);
            values.push_back(value);
        } else if (type == 3) {
            int value = values.front();
            values.pop_front();
            printf("%d\n", value);
        } else if (type == 4) {
            int value = values.back();
            values.pop_back();
            printf("%d\n", value);
        } else if (type == 5) {
            printf("%d\n", values.front());
        } else if (type == 6) {
            printf("%d\n", values.back());
        } else if (type == 7) {
            int index;
            scanf("%d", &index);
            printf("%d\n", values[index]);
        } else if (type == 8) {
            printf("%d\n", (int)values.size());
        } else if (type == 9) {
            printf("%d\n", values.empty());
        }
    }
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
13
1 20
2 30
1 10
5
6
7 1
8
3
4
5
9
3
9
```

输出：

```text
10
30
20
3
10
30
20
0
20
1
```

最后一次类型 `3` 删除仅剩的 `20`，所以最终判空输出 `1`。

## 常用操作复杂度

| 操作 | 时间复杂度 |
| --- | ---: |
| `size()`、`empty()`、下标、`front()`、`back()` | $O(1)$ |
| `push_front()`、`push_back()` | $O(1)$ |
| `pop_front()`、`pop_back()` | $O(1)$ |
| 遍历全部元素 | $O(n)$ |
| 中间 `insert()`、`erase()` | $O(n)$ |
| 整体复制 | $O(n)$ |

完整操作序列程序的每个输入操作都是 $O(1)$，处理 $q$ 个操作总时间是 $O(q)$。容器最多保存 $q$ 个元素，空间复杂度是 $O(q)$。

## 常见错误

### 在空容器上访问或删除

`front()`、`back()`、`pop_front()`、`pop_back()` 都要求非空。题面不保证时，先调用 `empty()`；它们不会自动返回哨兵。

### 认为 pop 会返回元素

两个 `pop` 接口都只删除。需要被删值时先复制 `front()` 或 `back()`，再执行对应删除。

### 把下标当成 1-based

直接使用 `deque` 接口时保持 0-based，有效下标是 `0..size()-1`。只有把它作为自定义 1-based 算法的底层存储时才另外预留位置并单独维护逻辑长度。

### 假设内存连续

下标是 $O(1)$ 不等于元素地址连续。不要把 `&values[0]` 传给要求完整连续数组的接口，也不要编写跨元素的指针算术。

### 在中间反复增删

`deque` 只保证两端高效，中间 `insert`、`erase` 仍然是线性时间。反复执行可能形成平方复杂度。

### 保留修改前的迭代器

端点或中间修改以后重新取得迭代器、指针和引用。不要为了省一次定位而依赖没有核对的失效细节。

### 无需求地替换 vector

只在末尾增长并大量顺序扫描时，`vector` 通常更简单且具有连续内存优势。根据操作选择容器，不根据接口数量选择。

## 基础练习

1. 从空 `deque<int>` 开始，分别在前后加入元素并手动写出每一步顺序。
2. 用 `front()`、`back()` 与两个 `pop` 接口依次从两端取出元素。
3. 测试下标 `0`、`size()-1` 和中间位置，确认 0-based 约定。
4. 用范围 `for` 从前到后输出全部元素，再用 `sort` 排序。
5. 实现操作序列中的所有接口，并用 `vector` 或手写数组建立小规模对拍模型。
6. 分别为“只在末尾追加”“频繁从开头删除”“需要连续内存”三个需求选择 `vector` 或 `deque` 并说明理由。
7. 使用 `deque` 判断一个字符串是否为回文：比较首尾字符后同时删除两端。

## 需要记住什么

1. `deque` 与普通队列、`queue` 容器适配器有什么区别？
2. 怎样声明并初始化一个 `deque<T>`？
3. 两端加入、访问和删除分别使用哪些接口？
4. 哪些接口要求容器非空？需要取出并删除时顺序是什么？
5. `deque` 的原生下标从哪里开始？下标访问复杂度是多少？
6. 为什么 `deque` 支持随机访问，却不能视为连续数组？
7. 为什么它没有 `capacity()`、`reserve()` 和 `data()`？
8. 两端操作与中间插入删除的复杂度分别是多少？
9. `vector` 与 `deque` 应当根据什么主要操作进行选择？
10. `stack`、`queue` 为什么都可以默认使用 `deque` 作为底层容器？

`deque` 的具体分块大小、内部映射结构、分配器、异常保证和完整迭代器失效表不属于竞赛基础用法，不要求理解或记忆。
