---
id: basic-concepts-controllers
title: Conceptos Básicos
sidebar_label: Conceptos Básicos
---

## Introducción

Un controller es una clase especial (`abstract`) que se compone de los siguientes elementos:

### Stores
`Store<T>` es un objeto que guarda estado. Puede haber multiples stores en un controller, pero por defecto, la mayoría de las APIs de `@ar-kit/controllers` interactuan con un único store mediante la propiedad `store`.

### Events
`Event<T>` es una función que denota una intención o acción. Se utilizan para invocar lógica de aplicación o un cambio de estado de un `Store<T>`. Puede haber varios eventos en un controller y se acceden mediante la propiedad `events`.

### Forms
`FormHandler<T>` es un conjunto de stores, events y funciones de válidaciín para el manejo del flujo de formularios de una aplicación. Puede haber multiples forms en un controller, pero por defecto, la mayoría de las APIs de `@ar-kit/controllers` interactuan con un único store mediante la propiedad `form`.

### Bootstrap Fn
`abstract bootstrap(initialState: InitialStateType)` es una función que debe implementarse por la cual un controller es inicializado. En esta función se crean los stores, events y forms que componen una aplicación. `initialState` es un objeto opcional que recibe `boostrap` de `fetchInitialData` con información necesaria para establecer el estado inicial del controller.

### Initial Data Fn
`fetchInitialData?: (ctx) => Promise<InitialStateType> | InitialStateType;` es una función (que puede o no ser asíncrona, por lo general lo es) que sirve para obtener el estado inicial del controller y pasarselo a `bootstrap`. `fetchInitialData` permite ejecutarse server side o client side dependiendo desde donde comienza el ciclo de inicialización de un controller. Si el ciclo comienza server side, `fetchInitialData` debe ser transferido como JSON al cliente y pasado a `bootstrap` al momento de hidratar el componente (como lo hace NextJS).

### Ejemplo de controller

```typescript
import {
    arrayItemReducerEvent,
    Controller
    createStore, 
    createFormHandler
} from '@ar-kit/controllers';

class TodosController extends Controller<TodosInitialData> {
    fetchInitialData = async (ctx): TodosInitialData => {
        let response = await fetch(`https://todos.service/users/${ctx.query.id}`);
        let data = await response.json()
        // data: { todos: [{ id: 1, title: 'Pick-up dry-cleaning' }, ...] }
        return {
            ...data,
            loading: false
        };
    };

    store: TodosStore;

    events: TodosEvents;

    bootstrap(initialState: TodosInitialData) {
        this.store = createStore(initialState);

        this.events = {
            addtodo: reducerEvent((state, todo) => {  })
            toggleTodo: arrayItemReducerEvent(this.store),

        }
    }
}
```

---

## Lists

1. First ordered list item
1. Another item ⋅⋅\* Unordered sub-list.
1. Actual numbers don't matter, just that it's a number ⋅⋅1. Ordered sub-list
1. And another item.

⋅⋅⋅You can have properly indented paragraphs within list items. Notice the blank line above, and the leading spaces (at least one, but we'll use three here to also align the raw Markdown).

⋅⋅⋅To have a line break without a paragraph, you will need to use two trailing spaces.⋅⋅ ⋅⋅⋅Note that this line is separate, but within the same paragraph.⋅⋅ ⋅⋅⋅(This is contrary to the typical GFM line break behaviour, where trailing spaces are not required.)

- Unordered list can use asterisks

* Or minuses

- Or pluses

---

## Links

[I'm an inline-style link](https://www.google.com)

[I'm an inline-style link with title](https://www.google.com "Google's Homepage")

[I'm a reference-style link][arbitrary case-insensitive reference text]

[I'm a relative reference to a repository file](../blob/master/LICENSE)

[You can use numbers for reference-style link definitions][1]

Or leave it empty and use the [link text itself].

URLs and URLs in angle brackets will automatically get turned into links. http://www.example.com or <http://www.example.com> and sometimes example.com (but not on Github, for example).

Some text to show that the reference links can follow later.

[arbitrary case-insensitive reference text]: https://www.mozilla.org
[1]: http://slashdot.org
[link text itself]: http://www.reddit.com

---

## Images

Here's our logo (hover to see the title text):

Inline-style: ![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png 'Logo Title Text 1')

Reference-style: ![alt text][logo]

[logo]: https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png 'Logo Title Text 2'

---

## Code

```javascript
var s = 'JavaScript syntax highlighting';
alert(s);
```

```python
s = "Python syntax highlighting"
print s
```

```
No language indicated, so no syntax highlighting.
But let's throw in a <b>tag</b>.
```

```js {2}
function highlightMe() {
  console.log('This line can be highlighted!');
}
```

---

## Tables

Colons can be used to align columns.

| Tables        |      Are      |   Cool |
| ------------- | :-----------: | -----: |
| col 3 is      | right-aligned | \$1600 |
| col 2 is      |   centered    |   \$12 |
| zebra stripes |   are neat    |    \$1 |

There must be at least 3 dashes separating each header cell. The outer pipes (|) are optional, and you don't need to make the raw Markdown line up prettily. You can also use inline Markdown.

| Markdown | Less      | Pretty     |
| -------- | --------- | ---------- |
| _Still_  | `renders` | **nicely** |
| 1        | 2         | 3          |

---

## Blockquotes

> Blockquotes are very handy in email to emulate reply text. This line is part of the same quote.

Quote break.

> This is a very long line that will still be quoted properly when it wraps. Oh boy let's keep writing to make sure this is long enough to actually wrap for everyone. Oh, you can _put_ **Markdown** into a blockquote.

---

## Inline HTML

<dl>
  <dt>Definition list</dt>
  <dd>Is something people use sometimes.</dd>

  <dt>Markdown in HTML</dt>
  <dd>Does *not* work **very** well. Use HTML <em>tags</em>.</dd>
</dl>

---

## Line Breaks

Here's a line for us to start with.

This line is separated from the one above by two newlines, so it will be a _separate paragraph_.

This line is also a separate paragraph, but... This line is only separated by a single newline, so it's a separate line in the _same paragraph_.
