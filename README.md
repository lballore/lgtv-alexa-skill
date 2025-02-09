# Startguide - lgtv-alexa-skill
Node.js bridge for LG Smart TV and Amazon Alexa

## Software requirements
- node >= 14
- Docker (for the dev container)

## Working environment
It's recommended to make use of the `.devcontainer` to have all the needed tools and libraries available without the need to set them up manually.
Just run in in VSCode or any other IDE supporting dev containers.

In alternative, proceed to setup a local node environment, with the constraint listed above.

## To run
- Enter your TV's MAC address and IP address into `tv_data.json`
- `npm install`
- `node index.js alexa`

### To do during the first run
- Be sure your Alexa-ready device is up and running
- On your TV, make sure that _TV Mobile On_ (General settings) is set to ON
- On your TV, make sure that _LG Connect Apps_ (Network settings) is set to ON
- Add the devices using the Alexa app (`Settings -> Smart Home -> Add Device `)
- Wait about a minute, then say "Alexa turn TV on/off" or "Alexa start/stop [app name]"
- **The first time, turning on/off the TV will ask for permission.** Just confirm the pairing and your bridge is ready!

## Functions
**Alexa bridge**<br/>
`node index.js alexa` - Makes the vocal commands for TV and apps available

**Toast**<br/>
`node index.js toast "[your message]"` - Display a toast message on your TV

**Apps list**<br/>
`node index.js appslist` - Display all the apps installed on your Smart TV and provides some useful info (appID etc.)

**Service list**<br/>
`node index.js serviceslist` - Display a list of the available services and theirs API

**Status**<br/>
`node index.js status` - Display the TV status (ON or OFF), and if ON, shows the application in use

**Application status**<br/>
`node index.js appstatus [app ID]` - Display the status of the application specified by an ID

**Mute on/off**<br/>
`node index.js mute [true|false]` - Mute/Unmute your TV

**Turn TV on/off**<br/>
`node index.js [tvon|tvoff]` - Turn the TV on or off

### Available vocal commands
- **Turn tv on/off**: "Alexa, turn TV [on|off]"
- **Start/stop application**: "Alexa, turn \[on|off\] \[your app\]" or "Alexa,\[start|stop\] \[your app\]"
- **Mute/unmute tv**: "Alexa, turn _muting mode_ \[on|off\]"

### Available applications
- Netflix
- YouTube
- Broadcasting (LiveTV)

### Add your application
It's possible to add your own application if you know the appID (and if you don't just run the `appslist` command to get a list).
Add your application on `apps.json`, restart the Alexa bridge and run the device discovery on Alexa app on your mobile or at the
[Alexa website](https://alexa.amazon.com).

## Run as a standalone service
It's possible to run this bridge as a standalone application and, for example, as a service in your own linux server, running in your network together with your TV.

To do so, compile the application by running `./build:app.sh <node-environment>`. Then move your executable where needed and prepare the service file for systemctl. Example:

```
[Unit]
Description=LGTV backend service for integration with Amazon Alexa
After=network.target
StartLimitIntervalSec=1

[Service]
Type=simple
Restart=always
RestartSec=3
ExecStart=/usr/bin/lgtv alexa // suppose that the executable file is on /usr/bin

[Install]
WantedBy=multi-user.target
```

and save it with a meaningful name, like `lgtv.service` in the folder `etc/systemd/system` for example.

Then run:

- `sudo systemctl daemon-reload`
- `sudo systemctl enable lgtv.service`
- `sudo systemctl restart lgtv.service`

You shall be able to see the status by executing `sudo systemctl status lgtv.service`

## Thanks to
- [hobbyquacker, lgtv2 library](https://github.com/hobbyquaker/lgtv2)
- [neil-morrison-44, forked project](https://github.com/neil-morrison44/lg-alexa-node)
