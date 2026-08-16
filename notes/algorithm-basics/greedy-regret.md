# 反悔贪心

> 最近修订：2026-08-16 16:00 +10:00（未审阅）

[贪心选择与正确性证明](greedy-selection-and-proof.md) 中，每次接受一个区间以后就不再撤销。但有些问题在看到当前候选时，还无法确定它是否比未来候选更值得保留。

这时可以先接受当前选择；一旦已选集合变得不合法，就撤销其中最差的一项。竞赛中常把这种“先选，再在必要时撤销”的方法称为反悔贪心。

反悔是算法决策，不等于使用堆。基础版本可以线性寻找应撤销的元素；若需要反复撤销当前最值，再用 `priority_queue` 把寻找过程加速。

## 最多按时完成的任务

有 $n$ 个任务。第 $i$ 个任务需要 `duration[i]` 单位时间，并且必须在时刻 `deadline[i]` 之前完成。

机器一次只能处理一个任务，选中的任务都从时刻 $0$ 开始连续执行。可以放弃一些任务，目标是让按时完成的任务数量最多。

例如任务 `(3, 4)` 表示需要 `3` 单位时间，最晚必须在时刻 `4` 完成。

## 先按截止时间排序

若已经决定选择哪些任务，把它们按截止时间非递减执行不会更差。交换一对截止时间逆序的相邻任务时，较早截止的任务会提前完成，较晚截止的任务在交换后的完成时刻不变，因此不会制造新的超时。

所以先排序：

```cpp
struct Task {
    ll duration;
    ll deadline;
};

bool compare_task(const Task& a, const Task& b) {
    if (a.deadline != b.deadline) {
        return a.deadline < b.deadline;
    }
    return a.duration < b.duration;
}
```

```cpp
sort(tasks.begin() + 1, tasks.begin() + n + 1, compare_task);
```

现在从左到右处理任务时，未来任务的截止时间不会早于当前任务。

## 先接受当前任务

令 `total_time` 表示当前已选任务的总时长。读到任务 `i` 时，先暂时接受它：

```cpp
total_time += tasks[i].duration;
```

若：

```cpp
total_time <= tasks[i].deadline
```

当前已选任务仍能按照截止时间顺序全部完成，不需要撤销。

若总时长超过当前截止时间，当前前缀中的任务不可能全部保留：它们的截止时间都不晚于当前或已经在更早位置检查过，而机器在当前截止时间前没有足够时间完成这些工作。

## 超时时撤销最长任务

必须删除一个已选任务时，应删除处理时间最长的任务。

删除任意一个任务都会让已选数量减少 `1`；删除最长任务能让剩余总时长最小，为后面的任务留下最多时间。若另一种方案删除了较短任务 `y`、却保留更长任务 `x`，把 `x` 换成 `y` 不会增加已选数量，还会让总时长减少或保持不变。

这就是本题的反悔动作：

```text
先接受当前任务
若超时，撤销已选任务中耗时最长的一项
```

被撤销的可能正是当前任务。若当前任务特别长，算法会尝试它，然后立即发现保留旧选择更好。

## 为什么只需撤销一次

加入当前任务之前，原已选集合可行，设原总时长为 $T$。当前任务时长为 $x$，加入后变成 $T+x$。

最长已选时长 `longest` 一定满足：

$$
longest\ge x
$$

撤销最长任务后：

$$
T+x-longest\le T
$$

原集合在不晚于当前的截止时间内可行，所以新总时长也一定重新满足当前截止时间。每次加入只可能需要撤销一项，不需要写 `while` 连续删除。

## 先用线性扫描实现

不使用堆也能完成反悔。用一个无序数组保存已选任务时长；超时后扫描它，找到最大值并用最后一项覆盖删除位置：

```cpp
selected_count++;
selected_duration[selected_count] = tasks[i].duration;
total_time += tasks[i].duration;

if (total_time > tasks[i].deadline) {
    int longest_pos = 1;
    for (int j = 2; j <= selected_count; j++) {
        if (selected_duration[j] > selected_duration[longest_pos]) {
            longest_pos = j;
        }
    }

    total_time -= selected_duration[longest_pos];
    selected_duration[longest_pos] = selected_duration[selected_count];
    selected_count--;
}
```

已选数组不需要维持顺序，所以可以用末项覆盖被删除位置。每次寻找最长任务需要 $O(n)$ 时间，总时间会达到 $O(n^2)$。

这份写法已经完整表达算法：`priority_queue` 不会改变选择规则，只负责更快找到最长任务。

## 用大根堆加速撤销

C++ 的 `priority_queue<ll>` 默认让最大值位于堆顶，正好维护当前已选任务中的最长时长：

```cpp
priority_queue<ll> selected;
```

接受任务：

```cpp
selected.push(tasks[i].duration);
total_time += tasks[i].duration;
```

超时时撤销堆顶：

```cpp
if (total_time > tasks[i].deadline) {
    total_time -= selected.top();
    selected.pop();
}
```

最终 `selected.size()` 就是最多能按时完成的任务数量。

## 手动过程

任务已经按截止时间排序：

```text
(3, 4) (2, 5) (4, 6) (1, 6) (3, 9)
```

| 当前任务 | 暂时接受后的总时长 | 是否超时 | 撤销 | 保留数量 |
| --- | ---: | --- | --- | ---: |
| `(3, 4)` | 3 | 否 | 无 | 1 |
| `(2, 5)` | 5 | 否 | 无 | 2 |
| `(4, 6)` | 9 | 是 | 撤销时长 4 | 2 |
| `(1, 6)` | 6 | 否 | 无 | 3 |
| `(3, 9)` | 9 | 否 | 无 | 4 |

第三个任务先被接受，但它使总时长变成 `9 > 6`；当前最长任务正是它自己，因此算法撤销这次选择。最终可以按时完成四个任务。

## 完整代码

下面读入任务时长与截止时间，输出最多能按时完成多少个任务。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct Task {
    ll duration;
    ll deadline;
};

int n;
vector<Task> tasks;

bool compare_task(const Task& a, const Task& b) {
    if (a.deadline != b.deadline) {
        return a.deadline < b.deadline;
    }
    return a.duration < b.duration;
}

int maximum_completed_tasks() {
    sort(tasks.begin() + 1, tasks.begin() + n + 1, compare_task);

    ll total_time = 0;
    priority_queue<ll> selected;

    for (int i = 1; i <= n; i++) {
        selected.push(tasks[i].duration);
        total_time += tasks[i].duration;

        if (total_time > tasks[i].deadline) {
            total_time -= selected.top();
            selected.pop();
        }
    }

    return selected.size();
}

void solve() {
    scanf("%d", &n);

    tasks.assign(n + 5, {});
    for (int i = 1; i <= n; i++) {
        scanf("%lld%lld", &tasks[i].duration, &tasks[i].deadline);
    }

    printf("%d\n", maximum_completed_tasks());
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
5
3 4
2 5
4 6
1 6
3 9
```

输出：

```text
4
```

## 正确性

按截止时间排序后，当前已选任务若总时长不超过当前截止时间，就能依次完成；删除任务只会让更早的完成时刻提前，因此不会破坏已经满足的限制。

加入当前任务后若超时，至少要放弃一个已选任务。所有只放弃一项的选择都会保留相同数量的任务，而放弃最长任务会使剩余总时长最小。对于任意放弃较短任务的方案，都可以用该较短任务替换它保留的最长任务，使任务数量不变、总时长不增。因此保留最长任务不会比撤销它为当前或未来提供更多机会。

每次冲突时执行这次交换后，算法保留同样多且总时长尽可能小的候选；未来截止时间不早于当前截止时间，更小的已用时间只会留下更多可用时间。重复处理全部任务后，不存在另一种方案能够保留更多任务，所以堆中任务数量最大。

## 复杂度

排序需要 $O(n\log n)$ 时间。每个任务入堆一次、至多有一个任务出堆一次，每次堆操作需要 $O(\log n)$ 时间，因此总时间复杂度是 $O(n\log n)$，堆和任务数组空间是 $O(n)$。

若线性扫描寻找最长任务，选择逻辑完全相同，但最坏时间复杂度会变成 $O(n^2)$。

## 如何恢复具体任务

若只求最大数量，堆中保存时长即可。若还要输出任务编号，可以保存：

```cpp
priority_queue<pair<ll, int>> selected;
```

并用一个布尔数组记录任务是否仍被选中。最终把被保留的任务按截止时间重新排列，就是一种合法执行顺序。

这只是输出信息的扩展，不改变“超时后撤销最长任务”的决策。

## 常见错误

### 没有先按截止时间排序

只有按截止时间扫描，当前前缀才表示需要在当前时刻前完成的限制。按输入顺序处理没有正确性保证。

### 超时后撤销当前任务

当前任务不一定最差。它可能很短，替换一个更长的旧任务以后能为未来留下更多时间。

### 使用小根堆

本题需要撤销最长任务，应使用默认大根堆。哈夫曼编码需要取最小值才使用小根堆，二者不能按“都叫贪心”混用。

### 误写成反复删除

加入前的集合已经可行，撤销的最长任务不会短于当前新任务，因此删除一次后总时长不超过加入前，不需要 `while`。

### 只记录任务数量

是否超时取决于总时长；要同时维护 `total_time`。堆的大小只表示当前保留数量。

### 把堆当作正确性的来源

正确性来自“超时后撤销最长任务”的交换论证。堆只把寻找最长任务从线性时间降到对数时间。

## 基础练习

1. 手动模拟示例中的堆、`total_time` 和保留数量。
2. 构造一个当前任务很短、应撤销旧任务的例子。
3. 证明删除最长任务后只需检查一次，不需要继续弹出。
4. 使用无序数组线性寻找最长任务，实现 $O(n^2)$ 版本。
5. 在堆中同时保存任务编号，输出最终保留的任务集合。
6. 枚举小规模任务子集，检查是否能按截止时间完成，与贪心答案对拍。

## 需要记住什么

1. 反悔贪心与不可撤销的基础贪心有什么区别？
2. 为什么选中的任务可以按截止时间非递减执行？
3. 为什么处理当前任务时先暂时接受它？
4. 超过截止时间时，为什么必须撤销至少一个任务？
5. 为什么撤销最长任务为未来留下的时间最多？
6. 为什么每次最多只需要撤销一个任务？
7. 线性扫描版本怎样找到并删除最长任务？
8. `priority_queue` 加速了哪一步？它是否改变贪心规则？
9. 排序、入堆与出堆共同得到什么复杂度？
10. 若要输出具体选择，需要在堆中额外保存什么？
