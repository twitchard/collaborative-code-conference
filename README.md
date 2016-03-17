## Why do I want this?
- Need to do some quick code collaboration with someone remotely?
- Need a simple way to do a remote coding interview?
- Tired of flipping back and forth between Google Hangouts and Google Docs during the interview?
- Don't want to sign-up for or pay for a SaaS interview or web conference platform?

Use this project to create an (almost) free coding web conference in less than 5 minutes.

Most importantly, you don't need to do any local development to use it: click the purple button, configure some stuff, start a conference room, send the URL to the attendee.  That's it!

![Screenshot](http://cl.ly/2w2N0z1H1f3d/Screen%20Shot%202016-03-17%20at%2012.53.45%20AM.png)

## Setup Instructions
Setup will take about 5 minutes the first time.  After the first time, it's about 30 seconds.  

##### 1. Deploy App
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)  

This will deploy the web app to [Heroku](https://www.heroku.com).

##### 2. Configure App
This will walk you through copying and pasting a few [Twilio](https://www.twilio.com) configuration values and, if you don't have one, direct you to create a Twilio account first.

##### 3. Create a conference

##### 4. Share the URL with the attendee

## FAQ
* *What is Heroku?*  
"Heroku is a cloud platform that lets companies build, deliver, monitor and scale apps — we're the fastest way to go from idea to URL, bypassing all those infrastructure headaches." (from https://www.heroku.com/what)

* *What is Twilio?*  
Twilio is "A Messaging, Voice, Video and Authentication API for every application" (from https://www.twilio.com)

* *Is this really free?*  
Well, almost.  This app uses two services -- Heroku and Twilio -- and the total cost will range from $0.0002 (not a typo) to $0.50<sup id="a1">[1](#f1)</sup> for a 60 minute interview with two people.  Cost is pay-as-you-go, i.e. it's related to the length of the interview and the number of participants.  You pay for what you use.  No automatically recurring monthly fee that you'll forget to cancel.
###### Heroku Costs
Heroku provides the hardware the app runs on and makes sure it has no problems.  Heroku allows anyone to run an app for free for 18 hours per day (i.e. it must "sleep" and be unusable for six hours each day).  Here's [Heroku's pricing page](https://www.heroku.com/pricing).
###### Twilio Costs
Twilio helps setup the peer-to-peer connection between interviewer and interviewee and provides some "magic" to ensure it works smoothly.  This magic is where the cost comes in.  Sending peer-to-peer audio and video over the web is not simple because 1) the technology standard used, [WebRTC](https://en.wikipedia.org/wiki/WebRTC), is still pretty new and 2) [NAT](https://en.wikipedia.org/wiki/Network_address_translation), which is used in most home and corporate networks, makes it difficult to establish direct peer-to-peer connections.  Because of these complexities, Twilio pricing is a little less simple to explain.  Here are the relevant pricing pages: [Video Pricing](https://www.twilio.com/video#pricing) and [STUN/TURN Pricing](https://www.twilio.com/stun-turn/pricing).  [TURN](https://en.wikipedia.org/wiki/Traversal_Using_Relays_around_NAT) is the part that could *potentially* bring the cost up to $0.50, which is still not really that bad for a 60 minute video call.  TURN routes the audio and video through a relay server in scenarios where a direct peer-to-peer connection cannot be established.

* *Can I use this for interviewing candidates without worrying about it crashing?*  
Not yet!  But that's because my code has not been fully tested.  However the underlying services provided by Heroku and Twilio are battle-tested and very stable.  Heroku is owned by [Salesforce](https://www.salesforce.com) and, as of writing this (March 2016), serves [8 billion requests per day](https://www.heroku.com/what#trusting-heroku-with-success).  Twilio is the leader in programmable web, SMS, and video communications.  Here is more information about Twilio's [security](https://www.twilio.com/platform/security), [resiliency](https://www.twilio.com/platform/resiliency), and [scalability](https://www.twilio.com/platform/scalability).

* *Can you add Feature X?*  
Check the [open feature requests](https://github.com/crcastle/collaborative-code-conference/labels/enhancement) to see if someone else has already requested Feature X.  If not, [please tell me more](https://github.com/crcastle/collaborative-code-conference/issues/new?title=New%20Feature:%20&labels=enhancement) about what you're looking for and why it would be useful.  If you know Ruby and/or JavaScript, feel free to submit a [pull request](https://github.com/crcastle/collaborative-code-conference/pulls) with the code changes for Feature X and we'll check it out.

* *I found a bug.*  
Please [tell me about it](https://github.com/crcastle/collaborative-code-conference/issues/new?title=Bug:%20&labels=bug) so we can fix it!

Have an unanswered question?  [Ask it here](https://github.com/crcastle/collaborative-code-conference/issues/new?title=Question:%20&labels=question).

<a name="f1"><sup>1</sup></a> Calculation: (1Mb/s audio and video media stream) x (2 streams) x (3600 seconds) x ($0.0004/MB / 8Mb/MB) = $0.36 "rounds up to" $0.50 [↩](#a1)

## Inspiration and Thanks
* [Talky.io](https://talky.io)
* [UberConference](https://www.uberconference.com)

## Contributing
[![Build Status](https://travis-ci.org/code-interview/oneclick-backend.svg?branch=master)](https://travis-ci.org/code-interview/oneclick-backend) [![Code Climate](https://codeclimate.com/github/code-interview/oneclick-backend/badges/gpa.svg)](https://codeclimate.com/github/code-interview/oneclick-backend) [![Issue Count](https://codeclimate.com/github/code-interview/oneclick-backend/badges/issue_count.svg)](https://codeclimate.com/github/code-interview/oneclick-backend) [![Test Coverage](https://codeclimate.com/github/code-interview/oneclick-backend/badges/coverage.svg)](https://codeclimate.com/github/code-interview/oneclick-backend/coverage)

## License

## TODO
* [x] Prototype collaborative coding page
* [ ] Define setup flow (instructions/about homepage)
* [x] Define join flow
* [x] Style
* [x] Add sexy screenshot to README
* [ ] Add sexier screenshot to README
* [ ] Add input box for user to provide name before sending video invite
* [ ] Add buttons to increase and decrease editor font size
* [ ] Add button to 'save to gist'
* [ ] Write tests
* [ ] Add project logo to app.json and README
* [ ] Add a LICENSE
* [ ] Add CONTRIBUTING guidelines
* [ ] Add codeclimate coverage badge to README
* [ ] Configure Travis and add badge to README
* [ ] Clean-up dead code
