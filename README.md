<img src="https://raw.githubusercontent.com/crcastle/collaborative-code-conference/master/build/client/img/codie.png" width="100px">
## Why do I want this?
- Need to do some quick code collaboration with someone remotely?
- Need a simple way to do a remote coding interview?
- Tired of flipping back and forth between Google Hangouts and Google Docs during the interview?
- Don't want to sign-up for or pay for a SaaS interview or web conference platform?

Use this project to create an (almost) free coding web conference in less than 5 minutes.

Most importantly, you don't need to do any local development to use it: click the purple button, configure some stuff, start a conference room, send the URL to the attendee.  That's it!

![Screenshot](https://raw.githubusercontent.com/crcastle/collaborative-code-conference/master/build/client/img/code-editor-screenshot.png)

## Setup Instructions
Setup will take about 5 minutes the first time.  After the first time, it's about 30 seconds.  

##### 1. Deploy app
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)  

This will deploy the web app to [Heroku](https://www.heroku.com).

##### 2. Configure app
This will walk you through generating and pasting a few [Twilio](https://www.twilio.com) configuration values and, if you don't have one, direct you to create a Twilio account first.

##### 3. Create conference
After Heroku has finished deploying the app, click the button to view it.  From there choose a name for your code conference (or use the random suggestion) and click 'Create New Code Conference'.

You can create as many code conferences as you like.

##### 4. Share URL
Share the URL with the person you want to collaborate with.  Anyone that visits that URL will see the same code that you see.  Any edits you or your collaborator make will be shared in real-time.

##### 5. Connect video
If two people are viewing a code conference URL, one of you can click 'Connect Video' to establish a peer-to-peer audio and video WebRTC connection between your browsers.  The other side will be prompted by and must accept the invitation.

## FAQ
* *What is Heroku?*  
"Heroku is a cloud platform that lets companies build, deliver, monitor and scale apps — we're the fastest way to go from idea to URL, bypassing all those infrastructure headaches." (from https://www.heroku.com/what)

* *What is Twilio?*  
Twilio is "A Messaging, Voice, Video and Authentication API for every application" (from https://www.twilio.com)

* *Is this really free?*  
Well, almost.  This app uses two services -- Heroku and Twilio -- and the total cost will range from $0.0002 (not a typo) to $0.50<sup id="a1">[1](#f1)</sup> for a 60 minute conference with two people.  Cost is pay-as-you-go, i.e. it's related to the length of the conference and the number of participants.  You pay for what you use.  No automatically recurring monthly fee that you'll forget to cancel.
###### Heroku Costs
Heroku provides the hardware the app runs on and makes sure it has no problems.  Heroku allows anyone to run an app for free for 18 hours per day (i.e. it must "sleep" for six hours each day).  If you need more you can upgrade your app's plan.  Here's [Heroku's pricing page](https://www.heroku.com/pricing).
###### Twilio Costs
Twilio helps setup the peer-to-peer connection between interviewer and interviewee and provides some "magic" to ensure it works smoothly.  This magic is where the cost comes in.  Sending peer-to-peer audio and video over the web is not simple because 1) the technology standard used, [WebRTC](https://en.wikipedia.org/wiki/WebRTC), is still pretty new and 2) [NAT](https://en.wikipedia.org/wiki/Network_address_translation), which is used in most home and corporate networks, makes it difficult to establish direct peer-to-peer connections.  Because of these complexities, Twilio pricing is a little less simple to explain.  Here are the relevant pricing pages: [Video Pricing](https://www.twilio.com/video#pricing) and [STUN/TURN Pricing](https://www.twilio.com/stun-turn/pricing).  [TURN](https://en.wikipedia.org/wiki/Traversal_Using_Relays_around_NAT) is the part that could *potentially* bring the cost up to $0.50, which is still not really that bad for a 60 minute video call.  TURN relays the audio and video between peers in scenarios where a direct peer-to-peer connection cannot be established.

* *Can I use this for interviewing candidates without worrying about it crashing?*  
Not yet!  But that's because my code has not been fully tested.  However the underlying services provided by Heroku and Twilio are battle-tested and very stable.  Heroku is owned by [Salesforce](https://www.salesforce.com) and, as of writing this (March 2016), serves [8 billion requests per day](https://www.heroku.com/what#trusting-heroku-with-success).  Twilio is the leader in programmable web, SMS, and video communications.  Here is more information about Twilio's [security](https://www.twilio.com/platform/security), [resiliency](https://www.twilio.com/platform/resiliency), and [scalability](https://www.twilio.com/platform/scalability).

* *Can you add Feature X?*  
Check the [open feature requests](https://github.com/crcastle/collaborative-code-conference/labels/enhancement) to see if someone else has already requested Feature X.  If not, [please tell me more](https://github.com/crcastle/collaborative-code-conference/issues/new?title=New%20Feature:%20&labels=enhancement) about what you're looking for and why it would be useful.  If you know JavaScript and/or Node.js, feel free to submit a [pull request](https://github.com/crcastle/collaborative-code-conference/pulls) with the code changes for Feature X and I'll check it out.

* *I found a bug.*  
Please [tell me about it](https://github.com/crcastle/collaborative-code-conference/issues/new?title=Bug:%20&labels=bug) so I can fix it!

Have an unanswered question?  [Ask it here](https://github.com/crcastle/collaborative-code-conference/issues/new?title=Question:%20&labels=question).

<a name="f1"><sup>1</sup></a> Calculation: (1Mb/s audio and video media stream) x (2 streams) x (3600 seconds) x ($0.0004/MB / 8Mb/MB) = $0.36 "rounds up to" $0.50 [↩](#a1)

## Inspiration
* [Talky.io](https://talky.io)
* [UberConference](https://www.uberconference.com)
* [Hive.js](http://hivejs.org)
* Google technical interviews

## Thanks
* [Marcel Klehr](https://github.com/marcelklehr) for [gulf](https://github.com/marcelklehr/gulf) and [gulf-codemirror](https://github.com/marcelklehr/gulf-codemirror)
* [Joseph Gentle](https://github.com/josephg) and [Devon Govett](https://github.com/devongovett) for [Operational Transformation types](https://github.com/ottypes/text) and [useful docs](https://github.com/ottypes/docs)
* [Marijn Haverbeke](https://github.com/marijnh) for [CodeMirror](http://codemirror.net)

## Contributing
[![Build Status](https://travis-ci.org/crcastle/collaborative-code-conference.svg?branch=master)](https://travis-ci.org/crcastle/collaborative-code-conference) [![Code Climate](https://codeclimate.com/github/crcastle/collaborative-code-conference/badges/gpa.svg)](https://codeclimate.com/github/crcastle/collaborative-code-conference) [![Issue Count](https://codeclimate.com/github/crcastle/collaborative-code-conference/badges/issue_count.svg)](https://codeclimate.com/github/crcastle/collaborative-code-conference) [![Test Coverage](https://codeclimate.com/github/crcastle/collaborative-code-conference/badges/coverage.svg)](https://codeclimate.com/github/crcastle/collaborative-code-conference/coverage)

## License
MIT

See [LICENSE](LICENSE)
