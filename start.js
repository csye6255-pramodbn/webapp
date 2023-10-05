const app = require('./index');
const listen_Port = process.env.PORT;
//const PORT = 8080;

app.listen(listen_Port, () => {
  console.log(`Server is listening on http://localhost:${listen_Port}`);
});
