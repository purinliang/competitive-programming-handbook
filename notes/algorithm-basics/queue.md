# 队列

> 最近修订：2026-08-13 05:17 +10:00（未审阅）

有些任务必须按照到达顺序处理：先到服务窗口的人先被服务，先提交的普通任务先执行，广度优先搜索也总是先处理更早发现的状态。

[栈](stack.md) 把加入和删除都限制在同一端，因此形成后进先出。队列把新元素加入队尾，却从队首取出旧元素，因此形成相反的先进先出顺序。

## 先进先出

队列遵循先进先出（First In, First Out，FIFO）：最早进入、仍未离开的元素最先被取出。

依次加入 `3`、`5`、`8` 后，可以表示为：

```text
front -> 3  5  8 <- back
```

第一次删除得到 `3`，新的队首变成 `5`。后来的 `8` 不能越过前面的元素先离开。

## 基础操作

队列的常用操作是：

| 操作 | 含义 |
| --- | --- |
| `push(value)` | 把新元素加入队尾 |
| `front()` | 读取队首，但不删除 |
| `back()` | 读取队尾，但不删除 |
| `pop()` | 删除队首，但不返回它 |
| `empty()` | 判断队列是否为空 |
| `size()` | 查询当前元素数量 |

`front()`、`back()` 和 `pop()` 只能用于非空队列。需要取出队首时，先读取，再删除：

```cpp
int value = front();
pop();
```

阶段 3 的 [容器适配器：queue](../cpp/queue.md) 会使用标准库提供的同名接口。本篇先推导这些操作怎样实现以及为什么都是 $O(1)$。

## 线性数组实现

数组中用一段连续的逻辑区间保存队列。令 `head_index` 指向当前队首，`tail_index` 指向当前队尾：

```cpp
vector<int> a(capacity + 5);
int head_index = 1;
int tail_index = 0;
```

初始时 `head_index > tail_index`，表示逻辑区间为空。加入队尾时先扩大右端：

```cpp
a[++tail_index] = value;
```

读取队首和队尾分别是：

```cpp
int first = a[head_index];
int last = a[tail_index];
```

删除队首不移动后面的元素，只把左端向右推进：

```cpp
head_index++;
```

当前长度是：

```cpp
int size = tail_index - head_index + 1;
```

每个操作只访问或修改固定数量的位置，因此时间复杂度都是 $O(1)$。

## 为什么删除队首不移动元素

若把队列强行保持在 `a[1..n]`，每次删除队首都要把后缀向左移动，成为 $O(n)$。队列不要求逻辑区间始终从下标 `1` 开始，所以只移动 `head_index` 即可。

已经离队的旧数值仍可能留在 `a[head_index - 1]`，但它位于逻辑区间之外，不需要清零。队列的真实内容始终是 `a[head_index..tail_index]`。

这也说明复杂度来自实现方式，而不是操作名称本身：同样叫作“删除队首”，移动数组前缀是 $O(n)$，移动一个边界下标是 $O(1)$。

## 容量边界

线性实现不会复用队首左边已经空出的格子。即使当前队列很短，只要 `tail_index` 到达数组末尾，就不能继续写入。

竞赛题若总共最多执行 $q$ 次 `push`，分配 `q + 5` 个位置就足够：每次压入只会让 `tail_index` 增加一次，总增加次数不会超过 $q$。

```cpp
vector<int> a(q + 5);
```

这种做法最简单，也非常适合广度优先搜索：每个状态通常只入队一次，总入队次数有明确上限。

若题目会长期交替入队和出队，总入队次数很大，但任意时刻的队列长度有较小固定上限，就需要复用左边的空间，这就是循环队列。

## 循环队列

设固定容量为 `capacity`，只使用下标 `1..capacity`。队尾越过 `capacity` 后回到 `1`：

```cpp
int next_position(int position, int capacity) {
    if (position == capacity) {
        return 1;
    }
    return position + 1;
}
```

可以让 `head_index` 指向队首，让 `next_index` 指向下一个入队位置，再用 `count` 保存当前长度：

```cpp
int head_index = 1;
int next_index = 1;
int count = 0;
```

入队：

```cpp
a[next_index] = value;
next_index = next_position(next_index, capacity);
count++;
```

出队：

```cpp
head_index = next_position(head_index, capacity);
count--;
```

`count == 0` 表示空，`count == capacity` 表示满。不能只用 `head_index == next_index` 同时区分两者：转完一圈后的满队列也可能让两个下标相等。

入队前必须保证 `count < capacity`，出队和读取队首前必须保证 `count > 0`。否则入队会覆盖仍在队列中的元素，出队则会读取不存在的内容。

循环队列并不改变先进先出的顺序，只让固定数组的下标循环复用。取模也能计算下一位置，但本书用显式边界分支展示 1-based 区间，避免把逻辑位置误当成 0-based 余数。

## 链表实现

单向链表同时保存 `head` 和 `tail` 时也能实现队列：

- `push` 在 `tail` 后连接新节点；
- `front` 读取 `head`；
- `back` 读取 `tail`；
- `pop` 删除 `head`；
- `empty` 判断 `head == 0`。

这些操作都是 $O(1)$。删除唯一节点后必须同时令 `head = tail = 0`，否则 `tail` 会保留一个已经离队的节点编号。

数组队列通常更紧凑、局部性更好；链表队列按需建立节点，但每个元素还要保存链接。队列描述的是先进先出的接口，不限定底层结构。

## 双端队列

普通队列只允许队尾加入、队首删除。双端队列（double-ended queue，deque）允许在两端分别加入和删除：

- `push_front`、`pop_front`；
- `push_back`、`pop_back`；
- `front`、`back`。

因此普通队列是双端队列的一种受限使用方式。双端队列并不是“队列和另一个无关容器”的拼接；它仍然维护一条有首尾的线性序列，只是两端都开放。

循环数组和双向链表都可以实现双端队列。标准库 [序列容器：deque](../cpp/deque.md) 会教授比赛中直接使用的接口，单调队列等算法则会说明为什么确实需要同时操作两端。

## 与栈比较

| 结构 | 加入位置 | 删除位置 | 顺序 |
| --- | --- | --- | --- |
| 栈 | 栈顶 | 栈顶 | 后进先出 |
| 队列 | 队尾 | 队首 | 先进先出 |
| 双端队列 | 两端 | 两端 | 由具体算法决定 |

数组和链表回答“元素怎样存储和连接”，栈、队列、双端队列回答“允许从哪些端操作”。同一种底层结构可以实现不同的访问规则。

## 到达与服务模拟

为了观察先进先出，考虑一个服务窗口的事件序列：

- `arrive id`：编号为 `id` 的顾客到达并站到队尾；
- `serve`：服务当前队首；若队列为空，输出 `empty`。

例如：

| 事件 | 队列（首到尾） | 输出 |
| --- | --- | --- |
| `arrive 10` | `10` |  |
| `arrive 20` | `10 20` |  |
| `serve` | `20` | `10` |
| `arrive 30` | `20 30` |  |
| `serve` | `30` | `20` |

每次服务都取走仍在队列中最早到达的人。

## 完整代码

下面使用线性数组队列处理 $q$ 个事件。最多只有 $q$ 次到达，所以分配 `q + 5` 个位置后不需要循环复用。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct array_queue {
    vector<int> a;
    int head_index;
    int tail_index;

    array_queue(int capacity) {
        a.resize(capacity + 5);
        head_index = 1;
        tail_index = 0;
    }

    bool empty() const {
        return head_index > tail_index;
    }

    int size() const {
        return tail_index - head_index + 1;
    }

    void push(int value) {
        a[++tail_index] = value;
    }

    int front() const {
        return a[head_index];
    }

    int back() const {
        return a[tail_index];
    }

    void pop() {
        head_index++;
    }
};

int main() {
    int q;
    cin >> q;

    array_queue customers(q);
    for (int i = 1; i <= q; i++) {
        string operation;
        cin >> operation;

        if (operation == "arrive") {
            int id;
            cin >> id;
            customers.push(id);
        } else {
            if (customers.empty()) {
                cout << "empty\n";
            } else {
                cout << customers.front() << '\n';
                customers.pop();
            }
        }
    }
    return 0;
}
```

输入：

```text
7
arrive 10
arrive 20
serve
arrive 30
serve
serve
serve
```

输出：

```text
10
20
30
empty
```

每个事件只执行固定数量的队列操作，时间复杂度是 $O(q)$。底层数组最多保存 $q$ 次到达所需的位置，空间复杂度是 $O(q)$；每个队列操作本身只使用 $O(1)$ 额外空间。

完整代码把任何不是 `arrive` 的命令都按 `serve` 处理，因为示例输入格式保证只有这两种操作。真实题目若不保证命令合法，应当显式判断 `operation == "serve"` 并处理其他输入。

## 常见错误

### 删除队首时移动全部元素

数组队列应推进 `head_index`，不应每次把后缀搬回开头。后者会让一次 `pop` 变成 $O(n)$。

### 空队列访问首尾

`front()`、`back()` 和 `pop()` 前必须先证明非空。服务事件的代码先检查 `customers.empty()`，因此不会越界。

### 忘记线性下标不会回收

线性数组队列的 `tail_index` 只增加。容量应按总入队次数分配；若要在固定空间中长期复用，改用循环队列。

### 循环队列混淆空和满

若队首与下一个入队位置都用同一个下标表示，只比较二者无法区分空队列和满队列。可以额外保存 `count`，或有意浪费一格并制定另一套判定规则；一份实现必须始终遵守同一种约定。

### 单节点链表出队后不清 tail

链表队列删除唯一节点后，队列已经为空，`head` 和 `tail` 都必须恢复为 `0`。

## 基础练习

1. 手动模拟依次 `push(3)`、`push(5)`、`front()`、`pop()`、`back()` 后的队列状态。
2. 使用线性数组和两个下标实现整数队列，说明每个操作为什么是 $O(1)$。
3. 连续执行相同次数的入队和出队，观察逻辑队列为空时 `head_index`、`tail_index` 的值。
4. 实现容量为 $5$ 的循环队列，测试下标从 `5` 回到 `1`、空队列和满队列。
5. 用单向链表的 `head`、`tail` 实现队列，并处理删除唯一节点。
6. 把完整代码改成银行窗口模拟，统计每位顾客开始服务的顺序。
7. 列出双端队列能完成、普通队列不能直接完成的两种端点操作。

## 需要记住什么

1. 什么是先进先出？队首和队尾分别负责哪些操作？
2. 队列的 `push`、`front`、`back`、`pop`、`empty` 和 `size` 分别表示什么？
3. 线性数组队列为什么能在 $O(1)$ 时间删除队首？逻辑区间是什么？
4. 为什么线性实现即使当前队列很短，也可能耗尽右侧容量？
5. 什么条件下按总入队次数分配空间已经足够？什么时候需要循环队列？
6. 循环队列为什么需要 `count` 或其他规则区分空与满？
7. 链表怎样通过 `head` 和 `tail` 实现队列？
8. 普通队列与双端队列是什么关系？数组、链表与队列分别描述什么？
9. 栈和队列的加入、删除位置与最终顺序有什么不同？

优先队列、单调队列、多级反馈调度以及并发无锁队列不属于本篇基础目标。普通广度优先搜索会在图的遍历文章中把队列用于逐层扩展状态。

## 下一篇

下一篇 [排序：基础排序](sorting.md) 会真正推导若干简单排序算法，而不只把 `sort` 当作现成接口使用。
