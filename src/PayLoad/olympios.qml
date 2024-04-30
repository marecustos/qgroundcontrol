import QtQuick          2.3
import QtQuick.Window   2.2
import QtQuick.Controls 1.2

import QGroundControl               1.0
import QGroundControl.Palette       1.0
import QGroundControl.Controls      1.0
import QGroundControl.Controllers   1.0
import QGroundControl.ScreenTools   1.0
import QtWebEngine 1.0

Rectangle {
    id:     setupViewPayload
    QGCPalette { id: qgcPal }
    color:  qgcPal.window

    WebEngineView {
            anchors.fill: parent
            url: "qrc:///jsqml/client.html"
        }
}