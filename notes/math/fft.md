# 多项式：FFT

> 最近修订：2026-08-17 12:48 +10:00（未审阅）

两个长度约为 $n$ 的系数数组做朴素卷积，需要 $O(n^2)$ 次乘加。当值域频次数组
很长、要统计大量配对和，或多项式次数达到几十万时，平方复杂度无法接受。

快速傅里叶变换（Fast Fourier Transform，FFT）把多项式从“系数表示”转换为
“若干点上的函数值表示”：

1. 在一组特殊点上快速计算两个多项式的值；
2. 对应位置直接相乘；
3. 从乘积的函数值快速恢复系数。

三步都能在 $O(n\log n)$ 时间内完成。FFT 加速的是已经明确的普通卷积，不改变
`result[i+j] += a[i]*b[j]` 的数学含义。

## 系数表示与点值表示

次数小于 $n$ 的多项式：

$$
A(x)=a_0+a_1x+\cdots+a_{n-1}x^{n-1}
$$

由 $n$ 个系数唯一确定，也可以由 $n$ 个互不相同点上的函数值唯一确定。

若已经知道相同点集上的 $A(x_i)$ 与 $B(x_i)$，乘积多项式满足：

$$
C(x_i)=A(x_i)B(x_i).
$$

点值表示下，多项式乘法只需 $n$ 次对应相乘。真正的问题变成：怎样快速地在
系数与点值之间转换。

## 为什么选择单位根

复数平面上的 $n$ 次单位根满足：

$$
\omega_n^k=e^{2\pi i k/n},
\qquad k=0,1,\ldots,n-1.
$$

它们均匀分布在单位圆上，并具有：

$$
\omega_n^{k+n}=\omega_n^k,
\qquad
\omega_n^{2k}=\omega_{n/2}^k.
$$

第二条性质使规模为 $n$ 的计算能够复用两个规模为 $n/2$ 的计算，正是分治降到
$O(n\log n)$ 的原因。

## 按指数奇偶拆分

把多项式系数按指数奇偶分成：

$$
A(x)=A_{even}(x^2)+xA_{odd}(x^2).
$$

在 $x=\omega_n^k$ 处：

$$
A(\omega_n^k)
=A_{even}(\omega_{n/2}^k)
+\omega_n^kA_{odd}(\omega_{n/2}^k).
$$

而第 `k+n/2` 个点满足：

$$
\omega_n^{k+n/2}=-\omega_n^k,
$$

所以同一对偶数项与奇数项结果还能得到：

$$
A(\omega_n^{k+n/2})
=A_{even}(\omega_{n/2}^k)
-\omega_n^kA_{odd}(\omega_{n/2}^k).
$$

一次长度为 $n$ 的变换因此拆成两个长度为 $n/2$ 的变换，再做 $O(n)$ 次蝶形
合并：

```text
left  = even + root * odd
right = even - root * odd
```

递推式为：

$$
T(n)=2T(n/2)+O(n)=O(n\log n).
$$

## 为什么长度补到 2 的幂

两个系数数组长度分别为 `p` 和 `q` 时，卷积需要 `p+q-1` 个结果。FFT 的二分
过程要求变换长度反复除以 2，所以选择不小于结果长度的最小 2 的幂：

```cpp
int size = 1;
while (size < needed) {
    size *= 2;
}
```

多出的高次系数补 0，不会改变原多项式。若变换长度小于真实结果长度，高次项会
循环折回低次位置，产生循环卷积而不是所需的普通卷积。

## 位逆序排列

递归 FFT 会不断按“偶数下标、奇数下标”拆分。迭代实现先把元素排成递归叶子
最终出现的顺序，这个顺序恰好是固定二进制位宽下的下标反转。

例如长度 8 使用 3 位下标：

```text
原下标 001 -> 反转 100
原下标 011 -> 反转 110
```

代码逐步维护每个 `i` 对应的反转位置 `j`，若 `i < j` 就交换。完成以后，再按
长度 2、4、8 逐层做蝶形合并。

## 逆变换

正变换使用角度 $2\pi/n$ 的单位根。逆变换使用相反角度，并在最后把每个结果
除以 `n`。

从矩阵角度看，单位根变换矩阵的逆等于共轭矩阵再除以 `n`。因此正变换和逆变换
可以共用同一份蝶形代码，只需：

- 反转单位根角度的符号；
- 逆变换结束后统一除以长度。

## 完整代码

下面计算两个整系数多项式的卷积。输入次数与从低次到高次的系数，输出乘积全部
系数。题目需要保证系数规模与长度使浮点误差足够小，最终使用 `llround` 舍入到
最近整数。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;
typedef complex<double> Complex;

const double PI = acos(-1.0);

void fft(vector<Complex>& value, bool inverse) {
    int n = value.size();

    for (int i = 1, j = 0; i < n; i++) {
        int bit = n / 2;

        while (j & bit) {
            j ^= bit;
            bit /= 2;
        }
        j ^= bit;

        if (i < j) {
            swap(value[i], value[j]);
        }
    }

    for (int length = 2; length <= n; length *= 2) {
        double angle = 2 * PI / length * (inverse ? -1 : 1);
        Complex step(cos(angle), sin(angle));

        for (int start = 0; start < n; start += length) {
            Complex root(1, 0);
            int half = length / 2;

            for (int offset = 0; offset < half; offset++) {
                Complex even = value[start + offset];
                Complex odd = value[start + offset + half] * root;

                value[start + offset] = even + odd;
                value[start + offset + half] = even - odd;
                root *= step;
            }
        }
    }

    if (inverse) {
        for (Complex& x : value) {
            x /= n;
        }
    }
}

vector<ll> convolution(const vector<ll>& a, const vector<ll>& b) {
    int needed = a.size() + b.size() - 1;
    int size = 1;

    while (size < needed) {
        size *= 2;
    }

    vector<Complex> transformed_a(size);
    vector<Complex> transformed_b(size);

    for (int i = 0; i < (int)a.size(); i++) {
        transformed_a[i] = a[i];
    }
    for (int i = 0; i < (int)b.size(); i++) {
        transformed_b[i] = b[i];
    }

    fft(transformed_a, false);
    fft(transformed_b, false);

    for (int i = 0; i < size; i++) {
        transformed_a[i] *= transformed_b[i];
    }

    fft(transformed_a, true);

    vector<ll> result(needed);
    for (int i = 0; i < needed; i++) {
        result[i] = llround(transformed_a[i].real());
    }

    return result;
}

vector<ll> read_polynomial() {
    int degree;
    cin >> degree;

    vector<ll> coefficient(degree + 1);
    for (ll& value : coefficient) {
        cin >> value;
    }
    return coefficient;
}

void solve() {
    vector<ll> a = read_polynomial();
    vector<ll> b = read_polynomial();
    vector<ll> result = convolution(a, b);

    cout << (int)result.size() - 1 << '\n';
    for (int i = 0; i < (int)result.size(); i++) {
        cout << result[i] << (i + 1 == (int)result.size() ? '\n' : ' ');
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 浮点误差怎样理解

`double` 通常提供约 15 到 16 位十进制有效数字，但这不等于“最终答案不超过
15 位就一定安全”。变换过程中会进行大量复数加减乘法，中间量大约与长度和
系数规模共同增长，舍入误差也会累积。

以下因素都会降低安全余量：

- 变换长度很大；
- 输入系数绝对值很大；
- 单个结果系数累加很多乘积；
- 进行多次连续卷积；
- 最终结果接近 64 位边界。

基础 FFT 适合系数规模经过题目保证的整数卷积。要求严格模数答案时优先使用
NTT；模数不支持单次 NTT 时，可以使用多个 NTT 友好质数配合中国剩余定理，
或根据范围拆分系数。不能仅凭 `double` 的标称精度断言任意压位高精度乘法安全。

## FFT 与朴素卷积怎样选择

FFT 的渐近复杂度为 $O(N\log N)$，其中 $N$ 是补零后的 2 的幂长度；空间为
$O(N)$。它还有三次变换、三角函数和复数运算的固定常数。

一边多项式很短或总乘加次数只有几百万时，朴素卷积通常更简单。两边都很长，
且一次平方卷积明显超时，FFT 才体现高投入产出比。

## 常见错误

- 变换长度只取 `max(a.size(),b.size())`，没有覆盖 `p+q-1`；
- 补零长度不是 2 的幂，迭代分层无法完整二分；
- 位逆序交换条件写反，或没有限制 `i < j`；
- 蝶形更新第二项时使用已经被覆盖的新 `even`；
- 逆变换只反转角度，却忘记最后除以长度；
- 对整数结果直接截断为 `long long`，没有使用最近整数舍入；
- 认为 `double` 有 15 位精度就能安全计算任意规模的大整数卷积；
- 小规模卷积仍强行使用 FFT，增加代码和精度风险。

## 需要记住什么

- 为什么点值表示下多项式乘法只需对应点相乘？
- 单位根的什么性质使规模能够减半？
- 按指数奇偶拆分后，两个蝶形结果怎样得到？
- 为什么变换长度至少是结果长度，并补到 2 的幂？
- 正变换与逆变换有哪两个区别？
- FFT 的浮点误差与哪些规模因素有关？
- 什么情况下应改用朴素卷积或 NTT？
