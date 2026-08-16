# 分治

> 最近修订：2026-08-17 10:04 +10:00（未审阅）

后面的 [快速排序](quicksort.md) 和 [归并排序](merge-sort.md) 都会把一个区间变成
规模更小的同类区间，再递归处理。这里先把它们共同使用的思路单独抽出
来：分治（divide-and-conquer）。

分治不是“只要从中间递归就是更快”。它必须说明怎样划分子问题、子问题返回什么答案，以及怎样由这些答案恢复原问题的答案。本篇用最大子段和完整推导这三个部分。

## 最大子段和

给定一个长度为 $n$ 的整数数组，选择一个非空连续子段，使其中元素之和最大。

例如：

```text
-2 3 -1 4 2 -6 1
```

选择第 `2..5` 项：

```text
3 -1 4 2
```

元素和是 `8`，没有其他非空连续子段的和更大，所以答案是 `8`。

“非空”很重要。若数组全部为负数，答案应是其中最大的单个元素，而不是没有选择任何元素得到的 `0`。

## 枚举左右端点

一个连续子段由左端点 `l` 和右端点 `r` 唯一确定。最直接的做法枚举所有满足 `1 <= l <= r <= n` 的端点，并计算每段的元素和。

若每次重新从 `l` 加到 `r`，共有 $O(n^2)$ 个子段，每次求和最多需要 $O(n)$ 时间，总时间会达到 $O(n^3)$。

固定左端点后，可以让右端点逐格向右，并把新元素加入 `sum`：

```cpp
ll answer = a[1];

for (int l = 1; l <= n; l++) {
    ll sum = 0;
    for (int r = l; r <= n; r++) {
        sum += a[r];
        if (sum > answer) {
            answer = sum;
        }
    }
}
```

每个子段的和只用 $O(1)$ 时间更新，总时间降为 $O(n^2)$。这已经是可靠的朴素算法，也可以用来检验更快算法。

## 从中点划分

现在只考虑闭区间 `a[l..r]` 内的最大子段和。取中点：

```cpp
int mid = l + (r - l) / 2;
```

原区间被分成两个不重叠的闭区间：

```text
a[l..mid]    a[mid+1..r]
```

区间 `a[l..r]` 内的任意非空连续子段只可能属于三类：

1. 完全位于左半区；
2. 完全位于右半区；
3. 同时经过左右半区，也就是跨过 `mid` 与 `mid+1` 之间的分界。

前两类仍然是规模更小的最大子段和问题，可以交给同一个函数递归解决。第三类同时使用两边，不能只查看两个递归答案，必须在当前层单独计算。

## 最小区间

数组 `a` 是整道题共享的输入，不必在每层递归中重复传递。把函数定义为：

```cpp
ll maximum_subarray(int l, int r)
```

它返回闭区间 `a[l..r]` 内的最大非空子段和。

当 `l == r` 时，区间内只有 `a[l]`。唯一的非空连续子段就是它自身，因此可以直接返回：

```cpp
if (l == r) {
    return a[l];
}
```

这是递归的终止条件。它同时保证全负数组不会凭空选择和为 `0` 的空子段。

## 左右子问题

区间长度大于 `1` 时，先递归计算完全位于左右两侧的最佳答案：

```cpp
int mid = l + (r - l) / 2;

ll left_answer = maximum_subarray(l, mid);
ll right_answer = maximum_subarray(mid + 1, r);
```

两个递归区间都比 `a[l..r]` 更短。不断划分后，每条递归路径最终都会到达 `l == r`，不会无限递归。

`left_answer` 和 `right_answer` 只覆盖前两类子段。若真正答案跨过分界，它既不完整属于左边，也不完整属于右边，所以还没有被二者记录。

## 跨中点子段

任何跨过分界的连续子段，都必须包含 `a[mid]` 和 `a[mid+1]`。它可以唯一拆成两部分：

- `a[l..mid]` 的一个非空后缀；
- `a[mid+1..r]` 的一个非空前缀。

要让两部分总和最大，左边应选择最大后缀和，右边应选择最大前缀和。

从 `mid` 向左逐项累加，可以枚举所有包含 `a[mid]` 的后缀：

```cpp
ll left_suffix = a[mid];
ll sum = 0;

for (int i = mid; i >= l; i--) {
    sum += a[i];
    if (sum > left_suffix) {
        left_suffix = sum;
    }
}
```

`left_suffix` 初始化为 `a[mid]`，而不是 `0`，因为左侧部分必须非空。

再从 `mid + 1` 向右逐项累加，得到最大非空前缀和：

```cpp
ll right_prefix = a[mid + 1];
sum = 0;

for (int i = mid + 1; i <= r; i++) {
    sum += a[i];
    if (sum > right_prefix) {
        right_prefix = sum;
    }
}
```

左右选择互不冲突。任意一个跨中点子段的和，都等于某个左后缀和加某个右前缀和，所以其中的最大值就是：

```cpp
ll cross_answer = left_suffix + right_prefix;
```

这一步把左右两侧的信息组合成了第三类答案，称为分治的合并步骤。

## 合并三个答案

所有合法子段已经被三类情况完整覆盖，因此当前区间的答案是三者最大值：

```cpp
ll answer = left_answer;
if (right_answer > answer) {
    answer = right_answer;
}
if (cross_answer > answer) {
    answer = cross_answer;
}
return answer;
```

完整递归函数为：

```cpp
ll maximum_subarray(int l, int r) {
    if (l == r) {
        return a[l];
    }

    int mid = l + (r - l) / 2;
    ll left_answer = maximum_subarray(l, mid);
    ll right_answer = maximum_subarray(mid + 1, r);

    ll left_suffix = a[mid];
    ll sum = 0;
    for (int i = mid; i >= l; i--) {
        sum += a[i];
        if (sum > left_suffix) {
            left_suffix = sum;
        }
    }

    ll right_prefix = a[mid + 1];
    sum = 0;
    for (int i = mid + 1; i <= r; i++) {
        sum += a[i];
        if (sum > right_prefix) {
            right_prefix = sum;
        }
    }

    ll cross_answer = left_suffix + right_prefix;
    ll answer = left_answer;
    if (right_answer > answer) {
        answer = right_answer;
    }
    if (cross_answer > answer) {
        answer = cross_answer;
    }
    return answer;
}
```

这里没有在函数开头一次定义所有变量。每个量都只在相应步骤需要它时出现：先有
左右子问题，才需要 `left_answer` 和 `right_answer`；发现跨中点情况缺失以后，
才引入 `left_suffix`、`right_prefix` 和 `cross_answer`。

## 手动合并

回到数组：

```text
-2 3 -1 4 | 2 -6 1
```

最外层调用处理 `a[1..7]`，所以 `mid = 4`。

两个递归子问题返回：

| 子问题 | 最大子段 | 返回值 |
| --- | --- | ---: |
| `a[1..4]` | `3 -1 4` | 6 |
| `a[5..7]` | `2` | 2 |

跨中点答案还要计算两侧边界：

| 扫描方向 | 候选和 | 最大值 |
| --- | --- | ---: |
| 从 `a[4]` 向左 | `4, 3, 6, 4` | 6 |
| 从 `a[5]` 向右 | `2, -4, -3` | 2 |

最大左后缀是 `3 -1 4`，最大右前缀是 `2`，所以跨中点答案为：

```text
6 + 2 = 8
```

当前层在左侧答案 `6`、右侧答案 `2` 和跨中点答案 `8` 中取最大值，返回 `8`。

## 分治的三个步骤

这个例子可以概括成分治的固定检查框架：

1. **划分**：把 `a[l..r]` 分成左右两个更短的闭区间；
2. **解决**：递归得到左右半区的最大子段和；
3. **合并**：补上跨过左右分界的最大子段，再从三类答案中取最大值。

快速排序的主要工作发生在递归之前：先分区，再解决两侧。归并排序和本例的主要
组合发生在递归之后：先得到子问题答案，再合并。分治不要求所有算法具有完全相同
的代码顺序，但必须保证子问题足够小、最终可终止，并且原问题的所有答案情况都被
覆盖。

## 正确性

可以按照区间长度归纳 `maximum_subarray(l, r)` 的返回值。

- 当区间长度为 `1` 时，函数返回唯一元素，也就是唯一非空子段的和；
- 假设所有更短区间都能返回正确答案；
- 当前区间的任意最优子段若完全位于左侧，就被 `left_answer` 覆盖；若完全位于右侧，就被 `right_answer` 覆盖；
- 若它跨过中点，就一定由左半区的一个后缀和右半区的一个前缀组成，而 `cross_answer` 分别选取两边最大值，所以覆盖了这一类中的最优答案；
- 三类互相涵盖全部可能，取三者最大值就是当前区间的最大子段和。

因此每层递归都返回其负责区间的正确答案，最外层调用最终返回整个数组的最大子段和。

## 时间复杂度

长度为 $n$ 的问题被分成两个长度约为 $n/2$ 的子问题。当前层扫描左右半区一次来计算跨中点答案，需要 $O(n)$ 时间，因此：

$$
T(n)=T(\lfloor n/2\rfloor)+T(\lceil n/2\rceil)+O(n).
$$

递归树同一层的区间互不重叠，总长度为 $n$，所以每层总共处理 $O(n)$ 个元素。区间长度每层大约减半，共有 $O(\log n)$ 层，总时间复杂度为：

$$
O(n\log n).
$$

输入数组不计入额外空间。函数没有建立随区间增长的临时数组，每层只保存固定数量的边界和值；递归深度是 $O(\log n)$，所以额外空间复杂度是 $O(\log n)$。

本问题还存在 $O(n)$ 的动态规划做法，后续学习动态规划时会重新处理它。本篇使用它是为了清楚展示非平凡的合并步骤，而不是声称分治是这个问题的最快算法。

## 完整代码

下面的程序读入一个非空数组，输出最大非空连续子段和。输入保证
$1\le n\le2\times10^5$，任意连续子段和都能使用 64 位整数保存。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const int MAXN = 2e5 + 5;

int n;
ll a[MAXN];

ll maximum_subarray(int l, int r) {
    if (l == r) {
        return a[l];
    }

    int mid = l + (r - l) / 2;
    ll left_answer = maximum_subarray(l, mid);
    ll right_answer = maximum_subarray(mid + 1, r);

    ll left_suffix = a[mid];
    ll sum = 0;
    for (int i = mid; i >= l; i--) {
        sum += a[i];
        if (sum > left_suffix) {
            left_suffix = sum;
        }
    }

    ll right_prefix = a[mid + 1];
    sum = 0;
    for (int i = mid + 1; i <= r; i++) {
        sum += a[i];
        if (sum > right_prefix) {
            right_prefix = sum;
        }
    }

    ll cross_answer = left_suffix + right_prefix;
    ll answer = left_answer;
    if (right_answer > answer) {
        answer = right_answer;
    }
    if (cross_answer > answer) {
        answer = cross_answer;
    }
    return answer;
}

void solve() {
    cin >> n;

    for (int i = 1; i <= n; i++) {
        cin >> a[i];
    }

    cout << maximum_subarray(1, n) << '\n';
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
7
-2 3 -1 4 2 -6 1
```

输出：

```text
8
```

## 常见错误

### 把空子段当成答案

若后缀和、前缀和或总答案全部初始化为 `0`，全负数组会错误返回 `0`。本题要求非空，所以最小区间返回唯一元素，两侧合并值也分别从边界元素开始。

### 遗漏跨中点情况

只比较 `left_answer` 和 `right_answer` 会丢失同时使用左右两边的子段。
划分以后必须检查：有没有合法答案跨越子问题边界？若有，合并步骤就要恢复它。

### 把任意左子段与右子段相加

跨中点结果必须连续。左侧只能取以 `mid` 结尾的后缀，右侧只能取以 `mid + 1` 开始的前缀；分别取半区内部任意最大子段再相加，可能在中间留下空隙。

### 子问题没有缩小

左右递归必须是 `a[l..mid]` 和 `a[mid+1..r]`。若第二个区间仍从 `mid` 开始，当 `r = l + 1` 时可能再次得到原区间，导致无限递归。

### 只计算递归调用次数

递归树共有 $O(n)$ 个调用，不代表算法就是 $O(n)$。每个非叶调用还会扫描自己的整个区间；应按层累加这些合并成本。

### 忽略求和范围

单个元素可以放进 32 位整数，不代表一整段的和也可以。正文使用 64 位整数保存元素、部分和和答案；仍需由题目数据范围确认所有中间结果不会溢出。

## 需要记住什么

1. 分治的划分、解决与合并三个步骤分别回答什么问题？
2. 为什么划分出的子问题必须与原问题同类并且规模严格缩小？
3. 最大子段相对中点为什么恰好分成三类？
4. 为什么跨中点子段一定是左半区后缀加右半区前缀？
5. 为什么后缀和、前缀和与终止条件都不能把空子段作为候选？
6. 怎样用区间长度归纳证明递归函数正确？
7. 为什么递归树每层的总扫描量是 $O(n)$？时间和额外空间复杂度分别是多少？
8. 遇到新的分治算法时，除了“从中间递归”以外还必须检查什么？

分治是一种构造算法的思考方式，不是一份可以忽略题意直接复制的固定模板。真正需要记住的是子问题返回值必须足以完成合并，并且合并必须覆盖所有跨边界答案。
