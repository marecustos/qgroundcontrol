import QtQuick          2.3
import QtQuick.Window   2.2
import QtQuick.Controls 1.2

import QGroundControl               1.0
import QGroundControl.Palette       1.0
import QGroundControl.Controls      1.0
import QGroundControl.Controllers   1.0
import QGroundControl.ScreenTools   1.0

Button {
    property string targetCommand: ""
    property int valueCommand: 0
    id : customButton


    width  : 35
    height : 35
    
    Timer {
        id: clickTimer
        interval: 100  // Adjust the interval as needed
        repeat: true
        running: false

        onTriggered: {
            // Emit signal when the timer triggers
            controlButtonPressed(targetCommand, valueCommand)
            console.log("triggering")
        }
    }

    Rectangle {
        anchors.fill: parent
        radius: 2 // Set rounded corners
        color : "transparent"
        id : customButtonRectangle
        
        Text {
            anchors.centerIn: parent
            text: valueCommand > 0 ? "+" + valueCommand : valueCommand
            color: "black" // Set the text color
        }
        MouseArea {
            id: mouseAreaZone
            anchors.fill: parent
            onPressed: {
                // Start the timer when the mouse area is pressed
                customButtonRectangle.color = qgcPal.colorGrey
                clickTimer.restart()

            }

            onReleased: {
                // Stop the timer when the mouse area is released
                customButtonRectangle.color ="transparent"
                clickTimer.stop()
            }
        }
    }   
    onJoystickClicked: {
        //console.log("Button state:", buttonState)
        if (buttonState){
            customButtonRectangle.color = qgcPal.colorGrey
            controlButtonPressed(targetCommand, valueCommand)
            clickTimer.restart()
        }
        else{
            customButtonRectangle.color ="transparent"
            clickTimer.stop()
        }
    }
    // Define the custom signals
    signal controlButtonPressed(string targetCommand, int valueCommand)
    signal joystickClicked(int buttonState)
}
