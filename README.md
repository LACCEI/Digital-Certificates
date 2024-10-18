# Digital Certificates Service
Digital Certificates Service is a versatile tool designed to automate the creation of digital certificates. It offers a flexible interface that allows integration with various front-end applications and output plugins, enabling seamless certificate generation and management.

**Key Features**:
- **Template-based generation**: Easily customize certificates using predefined templates.
- **Data-driven output**: Populate certificates with dynamic data to meet specific requirements.
- **Flexible integration**: Interact with the service through a well-defined API.
- **Versatile output options**: Deliver certificates to email, cloud storage, or other destinations.

## Setup & Development
### Prerequisites
- NodeJS
- NPM

Then, install the dependencies.
```
npm install
```

### Documentation
Read the documentation to get started. It provides the design and concepts necessary to work on the project.
```
npm run docs
```

A local server for the documentation will start. Visit [127.0.0.1:8080](http:127.0.0.1:8080) to get started.

### Style and Testing
Always use Prettier before pushing code to ensure a compatible code style.

```
npm run prettier
```

Similarly, follow good practices by writing tests (using [Jest](https://jestjs.io/)) and running them before merging code into the main branch.
```
npm run test
```