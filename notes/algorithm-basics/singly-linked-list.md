# 单向链表

> 最近修订：2026-08-17 00:07 +10:00（未审阅）

[链表的基本概念](linked-list.md)已经说明：节点的存储位置与逻辑位置不同，链表的顺序由链接决定。现在具体实现最基础的**单向链表**，并一步步推导插入与删除需要怎样修改 `next`。

## 使用整数编号保存节点

每个节点保存值和后继编号：

```cpp
struct Node {
    int value;
    int next;
};
```

使用 `vector<Node>` 保存所有建立过的节点，并预留编号 `0`：

```cpp
vector<Node> nodes(1);
```

新节点总是追加到 `vector` 末尾：

```cpp
int create_node(int value) {
    nodes.push_back({value, 0});
    return nodes.size() - 1;
}
```

返回的整数就是新节点编号。链接只保存编号，不保存指向 `vector` 元素的指针或引用；即使 `push_back` 扩容并搬动存储，仍然可以通过 `nodes[u]` 找到编号 `u` 的节点。

## 虚拟头节点

首节点没有真实前驱。如果单独保存 `head`，在首部插入和删除时都要额外修改它。

我们把预留的 `nodes[0]` 当作**虚拟头节点**，也称哨兵节点。它不保存逻辑数据，`nodes[0].next` 始终指向第一个真实节点：

```text
0 -> first -> ... -> last -> 0
^
虚拟头节点
```

空链表满足：

```cpp
nodes[0].next = 0;
```

这样，第一个真实节点也拥有统一的前驱 `0`。插入或删除首节点可以复用与中间位置完全相同的链接操作。

## 在已知节点后插入

已知节点 `u`，要把新节点 `v` 插在它后面。原来的链接是：

```text
u -> old_next
```

目标是：

```text
u -> v -> old_next
```

先让 `v` 接住旧后继：

```cpp
nodes[v].next = nodes[u].next;
```

再让 `u` 指向 `v`：

```cpp
nodes[u].next = v;
```

两行顺序不能随意交换。若先覆盖 `nodes[u].next`，旧后继编号就会丢失，后面的链表将无法重新接上。

已经知道 `u` 时，建立节点和修改链接都只需要常数次操作，插入时间是 $O(1)$。

若 `u = 0`，同一段代码就是在首部插入，因为虚拟头节点的后继正是原首节点。

## 删除已知节点的后继

单向节点没有前驱链接，所以最自然的删除操作是：已知前驱 `u`，删除它的后继 `v`。

原来的关系是：

```text
u -> v -> next
```

只要让 `u` 跳过 `v`：

```cpp
int v = nodes[u].next;
nodes[u].next = nodes[v].next;
```

调用前必须保证 `nodes[u].next != 0`，否则并不存在可以删除的节点。

为了让脱离链表的状态更容易观察，可以再清空它的链接：

```cpp
nodes[v].next = 0;
```

这行不是完成逻辑删除的必要步骤。真正让 `v` 离开链表的是前驱不再指向它。

当 `u = 0` 时，删除的是首节点，仍不需要额外分支。

## 按逻辑位置操作

题目常给出“在第 `position` 个位置插入”，而不是直接给前驱节点编号。

要在位置 `position` 插入，应先找到位置 `position - 1` 对应的前驱。从虚拟头节点出发：

```cpp
int u = 0;

for (int i = 1; i < position; i++) {
    u = nodes[u].next;
}
```

当 `position = 1` 时，循环执行零次，`u` 自然保持为虚拟头节点 `0`。

寻找前驱最坏是 $O(n)$，随后插入是 $O(1)$，所以按逻辑位置插入的总时间仍是 $O(n)$。按位置删除同理。

对当前长度为 $n$ 的链表：

- 合法插入位置是 `1..n+1`；
- 合法删除位置是 `1..n`。

## 尾节点

若不额外保存信息，向末尾追加以前必须遍历到尾节点。变量 `tail` 保存最后一个真实节点编号后，追加可以在 $O(1)$ 时间内完成。

空链表令：

```cpp
int tail = 0;
```

追加新节点 `u`：

```cpp
nodes[tail].next = u;
tail = u;
```

第一次追加时，原来的 `tail` 是虚拟头节点 `0`，所以第一行恰好设置 `nodes[0].next`。同一段代码同时处理空链表和非空链表。

保存 `tail` 不能让删除尾节点自动变成 $O(1)$。单向链表仍然无法从尾节点直接找到前驱；只知道 `tail` 时，必须从头寻找倒数第二个节点。

## 删除不等于释放存储

索引实现把新节点不断追加到 `nodes`。一个节点从逻辑链表中断开后，它占用的存储格仍然存在，`nodes.size()` 不会减小。

因此空间复杂度取决于程序运行期间建立过的节点总数，而不只取决于当前链表长度。若一共最多建立 $q$ 个节点，这种实现使用 $O(q)$ 空间。

竞赛基础实现通常不复用删除节点，换取简单、稳定的编号。只有空间限制要求反复回收时，才额外维护空闲编号；这不是单向链表基本操作的一部分。

## 完整代码

下面把规模和操作封装在 `SinglyLinkedList` 中。程序先建立初始链表，在指定逻辑位置插入一个值，再删除插入后的指定位置。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Node {
    int value;
    int next;
};

struct SinglyLinkedList {
    vector<Node> nodes;
    int tail;
    int n;

    SinglyLinkedList(int capacity) {
        nodes.reserve(capacity + 5);
        nodes.push_back({0, 0});
        tail = 0;
        n = 0;
    }

    int create_node(int value) {
        nodes.push_back({value, 0});
        return nodes.size() - 1;
    }

    void push_back(int value) {
        int u = create_node(value);
        nodes[tail].next = u;
        tail = u;
        n++;
    }

    void insert_at(int position, int value) {
        int previous = 0;

        for (int i = 1; i < position; i++) {
            previous = nodes[previous].next;
        }

        int u = create_node(value);
        nodes[u].next = nodes[previous].next;
        nodes[previous].next = u;

        if (previous == tail) {
            tail = u;
        }
        n++;
    }

    void erase_at(int position) {
        int previous = 0;

        for (int i = 1; i < position; i++) {
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

        for (int u = nodes[0].next; u != 0; u = nodes[u].next) {
            if (!first) {
                cout << ' ';
            }
            cout << nodes[u].value;
            first = false;
        }
        cout << '\n';
    }
};

void solve() {
    int n;
    cin >> n;

    SinglyLinkedList values(n + 1);

    for (int i = 1; i <= n; i++) {
        int value;
        cin >> value;
        values.push_back(value);
    }

    int insert_position;
    int value;
    cin >> insert_position >> value;
    values.insert_at(insert_position, value);

    int erase_position;
    cin >> erase_position;
    values.erase_at(erase_position);

    values.print();
}

int main() {
    solve();
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

输入保证所有位置合法。按位置插入和删除分别需要 $O(n)$ 时间寻找前驱，最终输出也是 $O(n)$；建立过的节点总数是 $O(n)$。

## 需要记住什么

1. 为什么索引实现保存节点编号而不是指向 `vector` 元素的指针？
2. 虚拟头节点怎样统一首部与中间位置的操作？
3. 在已知节点后插入时，两次修改 `next` 为什么不能交换顺序？
4. 单向链表为什么更自然地删除“已知节点的后继”？
5. 按逻辑位置插入或删除为什么仍然是 $O(n)$？
6. 保存 `tail` 能加速什么，为什么不能直接加速删除尾节点？
7. 逻辑删除节点后，为什么底层 `vector` 的长度不会自动缩短？
