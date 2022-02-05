# Meetimely

![Chrome Web Store](https://img.shields.io/chrome-web-store/users/aenhmmfelkmdlihmaiblnhdmfopmbonc?color=%2310c77e&label=current%20users)

An extension to open meet URLs(or any links) at scheduled times

## Installing

Install it from [Chrome Web Store](https://chrome.google.com/webstore/detail/meetimely/aenhmmfelkmdlihmaiblnhdmfopmbonc?hl=en-GB&authuser=0)

------
If you are skeptical about whether the same code is on the Chrome Web Store you can follow the below steps instead:

If you have git installed, run `git clone https://github.com/Akshat-Oke/meet-scheduler`

If you don't have git, download these files as ZIP (click `Code`(green button) and then "Download ZIP" in the dropdown above on this page), extract them into your desired folder and follow these steps:

1. Go to [chrome://extensions/](chrome://extensions/)
2. Turn on "Developer Mode" at the top right
3. Click on `Load Unpacked`
4. Select the folder in which you extracted (or cloned) this repository
5. Enjoy!


What is Meetimely
-----------------

Meetimely (Meet + timely) allows you to set your lecture meeting links to open them automatically at specified times.

> No more fumbling around in your email/chats/notes to find that link. Just set it once and attend lectures/meetings hassle-free!

### Google Meet

Meetimely can open Google Meet links and also join the meet after muting yourself and switching off your camera automatically

Send quick pre-set message (Ex. Attendance/ Submission) with one click!

> Press the "Quick Message" button that floats in the Google Meet tab

Get Started
-----------

Press the plus icon button to add a new meeting. Meeting names (subjects) must be **unique**. Add the meeting link or the Google Meet code (xxx-yyyy-zzz) and choose your days and times

> All meetings are assumed to repeat weekly

Choosing times:

#### Repeat

Select the days and set the time below. This will open the meeting on the same time for the selected days

Ex. Mon, Wed, Fri 3:00 PM

#### Custom

If your meeting/lectures are not at the same time for the scheduled days in a week, you can set the times for each day individually. Leave blank if there's no meeting

### Open meets ahead of time

It's always good to be early. You don't have to put awkward times like `10:57AM` or `3:28PM` instead of cleaner `11:00AM`. Set how many minutes a meet should open ahead of scheduled time in the settings page.

Share and Sync
--------------

#### Share individual subjects

Click the share icon _share_ in the timeline view to display the JSON encoded information. You can now send this JSON text to anyone else who also uses Meetimely.

##### Importing JSON

If someone sends you the subject information as JSON, click the [Import JSON _download_](#import-subject)option in the sidebar and paste the JSON.

#### Save all subjects online

Click the [Share/sync](http://jeenius.gq/meetimely) option in the sidebar. On the next page you can see and delete your subjects to save online.

##### Importing subjects saved online

Once you save your subjects/meetings online on the previous, you get a link which you can share with other people. Opening such a link allows you to import those subjects into Meetimely with ease.

> If any of the subjects being imported have the same name as existing subjects, they will be overwritten.

Editing
-------

In the timeline view, click the pencil icon  to edit the meeting details.

To temporarily disable a scheduled meeting, click the tick-mark to the left. Meetings disabled won't open unless you manually enable them
