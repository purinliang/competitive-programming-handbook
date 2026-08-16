# `pair`

> 最近修订：2026-08-16 12:27 +10:00（未审阅）

一个 C++ 函数通常通过一条 `return` 返回一个结果。但有些结果天然由两部分组成：

- 整数除法同时得到商和余数；
- 一个坐标同时包含横坐标和纵坐标；
- 一条带权边的邻接项同时包含终点和边权。

可以为每一种含义声明一个 `struct`，但如果只需要临时把两个值组成一个整体，标准库已经提供了 `pair`。

## 两个成员的类型

`pair` 需要在尖括号中写出两个成员的类型：

```cpp
pair<int, int> point;
```

这里声明了一个同时包含两个 `int` 的对象 `point`。两个类型不必相同：

```cpp
pair<int, double> measurement;
```

这个 `pair` 的第一个成员是 `int`，第二个成员是 `double`。

`pair` 本身是标准库提供的类型模板。当前只需要会把两个具体类型写入 `pair<T, U>`，不需要先学会自己声明模板。

## first 与 second

`pair` 固定提供两个成员：

- `first` 是第一个值；
- `second` 是第二个值。

使用点运算符读写它们：

```cpp
pair<int, int> point;
point.first = 3;
point.second = 5;
printf("%d %d\n", point.first, point.second);
```

这与访问 `struct` 成员的写法相同，只是成员名已经由标准库固定为 `first` 和 `second`。

这两个名称只表示位置，不说明业务含义。若程序需要长期维护“编号、姓名、分数”等多个有明确含义的字段，[复合类型：struct](struct.md) 的成员名会更清楚。`pair` 更适合两个值的含义已经由函数名、容器类型或当前算法语境说明的场景。

## 初始化

可以使用花括号按 `first`、`second` 的顺序初始化：

```cpp
pair<int, int> point = {3, 5};
```

在初始值已经足够让编译器推导两个类型时，也可以使用 `make_pair`：

```cpp
pair<int, int> point = make_pair(3, 5);
```

竞赛代码中，`{3, 5}` 更短也更直接，因此本书默认使用花括号。读到别人代码中的 `make_pair(a, b)` 时，知道它同样创建一个由 `a,b` 组成的 `pair` 即可。

使用空花括号初始化时，两个成员分别进行值初始化：

```cpp
pair<int, int> point = {};
```

这里的两个 `int` 都初始化为 $0$。

## 返回两个值

整数除法的商和余数共同构成一个结果。与其返回 `bool` 再通过两个引用参数修改调用者，不如直接返回 `pair<int, int>`：

```cpp
pair<int, int> divide(int a, int b) {
    int quotient = a / b;
    int remainder = a % b;
    return {quotient, remainder};
}
```

函数名 `divide` 和正文约定了返回顺序：`first` 是商，`second` 是余数。调用者可以先保存整个结果：

```cpp
pair<int, int> result = divide(17, 5);
printf("%d %d\n", result.first, result.second);
```

输出为 `3 2`。一个 `return` 返回的仍然是一个对象，只是这个对象内部同时保存两个成员。

## 结构化绑定

C++17 可以在接收 `pair` 时直接为两个成员分别命名：

```cpp
auto [quotient, remainder] = divide(17, 5);
```

这种写法称为结构化绑定。`auto` 让编译器从右边的 `pair<int, int>` 推导出两个名称的类型；方括号中的顺序与 `first`、`second` 一致。

默认的 `auto [a, b]` 会建立对应值，修改新名称不会修改原 `pair`：

```cpp
pair<int, int> point = {3, 5};
auto [x, y] = point;
x = 10;
printf("%d %d\n", point.first, point.second); // 3 5
```

若确实需要让两个名称引用原成员，在 `auto` 后加 `&`：

```cpp
auto& [x, y] = point;
x = 10;
printf("%d %d\n", point.first, point.second); // 10 5
```

对只读的 `pair` 或希望明确禁止修改时，使用 `const auto&`：

```cpp
const auto& [x, y] = point;
```

在函数返回值这种临时结果上，直接使用 `auto [quotient, remainder]` 最清楚；只有已经存在的 `pair` 需要避免复制或修改原成员时，才特意加引用。

## 整体赋值与比较

同类型的 `pair` 可以整体赋值，两个成员一起复制：

```cpp
pair<int, int> a = {3, 5};
pair<int, int> b = a;
```

`pair` 的比较按字典序进行：先比较 `first`；只有 `first` 相等时，才比较 `second`。

```cpp
pair<int, int> a = {2, 100};
pair<int, int> b = {3, 1};
printf(a < b ? "Yes\n" : "No\n");
```

输出 `Yes`，因为第一个成员已经有 $2<3$，不再需要用第二个成员决定大小。

这个规则对按“主关键字，再按次关键字”排序非常方便。具体排序接口见 [sort](sorting.md)。

## 完整代码

下面的程序读入非负整数 $a$ 和正整数 $b$，通过 `pair` 同时返回整数除法的商和余数。

```cpp
#include <bits/stdc++.h>
using namespace std;

pair<int, int> divide(int a, int b) {
    int quotient = a / b;
    int remainder = a % b;
    return {quotient, remainder};
}

void solve() {
    int a, b;
    scanf("%d%d", &a, &b);

    auto [quotient, remainder] = divide(a, b);
    printf("%d %d\n", quotient, remainder);
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
17 5
```

输出：

```text
3 2
```

构造、访问、赋值、比较和返回这个 `pair<int, int>` 都只处理两个固定整数，时间和额外空间复杂度都是 $O(1)$。若成员本身是更大的对象，整体复制和比较的代价由对应成员操作决定。

## 基础练习

1. 声明 `pair<int, int>` 保存一个坐标，用花括号初始化并输出两个成员。
2. 写一个函数，通过 `pair<int, int>` 同时返回两个整数中的较小值和较大值。
3. 用 `auto [x, y]` 复制一个 `pair`，修改 `x` 后检查原对象；再改用 `auto& [x, y]` 比较结果。
4. 手动比较 `{2, 100}` 与 `{3, 1}`、`{2, 100}` 与 `{2, 99}`，说明每次由哪个成员决定顺序。
5. 为“姓名、年龄、分数”选择 `pair` 或 `struct`，说明为什么。

## 需要记住什么

1. `pair<T, U>` 中的 `T,U` 分别决定什么？两个类型必须相同吗？
2. 如何读写 `pair` 的两个成员？
3. `return {quotient, remainder};` 为什么仍然只返回了一个对象？
4. `auto [a, b]`、`auto& [a, b]` 和 `const auto& [a, b]` 对原成员的复制、修改权限有什么不同？
5. `pair` 按什么顺序比较两个成员？
6. 什么场景适合使用 `pair`？什么时候具有明确成员名的 `struct` 更清楚？

`pair` 的内存布局、模板声明、分段构造和标准库比较概念的完整形式都不属于本篇的竞赛基础用法，不要求理解或记忆。
