# 有序关联容器：multiset

> 最近修订：2026-08-13 23:48 +10:00（未审阅）

[有序关联容器：set](set.md) 会自动按顺序维护元素，但每个键最多保存一份。有些问题同时需要有序性和重复次数：

- 不断加入和删除若干个分数，每个相同分数都属于不同选手；
- 维护可以重复的物品价格，反复取出当前最小值；
- 统计某个数值当前出现了多少次，并定位这一整段相同元素。

若使用 `set`，第二次加入相同值会被忽略。`multiset` 保留每一次加入，同时仍然按比较规则维持顺序。

本篇不重复介绍迭代器、`end()`、前驱查询与遍历中删除的全部基础，它们与 `set` 相同。重点是重复键如何改变 `insert`、`count`、`erase` 和边界区间的语义。

## 声明与顺序

尖括号中填写元素类型：

```cpp
multiset<int> values;
```

这会建立一个保存 `int` 的空 `multiset`。默认遍历顺序从小到大，与 `set<int>` 相同。

标准头文件也是 `<set>`。本仓库的完整竞赛代码使用 `#include <bits/stdc++.h>`，不需要另行列出。

## 重复插入

依次加入 `5,2,5,8`：

```cpp
values.insert(5);
values.insert(2);
values.insert(5);
values.insert(8);
```

容器按顺序保存：

```text
2 5 5 8
```

两个 `5` 都会保留。`size()` 返回 `4`，因为它统计全部元素数，不是不同数值的数量。

`set::insert` 需要告诉调用者是否真正插入，所以返回“迭代器和布尔值”的 `pair`。`multiset` 每次都会新增一个元素，因此 `insert(value)` 直接返回指向新元素的迭代器：

```cpp
auto it = values.insert(5);
printf("%d\n", *it);
```

不能在 `multiset` 上写 `values.insert(5).second`：返回值本身就是迭代器，没有 `second`。

## 出现次数

`count(value)` 返回等价键的数量：

```cpp
int count = (int)values.count(5);
```

在 `2,5,5,8` 中，结果是 `2`。与 `set::count` 只能返回 `0` 或 `1` 不同，`multiset::count` 可以返回任意非负整数。

定位等值元素的边界需要 $O(\log n)$ 时间，数出该区间内的 $k$ 个元素还需要 $O(k)$ 次迭代器移动。因此 `count(value)` 的复杂度是 $O(\log n+k)$，不能一律当作 $O(\log n)$。

若一个值可能重复非常多，而题目又要高频查询其次数，只用 `multiset::count` 可能会重复遍历整段等值元素。后续的 `map` 可以显式保存“数值到次数”的映射。

## 查找一个元素

`find(value)` 返回指向某个等价元素的迭代器；不存在时返回 `end()`：

```cpp
auto it = values.find(5);
if (it != values.end()) {
    printf("%d\n", *it);
}
```

对普通整数来说，多个相同的 `5` 无法通过数值区分，因此找到任意一个就足够。需要定位全部等价键时，使用后文的等值区间。

`find` 需要 $O(\log n)$ 时间，不会为了确认重复次数而遍历全部等值元素。

## 删除一个副本

已知合法迭代器时，`erase(it)` 只删除它指向的那一个元素：

```cpp
auto it = values.find(5);
if (it != values.end()) {
    values.erase(it);
}
```

原来的 `2,5,5,8` 会变成 `2,5,8`。

这是“若存在则只删除一份”的标准写法。不能省略 `it != values.end()` 的检查，因为将 `end()` 传给 `erase` 是未定义行为。

删除时只有指向被删除副本的迭代器失效，其他副本和其他元素的迭代器仍然有效。已知合法迭代器时，`erase(it)` 的均摊复杂度是 $O(1)$；前面的 `find` 另外需要 $O(\log n)$。

## 删除全部副本

直接把键传给 `erase`：

```cpp
int erased = (int)values.erase(5);
```

这个重载会删除所有等价的 `5`，并返回实际删除数量。原来的 `2,5,5,8` 会变成 `2,8`，`erased == 2`。

这是 `multiset` 最常见的陷阱：

```cpp
values.erase(5); // 删除全部 5，不是只删一个
```

若容器中有 $k$ 个等价键，按值删除的复杂度是 $O(\log n+k)$：先定位该区间，再删除其中的全部元素。

## 等值区间

在默认升序 `multiset` 中：

- `lower_bound(x)` 返回第一个 `>= x` 的元素；
- `upper_bound(x)` 返回第一个 `> x` 的元素。

因为所有相同键在有序容器中必然连续，两个边界之间恰好是全部等于 `x` 的元素：

```text
[lower_bound(x), upper_bound(x))
```

这是 STL 迭代器的左闭右开区间：包含 `lower_bound(x)` 指向的第一个等值元素，不包含 `upper_bound(x)` 指向的第一个更大元素。本书自定义算法仍使用闭区间，这里保留 STL 原生接口的半开规则。

可以分别取得两个边界：

```cpp
auto first = values.lower_bound(x);
auto last = values.upper_bound(x);
```

也可以使用 `equal_range(x)` 一次返回同一对迭代器：

```cpp
auto [first, last] = values.equal_range(x);
```

遍历全部等值元素：

```cpp
for (auto it = first; it != last; ++it) {
    printf("%d\n", *it);
}
```

`equal_range` 定位两个边界需要 $O(\log n)$ 时间；继续遍历区间中的 $k$ 个元素需要 $O(k)$ 时间。

若只需要删除这一整段，可以使用范围删除：

```cpp
auto [first, last] = values.equal_range(x);
values.erase(first, last);
```

这与 `values.erase(x)` 最终效果相同。已经因其他原因拿到边界时，范围写法可以避免再次查找；只按键删除时直接 `erase(x)` 更清楚。

## 最小值与最大值

和 `set` 一样，非空默认升序 `multiset` 的第一个元素是最小值，最后一个元素是最大值：

```cpp
int minimum = *values.begin();
int maximum = *values.rbegin();
```

读取后只删除一份最小值：

```cpp
int minimum = *values.begin();
values.erase(values.begin());
```

即使最小值有多个副本，这段代码也只删除 `begin()` 指向的一个。若改成 `values.erase(minimum)`，就会删除全部最小值。

上述写法都要求容器非空。题面或程序逻辑没有保证时，先检查 `empty()`。

## 比较等价与重复

`multiset` 的“重复”也由比较器等价关系决定。若 `compare(a,b)` 和 `compare(b,a)` 都是 `false`，两个键就位于同一等值区间，不会另行使用 `operator==`。

与 `set` 的区别是：`set` 只保留等价键中的一个，`multiset` 会保留全部等价键。复杂记录的比较器仍然必须表示严格、自洽且不会在元素存留期间变化的顺序。

## 动态可重集合

定义八类操作：

| 类型 | 输入 | 行为 |
| ---: | --- | --- |
| 1 | `1 x` | 加入一个 `x` |
| 2 | `2 x` | 若 `x` 存在，只删除一份并输出 `1`；否则输出 `0` |
| 3 | `3 x` | 删除全部 `x`，输出实际删除数量 |
| 4 | `4 x` | 输出 `x` 的当前出现次数 |
| 5 | `5 x` | 输出第一个 `>= x` 的值，不存在输出 `-1` |
| 6 | `6 x` | 输出第一个 `> x` 的值，不存在输出 `-1` |
| 7 | `7` | 按升序输出包含重复的全部元素 |
| 8 | `8` | 输出当前元素总数 |

输入的 `x` 保证位于 `0..10^9`，因此 `-1` 可以安全表示边界查询不存在。

## 完整代码

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int operation_count;
    scanf("%d", &operation_count);

    multiset<int> values;

    for (int i = 1; i <= operation_count; i++) {
        int type;
        scanf("%d", &type);

        if (type == 1) {
            int x;
            scanf("%d", &x);
            values.insert(x);
        } else if (type == 2) {
            int x;
            scanf("%d", &x);
            auto it = values.find(x);
            if (it == values.end()) {
                printf("0\n");
            } else {
                values.erase(it);
                printf("1\n");
            }
        } else if (type == 3) {
            int x;
            scanf("%d", &x);
            int erased = (int)values.erase(x);
            printf("%d\n", erased);
        } else if (type == 4) {
            int x;
            scanf("%d", &x);
            printf("%d\n", (int)values.count(x));
        } else if (type == 5) {
            int x;
            scanf("%d", &x);
            auto it = values.lower_bound(x);
            if (it == values.end()) {
                printf("-1\n");
            } else {
                printf("%d\n", *it);
            }
        } else if (type == 6) {
            int x;
            scanf("%d", &x);
            auto it = values.upper_bound(x);
            if (it == values.end()) {
                printf("-1\n");
            } else {
                printf("%d\n", *it);
            }
        } else if (type == 7) {
            bool first = true;
            for (int value : values) {
                if (!first) {
                    printf(" ");
                }
                printf("%d", value);
                first = false;
            }
            printf("\n");
        } else if (type == 8) {
            printf("%d\n", (int)values.size());
        }
    }

    return 0;
}
```

输入：

```text
18
1 5
1 2
1 5
1 8
7
4 5
2 5
4 5
3 5
4 5
2 5
5 5
6 2
1 2
7
3 2
8
7
```

输出：

```text
2 5 5 8
2
1
1
1
0
0
8
8
2 2 8
2
1
8
```

第一次删除 `5` 只删一份，所以出现次数从 `2` 变成 `1`。按值删除剩下的全部 `5` 时输出 `1`。后来容器有两个 `2`，按值删除输出 `2`。

## 时间与空间复杂度

设 `multiset` 当前共有 $n$ 个元素，某个键有 $k$ 个等价副本：

- `insert`、`find`、`lower_bound`、`upper_bound` 和 `equal_range` 需要 $O(\log n)$ 时间；
- `count(key)` 和 `erase(key)` 需要 $O(\log n+k)$ 时间；
- 已知合法迭代器时，`erase(it)` 的均摊复杂度是 $O(1)$；
- `empty` 和 `size` 需要 $O(1)$ 时间；
- 遍历全部元素需要 $O(n)$ 时间；
- 保存 $n$ 个元素需要 $O(n)$ 空间。

这里的 $n$ 包含所有重复副本。若一个数值插入了一百次，它就贡献一百个元素的存储。

## 常见错误

### 使用 insert 的 second

`multiset::insert(value)` 总是新增一个副本，直接返回迭代器。它的返回值没有 `second`。

### 认为 count 只会返回 0 或 1

`multiset::count` 返回全部等价键数量，可以大于 `1`，且复杂度中包含线性的返回数量 $k$。

### 按值删除时只想删一个

`values.erase(x)` 会删除全部 `x`。只删一份时，先 `find(x)`，检查不是 `end()` 后再 `erase(it)`。

### 将 end 传给 erase

`find` 可能返回 `end()`。它不指向真实元素，不能解引用，也不能传给单个迭代器版本的 `erase`。

### 忽略等值区间的半开边界

`equal_range(x)` 返回 `[first,last)`。`last` 已经指向第一个更大的元素，不属于等值区间，遍历条件应当是 `it != last`。

### 认为 size 是不同键数量

`size()` 统计全部副本。`2,5,5,8` 的大小是 `4`，不是 `3`。

### 直接修改元素

`multiset` 元素同样是排序键，不能通过迭代器直接修改。需要更换时先删除一个旧副本，再加入新值。

## 基础练习

1. 向 `multiset<int>` 依次加入 `5,2,5,8`，写出每次操作后的 `size()` 和最终遍历顺序。
2. 对 `2,5,5,5,8` 手算 `count(5)`、`lower_bound(5)`、`upper_bound(5)` 与 `equal_range(5)`。
3. 分别执行“只删除一个 `5`”与“删除全部 `5`”，对比所用重载和返回值。
4. 在非空 `multiset` 中取出并删除一份最小值，验证相同最小值不会被全部删除。
5. 使用 `equal_range` 遍历某个键的全部副本，再使用同一区间删除它们。
6. 随机生成重复插入、单个删除、全部删除、计数和边界查询，用有序 `vector` 作为独立参考对拍。

## 需要记住什么

1. `set` 和 `multiset` 在处理等价键时有什么核心区别？
2. `multiset::insert(value)` 返回什么？为什么没有 `second`？
3. `size()` 统计全部元素还是不同键？
4. `count(key)` 的结果和时间复杂度分别是什么？
5. 只删除一个副本应当怎样写？哪个边界必须先检查？
6. `erase(key)` 会删除几个副本，并返回什么？
7. `lower_bound(x)` 和 `upper_bound(x)` 为什么恰好围成全部等于 `x` 的元素？
8. `equal_range(x)` 返回的两个迭代器表示哪个半开区间？
9. 怎样取出并只删除一份当前最小值？
10. `find`、边界查询、单迭代器删除、按键计数与按键全部删除的复杂度各是什么？

节点分配、提示插入、异构查找、`extract`、`merge` 和内部树形实现不属于基础竞赛接口，需要时查阅标准库资料即可，不要求记忆。
