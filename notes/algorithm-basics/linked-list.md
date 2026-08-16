# 链表

> 最近修订：2026-08-13 05:08 +10:00（未审阅）

[数组](array.md) 把元素连续存放，因此能在 $O(1)$ 时间内通过下标访问；但在中间插入或删除时，后缀元素必须整体移动。

如果不要求相邻元素在内存中也紧挨着，可以把每个元素单独放进一个节点，并在节点中记录“下一个节点在哪里”。修改少量链接就能改变逻辑顺序，这种结构就是链表。

## 节点与链接

最基础的单向链表节点包含两部分：

- `value`：当前节点保存的值；
- `next`：下一个节点的编号。

```cpp
struct node {
    int value;
    int next;
};
```

本篇使用 `vector<node>` 保存实际节点。节点编号 `0` 固定表示“没有节点”，真实节点从 `1` 开始：

```cpp
vector<node> nodes(1);
```

`nodes[0]` 只是为空编号预留的格子，不保存真实元素。每建立一个新节点，就把它追加到 `nodes`，返回的下标就是稳定的节点编号：

```cpp
int create_node(int value) {
    nodes.push_back({value, 0});
    return nodes.size() - 1;
}
```

这里没有保存指向 `vector` 元素的指针或引用。即使 `push_back` 扩容并搬动底层存储，整数编号仍然能够重新通过 `nodes[u]` 找到节点。

一般情况下，`vector::push_back()` 建立节点是均摊 $O(1)$。题目已经给出最多会建立多少节点时，可以提前 `reserve` 足够空间，避免运行中扩容；节点之间的链接修改本身始终只涉及固定数量的赋值。

## 头节点与逻辑顺序

变量 `head` 保存链表第一个真实节点的编号。空链表没有第一个节点，因此：

```cpp
int head = 0;
```

假设内存中的三个节点是：

| 节点编号 `u` | `1` | `2` | `3` |
| ---: | ---: | ---: | ---: |
| `nodes[u].value` | 10 | 20 | 30 |
| `nodes[u].next` | 2 | 3 | 0 |

并且 `head = 1`。从 `head` 沿 `next` 走，逻辑顺序就是：

```text
head -> 1 -> 2 -> 3 -> 0
          10   20   30
```

最后一个节点的 `next` 是 `0`，表示链表到此结束。

节点编号不等于逻辑位置。若后来建立编号 `4` 的节点并插到最前面，逻辑顺序会变成 `4 -> 1 -> 2 -> 3`；原节点不需要搬动或重新编号。

## 遍历

从 `head` 开始，反复令当前节点 `u` 变成 `nodes[u].next`，直到到达 `0`：

```cpp
for (int u = head; u != 0; u = nodes[u].next) {
    printf("%d\n", nodes[u].value);
}
```

每个节点访问一次，长度为 $n$ 的链表遍历需要 $O(n)$ 时间。

链表不能像数组一样根据逻辑位置直接计算地址。寻找第 $k$ 个节点必须从 `head` 沿链接走 $k-1$ 次，最坏时间是 $O(n)$。这就是链表为快速修改链接所付出的主要代价。

## 在已知节点后插入

假设已经知道节点 `u`，要把新节点 `v` 插在它后面。原来的关系是：

```text
u -> old_next
```

插入后应当变成：

```text
u -> v -> old_next
```

先让 `v` 接住原来的后继，再让 `u` 指向 `v`：

```cpp
nodes[v].next = nodes[u].next;
nodes[u].next = v;
```

两次赋值就能完成，因此在已经知道节点 `u` 的前提下，插入是 $O(1)$。

顺序不能反过来。若先执行 `nodes[u].next = v`，原来的后继编号就会丢失，无法再让 `v` 接回后面的链表。

## 在开头插入

链表第一个节点之前没有真实前驱。把新节点 `v` 插到开头时，先让它指向原来的 `head`，再更新 `head`：

```cpp
nodes[v].next = head;
head = v;
```

空链表的 `head` 原本是 `0`，同一段代码仍然有效：新节点的 `next` 会变成 `0`，它同时是第一个和最后一个节点。

开头插入不需要移动其他节点，是 $O(1)$。

## 删除已知节点的后继

单向链表只知道下一项，不知道上一项。因此最容易直接删除的是“已知节点 `u` 的下一个节点”。

设被删除节点为 `v = nodes[u].next`。让 `u` 跳过 `v`，直接连接 `v` 的后继：

```cpp
int v = nodes[u].next;
nodes[u].next = nodes[v].next;
nodes[v].next = 0;
```

最后一行把已经脱离链表的节点与原结构断开，便于调试；它不是完成删除所必需的连接修改。

已知前驱 `u` 时，删除后继只修改固定数量的链接，是 $O(1)$。调用前必须保证 `nodes[u].next != 0`，否则不存在可删除节点。

如果只知道要删除的节点 `v`，单向链表仍要先从 `head` 找到它的前驱，通常需要 $O(n)$。删除第一个节点则直接更新 `head`：

```cpp
int v = head;
head = nodes[v].next;
nodes[v].next = 0;
```

## 按逻辑位置操作

题目若要求“在第 `position` 个位置插入”，提供的是逻辑位置，不是已经找到的节点编号。

- 在位置 `1` 插入可以直接修改 `head`；
- 在位置 `2..n+1` 插入，必须先走到第 `position-1` 个节点；
- 删除位置 `1` 可以直接修改 `head`；
- 删除位置 `2..n`，必须先找到它的前驱。

寻找前驱最坏需要 $O(n)$，之后修改链接只需 $O(1)$，所以按逻辑位置插入或删除的整体时间仍是 $O(n)$。

“链表插入删除是 $O(1)$”这句话必须带上前提：操作位置已经通过节点编号、指针或迭代器找到。若还要从头寻找位置，查找时间不能省略。

## 尾节点

若只保存 `head`，向末尾追加前必须遍历到最后一个节点，是 $O(n)$。额外保存最后一个节点编号 `tail` 后，追加可以在 $O(1)$ 时间完成：

```cpp
int u = create_node(value);

if (head == 0) {
    head = tail = u;
} else {
    nodes[tail].next = u;
    tail = u;
}
```

删除最后一个节点时，单向链表仍然需要找到它的前驱，因此即使保存了 `tail`，最坏也要 $O(n)$。链表变空时必须同时恢复 `head = tail = 0`。

## 删除节点与释放存储

本篇的索引实现把节点保存在 `vector` 末尾。节点从逻辑链表中断开后，`vector` 中的那一格仍然存在；后面的新节点继续获得新的编号，不复用旧格子。

因此，当前链表长度为 $n$ 不代表 `nodes.size()` 恰好是 `n+1`。空间复杂度由程序运行期间建立过的节点总数决定。

竞赛题若最多只建立 $q$ 个节点，这种做法使用 $O(q)$ 空间，代码简单且编号稳定。只有空间限制要求反复复用删除节点时，才需要额外维护空闲节点链表；这不属于基础链表操作。

## 双向链表

单向链表节点只保存 `next`。双向链表再保存前一个节点 `previous`：

```cpp
struct node {
    int value;
    int previous;
    int next;
};
```

已知节点 `u` 时，可以直接找到左右两边，因此能在 $O(1)$ 时间删除 `u`，也能向前或向后遍历。代价是每个节点多保存一个链接，并且每次插入删除都要同步维护两个方向。

双向链表仍然不能按第 $k$ 个逻辑位置随机访问；若没有已经指向目标附近的节点，仍要从头或尾逐个走过去。

## 循环链表

普通链表的尾节点指向 `0`。循环链表让尾节点重新指向头节点：

```text
head -> 1 -> 2 -> 3
 ^               |
 |_______________|
```

它适合需要处理完末尾后继续回到开头的循环过程。只有一个节点时，这个节点的 `next` 指向自己。

循环链表没有通过 `0` 表示的自然终点，遍历时必须在重新回到起点后停止；否则程序会无限循环。空链表仍可以使用 `head = 0` 表示。

循环与双向是两条独立性质：链表可以是单向循环链表，也可以是双向循环链表。

## 与数组比较

设逻辑长度为 $n$，并假设链表的目标节点或前驱是否已经找到已明确说明：

| 操作 | 数组 | 单向链表 |
| --- | ---: | ---: |
| 已知逻辑位置访问 | $O(1)$ | $O(n)$ |
| 遍历全部元素 | $O(n)$ | $O(n)$ |
| 已知前驱后插入 | $O(n)$ | $O(1)$ |
| 已知前驱后删除 | $O(n)$ | $O(1)$ |
| 按第 $k$ 个位置插入或删除 | $O(n)$ | $O(n)$ |
| 额外链接空间 | 无 | 每个节点一个 `next` |

数组中即使已经知道插入位置，也要移动后缀；链表在已经拿到前驱后只改链接。反过来，数组的下标能直接定位，链表必须沿链接寻找逻辑位置。选择结构时要看题目的主要操作，而不是笼统地认为某一种始终更快。

## 完整代码

下面的程序用索引实现一个单向链表。输入和 [数组](array.md#完整代码) 的示例相同：先建立初始序列，在指定逻辑位置插入一个值，再删除插入后的一个逻辑位置。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct node {
    int value;
    int next;
};

struct linked_list {
    vector<node> nodes;
    int head;
    int tail;
    int n;

    linked_list(int capacity) {
        nodes.reserve(capacity + 5);
        nodes.push_back({0, 0});
        head = 0;
        tail = 0;
        n = 0;
    }

    int create_node(int value) {
        nodes.push_back({value, 0});
        return nodes.size() - 1;
    }

    void push_back(int value) {
        int u = create_node(value);
        if (head == 0) {
            head = tail = u;
        } else {
            nodes[tail].next = u;
            tail = u;
        }
        n++;
    }

    void insert_at(int position, int value) {
        int u = create_node(value);
        if (position == 1) {
            nodes[u].next = head;
            head = u;
            if (tail == 0) {
                tail = u;
            }
            n++;
            return;
        }

        int previous = head;
        for (int i = 1; i < position - 1; i++) {
            previous = nodes[previous].next;
        }

        nodes[u].next = nodes[previous].next;
        nodes[previous].next = u;
        if (nodes[u].next == 0) {
            tail = u;
        }
        n++;
    }

    void erase_at(int position) {
        if (position == 1) {
            int u = head;
            head = nodes[u].next;
            nodes[u].next = 0;
            if (head == 0) {
                tail = 0;
            }
            n--;
            return;
        }

        int previous = head;
        for (int i = 1; i < position - 1; i++) {
            previous = nodes[previous].next;
        }

        int u = nodes[previous].next;
        nodes[previous].next = nodes[u].next;
        nodes[u].next = 0;
        if (u == tail) {
            tail = previous;
        }
        n--;
    }

    void print() const {
        bool first = true;
        for (int u = head; u != 0; u = nodes[u].next) {
            if (!first) {
                printf(" ");
            }
            printf("%d", nodes[u].value);
            first = false;
        }
        printf("\n");
    }
};

int main() {
    int n;
    scanf("%d", &n);

    linked_list values(n + 1);
    for (int i = 1; i <= n; i++) {
        int value;
        scanf("%d", &value);
        values.push_back(value);
    }

    int insert_position, value;
    scanf("%d%d", &insert_position, &value);
    values.insert_at(insert_position, value);

    int erase_position;
    scanf("%d", &erase_position);
    values.erase_at(erase_position);

    values.print();
    return 0;
}
```

输入：

```text
5
10 20 30 40 50
3 25
4
```

输出：

```text
10 20 25 40 50
```

程序提前为本次会建立的 $n+1$ 个真实节点预留空间，`push_back` 再通过 `tail` 在 $O(1)$ 时间追加每个初始节点，建表总计 $O(n)$。按逻辑位置插入和删除最坏分别需要 $O(n)$ 时间寻找前驱，修改链接本身是 $O(1)$；最终输出也是 $O(n)$。全部节点使用 $O(n)$ 空间。

## 边界条件

对当前长度为 $n$ 的链表：

- 合法访问和删除位置是 `1..n`；
- 合法插入位置是 `1..n+1`；
- 空链表必须满足 `head = tail = 0`；
- 插入第一个节点后，`head` 和 `tail` 都指向它；
- 删除唯一节点后，`head` 和 `tail` 都恢复为 `0`；
- 插入或删除末尾时必须更新 `tail`。

完整代码假设输入位置合法。对外提供通用容器接口时可以检查边界；竞赛模板通常依赖题目和调用者保证前置条件，避免在每个内部操作中重复判断。

## 基础练习

1. 根据一张 `value,next` 表，从 `head` 开始写出链表的逻辑顺序。
2. 把新节点插在已知节点后面，说明两次修改 `next` 为什么不能交换顺序。
3. 删除已知节点的后继，并处理后继是尾节点的情况。
4. 分别模拟空链表、单节点链表和多节点链表的头部插入删除。
5. 比较“已经知道前驱节点”和“只知道第 $k$ 个逻辑位置”时的操作复杂度。
6. 为单向链表增加 `push_front`，再实现不保存 `tail` 的 `push_back` 并比较复杂度。
7. 给节点增加 `previous`，写出双向链表删除已知节点需要修改的链接。
8. 把单向链表改成循环链表，并设计不会无限循环的输出条件。

## 需要记住什么

1. 单向链表节点至少保存哪两部分？`head` 和 `0` 分别表示什么？
2. 节点编号与逻辑位置为什么不是同一个概念？
3. 链表为什么不能通过第 $k$ 个位置随机访问？
4. 已知节点后插入和已知前驱后删除为什么是 $O(1)$？
5. 为什么按逻辑位置插入删除仍可能是 $O(n)$？
6. 保存 `tail` 能加速哪些操作，不能加速单向链表的哪个末尾操作？
7. 索引实现删除节点后，为什么 `nodes.size()` 不一定随当前长度减小？
8. 双向链表比单向链表增加了什么能力和成本？
9. 循环链表怎样表示末尾到开头的关系？遍历为什么必须额外设计停止条件？
10. 数组和链表在随机访问、已知位置增删、存储方式上怎样取舍？

空闲节点复用、侵入式链表、跳表、异或链表以及标准库 `list` 的完整接口不属于本篇基础目标。竞赛中只有问题确实需要稳定节点和频繁链接修改时，才值得主动维护链表。

## 下一篇

下一篇 [栈](stack.md) 会限制只能在同一端加入和删除元素，从而得到后进先出的访问顺序。
