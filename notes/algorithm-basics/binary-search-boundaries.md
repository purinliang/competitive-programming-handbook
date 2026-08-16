# 二分边界

> 最近修订：2026-08-16 13:25 +10:00（未审阅）

[二分查找](binary-search.md) 在遇到 `a[mid] == target` 时立即返回，因此只保证找到
任意一个相等位置。若数组含重复值，许多问题真正需要的是相等区间的左右边界，或者
某个值应当插入的位置。

本篇分别推导两个最基础的边界：第一个不小于 `target` 的位置，以及第一个大于
`target` 的位置。它们组合后还能判断存在、统计次数并得到最后一个不大于目标的
位置。

## 第一个不小于目标的位置

给定 1-based 非递减数组 `a[1..n]`，下界是满足以下条件的最小下标：

$$
a[position]\ge target.
$$

例如：

```text
下标： 1 2 3 4 5 6
数组： 1 3 3 3 7 9
```

`target = 3` 时，下界为 `2`；`target = 5` 时，下界为 `5`。若目标大于所有
元素，就不存在合法位置，本篇返回哨兵 `n + 1`。

令 `answer` 先表示尚未找到可行位置：

```cpp
int answer = n + 1;
```

仍在闭区间 `[l,r]` 中检查中点。若 `a[mid] >= target`，`mid` 已经可行，但左边
可能还有更早的可行位置，因此先保存，再继续向左：

```cpp
answer = mid;
r = mid - 1;
```

若 `a[mid] < target`，升序保证中点及其左侧全部不可行：

```cpp
l = mid + 1;
```

完整函数为：

```cpp
int lower_bound_index(const vector<int>& a, int n, int target) {
    int l = 1;
    int r = n;
    int answer = n + 1;

    while (l <= r) {
        int mid = l + (r - l) / 2;

        if (a[mid] >= target) {
            answer = mid;
            r = mid - 1;
        } else {
            l = mid + 1;
        }
    }

    return answer;
}
```

循环中，`answer` 始终是已经检查过的最早可行位置，或者哨兵；`[l,r]` 是尚未
排除、仍可能产生更早答案的范围。循环结束后未知范围为空，所以 `answer` 就是整个
数组的最早可行位置。

## 为什么遇到相等不能返回

在数组 `1 3 3 3 7` 中，第一次检查可能正好得到中间的下标 `3`。它确实等于目标，
但下标 `2` 也是答案，而且更早。

边界查找不问“这个位置是否可行”，而问“最早的可行位置在哪里”。所以遇到
`a[mid] >= target` 只能把它保存成候选，仍要检查左边是否存在更优位置。

这与任意位置查找的循环目标不同。把两种代码强行写在同一个函数里，再靠临时修改
比较符号记忆，最容易产生边界错误。

## 第一个大于目标的位置

上界是满足以下条件的最小下标：

$$
a[position]>target.
$$

推导与下界相同，只把“可行”条件从 `>= target` 改成 `> target`：

```cpp
int upper_bound_index(const vector<int>& a, int n, int target) {
    int l = 1;
    int r = n;
    int answer = n + 1;

    while (l <= r) {
        int mid = l + (r - l) / 2;

        if (a[mid] > target) {
            answer = mid;
            r = mid - 1;
        } else {
            l = mid + 1;
        }
    }

    return answer;
}
```

在 `1 3 3 3 7 9` 中，`target = 3` 的上界是 `5`；若目标不小于所有元素，返回
`n + 1`。

## 判断存在与统计次数

令：

```cpp
int lower = lower_bound_index(a, n, target);
int upper = upper_bound_index(a, n, target);
```

若 `lower <= n && a[lower] == target`，目标存在，且所有相等元素恰好位于闭区间：

```text
[lower, upper - 1]
```

出现次数为：

```cpp
int count = upper - lower;
```

目标不存在时，`lower == upper`，次数自然为 `0`。例如数组 `1 3 3 7` 中查找
`5`，两个边界都位于下标 `4`。

判断存在时必须先检查 `lower <= n`，再读取 `a[lower]`。`&&` 的短路求值保证
哨兵 `n + 1` 不会进入数组访问。

## 从两个边界得到其他答案

第一个大于目标的位置前一格，就是最后一个不大于目标的位置：

```cpp
int last_not_greater = upper_bound_index(a, n, target) - 1;
```

结果可能为 `0`，表示所有元素都大于目标。

同理，第一个不小于目标的位置前一格，是最后一个严格小于目标的位置：

```cpp
int last_less = lower_bound_index(a, n, target) - 1;
```

“减一”以后得到的可能是边界哨兵，使用前要按问题需要检查是否落在 `1..n`。

不要为了每一种中文描述背一份新循环。先把问题转换成“第一个 `>=`”或“第一个
`>`”，再由相邻位置推出其他边界，代码会更统一。

## 完整代码

下面的程序输出目标第一次出现位置、最后一次出现位置和次数；不存在时输出
`-1 -1 0`：

```cpp
#include <bits/stdc++.h>
using namespace std;

int lower_bound_index(const vector<int>& a, int n, int target) {
    int l = 1;
    int r = n;
    int answer = n + 1;

    while (l <= r) {
        int mid = l + (r - l) / 2;

        if (a[mid] >= target) {
            answer = mid;
            r = mid - 1;
        } else {
            l = mid + 1;
        }
    }

    return answer;
}

int upper_bound_index(const vector<int>& a, int n, int target) {
    int l = 1;
    int r = n;
    int answer = n + 1;

    while (l <= r) {
        int mid = l + (r - l) / 2;

        if (a[mid] > target) {
            answer = mid;
            r = mid - 1;
        } else {
            l = mid + 1;
        }
    }

    return answer;
}

void solve() {
    int n, target;
    cin >> n >> target;

    vector<int> a(n + 5);
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
    }

    int lower = lower_bound_index(a, n, target);
    int upper = upper_bound_index(a, n, target);

    if (lower <= n && a[lower] == target) {
        cout << lower << ' ' << upper - 1 << ' ';
        cout << upper - lower << '\n';
    } else {
        cout << "-1 -1 0\n";
    }
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
8 3
-2 1 3 3 3 5 8 10
```

输出：

```text
3 5 3
```

## 复杂度

两个函数分别进行 $O(\log n)$ 轮，每轮只做常数工作。先后调用它们仍是
$O(\log n)$ 时间，而不是 $O(\log^2 n)$；两个对数复杂度相加只改变常数倍。

每个函数只使用固定数量的变量，额外空间复杂度是 $O(1)$。

## 常见错误

### 找到相等值立即返回

这只能得到任意相等位置，不能保证左边界或右边界。

### 混淆下界与上界

下界寻找第一个 `>= target`；上界寻找第一个 `> target`。等号是否属于可行条件
决定相等值被放在边界哪一侧。

### 忘记不存在时的 n + 1

边界函数不一定返回合法元素下标。读取数组前先检查范围。

### 把出现次数写成 upper - lower + 1

相等元素位于闭区间 `[lower,upper-1]`，长度是 `upper - lower`。

### 把两次二分误算为 O(log² n)

顺序执行的成本相加，不是相乘。只有一次操作内部又完整执行另一轮二分时，才需要
考虑乘积。

## 需要记住什么

1. 下界与上界分别寻找哪一个位置？
2. 为什么边界查找遇到可行中点后还不能返回？
3. `answer` 与 `[l,r]` 在循环中分别表示什么？
4. 不存在符合条件的位置时为什么返回 `n + 1`？
5. 怎样利用下界判断目标是否存在？
6. 为什么出现次数是 `upper - lower`？
7. 怎样得到最后一个不大于目标和最后一个小于目标的位置？
8. 两次边界二分的总时间复杂度为什么仍是 $O(\log n)$？
