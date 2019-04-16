***CLASSPAL***

&nbsp;README

&nbsp;HOW TO SET UP THE SYSTEM

&nbsp;**CLIENT**

&nbsp;Connect phone to laptop/computer using a usb cable

&nbsp;Change directory into the FrontEnd folder in the command line

&nbsp;Run react-native run-android

&nbsp;**it might be necessary to run react-native link to link all dependencies**

&nbsp;In order to access the server, go to the globalVars.js file in the src folder
and insert in your IP address so that the applicaiton can contact the server


&nbsp;**SERVER**

&nbsp;Change directory into BackEnd folder in cmd

&nbsp;CD into venv/Scripts and run activate.bat (this activates the Python virtual environment)

&nbsp;CD back out into main BackEnd folder

&nbsp;Run "set FLASK_APP=server.py" to let venv know which application is Flask main app

&nbsp;to run server, run command "flask run --host 0.0.0.0"

&nbsp;**DATABASE**

&nbsp;thats all done, the create script is in the DatabaseConfig file to show the create table statements used and how the database was laid out
