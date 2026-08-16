# 结构体

> 最近修订：2026-08-16 11:48 +10:00（未审阅）

一个参赛者可以同时有编号和分数。如果用两个相互独立的数组保存，程序必须一直记住 `id[i]` 和 `score[i]` 共同属于第 `i` 个人：

```cpp
int id[MAXN];
int score[MAXN];
```

当一个对象由多个相关数据共同描述时，C++ 可以使用结构体（`struct`）将这些数据组合成一个整体。`struct` 声明的是一种**结构体类型**。

## 声明结构体类型

使用 `struct` 声明参赛者类型：

```cpp
struct Contestant {
    int id;
    int score;
};
```

- `struct` 表示开始声明一种结构体类型；
- `Contestant` 是新类型的名字；
- `id` 和 `score` 是这种类型包含的**成员**；
- 右花括号后的分号不能省略。

这段代码只声明了一种类型，还没有创建具体的参赛者对象。

## 声明对象

结构体类型声明完成后，它可以像 `int` 一样用来声明变量：

```cpp
Contestant contestant;
```

`Contestant` 是类型，`contestant` 是一个具体对象。在 C++ 中不需要重复写 `struct Contestant contestant;`，也不需要为结构体类型再写一层 `typedef`。

同一种类型可以声明任意多个相互独立的对象：

```cpp
Contestant first;
Contestant second;
```

`first` 和 `second` 都同时包含自己的 `id` 和 `score`。

## 访问成员

拥有一个结构体对象时，使用点运算符 `.` 访问其中的成员：

```cpp
contestant.id = 7;
contestant.score = 95;

printf("%d %d\n", contestant.id, contestant.score);
```

`contestant.id` 表示 `contestant` 对象中的 `id`，`contestant.score` 表示同一对象中的 `score`。点的左边是对象，右边是该类型已经声明的成员名。

读入成员时，可以将成员表达式像普通变量一样交给 `scanf`：

```cpp
scanf("%d%d", &contestant.id, &contestant.score);
```

## 初始化

结构体对象可以按成员的声明顺序提供初值：

```cpp
Contestant contestant = {7, 95};
```

第一个值 `7` 初始化第一个成员 `id`，第二个值 `95` 初始化第二个成员 `score`。也可以使用 C++ 更紧凑的初始化语法：

```cpp
Contestant contestant{7, 95};
```

这种按顺序初始化的写法很简洁，但必须确认每个值与成员声明顺序对应。如果顺序容易混淆，逐个使用成员名赋值更清楚。

使用空初始化列表时，整数成员都会初始化为 $0$：

```cpp
Contestant contestant = {};
```

对没有初始化式的局部对象，这两个 `int` 成员不会自动清零，不要在赋值之前读取它们。

## 结构体数组

学会 [一维数组](one-dimensional-arrays.md) 后，可以把结构体类型作为数组的
元素类型：

```cpp
const int MAXN = 2e5 + 5;
Contestant contestants[MAXN];
```

`contestants[i]` 是一个完整的 `Contestant` 对象，再用一个点访问它的成员：

```cpp
scanf("%d%d", &contestants[i].id, &contestants[i].score);
printf("%d\n", contestants[i].score);
```

与平行的 `id[i]` 和 `score[i]` 相比，结构体数组让每个 `contestants[i]` 自己保持一组完整数据。后续如果整体移动、交换或排序一个参赛者，其编号和分数不会因为忘记同步处理而分离。

## 整体赋值

同一结构体类型的两个对象可以直接赋值：

```cpp
Contestant first = {7, 95};
Contestant second;

second = first;
```

这会把 `first` 的每个成员复制给 `second`。复制完成后，它们仍然是两个独立对象：

```cpp
second.score = 100;
printf("%d %d\n", first.score, second.score); // 95 100
```

不要由此推测结构体能直接使用所有运算符。在 C++17 中，自己声明的这种结构体没有自动生成 `==`、`<` 等比较运算。排序时如何按某个成员比较，属于排序中的比较器，不在本篇展开。

## 完整代码

下面的程序将每个参赛者的编号和分数保存在同一个 `Contestant` 对象中，最后输出分数最高者的编号和分数。题目保证 $n \ge 1$，且最高分只有一人。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 2e5 + 5;

struct Contestant {
    int id;
    int score;
};

int n;
Contestant contestants[MAXN];

void solve() {
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        scanf("%d%d", &contestants[i].id, &contestants[i].score);
    }

    int best = 1;
    for (int i = 2; i <= n; i++) {
        if (contestants[i].score > contestants[best].score) {
            best = i;
        }
    }

    printf("%d %d\n", contestants[best].id, contestants[best].score);
}

int main() {
    solve();
    return 0;
}
```

例如，输入：

```text
4
101 78
205 96
307 83
412 91
```

输出：

```text
205 96
```

数组保存 $n$ 个参赛者，空间复杂度为 $O(n)$。读入和查找最高分者都只扫描数组一次，时间复杂度为 $O(n)$。

## 常见错误

### 忘记类型声明后的分号

结构体类型的右花括号后必须写分号。这个分号结束整个类型声明，不是结构体内
最后一个成员声明的分号。

### 混淆类型与对象

`Contestant` 是类型，`Contestant contestant;` 才创建名为 `contestant` 的
对象。只声明类型不会自动产生一个参赛者。

### 交换成员初始化顺序

聚合初始化按照成员声明顺序匹配值。若多个成员类型相同，交换顺序仍可能通过
编译，却让数据含义错误。

### 认为结构体自动支持比较

C++17 不会为普通自定义结构体自动生成 `==` 或 `<`。整体赋值可以直接使用，
内容比较和排序规则则要在对应算法中明确提供。

## 需要记住什么

1. `struct Contestant { ... };` 声明的是类型还是具体对象？
2. 结构体类型的右花括号后为什么还要写分号？
3. 如何声明一个 `Contestant` 对象，并使用 `.` 读写它的成员？
4. 使用 `{7, 95}` 初始化对象时，两个初值按什么顺序与成员对应？
5. `contestants[i].score` 中的数组下标和点运算符分别选中了什么？
6. 将一个结构体对象赋值给同类型的另一个对象时，成员如何处理？

结构体的内存对齐、成员函数、访问控制与 `class` 的关系都不是竞赛中使用 `struct` 保存数据的前提，不要求在本篇理解或记忆。
