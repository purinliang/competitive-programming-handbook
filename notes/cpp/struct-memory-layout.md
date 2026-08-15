# struct 的内存布局

> 最近修订：2026-08-16 15:14 +10:00（未审阅）

[struct](struct.md) 把多个成员组合成一个对象。成员按声明顺序排列，但它们在
内存中不一定首尾紧贴；编译器还要满足每种类型的对齐要求。

本篇解释成员间填充与尾部填充。竞赛中只有在估算大型结构体数组内存、观察底层布局或处理外部二进制格式时经常需要这些细节。

## 对齐要求

`alignof(T)` 查询类型 `T` 的对齐要求。若一个类型的对齐是 $4$，这种类型的对象通常需要从 $4$ 的倍数地址开始。

```cpp
cout << sizeof(int) << ' ' << alignof(int) << '\n';
cout << sizeof(char) << ' ' << alignof(char) << '\n';
```

在常见的 x86-64 竞赛环境中，`int` 的大小和对齐通常都是 $4$，`char` 的大小和对齐都是 $1$。C++ 标准没有要求所有平台都采用这组具体数值，实际代码可以查询，不能把环境习惯当成跨平台定理。

## 成员间填充

考虑结构体：

```cpp
struct Sample {
    char tag;
    int value;
    char state;
};
```

`tag` 只占一个字节。如果 `int` 要从 $4$ 的倍数地址开始，编译器通常会在 `tag` 与 `value` 之间加入三个**填充字节**：

```text
偏移     0    1 2 3    4 5 6 7    8
内容    tag   填充      value     state
```

可以用 `offsetof` 查询成员相对于结构体起始地址的字节偏移：

```cpp
cout << offsetof(Sample, tag) << '\n';
cout << offsetof(Sample, value) << '\n';
cout << offsetof(Sample, state) << '\n';
```

对这个简单的标准布局结构体，常见结果是 `0`、`4`、`8`。标准保证同一访问控制下后声明的普通成员地址更高，但允许为了对齐在成员之间留下空隙。

`offsetof` 只应当用于标准布局类型。继承、虚函数和复杂访问控制会引入更多对象模型规则，不属于竞赛结构体保存普通数据的基础用法。

## 尾部填充

上面的三个成员到偏移 $8$ 为止共使用了 $9$ 个字节，但 `sizeof(Sample)` 在常见环境中通常是 $12$，末尾还有三个填充字节：

```text
偏移     0    1 2 3    4 5 6 7    8    9 10 11
内容    tag   填充      value     state   尾部填充
```

尾部填充保证结构体数组中的每个元素都能满足相同对齐：

```cpp
Sample a[2];
```

`a[1]` 必须紧跟 `a[0]`，两者起始地址相差 `sizeof(Sample)`。若第一个对象只占 $9$ 字节，第二个对象就可能从不合适的地址开始；补到 $12$ 字节后，每个 `value` 都能继续位于合适的地址。

因此结构体数组的总大小是：

$$
n\times \mathrm{sizeof}(Sample),
$$

而不是“所有成员大小之和再乘 $n$”。

## 第一个成员

这个 `Sample` 是标准布局类型。标准布局对象的起始地址与第一个非静态成员的地址相同，所以开头不会在 `tag` 之前插入填充：

```cpp
Sample sample;

cout << &sample << '\n';
cout << (void*)&sample.tag << '\n';
```

两行会表示同一个起始地址，但类型不同。这个保证不能随意推广到所有带继承、虚函数或复杂访问控制的类。

## 调整成员顺序

把对齐要求较大的成员放在前面，经常能够减少空隙：

```cpp
struct Compact {
    int value;
    char tag;
    char state;
};
```

常见布局是：

```text
偏移     0 1 2 3    4    5    6 7
内容      value    tag  state  尾部填充
```

`sizeof(Compact)` 通常是 $8$，小于 `Sample` 的 $12$。如果建立数百万个对象的数组，这个差异可能明显影响内存限制。

但不要为了理论上少几个字节就破坏成员的自然语义，也不能擅自改变必须与外部协议、文件格式或评测接口一致的布局。普通竞赛结构体先追求清楚；只有内存估算表明填充确实重要时，再根据实际 `sizeof` 调整顺序。

## 数组成员

数组作为一个完整成员嵌在结构体中。数组内部的元素保持连续，二维数组仍然按行
优先排列；编译器不会在数组的相邻元素或相邻行之间加入结构体填充：

```cpp
struct Grid {
    char tag;
    int value[2][3];
    char state;
};
```

`value` 自身需要满足 `int` 的对齐，所以 `tag` 与 `value` 之间可能出现成员间
填充。进入 `value` 以后，六个整数严格按照下面的顺序连续存放：

```text
value[0][0], value[0][1], value[0][2],
value[1][0], value[1][1], value[1][2]
```

数组结束后接着安排 `state`，结构体末尾仍可能为整个 `Grid` 的对齐加入尾部
填充。可以查询实际偏移：

```cpp
cout << offsetof(Grid, value) << '\n';
cout << offsetof(Grid, state) << '\n';
cout << sizeof(Grid) << '\n';
```

因此要分两层理解：数组类型保证自己的元素连续；结构体布局负责把整个数组成员
放到合适的起始偏移，并在其他成员之间或对象末尾按需要填充。

## 填充字节不是成员

填充字节没有成员名称，也不能通过普通成员访问。它们的内容不应被程序当成有效数据。

因此不要把整个结构体的原始字节直接当作稳定文件格式，也不要用 `memcmp` 代替逐成员比较。两个成员值完全相同的对象，填充字节仍可能不同；不同编译器和平台的布局也可能不同。

网络协议或二进制文件若规定了精确字节格式，应当逐个字段编码，并明确字节序和宽度，而不是直接写出某个 C++ 结构体的全部内存。

## 完整代码

下面的程序查询当前编译环境中的真实布局。输出不要求在所有平台完全相同；重点是观察成员偏移、总大小与成员顺序之间的关系。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Sample {
    char tag;
    int value;
    char state;
};

struct Compact {
    int value;
    char tag;
    char state;
};

void solve() {
    cout << "char: " << sizeof(char) << ' ' << alignof(char) << '\n';
    cout << "int: " << sizeof(int) << ' ' << alignof(int) << '\n';

    cout << "Sample: " << sizeof(Sample) << ' ' << alignof(Sample) << '\n';
    cout << "Sample offsets: " << offsetof(Sample, tag) << ' '
         << offsetof(Sample, value) << ' ' << offsetof(Sample, state) << '\n';

    cout << "Compact: " << sizeof(Compact) << ' ' << alignof(Compact) << '\n';
    cout << "Compact offsets: " << offsetof(Compact, value) << ' '
         << offsetof(Compact, tag) << ' ' << offsetof(Compact, state) << '\n';
}

int main() {
    solve();
    return 0;
}
```

在常见 x86-64 竞赛环境中，通常可以观察到：

```text
char: 1 1
int: 4 4
Sample: 12 4
Sample offsets: 0 4 8
Compact: 8 4
Compact offsets: 0 4 5
```

这组数字只是常见输出；本文真正依赖的是标准允许对齐产生空隙，并可以通过语言提供的运算符查询当前环境。

## 需要记住什么

1. `sizeof(struct)` 为什么可能大于所有成员 `sizeof` 之和？
2. 成员间填充与尾部填充分别位于哪里？
3. 结构体数组为什么需要考虑尾部填充？
4. `alignof(T)` 与 `offsetof(T, member)` 分别查询什么？
5. 调整成员顺序为什么可能改变结构体大小？
6. 为什么不能用 `memcmp` 普遍代替结构体的逐成员比较？

具体平台上每一种类型的对齐数值不要求背诵。需要估算内存时，写一个短程序查询 `sizeof`、`alignof` 和 `offsetof` 比凭印象猜测更可靠。

## 返回基础篇

返回 [struct](struct.md) 继续主学习路线。
