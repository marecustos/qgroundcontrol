#include "payload.h"
#include "QGCApplication.h"
#include <QDebug>
#include "Vehicle.h"
#include "MultiVehicleManager.h"
#include "LinkManager.h"
#include <QWindow>

QGC_LOGGING_CATEGORY(PayloadControllerLog, "PayloadControllerLog")

PingThread::PingThread(const QString& ipAddress) : ipAddress(ipAddress) {
    moveToThread(this);
    start();
}

void PingThread::run() {
    while (!isInterruptionRequested()) {
        QProcess pingProcess;
        pingProcess.start("ping", QStringList() << "-c" << "1" << ipAddress); // Ping once
        pingProcess.waitForFinished();
        bool success = (pingProcess.exitCode() == 0);
        emit pingResult(success);
        if(success)msleep(1000); // Wait for 1 second before pinging again
    }
}

NvidiaStateDetector::NvidiaStateDetector(void)
{
    pingThread = new PingThread("seabot-companion.local");
    pingThread->start();
    connect(pingThread, &PingThread::pingResult, this, &NvidiaStateDetector::onPingResult);
}

void NvidiaStateDetector::onPingResult(bool success) {
    emit pingResult(success);
}
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
    connect(_vehicle, &Vehicle::logMessageChanged, this, &PayloadController::handleLogMessageChanged);
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

void PayloadController::handleLogMessageChanged(const mavlink_play_tune_v2_t &loggingMessage)
{
    QString logMessage = QString(loggingMessage.tune);
    qDebug() << logMessage;
    emit logMessageReceived(logMessage);

}

PayloadLogDownloader::PayloadLogDownloader(void)
{
    qDebug()<<"Payload Log Downloader initialized";
}
void PayloadLogDownloader::refreshCompanionLog()
{
    PayloadLogDownloaderThread *thread = new PayloadLogDownloaderThread(0);
    connect(thread, &PayloadLogDownloaderThread::filesRefreshed, this, &PayloadLogDownloader::filesRefreshed);
    thread->start();
}

void PayloadLogDownloader::downloadLogs(const QString& fileName, const QString& destination)
{
    PayloadLogDownloaderThread *thread = new PayloadLogDownloaderThread(1,fileName , destination);
    thread->start();
}

PayloadLogDownloaderThread::PayloadLogDownloaderThread(int command, QObject *parent)
    : QThread(parent), m_command(command)
{
    qDebug()<<"Payload Log Downloader initialized";
}

PayloadLogDownloaderThread::PayloadLogDownloaderThread(int command,QString fileName, QString destination , QObject *parent)
    : QThread(parent), m_command(command),m_file_name(fileName),m_destination(destination)
{
    qDebug()<<"Payload Log Downloader initialized";
}

void PayloadLogDownloaderThread::run()
{
    qDebug()<<"running with command "<<m_command;
    if (m_command == 0) {
        QStringList logs;
        // Execute refresh command
        QProcess process;
        QStringList args;
        args << "-p" << m_password << "ssh" << "-oStrictHostKeyChecking=no" << "-oUserKnownHostsFile=/dev/null" << "-l" << m_username << m_host << "find" << m_remoteDir << "-type" << "f" << "-exec" << "ls" << "-l" << "{}" << "+";

        process.start("sshpass", args);
        process.waitForFinished();

        if (process.exitCode() == 0) {
            QString output = process.readAllStandardOutput();
            if (output.isEmpty()) {
                qDebug() << "No files found in the remote directory.";
            } else {
                QStringList lines = output.split("\n", Qt::SkipEmptyParts);
                foreach (const QString& line, lines) {
                    QStringList parts = line.split(QRegExp("\\s+"), Qt::SkipEmptyParts);
                    if (parts.size() >= 8) {
                        QString size = parts[4];
                        QString unit;
                        double sizeValue = size.toDouble();
                        if (sizeValue >= 1024 * 1024 * 1024) {
                            size = QString::number(sizeValue / (1024 * 1024 * 1024), 'f', 2);
                            unit = "GB";
                        } else if (sizeValue >= 1024 * 1024) {
                            size = QString::number(sizeValue / (1024 * 1024), 'f', 2);
                            unit = "MB";
                        } else if (sizeValue >= 1024) {
                            size = QString::number(sizeValue / 1024, 'f', 2);
                            unit = "KB";
                        } else {
                            unit = "B";
                        }

                        QString fileName = parts.last(); // Get the file name
                        QString fileInfo = fileName.mid(m_remoteDir.length()) + "//" + parts[5] + " " + parts[6] + " " + parts[7] + "//" + size + unit;
                        logs.append(fileInfo);
                    }
                }
            }
        } else {
            qDebug() << "Error executing SSH command:" << process.errorString();
        }
        emit filesRefreshed(logs);
    }
    else if (m_command == 1) {
        // Execute download command
        // Implement download logic here
        QProcess process;
        QStringList args;
        args << "-p" << m_password << "scp" << "-oStrictHostKeyChecking=no" << "-oUserKnownHostsFile=/dev/null" << m_username + "@" + m_host + ":" + m_remoteDir + "/" + m_file_name <<m_destination;

        process.start("sshpass", args);
        process.waitForFinished();

        if (process.exitCode() == 0) {
            qDebug() << "File downloaded successfully:" << m_file_name;
        } else {
            qDebug() << "Error downloading file:" << m_file_name << process.errorString();
        }
    }
}

SeabotVersionningThread::SeabotVersionningThread(int command, QObject *parent)
    : QThread(parent), m_command(command)
{
    qDebug()<<"SeabotVersionningThread initialized";
}

SeabotVersionningThread::SeabotVersionningThread(int command, QString debFilePath,  QObject *parent)
    : QThread(parent), m_command(command), m_deb_file_path(debFilePath)
{
    qDebug()<<"SeabotVersionningThread initialized";
}


void SeabotVersionningThread::run()
{
    if (m_command == 0) {
        QProcess process;
        process.start("dpkg-query", QStringList() << "-f" << "${Version}" << "-W" << "seabot-qgc");
        if (!process.waitForFinished()) {
            // Failed to execute the command
            emit qgcVersion("");
        } else {
            QByteArray output = process.readAllStandardOutput();
            QString version = QString::fromLatin1(output).trimmed();
            emit qgcVersion(version);
        }
    }

    else if (m_command == 1) {
        // Execute command to get companion version
        QProcess process;
        QStringList args;
        args << "-p" << m_password << "ssh" << "-oStrictHostKeyChecking=no" << "-oUserKnownHostsFile=/dev/null" << m_username + "@" + m_host << "dpkg-query -f '${Version}' -W seabotxcompanion-ros2";

        process.start("sshpass", args);
        process.waitForFinished();

        if (process.exitCode() == 0) {
            QByteArray output = process.readAllStandardOutput();
            QString version = QString::fromLatin1(output).trimmed();
            qDebug() << "Companion version:" << version;
            SeabotVersionning::broadcastCompanionVersion(version); 
        } else {
            qDebug() << "Error getting companion version:" << process.errorString();
        }
    }
    else if (m_command == 2){
        // Copy the .deb file to Nvidia device's temporary directory
        QProcess scpProcess;
        QStringList scpArgs;
        scpArgs << "-p" << m_password << "scp" << m_deb_file_path << "seabot@seabot-companion.local:/tmp/";

        scpProcess.setProcessChannelMode(QProcess::MergedChannels); // Merge standard output and standard error
        scpProcess.start("sshpass", scpArgs);
        scpProcess.waitForFinished();

        if (scpProcess.exitCode() != 0) {
            QString errorOutput = scpProcess.readAll();
            emit installationComplete(false, "Failed to copy .deb file to Nvidia device. Error: " + errorOutput);
            return;
        }

        //check successful copying
        QProcess checkFileProcess;
        QStringList checkFileArgs;
        checkFileArgs << "-p" << m_password << "ssh" << m_username + "@" + m_host << "ls" << "/tmp/" + QFileInfo(m_deb_file_path).fileName();

        checkFileProcess.setProcessChannelMode(QProcess::MergedChannels); // Merge standard output and standard error
        checkFileProcess.start("sshpass", checkFileArgs);
        checkFileProcess.waitForFinished();

        if (checkFileProcess.exitCode() != 0) {
            QString errorOutput = checkFileProcess.readAll();
            emit installationComplete(false, "Failed to check if the file exists on Nvidia device. Error: " + errorOutput);
            return;
        }

        QString checkFileOutput = checkFileProcess.readAllStandardOutput();
        if (checkFileOutput.trimmed().isEmpty()) {
            emit installationComplete(false, "File not copied to Nvidia device. ");
            return;
        }


        // Install the .deb package
        QProcess installProcess;
        QStringList installArgs;
        qDebug()<<"QFileInfo(m_deb_file_path).fileName() "<<QFileInfo(m_deb_file_path).fileName();
        installArgs << "-p" << m_password << "ssh" << "-oStrictHostKeyChecking=no" << "-oUserKnownHostsFile=/dev/null" << m_username + "@" + m_host;
        installArgs << "sudo" << "apt" << "install" << "/tmp/" + QFileInfo(m_deb_file_path).fileName();

        installProcess.setProcessChannelMode(QProcess::MergedChannels); // Merge standard output and standard error
        installProcess.start("sshpass", installArgs);
        installProcess.waitForFinished(-1);

        QString output = installProcess.readAll();
        if (output.contains("debian package is installed successfully") || output.contains("is already the newest version")) {
            emit installationComplete(true, "debian package is installed successfully");
        } else {
            emit installationComplete(false, "Failed to install .deb package on Nvidia device. Error: " + output);
        }

    }
}
QList<SeabotVersionning*> SeabotVersionning::instances;

SeabotVersionning::SeabotVersionning(void)
{
    instances.append(this); // Add the current instance to the list
    qDebug()<<"Seabot Versionning initialized";
}

void SeabotVersionning::broadcastCompanionVersion(QString version)
{
    for (SeabotVersionning* instance : instances)
    {
        instance->companionVersion(version); // Emit the companionVersion signal for each instance
    }
}

void SeabotVersionning::getQGCVersion(void)
{
    SeabotVersionningThread *thread = new SeabotVersionningThread(0);
    connect(thread, &SeabotVersionningThread::qgcVersion, this, &SeabotVersionning::qgcVersion);
    thread->start();
}

void SeabotVersionning::getCompanionVersion(void)
{
    SeabotVersionningThread *thread = new SeabotVersionningThread(1);
    connect(thread, &SeabotVersionningThread::companionVersion, this, &SeabotVersionning::companionVersion);
    thread->start();
}

void SeabotVersionning::installDebPackage(const QString& debFilePath)
{
    SeabotVersionningThread *thread = new SeabotVersionningThread(2, debFilePath);
    connect(thread, &SeabotVersionningThread::installationComplete, this, &SeabotVersionning::installationComplete);
    thread->start();
}
MonitorManager::MonitorManager(QObject *parent) : QObject(parent)
{
}

int MonitorManager::targetScreenIndexForWindow(QWindow *window)
{
    QScreen *currentScreen = window ? window->screen() : nullptr;
    if (!currentScreen)
        return -1;

    int targetScreenIndex = findScreenIndexOtherThan(currentScreen->geometry().center());
    return targetScreenIndex;
}

int MonitorManager::findScreenIndexOtherThan(const QPoint &currentScreenCenter)
{
    QList<QScreen *> screens = QGuiApplication::screens();
    for (int i = 0; i < screens.size(); ++i)
    {
        if (!screens[i]->geometry().contains(currentScreenCenter))
        {
            return i;
        }
    }
    return -1;
}