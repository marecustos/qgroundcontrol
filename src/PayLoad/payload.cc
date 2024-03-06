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
    SharedLinkInterfacePtr sharedLink;
    bool exist = false;
    for (const auto& link : _link_manager->links()) {
        if(link->linkConfiguration()->name() == "Payload") {
            exist = true;
            sharedLink = link ;
        }
    }
    qCDebug(PayloadControllerLog) <<"exist ? "<<exist;
    if ( exist ) {
        QByteArray ba = target.toLocal8Bit();
        const char *targetCommand = ba.data();
        //qCDebug(PayloadControllerLog) <<"shared link ? "<<sharedLink->linkConfiguration()->name();
        if (!sharedLink) {
            qCDebug(PayloadControllerLog) << "send keyboard: primary link gone!";
            return;
        }
        mavlink_message_t msg;
        mavlink_msg_custom_payload_control_pack(
            qgcApp()->toolbox()->mavlinkProtocol()->getSystemId(),
            qgcApp()->toolbox()->mavlinkProtocol()->getComponentId(),
            &msg,
            targetCommand,
            value
        );
        this->sendPayloadMessageOnLinkThreadSafe(sharedLink.get(), msg);
        qCDebug(PayloadControllerLog) << "command sent msg"<<msg.msgid;
    }
}

QVariantMap PayloadController::payloadStatus() const
{
    return m_payloadStatus;
}

void PayloadController::handlePayloadStatusChanged(const mavlink_payload_status_t &payloadStatus)
{
    qCDebug(PayloadControllerLog) << "recieved payload status";
    // Update the QVariantMap with the new payload status
    m_payloadStatus["pos_x"] = payloadStatus.pos_x;
    m_payloadStatus["pos_y"] = payloadStatus.pos_y;
    m_payloadStatus["pos_z"] = payloadStatus.pos_z;
    m_payloadStatus["linear_velocity_x"] = payloadStatus.linear_velocity_x;
    m_payloadStatus["linear_velocity_y"] = payloadStatus.linear_velocity_y;
    m_payloadStatus["linear_velocity_z"] = payloadStatus.linear_velocity_z;
    m_payloadStatus["angular_velocity_x"] = payloadStatus.angular_velocity_x;
    m_payloadStatus["angular_velocity_y"] = payloadStatus.angular_velocity_y;
    m_payloadStatus["angular_velocity_z"] = payloadStatus.angular_velocity_z;

    // Split the payload_additional_info string
    QString additionalInfo = QString::fromUtf8(payloadStatus.payload_additional_info);
    QStringList infoParts = additionalInfo.split('/');

    // Check if there are two parts
    if (infoParts.size() >= 2) {
        m_payloadStatus["companion_board_status"] = infoParts[0];
        m_payloadStatus["payload_board_status"] = infoParts[1];
    } else {
        // Handle the case where there are not enough parts
        m_payloadStatus["companion_board_status"] = "N/A";
        m_payloadStatus["payload_board_status"] = "N/A";
    }
    // Emit the payloadStatusChanged signal to notify QML of the changes
    emit payloadStatusChanged();
}