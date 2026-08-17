# `sort`

> 最近修订：2026-08-16 09:48 +10:00（未审阅）

许多问题都要先把数据排成有序状态：输出名次、寻找相邻的重复值、使用二分查找，或按照时间和编号依次处理记录。自己实现排序算法当然可行，但当排序只是解题过程中的一个工具时，重复书写并调试它没有必要。

标准库的 `sort` 可以直接排列一个区间。本篇只学习怎样正确使用这个接口；选择排序、插入排序、快速排序和归并排序为什么有效，会在各自的基础算法文章中推导。

## 整个 vector 升序排序

[vector](vector.md) 已经用 `begin()` 表示第一个元素的位置，用 `end()` 表示
最后一个元素之后的位置。把这两个位置交给 `sort`，就能排列全部元素：

```cpp
vector<int> values = {5, 1, 4, 2, 3};
sort(values.begin(), values.end());
```

排序后，`values` 变成：

```text
1 2 3 4 5
```

`sort` 直接修改原容器，不会返回一个新的 `vector`。调用结束后，给定范围中的元素已经按照从小到大的默认顺序排列。

空序列和只有一个元素的序列本来就有序，可以直接交给 `sort`，不需要单独判断。

## 左闭右开范围

`sort(first, last)` 排列的是左闭右开范围 `[first,last)`：包含 `first` 指向的元素，不包含 `last` 指向的位置。

对原生 0-based 的 `vector`，只排序下标 `[l,r)`：

```cpp
sort(values.begin() + l, values.begin() + r);
```

这里要求 `0 <= l <= r <= values.size()`。当 `l == r` 时，范围为空。

若一段自定义算法使用 1-based 下标和闭区间 `[l,r]`，需要把右端转换成“最后一个元素之后”：

```cpp
sort(a.begin() + l, a.begin() + r + 1);
```

例如，`a[1..n]` 的完整排序范围是：

```cpp
sort(a.begin() + 1, a.begin() + n + 1);
```

这与本书的闭区间思考方式并不冲突：题目和自定义算法继续描述 `[l,r]`，只在调用 STL 时把它翻译成标准库要求的 `[first,last)`。

## 内置数组

内置数组使用指向元素的位置表示范围。0-based 数组 `a[0..n-1]` 写作：

```cpp
sort(a, a + n);
```

1-based 数组 `a[1..n]` 写作：

```cpp
sort(a + 1, a + n + 1);
```

`a + n + 1` 指向最后一个有效元素之后的位置，并不会被读取。

无论底层对象是哪一种，核心规则始终相同：传入排序起点和终点之后的位置。

## 默认顺序

整数和不含 `NaN` 的普通浮点数默认按数值升序排列，`char` 按字符编号排列，
`string` 按字典序排列。`NaN` 无法通过普通大小比较形成自洽顺序；若题目数据
可能包含它，必须先按题意单独处理，而不能直接依赖默认排序。

`vector<int>`、`vector<string>` 等序列本身也有字典序：从左到右找到第一处不同
元素并比较；若共同前缀完全相同，较短序列更小。对一个 `vector<string>` 排序时，
比较的是各个字符串；对一个 `string` 自身的字符范围排序时，重新排列的是字符。

## 降序排列

整数从大到小排列时，可以把 `greater<int>()` 作为第三个参数：

```cpp
sort(values.begin(), values.end(), greater<int>());
```

`greater<int>()` 是标准库提供的比较对象，它告诉 `sort` 把更大的 `int` 放在前面。对 `long long` 使用 `greater<ll>()`，类型应与元素一致。

也可以先升序排序，再调用 `reverse` 翻转整个范围：

```cpp
sort(values.begin(), values.end());
reverse(values.begin(), values.end());
```

只需要普通数值降序时，直接使用 `greater<int>()` 更明确；已经需要升序结果或还要翻转其他序列时，再根据上下文选择 `reverse`。

`reverse` 只负责把已经得到的完整顺序前后翻转，因此会同时反转每一级关键字。
若题目要求“分数降序、编号升序”，先按默认顺序排序再整体翻转无法得到这个混合
方向，必须写出明确的比较规则。这里调用的是 `reverse`，不是只负责预留容量的
`reserve`。

## 自定义比较器

记录往往有多个字段，题意不一定与默认字典序相同。例如，比赛排名要求：

1. 分数更高的选手在前；
2. 分数相同时，编号更小的选手在前。

先用 `struct` 保存一名选手：

```cpp
struct contestant {
    int id;
    int score;
};
```

`sort` 的第三个参数可以是一个比较函数。函数接收两个候选元素，并回答一个问题：左边的 `a` 是否应当排在右边的 `b` 前面？

```cpp
bool compare_contestant(const contestant& a, const contestant& b) {
    if (a.score != b.score) {
        return a.score > b.score;
    }
    return a.id < b.id;
}
```

分数不同时，`a.score > b.score` 把高分放在前面。只有分数相同，才用 `a.id < b.id` 决定先后。

调用时把函数名交给 `sort`：

```cpp
sort(contestants.begin(), contestants.end(), compare_contestant);
```

参数使用 `const` 引用，因为比较器只读取对象，而且不需要为每次比较复制整个 `struct`。

## lambda 比较器

比较规则只在一个调用点使用，而且足够短时，可以直接写成 lambda：

```cpp
sort(contestants.begin(), contestants.end(),
     [](const contestant& a, const contestant& b) {
         if (a.score != b.score) {
             return a.score > b.score;
         }
         return a.id < b.id;
     });
```

`[]` 表示这个 lambda 当前不从外层捕获变量，后面的参数与返回语句仍然组成一次
普通比较。lambda 把规则留在使用位置附近，却也会让复杂调用变长；教学代码和会
复用的规则优先使用具名函数，短小且只使用一次的规则再考虑 lambda。

若比较规则需要读取外层配置，可以显式捕获。例如 `ascending` 决定升降序：

```cpp
bool ascending = true;
sort(values.begin(), values.end(), [ascending](int a, int b) {
    if (ascending) {
        return a < b;
    }
    return a > b;
});
```

捕获的配置在一次排序过程中不应变化，否则同一对元素可能得到前后矛盾的答案。

## 函数对象

类或结构体只要实现函数调用运算符 `operator()`，它的对象就能像函数一样作为
比较器：

```cpp
struct compare_contestant {
    bool operator()(const contestant& a, const contestant& b) const {
        if (a.score != b.score) {
            return a.score > b.score;
        }
        return a.id < b.id;
    }
};

sort(contestants.begin(), contestants.end(), compare_contestant());
```

前面使用的 `greater<int>()` 本身就是标准库提供的函数对象。函数对象适合保存配置
或复用一套比较逻辑；普通竞赛题没有这种需要时，具名函数或短 lambda 更直接。

## 类型自己的自然顺序

若一种类型在整个程序中只有一套真正自然、而且会被排序和二分反复使用的顺序，
可以为类型定义小于运算符：

```cpp
bool operator<(const contestant& a, const contestant& b) {
    if (a.score != b.score) {
        return a.score > b.score;
    }
    return a.id < b.id;
}

sort(contestants.begin(), contestants.end());
```

默认 `sort` 会使用这个 `<`。若同一种记录在不同题意位置需要不同顺序，就不应把
其中一套临时规则伪装成类型的自然顺序，而应向各次调用显式传入对应比较器。

运算符重载的语言机制见扩展阅读 [运算符重载](operator-overloading.md)；当前只需
知道：类型已经提供自洽的 `<` 时，标准库排序和二分可以复用它。

## 标准复合类型的字典序

已经学习的 `pair`、`tuple`，以及线性表单元中的 `array`，都定义了默认字典序：

- `pair` 先比较 `first`，相等时比较 `second`；
- `tuple` 按元素位置从前到后比较；
- `array`、`vector` 和 `string` 按元素从前到后比较。

若一个短小记录的所有字段都按同一方向组成完整字典序，直接使用这些预设类型可以
让排序、相等判断和后续二分共享一致规则。例如 `(value, id)` 按值升序、再按编号
升序时，`pair<int, int>` 的默认顺序已经符合要求。

这不是要求把所有记录都压成匿名组合。字段含义需要名称、类型各异且数量较多、
方向混合，或同一记录需要多套顺序时，`struct` 与显式比较器通常更清楚。

## 比较器必须表示严格顺序

比较器返回 `true` 的含义是“`a` 应当严格排在 `b` 前”，不是“`a` 不排在 `b` 后”。因此不能把升序比较写成：

```cpp
bool compare(int a, int b) {
    return a <= b; // 错误
}
```

当 `a == b` 时，`a <= b` 和 `b <= a` 都为真，相同的两个值互相声称应当排在对方前面，`sort` 无法得到自洽顺序。正确写法是：

```cpp
bool compare(int a, int b) {
    return a < b;
}
```

一个可靠的比较器应满足这些直觉：

- 任意元素都不能严格排在自己前面，因此 `compare(a, a)` 必须为 `false`；
- 如果 `a` 在 `b` 前，`b` 就不能同时在 `a` 前；
- 如果 `a` 在 `b` 前且 `b` 在 `c` 前，顺序不能又要求 `c` 在 `a` 前；
- 所有用于决定顺序的字段相同时，返回 `false`。

这些要求统称为严格弱序。竞赛中不需要背诵形式化定义，但必须使用 `<` 或 `>` 表示严格先后，并按照主关键字、次关键字逐层处理相等情况。使用 `<=`、随机数或会在调用之间变化的全局状态都会破坏顺序，程序行为没有可靠保证。

对于严格比较器 `compare`，排序意义下的两个元素等价，表示两个方向都不严格在前：

```text
!compare(a, b) && !compare(b, a)
```

后续对这个序列进行二分时，必须继续使用兼容的比较规则。否则序列在查询规则下
未必有序，二分结论没有保证。

[unique](unique.md) 默认使用 `==` 判断相邻元素是否相等，不会自动从
`compare` 推导上面的等价关系。若排序只观察部分字段，而 `==` 比较全部字段，
需要为去重显式提供与题意一致的等价判断。

## 相等元素与稳定性

如果比较器认为两个元素谁都不应排在对方前面，它们在当前排序规则下等价。例如只按分数比较时，同分选手就是等价元素：

```cpp
bool compare_score(const contestant& a, const contestant& b) {
    return a.score > b.score;
}
```

`sort` 不保证等价元素保持输入时的相对顺序。如果题目还要求同分选手按编号排序，最直接的做法是在比较器中加入编号这个次关键字。

只有当“保持原输入顺序”本身就是题意，而且没有其他字段能够代替它时，才使用 `stable_sort`：

```cpp
stable_sort(contestants.begin(), contestants.end(), compare_score);
```

`stable_sort` 会保持等价元素原来的相对顺序，通常也需要更多额外存储。不要仅仅因为名字看起来更安全就默认使用它；先确定稳定性是否属于问题要求。

## 完整代码

下面的程序读入若干名选手的编号和分数，按照“分数降序、编号升序”输出排名。变量 `contestants` 保存所有记录，比较函数把题目的两级规则逐层翻译成代码。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct contestant {
    int id;
    int score;
};

bool compare_contestant(const contestant& a, const contestant& b) {
    if (a.score != b.score) {
        return a.score > b.score;
    }
    return a.id < b.id;
}

void solve() {
    int n;
    scanf("%d", &n);

    vector<contestant> contestants(n);
    for (int i = 0; i < n; i++) {
        scanf("%d%d", &contestants[i].id, &contestants[i].score);
    }

    sort(contestants.begin(), contestants.end(), compare_contestant);

    for (const contestant& current : contestants) {
        printf("%d %d\n", current.id, current.score);
    }
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
5
3 90
1 100
5 90
2 100
4 75
```

输出：

```text
1 100
2 100
3 90
5 90
4 75
```

对 $n$ 个元素，`sort` 进行 $O(n\log n)$ 次比较。这里每次比较只检查两个整数，因此排序时间是 $O(n\log n)$；保存全部记录需要 $O(n)$ 空间。

## 常见错误

### 忘记右端不包含

排序闭区间 `[l,r]` 时，传入的终点必须是 `r + 1`。完整 1-based 数组 `a[1..n]` 对应 `sort(a + 1, a + n + 1)`。

### 以为 sort 返回新容器

`sort` 的返回类型是 `void`。它直接重新排列原范围，不能写 `vector<int> result = sort(...)`。

### 比较器使用小于等于

比较器描述严格先后，升序用 `<`，降序用 `>`。相等时不能让两个方向都返回 `true`。

### 漏掉次关键字

如果题目要求同分时按编号排序，比较器必须在分数相等时继续比较编号。只写主关键字会让等价元素的相对顺序不确定。

### 依赖 sort 保持原顺序

`sort` 不稳定。需要原顺序时使用 `stable_sort`，需要另一个字段决定顺序时则把该字段写进比较器。

### 用 reverse 处理混合方向

整体翻转会把全部关键字方向一起翻转。“分数降序、编号升序”必须用比较器逐层
表达，不能把默认升序结果直接 `reverse`。

### 排序与查询使用不同规则

排序、二分和按顺序定义等价关系时必须使用兼容的比较器。按一种规则排序后，再用
另一种规则二分，相当于在未排序的范围中查询。

## 基础练习

1. 将一个 `vector<int>` 分别按升序和降序排列。
2. 排列 1-based 内置数组 `a[1..n]`，写出正确的起点和终点。
3. 只排序 0-based `vector` 的下标闭区间 `[l,r]`，把它翻译成 STL 范围。
4. 使用默认顺序排列 `pair<int, int>`，手动预测若干组结果。
5. 为“价格升序，价格相同则编号降序”的 `struct` 编写比较器。
6. 把同一个比较器分别写成具名函数和 lambda，比较两种写法的作用域。
7. 构造三个值，检查一个自定义比较器是否可能形成互相矛盾的先后关系。
8. 比较 `sort`、带完整次关键字的 `sort` 和 `stable_sort` 对同分记录的处理方式。

## 需要记住什么

1. `sort(first, last)` 是否包含 `last`？整个 `vector` 应传入什么范围？
2. 0-based 内置数组和 1-based 内置数组的完整排序分别怎样写？
3. 默认排序怎样处理整数、`string` 和已有自然顺序的复合类型？
4. 整数降序可以怎样调用 `sort`？
5. 自定义比较器返回 `true` 表示什么？为什么参数通常使用 `const` 引用？
6. 为什么比较器必须使用 `<` 或 `>`，不能使用 `<=` 或 `>=`？
7. 多个排序关键字应当怎样逐层处理？
8. 具名函数、lambda、函数对象和类型自己的 `<` 分别适合什么场景？
9. 为什么排序、二分和去重需要共享兼容的顺序与等价语义？
10. `sort` 是否保持等价元素原来的相对顺序？什么时候才需要 `stable_sort`？
11. `sort` 排列 $n$ 个元素需要多少次比较？

`sort` 的具体内部算法、内省排序、排序网络、执行策略和投影不属于本篇的标准库基础用法，不要求理解或记忆。快速排序与归并排序将在基础算法模块中分别推导，而不是通过猜测 `sort` 的实现来学习。
