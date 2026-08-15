# unique

> 最近修订：2026-08-16 09:55 +10:00（未审阅）

一组数据中可能反复出现相同的值。统计不同数字的数量、离散化坐标或枚举不同候选项时，通常只想保留每个值的一份。

最直接的做法是依次查看每个元素，再向已经保留的结果中查找它是否出现过。若结果仍是普通 `vector`，每次查找最坏需要 $O(n)$，全部处理可能达到 $O(n^2)$。

先通过 [sort](sorting.md) 把相同值排到相邻位置，再线性扫描相邻元素，就能在
$O(n\log n)$ 时间内完成去重。标准库的 `unique` 实现了这次线性整理。

## 相邻重复

`unique(first, last)` 只合并相邻的等价元素，不会自动排序。对于序列：

```text
3 1 3 2 1
```

两个 `3` 和两个 `1` 都没有相邻，直接调用 `unique` 不能完成一般意义上的去重。

先排序后，序列变成：

```text
1 1 2 3 3
```

所有相同值分别形成连续的一段。此时只要保留每段的第一个元素，就能得到：

```text
1 2 3
```

因此，无序数据的一般去重顺序是：

```cpp
sort(values.begin(), values.end());
auto new_end = unique(values.begin(), values.end());
```

## unique 返回逻辑末尾

`unique` 会把每段相邻重复值的一份移动到范围前部，并返回保留结果之后的位置 `new_end`。它不会改变 `vector` 的 `size()`，也不会真正删除后面的元素。

例如原序列是：

```text
1 1 2 3 3
```

调用 `unique` 后，可以可靠使用的结果范围是：

```text
[ 1 2 3 | ? ? )
          ^
       new_end
```

竖线前的 `[values.begin(), new_end)` 包含三个互不相同的值。竖线后的元素仍占据 `vector` 的位置，但具体内容不再是去重结果，不能继续依赖。

若只需要遍历不同值，可以直接使用这个逻辑范围：

```cpp
for (auto it = values.begin(); it != new_end; it++) {
    printf("%d\n", *it);
}
```

此时 `values.size()` 仍然是原长度。

## 一次线性整理

`unique` 可以理解为同时维护“正在读取的位置”和“下一个保留位置”。下面的
0-based 代码只用于解释核心过程：

```cpp
int write = 0;

for (int read = 0; read < n; read++) {
    if (write == 0 || values[read] != values[write - 1]) {
        values[write] = values[read];
        write++;
    }
}
```

每读到一个与最后保留值不同的元素，就把它写到有效前缀末尾并扩大前缀。循环
结束后，下标 `[0,write)` 是逻辑去重结果；`write` 以后仍是原容器存储的一部分，
但不属于结果。

标准库返回的是对应位置 `new_end`，而不是整数下标。这个过程只顺序读取并至多
写入每个元素一次，因此 `unique` 的时间复杂度是 $O(n)$。它保留各个相邻等价段
中第一项的相对顺序，但不会为不相邻的相同值建立联系。

## erase 真正缩短 vector

如果后续代码希望 `size()` 就等于不同值的数量，还要删除 `[new_end, values.end())`：

```cpp
values.erase(new_end, values.end());
```

与前两步连在一起，就是常见的排序去重写法：

```cpp
sort(values.begin(), values.end());
values.erase(unique(values.begin(), values.end()), values.end());
```

执行后，`vector` 中只剩下排好序的不同值，`values.size()` 也已经缩短。

这条表达式从内向外执行：

1. `unique` 整理相邻重复元素并返回新的逻辑末尾；
2. `erase` 删除逻辑末尾到原末尾之间的全部元素。

先理解并会写分开的两行，再把它们合成一行。`erase` 会使被删除位置及其后的旧迭代器失效，因此不能在调用结束后继续使用之前保存的 `new_end`。

## 已经有序的数据

若题目保证输入本来就是非递减的，相同值已经相邻，不需要再次排序：

```cpp
values.erase(unique(values.begin(), values.end()), values.end());
```

这时去重只需要 $O(n)$ 时间。

不能仅凭“输入看起来经常有序”省略排序。只有题目明确保证有序，或前面的算法已经建立并保持有序性时，才能直接调用 `unique`。

## 保留原顺序

排序会改变元素原来的相对位置。如果题目要求“保留每个值第一次出现的顺序”，排序去重就改变了问题含义。

对数据范围较小的教学示例，可以依次检查结果中是否已有当前值：

```cpp
vector<int> result;

for (int value : values) {
    bool appeared = false;
    for (int saved : result) {
        if (saved == value) {
            appeared = true;
            break;
        }
    }
    if (!appeared) {
        result.push_back(value);
    }
}
```

它保留第一次出现顺序，但最坏是 $O(n^2)$。数据较大时，可以在后续学习 `set` 或 `unordered_set` 后，用额外集合记录某个值是否出现过；具体选择取决于数据类型、范围和题目要求。

如果只想在原序列中压缩“连续重复段”，例如把 `1 1 2 1 1` 变成 `1 2 1`，则不排序并直接使用 `unique` 恰好符合题意。必须先说清楚要删除的是“所有重复值”还是“连续重复值”。

## 自定义等价关系

`unique` 默认使用 `==` 判断相邻元素是否相等。也可以提供一个二元判断函数，让两个相邻元素按照题目规则视为等价。

例如记录中只要 `value` 相同，就忽略 `id` 并视为同一类：

```cpp
struct item {
    int value;
    int id;
};

bool compare_item(const item& a, const item& b) {
    if (a.value != b.value) {
        return a.value < b.value;
    }
    return a.id < b.id;
}

bool same_value(const item& a, const item& b) {
    return a.value == b.value;
}
```

先按 `value` 排序，让同一类相邻，再把判断函数交给 `unique`：

```cpp
sort(items.begin(), items.end(), compare_item);
items.erase(unique(items.begin(), items.end(), same_value), items.end());
```

这里的 `same_value(a, b)` 回答“两个元素是否属于同一类”，与 `compare_item(a, b)` 回答的“`a` 是否严格排在 `b` 前”不是同一个问题。

更重要的是，排序和去重必须使用一致的关键字段：若想按 `value` 去重，就必须先让相同 `value` 的元素相邻。保留下来的是每个相邻等价段经过整理后的第一项；若题目要求保留这一类中的特定代表，应当先通过排序规则把它放到最前面。

## 完整代码

下面的程序读入 $n$ 个整数，按升序输出所有不同值。输入可以为空，也可以全部相同。

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

    sort(values.begin(), values.end());
    values.erase(unique(values.begin(), values.end()), values.end());

    int count = values.size();
    printf("%d\n", count);
    for (int i = 0; i < count; i++) {
        if (i > 0) {
            printf(" ");
        }
        printf("%d", values[i]);
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
3 1 3 2 1 5 2 3
```

输出：

```text
4
1 2 3 5
```

排序需要 $O(n\log n)$ 时间，`unique` 和 `erase` 各至多线性处理元素，因此总时间复杂度是 $O(n\log n)$。除 `sort` 和容器操作自身使用的辅助存储外，代码没有再建立与 $n$ 同规模的结果数组。

## 常见错误

### 无序数据直接 unique

`unique` 只处理相邻的等价元素。删除所有重复值之前，必须先排序或通过其他方法保证相同值已经相邻。

### 以为 unique 改变了 size

`unique` 只返回逻辑末尾。需要真正缩短 `vector` 时，再调用 `erase(new_end, values.end())`。

### 忘记 erase 的第二个参数

`erase(new_end)` 只删除 `new_end` 指向的一个元素；去重需要删除从 `new_end` 到原末尾的整个范围。

### 排序破坏原顺序

排序去重得到的是有序不同值。若题目要求保留第一次出现顺序，必须换用能够记录“是否出现过”的方法。

### 混淆排序与相等判断

排序比较器使用严格的 `<` 或 `>` 关系，`unique` 的判断函数表示两个元素是否等价。它们的返回含义不同。

## 基础练习

1. 对 `3 1 3 2 1` 手动执行排序、`unique` 和 `erase`，记录每一步的有效范围与 `size()`。
2. 分别测试空序列、只有一个元素、所有元素相同和没有重复值的序列。
3. 输入已经有序时省略 `sort`，分析总时间复杂度。
4. 不排序，直接用 `unique` 把连续重复段压成一个元素。
5. 保留每个整数第一次出现的顺序，用朴素方法实现并分析复杂度。
6. 为包含 `value,id` 的记录按 `value` 去重，并决定每类希望保留哪个 `id`。

## 需要记住什么

1. `unique` 处理所有重复值，还是只处理相邻等价元素？
2. 为什么一般的无序数据要先排序再调用 `unique`？
3. `unique` 返回的位置表示什么？它是否改变 `vector::size()`？
4. 线性整理中的读取位置和写入位置分别怎样移动？
5. `erase(unique(...), end())` 中两个调用分别负责什么？
6. 输入已经有序时，去重的时间复杂度是多少？
7. 为什么要求保留第一次出现顺序时不能直接排序去重？
8. 排序比较器和 `unique` 等价判断函数的含义有什么区别？
9. 去重自定义记录时，为什么排序字段必须与等价字段配合？

`unique_copy`、范围库版本、透明相等判断和并行执行策略不属于本篇的竞赛基础用法，不要求理解或记忆。
