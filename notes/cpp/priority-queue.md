# 容器适配器：priority_queue

> 最近修订：2026-08-13 23:22 +10:00（未审阅）

[容器适配器：queue](queue.md) 按照元素进入的先后顺序取出队首。有些问题却不关心谁先进入，只想反复取出当前最大、最小或最紧急的元素。

例如，系统不断收到整数，并在查询时删除当前最大值。每次都遍历全部未删除元素需要 $O(n)$ 时间；每次加入后重新排序也会重复做大量工作。

标准库 `priority_queue` 会维护一组元素，并让当前优先级最高的元素随时位于顶部。加入和删除顶部都是 $O(\log n)$，查看顶部是 $O(1)$。

本篇只学习 `priority_queue` 的竞赛常用接口和比较规则。它如何用二叉树形结构维持这些复杂度，将在后续 [二叉堆](../CATALOG.md#02-基础算法) 中单独推导，不是使用本篇接口的前置条件。

## 默认优先级

尖括号中填写元素类型：

```cpp
priority_queue<int> values;
```

这会建立一个保存 `int` 的空优先队列。默认规则让数值最大的元素优先级最高，因此顶部始终是当前最大值。

这种形态常被称为大根堆或大顶堆，但 `priority_queue` 是 C++ 代码中的容器适配器名称，二叉堆是后续要学的底层数据结构。当前只需要记住“默认先取最大值”。

标准头文件是 `<queue>`。本仓库的完整竞赛代码使用 `#include <bits/stdc++.h>`，不需要另行列出。

## 加入元素

`push(value)` 把新元素加入优先队列：

```cpp
values.push(10);
values.push(30);
values.push(20);
```

这里的加入顺序是 `10,30,20`，但取出顺序由优先级决定，将是 `30,20,10`。

`priority_queue` 不会把全部元素维持为可遍历的完整有序数组。它只保证当前顶部正确；删除顶部以后，才会继续保证新顶部正确。

## 查看与删除顶部

`top()` 返回当前顶部元素的只读引用，但不删除它：

```cpp
int largest = values.top();
```

在刚才的优先队列中，`largest` 是 `30`。

`pop()` 删除当前顶部：

```cpp
values.pop();
```

删除 `30` 以后，新的 `top()` 是 `20`。

`top()` 不允许直接修改顶部元素，因为修改决定优先级的值可能立即破坏顶部规则。需要改变一条记录时，应按题目设计删除或过期检查方法，再加入新记录，不能绕过接口直接改顶部。

`pop()` 的返回类型是 `void`，不会返回被删除的元素。需要取出并删除时，先复制 `top()`，再调用 `pop()`：

```cpp
int value = values.top();
values.pop();
```

不要保留 `top()` 返回的引用后再删除顶部。对象被删除后，该引用已经失效。

## 判空与数量

`empty()` 判断是否没有元素，`size()` 返回当前元素数量：

```cpp
bool no_value = values.empty();
int count = (int)values.size();
```

`top()` 和 `pop()` 都要求优先队列非空。题面没有保证时必须先判断：

```cpp
if (!values.empty()) {
    int value = values.top();
    values.pop();
}
```

空优先队列上访问或删除顶部是未定义行为，不会自动返回 `-1` 等哨兵。

## 常用接口

| 操作 | `priority_queue` 接口 | 作用 | 复杂度 |
| --- | --- | --- | --- |
| 加入 | `values.push(value)` | 加入一个元素 | $O(\log n)$ |
| 查看顶部 | `values.top()` | 返回当前优先级最高的元素引用 | $O(1)$ |
| 删除顶部 | `values.pop()` | 删除当前顶部，不返回元素 | $O(\log n)$ |
| 判空 | `values.empty()` | 判断是否没有元素 | $O(1)$ |
| 查询数量 | `values.size()` | 返回当前元素数 | $O(1)$ |

`priority_queue` 没有 `front()` 和 `back()`，只有一个由比较规则决定的 `top()`。它也不提供下标、`begin()` 或 `end()`，不能直接遍历内部元素。

相同元素可以重复加入，每次 `pop()` 只删除其中一个。`priority_queue` 不提供查找某个值、删除任意元素或直接修改优先级的接口；如果题目需要这些操作，必须另外设计数据结构或过期记录方案。

要按优先级顺序访问全部元素，只能反复 `top()` 和 `pop()`，这会清空原优先队列。需要保留原数据时，可以先复制一份：

```cpp
priority_queue<int> copy = values;
while (!copy.empty()) {
    printf("%d\n", copy.top());
    copy.pop();
}
```

复制本身需要 $O(n)$ 时间和 $O(n)$ 额外空间，不应在一个高频循环中反复复制只为了遍历。

## 动态最大值

定义五类操作：

| 类型 | 输入 | 行为 |
| ---: | --- | --- |
| 1 | `1 value` | 加入 `value` |
| 2 | `2` | 输出并删除当前最大值 |
| 3 | `3` | 输出当前最大值，但不删除 |
| 4 | `4` | 输出元素数量 |
| 5 | `5` | 为空时输出 `1`，否则输出 `0` |

输入保证类型 `2` 和 `3` 出现时优先队列非空。

默认规则已经让 `top()` 等于当前最大值，因此每类操作都能直接翻译为一个接口调用。

## 完整代码

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int operation_count;
    scanf("%d", &operation_count);

    priority_queue<int> values;

    for (int i = 1; i <= operation_count; i++) {
        int type;
        scanf("%d", &type);

        if (type == 1) {
            int value;
            scanf("%d", &value);
            values.push(value);
        } else if (type == 2) {
            int value = values.top();
            values.pop();
            printf("%d\n", value);
        } else if (type == 3) {
            printf("%d\n", values.top());
        } else if (type == 4) {
            printf("%d\n", (int)values.size());
        } else if (type == 5) {
            printf("%d\n", values.empty());
        }
    }

    return 0;
}
```

输入：

```text
13
1 10
1 30
1 20
3
2
3
1 25
4
2
2
2
5
4
```

输出：

```text
30
30
20
3
25
20
10
1
0
```

加入顺序不是取出顺序。最初的 `10,30,20` 先取出 `30`；加入 `25` 以后，剩余元素按 `25,20,10` 取出。

## 最小值优先

如果要让最小整数位于顶部，声明时需要写出三个模板参数：

```cpp
priority_queue<int, vector<int>, greater<int>> values;
```

三个参数依次是：

1. 元素类型 `int`；
2. 底层容器类型 `vector<int>`；
3. 比较类型 `greater<int>`。

不能只把 `greater<int>` 写成第二个参数，因为模板参数位置不能跳过。普通代码保留 `vector<int>` 这个默认底层容器，只改最后的比较规则。

现在依次加入 `10,30,20` 后，`top()` 是 `10`，删除后依次得到 `20,30`。这种形态常被称为小根堆或小顶堆。

`greater<int>` 已经由标准库提供，不需要为整数最小值优先手写比较器。

## pair 的优先级

`pair` 的默认顺序先比较 `first`，相等时再比较 `second`。因此：

```cpp
priority_queue<pair<int, int>> values;
```

会让 `first` 最大的 `pair` 位于顶部；`first` 相同时，`second` 较大的优先。

若两个字段都要按从小到大的字典序取出，使用：

```cpp
priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> values;
```

例如元素 `(distance, vertex)` 会先按较小的 `distance` 取出，距离相同时再按较小的 `vertex` 取出。后续的最短路算法就会使用这种写法。

只有默认字典序完全符合题意时，才直接使用 `pair`。一个字段升序、另一个字段降序时，应当写出明确的自定义比较器。

## 自定义优先级

假设每个任务有开始时间 `time` 和编号 `id`，要求：

1. 时间较小的任务先取出；
2. 时间相同时，编号较小的先取出。

先用 `struct` 把一个任务的两个字段放在一起：

```cpp
struct task {
    int time;
    int id;
};
```

`priority_queue` 的比较类型需要提供函数调用运算符 `operator()`：

```cpp
struct compare_task {
    bool operator()(const task& a, const task& b) const {
        if (a.time != b.time) {
            return a.time > b.time;
        }
        return a.id > b.id;
    }
};
```

对 `priority_queue` 的实用判断方式是：若比较器对 `(a,b)` 返回 `true`，则 `a` 的取出优先级低于 `b`，应当被放在 `b` 下面。

当 `a.time > b.time` 时，`a` 更晚，所以优先级更低；时间相同而 `a.id > b.id` 时，`a` 编号更大，优先级同样更低。

声明时把元素、底层容器和比较类型依次填入：

```cpp
priority_queue<task, vector<task>, compare_task> tasks;
```

比较器参数使用 `const` 引用，因为只读取任务并避免复制；末尾的 `const` 表示调用比较对象时不修改它自己。这些是可直接复用的比较器签名，当前不需要展开类的实现细节。

## 比较器的方向

`sort` 的比较器返回 `true`，表示左边元素应当排在右边前面。`priority_queue` 使用同一种严格顺序规则，但把该顺序中的“最后”元素放在顶部。因此在提取优先级的视角下，方向看起来与 `sort` 相反。

可以用两个整数检查：

```cpp
priority_queue<int> maximum_first;
priority_queue<int, vector<int>, greater<int>> minimum_first;
```

- 默认的 `less<int>` 在 `10 < 20` 时返回 `true`，所以 `10` 的提取优先级低，`20` 在顶部；
- `greater<int>` 在 `20 > 10` 时返回 `true`，所以 `20` 的提取优先级低，`10` 在顶部。

编写自定义规则时，先用自然语言写清“谁应当先取出”，然后让比较器在左边 `a` 应当后取时返回 `true`。最后用两个字段不同的元素和两个主字段相同的元素分别手算 `top()`，比靠直觉记住小于号方向更可靠。

和 `sort` 一样，比较器必须表示严格且自洽的顺序。不能使用 `<=`、`>=`、随机数或会随调用变化的外部状态。

## 自定义任务程序

下面的程序读入全部任务，再按“时间升序，编号升序”取出。每次输出的都是当前优先级最高的任务。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct task {
    int time;
    int id;
};

struct compare_task {
    bool operator()(const task& a, const task& b) const {
        if (a.time != b.time) {
            return a.time > b.time;
        }
        return a.id > b.id;
    }
};

int main() {
    int n;
    scanf("%d", &n);

    priority_queue<task, vector<task>, compare_task> tasks;
    for (int i = 1; i <= n; i++) {
        task current;
        scanf("%d%d", &current.id, &current.time);
        tasks.push(current);
    }

    while (!tasks.empty()) {
        task current = tasks.top();
        tasks.pop();
        printf("%d %d\n", current.id, current.time);
    }

    return 0;
}
```

输入：

```text
5
3 10
1 5
4 10
2 5
5 8
```

输出：

```text
1 5
2 5
5 8
3 10
4 10
```

两个时间为 `5` 的任务中，编号 `1` 先取出；两个时间为 `10` 的任务中，编号 `3` 先取出。

## 时间与空间复杂度

设当前优先队列有 $n$ 个元素：

- `push` 和 `pop` 需要 $O(\log n)$ 时间；
- `top`、`empty` 和 `size` 需要 $O(1)$ 时间；
- 保存 $n$ 个元素需要 $O(n)$ 空间。

连续加入 $n$ 个元素，再全部删除，最多需要 $O(n\log n)$ 时间。只查看顶部不会修改结构，不能把它误算为一次删除。

## 常见错误

### 把默认顶部当成最小值

`priority_queue<int>` 默认让最大值位于顶部。最小值优先必须显式使用 `greater<int>`。

### 认为 pop 会返回元素

`pop()` 只删除顶部，返回类型是 `void`。先用 `top()` 复制元素，再调用 `pop()`。

### 在空队列上访问顶部

`top()` 和 `pop()` 都要求非空。若前置条件不由题面或程序逻辑保证，先检查 `empty()`。

### 小根写法漏掉底层容器

比较类型是第三个模板参数。正确小根写法是 `priority_queue<int, vector<int>, greater<int>>`。

### 自定义比较器方向写反

不要只背记大于号或小于号。明确两个具体元素谁应当先取出，并让比较器在左边元素优先级更低时返回 `true`。

### 使用非严格比较

比较器不能使用 `<=` 或 `>=`。一个元素不能严格低于自己，相等对象在两个方向上都应当返回 `false`。

### 依赖中间元素的内部顺序

`priority_queue` 只保证顶部元素符合规则，不提供遍历内部顺序的接口。需要完整有序序列时，使用 `sort` 一次排序，或者反复弹出并接受 $O(n\log n)$ 总时间。

### 修改已经加入元素的外部依据

比较结果不能在元素留在优先队列时悄然变化。例如元素只保存编号，比较器却读取一个会被修改的外部优先级数组，原有顶部不会自动重新排列。

常用做法是把“加入时的优先级和编号”一起保存为 `pair` 或 `struct`。取出时再检查这份记录是否已经过期；具体检查条件由后续算法定义。

## 基础练习

1. 向 `priority_queue<int>` 加入 `4,1,7,4`，手动写出全部取出顺序。
2. 把动态最大值程序改为动态最小值，不修改操作分支。
3. 随机生成合法加入与删除操作，用 `vector` 遍历寻找最大值作为独立参考，与 `priority_queue` 对拍。
4. 使用 `greater<pair<int, int>>` 配置小根优先队列，按 `first`、`second` 依次升序输出所有数对。
5. 为“分数较高者先取，同分时编号较小者先取”编写 `struct` 和比较器。
6. 分别设计主字段和次字段的测试，检查自定义比较器的两层方向。
7. 复制一个优先队列后输出全部元素，验证原队列的数量和顶部没有改变。

## 需要记住什么

1. `priority_queue<int>` 默认让最大值还是最小值位于顶部？
2. `push`、`top`、`pop`、`empty` 和 `size` 分别做什么？
3. 哪两个接口要求优先队列非空？
4. 为什么取出并删除顶部必须先 `top()` 再 `pop()`？
5. 怎样声明一个最小整数优先的 `priority_queue`？三个模板参数各是什么？
6. `pair` 的默认优先级先比较哪个字段？相等时再比较什么？
7. 对 `priority_queue` 来说，自定义比较器对 `(a,b)` 返回 `true` 时，谁的取出优先级更低？
8. 为什么比较器不能使用 `<=` 或依赖会变化的外部状态？
9. 各常用接口的时间复杂度是什么？
10. 为什么不能通过下标或范围 `for` 直接遍历 `priority_queue`？

`emplace`、`swap`、使用迭代器批量构造、自定义底层容器的完整约束和对象失效规则不属于基础竞赛接口，需要时查阅标准库资料即可，不要求记忆。

## 下一篇

下一篇 [有序关联容器：set](set.md) 会维护一组不重复元素，并支持按顺序查找和遍历。
