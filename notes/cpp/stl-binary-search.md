# 标准库二分查找

> 最近修订：2026-08-16 13:50 +10:00（未审阅）

[二分查找](../algorithm-basics/binary-search.md) 和
[二分边界](../algorithm-basics/binary-search-boundaries.md) 已经解释了怎样在有序数组
中排除候选。实际比赛只需要查询有序范围时，应优先使用标准库已经实现并测试过的
`binary_search`、`lower_bound` 和 `upper_bound`。

这些函数使用迭代器表示左闭右开范围。本篇重点不是重新证明二分，而是把已经理解的
边界准确翻译成 STL 接口。

## 共同前提

所有 STL 二分接口都要求查询范围已经按照与查询兼容的顺序排列。默认情况下，它们
使用严格小于关系，与默认升序 `sort` 配套：

```cpp
sort(a.begin(), a.end());
bool exists = binary_search(a.begin(), a.end(), target);
```

若范围无序，函数仍然可以编译运行，但返回结果没有题目所需的保证。标准库不会先
替你检查或排序，因为那会改变复杂度和数据。

只为一次查询专门排序仍然通常不如线性查找；STL 接口没有改变这个成本判断。

## binary_search 只回答是否存在

```cpp
bool exists = binary_search(a.begin(), a.end(), target);
```

返回值只有 `true` 或 `false`，不返回迭代器或下标。若只需要判断存在，它直接表达
目的；若还需要位置、重复次数或插入点，应使用边界接口。

名字与我们手写的查找概念相同，但它位于 `std` 命名空间。本书竞赛代码使用
`using namespace std;`，所以可以省略 `std::`。

## lower_bound

```cpp
auto lower = lower_bound(a.begin(), a.end(), target);
```

`lower` 指向范围中第一个不小于 `target` 的元素。若所有元素都小于目标，它等于
右端迭代器 `a.end()`。

在原生 0-based `vector` 中，迭代器转换为下标：

```cpp
int index = lower - a.begin();
```

若 `lower == a.end()`，得到的 `index == a.size()`，它是逻辑末尾而不是合法元素
下标。读取 `*lower` 以前必须先判断：

```cpp
if (lower != a.end() && *lower == target) {
    // target exists
}
```

条件顺序利用 `&&` 短路，避免对 `end()` 解引用。

## upper_bound

```cpp
auto upper = upper_bound(a.begin(), a.end(), target);
```

`upper` 指向第一个严格大于 `target` 的元素。若不存在，它同样等于 `a.end()`。

在非递减范围中，所有等于目标的元素恰好位于左闭右开迭代器范围：

```cpp
[lower, upper)
```

因此出现次数为：

```cpp
int count = upper - lower;
```

目标不存在时两个迭代器相等，结果自然是 `0`。

## equal_range

标准库还可以一次取得两个边界：

```cpp
auto [lower, upper] = equal_range(a.begin(), a.end(), target);
```

它返回一个 `pair`，两个成员分别等价于相应的 `lower_bound` 和 `upper_bound`。
C++17 结构化绑定把它们直接命名为 `lower`、`upper`。

只需要一个边界时，仍直接调用对应函数；同时需要两端时，`equal_range` 能更清楚地
表达“取得等价范围”。三种写法的渐进时间复杂度都是 $O(\log n)$。

## 传入 1-based 工作数组

本书自定义算法通常把逻辑数据放在 `a[1..n]`，但 STL 接口仍使用左闭右开范围。
完整逻辑范围应写成：

```cpp
auto first = a.begin() + 1;
auto last = a.begin() + n + 1;

auto lower = lower_bound(first, last, target);
auto upper = upper_bound(first, last, target);
```

转换回 1-based 下标仍然减去容器起点：

```cpp
int lower_index = lower - a.begin();
int upper_index = upper - a.begin();
```

找不到更大元素时，结果正好是 `n + 1`。不要减去 `first` 后又忘记加 `1`；直接
减去 `a.begin()` 最不容易混淆。

这是本书约定的典型接口边界：自定义对象保持 1-based 闭区间，交给 STL 时显式
转换成迭代器左闭右开范围。

## 自定义顺序必须一致

若排序时使用了比较器，二分也必须使用兼容的比较器：

```cpp
sort(a.begin(), a.end(), greater<int>());

auto lower = lower_bound(a.begin(), a.end(), target, greater<int>());
```

降序中的“lower bound”仍由传入的严格顺序定义，不再是普通数值意义的第一个
`>= target`。因此初学时优先在默认升序上使用二分；需要自定义顺序时，先明确
比较器下什么叫“排在目标以前”。

自定义结构体也遵循同一规则。若 [sort](sort.md) 使用了某个比较器，二分范围
必须按完全兼容的顺序排列。先按一个字段排序、再按另一个无关字段二分，结果没有
保证。

比较器必须表示严格顺序，不能使用 `<=` 或 `>=`。排序、二分和等价判断的规则若
不一致，代码即使看起来类型正确，也可能在边界处得到错误结果。

## 完整代码

下面的程序使用原生 0-based `vector`，输出目标第一次出现下标、最后一次出现下标
和次数；不存在时输出 `-1 -1 0`：

```cpp
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int n, target;
    cin >> n >> target;

    vector<int> a(n);
    for (int i = 0; i < n; i++) {
        cin >> a[i];
    }

    auto [lower, upper] = equal_range(a.begin(), a.end(), target);

    if (lower != a.end() && *lower == target) {
        int first = lower - a.begin();
        int last = upper - a.begin() - 1;
        int count = upper - lower;
        cout << first << ' ' << last << ' ' << count << '\n';
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
2 4 3
```

这里直接讲解 STL 容器接口，所以保留原生 0-based 下标。与手写 1-based 版本相比，
两份输出的下标相差 `1`，不是算法结论不同。

## 复杂度

对支持随机访问的 `vector` 迭代器，`binary_search`、`lower_bound`、`upper_bound`
与 `equal_range` 都进行 $O(\log n)$ 次比较，额外空间为 $O(1)$。

它们也能接受某些非随机访问迭代器，但移动迭代器的成本可能是线性的。竞赛中对
`set`、`map` 等容器查询边界时，应优先使用容器自己的成员函数，而不是把
`lower_bound` 算法作用在它们的迭代器上。

## 常见错误

### 在未排序范围上调用

函数不会自动排序。范围必须已经按与查询兼容的比较规则排列。

### 解引用 end

`lower_bound` 和 `upper_bound` 可能返回右端迭代器。先比较是否等于 `end()`，
再使用 `*iterator`。

### 把 binary_search 当成位置

它返回 `bool`。需要位置时使用边界迭代器并减去范围对应的容器起点。

### 1-based 范围漏掉右端加一

逻辑闭区间 `a[1..n]` 应传入 `[begin()+1,begin()+n+1)`。

### 排序与二分使用不同比较器

二分的正确性来自范围顺序。两套比较规则不兼容时，中点无法安全排除一侧。

### 对 set 使用通用 lower_bound

通用算法的比较次数仍是对数级，但非随机访问迭代器的移动可能是线性的。使用
`container.lower_bound(key)` 才能利用容器内部结构。

## 需要记住什么

1. `binary_search` 返回什么？什么时候使用它？
2. `lower_bound` 与 `upper_bound` 分别指向什么？
3. 找不到符合条件的元素时返回哪个迭代器？为什么不能解引用？
4. 怎样计算目标出现次数？`equal_range` 返回什么？
5. 原生 0-based `vector` 怎样把迭代器转换为下标？
6. 1-based 逻辑范围怎样转换成 STL 左闭右开范围？
7. 为什么排序和二分必须使用兼容的比较规则？
8. 为什么关联容器应优先调用自己的边界成员函数？
