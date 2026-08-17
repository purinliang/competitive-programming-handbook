# 字符串哈希

> 最近修订：2026-08-17 03:57 +10:00（未审阅）

[朴素字符串匹配](naive-pattern-matching.md) 逐字符比较两个子串。一次比较最坏
需要扫描整个模式串；如果题目反复询问两个子串是否相同，总时间可能达到
$O(qn)$。

字符串哈希把一段字符串映射成一个整数。预处理前缀哈希后，每个子串都能在
$O(1)$ 时间得到哈希值，于是可以快速排除不同的子串。

哈希值相同不等于字符串一定相同：不同字符串可能发生**哈希碰撞**。因此字符串
哈希是一种概率算法；需要绝对正确时，仍应使用能够严格比较字符串的算法。

## 把字符串看成多项式

先把每个字符转换成正整数。若只含小写英文字母，可以使用：

```cpp
int code = s[i] - 'a' + 1;
```

不能让 `a` 映射成 `0`，否则开头增加若干个 `a` 可能不改变哈希值。

选择一个底数 $B$ 和模数 $M$，字符串

```text
c[1] c[2] ... c[n]
```

可以看成 $B$ 进制形式：

$$
H=c[1]B^{n-1}+c[2]B^{n-2}+\cdots+c[n].
$$

数值增长得很快，因此每一步都对 $M$ 取余。本篇使用：

```cpp
const ll BASE = 131;
const ll MOD = 1000000007;
```

这组常量便于理解和使用，但不能消除碰撞。

## 前缀哈希

直接计算每个子串仍然很慢。与前缀和相同，我们先维护前缀 `s[1..i]` 的哈希：

$$
prefix[i]=(prefix[i-1]B+code(s[i]))\bmod M.
$$

其中 `prefix[0] = 0`。每加入一个字符，就把原来的多项式整体乘以 $B$，再把
新字符放到最低位：

```cpp
power[0] = 1;

for (int i = 1; i <= n; i++) {
    power[i] = power[i - 1] * BASE % MOD;
    int code = s[i] - 'a' + 1;
    prefix[i] = (prefix[i - 1] * BASE + code) % MOD;
}
```

`power[i]` 保存 $B^i\bmod M$，用于把两个前缀对齐到相同位数。

## 截取子串哈希

`prefix[r]` 包含 `s[1..r]`。其中 `s[1..l-1]` 比子串 `s[l..r]` 多占
$r-l+1$ 位，所以先把 `prefix[l-1]` 乘以 $B^{r-l+1}$：

$$
hash(l,r)=prefix[r]-prefix[l-1]B^{r-l+1}.
$$

取模后的减法可能为负数，再加一次 `MOD`：

```cpp
ll get_hash(int l, int r) {
    int length = r - l + 1;
    ll removed = prefix[l - 1] * power[length] % MOD;
    return (prefix[r] - removed + MOD) % MOD;
}
```

这与前缀和公式

$$
sum(l,r)=prefix[r]-prefix[l-1]
$$

非常相似。区别只是字符串每向右移动一位，旧内容都会多乘一次底数，因此减去
左侧前缀前必须先做位数对齐。

## 比较两个子串

两个长度不同的字符串一定不同。长度相同时，比较哈希值：

```cpp
bool equal_substrings(int l1, int r1, int l2, int r2) {
    if (r1 - l1 != r2 - l2) {
        return false;
    }
    return get_hash(l1, r1) == get_hash(l2, r2);
}
```

预处理需要 $O(n)$ 时间和 $O(n)$ 空间；每次比较只进行常数次整数运算，时间是
$O(1)$。

## 碰撞

取模把数量极多的字符串压进有限的 $M$ 个结果中，碰撞必然存在。因此：

- 哈希值不同，可以确定两个字符串不同；
- 哈希值相同，只能认为它们极大概率相同；
- 对抗性输入可能故意构造碰撞。

更稳妥的常见做法是使用两个不同模数，只有两组哈希都相同时才认为字符串相同。
这会降低碰撞概率，但仍不是数学意义上的零。本文先保留单模版本，让前缀哈希和
子串公式保持清楚；题目明确卡哈希时再改用双哈希或严格字符串算法。

## 完整代码

下面读入一个只含小写英文字母的字符串，再回答两个闭区间子串是否相同。字符串
算法使用 1-based 下标，查询区间均为闭区间。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll BASE = 131;
const ll MOD = 1000000007;

int n;
string s;
vector<ll> power;
vector<ll> prefix;

void build_hash() {
    power.assign(n + 5, 0);
    prefix.assign(n + 5, 0);
    power[0] = 1;

    for (int i = 1; i <= n; i++) {
        power[i] = power[i - 1] * BASE % MOD;
        int code = s[i] - 'a' + 1;
        prefix[i] = (prefix[i - 1] * BASE + code) % MOD;
    }
}

ll get_hash(int l, int r) {
    int length = r - l + 1;
    ll removed = prefix[l - 1] * power[length] % MOD;
    return (prefix[r] - removed + MOD) % MOD;
}

bool equal_substrings(int l1, int r1, int l2, int r2) {
    if (r1 - l1 != r2 - l2) {
        return false;
    }
    return get_hash(l1, r1) == get_hash(l2, r2);
}

void solve() {
    cin >> s;

    n = s.size();
    s = " " + s;
    build_hash();

    int q;
    cin >> q;

    while (q--) {
        int l1, r1, l2, r2;
        cin >> l1 >> r1 >> l2 >> r2;

        if (equal_substrings(l1, r1, l2, r2)) {
            cout << "Yes\n";
        } else {
            cout << "No\n";
        }
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 复杂度

设字符串长度为 $n$，查询次数为 $q$：

- 预处理时间复杂度：$O(n)$；
- 每次查询时间复杂度：$O(1)$；
- 总时间复杂度：$O(n+q)$；
- 空间复杂度：$O(n)$。

## 常见错误

- 把字符 `a` 编码成 `0`，使前导字符不能被正确区分；
- 忘记给模减法加 `MOD`，得到负哈希值；
- 截取子串时忘记乘 $B^{r-l+1}$ 对齐位数；
- 只比较哈希而不先比较长度；
- 把哈希相同写成“必然相同”，忽略碰撞；
- 给 `string` 补占位字符以后重新用 `size()` 当作真实长度。

## 需要记住什么

- 为什么字符串可以看成以 $B$ 为底的多项式？
- 前缀哈希为什么要写成“旧值乘底数，再加入新字符”？
- 为什么截去左前缀前要乘 $B^{r-l+1}$？
- 哈希相同与字符串相同之间有什么区别？

