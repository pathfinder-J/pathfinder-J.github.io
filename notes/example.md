---
layout: default
title: "기능 테스트 페이지"
date: "2026-03-13"
---

## 소개

이 페이지는 다음 기능을 한 번에 테스트하기 위한 예시다.

- 자동 TOC
- 수식 번호
- `\eqref` 참조
- 짧은 코드 블록
- 세로로 긴 코드 블록
- 가로로 긴 코드 블록

## TOC 테스트

이 섹션은 목차가 제대로 생성되는지 확인하기 위한 섹션이다.

### 하위 섹션 A

자동 목차에서 이 제목이 보이는지 확인해보자.

### 하위 섹션 B

여기도 목차에 들어가야 한다.

## 수식 번호와 참조 테스트

다음은 mutual information의 정의이다.

\begin{equation}
I(X;Y)
=
\mathbb{E}\left[
\log \frac{p(x,y)}{p(x)p(y)}
\right]
\label{eq:mi}
\end{equation}

식 \eqref{eq:mi}가 제대로 번호와 함께 참조되는지 확인해보자.

다음은 InfoNCE 형태를 흉내낸 식이다.

$$
\mathcal{L}_{\mathrm{NCE}}
= -\mathbb{E}\left[
\log \frac{\exp(s(x,y))}
{\sum_{y' \in \mathcal{Y}} \exp(s(x,y'))}
\right]
\tag{1}\label{eq:infonce}
$$

식 \eqref{eq:infonce}도 정상적으로 보이면 된다.

## 짧은 코드 블록 테스트

아래는 짧은 코드 블록이다.  
Expand 버튼이 없어야 자연스럽다.

```python
def add(a, b):
    return a + b

print(add(2, 3))
```

## 세로로 긴 코드 블록 테스트

아래는 줄 수가 많아서 세로로 접혀야 하는 코드 블록이다.  
처음에는 일부만 보이고, Expand 버튼을 누르면 전체가 보여야 한다.

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

## 가로로 긴 코드 블록 테스트

아래는 한 줄이 매우 길어서 가로 스크롤이 생겨야 하는 코드 블록이다.  
페이지 전체 폭이 깨지지 않고, 코드 블록 내부에서만 가로 스크롤이 생겨야 한다.

```python
very_long_variable_name_for_testing_horizontal_scroll_behavior = [i * 2 for i in range(1000) if i % 3 == 0 and i % 5 != 0 and i % 7 != 0 and i % 11 != 0 and i % 13 != 0 and i % 17 != 0 and i % 19 != 0 and i % 23 != 0 and i % 29 != 0 and i % 31 != 0 and i % 37 != 0]

print("This line is intentionally extremely long so that we can verify whether horizontal scrolling works correctly inside the code block without breaking the layout of the page or pushing the main content container beyond the expected maximum width of the site.")
```

### 가로 + 세로 둘 다 긴 코드 블록 테스트

이건 줄 수도 많고, 각 줄도 길어서 두 기능이 동시에 잘 동작하는지 보기 위한 예시다.

```python
def extremely_long_function_name_for_combined_vertical_and_horizontal_scroll_testing(input_vector, weight_matrix, bias_vector, activation_function_name="relu", apply_normalization_before_activation=True, apply_dropout_after_activation=False, dropout_probability=0.1):
    transformed_output_vector = []
    for column_index_in_weight_matrix in range(len(weight_matrix[0])):
        accumulated_weighted_sum_for_current_output_dimension = 0
        for row_index_in_input_vector in range(len(input_vector)):
            accumulated_weighted_sum_for_current_output_dimension += input_vector[row_index_in_input_vector] * weight_matrix[row_index_in_input_vector][column_index_in_weight_matrix]
        accumulated_weighted_sum_for_current_output_dimension += bias_vector[column_index_in_weight_matrix]
        transformed_output_vector.append(accumulated_weighted_sum_for_current_output_dimension)
    return transformed_output_vector

def apply_activation_function_with_extra_verbose_name(hidden_representation_vector, activation_function_name="relu", numerical_stability_epsilon=1e-8, enable_debug_output_for_testing_purposes=False):
    if activation_function_name == "relu":
        return [max(0, value) for value in hidden_representation_vector]
    elif activation_function_name == "sigmoid":
        import math
        return [1 / (1 + math.exp(-value)) for value in hidden_representation_vector]
    elif activation_function_name == "tanh":
        import math
        return [math.tanh(value) for value in hidden_representation_vector]
    else:
        return hidden_representation_vector

def run_demo_pipeline_for_scroll_behavior_verification():
    x = [0.125, 0.25, 0.5, 1.0]
    w = [
        [0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
        [0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
        [0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
        [0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
    ]
    b = [0.01, 0.02, 0.03, 0.04, 0.05, 0.06]
    hidden = extremely_long_function_name_for_combined_vertical_and_horizontal_scroll_testing(x, w, b, activation_function_name="relu", apply_normalization_before_activation=True, apply_dropout_after_activation=False, dropout_probability=0.0)
    activated = apply_activation_function_with_extra_verbose_name(hidden, activation_function_name="relu", numerical_stability_epsilon=1e-8, enable_debug_output_for_testing_purposes=True)
    print("Combined scroll behavior test output:", activated)

run_demo_pipeline_for_scroll_behavior_verification()
```

## 마무리

여기까지 정상이라면 다음을 확인하면 된다.

1. 목차가 자동 생성되는지
2. 식 번호가 붙는지
3. `\eqref`가 번호를 참조하는지
4. 짧은 코드에는 Expand 버튼이 없는지
5. 세로로 긴 코드에는 Expand/Collapse가 되는지
6. 가로로 긴 코드는 블록 내부에서만 스크롤되는지
7. 가로와 세로가 모두 긴 코드도 레이아웃을 깨지 않는지
