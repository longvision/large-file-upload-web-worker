# Processing large reports in the browser

## About

Performance and multithreading in browsers + ECMAScript Modules in Web Workers

This repository lets you run a web worker in a browser and use ECMAScript modules in it.
In this specific application for example, we can filter around 1 million records in a CSV file, searching for a specific term in around 13 seconds without blocking the main thread of the browser.

We can accomplish that by using Webworkers and WebStreams in the browser. This will run the task on the background thread, and will not block the main thread.

## How to run

1. run the following command to install the dependencies:

```bash
$ yarn start
```

2. Open the browser and go to `http://localhost:3000`

3. Select a large csv file. (I used a 1 million records file)

[https://www.kaggle.com/datasets/foenix/slc-crime?select=SLC_Police_Calls_2013__2016_cleaned_geocoded.csv](https://www.kaggle.com/datasets/foenix/slc-crime?select=SLC_Police_Calls_2013__2016_cleaned_geocoded.csv)

4. Type a term to search for in the input field.

5. Click on the `Search` button.

6. Wait for the results to be displayed.



## References for checking browser compatibility:
- https://caniuse.com/?search=workers
