#include "payload.h"
#include "QGCApplication.h"
#include <QDebug>
#include "Vehicle.h"
#include "MultiVehicleManager.h"
#include "LinkManager.h"

QGC_LOGGING_CATEGORY(PayloadControllerLog, "PayloadControllerLog")

PayloadController::PayloadController(void) 
    :_vehicle(nullptr),
    _toolbox(qgcApp()->toolbox())
{

    qCDebug(PayloadControllerLog) << "started payload";
    MultiVehicleManager *manager = qgcApp()->toolbox()->multiVehicleManager();
    connect(manager, &MultiVehicleManager::activeVehicleChanged, this, &PayloadController::_setActiveVehicle);
    _setActiveVehicle(manager->activeVehicle());
    _link_manager = _toolbox->linkManager();
}
void PayloadController::debug(void) {qCDebug(PayloadControllerLog) << "started payload";}
void
PayloadController::_setActiveVehicle(Vehicle* vehicle)
{
    qCDebug(PayloadControllerLog) << "setting Vehicle in Payload Class";
    _vehicle = vehicle;
    connect(_vehicle, &Vehicle::payloadStatusChanged, this, &PayloadController::handlePayloadStatusChanged);
    connect(_vehicle, &Vehicle::connectedPayloadChanged, this, &PayloadController::handleConnectedPayloadChanged);
}

bool PayloadController::sendPayloadMessageOnLinkThreadSafe(LinkInterface* link, mavlink_message_t message)
{
    if (!link->isConnected()) {
        qCDebug(VehicleLog) << "sendPayloadMessageOnLinkThreadSafe" << link << "not connected!";
        return false;
    }

    // Write message into buffer, prepending start sign
    uint8_t buffer[MAVLINK_MAX_PACKET_LEN];
    int len = mavlink_msg_to_send_buffer(buffer, &message);

    link->writeBytesThreadSafe((const char*)buffer, len);
    return true;
}
void PayloadController::sendControlCommand(const QString& target ,int value)
{
    QByteArray ba = target.toLocal8Bit();
    const char *targetCommand = ba.data();
    if (!_link_manager->payloadLink()) {
        qCDebug(PayloadControllerLog) << "send keyboard: primary link gone!";
        return;
    }
    qCDebug(PayloadControllerLog) << "trying to send ...";
    mavlink_message_t msg;
    mavlink_msg_custom_payload_control_pack(
        qgcApp()->toolbox()->mavlinkProtocol()->getSystemId(),
        qgcApp()->toolbox()->mavlinkProtocol()->getComponentId(),
        &msg,
        targetCommand,
        value
    );
    this->sendPayloadMessageOnLinkThreadSafe(_link_manager->payloadLink(), msg);
    qCDebug(PayloadControllerLog) << "command sent msg"<<msg.msgid;
}

void PayloadController::sendPayloadNameRequest(int payload_id , const QString& payload_name , const QString& payload_state , int result  )
{
    QByteArray temp;
    temp = payload_name.toLocal8Bit();
    const char *name = temp.data();

    temp = payload_state.toLocal8Bit();
    const char *state = temp.data();

    if (!_link_manager->payloadLink()) {
        qCDebug(PayloadControllerLog) << "payload name request: primary link gone!";
        return;
    }

    mavlink_message_t msg;
    mavlink_msg_connected_payload_ack_pack(
        qgcApp()->toolbox()->mavlinkProtocol()->getSystemId(),
        qgcApp()->toolbox()->mavlinkProtocol()->getComponentId(),
        &msg,
        payload_id,
        name,
        state,
        result
    );

    this->sendPayloadMessageOnLinkThreadSafe(_link_manager->payloadLink(), msg);
    //qCDebug(PayloadControllerLog) << "payload Name Resuest sent"<<msg.msgid;

}

QVariantMap PayloadController::payloadStatus() const
{
    return m_payloadStatus;
}

void PayloadController::handlePayloadStatusChanged(const mavlink_custom_payload_control_t &payloadStatus)
{
    qCDebug(PayloadControllerLog) << "recieved payload status "<< payloadStatus.command_target<< " with value "<<payloadStatus.command_value;
    // Update the QVariantMap with the new payload status
    m_payloadStatus[payloadStatus.command_target] = payloadStatus.command_value;
    // Emit the payloadStatusChanged signal to notify QML of the changes
    emit payloadStatusChanged();
}

void PayloadController::handleConnectedPayloadChanged(const mavlink_connected_payload_t &connectedPayload)
{
    QString linux_kernel_version = "linux_kernel_version";
    QString payload_software_version = "payload_software_version";
    QString companion_software_version = "companion_software_version";
    QString payloadName = QString::fromUtf8(connectedPayload.payload_name);
    //qCDebug(PayloadControllerLog) << "recieved payload connected "<< payloadName;
    if (_activePayloadName != connectedPayload.payload_name && connectedPayload.payload_name != linux_kernel_version && connectedPayload.payload_name != payload_software_version && connectedPayload.payload_name != companion_software_version) {
        _activePayloadName = connectedPayload.payload_name;
        emit activePayloadNameChanged();
    }
    else if (connectedPayload.payload_name == linux_kernel_version || connectedPayload.payload_name == payload_software_version || connectedPayload.payload_name == companion_software_version){
        //since using mavlink is temp and we won't stick with it , i used this ready message to send software informations (even it's not designed for that purpose)
        qCDebug(PayloadControllerLog) << "recieved Software informations "<< payloadName;
        m_payloadStatus[payloadName] = connectedPayload.payload_state;
        // Emit the payloadStatusChanged signal to notify QML of the changes
        emit payloadStatusChanged();
    }

}