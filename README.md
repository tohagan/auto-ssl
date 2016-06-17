## Hello SSL App

This project is example code for adding an SSL/TLS front end to any NodeJS / Express app.

It uses the [Let's Encrypt](https://letsencrypt.org/) (LE) service to automatically register free SSL certs!
The example includes a Dockerfile that has also been configured and tested to work with the SE service.

NOTE: This code will register you with the Let's Encrypt online service so make sure you've checked their terms and conditions.

### Configuration

You'll probably want to add this `ssl` section into your existing app configuration:

#### `config.js`

```
module.exports = {
  ssl: {
    enabled: process.env.SSL_ENABLED === 'true',
    redirect: true,             // Redirect non-SSL requests to SSL port.
    email: process.env.SSL_EMAIL, // Contact email for your Let's Encrypt registration.
    domains: process.env.SSL_DOMAINS.split(','), // SSL Domain names
    prod: process.env.SSL_PROD === 'true', // if false, provisions (untrusted) SSL certs that avoid 5 certs/week/domain limit.
    plainPorts: [8080],         // Map to 80
    tlsPorts: [8443, 8001],     // Map to 443 and 5001
    certsDir: '/etc/certs'      // Docker volume if certs are persisted.
    // certsDir: require('os').homedir() + '/.ssl_certs' // Use if developing on OSX/Linux
  }
};
```

## Docker

If you plan to use [Docker](http://docker.com) to deploy your Node app, then these notes might be useful.
I've included a basic [Dockerfile](Dockerfile) that can be used to run your Node app.

### Ports

In general you'd want to run you node app as a non-root process, so I've configured the ports to be > 1024 since lower numbered ports are reserved for root processes. I'm then using Docker to map the app container ports 8080 -> 80, 8443 -> 443 and 8001 -> 5001 on the Docker host.

### /etc/certs - SSL Ceritificate folder

Best practice is to use `docker-compose` to create and share a "data only container" or a "Docker volume" to persist the SSL certificates. However, to use a single Dockerfile I've used these commands to create the a `/etc/certs` directory on the Docker host (or VM) so it can be mounted as a volume by the container.  If you're not using a dedicated Docker VM as your host, you might prefer to configure `certDir` to be `require('os').homedir() + '/.ssl_certs'` .

Create volume mount point for certs with correct permissions:

    $ docker-machine ssh $HOST 'sudo mkdir -p /etc/certs; sudo chown nobody:nogroup /etc/certs; sudo chmod 755 /etc/certs;'

The Production LE service will only permit up to 5 certificates to be registered per week per domain.
So when testing they recommend using their Staging LE service.

To make a backup copy of the SSL certs:

    $ docker-machine scp $HOST:/etc/certs $PWD/certs

#### See Also

- Based on https://github.com/Daplie/letsencrypt-express

As your app scales, you may eventually want to use a nginx front end built with LE support:

- https://github.com/JrCs/docker-letsencrypt-nginx-proxy-companion
