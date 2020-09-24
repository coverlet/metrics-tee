# metrics-tee

Metrics-tee is a simple node.js http service that accepts http requests and forwards them to multiple other endpoints. It was built to send [Solana](https://solana.com/) node metrics to multiple influxdb instances.

## Prerequisites

Make sure you have installed all of the following prerequisites on your development machine:
* [node.js](https://nodejs.org/en/)

```bash
sudo apt install nodejs
```
* [pm2](https://pm2.io/) process manager for Node.js apps (optional)

```bash
npm install pm2 -g
```

## Installation

```bash
git clone https://github.com/coverlet/metrics-tee.git
cd metrics-tee
npm i
```
Rename `config.sample.js` to `config.js` and add all the endpoints that you want the metrics forwarded too:
```js
export const port = 3311
export const endpoints = [
    "https://metrics.solana.com:8086/write?db=netdb&u=user&p=pass&precision=ms",
    "http://yourendpoint.com:8111/write?db=db&u=user&p=pass&precision=ms,
    ...
]
```

## Running

Point solana metrics config env variable to the metrics-tee instance:
```bash
Environment="SOLANA_METRICS_CONFIG=host=http://127.0.0.1:3311,db=a,u=a,p=a"
```
Note that `db=a,u=a,p=a` are not used (you already configured the influxdb config for each endpoint in `config.js`), but if they are not present the node will not export the metrics.

### Run with PM2
Build and start the app with pm2:
```bash
npm run pm2
```
Make sure the process starts on system reboot:
 ```bash
pm2 startup
pm2 save
```

### Run with systemd
Alternatively, you can use systemd service manager to handle app execution. In your `.service` file, use this for ExecStart:
```bash
ExecStart=/usr/bin/node /path/to/metrics-tee/build/index.js
```