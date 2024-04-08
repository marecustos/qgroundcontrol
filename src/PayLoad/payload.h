#ifndef PAYLOAD_H
#define PAYLOAD_H

#include <QObject>
#include "QGCLoggingCategory.h"
#include <QVariantMap>
#include "QGCMAVLink.h"
#include "QGCToolbox.h"

class  MultiVehicleManager;
class  Vehicle;
class LinkInterface;

Q_DECLARE_LOGGING_CATEGORY(PayloadControllerLog)


class PayloadController : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QVariantMap payloadStatus READ payloadStatus NOTIFY payloadStatusChanged)

public:

    PayloadController(void);
    Q_INVOKABLE void debug(void);
    Q_INVOKABLE void sendControlCommand(const QString& target , int value);
    QVariantMap payloadStatus() const;
    bool sendPayloadMessageOnLinkThreadSafe(LinkInterface* link, mavlink_message_t message);
private slots:
    void _setActiveVehicle  (Vehicle* vehicle);
    void handlePayloadStatusChanged(const mavlink_custom_payload_control_t &payloadStatus);

signals:
    void payloadStatusChanged();
    
private:
    Vehicle* _vehicle;
    QVariantMap m_payloadStatus;
    QGCToolbox* _toolbox = nullptr;
    LinkManager*  _link_manager = nullptr;

};

#endif // PAYLOAD_H