# 哈希表

> 最近修订：2026-08-16 12:15 +10:00（未审阅）

有些题目需要反复保存和查询“编号对应的数值”。编号可能是用户 ID、坐标、状态编码或其他整数，程序需要支持：

- 插入一个新的键值对；
- 修改已有键对应的值；
- 根据键查询值；
- 删除一个键值对。

若键恰好是 `1..n`，直接使用数组即可。但键可能接近 $10^{18}$，甚至包含负数，无法为每个可能的整数都分配一个数组格子。哈希表（hash table）把大范围的键映射到数量有限的桶中，在一般数据下实现平均 $O(1)$ 的插入、查询和删除。

[哈希](hashing.md)已经解释了哈希函数、输出范围、冲突必然性、分布与碰撞概率。本篇从直接寻址出发，把这些概念落实为桶、拉链法和负载因子，并实现一个整数键到整数值的映射。标准库 `unordered_set` 与 `unordered_map` 的接口会在后续文章中单独学习。

## 直接寻址

假设所有键都在 `0..1000` 内，可以令数组下标就是键：

```cpp
vector<ll> value(1005);
vector<bool> exists(1005, false);
```

保存键 `key` 对应的值：

```cpp
value[key] = new_value;
exists[key] = true;
```

查询时也直接访问 `value[key]`。无论已经保存多少个键，定位一次都只需要 $O(1)$ 时间。这种方式称为直接寻址。

`exists` 不能省略。若 `0` 也是合法值，仅检查 `value[key] == 0` 无法区分“这个键不存在”和“这个键存在，值恰好为零”。

直接寻址的空间取决于键的完整范围，而不是实际保存的键数。若只保存三个键：

```text
-20, 5, 1000000000000
```

就不能建立一个覆盖全部键的普通数组。需要保留数组按下标快速定位的思想，同时把巨大的键范围压缩到数量有限的格子中。

## 用哈希函数选择桶

哈希表先建立 `bucket_count` 个桶，并为每个桶编号：

```text
0, 1, 2, ..., bucket_count - 1
```

哈希函数（hash function）接收一个键，返回它所属的桶编号。本篇先使用最容易观察的取模：

$$
h(key)=key\bmod bucket\_count.
$$

例如一共有 $7$ 个桶：

| `key` | `key mod 7` | 桶编号 |
| ---: | ---: | ---: |
| `3` | `3` | `3` |
| `10` | `3` | `3` |
| `16` | `2` | `2` |

键 `3` 和 `10` 不相同，却被映射到同一个桶。只要桶的数量小于所有可能的键数，根据抽屉原理，总会存在不同键落入同一个桶。这种情况称为哈希冲突（hash collision）。

冲突不是程序写错了，也不可能通过挑选一个普通哈希函数彻底消除。哈希表必须在设计时决定怎样保存同一个桶中的多个键。

## 负数键

C++ 中负数取模的结果可能为负数。例如：

```cpp
(-20 % 25) == -20;
```

负数不能直接作为 `vector` 下标。取模后若结果小于零，就加上桶数，把它归一化到 `0..bucket_count-1`：

```cpp
int bucket_index(ll key) const {
    ll index = key % bucket_count;
    if (index < 0) {
        index += bucket_count;
    }
    return index;
}
```

此时 `5`、`30` 与 `-20` 在 `bucket_count = 25` 时都会落入桶 `5`。相同的键每次必须得到相同的桶编号，否则查询时就无法回到插入位置。

这里的桶是哈希表内部直接使用的 `vector` 格子，因此遵循 STL 的 0-based 下标。键本身不是序列位置，可以是任意整数。

## 拉链法

拉链法（separate chaining）让每个桶保存一组完整的键值对，而不是只保存一个值。发生冲突时，新键值对加入同一个桶：

```text
bucket[0]:
bucket[1]:
bucket[2]:
bucket[3]:
bucket[4]:
bucket[5]: (5, 50)  (30, 300)  (-20, 200)
...
```

经典示意图常把同一桶的元素画成链表，因此中文称为拉链法。但这个策略只要求每个桶能保存多个元素，不强制底层真的使用链表。本篇为一个键值对定义字段明确的结构体：

```cpp
struct HashEntry {
    ll key;
    ll value;
};

vector<vector<HashEntry>> buckets;
```

外层 `vector` 选择桶，内层 `vector` 保存该桶中的所有 `HashEntry`。连续存储的代码更短，遍历小桶时也很直接。

仅保存 `value` 不够。发生冲突以后，查询桶 `5` 仍需比较每个元素的 `key`，才能确定需要的是 `5`、`30` 还是 `-20`。

## 状态封装

桶、桶数和当前元素数共同组成一张哈希表的持续状态，各项操作必须维护同一组规则，因此使用 `struct` 封装：

```cpp
struct HashTable {
    vector<vector<HashEntry>> buckets;
    int bucket_count;
    int element_count;

    HashTable(int maximum_size) {
        bucket_count = 2 * maximum_size + 1;
        buckets.resize(bucket_count);
        element_count = 0;
    }
};
```

完整程序预先知道最多执行 `maximum_size` 次插入操作。不同键的数量不会超过这个上限，所以分配 `2 * maximum_size + 1` 个桶，能让普通数据下的桶保持较短。`+1` 也保证 `maximum_size == 0` 时仍有一个桶。

这里的桶数只是容易解释的容量选择，不是“乘二加一以后必然为质数”，也不能阻止有人故意选出大量同余的键。

## 插入与更新

键 `key` 只能出现在 `bucket_index(key)` 对应的桶中。设置键值时先遍历这个桶：

```cpp
void set_value(ll key, ll value) {
    int index = bucket_index(key);
    for (HashEntry& entry : buckets[index]) {
        if (entry.key == key) {
            entry.value = value;
            return;
        }
    }

    buckets[index].push_back({key, value});
    element_count++;
}
```

每次比较的都是完整键，而不是桶编号：

- 找到相同键时，只更新它的值，元素数量不变；
- 遍历完整个桶仍未找到时，才插入新的键值对，并增加 `element_count`。

若只比较桶编号，所有冲突键都会被误认为同一个键，哈希表就失去了保存原始键的能力。

## 查询

查询除了对应值，还要说明键是否存在。`QueryResult` 用具名字段保存这两部分：

```cpp
struct QueryResult {
    bool found;
    ll value;
};
```

查询使用相同的哈希函数定位桶，再寻找完整键：

```cpp
QueryResult get(ll key) const {
    int index = bucket_index(key);
    for (const HashEntry& entry : buckets[index]) {
        if (entry.key == key) {
            return {true, entry.value};
        }
    }
    return {false, 0};
}
```

返回值同时包含：

- `bool`：是否找到；
- `ll`：找到时对应的值。

不能用 `-1` 或 `0` 单独表示不存在，因为所有 64 位整数都可能是合法值。`{false, 0}` 中的 `0` 只是没有找到时不会使用的占位值，调用者必须先检查布尔量：

```cpp
QueryResult result = table.get(key);
if (result.found) {
    printf("%lld\n", result.value);
} else {
    printf("Not Found\n");
}
```

## 删除

删除也先定位桶，再寻找完整键。桶中元素的顺序没有意义，因此找到以后不必把整个后缀向左移动：可以用最后一个元素覆盖它，再删除末尾。

```cpp
bool erase(ll key) {
    int index = bucket_index(key);
    vector<HashEntry>& bucket = buckets[index];

    int n = bucket.size();
    for (int i = 0; i < n; i++) {
        if (bucket[i].key == key) {
            bucket[i] = bucket.back();
            bucket.pop_back();
            element_count--;
            return true;
        }
    }
    return false;
}
```

返回 `true` 表示确实找到并删除了键；返回 `false` 表示键原本不存在。覆盖操作可能改变同一个桶内的顺序，但哈希表本来就不承诺按键大小或插入顺序遍历。

内层 `vector` 是 STL 容器，所以循环使用它原生的 `0..n-1` 下标。这个下标只是桶内存储位置，与外部的整数键没有关系。

## 负载因子

设当前保存 $n$ 个不同键，一共有 $B$ 个桶。负载因子（load factor）定义为：

$$
\alpha=\frac{n}{B}.
$$

若哈希函数能把普通输入大致均匀地分散到各桶，每个桶平均包含 $\alpha$ 个元素。一次操作需要先用 $O(1)$ 时间计算桶编号，再扫描目标桶，因此平均时间是：

$$
O(1+\alpha).
$$

本篇的完整程序最多插入 $q$ 个不同键，并建立 $2q+1$ 个桶，所以始终有 $\alpha<\frac12$。在键分布正常的假设下，插入、查询和删除的平均时间都是 $O(1)$。

“平均 $O(1)$”不是无条件的最坏保证。若所有键都落入同一个桶，目标桶可能包含全部 $n$ 个元素，一次操作最坏需要 $O(n)$。例如取模哈希面对以下键时会持续冲突：

```text
5, 5 + B, 5 + 2B, 5 + 3B, ...
```

哈希表的总空间为 $O(B+n)$：外层保存 $B$ 个桶，所有内层桶合计保存 $n$ 个键值对。

## 扩容与重新哈希

如果不断插入而桶数不变，负载因子会越来越大，平均桶长也随之增加。通用哈希表通常在负载因子超过某个阈值后：

1. 建立更多桶；
2. 遍历所有旧键值对；
3. 使用新的桶数重新计算每个键的桶编号；
4. 把键值对插入新桶。

这个过程称为重新哈希（rehash）。不能只扩大外层 `vector` 而保留原位置，因为 `key % bucket_count` 已经随桶数改变。

完整程序从输入操作数得到容量上限，因此不需要动态扩容。后续的 `unordered_set` 与 `unordered_map` 会自动管理桶和重新哈希。

## 完整代码

程序处理 $q$ 个操作：

| 操作 | 含义 | 输出 |
| --- | --- | --- |
| `1 key value` | 插入新键，或更新已有键 | 无 |
| `2 key` | 查询键 | 对应值，或 `Not Found` |
| `3 key` | 删除键 | 成功输出 `1`，不存在输出 `0` |
| `4` | 查询当前不同键的数量 | 元素数量 |

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct HashEntry {
    ll key;
    ll value;
};

struct QueryResult {
    bool found;
    ll value;
};

struct HashTable {
    vector<vector<HashEntry>> buckets;
    int bucket_count;
    int element_count;

    HashTable(int maximum_size) {
        bucket_count = 2 * maximum_size + 1;
        buckets.resize(bucket_count);
        element_count = 0;
    }

    int bucket_index(ll key) const {
        ll index = key % bucket_count;
        if (index < 0) {
            index += bucket_count;
        }
        return index;
    }

    void set_value(ll key, ll value) {
        int index = bucket_index(key);
        for (HashEntry& entry : buckets[index]) {
            if (entry.key == key) {
                entry.value = value;
                return;
            }
        }

        buckets[index].push_back({key, value});
        element_count++;
    }

    QueryResult get(ll key) const {
        int index = bucket_index(key);
        for (const HashEntry& entry : buckets[index]) {
            if (entry.key == key) {
                return {true, entry.value};
            }
        }
        return {false, 0};
    }

    bool erase(ll key) {
        int index = bucket_index(key);
        vector<HashEntry>& bucket = buckets[index];

        int n = bucket.size();
        for (int i = 0; i < n; i++) {
            if (bucket[i].key == key) {
                bucket[i] = bucket.back();
                bucket.pop_back();
                element_count--;
                return true;
            }
        }
        return false;
    }

    int size() const {
        return element_count;
    }
};

void solve() {
    int q;
    scanf("%d", &q);

    HashTable table(q);
    for (int i = 1; i <= q; i++) {
        int operation;
        scanf("%d", &operation);

        if (operation == 1) {
            ll key, value;
            scanf("%lld%lld", &key, &value);
            table.set_value(key, value);
        } else if (operation == 2) {
            ll key;
            scanf("%lld", &key);

            QueryResult result = table.get(key);
            if (result.found) {
                printf("%lld\n", result.value);
            } else {
                printf("Not Found\n");
            }
        } else if (operation == 3) {
            ll key;
            scanf("%lld", &key);
            printf("%d\n", table.erase(key));
        } else {
            printf("%d\n", table.size());
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
12
1 5 50
1 30 300
2 5
1 5 55
4
2 5
3 30
2 30
3 30
1 -20 200
2 -20
4
```

输出：

```text
50
2
55
1
Not Found
0
200
2
```

程序有 `2 * 12 + 1 = 25` 个桶，所以样例中的 `5`、`30` 和 `-20` 都对应桶 `5`。冲突不会影响它们作为三个不同键分别保存和查询。

## 常见错误

### 只保存哈希值

桶编号只负责缩小查找范围，不能代替原始键。每次查询、更新和删除都必须在桶内再次比较完整键。

### 把冲突当成重复键

两个键的桶编号相同，不代表两个键相同。只有 `stored_key == key` 时才能更新旧值；否则必须保留两个键值对。

### 负数取模后直接作为下标

C++ 的负数余数可能为负。把结果传给 `vector::operator[]` 会转换成很大的无符号下标并越界，必须先归一化。

### 更新时增加元素数量

已有键改变值以后，哈希表中的不同键数量没有变化。只有第一次插入这个键时才增加 `element_count`。

### 删除时保持无意义的桶内顺序

若桶内顺序没有题目语义，可以用末尾元素覆盖被删位置，再 `pop_back()`。移动整个后缀只会增加无用工作。

### 把平均复杂度写成最坏复杂度

哈希表的 $O(1)$ 依赖键被大致均匀分散的假设。拉链法不会因冲突得到错误答案，但极端冲突仍会让一次操作退化为 $O(n)$。

## 结构选择

| 方法 | 适合场景 | 查询或修改 |
| --- | --- | --- |
| 直接寻址数组 | 键范围小且已知 | $O(1)$ 最坏 |
| 离散化后数组 | 键能离线收集，且需要顺序关系 | 排序预处理后 $O(1)$ 或 $O(\log n)$ 定位 |
| 有序映射 | 需要按键排序、找前驱后继 | $O(\log n)$ 最坏 |
| 哈希表 | 主要关心精确键的插入、查询和删除 | 平均 $O(1)$，最坏 $O(n)$ |

哈希表不维护键的大小顺序，也不承诺插入顺序。若问题需要从小到大遍历键、寻找最小键或查询相邻键，不能只因为平均复杂度更小就选择哈希表。

## 基础练习

1. 令桶数为 `7`，依次插入键 `3`、`10`、`17` 和 `8`，画出拉链法的桶状态。
2. 修改完整程序，使值也允许为 `-1`，验证为什么查询结果不能只用 `-1` 表示不存在。
3. 连续两次设置同一个键，检查 `size()` 是否保持不变，查询结果是否变成新值。
4. 加入一个 `contains(key)` 操作，只返回键是否存在，并复用已经写好的查询逻辑。
5. 构造一组全部落入同一桶的键，统计一次失败查询需要比较多少次。
6. 在负载因子超过 `1` 时把桶数扩大约两倍，并把所有旧键值对重新哈希。

## 需要记住什么

1. 直接寻址为什么不能处理范围接近 $10^{18}$ 的稀疏键？
2. 哈希函数和桶分别负责什么？
3. 为什么哈希冲突不可避免？
4. 拉链法为什么必须同时保存原始键和值？
5. 插入一个已有键时，值和元素数量分别怎样变化？
6. 查询为什么需要同时返回“是否找到”和对应值？
7. 负载因子怎样影响平均桶长？
8. 为什么哈希表通常是平均 $O(1)$，最坏却可能是 $O(n)$？
9. 桶数变化以后，为什么必须重新哈希全部元素？

取模哈希的抗攻击改进、开放寻址的探测策略、删除标记、动态扩容的工程细节和标准库的具体实现不要求在本篇理解或记忆。当前需要掌握的是从键计算桶、在桶内处理冲突，以及平均复杂度成立所依赖的条件。

[pair](../cpp/pair.md) 会学习 C++ 标准库中保存两个值的通用类型；带权图随后会用它保存邻接表中的终点和边权。
