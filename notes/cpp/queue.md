# 容器适配器：queue

> 最近修订：2026-08-13 21:56 +10:00（未审阅）

[队列](../algorithm-basics/queue.md) 已经解释先进先出（FIFO）、线性数组和循环数组实现。[序列容器：deque](deque.md) 又提供了两端都能高效操作的标准库容器。

普通竞赛代码只需要先进先出时，不必自己维护队首下标，也不必开放 `deque` 的全部接口。标准库 `queue` 把底层容器限制为只允许队尾加入、队首查看和删除，直接表达队列语义。

本篇只学习 `queue` 的编码接口。广度优先搜索会在图的遍历文章中解释为什么按到达顺序扩展状态；优先队列则按照优先级而不是到达顺序取出元素，另行成篇。

## 声明一个 queue

`queue` 是类模板，尖括号中填写元素类型：

```cpp
queue<int> q;
```

这会建立一个保存 `int` 的空队列。也可以保存其他类型：

```cpp
queue<string> messages;
queue<pair<int, int>> positions;
```

标准头文件是 `<queue>`。本仓库完整竞赛代码使用 `#include <bits/stdc++.h>`，不需要另行列出。

变量名 `q` 在语境明确时是 queue 的常用缩写；若程序中还存在查询数量 `q`，应改用 `tasks`、`people`、`states` 等含义明确且不冲突的名称。

## 从队尾加入

`push(value)` 把新元素加入队尾：

```cpp
q.push(10);
q.push(20);
q.push(30);
```

队列从首到尾是：

```text
front -> 10 20 30 <- back
```

最早进入的 `10` 位于队首，最后进入的 `30` 位于队尾。

## 读取队首

`front()` 返回当前队首元素：

```cpp
int first = q.front();
```

这一步只读取 `10`，不会删除。再次调用仍得到同一个队首。

`front()` 返回引用，也可以修改队首对象：

```cpp
q.front() = 15;
```

普通算法更常读取后弹出；只有题意确实要更新当前待处理对象时才直接修改。

## 读取队尾

`back()` 返回当前队尾元素：

```cpp
int last = q.back();
```

在刚才的队列中得到 `30`。它同样返回引用，但不会改变队列长度。

队列虽然允许查看队尾，却不能从队尾删除，也不能从队首加入。这样的限制保证所有元素仍按照进入顺序离开。

## 删除队首

`pop()` 删除队首：

```cpp
q.pop();
```

删除 `10` 后，`20` 成为新队首：

```text
front -> 20 30 <- back
```

`pop()` 返回类型是 `void`，不会返回被删除元素。需要取出并删除时，先复制 `front()`，再调用 `pop()`：

```cpp
int value = q.front();
q.pop();
```

若把顺序交换，原队首已经删除，随后读到的是下一个元素；原队列只有一个元素时还会变成空队列访问。

也不要在删除后继续使用原队首引用：

```cpp
int& value = q.front();
q.pop();
```

`pop()` 已经销毁它所引用的对象，`value` 此后失效。需要保留内容时使用普通值复制。

## 判空与数量

`empty()` 判断是否没有元素，`size()` 返回当前元素数量：

```cpp
bool no_value = q.empty();
int count = q.size();
```

`front()`、`back()` 和 `pop()` 都要求队列非空。题面没有保证时必须先判断：

```cpp
if (!q.empty()) {
    int value = q.front();
    q.pop();
}
```

空队列上访问或删除是未定义行为，不会自动提供 `-1` 等哨兵。

只判断是否存在元素时使用 `empty()`；真正需要数量时使用 `size()`。竞赛题保证数量能放进 `int` 时，本书直接保存为 `int`。

## 接口对应关系

| 抽象操作 | `queue` 接口 | 作用 |
| --- | --- | --- |
| 入队 | `q.push(value)` | 在队尾加入元素 |
| 查看队首 | `q.front()` | 返回队首引用，不删除 |
| 查看队尾 | `q.back()` | 返回队尾引用，不删除 |
| 出队 | `q.pop()` | 删除队首，不返回元素 |
| 判空 | `q.empty()` | 判断是否没有元素 |
| 查询数量 | `q.size()` | 返回当前元素数 |

默认底层容器下，这些操作都是 $O(1)$。保存 $n$ 个元素需要 $O(n)$ 空间。

## 为什么叫容器适配器

`queue` 不负责向使用者展示一套可以任意操作的序列，而是把底层容器的端点操作改造成先进先出接口：

```text
底层末尾加入  -> push
底层开头元素  -> front
底层末尾元素  -> back
底层开头删除  -> pop
```

`queue<int>` 默认使用 `deque<int>`。`deque` 的 `push_back`、`front`、`back`、`pop_front` 都是 $O(1)$，恰好满足普通队列需要。

也可以使用满足这些接口的其他底层容器，例如：

```cpp
queue<int, list<int>> q;
```

普通竞赛代码没有明确原因时保留默认 `queue<int>`。底层实现不是算法语义的一部分。

与 `stack` 不同，`vector` 不能直接作为 `queue` 的底层容器：

```cpp
// queue<int, vector<int>> q;  // vector 没有 pop_front()
```

`stack` 只需要底层末端操作，所以 `vector` 能满足；`queue` 还需要常数时间的队首删除。

## 受限接口

`queue` 不提供下标：

```cpp
// q[0]  // 不存在
```

也不提供 `begin()`、`end()`，不能直接使用范围 `for` 遍历。想按照先进先出顺序访问全部元素，只能反复读取 `front()` 并 `pop()`，这会清空原队列。

受限接口明确告诉读者：算法只应处理最早进入且尚未离开的元素。若需要随机访问、遍历、从两端删除或保留全部序列，应直接使用 `deque` 或 `vector`。

`queue` 也没有 `clear()`。需要清空并继续使用时，可以反复 `pop()`：

```cpp
while (!q.empty()) {
    q.pop();
}
```

若只是开始一个完全无关的新过程，重新声明一个空队列通常更清楚。

## 操作序列程序

定义六类操作：

| 类型 | 输入 | 行为 |
| ---: | --- | --- |
| 1 | `1 value` | 把 `value` 入队 |
| 2 | `2` | 输出并删除队首 |
| 3 | `3` | 输出队首但不删除 |
| 4 | `4` | 输出队尾但不删除 |
| 5 | `5` | 输出元素数量 |
| 6 | `6` | 空队列输出 `1`，否则输出 `0` |

输入保证类型 `2..4` 出现时队列非空。

类型 `2` 先读取、再删除：

```cpp
int value = values.front();
values.pop();
printf("%d\n", value);
```

其余查询不会改变队列。

## 完整代码

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int operation_count;
    scanf("%d", &operation_count);

    queue<int> values;

    for (int i = 1; i <= operation_count; i++) {
        int type;
        scanf("%d", &type);

        if (type == 1) {
            int value;
            scanf("%d", &value);
            values.push(value);
        } else if (type == 2) {
            int value = values.front();
            values.pop();
            printf("%d\n", value);
        } else if (type == 3) {
            printf("%d\n", values.front());
        } else if (type == 4) {
            printf("%d\n", values.back());
        } else if (type == 5) {
            printf("%d\n", (int)values.size());
        } else if (type == 6) {
            printf("%d\n", values.empty());
        }
    }

    return 0;
}
```

输入：

```text
11
1 10
1 20
3
4
5
2
3
6
2
6
5
```

输出：

```text
10
20
2
10
20
0
20
1
0
```

两个元素按照 `10, 20` 的入队顺序被类型 `2` 依次删除。最后队列为空。

## 时间与空间复杂度

每个输入操作只调用固定数量的 $O(1)$ 队列接口，所以处理 $q$ 个操作需要 $O(q)$ 时间。

队列最多保存 $q$ 个元素，需要 $O(q)$ 空间；每个单独操作只使用 $O(1)$ 额外空间。

## 常见错误

### 从队尾删除

`queue::pop()` 删除的是队首，不是队尾。若算法需要两端删除，应使用 `deque`，不能假设 `queue` 有 `pop_back()`。

### 认为 pop 会返回元素

不能写 `int value = values.pop()`。先调用 `front()` 保存队首，再调用 `pop()` 删除。

### 空队列访问首尾或删除

`front()`、`back()`、`pop()` 都要求非空。题面没有前置保证时先调用 `empty()`。

### 删除后使用队首引用

`front()` 返回引用，但 `pop()` 会销毁原队首。需要在出队后使用它时复制数值，不保留引用。

### 试图使用下标或遍历

`queue` 只暴露先进先出所需接口。需要查看中间元素时，问题所需结构已经不是普通队列。

### 把 vector 指定为底层容器

`vector` 没有队首删除接口，不能满足 `queue` 的底层要求。普通代码直接使用默认 `queue<T>`。

### 与 priority_queue 混淆

`queue` 按进入先后取出；`priority_queue` 按比较规则让当前优先级最高的元素位于顶部。二者名称相似，但顺序语义完全不同。

## 基础练习

1. 手动模拟完整代码样例，写出每一步从队首到队尾的元素。
2. 测试查询 `front()`、`back()`、`size()` 后队列内容不变。
3. 用 `queue<char>` 按读入顺序重新输出一串字符。
4. 增加类型 `7`，清空队列并输出删除元素数量。
5. 把抽象队列文章的服务窗口模拟改成 `queue<int>`，保留事件判断而替换手写存储。
6. 对随机合法操作序列，用数组和队首下标建立独立模型，与 `queue<int>` 输出对拍。
7. 分别列出普通队列、双端队列和栈能够加入、查看与删除的端点。

## 需要记住什么

1. 怎样声明保存 `int`、`string` 或 `pair<int, int>` 的 `queue`？
2. `push`、`front`、`back`、`pop`、`empty`、`size` 分别做什么？
3. 为什么取出并删除队首必须先 `front()` 再 `pop()`？
4. 哪三个接口要求队列非空？前置条件由什么保证？
5. `queue` 为什么被称为容器适配器？默认底层容器是什么？
6. 为什么 `vector` 能作为 `stack` 的底层，却不能作为 `queue` 的底层？
7. 为什么 `queue` 不提供下标、遍历和队尾删除？何时应使用 `deque`？
8. 普通 `queue` 的操作顺序与 `priority_queue` 有什么区别？
9. 默认接口的时间复杂度和存储空间是多少？

`emplace`、关系比较、交换、自定义底层容器约束和完整失效规则不属于竞赛中使用普通队列的必要内容，需要时查阅标准库资料即可，不要求记忆。
