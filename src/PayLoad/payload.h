#ifndef PAYLOAD_H
#define PAYLOAD_H

#include <QObject>
#include "QGCLoggingCategory.h"
#include <QVariantMap>
#include "QGCMAVLink.h"
#include "QGCToolbox.h"
#include <QThread>

class  MultiVehicleManager;
class  Vehicle;
class LinkInterface;

Q_DECLARE_LOGGING_CATEGORY(PayloadControllerLog)

class PingThread : public QThread
{
    Q_OBJECT
public:
    PingThread(const QString& ipAddress);
signals:
    void pingResult(bool success);
protected:
    void run() override;
private:
    QString ipAddress;
};

class PayloadController : public QObject
{
    Q_OBJECT
    Q_PROPERTY(QVariantMap payloadStatus READ payloadStatus NOTIFY payloadStatusChanged)
    Q_PROPERTY(QString activePayloadName READ activePayloadName NOTIFY activePayloadNameChanged)

public:

    PayloadController(void);
    Q_INVOKABLE void debug(void);
    Q_INVOKABLE void sendControlCommand(const QString& target , int value);
    Q_INVOKABLE void sendPayloadNameRequest(int payload_id , const QString& payload_name , const QString& payload_state , int result  );
    QVariantMap payloadStatus() const;
    bool sendPayloadMessageOnLinkThreadSafe(LinkInterface* link, mavlink_message_t message);
    QString activePayloadName() const { return _activePayloadName; }
private slots:
    void _setActiveVehicle  (Vehicle* vehicle);
    void handlePayloadStatusChanged(const mavlink_custom_payload_control_t &payloadStatus);
    void handleConnectedPayloadChanged(const mavlink_connected_payload_t &connectedPayload);

signals:
    void payloadStatusChanged();
    void activePayloadNameChanged();
    
private:
    Vehicle* _vehicle;
    QVariantMap m_payloadStatus;
    QGCToolbox* _toolbox = nullptr;
    LinkManager*  _link_manager = nullptr;
    QString _activePayloadName;

};

class NvidiaStateDetector : public QObject
{
    Q_OBJECT

public:

    NvidiaStateDetector(void);

private slots:
    void onPingResult(bool success);

signals:
    void pingResult(bool success);

private:
    PingThread* pingThread;

};

#endif // PAYLOAD_H