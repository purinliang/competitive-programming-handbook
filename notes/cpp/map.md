# `map`

> 最近修订：2026-08-13 23:58 +10:00（未审阅）

[`multiset`](multiset.md) 可以保存每个重复元素，但查询一个键的 $k$ 个副本时，`count(key)` 需要 $O(\log n+k)$ 时间，并且容器真正保存了这 $k$ 个元素。

若题目只关心每个数值的出现次数，可以让每个不同数值只出现一次，并在它旁边另存一个计数：

```text
键 2  -> 次数 1
键 5  -> 次数 3
键 8  -> 次数 1
```

标准库 `map` 就用于维护这种“键（key）到映射值（mapped value）”的关系：

- 每个键最多存在一份；
- 每个键都携带一个对应的映射值；
- 全部键始终按比较规则有序。

映射值不只能是次数。例如可以把学生姓名映射到分数，把状态编号映射到最优答案，或把字符串映射到它的编号。

本篇只学习 C++17 `map` 的常用接口。允许一个键对应多条记录的 `multimap` 将在 [`multimap`](multimap.md) 中单独说明。

## 键类型与值类型

`map` 有两个最基本的模板参数：先写键类型，再写映射值类型。

```cpp
map<int, int> frequency;
```

这个 `map` 把整数键映射到整数次数。也可以使用其他组合：

```cpp
map<string, int> student_score;
map<int, string> name;
map<pair<int, int>, int> position_id;
```

排列顺序只由键决定。`map<string, int>` 按姓名字典序遍历，不会因为某个分数较高就把它移到前面。

键的唯一性也由比较器决定。若 `compare(a,b)` 和 `compare(b,a)` 都是 `false`，`map` 就把它们当作同一个键，而不是另行使用 `operator==`。默认整数、字符串和 `pair` 顺序已经足够直接使用；自定义比较器时必须同时考虑排列与唯一性。

标准头文件是 `<map>`。本仓库的完整竞赛代码使用 `#include <bits/stdc++.h>`，不需要另行列出。

## 通过键访问值

方括号中填写的是键，不是第几个元素：

```cpp
frequency[5] = 3;
```

这表示键 `5` 对应的映射值是 `3`。若键已经存在，赋值会修改原映射值；若键不存在，`operator[]` 会先插入该键，再设置它的值。

因为 `operator[]` 返回映射值的引用，所以可以直接更新：

```cpp
frequency[5]++;
frequency[5] += 2;
```

这是竞赛中使用 `map` 统计频次的最常见写法。

## 不存在的键

对一个不存在的键使用方括号时，`map` 会插入该键，并把映射值进行值初始化。对常用类型：

| 映射值类型 | 自动建立时的值 |
| --- | --- |
| `int`、`long long` | `0` |
| `bool` | `false` |
| `string` | 空字符串 |
| `vector<int>` | 空 `vector` |

因为缺失键需要先建立一个默认映射值，`operator[]` 要求映射值类型可以不提供参数就完成这次初始化。上表中的竞赛常用类型都满足该条件。

因此首次执行：

```cpp
frequency[5]++;
```

会先建立 `5 -> 0`，再把映射值增加到 `1`。

这个自动插入同时也是一个容易忽略的副作用。下面的代码看起来只在查询：

```cpp
if (frequency[x] > 0) {
    printf("found\n");
}
```

但 `x` 原本不存在时，它仍会被以次数 `0` 插入。只查询而不应改变容器时，使用 `find`、`count` 或 `at`，不使用方括号。`const map` 也不提供 `operator[]`，因为该接口可能修改容器。

## 查找键

`find(key)` 返回指向该键值对的迭代器；不存在时返回 `end()`：

```cpp
auto it = frequency.find(x);
if (it != frequency.end()) {
    printf("%d\n", it->second);
}
```

`it` 指向的整个元素是一个类似 `pair<const Key, Value>` 的键值对：

- `it->first` 是键；
- `it->second` 是映射值。

因为键决定容器内部的排列位置，`it->first` 是只读的；`it->second` 不影响键的顺序，可以直接修改：

```cpp
it->second++;
```

`count(key)` 只检查键是否存在。因为 `map` 中每个键最多一份，结果只可能是 `0` 或 `1`：

```cpp
if (frequency.count(x) == 1) {
    printf("found\n");
}
```

需要映射值时使用 `find`，可以用同一次 $O(\log n)$ 查找同时取得 `it->second`，而不是先 `count` 再用方括号重新查找。

## at 访问

`at(key)` 返回已存在键的映射值引用，不会自动插入：

```cpp
int occurrences = frequency.at(5);
```

但键不存在时，`at` 会抛出 `out_of_range` 异常。竞赛题中“键可能不存在”通常是正常分支，此时用 `find` 显式处理更清楚。

只有程序逻辑已经保证键存在，又确实不应自动插入时，才直接使用 `at`。

## 插入与覆盖

方括号赋值表示“不存在则插入，存在则覆盖”：

```cpp
map<int, int> score;
score[3] = 90;
score[3] = 95;
```

最终键 `3` 只有一份，映射值是 `95`。

`insert({key, value})` 则只在键不存在时插入，不会覆盖原值：

```cpp
auto [it, inserted] = score.insert({3, 100});
```

若 `3` 已经映射到 `95`，本次 `inserted == false`，`it->second` 仍然是 `95`。返回的 `first` 是已存在或新插入元素的迭代器，`second` 表示是否真正插入。

C++17 还提供 `insert_or_assign`，它与方括号赋值一样，会在键存在时覆盖映射值：

```cpp
auto [it, inserted] = score.insert_or_assign(3, 100);
```

若键原本不存在，本次插入且 `inserted == true`；若原本已经存在，映射值被覆盖且 `inserted == false`。`it` 指向插入或覆盖后的键值对。

普通竞赛代码需要简单设置一个值时，`score[key] = value` 最直接。只允许首次插入时使用 `insert`；需要同时获知“插入还是覆盖”时，使用 `insert_or_assign` 的布尔返回值。

## 删除键

把键传给 `erase` 会删除该键值对，并返回实际删除数量：

```cpp
int erased = (int)frequency.erase(x);
```

因为键最多存在一份，`erased` 只可能是 `0` 或 `1`。

已经拿到合法迭代器时，可以直接删除该元素：

```cpp
auto it = frequency.find(x);
if (it != frequency.end()) {
    frequency.erase(it);
}
```

不能将 `end()` 传给单迭代器版本的 `erase`。已知合法迭代器时，`erase(it)` 的均摊复杂度是 $O(1)$；前面的 `find` 需要另外 $O(\log n)$ 时间。

## 按键遍历

范围 `for` 会按键从小到大遍历默认 `map`：

```cpp
for (const auto& [key, value] : frequency) {
    printf("%d %d\n", key, value);
}
```

结构化绑定把每个键值对分别命名为 `key` 和 `value`。参数使用 `const` 引用，遍历时不复制对象且不修改内容。

需要修改全部映射值时，去掉 `const`：

```cpp
for (auto& [key, value] : frequency) {
    value++;
}
```

即使使用 `auto&`，`key` 仍然是只读的，只有 `value` 可以修改。键的类型逻辑上是 `const Key`，防止程序绕过容器的有序规则改变排列位置。

一次完整遍历需要 $O(n)$ 时间，其中 $n$ 是不同键的数量。

## 键的边界查询

默认升序 `map` 中：

- `lower_bound(x)` 返回键不小于 `x` 的第一个键值对；
- `upper_bound(x)` 返回键大于 `x` 的第一个键值对。

返回值是迭代器，因此同时可以取得键和映射值：

```cpp
auto it = frequency.lower_bound(x);
if (it != frequency.end()) {
    printf("%d %d\n", it->first, it->second);
}
```

没有符合条件的键时返回 `end()`，解引用前必须检查。查找前驱的写法与 `set` 相同：只有边界迭代器不等于 `begin()` 时才能执行 `--it`。

成员 `lower_bound` 和 `upper_bound` 需要 $O(\log n)$ 时间。不要把它们写成对 `map` 迭代器使用的泛型算法，否则迭代器移动可能退化为线性。

## 数量与安全删除

`size()` 返回不同键的数量，`empty()` 判断是否没有键值对，`clear()` 删除全部内容。

和 `set` 一样，插入不会使现有迭代器失效；删除只会使指向被删除键值对的迭代器失效。遍历中删除当前元素时，使用 `erase` 返回的后继：

```cpp
for (auto it = frequency.begin(); it != frequency.end();) {
    if (it->second == 0) {
        it = frequency.erase(it);
    } else {
        ++it;
    }
}
```

`size()` 和 `empty()` 是 $O(1)$，清空 $n$ 个键值对需要 $O(n)$ 时间。

## 动态频次表

下面用 `map<int, int>` 保存“数值到正出现次数”的映射。定义六类操作：

| 类型 | 输入 | 行为 |
| ---: | --- | --- |
| 1 | `1 x` | 把 `x` 的出现次数增加 `1` |
| 2 | `2 x` | 若 `x` 存在，把次数减少 `1` 并输出 `1`；否则输出 `0` |
| 3 | `3 x` | 输出 `x` 的当前出现次数 |
| 4 | `4 x` | 输出第一个 `>= x` 的键及其次数，不存在输出 `-1 0` |
| 5 | `5` | 输出当前不同键数量 |
| 6 | `6` | 按 `key:count` 格式升序输出全部映射 |

输入的 `x` 保证位于 `0..10^9`，因此 `-1` 可以安全表示边界键不存在。

程序始终维持一个不变量：`map` 中只保存出现次数大于 `0` 的键。某个次数减到 `0` 时立即删除该键，这样 `size()` 才恰好等于当前不同数值的数量，边界查询也不会返回次数为零的无效键。

## 完整代码

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int operation_count;
    scanf("%d", &operation_count);

    map<int, int> frequency;

    for (int i = 1; i <= operation_count; i++) {
        int type;
        scanf("%d", &type);

        if (type == 1) {
            int x;
            scanf("%d", &x);
            frequency[x]++;
        } else if (type == 2) {
            int x;
            scanf("%d", &x);
            auto it = frequency.find(x);
            if (it == frequency.end()) {
                printf("0\n");
            } else {
                it->second--;
                if (it->second == 0) {
                    frequency.erase(it);
                }
                printf("1\n");
            }
        } else if (type == 3) {
            int x;
            scanf("%d", &x);
            auto it = frequency.find(x);
            if (it == frequency.end()) {
                printf("0\n");
            } else {
                printf("%d\n", it->second);
            }
        } else if (type == 4) {
            int x;
            scanf("%d", &x);
            auto it = frequency.lower_bound(x);
            if (it == frequency.end()) {
                printf("-1 0\n");
            } else {
                printf("%d %d\n", it->first, it->second);
            }
        } else if (type == 5) {
            printf("%d\n", (int)frequency.size());
        } else if (type == 6) {
            bool first = true;
            for (const auto& [key, count] : frequency) {
                if (!first) {
                    printf(" ");
                }
                printf("%d:%d", key, count);
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
14
1 5
1 2
1 5
1 8
6
3 5
2 5
3 5
2 5
3 5
4 5
2 5
5
6
```

输出：

```text
2:1 5:2 8:1
2
1
1
1
0
8 1
0
2
2:1 8:1
```

键 `5` 的次数从 `2` 降到 `1`，再降到 `0` 时被删除。所以后续 `lower_bound(5)` 跳过已消失的 `5`，返回 `8 -> 1`。

## 时间与空间复杂度

设 `map` 当前有 $n$ 个不同键：

- `operator[]`、`at`、`find`、`count`、`insert`、`insert_or_assign`、按键 `erase`、`lower_bound` 和 `upper_bound` 都需要 $O(\log n)$ 时间；
- 已知合法迭代器时，`erase(it)` 的均摊复杂度是 $O(1)$；
- `size` 和 `empty` 需要 $O(1)$ 时间；
- 完整遍历和 `clear` 需要 $O(n)$ 时间；
- 保存 $n$ 个键值对需要 $O(n)$ 空间，另外还要计入每个键和映射值对象自身的存储。

对频次表，若总元素数为 $N$，不同键数为 $n$，`multiset` 保存 $N$ 个元素，`map` 只保存 $n$ 个键值对。`map::find` 取得次数是 $O(\log n)$，不需要再遍历同键副本。

## 常见错误

### 用方括号做纯查询

`map[key]` 在键不存在时会自动插入。只检查是否存在时用 `find` 或 `count`；需要同时取值时使用一次 `find`。

### 认为方括号是位置下标

`frequency[5]` 访问的是键 `5` 的映射值，不是第六个元素。`map` 不支持通过数字位置访问第 $k$ 个键值对。

### 认为 insert 会覆盖原值

`insert({key, value})` 只在键不存在时插入。需要覆盖时使用 `map[key] = value` 或 `insert_or_assign`。

### 直接修改键

迭代器的 `first` 只读，不能修改。需要更换键时，先删除原键值对，再使用新键插入。

### 认为按映射值排序

`map` 只按键排序。要按分数、次数或其他映射值排序，需要把键值对复制到 `vector`，再按需要的字段使用 `sort`，或者重新设计以该字段为键的结构。

### 保留次数为零的键

在频次表语义中，次数减到零后若不删除键，`size()`、遍历和边界查询仍会把它当作存在。先明确一个键存在的条件，再在所有更新中保持该不变量。

### 解引用 end

`find`、`lower_bound` 和 `upper_bound` 都可能返回 `end()`。读取 `it->first` 或 `it->second` 以前必须检查。

## 基础练习

1. 使用 `map<string, int>` 保存三名学生的分数，更新其中一名学生并按姓名字典序输出。
2. 使用 `frequency[x]++` 统计一串整数，按数值升序输出每个不同数的次数。
3. 对一个不存在的键分别执行 `find`、`count` 和方括号访问，对比操作后的 `size()`。
4. 对已有键分别使用方括号赋值、`insert` 和 `insert_or_assign`，比较映射值和各返回值。
5. 在频次表中删除一次出现，并在次数归零时删除整个键值对。
6. 使用 `lower_bound` 查找不小于 `x` 的第一个键，同时输出该键对应的值。
7. 随机生成增加、减少、频次查询和边界查询，用普通字典和排序键建立独立参考对拍。

## 需要记住什么

1. `map` 的键、映射值和键值对分别表示什么？
2. `map<Key, Value>` 的两个基本模板参数按什么顺序填写？
3. 对不存在的键使用 `operator[]` 会发生什么？常用映射类型会初始化成什么？
4. 为什么纯查询时不应使用方括号？应当改用什么？
5. `find` 返回的迭代器中，`first` 和 `second` 分别是什么？哪个可以修改？
6. 方括号赋值、`insert` 和 `insert_or_assign` 在键已存在时有什么区别？
7. `map` 的遍历和边界查询是按键还是映射值决定顺序？
8. 频次表为什么应在次数归零时删除键？
9. 遍历中删除当前键值对时，怎样取得合法后继？
10. 常用单键操作和完整遍历的时间复杂度分别是什么？
11. 只统计频次时，`map` 与 `multiset` 在存储量和查询次数的代价上有什么区别？

`try_emplace`、提示插入、异构查找、节点句柄、`merge`、分配器和内部树形实现不属于基础竞赛接口，需要时查阅标准库资料即可，不要求记忆。
