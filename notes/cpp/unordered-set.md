# 无序关联容器：unordered_set

> 最近修订：2026-08-14 00:15 +10:00（未审阅）

[哈希表](../algorithm-basics/hash-table.md) 已经从直接寻址推导了哈希函数、桶、冲突、负载因子和重新哈希。若问题只需要维护一组不重复键，可以直接使用标准库 `unordered_set`，不必自己编写桶和冲突处理。

`unordered_set` 与 [有序关联容器：set](set.md) 都保证每个键最多存在一份，但交换了顺序和复杂度：

- `set` 按键有序，常用单键操作是 $O(\log n)$ 最坏保证；
- `unordered_set` 不承诺任何遍历顺序，常用单键操作平均是 $O(1)$，最坏是 $O(n)$。

如果题目只问“这个键是否存在”，而不需要最小键、前驱后继或有序输出，`unordered_set` 通常是更直接的标准库工具。

本篇不重复哈希表的底层推导，只学习 C++17 接口、平均复杂度的前提、迭代器失效和可以直接哈希的键类型。

## 声明一个 unordered_set

尖括号中填写键类型：

```cpp
unordered_set<int> values;
```

这会建立一个保存 `int` 的空容器。常用标准类型已经提供默认哈希函数，可以直接使用：

```cpp
unordered_set<int> integers;
unordered_set<ll> large_integers;
unordered_set<char> characters;
unordered_set<string> words;
```

使用 `ll` 时按本仓库约定先声明 `typedef long long ll;`。

标准头文件是 `<unordered_set>`。本仓库的完整竞赛代码使用 `#include <bits/stdc++.h>`，不需要另行列出。

## 加入唯一键

`insert(value)` 尝试加入一个键：

```cpp
values.insert(5);
values.insert(2);
values.insert(8);
```

再次加入 `5` 不会保存第二份。`insert` 返回一个 `pair`：

- `first` 是指向容器中该键的迭代器；
- `second` 表示本次是否真正插入新键。

```cpp
bool inserted = values.insert(5).second;
```

原本不存在时 `inserted == true`；已经存在时容器不变且 `inserted == false`。

`unordered_set` 的元素同时是哈希查找所使用的键，不能通过迭代器直接修改。需要更换键时，先删除旧键，再插入新键。

## 查找与存在性

`find(value)` 返回指向该键的迭代器；不存在时返回 `end()`：

```cpp
auto it = values.find(5);
if (it != values.end()) {
    printf("found %d\n", *it);
}
```

只需要判断存在性时，也可以使用 `count(value)`：

```cpp
if (values.count(5) == 1) {
    printf("found\n");
}
```

因为每个键最多存在一份，`count` 的结果只可能是 `0` 或 `1`。C++20 增加了 `contains`，但本仓库统一使用 C++17，因此不在模板中使用它。

`find` 和 `count` 在哈希分布正常时平均需要 $O(1)$ 时间，所有键大量冲突时最坏需要 $O(n)$。

## 删除键

已知键时，将它传给 `erase`：

```cpp
int erased = (int)values.erase(5);
```

原本存在时删除该键并返回 `1`；不存在时容器不变并返回 `0`。

已经拿到合法迭代器时，可以直接删除该位置：

```cpp
auto it = values.find(5);
if (it != values.end()) {
    values.erase(it);
}
```

不能将 `end()` 传给单迭代器版本的 `erase`。按键删除在普通哈希分布下平均是 $O(1)$，最坏是 $O(n)$。

## 遍历没有顺序

可以使用范围 `for` 访问全部键：

```cpp
for (int value : values) {
    printf("%d\n", value);
}
```

但这个顺序不是数值升序、降序或插入顺序。它由哈希函数、桶数、标准库实现和当前内部状态共同决定。

同一份代码换一个编译器或标准库实现，遍历顺序可能变化；对容器执行插入、删除或重新哈希后，顺序也可能变化。程序正确性不能依赖某次本地运行观察到的顺序。

一次完整遍历需要 $O(n)$ 时间。若题目要求升序输出，将元素复制到 `vector` 后排序：

```cpp
vector<int> ordered(values.begin(), values.end());
sort(ordered.begin(), ordered.end());
```

复制需要 $O(n)$ 时间和空间，排序需要 $O(n\log n)$ 时间。若算法在更新之间反复需要有序遍历，直接选择 `set` 通常更合适。

## 没有边界查询

`unordered_set` 只能根据完整键进行哈希定位，不维护键的大小顺序。它不提供：

- `lower_bound` 或 `upper_bound`；
- 最小键、最大键、前驱或后继的快速查询；
- 按数值位置访问第 $k$ 个键。

`begin()` 只返回某个内部遍历起点，不是最小键。需要上述任一顺序操作时，选择 `set`、排序后的 `vector` 或其他真正维护顺序的结构。

## 数量与容量预留

`size()` 返回当前不同键数量，`empty()` 判断是否没有键，`clear()` 删除所有键。

若大致知道最多会保存多少个键，可以在大量插入以前调用：

```cpp
unordered_set<int> values;
values.reserve(expected_size);
```

`reserve(expected_size)` 让容器为预期元素数准备足够的桶，可以减少随后插入中发生重新哈希的次数。参数表示预期元素数，不是要手动指定的桶数。

预留只是常数优化，不会把平均 $O(1)$ 变成最坏 $O(1)$，也不能消除恶意构造的哈希冲突。普通小规模代码不必为了形式完整强行调用 `reserve`。

## 重新哈希与迭代器

插入新键时，若容器需要增加桶数，就会重新哈希全部键。重新哈希会使所有迭代器失效，因此不能保留一个迭代器，然后在未知是否扩容的插入后继续使用它。

删除一个键只会使指向该键的迭代器失效。不进行插入时，可以安全地在遍历中删除当前键：

```cpp
for (auto it = values.begin(); it != values.end();) {
    if (*it % 2 == 0) {
        it = values.erase(it);
    } else {
        ++it;
    }
}
```

`erase(it)` 返回当前遍历顺序中的后继迭代器。这个后继仍然不代表数值上的下一个键。

## 默认可哈希键类型

`unordered_set<Key>` 需要能为 `Key` 计算哈希值，并能判断两个键是否相等。标准库已经为整数、字符、字符串等常用类型提供 `hash`。

但 C++17 没有为 `pair<int, int>` 提供标准哈希，下面的声明通常无法编译：

```cpp
// unordered_set<pair<int, int>> positions; // C++17 没有默认 pair 哈希
```

一个简单选择是将两个整数根据题目范围无冲突地编码成一个 `long long`，再使用 `unordered_set<ll>`。若要直接保存 `pair`，就需要提供自定义哈希类型：

```cpp
struct pair_hash {
    size_t operator()(const pair<int, int>& value) const {
        size_t first_hash = hash<int>()(value.first);
        size_t second_hash = hash<int>()(value.second);
        return first_hash ^ (second_hash << 1);
    }
};

unordered_set<pair<int, int>, pair_hash> positions;
```

哈希类型的 `operator()` 接收一个键并返回 `size_t` 哈希值。这份基础组合先分别计算两个整数的标准哈希，再通过移位和异或混合。

不同键仍然可以得到相同哈希值，容器会继续用 `pair::operator==` 区分冲突键。自定义哈希不需要消除所有冲突，但必须保证相等的键总是得到相同哈希值。

这个简单组合适合理解接口和处理普通数据，不是针对恶意数据的通用抗攻击哈希。题目输入可以针对哈希实现构造且最坏复杂度不可接受时，优先选择有 $O(\log n)$ 最坏保证的 `set`，或者在真正需要时另行实现随机化哈希。

## 动态唯一键集合

定义五类操作：

| 类型 | 输入 | 行为 |
| ---: | --- | --- |
| 1 | `1 x` | 加入 `x`，输出是否真正新增 |
| 2 | `2 x` | 删除 `x`，输出实际删除数量 |
| 3 | `3 x` | 输出 `x` 是否存在 |
| 4 | `4` | 输出当前不同键数量 |
| 5 | `5` | 把全部键复制后按升序输出 |

输入键保证位于 $0$ 到 $10^9$。程序使用 `reserve(operation_count)` 减少潜在的重新哈希，但所有结果都不依赖桶数或内部遍历顺序。

## 完整代码

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int operation_count;
    scanf("%d", &operation_count);

    unordered_set<int> values;
    values.reserve(operation_count);

    for (int i = 1; i <= operation_count; i++) {
        int type;
        scanf("%d", &type);

        if (type == 1) {
            int x;
            scanf("%d", &x);
            bool inserted = values.insert(x).second;
            printf("%d\n", inserted);
        } else if (type == 2) {
            int x;
            scanf("%d", &x);
            printf("%d\n", (int)values.erase(x));
        } else if (type == 3) {
            int x;
            scanf("%d", &x);
            printf("%d\n", (int)values.count(x));
        } else if (type == 4) {
            printf("%d\n", (int)values.size());
        } else if (type == 5) {
            vector<int> ordered(values.begin(), values.end());
            sort(ordered.begin(), ordered.end());

            int n = (int)ordered.size();
            for (int i = 0; i < n; i++) {
                printf("%d%c", ordered[i], " \n"[i + 1 == n]);
            }
            if (n == 0) {
                printf("\n");
            }
        }
    }

    return 0;
}
```

输入：

```text
10
1 5
1 2
1 5
3 2
3 8
5
2 2
2 2
4
5
```

输出：

```text
1
1
0
1
0
2 5
1
0
1
5
```

第二次加入 `5` 输出 `0`，因为该键已经存在。类型 `5` 在输出前显式排序，所以样例结果稳定，而不是依赖 `unordered_set` 的内部顺序。

## 时间与空间复杂度

设容器当前有 $n$ 个不同键：

- `insert`、`find`、`count` 和按键 `erase` 平均需要 $O(1)$ 时间，最坏需要 $O(n)$；
- `size` 和 `empty` 需要 $O(1)$ 时间；
- 完整遍历和 `clear` 需要 $O(n)$ 时间；
- 复制并排序全部键需要 $O(n\log n)$ 时间和 $O(n)$ 额外空间；
- 保存 $n$ 个键和 $B$ 个桶需要 $O(n+B)$ 空间，在标准容量管理下通常简写为 $O(n)$。

平均 $O(1)$ 依赖哈希函数能把当前键大致均匀地分散到各个桶。哈希冲突不会让答案错误，但大量冲突会让单次操作变慢。

## 结构选择

| 结构 | 键是否唯一 | 遍历顺序 | 单键操作 | 边界查询 |
| --- | --- | --- | --- | --- |
| `set` | 是 | 按键有序 | $O(\log n)$ 最坏 | 支持 |
| `unordered_set` | 是 | 不承诺 | 平均 $O(1)$，最坏 $O(n)$ | 不支持 |
| 排序去重后的 `vector` | 是 | 按数组顺序 | 查找 $O(\log n)$，中间更新 $O(n)$ | 支持二分 |

数据全部读入后不再更新时，`vector` 配合一次 `sort` 和 `unique` 往往常数最小。需要动态更新且不关心顺序时，再根据最坏风险选择 `unordered_set` 或 `set`。

## 常见错误

### 依赖遍历顺序

`unordered_set` 不承诺升序、插入顺序或稳定顺序。需要确定输出时显式排序，需要动态有序性时使用 `set`。

### 把 begin 当成最小键

`begin()` 只是内部遍历起点。对非空 `unordered_set`，`*begin()` 是某个键，不一定是最小值或最早插入值。

### 调用边界查询

`unordered_set` 没有 `lower_bound` 或 `upper_bound`。哈希表只适合精确键定位，不能用来快速回答前驱、后继或值域区间。

### 将平均 O(1) 当成最坏保证

哈希冲突严重时，一次插入、查找或删除最坏需要 $O(n)$。`reserve` 可以减少重新哈希，但不能解决恶意冲突。

### 在插入后使用旧迭代器

插入可能触发重新哈希，从而使所有迭代器失效。需要新位置时重新调用 `find`，不默认旧迭代器继续有效。

### 认为 pair 可以默认哈希

C++17 没有为 `pair` 提供标准 `hash`。根据题目范围编码成已支持的整数键，或者提供自定义哈希类型。

### 直接修改键

键的哈希值决定它所在的桶，所以不能通过迭代器直接修改元素。需要更换键时先删除，再插入。

## 基础练习

1. 向 `unordered_set<int>` 依次加入 `5,2,8,5`，记录每次 `insert(...).second` 和最终 `size()`，但不预测遍历顺序。
2. 实现加入、存在性查询和删除，与 `set` 版本对比接口和复杂度。
3. 将一个 `unordered_set<int>` 复制到 `vector`，以确定的升序输出。
4. 在不插入新键的遍历中删除全部偶数，正确更新迭代器。
5. 计算容器的 `bucket_count()` 和 `load_factor()`，观察插入过程中何时发生重新哈希。
6. 为 `pair<int, int>` 提供自定义哈希，插入若干坐标并验证重复坐标只保留一份。
7. 随机生成加入、删除、存在性和数量查询，用普通集合模型对拍；需要比较全部元素时，先在两边分别排序。

## 需要记住什么

1. `set` 和 `unordered_set` 对唯一键的保存语义是否相同？它们放弃和换取了什么？
2. `insert`、`find`、`count` 和 `erase` 分别返回什么？
3. 为什么不能依赖 `unordered_set` 的遍历顺序？
4. `unordered_set` 为什么没有 `lower_bound`、`upper_bound` 或最小键接口？
5. 常用单键操作的平均与最坏复杂度各是什么？
6. `reserve(expected_size)` 的参数表示元素数还是桶数？它能否消除最坏冲突？
7. 什么是重新哈希？它会使哪些迭代器失效？
8. C++17 中哪些常用键类型可以直接使用？`pair<int, int>` 为什么需要额外处理？
9. 自定义哈希对相等键必须满足什么规则？不同键能否得到相同哈希值？
10. 什么情况下应当选择 `set`、`unordered_set` 或排序去重后的 `vector`？

自定义相等函数、异构查找、局部桶迭代器、`max_load_factor`、手动 `rehash`、节点句柄和通用抗攻击哈希实现不属于基础竞赛接口，需要时查阅标准库资料即可，不要求记忆。
