---
title: "InfoNCE 직관"
date: 2026-03-05
---

한글/영어: Representation learning은 재미있다.

수식: 123

$$
I(X;Y) = \mathbb{E}\left[\log\frac{p(x,y)}{p(x)p(y)}\right]
$$

코드:

```python
def add(a, b):
    return a + b


def multiply(a, b):
    return a * b


def square(x):
    return x * x
```


```python
class NeuralNetwork:
    def __init__(self, layers):
        self.layers = layers
        self.weights = []
        self.biases = []

    def initialize_parameters(self):
        for i in range(len(self.layers) - 1):
            w = self.random_matrix(self.layers[i], self.layers[i + 1])
            b = self.random_vector(self.layers[i + 1])
            self.weights.append(w)
            self.biases.append(b)

    def random_matrix(self, n, m):
        import random
        return [[random.random() for _ in range(m)] for _ in range(n)]

    def random_vector(self, n):
        import random
        return [random.random() for _ in range(n)]

    def forward(self, x):
        for w, b in zip(self.weights, self.biases):
            x = self.linear(x, w, b)
            x = self.relu(x)
        return x

    def linear(self, x, w, b):
        result = []
        for j in range(len(w[0])):
            s = 0
            for i in range(len(x)):
                s += x[i] * w[i][j]
            s += b[j]
            result.append(s)
        return result

    def relu(self, x):
        return [max(0, v) for v in x]

    def predict(self, x):
        out = self.forward(x)
        return out.index(max(out))


model = NeuralNetwork([4, 16, 16, 3])
model.initialize_parameters()

sample = [0.1, 0.5, 0.2, 0.9]

prediction = model.predict(sample)

print("prediction:", prediction)
```

```python
very_long_variable_name_for_testing_horizontal_scroll_behavior = [i * 2 for i in range(1000) if i % 3 == 0 and i % 5 != 0 and i % 7 != 0 and i % 11 != 0 and i % 13 != 0 and i % 17 != 0]

print("This line is intentionally extremely long so that we can verify whether horizontal scrolling works correctly inside the code block without breaking the layout of the page or pushing the container width beyond the expected limits.")
```




