/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     Chris Brame
 *  Updated:    1/20/19 4:43 PM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

var utils = require('../helpers/utils')
var path = require('path')
var AnsiUp = require('ansi_up')
var ansiUp = new AnsiUp.default()
var Tail = require('tail').Tail
var fs = require('fs-extra')

var logFile = path.join(__dirname, '../../logs/error.log')

var events = {}

function register (socket) {
  events.onLogsFetch(socket)
}

function eventLoop () {}
events.onLogsFetch = function (socket) {
  socket.on('logs:fetch', function () {
    fs.exists(logFile, function (exists) {
      if (exists) {
        var contents = fs.readFileSync(logFile, 'utf8')
        utils.sendToSelf(socket, 'logs:data', ansiUp.ansi_to_html(contents))

        var tail = new Tail(logFile)

        tail.on('line', function (data) {
          utils.sendToSelf(socket, 'logs:data', ansiUp.ansi_to_html(data))
        })
      } else {
        utils.sendToSelf(socket, 'logs:data', '\r\nInvalid Log File...\r\n')
      }
    })
  })
}

module.exports = {
  events: events,
  eventLoop: eventLoop,
  register: register
}
