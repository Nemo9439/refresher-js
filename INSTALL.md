# Development 
## Installation And Configuration

Follow the [README](README.md)

## How to run the script locally during development?
The project constains several demo applications that you can test locally on.
Each of the applications are importing the `refresher.js` that is should be running locally.

### Follow the steps below: 
  - start the `refresher.js` locally
```bash
$ npm run start
```

 - start the angular-demo project locally 
 ```bash
$ npm run angular-demo
```

- open the running application on your browser `http://127.0.0.1:8080/` and leave it open

- perform a code change on the application  
for example: change the version text [here](./demo/angular-demo/src/app/app.component.html)

- build the demo application locally
 ```bash
  $ cd demo/angular-demo
  $ npm run build
```

 - reopen the application tab from earlier and perform a mouse click or tab change (to simulate active user)
 - the notification should now appear
