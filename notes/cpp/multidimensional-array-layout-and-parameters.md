# 多维数组的布局与参数传递

> 最近修订：2026-08-16 15:06 +10:00（未审阅）

[多维数组](multidimensional-arrays.md) 已经把二维数组理解成“由若干行组成的
数组”。这个理解不仅适合下标访问，也准确决定了它在内存中的排列和作为函数参数
时的类型。

本篇解释这些容易混淆的类型规则，并给出竞赛中的实际选择。它是配套扩展，不要求为了使用普通二维数组而提前记住所有指针声明。

## 数组中的数组

声明：

```cpp
int a[2][3];
```

可以从外向内读：`a` 是长度为 $2$ 的数组，每个元素又是长度为 $3$ 的 `int` 数组。因此：

- `a` 的元素类型是 `int[3]`；
- `a[i]` 选择完整的第 $i$ 行；
- `a[i][j]` 再从这一行选择第 $j$ 个 `int`。

数组的元素连续存放。每一行本身是数组，外层的两行也作为相同类型的两个元素连续存放，所以六个整数的顺序一定是：

```text
a[0][0], a[0][1], a[0][2], a[1][0], a[1][1], a[1][2]
```

这就是行优先布局，不是编译器碰巧选择的结果。

## 二维地址公式

对于 `int a[n][m]`，先完整存放第 $0$ 行的 $m$ 个元素，再存第 $1$ 行。0-based 元素 `a[i][j]` 之前共有：

$$
i\times m+j
$$

个 `int`。若 `a[0][0]` 的起始地址记为 $B$，则 `a[i][j]` 的字节地址是：

$$
B+(i\times m+j)\times \mathrm{sizeof}(int).
$$

例如 `int a[2][3]` 中，`a[1][1]` 前面有 $1\times3+1=4$ 个 `int`。当一个 `int` 占 $4$ 字节时，它的起始地址比 `a[0][0]` 高 $16$ 字节。

三维数组继续使用相同思路。对于 `a[x][y][z]`，元素 `a[i][j][k]` 的线性编号是：

$$
(i\times y+j)\times z+k.
$$

公式不需要死记；从“外层数组的一个元素，是完整的下一层数组”逐层展开即可重新得到。

## 只调整最外一维

一维数组作为函数参数时会调整为首元素指针：

```cpp
void clear(int a[], int n);
```

二维数组也只调整最外层。`int a[MAXN][MAXM]` 的首元素不是一个 `int`，而是一整行 `int[MAXM]`，所以数组表达式会变成“指向一行的指针”。参数可以写成：

```cpp
const int MAXM = 1000 + 5;

void clear(int a[][MAXM], int n, int m) {
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            a[i][j] = 0;
        }
    }
}
```

第一维长度没有出现在参数中，因为函数接收的已经是指向第一行的指针。第二维 `MAXM` 不能省略：编译器计算 `a + 1` 时，必须知道一整行包含多少个 `int`，才能跳到下一行。

同一个参数类型也可以写成指向数组的指针：

```cpp
void clear(int (*a)[MAXM], int n, int m);
```

括号不能省略。`int* a[MAXM]` 会变成“由 `MAXM` 个 `int*` 组成的数组”，含义完全不同。基础竞赛代码通常使用更直观的 `int a[][MAXM]`，读底层类型时再认识 `int (*a)[MAXM]`。

三维数组同样只省略最外一维：

```cpp
const int MAXY = 100 + 5;
const int MAXZ = 100 + 5;

void clear(int a[][MAXY][MAXZ], int x, int y, int z);
```

编译器必须保留 `MAXY` 与 `MAXZ`，才能算出跨过一个最外层元素需要移动多少字节。

## 二维数组不是 int**

`int**` 表示“指向 `int*` 的指针”。它通常假设当前位置保存的是若干个独立的行指针：

```text
int**
  │
  ├──> 第 0 行的某个地址
  ├──> 第 1 行的某个地址
  └──> 第 2 行的某个地址
```

普通 `int a[MAXN][MAXM]` 没有这层行指针表。它直接保存一行接一行的整数：

```text
第 0 行整数 | 第 1 行整数 | 第 2 行整数 | ...
```

因此 `int**` 不能接收普通二维数组。二者既有不同类型，也有不同内存解释；强制转换不能把一种布局变成另一种布局。

## 竞赛中的实际选择

不同表示解决不同问题，不需要选出一种覆盖所有场景。

### 全局内置数组

容量上限编译前已知，而且只为当前题目服务时，可以把大型数组放在全局：

```cpp
const int MAXN = 1000 + 5;
const int MAXM = 1000 + 5;

int a[MAXN][MAXM];
```

辅助函数直接使用 `a`，不用传递复杂的多维参数；对象也不会占用调用栈。这是传统竞赛代码中简单可靠的方案，但固定容量可能浪费内存，全局名称也不适合封装多个实例。

### vector 的引用

规模在运行时确定时，最直观的二维接口是：

```cpp
void add_one(vector<vector<int>>& a, int x, int y) {
    a[x][y]++;
}

int get_value(const vector<vector<int>>& a, int x, int y) {
    return a[x][y];
}
```

非 `const` 引用用于修改，`const` 引用用于只读，整个二维容器都不会被复制。`vector<vector<int>>` 的每一行分别分配内存，写法方便，但所有行并不组成一整块连续矩形。

如果算法需要整个矩形严格连续，可以自己使用一维 `vector`：

```cpp
int stride = m + 5;
vector<int> a((n + 5) * stride);

int& at(vector<int>& a, int stride, int i, int j) {
    return a[i * stride + j];
}
```

这里把二维地址公式直接变成下标公式，并把 `0` 行、`0` 列以及 `+5` 余量统一
留空。函数用引用返回对应元素，因此 `at(a, stride, i, j) = value` 可以修改原
容器。

### struct 中的 vector

可复用数据结构通常更适合把规模和存储一起封装：

```cpp
struct Grid {
    int n;
    int m;
    int stride;
    vector<int> value;

    Grid(int n, int m) : n(n), m(m), stride(m + 5), value((n + 5) * stride) {}

    int& at(int i, int j) {
        return value[i * stride + j];
    }
};
```

调用者只负责构造 `Grid grid(n, m)`，不再分别维护长度、容量和裸数组。树状数组、线段树等可复用模板也可以使用同一思路：`struct` 保存 `n` 和内部 `vector`，但仍然按照数据结构本身最自然的方式使用 1-based 下标。

### array 的位置

`array<T, N>` 的长度 `N` 是类型的一部分，不会像内置数组参数那样自动调整成指针：

```cpp
void clear(array<int, 10>& a) {
    a.fill(0);
}
```

它适合编译期定长的小型值对象，并且可以直接使用迭代器、`fill`、比较等标准容器接口。二维 `array` 需要写成 `array<array<int, M>, N>`；规模仍必须在编译期确定，大型局部对象仍可能占用过多调用栈。因此它有明确用途，但不是大型竞赛数组或运行期规模数据结构的普遍替代品。

## 下标与容器不是一回事

`vector` 原生下标从 `0` 开始，但自定义题目对象可以主动分配 `n + 5` 个元素并
忽略第 `0` 格，让逻辑下标使用 `1..n`：

```cpp
vector<int> value(n + 5);
```

这点余量能让点编号、树节点编号、矩阵坐标和题面保持一致，也能给边界与哨兵留下
稳定空间。本书自己定义的对象统一使用 1-based 下标和 `+5` 容量；只有直接调用
`vector`、迭代器等 STL 原生接口时，才保留它们的 0-based 与左闭右开规则。

## 完整代码

下面保留完整的二维数组参数写法。输入一个矩阵和一个单点增量，将修改带回调用处后输出该元素。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1000 + 5;
const int MAXM = 1000 + 5;

int a[MAXN][MAXM];

void add_value(int a[][MAXM], int x, int y, int value) {
    a[x][y] += value;
}

void solve() {
    int n;
    int m;
    cin >> n >> m;

    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            cin >> a[i][j];
        }
    }

    int x;
    int y;
    int value;
    cin >> x >> y >> value;

    add_value(a, x, y, value);
    cout << a[x][y] << '\n';
}

int main() {
    solve();
    return 0;
}
```

这个程序用于辨认参数类型。真正封装可复用数据结构时，优先让 `struct` 自己持有按实际规模分配的 `vector`，不要求调用者处理裸数组参数。

## 需要记住什么

1. `int a[2][3]` 的元素类型是什么？六个整数按什么顺序存放？
2. `a[i][j]` 前面有多少个元素？怎样由此得到字节地址？
3. 二维数组作为参数时，为什么第一维可以省略，第二维不能省略？
4. `int a[][MAXM]` 调整后指向的是一个 `int`，还是完整的一行？
5. 为什么 `int**` 不能接收普通二维内置数组？
6. 全局内置数组、`vector<vector<int>>`、一维 `vector` 与 `array` 分别适合什么场景？
7. 为什么使用 `vector` 不等于所有算法都必须改成 0-based？

指向数组的声明语法需要能够查阅和辨认，不要求脱离实际代码默写。竞赛模板更重要的是选定一种与问题匹配的表示，并在整个算法中保持同一套下标语义。

## 返回基础篇

返回 [多维数组](multidimensional-arrays.md) 继续主学习路线。
