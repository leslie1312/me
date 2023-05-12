---
date: 2023.1.29
title: TypeScript Handbook 阅读笔记
outline: [2, 3]
---

# TypeScript Handbook 阅读笔记

## 常用类型

### string, number, boolean

- 声明变量时如果能给定初始值，通常省略显性的类型注解（交由编译器推断）

- 不要与 **String**, **Number**, **Boolean** 类型混淆

```ts
let A = new String("A")
let a = "a"
// 'string' is a primitive, but 'String' is a wrapper object.
A = a
a = A // [!code error]
```

### null, undefined

- 在 **tsconfig.json** 中设置编译选项 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks)为 `true`，能严格区分 `null` 和 `undefined` 类型，有助于提前检测到运行时的可能错误

  > `Uncaught TypeError: Cannot read properties of undefined`

- 在开发者确保非空的情况下，可以使用非空断言符 `!`，减少额外的类型判断

```ts
function liveDangerously(x?: number | null) {
  console.log(x!.toFixed())
}
```

### 类型断言

- 使用此特性可以自由指定变量的类型，但需要开发者自行确保类型安全

```ts
/**
 * 编译器默认 document.getElementById 返回类型是 HTMLElement | null
 * 但开发者确保 #input 的元素一定是一个 <input /> 元素，可以使用类型断言
 * 从而帮助编译器推断 myInput 的类型
 */
const myInput = document.getElementById("input") as HTMLInputElement
```

- 避免无意义的断言（编译器限定断言前和断言后的两个类型得有非空交集）

```ts
// error string 和 number 的交集为空
const x = "hello" as number // [!code error]
// 不过可以使用 any 或者 unknown 搭桥
const y = "world" as any as number
```

### 字面量类型

- 明确与 **string** 类型的区别

```ts
function printText(s: string, alignment: "left" | "right" | "center") {
  // ...
}
printText("Hello, world", "left")
printText("G'day, mate", "centre") // [!code error]

// 返回值类型被推断成字面量类型 -1 | 0 | 1
function compare(a: string, b: string): -1 | 0 | 1 {
  return a === b ? 0 : a > b ? 1 : -1
}
```

- 使用 `as const`

```ts
// 我们期望 counter 字段是一个字面量类型
const obj = { counter: 0 }
obj.counter = 1
// 对单个字段断言
const obj$2 = { counter: 0 as const }
// 对所有字段断言
const obj$3 = { counter: 0 } as const
// oops: 现在 obj.counter 不接受除 0 以外的其他赋值
obj$2.counter = 1 // [!code error]
```

```ts
// 另一个例子：限定 method 只接受 GET 或者 POST 请求方法
function handleRequest(url: string, method: "GET" | "POST") {
  // ...
}

const req = { url: "https://example.com", method: "GET" }
handleRequest(req.url, req.method) // [!code error]
```

### 数组和元组

- 数组：可注解其中元素的类型。比如：使用 `Array<string>` 或者 `string[]` 注解一个字符串类型的数组

- 元组：限定了长度的数组，相比数组，可以更方便地为其中每个元素指定类型

```ts
type SortOptions = [number, number, number]
// 假定输入参数类型限定为三元组
function sort(args: SortOptions) {
  // ...
}

let arg1 = [1, 2, 3]
// oops arg1 类型是 number[]，无法兼容更严格的元组类型
sort(arg1) // [!code error]
// 我们可以使用类型断言
let arg$2 = [1, 2, 3] as SortOptions
sort([...arg$3])
// 或者展开一个字面量数组
let arg$3 = [1, 2, 3] as const
sort([...arg$3])
```

## 类型缩窄

:::info 个人观点

TypeScript 是追求类型安全的语言  
使用时需要开发者”协助”编译器推断类型来保证类型安全  
类型缩窄语句就是常见的“协助”手段

:::

### typeof

- 🤔 `typeof null === 'object'`
  > [why | mdn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#typeof_null)

### 真值判断

- **JavaScript** 中的假值（对假值进行 `if` 判断 或者 `!!` 运算，均返回 `false`）

  > [参考 falsy | mdn](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)

  - `false`, `0`, `NaN`, `""`, `null`, `undefined`, `0n`

```ts
type NonFalsy<T> = T extends false | 0 | NaN | "" | null | undefined | 0n ? never : T
```

```ts
// 一段有隐患的代码示例 🤔
function printAll(strs: string | string[] | null) {
  if (strs) {
    if (typeof strs === "object") {
      for (const s of strs) {
        console.log(s)
      }
    } else if (typeof strs === "string" /* 冗余的判断 */) {
      console.log(strs)
    }
  }
  // 没有讨论 strs 是空字符串的情形，可能会埋下隐患
}
```

### 相等判断

- `===` 和 `!==`
- `==` 和 `!=`

### 类型谓词

- 使用关键字 `is`

使用动机：参考示例

```ts
/**
 * 我们知道当 isString 返回 true 时，foo 就是 string 类型
 * 但编译器并不知道这个信息，使用类型谓词可以帮助编译器获取这个信息
 */
function isString(foo: unknown): foo is string {
  return typeof foo === "string"
}

function example(foo: unknown) {
  if (isString(foo)) {
    // 由于使用了类型谓词，编译器会推断 foo 是 string 类型
    console.log("it is a string " + foo)
    console.log(string.toLowerCase())
  }
  // foo 现在又被视为 unknown 类型了
}
```

总结来看，它很像 `as` 断言（能让开发者自己决断类型），但是不如 `as` 自由， 它需要在函数返回值为 `true` 时才成立

### never 类型

1. 从字面意义看，never 表示一个不可能得到的类型（与空集概念类似）  
   比如 `type N = string & number`，由于 `string` 和 `number` 没有非空交集，`N` 会编译器被推断为 `never` 类型

2. 使用动机 ①：在分支判断中，确保已列举了所有可能选项

<T>

```ts
interface Circle {
  kind: "circle"
  radius: number
}
interface Square {
  kind: "square"
  sideLength: number
}
type Shape = Circle | Square

function getArea(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2
    case "square":
      return shape.sideLength ** 2
    default:
      const _exhaustiveCheck: never = shape
      return _exhaustiveCheck
  }
}

// 如果后续有人为 Shape 添加了一个新的可能选项
// 编译器将在上面的 switch 语句中提示错误
interface Triangle {
  kind: "triangle"
  sideLength: number
}
type Shape = Circle | Square | Triangle
```

</T>

3. 使用动机 ②：表示后续不会执行的代码

<T>

```ts
function throwError() {
  throw new Error()
}
function firstChar(msg: string | undefined) {
  if (msg === undefined) {
    throwError()
  }
  let ch = msg.charAt(1) // [!code error]
}

// 我们可以在 firstChar 函数中使用类型缩窄
function firstChar(msg: string | undefined) {
  if (msg === undefined) {
    throwError()
  } else {
    let ch = msg.charAt(1)
  }
}
// 为了通用，可以将 throwError 返回值类型注解为 never
function throwError(): never {
  throw new Error()
}
```

</T>

## 函数类型

### 类型签名

- 类型注解：为函数的输入参数和返回值两部分提供类型注解

- 可调用签名：如果想表示某个对象类型既支持函数调用，也有特定字段时

```ts
type DescribableFunction = {
  description: string
  (someArg: number): boolean // 添加1个调用签名，也可以添加多个
}
function doSomething(fn: DescribableFunction) {
  console.log(fn.description + " returned " + fn(6))
}
```

- 构造签名：需要为构造函数添加类型注解时，在可调用签名的基础上添加关键字 `new`

```ts
interface CallOrConstruct {
  new (s: string): Date
  (n?: number): number
}

Date(1667447141572)
new Date()
```

### 可选参数

- 在形参上使用可选参数符 `?`，意味着该位置上的实参可以省略

- 使用 `?` 在调用时能带来便利，但可能需要在函数体中添加类型缩窄语句来处理空值，这时预先给定一个默认值或许会更有用

```ts
function f1(x?: number) {
  console.log(typeof x)
}
function f2(x = 10) {
  console.log(typeof x)
}

f1() // print "undefined"
f2() // print "number"
```

### 泛型

- 使用动机：当需要在输入参数和返回值之间建立类型关联时

```ts
// 返回值类型被推断成 any
function firstElement(arr: any[]) {
  return arr[0]
}
// 返回值类型被推断成 T
function firstElement$2<T>(arr: T[]) {
  return arr[0]
}
```

- 为泛型参数添加约束条件：使用关键字 `extends`

```ts
function longest<T extends { length: number }>(a: T, b: T) {
  if (a.length >= b.length) {
    return a
  } else {
    return b
  }
}

// 返回值类型是 'number[]'
longest([1, 2], [1, 2, 3])
// 返回值类型是 'alice' | 'bob'
longest("alice", "bob")
longest(10, 100) // [!codeㅤ error]
```

- 使用误区：将约束条件和类型本身混淆

```ts
function minimumLength<T extends { length: number }>(obj: T, minimum: number): T {
  if (obj.length >= minimum) {
    return obj
  } else {
    return { length: minimum } // [!code error]
  }
}

const arr = minimumLength([1, 2, 3], 6)
// 按上面实现，arr 应该是一个对象类型，没有对应的 slice 方法
console.log(arr.slice(0))
```

- 一份如何写好泛型函数的指南(😀 让调用者使用愉快)

> - Push Type Parameters Down
> - Use Fewer Type Parameters
> - Type Parameters Should Appear Twice

### 重载

- 使用动机：当一个函数调用时允许传入不同的输入参数（包括参数个数、参数类型）

- 语法形式：重载签名在前，具体实现在尾(实现中的输入参数需要兼容签名所有签名)

```ts
function fn(x: string): string
function fn(x: number): boolean
function fn(x: string | number): string | boolean {
  return "hello, typescript"
}
```

- 当多个重载签名具有相同个数的入参和返回值类型时，优先使用联合类型或许是更优解（重载往往会在函数实现中引入大量的类型缩窄判断）

```ts
function len(s: string): number
function len(arr: any[]): number
function len(x: any) {
  return x.length
}

len("")
len([0])
// 🤔
len(Math.random() > 0.5 ? "hello" : [0]) // [!code error]
```

## 对象类型

> TODO:

## 类类型

### 构造函数

- 区别之前函数签名的点

  1. 不支持类型参数
  2. 不需要注解返回值类型

- [`super`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super) 关键字的使用

```ts
class Base {
  k = 4
}

class Derived extends Base {
  constructor() {
    console.log(this.k) // [!code error]
    super()
  }
}
```

### 类成员

- 成员字段的类型注解

```ts
class Point {
  // 声明时注解类型
  x: number
  // 也可以给定一个初始值，编译器会自动推断类型
  y = 0 // 相当于 y: number = 0

  constructor() {
    // 在构造函数中初始化成员字段
    this.x = 0
    this.z = 0 // [!code error]
  }
}
```

- 只读修饰符

```ts
// 以下两种方式均可表示类成员字段只读
class Greeter {
  // 方式一 使用 readonly 修饰符
  readonly name: string = "world"
  _length = 0
  // 方式二 仅实现 getter 存取器
  get length() {
    return this._length
  }

  foo() {
    this.name = "world2" // [!code error]
    this.length = 1 // [!code error]
  }
}
```

- 可见修饰符

| 修饰符      | 类自身 | 子类 | 类实例 |
| :---------- | :----- | :--- | :----- |
| `public`    | ✔️     | ✔️   | ✔️     |
| `protected` | ✔️     | ✔️   | ❌     |
| `private`   | ✔️     | ❌   | ❌     |

> 📝 以上修饰符在发出到 JavaScript 时都会丢失，有需要可参考 Javascript 原生支持的私有字段修饰符 [`#`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields)

- `static` 关键字

  > [static members | mdn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static)

  🤔 以下案例报错原因

```ts
class Box<T> {
  static defaultValue: T // [!code error]
}
```

### 类继承

- 使用 `implements` 关键字简单限定类的字段结构(JavaScript 不支持)

```ts
interface Base {
  foo(arg: string): void
  x: number
  y?: number
}

// 需要实现给定的字段
class Derived implements Base {
  // x 要求类型是 number
  x = 0
  // foo 要求匹配入参类型和返回类型
  foo(arg2: string) {}
  // y 是可选字段 可省略
}
```

- 使用 `extends` 关键字来严格实现继承关系

  > [extends | mdn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends)

- 📝 在实例化类时，成员的声明顺序

```ts
class Base {
  name = "base"
  constructor() {
    console.log("My name is " + this.name)
  }
}
class Derived extends Base {
  name = "derived"
}
//🤔 prints "base" or "derived"
const d = new Derived()
```

### this

> TODO:

## 参考链接

- [The TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Playground](https://www.typescriptlang.org/play)
