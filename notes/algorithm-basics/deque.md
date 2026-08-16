# 双端队列

> 最近修订：2026-08-16 11:13 +10:00（未审阅）

[队列](queue.md) 只允许从队尾加入、从队首删除。有些过程却需要同时淘汰两端的元素，例如维护一段候选序列时，新元素可能让若干队尾候选失效，过期元素又只能从队首离开。

如果一条线性序列允许在两端加入、读取和删除，就得到双端队列（double-ended queue，deque）。本篇讨论这种抽象结构与循环数组实现；标准库 [`deque`](../cpp/deque.md) 的具体接口另行介绍。

## 两端都能操作

双端队列的基础操作是：

| 操作 | 含义 |
| --- | --- |
| `push_front(value)` | 在队首以前加入元素 |
| `push_back(value)` | 在队尾以后加入元素 |
| `front()` | 读取队首，不删除 |
| `back()` | 读取队尾，不删除 |
| `pop_front()` | 删除队首，不返回元素 |
| `pop_back()` | 删除队尾，不返回元素 |
| `empty()` | 判断是否为空 |
| `size()` | 查询当前元素数量 |

依次执行：

```text
push_back(10)
push_back(20)
push_front(5)
```

序列会变成：

```text
front -> 5  10  20 <- back
```

此时 `pop_front()` 删除 `5`，`pop_back()` 删除 `20`。`front()`、`back()` 和两个 `pop` 都要求结构非空。

## 与栈和队列的关系

双端队列开放两端，栈和普通队列可以看成它的受限使用方式：

| 使用方式 | 加入 | 删除 | 形成的顺序 |
| --- | --- | --- | --- |
| 栈 | 固定同一端 | 固定同一端 | 后进先出 |
| 队列 | 队尾 | 队首 | 先进先出 |
| 双端队列 | 任意一端 | 任意一端 | 由算法决定 |

这不表示所有栈和队列都必须以双端队列实现。三者描述的是允许哪些操作，底层仍可选择数组或链表。

双端队列也不会按照数值大小自动排序。能够从两端操作与“优先取最大值或最小值”是两种不同语义。

## 循环数组

若固定容量为 `capacity`，使用数组位置 `1..capacity`。为了避免两端移动时耗尽某一侧空间，让下标越过边界后绕到另一端。

定义两个移动函数：

```cpp
int next_position(int position, int capacity) {
    if (position == capacity) {
        return 1;
    }
    return position + 1;
}

int previous_position(int position, int capacity) {
    if (position == 1) {
        return capacity;
    }
    return position - 1;
}
```

它们只改变底层数组位置，不改变双端队列的逻辑顺序。

## 三个状态量

循环数组保存：

- `head_index`：当前队首位置；
- `next_index`：下一个从队尾加入的写入位置；
- `count`：当前元素数量。

空双端队列初始化为：

```cpp
int head_index = 1;
int next_index = 1;
int count = 0;
```

有效元素从 `head_index` 开始，沿 `next_position` 连续走 `count` 步。`next_index` 位于队尾元素之后，所以非空时的队尾位置是：

```cpp
previous_position(next_index, capacity)
```

绕满一圈时，空和满都可能满足 `head_index == next_index`。因此本篇显式保存 `count`：

```cpp
bool empty = count == 0;
bool full = count == capacity;
```

## 从两端加入

从队首加入时，先把 `head_index` 向前移动，再写入新值：

```cpp
head_index = previous_position(head_index, capacity);
a[head_index] = value;
count++;
```

从队尾加入时，写入 `next_index`，再把它移到新的空位：

```cpp
a[next_index] = value;
next_index = next_position(next_index, capacity);
count++;
```

两种操作前都必须满足 `count < capacity`，否则会覆盖尚未离开的元素。

## 从两端读取和删除

队首就是 `a[head_index]`。删除队首只需向后移动入口：

```cpp
int value = a[head_index];
head_index = next_position(head_index, capacity);
count--;
```

队尾位于 `next_index` 的前一个循环位置。删除时先把 `next_index` 移回队尾，再读取：

```cpp
next_index = previous_position(next_index, capacity);
int value = a[next_index];
count--;
```

删除后不必清空旧格；`count` 与两个边界决定哪些位置仍属于逻辑序列。读取和删除前必须满足 `count > 0`。

## 绕回边界

设容量为 `5`，当前状态是：

```text
数组位置： 1  2  3  4  5
逻辑内容：30  空 空 10 20
队首位置：4
下个队尾位置：2
```

从 `4` 开始按循环顺序读取三个元素，得到 `10, 20, 30`。它们在内存中跨过数组末尾，但在逻辑上仍是一段连续队列。

再次 `push_front(5)` 时，队首从 `4` 移到 `3`；再次 `push_back(40)` 时，把 `40` 写入位置 `2`。两端操作都不需要移动已有元素。

## 复杂度与其他实现

循环数组的每个基础操作只改变常数个下标、计数和数组位置，因此都是 $O(1)$。容量为 $n$ 时占用 $O(n)$ 空间。

双向链表也能实现双端队列：同时保存首尾节点，并让每个节点保存前驱和后继。两端操作仍是 $O(1)$，但每个元素需要额外链接，存储也不连续。

数组实现必须处理容量和循环下标；链表实现必须正确维护两方向链接。选择哪种底层结构不改变双端队列的六个端点操作语义。

## 完整代码

下面实现一个容量为 `q` 的整数双端队列。操作类型为：

| 类型 | 行为 |
| ---: | --- |
| `1 value` | 从队首加入 |
| `2 value` | 从队尾加入 |
| `3` | 输出并删除队首 |
| `4` | 输出并删除队尾 |
| `5` | 输出队首 |
| `6` | 输出队尾 |
| `7` | 输出元素数量 |

输入保证 `q >= 1`，读取或删除时非空，任意时刻保存的元素不超过 `q`。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct ArrayDeque {
    vector<int> a;
    int capacity;
    int head_index;
    int next_index;
    int count;

    ArrayDeque(int capacity) {
        this->capacity = capacity;
        a.resize(capacity + 5);
        head_index = 1;
        next_index = 1;
        count = 0;
    }

    int next_position(int position) const {
        if (position == capacity) {
            return 1;
        }
        return position + 1;
    }

    int previous_position(int position) const {
        if (position == 1) {
            return capacity;
        }
        return position - 1;
    }

    bool empty() const {
        return count == 0;
    }

    bool full() const {
        return count == capacity;
    }

    int size() const {
        return count;
    }

    void push_front(int value) {
        head_index = previous_position(head_index);
        a[head_index] = value;
        count++;
    }

    void push_back(int value) {
        a[next_index] = value;
        next_index = next_position(next_index);
        count++;
    }

    int front() const {
        return a[head_index];
    }

    int back() const {
        return a[previous_position(next_index)];
    }

    void pop_front() {
        head_index = next_position(head_index);
        count--;
    }

    void pop_back() {
        next_index = previous_position(next_index);
        count--;
    }
};

void solve() {
    int q;
    scanf("%d", &q);

    ArrayDeque values(q);

    for (int i = 1; i <= q; i++) {
        int type;
        scanf("%d", &type);

        if (type == 1) {
            int value;
            scanf("%d", &value);
            values.push_front(value);
        } else if (type == 2) {
            int value;
            scanf("%d", &value);
            values.push_back(value);
        } else if (type == 3) {
            printf("%d\n", values.front());
            values.pop_front();
        } else if (type == 4) {
            printf("%d\n", values.back());
            values.pop_back();
        } else if (type == 5) {
            printf("%d\n", values.front());
        } else if (type == 6) {
            printf("%d\n", values.back());
        } else if (type == 7) {
            printf("%d\n", values.size());
        }
    }
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
10
2 10
2 20
1 5
5
6
3
4
2 30
7
5
```

输出：

```text
5
20
5
20
2
10
```

全部 $q$ 个操作需要 $O(q)$ 时间。数组容量为 $q$，空间复杂度是 $O(q)$。

## 常见错误

### 混淆队尾与下一个写入位置

`next_index` 指向队尾之后的空位，非空时的队尾是它的前一个循环位置。若直接把 `a[next_index]` 当作队尾，会读到不属于逻辑序列的格子。

### 只比较两个下标判断空满

绕一圈以后，空和满都可能满足 `head_index == next_index`。必须保存 `count`，或明确采用浪费一格的另一套不变量，不能混用。

### 移动顺序写反

`push_front` 先向前移动再写入；`push_back` 先写入再向后移动。`pop_front` 向后移动，`pop_back` 向前移动。每个方向都应从边界含义重新推导，不靠背诵四段相似代码。

### 忘记空与满的前置条件

空结构没有合法首尾；满结构继续加入会覆盖有效元素。完整代码依赖输入保证，通用接口则应在调用前检查 `empty()` 与 `full()`。

### 把双端队列当成有序结构

两端可操作不等于按数值有序。元素的相对顺序仍由调用者执行的加入和删除操作决定。

## 基础练习

1. 手动模拟空双端队列依次执行 `push_front(2)`、`push_back(5)`、`push_front(1)`。
2. 对容量为 `4` 的循环数组，让两个下标分别从 `1` 向前和从 `4` 向后绕回。
3. 写出 `head_index`、`next_index` 和 `count` 对逻辑序列的完整不变量。
4. 分别构造空与满时 `head_index == next_index` 的状态。
5. 为完整代码增加调用前的空满检查，并设计相应输出。
6. 使用双向链表实现相同的六个端点操作，与循环数组随机对拍。
7. 分别只使用一端或一头一尾，把双端队列当作栈和普通队列使用。

## 需要记住什么

1. 双端队列开放哪六个端点操作？哪些操作要求非空？
2. 栈、队列和双端队列对加入与删除端点的限制分别是什么？
3. 循环数组中的 `head_index`、`next_index` 和 `count` 分别表示什么？
4. 为什么队尾位置是 `previous_position(next_index)`？
5. 为什么不能只通过两个下标是否相等区分空与满？
6. 从队首和队尾加入、删除时，下标分别先移动还是后移动？
7. 为什么循环数组的六个端点操作都是 $O(1)$？
8. 双向链表怎样实现相同接口？它与循环数组的主要取舍是什么？

标准库接口、迭代器、随机访问和分段存储属于 [`deque`](../cpp/deque.md)；滑动窗口最值为什么需要同时淘汰队首与队尾候选，会在单调队列中推导。
