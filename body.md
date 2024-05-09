# Features

1. **Olympios Sensor Data Reading Page**
   - Created a dedicated page for reading sensor data from the Olympios sensor.

2. **Payload Control Page**
   - Improved user experience by allowing the creation of a communication link for the payload directly from the control page, enabling easy connection and disconnection.
   - Implemented buttons and switches on the payload control page to enable direct control of the payload, providing a more intuitive user interface.

3. **Improved Joystick Control**
   - Restricted joystick button commands to the payload control page to prevent unintended actions on the robot, ensuring safer operation.
   - Added an interface to show the action of each joystick button. In the future, users will be able to customize button assignments to map the buttons as they prefer.

4. **Logo Update**
   - Replaced the Ardusub logo with the Marecustos logo.

5. **Dynamic Payload Interface**
   - Automatically detects which payload is connected and adjusts the control interface accordingly on the payload page.

6. **Software Information Display**
   - Added the feature of displaying software information in the payload page, including companion CPU and memory usage, and Linux kernel version.

7. **NVIDIA State Indicator**
   - Added an indicator for the NVIDIA state (ON / OFF) to show the connection status of the companion computer.

8. **Logging Feature**
   - Added the ability to download companion computer logs from the payload page in QGC, making it easier to debug and identify any issues.
   - Display live logs from the companion computer ROS Node, allowing users to monitor logs in real-time.

9. **Camera Speed Control**
   - Added speed control for the camera and y rotation, allowing users to increase/decrease rotation speed as needed.

10. **Standalone Payload Page**
    - Payload page now opens in a standalone window and automatically maximizes on the second screen, enabling users to control and observe payload movement simultaneously.

11. **Keyboard Shortcut**
    - Added a keyboard shortcut (P) for opening the payload page directly, without needing to navigate through the settings menu.

# Changes

- Updated dependencies to improve performance and compatibility.

# Installation

- Download the latest release from the [Releases page](https://github.com/marecustos/qgroundcontrol/releases).
- Follow the installation instructions in the README file.

# Usage

- Use the new payload control feature by navigating to the Payload tab.
- See the updated documentation for more details on how to use the new features.

# Known Issues

- **Issue 1:** Sporadic Glitching (so Rare).

# Contributors

- [@ridha-mastouri](https://github.com/ridha-mastouri)
- [@MblRobotics](https://github.com/MblRobotics)
- [@offgrid88](https://github.com/offgrid88)

# Changelog

- Detailed changelog can be found [here](https://github.com/marecustos/qgroundcontrol/commits/seabot_qgc_v1.0.0).

# What's Changed
- Seabot stable v4.3 dev mahmoud by @MblRobotics in [#1](https://github.com/marecustos/qgroundcontrol/pull/1)
- Workflow for Seabot qgc by @offgrid88 in [#3](https://github.com/marecustos/qgroundcontrol/pull/3)
- Update ubuntu-20.04-workflow.yml by @offgrid88 in [#4](https://github.com/marecustos/qgroundcontrol/pull/4)
- Seabot stable v4.3 dev mahmoud by @MblRobotics in [#5](https://github.com/marecustos/qgroundcontrol/pull/5)
- Added webengine to docker build by @offgrid88 in [#6](https://github.com/marecustos/qgroundcontrol/pull/6)
- Fixing dependencies for webengine by @offgrid88 in [#7](https://github.com/marecustos/qgroundcontrol/pull/7)
- Fixing workflow build by @offgrid88 in [#8](https://github.com/marecustos/qgroundcontrol/pull/8)
- QGC config persistence inside container by @offgrid88 in [#9](https://github.com/marecustos/qgroundcontrol/pull/9)
- Implement new Payload control GUI and use direct Mavlink messages by @MblRobotics in [#10](https://github.com/marecustos/qgroundcontrol/pull/10)
- Sync PR Seabot stable v4.3 dev aymen by @offgrid88 in [#11](https://github.com/marecustos/qgroundcontrol/pull/11)
- Seabot stable v4.3 dev mahmoud by @MblRobotics in [#12](https://github.com/marecustos/qgroundcontrol/pull/12)
- Seabot stable v4.3 dev aymen by @offgrid88 in [#13](https://github.com/marecustos/qgroundcontrol/pull/13)

# New Contributors
- @MblRobotics made their first contribution in [#1](https://github.com/marecustos/qgroundcontrol/pull/1)
- @offgrid88 made their first contribution in [#3](https://github.com/marecustos/qgroundcontrol/pull/3)
