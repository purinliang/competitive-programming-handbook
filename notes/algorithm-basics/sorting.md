# 排序：基础排序

> 最近修订：2026-08-13 05:21 +10:00（未审阅）

[STL 算法：排序](../cpp/sorting.md) 已经教会我们在解题时直接调用 `sort`。但要理解“排序”这个算法问题，还需要亲自回答三个问题：

1. 怎样通过一系列局部操作保证整个序列最终有序？
2. 为什么某一部分完成后可以不再处理？
3. 不同方法需要多少比较、移动和额外空间？

本篇依次推导冒泡排序、选择排序、插入排序和计数排序。前三种只根据元素之间的比较决定顺序，最坏时间都是 $O(n^2)$；计数排序利用整数值域，在值域较小时可以达到线性级别。

## 排序目标

给定 1-based 数组 `a[1..n]`，升序排序要求：

$$
a[1]\le a[2]\le\cdots\le a[n]
$$

相等元素可以相邻出现，不要求删除重复值。排序后的元素必须与原数组完全相同，只改变排列顺序，不能凭空增加、丢失或修改数值。

下面所有数组实现都使用 `vector<int> a(n + 5)` 作为底层空间，但逻辑区间始终是 `a[1..n]`。

## 逆序对与相邻交换

若 $i<j$ 却有 $a[i]>a[j]$，那么这两个元素的先后与升序目标相反，称为一个逆序对。

只看相邻元素时，如果 `a[j] > a[j + 1]`，交换它们会消除这一对相邻逆序：

```cpp
if (a[j] > a[j + 1]) {
    swap(a[j], a[j + 1]);
}
```

不断修复相邻逆序，最终没有任何相邻位置满足前大后小。此时每一对相邻元素都非递减，整个数组也就有序。这是冒泡排序的出发点。

## 冒泡排序：一轮确定最大值

从左向右比较 `a[j]` 与 `a[j+1]`。较大的值会在交换后继续向右参加下一次比较。

以 `4 2 5 1 3` 为例，第一轮状态依次变为：

```text
4 2 5 1 3
2 4 5 1 3
2 4 5 1 3
2 4 1 5 3
2 4 1 3 5
```

第一轮结束后，全局最大值 `5` 一定到达最右端。理由是：当前较大者每次都继续向右，扫描到末尾时，它已经与沿途所有元素比较过。

既然 `a[n]` 已经正确，下一轮只扫描到 `n-1`；再下一轮只扫描到 `n-2`。令 `end` 表示本轮尚未确定的最右位置：

```cpp
for (int end = n; end >= 2; end--) {
    for (int j = 1; j < end; j++) {
        if (a[j] > a[j + 1]) {
            swap(a[j], a[j + 1]);
        }
    }
}
```

第一个外层循环结束后 `a[n]` 正确，第二个结束后 `a[n-1..n]` 正确。这个不断扩大的有序后缀就是冒泡排序保持的不变量；当 `end` 缩小到 `2` 并完成最后一轮后，整个数组有序。

## 冒泡排序：提前结束

若一整轮没有发生交换，说明当前范围不存在相邻逆序，整个尚未确定的前缀已经有序，可以立即结束：

```cpp
void bubble_sort(vector<int>& a, int n) {
    for (int end = n; end >= 2; end--) {
        bool swapped = false;
        for (int j = 1; j < end; j++) {
            if (a[j] > a[j + 1]) {
                swap(a[j], a[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) {
            break;
        }
    }
}
```

逆序数组需要约 $n(n-1)/2$ 次比较和大量交换，最坏时间是 $O(n^2)$。已经有序时第一轮没有交换，最好时间是 $O(n)$。算法只使用循环变量和一个布尔值，额外空间是 $O(1)$。

交换条件使用严格的 `>`，相等元素不会交换先后，因此这种冒泡排序是稳定排序。

## 选择排序：选择最小值

另一种思路是直接确定每个位置应该放谁。要确定 `a[1]`，扫描 `a[1..n]` 找出最小值；把它与 `a[1]` 交换。此后 `a[1]` 已经正确，不再参与后续选择。

确定 `a[i]` 时，只在尚未排列的后缀 `a[i..n]` 中寻找最小值。变量 `minimum_index` 保存当前找到的最小值下标：

```cpp
int minimum_index = i;
for (int j = i + 1; j <= n; j++) {
    if (a[j] < a[minimum_index]) {
        minimum_index = j;
    }
}
swap(a[i], a[minimum_index]);
```

完整过程是：

```cpp
void selection_sort(vector<int>& a, int n) {
    for (int i = 1; i <= n; i++) {
        int minimum_index = i;
        for (int j = i + 1; j <= n; j++) {
            if (a[j] < a[minimum_index]) {
                minimum_index = j;
            }
        }
        swap(a[i], a[minimum_index]);
    }
}
```

第 $i$ 轮开始前，前缀 `a[1..i-1]` 已经包含全局最小的 $i-1$ 个值并排列正确；本轮从剩余后缀选出最小值放到 `a[i]`，因此不变量继续成立。

无论输入原来是否有序，选择排序都要完成约 $n(n-1)/2$ 次比较，时间复杂度是 $O(n^2)$，额外空间是 $O(1)$。它每轮最多进行一次交换，交换次数只有 $O(n)$。

这种直接交换可能越过相等元素，改变它们的相对顺序，因此基础选择排序不稳定。

## 插入排序：维护有序前缀

整理手中的扑克牌时，可以让左边始终保持有序，再把下一张牌插入合适位置。数组中的 `a[1]` 单独看已经有序；从 `i=2` 开始，假设 `a[1..i-1]` 已经排好，把 `a[i]` 插进去。

先保存待插入值：

```cpp
int value = a[i];
int j = i - 1;
```

只要左边元素比 `value` 大，就把它向右移动一格：

```cpp
while (j >= 1 && a[j] > value) {
    a[j + 1] = a[j];
    j--;
}
```

循环停止时，`j` 位于数组左边界之外，或 `a[j] <= value`。因此 `j+1` 正好是 `value` 应插入的位置：

```cpp
a[j + 1] = value;
```

不能一开始就反复交换或覆盖 `a[i]` 而不保存它；后缀向右移动时，原位置会被其他元素占用。

完整实现是：

```cpp
void insertion_sort(vector<int>& a, int n) {
    for (int i = 2; i <= n; i++) {
        int value = a[i];
        int j = i - 1;
        while (j >= 1 && a[j] > value) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = value;
    }
}
```

每轮结束后，有序前缀从 `a[1..i-1]` 扩大为 `a[1..i]`。当 `i=n` 的一轮完成，整个数组有序。

逆序数组中，第 $i$ 个值要跨过前面的 $i-1$ 个元素，最坏时间是 $O(n^2)$。已经有序时，`while` 每轮立即停止，最好时间是 $O(n)$。额外空间是 $O(1)$。

移动条件使用 `a[j] > value`，相等元素不会越过待插入值，所以这种插入排序稳定。它对几乎有序的数据通常移动很少，是三个平方排序中最有实际价值的一种。

## 稳定排序

若元素除了排序关键字还有其他信息，稳定排序会保持关键字相等元素原来的相对顺序。

例如记录按分数升序排列：

```text
(id=1, score=90)  (id=2, score=80)  (id=3, score=90)
```

稳定排序后，两个 `90` 分的记录仍保持 `id=1` 在 `id=3` 前。对只有一个整数值的数组，相等元素无法从数值上区分，稳定性暂时看不出来；但它是组合多级排序时的重要性质。

本篇实现中：

- 冒泡排序稳定；
- 选择排序不稳定；
- 插入排序稳定。

稳定性由具体实现决定，不能只凭算法名称猜测。若把冒泡或插入的严格 `>` 改成 `>=`，相等元素也可能交换或移动，稳定性就会被破坏。

## 计数排序：不比较元素

前三种算法只询问“两个元素谁更小”，不利用整数的具体范围。若题目保证所有值都位于一个较小整数区间，可以直接统计每个值出现多少次。

例如：

```text
3 1 3 2 1 3
```

计数结果是：

| 数值 | 1 | 2 | 3 |
| ---: | ---: | ---: | ---: |
| 出现次数 | 2 | 1 | 3 |

按照数值从小到大，把 `1` 输出两次、`2` 输出一次、`3` 输出三次，就得到有序序列。

## 支持负数的下标偏移

数组下标不能直接使用负值。设输入最小值为 `minimum`、最大值为 `maximum`，把数值 `value` 映射到 1-based 计数下标：

$$
\text{index}=\text{value}-\text{minimum}+1
$$

最小值映射到 `1`，最大值映射到：

$$
k=\text{maximum}-\text{minimum}+1
$$

其中 $k$ 是值域中整数的数量。建立 `count[1..k]` 后统计：

```cpp
for (int i = 1; i <= n; i++) {
    int index = a[i] - minimum + 1;
    count[index]++;
}
```

再从小到大还原：

```cpp
int position = 1;
for (int index = 1; index <= k; index++) {
    int value = minimum + index - 1;
    while (count[index] > 0) {
        a[position++] = value;
        count[index]--;
    }
}
```

## 计数排序实现

```cpp
void counting_sort(vector<int>& a, int n) {
    if (n == 0) {
        return;
    }

    int minimum = a[1];
    int maximum = a[1];
    for (int i = 2; i <= n; i++) {
        minimum = min(minimum, a[i]);
        maximum = max(maximum, a[i]);
    }

    int k = maximum - minimum + 1;
    vector<int> count(k + 5);
    for (int i = 1; i <= n; i++) {
        int index = a[i] - minimum + 1;
        count[index]++;
    }

    int position = 1;
    for (int index = 1; index <= k; index++) {
        int value = minimum + index - 1;
        while (count[index] > 0) {
            a[position++] = value;
            count[index]--;
        }
    }
}
```

寻找最值和统计分别扫描 $O(n)$ 次，还原要检查 $k$ 个计数并总共写回 $n$ 个元素，所以时间复杂度是 $O(n+k)$，额外空间是 $O(k)$。

计数排序只适合整数值域较小的情况。若只有十个整数，却分布在 `-1000000000..1000000000`，建立几十亿个计数位置完全不可行；此时应使用比较排序。

上面的基础版本只重建整数值，没有记录可供区分的相等元素，因此不讨论稳定性。要稳定排列带有附加信息的记录，需要把计数变成前缀位置并使用额外输出数组，属于计数排序的后续扩展。

## 计数排序与桶排序

竞赛口语中，有时会把“为每个整数值开一个计数格”的方法称为桶排序。但更精确地区分：

- 计数排序为每个离散整数值统计出现次数；
- 桶排序把一段范围划成若干桶，把元素分配到桶中，再分别处理桶内顺序。

计数排序可以看成每个可能值对应一个桶的特殊情况，但一般桶排序允许一个桶包含许多不同值。因此本书把本篇算法统一称为计数排序；看到题解把同样的计数数组叫“桶”时，知道它表达的实现即可。

## 四种算法比较

| 算法 | 最好时间 | 最坏时间 | 额外空间 | 本篇实现稳定 |
| --- | ---: | ---: | ---: | --- |
| 冒泡排序 | $O(n)$ | $O(n^2)$ | $O(1)$ | 是 |
| 选择排序 | $O(n^2)$ | $O(n^2)$ | $O(1)$ | 否 |
| 插入排序 | $O(n)$ | $O(n^2)$ | $O(1)$ | 是 |
| 计数排序 | $O(n+k)$ | $O(n+k)$ | $O(k)$ | 基础整数版不讨论 |

前三种算法适合学习局部操作、不变量和复杂度，不是大规模一般排序的默认选择。实际比赛中，一般比较排序直接使用 `sort`；计数排序则在整数值域确实较小时有独立价值。

## 完整代码

下面的程序读入排序方法名称、长度 $n$ 和数组，并调用对应实现。若选择 `counting`，输入保证所有整数都在 `-1000000..1000000` 内，因此值域差能安全放入 `int`，计数数组也不会过大。

```cpp
#include <bits/stdc++.h>
using namespace std;

void bubble_sort(vector<int>& a, int n) {
    for (int end = n; end >= 2; end--) {
        bool swapped = false;
        for (int j = 1; j < end; j++) {
            if (a[j] > a[j + 1]) {
                swap(a[j], a[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) {
            break;
        }
    }
}

void selection_sort(vector<int>& a, int n) {
    for (int i = 1; i <= n; i++) {
        int minimum_index = i;
        for (int j = i + 1; j <= n; j++) {
            if (a[j] < a[minimum_index]) {
                minimum_index = j;
            }
        }
        swap(a[i], a[minimum_index]);
    }
}

void insertion_sort(vector<int>& a, int n) {
    for (int i = 2; i <= n; i++) {
        int value = a[i];
        int j = i - 1;
        while (j >= 1 && a[j] > value) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = value;
    }
}

void counting_sort(vector<int>& a, int n) {
    if (n == 0) {
        return;
    }

    int minimum = a[1];
    int maximum = a[1];
    for (int i = 2; i <= n; i++) {
        minimum = min(minimum, a[i]);
        maximum = max(maximum, a[i]);
    }

    int k = maximum - minimum + 1;
    vector<int> count(k + 5);
    for (int i = 1; i <= n; i++) {
        int index = a[i] - minimum + 1;
        count[index]++;
    }

    int position = 1;
    for (int index = 1; index <= k; index++) {
        int value = minimum + index - 1;
        while (count[index] > 0) {
            a[position++] = value;
            count[index]--;
        }
    }
}

int main() {
    string method;
    int n;
    cin >> method >> n;

    vector<int> a(n + 5);
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
    }

    if (method == "bubble") {
        bubble_sort(a, n);
    } else if (method == "selection") {
        selection_sort(a, n);
    } else if (method == "insertion") {
        insertion_sort(a, n);
    } else {
        counting_sort(a, n);
    }

    for (int i = 1; i <= n; i++) {
        if (i > 1) {
            cout << ' ';
        }
        cout << a[i];
    }
    cout << '\n';
    return 0;
}
```

输入：

```text
insertion 7
5 -1 3 3 0 8 -2
```

输出：

```text
-2 -1 0 3 3 5 8
```

输入保证 `method` 是 `bubble`、`selection`、`insertion` 或 `counting` 之一，所以最后一个 `else` 对应计数排序。若输入不受保证，应当显式判断 `method == "counting"` 并处理未知名称。

## 常见错误

### 冒泡扫描已经确定的后缀

每轮结束后最右元素已经正确，下一轮的右边界应缩小。一直扫描完整数组不会破坏正确性，但会做无意义比较。

### 选择排序忘记记录下标

找到最小值后要与 `a[i]` 交换，因此必须保存 `minimum_index`，不能只保存最小数值而丢失它的位置。

### 插入排序覆盖待插入值

移动有序前缀前先把 `a[i]` 保存为 `value`。否则第一次向右覆盖就可能丢失原元素。

### 插入排序移动相等元素

稳定实现只移动严格大于 `value` 的元素。使用 `>=` 会让原来更早出现的相等元素越过当前值。

### 计数数组忽略最小值偏移

输入含负数或最小值不为零时，使用 `value - minimum + 1` 映射到 1-based 下标，不能直接把 `value` 当数组下标。

### 只看 n，不看值域 k

计数排序的时间和空间都依赖 $k$。值域跨度巨大时，即使 $n$ 很小也不适合建立计数数组。

## 基础练习

1. 手动完成 `4 2 5 1 3` 的每一轮冒泡，并标出已经确定的后缀。
2. 手动完成同一数组的选择排序，并记录每轮的 `minimum_index`。
3. 手动将每个元素插入有序前缀，记录移动次数和插入位置。
4. 构造输入展示基础选择排序为什么不稳定。
5. 分别用已排序、逆序和含大量相等元素的数组测试三个比较排序。
6. 使用计数排序排列包含负数的数组，写出偏移后的计数下标。
7. 找出一个 $n$ 很小但不适合计数排序的值域，再找出一个 $n$ 很大但计数排序很合适的值域。
8. 为四种实现生成短随机数组，与 `std::sort` 的结果比较。

## 需要记住什么

1. 排序后的数组必须满足哪两个条件：顺序和元素集合分别怎样变化？
2. 冒泡排序为什么一轮能确定当前最大值？什么时候可以提前结束？
3. 选择排序每轮维护什么有序前缀？为什么已经有序时仍是 $O(n^2)$？
4. 插入排序为什么要先保存 `a[i]`？`j+1` 为什么是最终插入位置？
5. 三个比较排序的最好、最坏时间和额外空间分别是什么？
6. 什么是稳定排序？本篇哪些实现稳定，哪些不稳定？
7. 计数排序为什么能绕过元素两两比较？$k$ 表示什么？
8. 计数排序怎样支持负数？为什么值域过大时不能使用？
9. 计数排序与更一般的桶排序是什么关系？
10. 为什么实际比赛中的一般排序仍优先使用 `sort`？

鸡尾酒排序、希尔排序、堆排序、基数排序和一般桶排序不属于本篇基础主线。快速排序与归并排序会分别展示两种最重要的 $O(n\log n)$ 思路；堆排序、基数排序等保留在扩展阅读索引中。

## 下一篇

下一篇 [排序：快速排序](quicksort.md) 会选择一个基准值，把较小和较大的元素分到两侧，再递归处理两个子区间。
