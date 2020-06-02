[English](./README.md) | 中文

<p align="center">
  <img width="140px" alt="logo" src="./assets/formular_logo.svg" />
</p>

<h1 align="center">Formular</h1>
<p align="center">
  A Mobx-based form resolution 🐺
</p>

<div align="center">

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

</div>

<div align="center">

![gif](./assets/demogif.gif)

<img width="584px" alt="demo" src="./assets/demo2.png" />

</div>

## Packages

|                Name                |                                                         Version                                                          |                                                         Downloads                                                          |
| :--------------------------------: | :----------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------: |
| [@formular/core](./packages/core)  |  [![NPM version](https://img.shields.io/npm/v/@formular/core.svg?style=flat)](https://npmjs.org/package/@formular/core)  |  [![NPM downloads](http://img.shields.io/npm/dm/@formular/core.svg?style=flat)](https://npmjs.org/package/@formular/core)  |
| [@formular/react](./packages/core) | [![NPM version](https://img.shields.io/npm/v/@formular/react.svg?style=flat)](https://npmjs.org/package/@formular/react) | [![NPM downloads](http://img.shields.io/npm/dm/@formular/react.svg?style=flat)](https://npmjs.org/package/@formular/react) |
| [@formular/antd](./packages/antd)  |  [![NPM version](https://img.shields.io/npm/v/@formular/antd.svg?style=flat)](https://npmjs.org/package/@formular/antd)  |  [![NPM downloads](http://img.shields.io/npm/dm/@formular/antd.svg?style=flat)](https://npmjs.org/package/@formular/antd)  |

## Features

### Subscription based

拥有直接命令式的编写表单副作用的接口，相比于使用 `Rxjs`，大大降低开发者的心智负担

### Schema based

渲染时拥有一套定义表单的 `DSL`，帮助开发者前后统一表单协议

## Get Started

### install

```bash
$ yarn add mobx mobx-react mobx-state-tree # add dependencies

$ yarn add @formular/react
# or
$ yarn add @formular/antd
```

## License

[MIT License](./LICENSE)
