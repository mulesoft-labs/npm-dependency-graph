[![Gitpod - Code Now](https://img.shields.io/badge/Gitpod-code%20now-blue.svg?longCache=true)](https://gitpod.io#https://github.com/mulesoft-labs/npm-dependency-graph)

## Maven Dependency Graph

![Dependency graph of sprotty](https://raw.githubusercontent.com/TypeFox/npm-dependency-graph/master/screenshot.png)

This project renders dependency graphs of maven artifacts. It uses the repository index associated to a maven repository to obtain dependencies metadata, [sprotty](https://github.com/theia-ide/sprotty) for rendering the graphs, and [ELK](https://www.eclipse.org/elk/) for automatic layout. It can be run either as a standalone application with a simple web page or as a [Theia](https://www.theia-ide.org) extension. Theia supports both the web browser and [Electron](https://electronjs.org).

Current version only run againt a local service. Implementation of the service, as well as RAML API can be found at the [dependency graph service](https://github.com/mulesoft-labs/dependency-graph-service)

### Building

You need [Yarn](https://yarnpkg.com/) in order to build this project.

```
$ git clone https://github.com/TypeFox/npm-dependency-graph.git
$ cd npm-dependency-graph
$ yarn
```

### Running as Standalone App

```
$ cd standalone-app
$ yarn start
```

Point your web browser to `http://localhost:3001/`

### Running as Theia App in the Browser

```
$ cd browser-app
$ yarn start
```

Point your web browser to `http://localhost:3000/`

### Running as Theia App with Electron

```
$ yarn rebuild:electron
$ cd electron-app
$ yarn start
```

If you would like to switch back to the browser app, run `yarn rebuild:browser`.
