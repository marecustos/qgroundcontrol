import QtQuick          2.3
import QtQuick.Window   2.2
import QtQuick.Controls 1.2

import QGroundControl               1.0
import QGroundControl.Palette       1.0
import QGroundControl.Controls      1.0
import QGroundControl.Controllers   1.0
import QGroundControl.ScreenTools   1.0

Rectangle {
    id:     setupViewPayload
    color:  qgcPal.window

    PayloadController {
        id: payload_controller
    }

    focus: true
    TextInput {
        id: textInput
        anchors.centerIn: parent
        width: 800
        height: 600
        color: "white"
        font.pixelSize: 16
        focus: true

        Keys.onPressed: {
            console.log("Key pressed:", event.key)
            var keyNumber = parseInt(event.key)
            if (!isNaN(keyNumber)) {
                // Use keyNumber as an integer
                payload_controller.sendKeyboardCommand(keyNumber)
            } else {
                console.log("Invalid key number:", event.key)
            }
        }
    }
    Component.onCompleted: {
        console.log("Rectangle completed")
        payload_controller.debug()
    }
}
