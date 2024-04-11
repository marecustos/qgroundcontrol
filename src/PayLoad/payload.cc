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