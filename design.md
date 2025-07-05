# Developer Notes

A minimal website project with a Node.js backend (Express) and a static frontend.

## Features
- Node.js backend using Express
- Serves static files from `public/`
- Minimal frontend (HTML/CSS/JS)

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the server:
   ```sh
   npm start
   ```
3. Open your browser at [http://localhost:3000](http://localhost:3000)

## Project Structure
- `server.js` — Main Node.js backend (Express)
- `public/` — Static frontend files (HTML, CSS, JS)

## Page layout
Top bar with Home on left search in the middle and login/sign up on the right

The main page has 
* a 1/3 column on left with a calendar.
* a 2/3 main column
  * location and search terms
  * Listing of events ordered by start time

# User Types

## Standard Users (not logged in)

1. See a list of events

## Standard Users (logged in)

1. User log in
2. Website looks up user information from database such as
   1. Location
   2. Default search terms (tags, distance, day of week, favorite hosts)

Standard Users can
1. Rate organizers
2. Rate events
3. Report events/organizers as not being in keeping the the policy including charging for events without making that clear.

## Community Builder

These are users who add events. Events need to be checked by a moderator before they are published.

## Moderator

* approve events 
* can add events themselves that will not need to moderated. 
* add meeting subgroups
* can remove events that do not meet the policy of EastHertsLocalMeet

## Admin

Can do everything moderators can do

Can add/remove Moderators

# Databases

## Events

  * EventID
  * Date
  * Title
  * Location
  * Member only?
  * Group tags e.g. Everyone; older people; parents&kids
  * Category tags e.g. 
  * Description
  * Contact person or organization
  * Contact details
  * Direct contact or via website contact
    * via website will make it easy for the organizer to remove themself
  * Cost
  * Users who want to go (private)

## Group tags
 
 * Name
 * Description

## Category tags
 * Name
 * Description 

## Users
 * UserID
 * Name
 * Date joined
 * Location
 * Search group tags
 * Search category tags
 * Days&times of interest (e.g. Only weekends and evenings)
 * Events reviewed
 * Events registered interest
 * Events attended
 