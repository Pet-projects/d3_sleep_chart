# tdl-reports


# Setup

## D3

Download `D3` library and place it in `./lib`
https://d3js.org/

Download the `require1k` library and place it in `./lib`
http://stuk.github.io/require1k/

## Typescript

Add typescript to npm
```
npm init
npm install --save-dev typescript
```

The typings are only needed by the compiler so we only need them in the node nodules
```
npm install @types/d3 --save-dev
```

# Create a `tsconfig.json` file that looks like this:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es5",
    "noImplicitAny": false,
    "sourceMap": true,
    "inlineSources": true,
    "outDir": "dist/"
  },
  "exclude": [
    "node_modules"
  ]
}
```

Configure IntelliJ to compile Typescript. Do not use the TypeService as it will cause issues with the types detected


## Folder structure

Create:
```
dist/
src/
```

Add both `.html` and `.ts` to a `src` folder. Intellij will automatically compile to .ts


## Gulp build system

Install all dependencies:
```
npm install
```

Compile and bundle for local development:
```
gulp
```

Compile, bundle and minify for distribution:
```
NODE_ENV=production gulp
```

Watch for changes and automatically run build tasks:
```
gulp watch
```

## Running tests

https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker

Build test image:
```
docker build -t tdl-reports-test -f Dockerfile.test .
```
Run tests:
```
docker run --rm tdl-reports-test
```
Run tests with `-v` flag to see tests output by mapping container volume to host directory:
```
docker run -v //c/Users/Public/tdl-reports/tests_output://usr/tdl-reports/tests_output --rm tdl-reports-test
docker run -v /Users/julianghionoiu/Documents/Work/Projects/tdl/tdl-reports/xyz/tests_output://usr/tdl-reports/tests_output --rm tdl-reports-test
```
Remove the test image (cleanup):
```
docker rmi tdl-reports-test
```

# Links

- D3 and Typescript: https://hstefanski.wordpress.com/2015/06/07/creating-a-chart-with-d3-and-typescript-part-1/
- About selections: https://github.com/d3/d3-selection/issues/86

# Deploy

To deploy, just sync the dist folder with the corresponding S3 bucket
```
aws s3 sync . s3://report.accelerate.io/FIZ/anon
```