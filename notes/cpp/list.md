# `list`

> 最近修订：2026-08-17 00:26 +10:00（未审阅）

C++ 标准库的 `list` 是一个**双向链表**容器。它替我们维护节点、前驱、后继和存储释放，并通过迭代器表示节点位置。

```cpp
list<int> values;
```

使用 `list` 以前应先理解[链表的基本概念](../algorithm-basics/linked-list.md)与[双向链表](../algorithm-basics/doubly-linked-list.md)：容器接口虽然隐藏了链接细节，却不会改变链表的复杂度性质。

## 建立与遍历

可以直接列出初始元素：

```cpp
list<int> values = {10, 20, 30};
```

`list` 不提供下标运算符，不能写：

```cpp
values[1]
```

它的节点不要求连续存储，也不能根据整数下标直接计算目标位置。遍历通常使用范围 `for`：

```cpp
for (int value : values) {
    cout << value << '\n';
}
```

或者显式使用迭代器：

```cpp
for (auto it = values.begin(); it != values.end(); it++) {
    cout << *it << '\n';
}
```

`begin()` 指向首元素，`end()` 表示尾元素之后的位置。非空 `list` 还可以用 `front()` 和 `back()` 访问首尾元素。

## 首尾插入与删除

双向链表能够在两端快速修改：

```cpp
values.push_front(5);
values.push_back(40);
values.pop_front();
values.pop_back();
```

这些操作都是 $O(1)$。调用 `front()`、`back()`、`pop_front()` 或 `pop_back()` 以前必须保证容器非空。

`size()` 返回当前元素数量，`empty()` 判断是否为空：

```cpp
if (!values.empty()) {
    cout << values.front() << '\n';
}
```

## 迭代器就是已经找到的位置

手写链表中，“已知节点编号”后插入删除是 $O(1)$。`list` 中对应的前提是：已经拿到指向目标位置的迭代器。

`insert` 把新元素插在迭代器所指位置以前：

```cpp
auto it = values.begin();
it++;
values.insert(it, 15);
```

若原序列是 `10 20 30`，`it` 指向 `20`，插入后变成：

```text
10 15 20 30
```

在 `end()` 以前插入就等于尾部追加：

```cpp
values.insert(values.end(), 40);
```

`erase(it)` 删除 `it` 指向的元素，并返回被删除元素之后的迭代器：

```cpp
it = values.erase(it);
```

已经有合法迭代器时，单次 `insert` 或 `erase` 是 $O(1)$。

## 按第 k 个位置寻找仍是线性时间

如果只知道逻辑位置，必须从 `begin()` 沿链表移动：

```cpp
int position = 3;
auto it = values.begin();

for (int i = 1; i < position; i++) {
    it++;
}
```

寻找第 `position` 个元素最坏需要 $O(n)$。随后 $O(1)$ 的插入或删除不会改变整体的 $O(n)$。

标准库的 `advance(it, distance)` 也能移动迭代器，但对 `list` 仍然要逐个经过中间节点，不会因为写成一个函数调用就变成随机访问。

## 遍历时删除

删除元素会使指向这个元素的迭代器失效。下面的写法错误：

```cpp
for (auto it = values.begin(); it != values.end(); it++) {
    if (*it < 0) {
        values.erase(it);
    }
}
```

`erase(it)` 后，循环末尾仍试图对已经失效的 `it` 执行 `it++`。

正确做法是使用 `erase` 返回的后继位置：

```cpp
for (auto it = values.begin(); it != values.end();) {
    if (*it < 0) {
        it = values.erase(it);
    } else {
        it++;
    }
}
```

向 `list` 插入元素通常不会让已有元素的迭代器失效；删除只使指向被删除元素的迭代器失效。这个稳定性正是节点式容器的重要性质。

## 为什么不能使用标准 sort

标准库算法 `sort(first, last)` 需要能够快速跳到任意位置的随机访问迭代器。`list` 的迭代器只能沿前驱和后继逐步移动，因此下面的代码不能编译：

```cpp
sort(values.begin(), values.end());
```

`list` 提供自己的成员函数：

```cpp
values.sort();
```

它通过重新组织链表完成排序，不要求随机访问。还可以使用：

```cpp
values.reverse();
values.unique();
```

`unique()` 仍然只处理相邻的重复元素；一般去重前通常要先 `sort()`，与标准库 [`unique`](unique.md) 的核心规则一致。

## list 与 vector 怎样选择

| 操作 | `vector` | `list` |
| --- | ---: | ---: |
| 按下标访问 | $O(1)$ | 不支持 |
| 遍历 | $O(n)$，连续存储通常更快 | $O(n)$ |
| 尾部追加 | 均摊 $O(1)$ | $O(1)$ |
| 已知位置后插入删除 | $O(n)$ | $O(1)$ |
| 寻找第 $k$ 个位置 | $O(1)$ | $O(n)$ |
| 迭代器稳定性 | 扩容和中间增删可能使大量迭代器失效 | 插入稳定，删除只影响被删元素 |

`list` 的节点要额外保存两个链接，访问分散节点的内存局部性也通常弱于 `vector`。只有题目确实需要稳定节点位置，并频繁在已知迭代器附近增删时，它的优势才会体现。

竞赛中的绝大多数线性序列仍优先使用 `vector`。不能仅凭“中间插入删除是 $O(1)$”就选择 `list`，因为寻找操作位置可能已经是 $O(n)$。

## 完整代码

下面的程序读入一列整数，删除所有负数，再按升序输出剩余元素。

```cpp
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int n;
    cin >> n;

    list<int> values;

    for (int i = 1; i <= n; i++) {
        int value;
        cin >> value;
        values.push_back(value);
    }

    for (auto it = values.begin(); it != values.end();) {
        if (*it < 0) {
            it = values.erase(it);
        } else {
            it++;
        }
    }

    values.sort();

    bool first = true;
    for (int value : values) {
        if (!first) {
            cout << ' ';
        }
        cout << value;
        first = false;
    }
    cout << '\n';
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
6
3 -2 5 1 -4 3
```

输出：

```text
1 3 3 5
```

## 需要记住什么

1. `list` 在标准库中实现的是什么数据结构？
2. 为什么 `list` 不支持 `operator[]`？
3. `insert(it, value)` 把元素插在 `it` 的前面还是后面？
4. 已知迭代器时插入删除是 $O(1)$，为什么按第 $k$ 个位置操作仍是 $O(n)$？
5. 遍历中删除元素时，为什么应当接住 `erase` 的返回值？
6. 为什么 `list` 使用成员函数 `sort()`，不能交给普通 `sort(first, last)`？
7. 哪些情况下 `vector` 仍然比 `list` 更合适？
