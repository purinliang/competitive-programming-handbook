# 循环链表

> 最近修订：2026-08-17 00:21 +10:00（未审阅）

普通链表走到尾节点后结束。某些过程却要在处理末尾后回到开头，例如围成一圈轮流操作参与者。若每次到达末尾都手工跳回首节点，程序会不断处理同一个边界。

**循环链表**让尾节点直接连接首节点，形成闭合的逻辑顺序。它也常被称为环形链表；本书统一使用“循环链表”。

## 尾节点重新指向首节点

普通单向链表的尾节点满足：

```cpp
nodes[tail].next = 0;
```

非空循环链表则满足：

```cpp
nodes[tail].next = head;
```

例如：

```text
head -> 1 -> 2 -> 3
 ^               |
 |_______________|
```

从任何真实节点不断沿 `next` 前进，最终都会回到它曾经经过的节点，而不会自然到达 `0`。

空链表仍使用：

```cpp
head = 0;
tail = 0;
```

## 单节点链表

只有一个节点 `u` 时，它既是首节点也是尾节点：

```cpp
head = u;
tail = u;
nodes[u].next = u;
```

自指并不是错误，而是“尾节点连接首节点”在单节点情况下的自然结果。

很多循环链表错误都发生在空链表与单节点链表之间的转换。每次修改后都可以检查两条不变量：

- 空链表满足 `head == 0 && tail == 0`；
- 非空链表满足 `nodes[tail].next == head`。

## 在尾部追加

建立新节点 `u` 后，空链表需要单独建立自环：

```cpp
if (head == 0) {
    head = u;
    tail = u;
    nodes[u].next = u;
}
```

非空链表中，新节点先指向首节点，原尾节点再指向新节点：

```cpp
nodes[u].next = head;
nodes[tail].next = u;
tail = u;
```

两种情况都只修改固定数量的链接，因此保存 `tail` 时，尾部追加是 $O(1)$。

## 在已知节点后插入

把新节点 `v` 插在已知节点 `u` 后面，与普通单向链表相同：

```cpp
nodes[v].next = nodes[u].next;
nodes[u].next = v;
```

若 `u` 原来是尾节点，还要更新：

```cpp
if (u == tail) {
    tail = v;
}
```

此时 `v.next` 已经接住旧的 `tail.next`，也就是 `head`，所以循环关系仍然成立。

## 删除已知节点的后继

已知节点 `u`，令：

```cpp
int v = nodes[u].next;
```

如果 `v == u`，链表只有一个节点。删除它后必须恢复空状态：

```cpp
head = 0;
tail = 0;
```

否则让 `u` 跳过 `v`：

```cpp
nodes[u].next = nodes[v].next;
```

还要根据被删除节点的位置维护入口：

```cpp
if (v == head) {
    head = nodes[v].next;
}
if (v == tail) {
    tail = u;
}
```

最后应重新满足 `nodes[tail].next == head`。已知前驱 `u` 时，删除是 $O(1)$。

## 遍历一圈

普通链表用 `u != 0` 停止；循环链表永远不会从非空结构走到 `0`。应在重新回到起点时停止。

可以先处理首节点，再移动并检查：

```cpp
int u = head;

do {
    cout << nodes[u].value << '\n';
    u = nodes[u].next;
} while (u != head);
```

`do while` 很适合这里：非空循环链表至少要处理首节点一次，然后才能判断是否已经绕回起点。

执行这段代码以前必须确认 `head != 0`。空链表没有真实起点，不能访问 `nodes[head]` 作为数据节点。

也可以记录已经访问的节点数量，恰好循环 `n` 次。无论采用哪一种停止条件，都必须明确“一圈”的边界，否则会形成无限循环。

## 循环与图中的环

循环链表是一种线性数据结构的存储形式：每个节点按照固定的后继关系排成一圈。图论中的环讨论一般图的点和边关系，可能存在分支、多个环或其他路径。

两者的图形看起来相似，但学习目标不同。循环链表关注怎样维护首尾链接和顺序操作，不需要使用一般图算法。

## 完整代码

下面实现单向循环链表。程序建立初始序列，删除指定逻辑位置之后的节点，再从当前首节点输出一圈。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Node {
    int value;
    int next;
};

struct CircularLinkedList {
    vector<Node> nodes;
    int head;
    int tail;
    int n;

    CircularLinkedList(int capacity) {
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
            head = u;
            tail = u;
            nodes[u].next = u;
        } else {
            nodes[u].next = head;
            nodes[tail].next = u;
            tail = u;
        }
        n++;
    }

    int node_at(int position) const {
        int u = head;

        for (int i = 1; i < position; i++) {
            u = nodes[u].next;
        }
        return u;
    }

    void erase_after(int u) {
        int v = nodes[u].next;

        if (v == u) {
            head = 0;
            tail = 0;
        } else {
            nodes[u].next = nodes[v].next;

            if (v == head) {
                head = nodes[v].next;
            }
            if (v == tail) {
                tail = u;
            }
            nodes[tail].next = head;
        }

        nodes[v].next = 0;
        n--;
    }

    void print_once() const {
        if (head == 0) {
            cout << '\n';
            return;
        }

        int u = head;
        bool first = true;

        do {
            if (!first) {
                cout << ' ';
            }
            cout << nodes[u].value;
            first = false;
            u = nodes[u].next;
        } while (u != head);

        cout << '\n';
    }
};

void solve() {
    int n;
    cin >> n;

    CircularLinkedList values(n);

    for (int i = 1; i <= n; i++) {
        int value;
        cin >> value;
        values.push_back(value);
    }

    int position;
    cin >> position;

    int u = values.node_at(position);
    values.erase_after(u);
    values.print_once();
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
3
```

逻辑位置 `3` 是值 `30` 的节点，它的后继 `40` 被删除。输出：

```text
10 20 30 50
```

完整代码假设初始链表非空且删除后仍允许为空；输入位置合法。寻找逻辑位置是 $O(n)$，已知节点后删除是 $O(1)$，输出一圈是 $O(n)$。

## 需要记住什么

1. 非空循环链表的 `tail.next` 应当指向哪里？
2. 单节点循环链表的 `next` 为什么指向自己？
3. 为什么循环链表不能使用“走到 `0`”作为普通遍历停止条件？
4. `do while` 为什么适合遍历一圈？
5. 删除唯一节点后，`head` 和 `tail` 应恢复成什么？
6. “单向或双向”与“普通或循环”分别描述链表的什么性质？
