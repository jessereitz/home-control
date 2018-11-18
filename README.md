# Home Control

Home Control is a simple application created to monitor servers on a local network.
The idea is to have a small, power efficient machine (such as a Raspberry Pi)
act as a sort of controller so you can leave your more powerful and power-hungry
machines powered off until you need them.

Home control allows you to easily see the server status, its MAC address, and IP
address. It also allows you to power it on by sending a magic packet using
wakeonlan (must be configured on your machine) and restart it and shut it down
(you will be prompted for a username and password for the machine).

## Usage

Provide a JSON config file:
```json
{
  "servers": [
    {
      "name": "Example Server",
      "mac": "52:54:00:a5:b1:b3",
      "ip": "192.168.122.57"
    }
  ]
}
```

## Features

* Monitor Status
* View MAC and IP addresses
* Power on machine
* Restart machine


## Installation

```shell
$ sudo snap install home-control
$ sudo snap connect home-control:network-observe
```
