# Manacher

> 最近修订：2026-08-17 09:05 +10:00（未审阅）

给定一个字符串，希望找出其中最长的回文子串。回文串从左向右和从右向左读取完全
相同，例如 `racecar` 和 `abba`。

枚举每个中心并向两侧扩展，单次扩展可能扫描 $O(n)$ 个字符，总时间最坏为
$O(n^2)$。Manacher 算法保存当前已知最靠右的回文区间，利用回文的对称性复用
已经计算过的半径，把全部中心的处理时间降到 $O(n)$。

## 奇数回文与偶数回文

奇数长度回文有一个字符中心，例如：

```text
abacaba
   ^
```

偶数长度回文的中心在两个字符之间，例如：

```text
abba
  ^
```

二者的边界公式不同。本篇分别维护两个数组，避免向原串插入分隔符：

- `odd[i]`：以位置 `i` 为中心的奇数回文半径，包含中心字符；
- `even[i]`：以 `i-1` 与 `i` 之间为中心的偶数回文半径。

字符串位置使用 `1..n`。例如 `odd[i] = 3` 表示回文区间是 `[i-2,i+2]`，长度
为 5；`even[i] = 2` 表示区间是 `[i-2,i+1]`，长度为 4。

## 从中心扩展

若暂时不复用任何结果，奇数回文可以这样计算：

```cpp
int radius = 1;
while (i - radius >= 1 && i + radius <= n && s[i - radius] == s[i + radius]) {
    radius++;
}
odd[i] = radius;
```

每个中心的写法都正确，但像 `aaaaaaaa` 这样的字符串会在许多中心反复比较相同
字符。Manacher 的关键不是改变扩展方式，而是让扩展从一个已经确定安全的位置开始。

## 最靠右的回文区间

处理中心 `i` 以前，维护当前已知右端点最大的回文区间 `[l,r]`。

若 `i > r`，当前中心不在已知区间内，只能从最小半径开始扩展。

若 `i <= r`，它关于 `[l,r]` 中心的对称位置是：

$$
mirror=l+r-i.
$$

由于 `[l,r]` 本身是回文，`mirror` 周围已经匹配的字符会镜像到 `i` 周围。因此
奇数回文的初始半径至少是：

$$
\min(odd[mirror],r-i+1).
$$

取最小值有两个原因：

- `odd[mirror]` 只保证镜像中心已有的回文范围；
- `r-i+1` 只保证信息仍位于 `[l,r]` 内，越过 `r` 后没有已知结论。

从这个初始半径继续向外比较即可。若新回文越过 `r`，再用它更新 `[l,r]`。

## 奇数回文

奇数长度的计算过程是：

```cpp
int l = 1;
int r = 0;

for (int i = 1; i <= n; i++) {
    int radius = 1;

    if (i <= r) {
        int mirror = l + r - i;
        radius = min(odd[mirror], r - i + 1);
    }

    while (i - radius >= 1 && i + radius <= n &&
           s[i - radius] == s[i + radius]) {
        radius++;
    }
    odd[i] = radius;

    if (i + radius - 1 > r) {
        l = i - radius + 1;
        r = i + radius - 1;
    }
}
```

`radius` 包含中心，所以最小值是 1，回文长度是 `2 * radius - 1`。

## 偶数回文

`even[i]` 的中心位于 `i-1` 和 `i` 之间。半径为 `radius` 时，区间为：

$$
[i-radius,i+radius-1].
$$

它的镜像位置要相应移动一格：

$$
mirror=l+r-i+1.
$$

```cpp
l = 1;
r = 0;

for (int i = 1; i <= n; i++) {
    int radius = 0;

    if (i <= r) {
        int mirror = l + r - i + 1;
        radius = min(even[mirror], r - i + 1);
    }

    while (i - radius - 1 >= 1 && i + radius <= n &&
           s[i - radius - 1] == s[i + radius]) {
        radius++;
    }
    even[i] = radius;

    if (i + radius - 1 > r) {
        l = i - radius;
        r = i + radius - 1;
    }
}
```

偶数回文可以为空，所以初始半径为 0，回文长度是 `2 * radius`。

## 完整代码

下面输出最长回文子串的长度和内容。若有多个最长答案，输出左端点最小的一个。

```cpp
#include <bits/stdc++.h>
using namespace std;

pair<int, int> longest_palindrome(const string& input) {
    int n = input.size();
    string s = " " + input;

    vector<int> odd(n + 5, 0);
    vector<int> even(n + 5, 0);
    int best_left = 1;
    int best_length = 0;

    int l = 1;
    int r = 0;

    for (int i = 1; i <= n; i++) {
        int radius = 1;

        if (i <= r) {
            int mirror = l + r - i;
            radius = min(odd[mirror], r - i + 1);
        }

        while (i - radius >= 1 && i + radius <= n &&
               s[i - radius] == s[i + radius]) {
            radius++;
        }
        odd[i] = radius;

        if (i + radius - 1 > r) {
            l = i - radius + 1;
            r = i + radius - 1;
        }

        int length = 2 * radius - 1;
        int left = i - radius + 1;
        if (length > best_length) {
            best_left = left;
            best_length = length;
        }
    }

    l = 1;
    r = 0;

    for (int i = 1; i <= n; i++) {
        int radius = 0;

        if (i <= r) {
            int mirror = l + r - i + 1;
            radius = min(even[mirror], r - i + 1);
        }

        while (i - radius - 1 >= 1 && i + radius <= n &&
               s[i - radius - 1] == s[i + radius]) {
            radius++;
        }
        even[i] = radius;

        if (i + radius - 1 > r) {
            l = i - radius;
            r = i + radius - 1;
        }

        int length = 2 * radius;
        int left = i - radius;
        if (length > best_length ||
            (length == best_length && left < best_left)) {
            best_left = left;
            best_length = length;
        }
    }

    return {best_left, best_length};
}

void solve() {
    string s;
    cin >> s;

    auto [left, length] = longest_palindrome(s);
    cout << length << '\n';
    cout << s.substr(left - 1, length) << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

内部算法使用本书的 1-based 字符位置；调用 `string::substr` 时，在接口边界把
左端点转换成标准库的 0-based 下标。

## 为什么总复杂度是线性的

从镜像得到的初始半径只复用已经验证过的字符，不进行新的比较。`while` 循环真正
成功扩展时，当前最右端点 `r` 会随之右移。

`r` 从 0 开始，最多移动到 `n`。虽然每个中心都有一个扩展循环，但全部成功扩展
次数之和是 $O(n)$；每个中心至多再发生一次失败比较。因此奇数和偶数两轮总时间
都是 $O(n)$，空间复杂度为 $O(n)$。

## 分隔符写法

另一种常见实现会在相邻字符之间插入统一分隔符，把奇数和偶数回文合并成一种情况，
例如把 `abba` 变成类似 `#a#b#b#a#` 的序列。

这种写法可以只维护一个半径数组，但需要保证分隔符和两端哨兵不会与原字符冲突，
还要把答案位置转换回原串。本篇分别计算 `odd` 与 `even`，多一段结构相同的代码，
却保留了原字符串位置的直接含义。两种写法的算法本质与复杂度相同。

## 常见错误

- 只计算奇数中心，漏掉 `abba` 这类偶数回文；
- 混淆“半径”和“回文长度”，在奇数情形漏掉中心字符；
- 镜像半径没有与 `r-i+1` 取最小值，错误复用已知区间之外的信息；
- 奇数和偶数情形使用相同镜像公式，造成一格偏移；
- 扩展成功后没有更新最靠右区间 `[l,r]`；
- 内部使用 1-based 位置，却直接传给 0-based 的 `string::substr`；
- 认为每个中心都有 `while` 就是 $O(n^2)$，忽略右端点只能单调前进。

## 需要记住什么

- 奇数回文和偶数回文的中心分别在哪里？
- `odd[i]` 与 `even[i]` 的半径怎样换算成区间和长度？
- `[l,r]` 保存的是哪个回文区间？
- 中心位于 `[l,r]` 内时，镜像为什么能提供安全的初始半径？
- 为什么初始半径还要受 `r-i+1` 限制？
- 为什么全部向外扩展的总次数只有 $O(n)$？

需要理解镜像复用和最右端点单调推进；奇偶两套边界公式不必死记，应当能够从各自的
中心位置重新画出。
