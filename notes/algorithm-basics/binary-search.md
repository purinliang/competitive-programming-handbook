# 查找：二分查找

> 最近修订：2026-08-13 20:27 +10:00（未审阅）

在无序数组中寻找目标值，只能逐个检查，最坏需要 $O(n)$ 时间。若数组已经按升序排列，一次比较不仅能判断中间元素是否等于目标，还能排除中点某一侧的全部位置。

二分查找反复检查候选区间中点，并在每轮删除至少一半不可能包含答案的位置，把查找时间降低到 $O(\log n)$。

## 有序是前提

考虑升序数组：

```text
1 3 4 7 9 12 15
```

寻找 `9` 时，先检查中间的 `7`。因为 `7 < 9`，中点及其左边的所有值都不可能等于 `9`，可以一次排除前四个位置。

若数组无序，例如：

```text
1 12 4 7 3 9 15
```

中点 `7 < 9` 并不能说明目标在右边，因为左侧仍有 `12`，顺序关系无法推导位置关系。二分查找只能用于已经有序，或具有同类单调性质的范围。

如果只是为了查找一次而先排序，总代价是 $O(n\log n)$，通常不如一次 $O(n)$ 顺序查找。排序后二分的价值在于同一组数据要处理很多次查询，或数据本来就有序。

## 闭区间候选范围

本篇使用 1-based 数组和闭区间 `[l,r]` 表示仍可能包含目标的位置。初始时，所有逻辑元素都是候选：

```cpp
int l = 1;
int r = n;
```

只要 `l <= r`，候选区间非空。中点写作：

```cpp
int mid = l + (r - l) / 2;
```

这与 `(l + r) / 2` 的数学结果相同，但避免先计算可能溢出的 `l + r`。

## 三种比较结果

比较 `a[mid]` 与 `target`：

### 中点等于目标

```cpp
if (a[mid] == target) {
    return mid;
}
```

已经找到一个合法位置，可以立即返回。

### 中点小于目标

数组升序，所以 `a[l..mid]` 都不大于 `a[mid]`，也就都小于目标。新的候选区间是 `[mid+1,r]`：

```cpp
l = mid + 1;
```

不能写 `l = mid`。当区间只剩两个位置且 `mid == l` 时，左边界不会变化，循环可能永远重复。

### 中点大于目标

同理，`a[mid..r]` 都大于目标，可以排除，留下 `[l,mid-1]`：

```cpp
r = mid - 1;
```

## 精确查找

```cpp
int binary_search_index(const vector<int>& a, int n, int target) {
    int l = 1;
    int r = n;

    while (l <= r) {
        int mid = l + (r - l) / 2;
        if (a[mid] == target) {
            return mid;
        }
        if (a[mid] < target) {
            l = mid + 1;
        } else {
            r = mid - 1;
        }
    }

    return -1;
}
```

`-1` 不可能是 1-based 合法下标，因此用它表示没有找到。

循环开始时保持这条不变量：如果目标存在但尚未返回，那么至少一个目标位置仍在 `[l,r]` 中。每次比较只删除已经由有序性证明不可能包含目标的部分，所以不变量继续成立。

循环结束时 `l > r`，候选区间为空。根据不变量，目标不可能存在，因此返回 `-1` 正确。

## 重复值的问题

对数组：

```text
1 3 3 3 7
```

精确查找 `3` 可能返回下标 `2`、`3` 或 `4`，取决于中点和过程。它只承诺找到任意一个目标，不承诺第一次出现位置。

许多问题真正需要的是边界：

- 第一个不小于 `target` 的位置；
- 第一个大于 `target` 的位置；
- 最后一个小于或等于 `target` 的位置。

这些问题不能在找到相等值时立即停止，因为左边或右边可能还有更靠近边界的答案。

## 第一个不小于目标的位置

寻找最小下标 `position`，使：

$$
a[position]\ge target
$$

若不存在，返回 `n+1`。这个位置紧接在逻辑数组之后，不会与任何合法下标冲突。

先把 `answer` 初始化为“尚不存在”：

```cpp
int answer = n + 1;
```

仍然搜索闭区间 `[l,r]`。若 `a[mid] >= target`，`mid` 是一个可行位置，但左边可能还有更早的可行位置：

```cpp
answer = mid;
r = mid - 1;
```

若 `a[mid] < target`，中点和左侧全部不可能满足条件：

```cpp
l = mid + 1;
```

完整函数是：

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

`answer` 始终保存已经找到的最早可行位置，或初始哨兵 `n+1`；`[l,r]` 保存尚未排除、仍可能产生更早答案的位置。

遇到可行中点时，保存它并继续向左；遇到不可行中点时，丢弃它和更小位置。循环结束后没有未知位置，`answer` 就是最小可行下标。

## 用下界判断是否存在

第一个不小于 `target` 的位置只有两种情况：

- 它仍在 `1..n` 且数值恰好等于 `target`，目标存在；
- 它是更大的值或 `n+1`，目标不存在。

```cpp
int position = lower_bound_index(a, n, target);

if (position <= n && a[position] == target) {
    printf("found at %d\n", position);
} else {
    printf("not found\n");
}
```

必须先判断 `position <= n`，再访问 `a[position]`。逻辑与的短路规则保证哨兵 `n+1` 不会进入后面的数组访问。

有重复值时，这种方法返回目标第一次出现的位置。没有重复值时，它与精确查找得到的位置相同。

## 其他边界

把可行条件改成 `a[mid] > target`，同样向左寻找，可以得到第一个严格大于目标的位置：

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

若 `left = lower_bound_index(...)`、`right = upper_bound_index(...)`，那么等于目标的元素位于闭区间 `[left,right-1]`，出现次数是：

```cpp
int count = right - left;
```

目标不存在时两个边界相等，次数自然为 $0$。

最后一个不大于目标的位置可以由第一个大于目标的位置减一得到：

```cpp
int last_not_greater = upper_bound_index(a, n, target) - 1;
```

结果可能是 `0`，表示所有元素都大于目标。使用前同样要检查它是否落在逻辑区间 `1..n`。

## STL 接口

标准库已经提供 `binary_search`、`lower_bound` 和 `upper_bound`，接口使用左闭右开迭代器范围。

对 1-based 逻辑数组 `a[1..n]`：

```cpp
bool exists = binary_search(a.begin() + 1, a.begin() + n + 1, target);

auto lower = lower_bound(a.begin() + 1, a.begin() + n + 1, target);
auto upper = upper_bound(a.begin() + 1, a.begin() + n + 1, target);
```

迭代器转成 1-based 下标：

```cpp
int left = lower - a.begin();
int right = upper - a.begin();
int count = right - left;
```

找不到不小于目标的元素时，`lower == a.begin() + n + 1`，转换后正好得到哨兵 `n+1`。

比赛中只需要普通边界查询时，应直接使用经过验证的标准库接口；自己写闭区间模板的价值是理解排除逻辑，并为后续无法直接调用 STL 的二分答案建立可靠思考方式。

## 时间复杂度

长度为 $n$ 的候选区间每轮最多保留约一半：

$$
n,\frac n2,\frac n4,\ldots,1
$$

因此循环执行 $O(\log n)$ 轮，每轮只做常数次比较与赋值，时间复杂度是 $O(\log n)$，额外空间是 $O(1)$。

若需要先排序，排序成本是 $O(n\log n)$；之后每次查询是 $O(\log n)$。对 $q$ 次查询，总时间是：

$$
O(n\log n+q\log n)
$$

## 完整代码

下面的程序读入一个已经非递减排列的 1-based 数组和目标值，输出目标第一次出现的下标与出现次数；不存在时输出 `-1 0`。

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

int main() {
    int n, target;
    scanf("%d%d", &n, &target);

    vector<int> a(n + 5);
    for (int i = 1; i <= n; i++) {
        scanf("%d", &a[i]);
    }

    int left = lower_bound_index(a, n, target);
    int right = upper_bound_index(a, n, target);

    if (left <= n && a[left] == target) {
        printf("%d %d\n", left, right - left);
    } else {
        printf("-1 0\n");
    }
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
3 3
```

## 常见错误

### 在无序数组上二分

没有顺序或单调性质时，中点比较不能排除一整侧。先确认前置条件，而不是看到“查找”就套二分。

### 闭区间循环写成 l < r

本篇 `[l,r]` 中的两个端点都可能是答案，因此非空条件是 `l <= r`。只剩一个位置时仍要检查。

### 更新边界时不排除 mid

精确查找中已经证明 `a[mid] < target` 后，必须写 `l = mid + 1`；另一侧写 `r = mid - 1`。保留 `mid` 可能让区间不再缩小。

### 找到相等值就返回边界答案

重复值中任意一个相等位置不一定是第一次出现。下界查找遇到 `a[mid] >= target` 时先保存，再继续向左。

### 访问 n + 1

边界函数使用 `n+1` 表示不存在。访问数组前先检查返回值是否在 `1..n`。

### 混用闭区间和 STL 范围

自写模板处理闭区间 `[1,n]`；STL 调用传入左闭右开 `[begin()+1,begin()+n+1)`。两套边界分别保持自洽，只在接口处翻译。

## 基础练习

1. 在七个有序数中寻找目标，逐轮记录 `l,r,mid` 和被排除的区间。
2. 测试空数组、单元素数组、目标小于最小值和大于最大值的情况。
3. 在含重复值的数组中比较精确查找与下界查找的返回结果。
4. 独立实现第一个大于目标的位置，并用两个边界统计出现次数。
5. 用 `upper_bound_index(...) - 1` 求最后一个不大于目标的位置，处理结果为 `0` 的情况。
6. 把自写下界、上界与 STL `lower_bound`、`upper_bound` 随机对拍。
7. 比较“一次线性查找”和“先排序再做 $q$ 次二分”的总复杂度，分析什么规模下排序值得。

## 需要记住什么

1. 二分查找为什么要求数组有序或判断条件单调？
2. 闭区间 `[l,r]` 的非空条件是什么？中点和两侧边界怎样更新？
3. 精确查找的循环不变量是什么？返回 `-1` 表示什么？
4. 为什么精确查找不能保证返回重复值第一次出现的位置？
5. 下界 `lower_bound` 的准确含义是什么？本篇用哪个哨兵表示不存在？
6. 下界遇到可行中点后为什么还要继续向左？`answer` 保存什么？
7. 上界 `upper_bound` 与下界的条件有什么区别？怎样统计目标出现次数？
8. STL 的二分接口使用什么区间约定？1-based 数组怎样传入完整逻辑范围？
9. 二分查找的时间和额外空间复杂度是多少？先排序时总成本怎样变化？

自定义比较器版本、浮点二分、指数搜索和并行二分不属于本篇基础查找。下一篇会把“寻找有序数组中的位置”推广为“寻找第一个满足单调判定的答案”。

## 下一篇

下一篇 [二分答案](binary-search-on-answer.md) 会把候选数值区间作为搜索范围，并通过可行性判定排除一半答案。
