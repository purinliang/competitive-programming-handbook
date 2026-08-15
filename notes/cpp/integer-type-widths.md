# 整数类型的位宽与平台差异

> 状态：定稿

[整数类型](integer-types.md) 已经介绍竞赛中最常用的 `int`、`long long` 和 `unsigned int`。本篇保存 `short`、`long` 的平台差异、完整范围、固定位数类型和 `__int128`；这些内容不属于主线要求，不要求任何读者理解或记忆。

## 类型位宽

C++ 还提供 `short` 和 `long`：

- `short` 是 `short int` 的简写。
- `long` 是 `long int` 的简写。
- `long long` 是 `long long int` 的简写。
- 在前面增加 `unsigned`，就得到对应的无符号类型。

它们的实际大小可以用 `sizeof` 检查：

```cpp
#include <bits/stdc++.h>
using namespace std;

void solve() {
    cout << "short: " << sizeof(short) << " bytes\n";
    cout << "int: " << sizeof(int) << " bytes\n";
    cout << "long: " << sizeof(long) << " bytes\n";
    cout << "long long: " << sizeof(long long) << " bytes\n";
}

int main() {
    solve();
    return 0;
}
```

常见的 Linux x86-64 + GCC 竞赛环境采用 LP64 数据模型，输出为：

```text
short: 2 bytes
int: 4 bytes
long: 8 bytes
long long: 8 bytes
```

常见的 Windows x64 + MSVC 或 MinGW-w64 环境采用 LLP64 数据模型，输出为：

```text
short: 2 bytes
int: 4 bytes
long: 4 bytes
long long: 8 bytes
```

两边的 `long long` 都是 8 字节，`long` 却分别是 8 字节和 4 字节。这不是某一方实现错误，而是 C++ 允许平台选择不同的具体大小。

> [C++17 基本类型规则](https://timsong-cpp.github.io/cppwp/n4659/basic.fundamental) 只规定这些类型的顺序和最低要求：`sizeof(short)`、`sizeof(int)`、`sizeof(long)`、`sizeof(long long)` 不能依次变小；它们的最小位宽分别是 16、16、32、64 位。`int` 在现代桌面、服务器和竞赛环境中通常为 32 位，但仍不是所有 C++17 实现的强制要求。

## 类型范围

下表采用常见 Linux x86-64 竞赛环境的位宽和补码表示。Windows x64 中的 `long` 通常改为与 32 位 `int` 相同的范围。

### 有符号整数

| 类型 | 占用 | 精确范围 | 大致范围 |
| --- | ---: | --- | --- |
| `short` | 2 字节 / 16 位 | $[-2^{15},\ 2^{15}-1]$ | -32768 到 32767 |
| `int` | 4 字节 / 32 位 | $[-2^{31},\ 2^{31}-1]$ | $-2.15 \times 10^9$ 到 $2.15 \times 10^9$ |
| `long` | 8 字节 / 64 位 | $[-2^{63},\ 2^{63}-1]$ | $-9.22 \times 10^{18}$ 到 $9.22 \times 10^{18}$ |
| `long long` | 8 字节 / 64 位 | $[-2^{63},\ 2^{63}-1]$ | $-9.22 \times 10^{18}$ 到 $9.22 \times 10^{18}$ |

### 无符号整数

| 类型 | 占用 | 精确范围 | 大致范围 |
| --- | ---: | --- | --- |
| `unsigned short` | 2 字节 / 16 位 | $[0,\ 2^{16}-1]$ | 0 到 65535 |
| `unsigned int` | 4 字节 / 32 位 | $[0,\ 2^{32}-1]$ | 0 到 $4.29 \times 10^9$ |
| `unsigned long` | 8 字节 / 64 位 | $[0,\ 2^{64}-1]$ | 0 到 $1.84 \times 10^{19}$ |
| `unsigned long long` | 8 字节 / 64 位 | $[0,\ 2^{64}-1]$ | 0 到 $1.84 \times 10^{19}$ |

## 固定位数整数

标准库提供名称直接写明位数的整数类型：

```cpp
int16_t a;
int32_t b;
int64_t c;
uint64_t d;
```

其中 `int16_t`、`int32_t`、`int64_t` 分别表示恰好 16、32、64 位的有符号整数，开头增加 `u` 就得到对应的无符号类型。它们在能够提供相应精确位宽的平台上定义；现代竞赛环境通常全部支持。这里的 `int64_t` 是标准 C++ 类型别名，不能省略末尾的 `_t` 写成 `int64`。

GCC 和 Clang 还提供非标准扩展 `__int128` 与 `unsigned __int128`。它们通常是 128 位整数，范围分别约为 $-1.70 \times 10^{38}$ 到 $1.70 \times 10^{38}$，以及 $0$ 到 $3.40 \times 10^{38}$。双下划线开头的名称保留给编译器实现，这正说明 `__int128` 不是 ISO C++17 的一部分；在 OJ 上选择 GNU++17 或 GNU++20 且编译器和目标平台支持它时才可以使用。 [GCC 的 `__int128` 文档](https://gcc.gnu.org/onlinedocs/gcc/_005f_005fint128.html) 也明确把它称为只在具备相应整数模式的目标上提供的扩展。

`cin`、`cout`、`scanf` 和 `printf` 都没有直接处理 `__int128` 的标准接口，需要自己逐位读写。它主要用于让中间乘法不溢出，而不是替代日常的 `long long`。

## 需要记住什么

本篇没有主线要求理解或记忆的内容。需要查阅平台位宽、完整范围或扩展类型时再回来即可，不影响继续学习。

## 返回整数篇

返回 [整数类型](integer-types.md) 继续主学习路线。
