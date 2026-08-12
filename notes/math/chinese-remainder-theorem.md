# 数论：中国剩余定理（CRT）

> 状态：定稿

一个整数可以同时受到多个余数条件的约束。例如，我们想找到 $x$，使它除以 $3$ 余 $2$，除以 $5$ 余 $3$，除以 $7$ 余 $2$：

$$
\begin{cases}
x\equiv2\pmod3,\\
x\equiv3\pmod5,\\
x\equiv2\pmod7.
\end{cases}
$$

从 $2,5,8,11,\ldots$ 中不断枚举当然能找到答案，但模数较大时不可行。中国剩余定理（Chinese remainder theorem，CRT）可以直接把这些条件组合成一个答案。

## 问题形式

给定 $k$ 个同余方程

$$
x\equiv a_i\pmod{m_i},\qquad 1\le i\le k,
$$

经典 CRT 要求每个模数 $m_i$ 为正整数，并且它们**两两互质**：

$$
\gcd(m_i,m_j)=1\qquad(i\ne j).
$$

定理保证，方程组模

$$
M=m_1m_2\cdots m_k
$$

有唯一解。“模 $M$ 唯一”表示所有整数解都可以写成

$$
x=x_0+tM,\qquad t\in\mathbb Z,
$$

通常输出其中唯一的最小非负代表元 $x_0\in[0,M)$。

余数 $a_i$ 不必事先落在 $[0,m_i)$ 中；把它对 $m_i$ 取模并归一化，不会改变同余条件。

## 一个条件的开关

要同时组合多个余数，先尝试为第 $i$ 个方程构造一个数 $E_i$，使它满足：

$$
E_i\equiv1\pmod{m_i},
$$

但对所有 $j\ne i$，

$$
E_i\equiv0\pmod{m_j}.
$$

这样，$a_iE_i$ 就只会对第 $i$ 个模数留下余数 $a_i$，对其他模数都是 $0$。可以把 $E_i$ 理解为“只打开第 $i$ 个条件”的开关。

## 让其他余数归零

定义

$$
M_i=\frac M{m_i}.
$$

$M_i$ 包含除 $m_i$ 以外的所有模数因子。因此对任意 $j\ne i$，都有

$$
M_i\equiv0\pmod{m_j}.
$$

这已经实现了“对其他模数为 $0$”。可是 $M_i$ 对 $m_i$ 的余数不一定是 $1$，还差一步。

## 把当前余数调成一

因为所有模数两两互质，$M_i$ 与 $m_i$ 也互质。根据裴蜀等式，存在整数 $t_i,y$，使得

$$
M_it_i+m_iy=1.
$$

两边对 $m_i$ 取模，得到

$$
M_it_i\equiv1\pmod{m_i}.
$$

$t_i$ 就是 $M_i$ 在模 $m_i$ 意义下的乘法逆元，可以用 [数论：扩展欧几里得算法](extended-euclidean-algorithm.md) 求出。

现在令

$$
E_i=M_it_i,
$$

就同时满足了我们对“开关”的两个要求。

## 组合所有开关

将每个开关乘以它应该产生的余数，再全部相加：

$$
x=\sum_{i=1}^k a_iM_it_i\pmod M.
$$

对某个固定的 $m_j$ 取模时：

- 所有 $i\ne j$ 的项都因 $M_i\equiv0\pmod{m_j}$ 而消失；
- 只剩 $a_jM_jt_j\equiv a_j\pmod{m_j}$。

因此这个 $x$ 同时满足所有方程。公式的来源就是逐个构造互不干扰的余数开关。

## 为什么解唯一

设 $x$ 和 $y$ 都满足全部同余条件。对每个 $m_i$，都有

$$
x-y\equiv0\pmod{m_i},
$$

所以每个 $m_i$ 都整除 $x-y$。这些模数两两互质，因此它们的乘积 $M$ 也整除 $x-y$，即

$$
x\equiv y\pmod M.
$$

这说明所有整数解都属于同一个模 $M$ 的同余类，而区间 $[0,M)$ 中恰好只有一个代表元。

## 手算例子

对于开头的方程组，

$$
M=3\times5\times7=105.
$$

三个部分分别是：

- $M_1=35$，$35\equiv2\pmod3$，$2$ 的逆元是 $2$，所以 $t_1=2$；
- $M_2=21$，$21\equiv1\pmod5$，所以 $t_2=1$；
- $M_3=15$，$15\equiv1\pmod7$，所以 $t_3=1$。

代入公式：

$$
\begin{aligned}
x
&\equiv2\times35\times2+3\times21\times1+2\times15\times1\pmod{105}\\
&\equiv233\pmod{105}\\
&\equiv23\pmod{105}.
\end{aligned}
$$

检查：$23$ 除以 $3,5,7$ 的余数分别是 $2,3,2$。

## 完整代码

下面只保留 CRT 自己的算法。代码复用 [模运算：modint](mod-int.md) 中的 `mint` 和 [数论：扩展欧几里得算法](extended-euclidean-algorithm.md) 中的 `exgcd`；把这两个已经讲过的工具放在同一份源文件前面，即可得到可提交的单文件程序。

程序假设模数乘积可以放入 64 位整数。`mint` 负责余数归一化和中间乘法取模，但无法保存一个本身已经超出 64 位整数范围的 $M$。

```cpp
bool crt(const vector<ll>& a, const vector<ll>& m, ll& ans, ll& M) {
    M = 1;
    for (ll x : m) {
        M *= x;
    }

    mint::set_mod(M);
    mint result = 0;
    int n = a.size();
    for (int i = 0; i < n; i++) {
        ll Mi = M / m[i];
        ll ti, y;
        if (exgcd(Mi, m[i], ti, y) != 1) {
            return false;
        }

        result += mint(a[i]) * mint(Mi) * mint(ti);
    }
    ans = result.value();
    return true;
}

int main() {
    int n;
    scanf("%d", &n);

    vector<ll> a(n);
    vector<ll> m(n);
    for (int i = 0; i < n; i++) {
        scanf("%lld%lld", &m[i], &a[i]);
    }

    ll ans, M;
    if (!crt(a, m, ans, M)) {
        printf("Moduli are not pairwise coprime\n");
        return 0;
    }

    printf("%lld %lld\n", ans, M);
    return 0;
}
```

余数和模数保存在 `vector` 中，因此代码使用从 `0` 开始的下标；这与本书中 STL 类型的统一习惯一致。

输出的两个数 `ans M` 表示方程组的全部解是

$$
x\equiv\texttt{ans}\pmod M.
$$

输入开头例子中的三个条件：

```text
3
3 2
5 3
7 2
```

输出：

```text
23 105
```

也就是说，全部解为 $x=23+105t$，其中 $t$ 是任意整数。

## 复杂度

对每个方程调用一次扩展欧几里得算法，并通过 `mint` 进行两次龟速乘。设所有模数的乘积为 $M$，总时间为

$$
O\left(\sum_{i=1}^k\log m_i+k\log M\right),
$$

保存余数和模数需要 $O(k)$ 空间。

## 基础练习

1. 手算方程组 $x\equiv1\pmod2$、$x\equiv2\pmod3$、$x\equiv3\pmod5$ 的每个 $M_i$、逆元和最终答案。
2. 对开头的例子，把第一个余数从 $2$ 改成 $-1$，先归一化余数，再检查解是否改变。
3. 假设两个数都满足同一组 CRT 条件，沿“每个 $m_i$ 都整除两数之差”的思路证明它们模 $M$ 相同。
4. 输入一组不两两互质的模数，观察程序在哪一次逆元不存在，并说明为什么经典 CRT 不能继续使用开关公式。

## 需要记住什么

1. 经典 CRT 对模数有什么要求？解在哪个模数下唯一？
2. $M$ 和 $M_i$ 分别如何定义？
3. 为什么 $M_i$ 对除 $m_i$ 以外的模数都为 $0$？
4. 为什么 $M_i$ 在模 $m_i$ 下一定存在逆元 $t_i$？
5. $E_i=M_it_i$ 为什么可以被理解为只打开第 $i$ 个余数条件的开关？
6. 如何由这些开关组合出 CRT 的解？
7. 为什么满足全部条件的两个解一定模 $M$ 相同？

## 下一篇

如果模数不两两互质，$M_i$ 的逆元可能不存在。[数论：扩展中国剩余定理（exCRT）](extended-chinese-remainder-theorem.md) 会放弃“一次构造全部开关”，改为每次合并两个同余方程。
