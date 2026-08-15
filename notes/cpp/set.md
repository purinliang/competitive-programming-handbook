# 有序关联容器：set

> 最近修订：2026-08-13 23:40 +10:00（未审阅）

有些问题需要在数据不断加入和删除时，反复回答三类查询：

- 某个值现在是否存在；
- 不小于某个值的最小元素是什么；
- 当前所有不同元素按顺序排列是什么。

使用 `vector` 时，可以用 $O(n)$ 遍历查找一个值。若每次加入后重新排序，又会为了一次更新重复处理全部元素。

标准库 `set` 同时维护两条规则：

1. 每个值最多保存一份；
2. 元素始终按比较规则有序。

加入、查找和删除一个值都需要 $O(\log n)$ 时间，并可以用 $O(n)$ 时间按顺序遍历全部 $n$ 个元素。

本篇只学习 `set` 的 C++17 竞赛常用接口。它通常怎样借助平衡搜索树维持顺序不属于本篇，C++ 标准也不要求某一种具体树形实现；允许保存重复元素的 `multiset` 在 [有序关联容器：multiset](multiset.md) 中单独说明。

## 声明一个 set

尖括号中填写元素类型：

```cpp
set<int> values;
```

这会建立一个保存 `int` 的空 `set`。也可以保存其他已经定义顺序的类型：

```cpp
set<string> words;
set<pair<int, int>> positions;
```

`string` 和 `pair` 都按字典序比较。`pair` 先比较 `first`，相等时再比较 `second`。

标准头文件是 `<set>`。本仓库的完整竞赛代码使用 `#include <bits/stdc++.h>`，不需要另行列出。

## 加入元素

`insert(value)` 尝试加入一个值：

```cpp
values.insert(5);
values.insert(2);
values.insert(8);
```

无论加入顺序如何，遍历时都会按 `2,5,8` 的顺序得到元素。

再次加入已经存在的 `5`：

```cpp
values.insert(5);
```

容器仍然只有 `2,5,8` 三个元素。`set` 不会报错，也不会再保存一份相同的值。

`insert` 会返回一个 `pair`：

- `first` 是指向容器中该值的迭代器；
- `second` 表示本次是否真正加入了新元素。

只关心是否新增时，可以直接读取 `second`：

```cpp
bool inserted = values.insert(5).second;
```

若 `5` 原本不存在，`inserted` 是 `true`；原本已经存在则是 `false`。

## 查找元素

`find(value)` 返回指向该值的迭代器：

```cpp
auto it = values.find(5);
```

若找到，`*it` 就是 `5`；若没有找到，返回 `values.end()`。`end()` 是最后一个元素之后的哨兵位置，不能解引用：

```cpp
if (it != values.end()) {
    printf("found %d\n", *it);
}
```

只需要判断是否存在时，也可以使用 `count(value)`：

```cpp
if (values.count(5) == 1) {
    printf("found\n");
}
```

因为 `set` 中一个值最多出现一次，`count` 的结果只可能是 `0` 或 `1`。`find` 和 `count` 都需要 $O(\log n)$ 时间。

C++20 增加了 `contains`，但本仓库统一使用 C++17，因此模板和教程不使用 `values.contains(value)`。

## 删除元素

已知要删除的值时，直接传入 `erase`：

```cpp
int erased = values.erase(5);
```

若 `5` 原本存在，它被删除且 `erased == 1`；若不存在，容器不变且 `erased == 0`。因此不需要先 `find`、再判断、最后才删除。

已经拿到某个元素的迭代器时，可以直接删除该位置：

```cpp
auto it = values.find(5);
if (it != values.end()) {
    values.erase(it);
}
```

传入迭代器时必须保证它指向真实元素，不能把 `values.end()` 传给 `erase`。

按值删除需要 $O(\log n)$ 时间。已知合法迭代器时，删除该位置的均摊复杂度是 $O(1)$；寻找该迭代器的时间仍需要另外计算。

## 有序遍历

对默认的 `set<int>` 使用范围 `for`，会按数值从小到大访问：

```cpp
for (int value : values) {
    printf("%d\n", value);
}
```

遍历完全部 $n$ 个元素需要 $O(n)$ 时间。不能只因为单次加入和查找是 $O(\log n)$，就把整次遍历也误认为 $O(\log n)$。

`set` 中的元素同时是决定排列位置的键，因此迭代器只允许读取，不能直接修改：

```cpp
auto it = values.begin();
// *it = 100; // 错误：不能绕过 set 的有序规则修改键
```

需要把一个值改成另一个值时，先删除旧值，再加入新值。

## 最小值与最大值

非空 `set` 的 `begin()` 指向第一个元素，即默认顺序下的最小值：

```cpp
int minimum = *values.begin();
```

`end()` 指向最后一个元素之后。先向前移动一步，可以得到最大值：

```cpp
int maximum = *prev(values.end());
```

也可以通过反向迭代器读取最大值：

```cpp
int maximum = *values.rbegin();
```

三种写法都要求 `set` 非空。对空容器解引用 `begin()`、`rbegin()` 或 `prev(end())` 都是未定义行为。

## 边界查询

默认升序 `set` 提供两个最常用的边界查询：

- `lower_bound(x)` 返回第一个不小于 `x` 的元素，即第一个 `>= x` 的元素；
- `upper_bound(x)` 返回第一个大于 `x` 的元素，即第一个 `> x` 的元素。

例如容器中有 `2,5,8`：

```text
lower_bound(5) -> 5
lower_bound(6) -> 8
upper_bound(5) -> 8
```

查询结果是迭代器：

```cpp
auto it = values.lower_bound(x);
if (it != values.end()) {
    printf("%d\n", *it);
}
```

若没有符合条件的元素，两个函数都返回 `values.end()`，所以解引用前必须检查。

要找严格小于 `x` 的最大元素，先找到第一个 `>= x` 的位置，再向前一步：

```cpp
auto it = values.lower_bound(x);
if (it != values.begin()) {
    --it;
    printf("%d\n", *it);
}
```

当 `it == values.begin()` 时，前面已经没有元素，不能继续 `--it`。这个判断同时适用于空 `set`：空时 `begin() == end()`，条件为假。

要找小于等于 `x` 的最大元素，则从第一个 `> x` 的 `upper_bound(x)` 向前一步。

`set` 的成员 `lower_bound` 和 `upper_bound` 都需要 $O(\log n)$ 时间。不要改写为：

```cpp
lower_bound(values.begin(), values.end(), x);
```

这是标准库的泛型算法，对 `set` 的迭代器可能需要线性次移动。有容器成员函数时，直接使用 `values.lower_bound(x)` 或 `values.upper_bound(x)`。

## 数量与清空

`empty()` 判断是否没有元素，`size()` 返回当前不同元素数量：

```cpp
bool no_value = values.empty();
int count = (int)values.size();
```

`clear()` 删除全部元素：

```cpp
values.clear();
```

`empty()` 和 `size()` 是 $O(1)$，清空 $n$ 个元素需要 $O(n)$ 时间。

## 遍历中删除

删除某个元素只会使指向该元素的迭代器失效，不会使其他元素的迭代器失效。但当前 `it` 被删除后，不能再对它执行 `++it`。

C++17 中，`erase(it)` 会返回被删除元素的下一个迭代器。例如遍历并删除所有偶数：

```cpp
for (auto it = values.begin(); it != values.end();) {
    if (*it % 2 == 0) {
        it = values.erase(it);
    } else {
        ++it;
    }
}
```

删除时使用返回的后继；不删除时才手动向后移动。不能在范围 `for` 中一边访问当前元素、一边按迭代器删除它。

在遍历期间加入新元素不会使现有迭代器失效，但新元素是否会在本次遍历中被继续访问取决于它的排列位置。若算法不是特意利用这一点，就不要在同一次遍历中混合加入与删除。

## 降序 set

整数默认按从小到大的 `less<int>` 排列。需要让遍历顺序改为从大到小时，可以使用 `greater<int>`：

```cpp
set<int, greater<int>> values;
```

在这个容器中，`begin()` 指向数值最大的元素。`lower_bound` 和 `upper_bound` 也会遵循 `greater<int>` 定义的比较顺序，不再能用默认升序中的 `>= x` 和 `> x` 直接理解。

大多数竞赛题保留默认升序 `set`，并在需要逆序遍历时使用反向迭代器，这样边界查询仍然能按熟悉的数值关系思考。

复杂记录可以使用自定义严格比较器，规则与 [STL 算法：排序](sorting.md#比较器必须表示严格顺序) 相同。比较器不能使用 `<=`、`>=` 或会变化的外部状态。

`set` 判断两个键是否重复时也使用比较器。若 `compare(a,b)` 和 `compare(b,a)` 都是 `false`，容器就把它们当作同一个键，而不是再另行调用 `a == b`。

因此，若自定义比较器只比较选手分数，两个编号不同但分数相同的选手也会被当作重复键。需要同时保留时，就要在分数相同后继续比较编号，使完整排序键能够区分它们。

## 动态有序集合

定义七类操作：

| 类型 | 输入 | 行为 |
| ---: | --- | --- |
| 1 | `1 x` | 加入 `x`，输出是否真正新增 |
| 2 | `2 x` | 删除 `x`，输出删除数量 |
| 3 | `3 x` | 输出 `x` 是否存在 |
| 4 | `4 x` | 输出第一个 `>= x` 的值，不存在输出 `-1` |
| 5 | `5 x` | 输出第一个 `> x` 的值，不存在输出 `-1` |
| 6 | `6` | 输出当前不同元素数量 |
| 7 | `7` | 按升序输出全部元素 |

输入的 `x` 保证位于 `0..10^9`，因此 `-1` 可以安全表示边界查询不存在。

## 完整代码

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int operation_count;
    scanf("%d", &operation_count);

    set<int> values;

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
            int erased = values.erase(x);
            printf("%d\n", erased);
        } else if (type == 3) {
            int x;
            scanf("%d", &x);
            printf("%d\n", (int)values.count(x));
        } else if (type == 4) {
            int x;
            scanf("%d", &x);
            auto it = values.lower_bound(x);
            if (it == values.end()) {
                printf("-1\n");
            } else {
                printf("%d\n", *it);
            }
        } else if (type == 5) {
            int x;
            scanf("%d", &x);
            auto it = values.upper_bound(x);
            if (it == values.end()) {
                printf("-1\n");
            } else {
                printf("%d\n", *it);
            }
        } else if (type == 6) {
            printf("%d\n", (int)values.size());
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
        }
    }

    return 0;
}
```

输入：

```text
16
1 5
1 2
1 8
1 5
7
3 5
3 6
4 5
4 6
5 5
2 5
5 5
4 9
2 5
6
7
```

输出：

```text
1
1
1
0
2 5 8
1
0
5
8
8
1
8
-1
0
2
2 8
```

第二次加入 `5` 时输出 `0`，因为容器中已有该值。删除 `5` 后再次删除也输出 `0`。所有边界查询都在当前动态集合上完成。

## 时间与空间复杂度

设 `set` 当前保存 $n$ 个不同元素：

- `insert`、`find`、`count`、按值 `erase`、`lower_bound` 和 `upper_bound` 都需要 $O(\log n)$ 时间；
- 已知合法迭代器时，`erase(it)` 的均摊复杂度是 $O(1)$；
- `empty` 和 `size` 需要 $O(1)$ 时间；
- 完整遍历和 `clear` 需要 $O(n)$ 时间；
- 保存 $n$ 个元素需要 $O(n)$ 空间。

`set` 的主要优势是在更新之间仍保持有序，而不是单纯取代一次性排序。如果读入完全部数据后不再修改，对 `vector` 使用一次 `sort` 和 `unique` 往往代码同样清晰，并且连续存储的常数更小。

## 常见错误

### 认为重复值会被保留

`set` 中每个值最多一份。需要保存重复出现次数时，不能只使用 `set`。

### 解引用 end

`find`、`lower_bound` 和 `upper_bound` 都可能返回 `end()`。它不是真实元素，使用 `*it` 前必须检查。

### 对 begin 向前移动

查找前驱时，只有 `it != values.begin()` 才能执行 `--it`。不能等到移动后再检查。

### 直接修改元素

`set` 元素是排序键，不能通过迭代器直接修改。先删除旧值，再加入新值。

### 把成员边界查询写成泛型算法

对 `set` 使用 `values.lower_bound(x)` 和 `values.upper_bound(x)`。泛型 `lower_bound(values.begin(), values.end(), x)` 不能利用容器的树形查找过程，迭代器移动可能是线性的。

### 使用下标

`set` 没有 `values[i]`。从 `begin()` 前进 $k$ 步需要线性次迭代器移动，普通 `set` 不支持 $O(\log n)$ 的“第 $k$ 小”查询。

### 删除后继续使用旧迭代器

指向被删除元素的迭代器立即失效。遍历中删除时使用 `it = values.erase(it)` 取得合法后继。

## 基础练习

1. 依次向 `set<int>` 加入 `5,2,8,5`，写出每次 `insert(...).second`、`size()` 和最终遍历顺序。
2. 对容器 `2,5,8` 分别手算 `lower_bound(1)`、`lower_bound(5)`、`lower_bound(9)` 和对应的 `upper_bound`。
3. 编写查找严格小于 `x` 的最大元素，并处理空容器与没有前驱的情况。
4. 编写查找小于等于 `x` 的最大元素，说明为什么要从 `upper_bound(x)` 向前移动。
5. 遍历 `set<int>` 并删除所有偶数，对比正确和错误的迭代器更新顺序。
6. 用 `set<pair<int, int>>` 保存若干坐标，验证默认字典序。
7. 随机生成加入、删除、存在性与边界查询，用 `vector` 排序去重建立独立参考，与 `set` 对拍。

## 需要记住什么

1. `set` 同时维护哪两条核心规则？
2. `insert(value)` 的返回值中，`first` 和 `second` 分别表示什么？
3. `find` 失败时返回什么？为什么不能解引用它？
4. `set::count` 的结果为什么只可能是 `0` 或 `1`？
5. 按值删除的返值有什么含义？为什么通常不需要先查找？
6. 默认升序中，`lower_bound(x)` 和 `upper_bound(x)` 分别查找什么？
7. 怎样查找严格小于 `x` 的最大元素？哪个边界必须先检查？
8. 为什么不能直接修改 `set` 中的元素？
9. 遍历中删除当前元素时，怎样取得合法的下一个迭代器？
10. 加入、查找、按值删除、边界查询和完整遍历的复杂度各是什么？
11. 什么情况下 `vector` 配合一次 `sort` 和 `unique` 可能比 `set` 更合适？

节点容器的分配器、异构查找、`extract`、`merge`、提示插入与树旋转实现不属于基础竞赛接口，需要时查阅标准库资料即可，不要求记忆。
