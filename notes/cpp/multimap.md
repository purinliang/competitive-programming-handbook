# 有序关联容器：multimap

> 最近修订：2026-08-14 00:07 +10:00（未审阅）

[有序关联容器：map](map.md) 要求每个键最多对应一个映射值。这很适合“姓名到分数”或“数值到出现次数”，但不能直接表示同一键下的多条独立记录。

例如，按分数保存选手编号：

```text
分数 75 -> 选手 1
分数 90 -> 选手 3
分数 90 -> 选手 5
分数 90 -> 选手 2
```

分数 `90` 同时对应三名选手，这三条记录都需要保留。`multimap` 允许键重复，每次插入都保存一个完整键值对，同时仍按键维持全局顺序。

本篇只聚焦一个键对应多条记录后的接口语义。普通迭代器、`end()` 和有序容器的共有边界检查已在 `set`、`multiset` 和 `map` 中介绍，不再完整重复。

## 声明一个 multimap

前两个模板参数依次是键类型和映射值类型：

```cpp
multimap<int, int> contestants;
```

这个容器把整数分数作为键，把选手编号作为映射值。也可以使用其他类型：

```cpp
multimap<string, int> word_positions;
multimap<int, string> students_by_score;
```

标准头文件是 `<map>`。本仓库的完整竞赛代码使用 `#include <bits/stdc++.h>`，不需要另行列出。

## 重复键插入

使用 `insert({key, value})` 加入键值对：

```cpp
contestants.insert({90, 3});
contestants.insert({75, 1});
contestants.insert({90, 5});
contestants.insert({90, 2});
```

四次插入全部成功。按顺序遍历得到：

```text
75:1 90:3 90:5 90:2
```

键 `90` 的三条记录都被保留。C++17 中，键等价记录的相对顺序与插入顺序相同，并且在这些记录存留期间保持不变。因此三个键 `90` 的映射值按 `3,5,2` 遍历。

“键等价”仍由键比较器决定：若 `compare(a,b)` 和 `compare(b,a)` 都是 `false`，它们就位于同一键组。映射值不参与键等价判断，因此同一键组内可以保存任意多个相同或不同的映射值。

`insert` 每次都新增记录，直接返回指向新记录的迭代器：

```cpp
auto it = contestants.insert({90, 7});
printf("%d %d\n", it->first, it->second);
```

它不会像 `map::insert` 那样返回“迭代器和是否插入”的 `pair`，因此没有 `.second` 布尔结果。

## 没有方括号访问

`map[key]` 能返回唯一映射值的引用。`multimap` 中一个键可能对应多个映射值，“`multimap[key]` 应当返回哪一个”没有唯一答案。

因此 `multimap` 不提供 `operator[]`，也不提供 `at`：

```cpp
// contestants[90]      // 错误：不存在该接口
// contestants.at(90)   // 错误：不存在该接口
```

加入记录使用 `insert`；读取某个键的记录使用 `find` 或 `equal_range`。

`multimap` 也没有 `insert_or_assign`：一个键已经存在时，容器无法凭键判断应当覆盖其中哪一条记录。需要修改时，先定位具体迭代器，再修改它的 `second`。

## 查找一条记录

`find(key)` 返回指向某个等价键记录的迭代器；键不存在时返回 `end()`：

```cpp
auto it = contestants.find(90);
if (it != contestants.end()) {
    printf("%d %d\n", it->first, it->second);
}
```

`find` 只承诺返回一条键等价的记录，不应依赖它选中哪个映射值。需要处理该键的全部记录时，使用等值区间。

`find` 需要 $O(\log n)$ 时间，不会遍历同键的全部记录。

## 同键记录区间

默认升序 `multimap` 中：

- `lower_bound(key)` 返回键不小于 `key` 的第一条记录；
- `upper_bound(key)` 返回键大于 `key` 的第一条记录。

所有等价键在有序容器中必然连续，因此它们恰好位于 STL 半开区间：

```text
[lower_bound(key), upper_bound(key))
```

`equal_range(key)` 一次返回这两个迭代器：

```cpp
auto [first, last] = contestants.equal_range(90);
```

遍历分数 `90` 的全部选手：

```cpp
for (auto it = first; it != last; ++it) {
    printf("%d\n", it->second);
}
```

范围中每个 `it->first` 都等价于 `90`，`it->second` 依次是对应的选手编号。

`equal_range` 定位边界需要 $O(\log n)$ 时间；遍历同键的 $k$ 条记录需要 $O(k)$ 时间。`count(key)` 同样需要 $O(\log n+k)$ 时间，因为它必须数出这 $k$ 条记录。

## 删除一条已知记录

已知合法迭代器时，`erase(it)` 只删除它指向的那一条键值记录：

```cpp
contestants.erase(it);
```

即使还有其他记录使用相同键，它们也不会被删除。只有指向被删除记录的迭代器失效，其他迭代器仍然有效。

不能将 `end()` 传给单迭代器版本的 `erase`。已知合法迭代器时，删除的均摊复杂度是 $O(1)$。

## 删除指定键值记录

已知键 `key` 和映射值 `value`，只想删除一条同时匹配它们的记录。`multimap` 按键排序，不能通过键直接定位某个映射值。

先用 `equal_range(key)` 缩小到同键区间，再线性检查其中的映射值：

```cpp
auto [first, last] = contestants.equal_range(key);
for (auto it = first; it != last; ++it) {
    if (it->second == value) {
        contestants.erase(it);
        break;
    }
}
```

`break` 保证只删除第一条匹配记录。若连完整键值对都可以重复，其他相同记录仍然保留。

设该键共有 $k$ 条记录，最坏需要 $O(\log n+k)$ 时间：用 $O(\log n)$ 定位区间，再最多检查 $k$ 个映射值。

## 删除一个键组

把键直接传给 `erase`：

```cpp
int erased = (int)contestants.erase(90);
```

这会删除键 `90` 下的全部记录，并返回实际删除数量。若原来有三条，就返回 `3`。

按键删除 $k$ 条记录需要 $O(\log n+k)$ 时间。不要在只想删除一条记录时误用 `erase(key)`。

## 修改键与映射值

迭代器指向的元素类似 `pair<const Key, Value>`：

- `it->first` 是只读键，不能修改；
- `it->second` 是可修改的映射值。

例如可以修改某条已定位记录的选手编号：

```cpp
it->second = 7;
```

映射值不参与 `multimap` 的排列。修改后记录不会因为新映射值而重新排序。

需要修改键时，先保存映射值并删除原记录，再使用新键重新插入。不能绕过容器的有序规则直接修改 `first`。

## 全局遍历顺序

范围 `for` 按键升序遍历全部键值记录：

```cpp
for (const auto& [key, value] : contestants) {
    printf("%d %d\n", key, value);
}
```

不同键按键的比较规则排列。同键记录保持相对插入顺序，但映射值本身不会自动升序或降序。

若需要“先按分数，同分再按选手编号”排列，通常更直接地把两个字段都放进排序键：

```cpp
set<pair<int, int>> contestants;
```

此时 `pair` 的两层字典序会同时决定位置。选择 `multimap<int, int>` 还是 `set<pair<int, int>>`，取决于第二个数值是“只随键携带的信息”，还是“也必须参与排序和唯一性”。

## 与 `map<Key, vector<Value>>` 比较

一个键对应多个值时，也可以显式把整个值序列作为映射值：

```cpp
map<int, vector<int>> contestants;
contestants[90].push_back(3);
contestants[90].push_back(5);
```

这种写法能直接通过方括号取得一个键的整组值，并且同组数据连续存储。如果读入后只需要按组遍历，它往往比 `multimap` 更直观。

`multimap` 更适合每条键值记录都要作为独立容器元素动态插入、通过迭代器删除，并与其他键一起按全局键顺序维护的场景。实际题目中，根据需要的访问和更新方式选择，不要只因为名字带有“多”就默认使用 `multimap`。

## 动态分组记录

定义八类操作：

| 类型 | 输入 | 行为 |
| ---: | --- | --- |
| 1 | `1 key value` | 加入一条键值记录 |
| 2 | `2 key value` | 删除第一条同时匹配键和值的记录，输出是否成功 |
| 3 | `3 key` | 删除该键的全部记录，输出实际删除数量 |
| 4 | `4 key` | 输出该键的记录数量 |
| 5 | `5 key` | 按相对插入顺序输出该键的全部映射值 |
| 6 | `6 key` | 输出第一个键 `>= key` 的记录，不存在输出 `-1 -1` |
| 7 | `7` | 按 `key:value` 格式输出全部记录 |
| 8 | `8` | 输出当前记录总数 |

输入的键和值都保证位于 `0..10^9`，因此 `-1 -1` 可以安全表示边界记录不存在。

## 完整代码

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int operation_count;
    scanf("%d", &operation_count);

    multimap<int, int> records;

    for (int i = 1; i <= operation_count; i++) {
        int type;
        scanf("%d", &type);

        if (type == 1) {
            int key, value;
            scanf("%d%d", &key, &value);
            records.insert({key, value});
        } else if (type == 2) {
            int key, value;
            scanf("%d%d", &key, &value);

            bool erased = false;
            auto [first, last] = records.equal_range(key);
            for (auto it = first; it != last; ++it) {
                if (it->second == value) {
                    records.erase(it);
                    erased = true;
                    break;
                }
            }
            printf("%d\n", erased);
        } else if (type == 3) {
            int key;
            scanf("%d", &key);
            printf("%d\n", (int)records.erase(key));
        } else if (type == 4) {
            int key;
            scanf("%d", &key);
            printf("%d\n", (int)records.count(key));
        } else if (type == 5) {
            int key;
            scanf("%d", &key);

            bool first_output = true;
            auto [first, last] = records.equal_range(key);
            for (auto it = first; it != last; ++it) {
                if (!first_output) {
                    printf(" ");
                }
                printf("%d", it->second);
                first_output = false;
            }
            printf("\n");
        } else if (type == 6) {
            int key;
            scanf("%d", &key);
            auto it = records.lower_bound(key);
            if (it == records.end()) {
                printf("-1 -1\n");
            } else {
                printf("%d %d\n", it->first, it->second);
            }
        } else if (type == 7) {
            bool first_output = true;
            for (const auto& [key, value] : records) {
                if (!first_output) {
                    printf(" ");
                }
                printf("%d:%d", key, value);
                first_output = false;
            }
            printf("\n");
        } else if (type == 8) {
            printf("%d\n", (int)records.size());
        }
    }

    return 0;
}
```

输入：

```text
18
1 90 3
1 75 1
1 90 5
1 90 2
7
4 90
5 90
2 90 5
5 90
2 90 5
6 80
3 90
4 90
6 80
1 75 4
7
3 75
8
```

输出：

```text
75:1 90:3 90:5 90:2
3
3 5 2
1
3 2
0
90 3
2
0
-1 -1
75:1 75:4
2
0
```

删除 `90:5` 后，键 `90` 的其他两条记录仍然保留，并按原相对顺序输出 `3 2`。按键删除 `90` 则一次删除剩余两条，所以输出 `2`。

## 时间与空间复杂度

设 `multimap` 当前共有 $n$ 条记录，某个键有 $k$ 条记录：

- `insert`、`find`、`lower_bound`、`upper_bound` 和 `equal_range` 需要 $O(\log n)$ 时间；
- `count(key)` 和 `erase(key)` 需要 $O(\log n+k)$ 时间；
- 已知合法迭代器时，`erase(it)` 的均摊复杂度是 $O(1)$；
- 在同键区间中查找一个指定映射值需要 $O(\log n+k)$ 时间；
- `size` 和 `empty` 需要 $O(1)$ 时间；
- 完整遍历需要 $O(n)$ 时间；
- 保存 $n$ 条记录需要 $O(n)$ 空间。

这里的 $n$ 包含所有重复键记录。`size()` 返回记录总数，不是不同键的数量。

## 常见错误

### 使用方括号或 at

`multimap` 没有 `operator[]` 或 `at`，因为一个键没有唯一映射值。插入使用 `insert`，查询整组使用 `equal_range`。

### 认为 insert 会拒绝重复键

每次 `insert` 都会新增一条记录，并直接返回迭代器，没有“是否真正插入”的布尔值。

### 只想删一条却传入键

`erase(key)` 会删除该键的全部记录。只删一条时必须找到具体迭代器，再调用 `erase(it)`。

### 依赖 find 返回某个值

`find(key)` 只承诺返回某条等价键记录。需要全部记录时使用 `equal_range`，需要特定映射值时在该区间内显式查找。

### 认为同键按映射值排序

`multimap` 只按键比较。同键记录保持相对插入顺序，不会按映射值自动重排。

### 认为 size 是不同键数量

`size()` 统计全部键值记录。一个键对应三条记录，就为 `size()` 贡献 `3`。

### 直接修改键

键 `it->first` 是只读的。需要更换键时，删除具体记录后使用新键重新插入；映射值 `it->second` 可以修改。

## 基础练习

1. 依次插入 `90:3`、`75:1`、`90:5`、`90:2`，写出完整遍历和 `equal_range(90)` 的输出顺序。
2. 对一个不存在的键调用 `find`、`count` 和 `equal_range`，比较返回结果。
3. 实现“只删除一条 `key:value`”，并保留其他完全相同的记录。
4. 分别使用 `erase(it)` 和 `erase(key)`，验证它们对同键记录数量的影响。
5. 修改一条记录的映射值，观察它在同键区间内的位置是否改变。
6. 分别用 `multimap<int, int>`、`set<pair<int, int>>` 和 `map<int, vector<int>>` 表示同一批记录，比较它们的排序、重复和按组访问语义。
7. 随机生成插入、指定记录删除、整组删除、计数和边界查询，用按键分组的列表模型对拍。

## 需要记住什么

1. `map` 和 `multimap` 对一个键能保存的映射值数量有什么区别？
2. `multimap::insert` 返回什么？为什么没有是否插入的布尔值？
3. `multimap` 为什么没有 `operator[]` 和 `at`？
4. `find(key)` 能否用来遍历该键的全部记录？应当使用什么？
5. `equal_range(key)` 返回哪个半开区间？
6. 怎样只删除一条指定的 `key:value` 记录？最坏复杂度是什么？
7. `erase(key)` 会删除哪些记录，并返回什么？
8. 同键记录的遍历顺序是什么？映射值是否参与排序？
9. 键和映射值中，哪个可以通过迭代器修改？
10. `multimap<int, int>`、`set<pair<int, int>>` 和 `map<int, vector<int>>` 分别更适合什么访问与排序需求？
11. 各常用查找、删除、遍历操作的时间复杂度是什么？

提示插入、异构查找、节点句柄、`merge`、分配器和内部树形实现不属于基础竞赛接口，需要时查阅标准库资料即可，不要求记忆。
