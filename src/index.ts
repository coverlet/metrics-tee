import http from "http"
import https from "https"
import urlParser from "url"
//@ts-ignore
import { endpoints, port } from "../config.json"

const parsedEndpoints: http.ClientRequestArgs[] = endpoints.map((endpoint: string) => {
    const urlOptions = urlParser.parse(endpoint)
    return {
        ...urlOptions,
        agent:
            urlOptions.protocol === "https:"
                ? new https.Agent({ keepAlive: true })
                : new http.Agent({ keepAlive: true }),
    }
})

http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    const { method, headers } = req

    const requests: http.ClientRequest[] = parsedEndpoints.map((options) => {
        const { agent, hostname, path, port, protocol, auth } = options

        return http
            .request({
                agent,
                host: hostname,
                path,
                port,
                protocol,
                auth,
                method,
                headers: { ...headers, host: `${hostname}:${port}`},
            })
            .on("error", (err: any) => {
                console.error((new Date()).toISOString() + ' ' + hostname, err)
            })
            .on("response", (r: any) => {
                console.log((new Date()).toISOString() 
                    + ` ${hostname}: ${r.statusCode} ${r.statusMessage} x-request-id=${r.headers['x-request-id']}`
                    + ` x-influxdb-build=${r.headers['x-influxdb-build']} x-influxdb-version=${r.headers['x-influxdb-version']} ${r.headers['x-influxdb-error'] ? "x-influxdb-error=" + r.headers['x-influxdb-error'] : ''}`)
            })
    })

    req.on("data", (chunk: any) => {
        requests.forEach((request: http.ClientRequest) => {
            request.write(chunk)
        })
    }).on("end", () => {
        requests.forEach((request: any) => {
            request.end()
        })
    })

    res.writeHead(200)
    res.end()
}).listen(port)

console.log(`Server running at http://127.0.0.1:${port}/`)
