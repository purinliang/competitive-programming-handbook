# 双向链表

> 最近修订：2026-08-17 00:15 +10:00（未审阅）

[单向链表](singly-linked-list.md)只能从节点走向后继。即使已经知道要删除的节点 `u`，仍然无法直接找到它的前驱；通常要从链表入口重新寻找。

**双向链表**让每个节点同时保存前驱和后继。多付出一个链接的空间，就能向两个方向遍历，并在已知节点时直接修改它两侧的关系。

## 两个方向的链接

双向链表节点可以写成：

```cpp
struct Node {
    int value;
    int previous;
    int next;
};
```

若 `u` 的后继是 `v`，两个方向必须互相一致：

```text
u.next = v
v.previous = u
```

对一段 `u <-> v <-> w`：

```text
nodes[u].next = v
nodes[v].previous = u
nodes[v].next = w
nodes[w].previous = v
```

任何一次插入或删除都必须同步维护两个方向。只修改 `next` 而忘记 `previous`，正向遍历可能看似正常，反向遍历却会进入错误节点。

## 入口与尾节点

继续使用编号 `0` 作为虚拟头节点：

```text
0 <-> first <-> ... <-> tail -> 0
```

约定：

- `nodes[0].next` 是首节点编号；
- 首节点的 `previous = 0`；
- `tail` 是尾节点编号；
- 尾节点的 `next = 0`；
- 空链表满足 `nodes[0].next = tail = 0`。

虚拟头节点统一首部操作，`tail` 则让我们能从末尾开始反向遍历。

## 在已知节点后插入

已知节点 `u`，新节点是 `v`，原后继是 `w = nodes[u].next`。目标是：

```text
u <-> v <-> w
```

先让新节点记住两侧：

```cpp
nodes[v].previous = u;
nodes[v].next = nodes[u].next;
```

若原后继存在，让它回指 `v`：

```cpp
if (nodes[v].next != 0) {
    nodes[nodes[v].next].previous = v;
}
```

最后让 `u` 指向 `v`：

```cpp
nodes[u].next = v;
```

如果 `u` 原来是尾节点，`v` 会成为新尾节点：

```cpp
if (u == tail) {
    tail = v;
}
```

已知 `u` 时，所有步骤都是固定数量的访问和赋值，时间复杂度为 $O(1)$。

## 删除已知节点

双向链表可以直接从待删除节点 `u` 找到两侧：

```cpp
int previous = nodes[u].previous;
int next = nodes[u].next;
```

让前驱跳过 `u`：

```cpp
nodes[previous].next = next;
```

若后继存在，让它也跳过 `u`：

```cpp
if (next != 0) {
    nodes[next].previous = previous;
}
```

若 `u` 是尾节点，则没有后继，需要更新 `tail`：

```cpp
if (u == tail) {
    tail = previous;
}
```

最后可以清空脱离节点的链接，便于检查：

```cpp
nodes[u].previous = 0;
nodes[u].next = 0;
```

已知 `u` 时，删除是 $O(1)$。这正是双向链表相对单向链表的关键能力。

## 在已知节点前插入

因为 `u` 能直接找到前驱，所以在它前面插入 `v` 可以转化为“在 `u` 的前驱后插入”：

```cpp
int previous = nodes[u].previous;
insert_after(previous, value);
```

首节点的前驱是虚拟头节点 `0`，所以首部插入仍然使用同一操作。

## 双向遍历

从首节点正向遍历：

```cpp
for (int u = nodes[0].next; u != 0; u = nodes[u].next) {
    cout << nodes[u].value << '\n';
}
```

从尾节点反向遍历：

```cpp
for (int u = tail; u != 0; u = nodes[u].previous) {
    cout << nodes[u].value << '\n';
}
```

两种遍历都访问每个节点一次，是 $O(n)$。双向链接不会让按第 $k$ 个逻辑位置随机访问变成 $O(1)$；若没有现成的节点编号，仍然要从头或尾逐个寻找。

## 完整代码

下面的实现按逻辑位置插入和删除。它会从首节点寻找目标，因此完整操作最坏仍是 $O(n)$；一旦找到节点，链接修改是 $O(1)$。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Node {
    int value;
    int previous;
    int next;
};

struct DoublyLinkedList {
    vector<Node> nodes;
    int tail;
    int n;

    DoublyLinkedList(int capacity) {
        nodes.reserve(capacity + 5);
        nodes.push_back({0, 0, 0});
        tail = 0;
        n = 0;
    }

    int create_node(int value) {
        nodes.push_back({value, 0, 0});
        return nodes.size() - 1;
    }

    int insert_after(int u, int value) {
        int v = create_node(value);
        nodes[v].previous = u;
        nodes[v].next = nodes[u].next;

        if (nodes[v].next != 0) {
            nodes[nodes[v].next].previous = v;
        }
        nodes[u].next = v;

        if (u == tail) {
            tail = v;
        }
        n++;
        return v;
    }

    void erase(int u) {
        int previous = nodes[u].previous;
        int next = nodes[u].next;

        nodes[previous].next = next;
        if (next != 0) {
            nodes[next].previous = previous;
        }
        if (u == tail) {
            tail = previous;
        }

        nodes[u].previous = 0;
        nodes[u].next = 0;
        n--;
    }

    int node_at(int position) const {
        int u = nodes[0].next;

        for (int i = 1; i < position; i++) {
            u = nodes[u].next;
        }
        return u;
    }

    void insert_at(int position, int value) {
        int previous = 0;

        if (position > 1) {
            previous = node_at(position - 1);
        }
        insert_after(previous, value);
    }

    void erase_at(int position) {
        erase(node_at(position));
    }

    void print_forward() const {
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

    void print_backward() const {
        bool first = true;

        for (int u = tail; u != 0; u = nodes[u].previous) {
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

    DoublyLinkedList values(n + 1);

    for (int i = 1; i <= n; i++) {
        int value;
        cin >> value;
        values.insert_after(values.tail, value);
    }

    int insert_position;
    int value;
    cin >> insert_position >> value;
    values.insert_at(insert_position, value);

    int erase_position;
    cin >> erase_position;
    values.erase_at(erase_position);

    values.print_forward();
    values.print_backward();
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
4
10 20 30 40
3 25
4
```

输出：

```text
10 20 25 40
40 25 20 10
```

## 需要记住什么

1. 双向链表节点比单向链表多保存什么？
2. 为什么每次修改都必须同时保持 `previous` 和 `next` 一致？
3. 已知待删除节点时，双向链表为什么能在 $O(1)$ 时间删除它？
4. 首节点的 `previous` 为什么可以是虚拟头节点 `0`？
5. 双向链表能否在 $O(1)$ 时间访问第 $k$ 个逻辑位置？
6. 删除尾节点时，为什么还要更新 `tail`？
