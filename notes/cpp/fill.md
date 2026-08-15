# fill

> 最近修订：2026-08-16 09:42 +10:00（未审阅）

算法经常需要把一段已有存储统一设成某个值，例如每组测试开始前清空计数数组、
把全部距离初始化为 `-1`，或只重置一个闭区间。逐项赋值当然能完成任务，但每次
都重新写循环容易产生边界错误。

标准库算法 `fill` 接收一个左闭右开范围和一个值，把范围中的每个元素依次赋成
这个值。

## 基本用法

把整个 `vector` 设成 `-1`：

```cpp
fill(values.begin(), values.end(), -1);
```

它等价于依次执行：

```cpp
for (int& value : values) {
    value = -1;
}
```

`fill(first, last, value)` 包含 `first` 指向的元素，不包含 `last` 指向的位置。
因此 `[values.begin(), values.end())` 恰好覆盖全部元素。

这项操作必须访问范围中的每个元素。范围长度为 $n$ 时，时间复杂度是 $O(n)$；
它只使用固定数量的额外状态，额外空间复杂度是 $O(1)$。

## 内置数组

内置数组的名字可以表示首元素地址。长度为 `n` 时，把原生 0-based 范围全部设为
`0` 可以写：

```cpp
fill(a, a + n, 0);
```

范围是 `[a, a + n)`，对应下标 `0..n-1`。`a + n` 是末元素之后的位置，不能
读取，但可以作为右边界。

若编译器能在当前位置看见完整数组，还可以使用：

```cpp
fill(begin(a), end(a), 0);
```

当数组作为参数退化成指针以后，函数无法再从指针本身推断原数组长度，此时必须
另行传入长度或右边界。

## 1-based 逻辑区间

本书自定义的数组通常使用 1-based 下标。若只想填写逻辑元素 `a[1]..a[n]`，
对应的左闭右开位置范围是：

```cpp
fill(a + 1, a + n + 1, 0);
```

使用预留 `+5` 空间的 `vector` 时同理：

```cpp
vector<int> a(n + 5);
fill(a.begin() + 1, a.begin() + n + 1, 0);
```

这里最后一个被赋值的是 `a[n]`。`a.begin() + n + 1` 只是右边界，不包含在
范围中。自定义算法仍按闭区间 `[1,n]` 思考，只在调用 STL 的边界处把它转换成
左闭右开迭代器范围。

如果确实希望连第 `0` 格和尾部余量一起重置，直接使用
`fill(a.begin(), a.end(), value)` 更清楚。

## 填写部分范围

`fill` 不要求处理整个容器。原生 0-based `vector` 中，把下标 `[l,r)` 设成
`value`：

```cpp
fill(a.begin() + l, a.begin() + r, value);
```

若题目逻辑使用 1-based 闭区间 `[l,r]`，转换后写成：

```cpp
fill(a.begin() + l, a.begin() + r + 1, value);
```

调用前必须保证两个边界都来自同一个有效存储范围，并且左边界不在右边界之后。
`fill` 不会替你检查越界。

## 填充对象

`fill` 执行的是普通赋值，所以不只适用于整数：

```cpp
fill(names.begin(), names.end(), string("unknown"));
```

对于结构体，只要右侧值能够赋给每个元素，也可以直接填写：

```cpp
struct Point {
    int x;
    int y;
};

Point origin = {0, 0};
fill(points.begin(), points.end(), origin);
```

每次赋值本身若不是 $O(1)$，总复杂度还要乘上单次赋值成本。例如把一个很长的
`string` 复制到 $n$ 个位置，不能只忽略字符串复制的代价。

## memset 按字节写入

`memset` 不是 STL 算法。它来自 C 标准库，接口按**字节**解释：

```cpp
memset(a, byte_value, byte_count);
```

它把指定内存区域的每一个字节都写成 `byte_value` 的低八位。下面的代码不会把
每个 `int` 赋成数值 `1`：

```cpp
int a[3];
memset(a, 1, sizeof a);
```

假设当前竞赛环境使用 4 字节 `int`，每个整数的四个字节都会变成十六进制
`01 01 01 01`。在常见的小端或大端二进制整数表示中，这个比特模式对应
`0x01010101`，十进制是 `16843009`，而不是 `1`。

因此普通数值赋值优先使用：

```cpp
fill(begin(a), end(a), 1);
```

对整数数组使用 `memset(a, 0, sizeof a)` 是常见且清楚的全零写法。把每个字节
设为 `0xff` 后在主流竞赛环境中通常得到 `-1`，但这依赖整数对象表示；本书不把
它当作任意类型和平台的通用赋值规则。对于 `string`、`vector` 等管理自身状态的
对象，更不能用 `memset` 伪造普通赋值。

`memset` 真正适合的是明确需要控制原始字节模式的任务。只想让一组 C++ 对象都
等于某个值时，`fill` 的语义更准确。

## 完整代码

下面的程序处理多组测试。每组给出若干个 `1..100000` 的整数，输出其中不同整数
的数量。上一组留下的频次数组必须先清零：

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAX_VALUE = 100000;

void solve() {
    int test_count;
    cin >> test_count;

    vector<int> frequency(MAX_VALUE + 5);

    while (test_count--) {
        fill(frequency.begin(), frequency.end(), 0);

        int n;
        cin >> n;

        int distinct_count = 0;
        for (int i = 1; i <= n; i++) {
            int value;
            cin >> value;

            if (frequency[value] == 0) {
                distinct_count++;
            }
            frequency[value]++;
        }

        cout << distinct_count << '\n';
    }
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
2
5
1 2 1 3 2
4
7 7 7 7
```

输出：

```text
3
1
```

每组清空整个值域需要 $O(V)$ 时间，其中 $V=100001$；处理输入需要 $O(n)$
时间，因此一组总时间是 $O(V+n)$，频次数组使用 $O(V)$ 空间。

## 常见错误

### 忘记右边界不包含

填写 1-based 闭区间 `[l,r]` 时，右位置应当是 `begin() + r + 1`。只写到
`begin() + r` 会漏掉 `a[r]`。

### 把 reserve 后的容量当作元素

`fill` 只能处理已经存在的元素。`reserve` 只预留容量，不能把
`[begin(), begin() + capacity())` 当作有效范围。

### 用 memset 填普通整数值

`memset(a, 1, sizeof a)` 写入的是重复字节模式，不是逐个执行 `a[i] = 1`。
普通赋值使用 `fill`。

### 忽略重复清空的成本

一组清空 $V$ 个元素是 $O(V)$。测试组很多而每组只访问很少位置时，反复清空
整个巨大数组可能成为瓶颈；此时可以记录本组改过的位置，只重置这些位置。

## 需要记住什么

1. `fill(first, last, value)` 的范围包含和排除哪一端？
2. 怎样填写整个内置数组或整个 `vector`？
3. 1-based 闭区间 `[l,r]` 怎样转换成 STL 位置范围？
4. `fill` 的时间复杂度由什么决定？
5. 为什么 `memset(a, 1, sizeof a)` 不会把每个 `int` 赋成 `1`？
6. 哪些场景优先使用 `fill`，哪些场景才真正需要 `memset`？
7. 为什么频繁清空一个远大于实际访问范围的数组可能太慢？
