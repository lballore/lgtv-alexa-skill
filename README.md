# Startguide - lgtv-alexa-skill
## Node.js bridge for LG Smart TV and Amazon Alexa

### Software equirements
- node.js
- npm

### To run
- Enter your TV's MAC address and IP address into config.json
- `npm install`
- `node index.js`

### To do on the first run
- Be sure your Alexa-ready device is up and running
- On your TV, make sure that _TV Mobile On_ (General settings) is set to ON
- On your TV, make sure that _LG Connect Apps_ (Network settings) is set to ON
- Add the devices using the Alexa app (`Settings -> Smart Home -> Add Device `)
- Wait about a minute, then say "Alexa turn TV on/off" or "Alexa start/stop [app name]"
- **The first time, turning on/off the TV will ask for permission.** Just confirm the pairing and your bridge is ready!

### Functions
**Alexa bridge**
`node index.js` - Makes the vocal commands for TV and apps available

**Toast**
`node index.js toast "[your message]"` - Display a toast message on your TV

**Apps list**
`node index.js appslist` - Display all the apps installed on your Smart TV and provides some useful info (appID etc.)

**Service list**
`node index.js serviceslist` - Display a list of the available services and theirs API

### Available commands
**Turn tv on/off**: "Alexa, turn TV [on|off]"
**Start/stop application**: "Alexa, \[start|stop\] \[your app\]"

### Available applications
- Netflix
- YouTube
- Broadcasting (LiveTV)

### Thanks to
[hobbyquacker, lgtv2 library](https://github.com/hobbyquaker/lgtv2)
[neil-morrison-44, forked project](https://github.com/neil-morrison44/lg-alexa-node)



