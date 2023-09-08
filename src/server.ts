import app from "./app";

const appPort = +process.env.APP_PORT! || 3001;

const runningMsg: string = `Server running on http://localhost:${appPort}`;
app.listen(appPort, async () => {
  console.log(runningMsg);
});
