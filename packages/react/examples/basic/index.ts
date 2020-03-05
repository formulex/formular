import { createForm } from '@formular/core';

(window as any).base = createForm({
  initialValues: {
    foo: 'bar',
    bar: 123,
    baz: true,
    touming: undefined,
    foofoo: {
      username: 'baozi',
      age: 23
    },
    tag: ['happy', 'nice', 'quick'],
    firends: [
      { name: 'Heskey', age: 22 },
      { name: 'Barbara', age: 25 },
      { name: 'Fiona', age: 24 }
    ]
  }
});
