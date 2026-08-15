# 无序关联容器：unordered_map

> 最近修订：2026-08-14 00:19 +10:00（未审阅）

[无序关联容器：unordered_set](unordered-set.md) 可以用平均 $O(1)$ 时间判断一个键是否存在，但每个键本身没有携带其他信息。

若要统计整数出现次数，只记录“键 `5` 存在”还不够，还要把键和它的次数放在一起：

```text
键 2  -> 次数 1
键 5  -> 次数 3
键 8  -> 次数 1
```

标准库 `unordered_map` 保存“唯一键到映射值”的关系：

- 每个键最多存在一份；
- 每个键携带一个可以修改的映射值；
- 根据完整键进行哈希查找，不维护键的大小顺序。

它与 [有序关联容器：map](map.md) 保存相同的键值关系，但交换了顺序和复杂度：`map` 的常用单键操作有 $O(\log n)$ 最坏保证并按键有序；`unordered_map` 不承诺遍历顺序，常用单键操作平均是 $O(1)$、最坏是 $O(n)$。

哈希函数、桶、冲突、负载因子和重新哈希已经在 [哈希表](../algorithm-basics/hash-table.md) 中推导。本篇只学习 C++17 `unordered_map` 的常用接口和比赛中必须注意的行为。

## 键类型与映射值类型

前两个模板参数依次是键类型和映射值类型：

```cpp
unordered_map<int, int> frequency;
```

这张表把一个整数键映射到一个整数次数。其他常见组合也可以直接声明：

```cpp
unordered_map<string, int> student_score;
unordered_map<int, string> name;
unordered_map<char, vector<int>> positions;
```

键决定怎样定位一条记录；映射值只是该键携带的数据。`unordered_map<string, int>` 根据学生姓名查找分数，不会按照姓名或分数排序。

标准头文件是 `<unordered_map>`。本仓库的完整竞赛代码使用 `#include <bits/stdc++.h>`，不需要另行列出。

## 通过键访问映射值

方括号中填写键，可以取得该键对应的映射值：

```cpp
frequency[5] = 3;
```

因为 `operator[]` 返回映射值的引用，所以可以直接更新它：

```cpp
frequency[5]++;
frequency[5] += 2;
```

这使 `unordered_map` 很适合统计频次、保存编号或记录每个状态的答案。

方括号不是容器中的位置下标。`frequency[5]` 表示“键 `5` 的映射值”，不表示第六条记录；`unordered_map` 也没有稳定的第几条记录。

## 不存在的键

对不存在的键使用方括号时，容器会先插入这个键，并对映射值进行值初始化。常用类型得到：

| 映射值类型 | 自动建立时的值 |
| --- | --- |
| `int`、`long long` | `0` |
| `bool` | `false` |
| `string` | 空字符串 |
| `vector<int>` | 空 `vector` |

因此首次执行：

```cpp
frequency[5]++;
```

会先建立 `5 -> 0`，再把次数增加到 `1`。

自动插入也意味着方括号不是纯查询。下面的判断会在 `x` 不存在时建立一条值为 `0` 的记录：

```cpp
if (frequency[x] > 0) {
    printf("found\n");
}
```

只查询而不应改变容器时，使用 `find`、`count` 或 `at`。`const unordered_map` 也不提供方括号访问，因为这个接口可能插入新键。

## 查找键

`find(key)` 返回指向该键值对的迭代器；不存在时返回 `end()`：

```cpp
auto it = frequency.find(x);
if (it != frequency.end()) {
    printf("%d\n", it->second);
}
```

迭代器指向一个类似 `pair<const Key, Value>` 的键值对：

- `it->first` 是键；
- `it->second` 是映射值。

键决定哈希位置，因此不能直接修改 `it->first`。映射值不影响键所在的桶，可以修改：

```cpp
it->second++;
```

`count(key)` 只判断键是否存在。因为每个键最多一份，结果只可能是 `0` 或 `1`：

```cpp
if (frequency.count(x) == 1) {
    printf("found\n");
}
```

需要映射值时使用一次 `find`，同时完成存在性判断和取值；不要先 `count`，再用方括号重新查找。

`at(key)` 返回已经存在的映射值引用且不会插入新键，但键不存在时会抛出 `out_of_range` 异常。竞赛中“键不存在”通常是正常分支，使用 `find` 显式处理更清楚。

## 插入与覆盖

方括号赋值会在键不存在时插入，在键已经存在时覆盖映射值：

```cpp
unordered_map<int, int> score;
score[3] = 90;
score[3] = 95;
```

最终键 `3` 只有一份，映射值是 `95`。

`insert({key, value})` 只在键不存在时插入，不会覆盖已有值：

```cpp
auto [it, inserted] = score.insert({3, 100});
```

如果 `3` 已经映射到 `95`，本次 `inserted == false`，`it->second` 仍然是 `95`。`it` 指向已有或新插入的键值对，`inserted` 表示本次是否真正加入了新键。

C++17 的 `insert_or_assign` 会在键存在时覆盖映射值，并保留“是否新插入”的返回信息：

```cpp
auto [it, inserted] = score.insert_or_assign(3, 100);
```

普通竞赛代码设置一个值时，`score[key] = value` 最直接；只允许首次插入时使用 `insert`；需要同时知道本次是插入还是覆盖时使用 `insert_or_assign`。

## 删除键

按键删除会返回实际删除数量：

```cpp
int erased = (int)frequency.erase(x);
```

键原本存在时删除整条键值对并返回 `1`；不存在时容器不变并返回 `0`。

已经拿到合法迭代器时，可以直接删除该记录：

```cpp
auto it = frequency.find(x);
if (it != frequency.end()) {
    frequency.erase(it);
}
```

不能把 `end()` 传给单迭代器版本的 `erase`。按键删除在普通哈希分布下平均需要 $O(1)$ 时间，最坏需要 $O(n)$。

## 遍历没有顺序

范围 `for` 可以访问全部键值对：

```cpp
for (const auto& [key, value] : frequency) {
    printf("%d %d\n", key, value);
}
```

结构化绑定中的 `key` 是键，`value` 是映射值。使用 `const` 引用时两者都不修改。若要修改全部映射值，可以去掉 `const`：

```cpp
for (auto& [key, value] : frequency) {
    value++;
}
```

即使使用 `auto&`，键仍然只读，只有映射值可以修改。

遍历顺序不是键的升序、映射值的顺序或插入顺序。它可能随标准库实现、桶数和重新哈希而变化，程序正确性不能依赖本地某次运行观察到的顺序。

需要按键稳定输出时，先复制到 `vector` 再排序：

```cpp
vector<pair<int, int>> items(frequency.begin(), frequency.end());
sort(items.begin(), items.end());
```

`pair` 默认先比较 `first`，相同时再比较 `second`。由于每个键唯一，这里会按键升序排列全部键值对。复制需要 $O(n)$ 时间和空间，排序需要 $O(n\log n)$ 时间。

## 没有边界查询

`unordered_map` 只根据完整键进行哈希定位，不维护键的大小顺序，因此没有 `lower_bound` 或 `upper_bound`，也不能快速查询最小键、最大键、前驱或后继。

需要这些操作时使用 `map`。数据读入后不再修改时，也可以保存到 `vector` 并排序，再使用二分查找。

## 容量预留与迭代器

若大致知道最多会保存多少个不同键，可以在大量插入前预留容量：

```cpp
unordered_map<int, int> frequency;
frequency.reserve(expected_size);
```

参数表示预期元素数，不是桶数。预留可以减少插入过程中的重新哈希次数，但不能把平均 $O(1)$ 变成最坏 $O(1)$，也不能消除恶意哈希冲突。

插入新键可能触发重新哈希。一旦重新哈希，全部迭代器都会失效；不能在未知是否扩容的插入后继续使用旧迭代器。删除只会使指向被删除记录的迭代器失效。

不进行插入时，可以在遍历中安全删除当前记录：

```cpp
for (auto it = frequency.begin(); it != frequency.end();) {
    if (it->second == 0) {
        it = frequency.erase(it);
    } else {
        ++it;
    }
}
```

`erase(it)` 返回内部遍历顺序中的后继迭代器，这个后继没有键值大小上的含义。

## 键的哈希限制

整数、字符和字符串等常用标准类型已经提供默认哈希，可以直接作为键。C++17 没有为 `pair<int, int>` 提供标准哈希；可以按照题目范围把两个整数无冲突地编码成一个 `long long` 键，或者提供自定义哈希类型。

自定义哈希的接口、相等键必须具有相同哈希值的规则，以及简单哈希面对恶意数据的风险，已经在 [无序关联容器：unordered_set](unordered-set.md#默认可哈希键类型) 中说明。`unordered_map` 使用同样的键规则，只是在模板参数中增加映射值类型：

```cpp
unordered_map<pair<int, int>, int, pair_hash> distance;
```

这里的 `pair_hash` 必须是前文已经定义的哈希类型。本文不重复实现另一份相同代码。

## 动态频次表

下面用 `unordered_map<int, int>` 保存“数值到正出现次数”的映射。定义五类操作：

| 类型 | 输入 | 行为 |
| ---: | --- | --- |
| 1 | `1 x` | 把 `x` 的出现次数增加 `1` |
| 2 | `2 x` | 若 `x` 存在，把次数减少 `1` 并输出 `1`；否则输出 `0` |
| 3 | `3 x` | 输出 `x` 的当前出现次数 |
| 4 | `4` | 输出当前不同键数量 |
| 5 | `5` | 按 `key:count` 格式升序输出全部映射 |

程序始终保持一个不变量：容器中只保存出现次数大于 `0` 的键。某个次数减到 `0` 时立即删除整条记录，这样 `size()` 才恰好是当前不同数值的数量。

增加次数时，方括号的默认值 `0` 正好符合需求：

```cpp
frequency[x]++;
```

减少或查询次数时不能使用方括号，否则不存在的键也会被插入。程序先调用 `find`，再通过同一个迭代器读取或修改次数。

类型 `5` 不能直接遍历输出，否则答案顺序不确定。程序把全部键值对复制到 `vector`，按键排序后再输出。

## 完整代码

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int operation_count;
    scanf("%d", &operation_count);

    unordered_map<int, int> frequency;
    frequency.reserve(operation_count);

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
            printf("%d\n", (int)frequency.size());
        } else if (type == 5) {
            vector<pair<int, int>> items(frequency.begin(), frequency.end());
            sort(items.begin(), items.end());

            bool first = true;
            for (const auto& [key, count] : items) {
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
13
1 5
1 2
1 5
1 8
5
3 5
2 5
3 5
2 5
3 5
2 5
4
5
```

输出：

```text
2:1 5:2 8:1
2
1
1
1
0
0
2
2:1 8:1
```

键 `5` 的次数从 `2` 降到 `1`，再降到 `0` 时被删除。第三次尝试减少 `5` 时该键已经不存在，因此输出 `0`。最后的不同键只有 `2` 和 `8`。

## 时间与空间复杂度

设容器当前有 $n$ 个不同键：

- `operator[]`、`at`、`find`、`count`、`insert`、`insert_or_assign` 和按键 `erase` 平均需要 $O(1)$ 时间，最坏需要 $O(n)$；
- `size` 和 `empty` 需要 $O(1)$ 时间；
- 完整遍历和 `clear` 需要 $O(n)$ 时间；
- 复制并按键排序全部记录需要 $O(n\log n)$ 时间和 $O(n)$ 额外空间；
- 保存 $n$ 个键值对和 $B$ 个桶需要 $O(n+B)$ 空间，在标准容量管理下通常简写为 $O(n)$。

平均 $O(1)$ 依赖哈希函数把当前键大致均匀地分散到各桶。哈希冲突不会改变键值语义或答案，但大量冲突会让操作变慢。

## 结构选择

| 结构 | 键值关系 | 遍历顺序 | 单键操作 | 边界查询 |
| --- | --- | --- | --- | --- |
| `map` | 唯一键到映射值 | 按键有序 | $O(\log n)$ 最坏 | 支持 |
| `unordered_map` | 唯一键到映射值 | 不承诺 | 平均 $O(1)$，最坏 $O(n)$ | 不支持 |
| 直接寻址 `vector` | 小范围整数下标到值 | 按下标顺序 | $O(1)$ 最坏 | 可按下标处理 |

键是较小的连续非负整数时，直接寻址的 `vector` 更简单，常数也通常更小。键范围很大或是字符串时，才需要关联容器；是否需要顺序与最坏保证决定选择 `map` 还是 `unordered_map`。

## 常见错误

### 用方括号做纯查询

`frequency[x]` 会在 `x` 不存在时插入值为 `0` 的记录。只查询时使用 `find`；同时需要值时直接读取同一个迭代器的 `second`。

### 依赖遍历顺序

`unordered_map` 不承诺按键、映射值或插入顺序遍历。需要稳定输出时显式排序，需要持续维护键的顺序时使用 `map`。

### 认为 insert 会覆盖原值

`insert({key, value})` 在键存在时保持旧值。需要覆盖时使用方括号赋值或 `insert_or_assign`。

### 直接修改键

键决定哈希位置，因此迭代器的 `first` 只读。需要更换键时先删除原记录，再插入新键值对。

### 保留次数为零的键

频次表中的次数降到零后若不删除键，`size()` 和遍历仍会把它视为存在。程序应先明确“键存在”的不变量，再让全部更新共同维护它。

### 调用边界查询

`unordered_map` 没有 `lower_bound` 或 `upper_bound`。需要最小键、前驱、后继或值域边界时选择 `map`。

### 将平均 O(1) 当成最坏保证

严重哈希冲突会让一次操作最坏达到 $O(n)$。`reserve` 只能减少重新哈希，不能保证键分布或解决恶意冲突。

### 在插入后使用旧迭代器

插入新键可能触发重新哈希，使全部旧迭代器失效。不要在可能插入的操作后继续使用此前保存的迭代器。

## 基础练习

1. 使用 `unordered_map<string, int>` 保存三名学生的分数，修改其中一名学生并用 `find` 查询。
2. 统计一串整数的出现次数，只保存次数大于零的键。
3. 对不存在的键分别执行 `find`、`count` 和方括号访问，对比操作前后的 `size()`。
4. 对已有键分别使用方括号赋值、`insert` 和 `insert_or_assign`，比较最终值和返回信息。
5. 将全部键值对复制到 `vector`，按键升序稳定输出。
6. 在不插入新键的遍历中删除所有映射值为零的记录，正确更新迭代器。
7. 随机生成增加、减少、频次查询和数量查询，用普通数组或另一份模型对拍；比较全部记录时先排序。

## 需要记住什么

1. `unordered_map` 的键、映射值和键值对分别表示什么？
2. 它与 `map` 保存的数据语义是否相同？顺序和复杂度有什么不同？
3. 对不存在的键使用方括号会发生什么？为什么它适合增加频次，却不适合纯查询？
4. `find` 返回的迭代器中，`first` 和 `second` 分别是什么？哪个可以修改？
5. 方括号赋值、`insert` 和 `insert_or_assign` 在已有键上有什么区别？
6. 为什么不能依赖 `unordered_map` 的遍历顺序？怎样得到按键稳定的输出？
7. `reserve(expected_size)` 的参数表示什么？它能否消除最坏复杂度？
8. 插入和重新哈希可能使哪些迭代器失效？
9. 为什么频次降到零时通常应删除整个键值对？
10. 什么情况下应选择直接寻址 `vector`、`map` 或 `unordered_map`？

`try_emplace`、提示插入、异构查找、局部桶迭代器、`max_load_factor`、手动 `rehash`、节点句柄、自定义相等函数和通用抗攻击哈希实现不属于基础竞赛接口，需要时查阅标准库资料即可，不要求记忆。
