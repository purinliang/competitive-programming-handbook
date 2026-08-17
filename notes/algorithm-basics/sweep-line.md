# 扫描线与事件排序

> 最近修订：2026-08-17 05:25 +10:00（未审阅）

[离线算法](offline-algorithms.md) 通过重排询问，把阈值变成单调移动的边界。
扫描线进一步把“某个位置发生了什么”整理成事件，再按照坐标顺序依次处理。

扫描线经常出现在计算几何中，但它不只属于几何。区间覆盖、会议时间、人口变化、
同时在线人数等问题，本质上都可以让一条想象中的线从左向右移动，并维护当前
仍然有效的对象。

## 问题：点被多少个闭区间覆盖

给定 $n$ 个闭区间：

$$
[l_1,r_1],[l_2,r_2],\ldots,[l_n,r_n],
$$

再给出 $q$ 个查询点 `x`，对每个点统计有多少个区间包含它。

逐个查询检查全部区间需要 $O(nq)$。扫描线只关心三类变化：

1. 到达区间左端点：一个区间开始生效；
2. 到达查询点：记录当前有效区间数量；
3. 越过区间右端点：一个区间停止生效。

## 把对象变成事件

为每个区间 `[l,r]` 建立两个事件：

```text
(l, 开始)
(r, 结束)
```

为每个查询点 `x` 建立：

```text
(x, 查询, id)
```

事件结构：

```cpp
struct Event {
    ll coordinate;
    int type;
    int id;
};
```

`id` 只对查询事件有意义，用来恢复输入顺序。

从左到右处理事件，维护当前覆盖数 `active`：

```text
开始事件：active++
查询事件：answer[id] = active
结束事件：active--
```

## 相同坐标的先后顺序

题目给的是闭区间 `[l,r]`：

- 查询点 `x=l` 应当被区间覆盖；
- 查询点 `x=r` 也应当被区间覆盖。

因此同一坐标必须按下面的顺序处理：

```text
开始 -> 查询 -> 结束
```

给事件类型直接编号：

```cpp
const int START = 0;
const int QUERY = 1;
const int END = 2;
```

排序时先按坐标，再按类型：

```cpp
sort(
    events.begin(),
    events.end(),
    [](const Event& a, const Event& b) {
        if (a.coordinate != b.coordinate) {
            return a.coordinate < b.coordinate;
        }
        return a.type < b.type;
    });
```

类型编号不是随便取的，它把闭区间边界语义编码进排序规则。

若题目使用左闭右开区间 `[l,r)`，同坐标处必须让结束事件早于查询事件；否则
`x=r` 会被错误计入。

## 扫描不变量

处理某个查询事件时，维护：

> `active` 等于所有满足 `l <= x <= r` 的区间数量。

因为：

- 左端点小于当前坐标的区间已经执行开始事件；
- 左端点等于当前坐标的区间在查询前开始；
- 右端点等于当前坐标的区间在查询后才结束；
- 右端点小于当前坐标的区间已经执行结束事件。

所以查询时仍然活跃的区间，恰好就是覆盖当前点的闭区间。

## 为什么叫扫描线

在一维问题中，可以想象一个点从数轴左端移动到右端。二维几何中，则常想象一条
竖直线沿 $x$ 轴移动：

- 遇到图形左边界时加入对象；
- 遇到图形右边界时删除对象；
- 在移动过程中维护与扫描线相交的对象。

算法不会真的连续移动。只有到达事件坐标时状态才会变化，因此只需排序并处理
有限个事件。

简单问题的状态只是一个整数 `active`。更复杂的扫描线会用 `set`、树状数组或
线段树维护当前对象的顺序、长度或最值。事件排序负责第一个维度，数据结构负责
剩余维度。

## 与差分的关系

整数坐标上也可以在 `l` 处加一、`r+1` 处减一，再做前缀和。这是扫描思想在
稠密离散坐标上的特例。

事件排序更一般：

- 坐标可以很大，不必开与坐标范围等长的数组；
- 坐标可以是实数，无法直接使用 `r+1`；
- 事件可以不只是简单加减；
- 同坐标优先级可以精确表达开闭边界。

## 完整代码

下面统计每个查询点被多少个闭区间覆盖。坐标使用 64 位整数。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const int START = 0;
const int QUERY = 1;
const int END = 2;

struct Event {
    ll coordinate;
    int type;
    int id;
};

int n, q;
vector<Event> events;
vector<int> answer;

void solve() {
    cin >> n >> q;

    events.clear();
    events.reserve(2 * n + q);
    answer.assign(q + 5, 0);

    for (int i = 1; i <= n; i++) {
        ll l, r;
        cin >> l >> r;
        events.push_back({l, START, 0});
        events.push_back({r, END, 0});
    }

    for (int i = 1; i <= q; i++) {
        ll x;
        cin >> x;
        events.push_back({x, QUERY, i});
    }

    sort(
        events.begin(),
        events.end(),
        [](const Event& a, const Event& b) {
            if (a.coordinate != b.coordinate) {
                return a.coordinate < b.coordinate;
            }
            return a.type < b.type;
        });

    int active = 0;

    for (const Event& event : events) {
        if (event.type == START) {
            active++;
        } else if (event.type == QUERY) {
            answer[event.id] = active;
        } else {
            active--;
        }
    }

    for (int i = 1; i <= q; i++) {
        cout << answer[i] << '\n';
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 复杂度

共有 $2n+q$ 个事件：

- 建立事件：$O(n+q)$；
- 排序：$O((n+q)\log(n+q))$；
- 扫描：$O(n+q)$；
- 空间复杂度：$O(n+q)$。

## 常见错误

- 只按坐标排序，没有定义相同坐标的事件优先级；
- 闭区间问题让结束事件早于查询，漏掉右端点；
- 查询点与左端点相同却在开始事件前回答；
- 重排查询后忘记用 `id` 恢复输出顺序；
- 把 `r+1` 的差分写法直接用于实数坐标；
- 认为扫描线必须每个坐标都移动一步；
- 二维问题只排序一个维度，却没有数据结构维护另一维状态。

## 需要记住什么

- 扫描线怎样把连续位置变化压缩成有限事件？
- 闭区间在同一坐标为什么必须按“开始、查询、结束”处理？
- 事件的 `type` 编号为什么属于算法正确性的一部分？
- 扫描线与差分有什么联系和区别？
- 复杂扫描线中，排序与数据结构分别负责什么？

