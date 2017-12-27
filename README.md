# Startguide - lgtv-alexa-skill
## Node.js bridge for LG Smart TV and Amazon Alexa

### Software requirements
- node.js
- npm

### To run
- Enter your TV's MAC address and IP address into config.json
- `npm install`
- `node index.js alexa`

### To do on the first run
- Be sure your Alexa-ready device is up and running
- On your TV, make sure that _TV Mobile On_ (General settings) is set to ON
- On your TV, make sure that _LG Connect Apps_ (Network settings) is set to ON
- Add the devices using the Alexa app (`Settings -> Smart Home -> Add Device `)
- Wait about a minute, then say "Alexa turn TV on/off" or "Alexa start/stop [app name]"
- **The first time, turning on/off the TV will ask for permission.** Just confirm the pairing and your bridge is ready!

### Functions
**Alexa bridge**<br/>
`node index.js` - Makes the vocal commands for TV and apps available

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

### Available applications
- Netflix
- YouTube
- Broadcasting (LiveTV)

### Add your application
It's possible to add your own application if you know the appID (and if you don't just run the `appslist` command to get a list).
Add your application on `apps.json`, restart the Alexa bridge and run the device discovery on Alexa app on your mobile or at the 
[Alexa website](https://alexa.amazon.com).

### Thanks to
- [hobbyquacker, lgtv2 library](https://github.com/hobbyquaker/lgtv2)
- [neil-morrison-44, forked project](https://github.com/neil-morrison44/lg-alexa-node)



