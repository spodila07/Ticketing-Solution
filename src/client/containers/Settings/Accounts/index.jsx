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
 *  Updated:    5/17/22 2:20 PM
 *  Copyright (c) 2014-2022. All rights reserved.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { updateSetting, updateMultipleSettings } from 'actions/settings'

import Button from 'components/Button'
import SettingItem from 'components/Settings/SettingItem'

import helpers from 'lib/helpers'
import axios from 'axios'
import Log from '../../../logger'
import EnableSwitch from 'components/Settings/EnableSwitch'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'
import UIKit from 'uikit'

@observer
class AccountsSettingsContainer extends React.Component {
  @observable passwordComplexityEnabled = false
  @observable allowUserRegistrationEnabled = false

  constructor (props) {
    super(props)

    makeObservable(this)

    this.state = {
      restarting: false
    }

    this.restartServer = this.restartServer.bind(this)
  }

  componentDidMount () {
    // helpers.UI.inputs()
  }

  componentDidUpdate (prevProps) {
    // helpers.UI.reRenderInputs()
    if (prevProps.settings !== this.props.settings) {
      if (this.passwordComplexityEnabled !== this.getSetting('accountsPasswordComplexity'))
        this.passwordComplexityEnabled = this.getSetting('accountsPasswordComplexity')
      if (this.allowUserRegistrationEnabled !== this.getSetting('allowUserRegistration'))
        this.allowUserRegistrationEnabled = this.getSetting('allowUserRegistration')
    }
  }

  restartServer () {
    this.setState({ restarting: true })

    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    axios
      .post(
        '/api/v1/admin/restart',
        {},
        {
          headers: {
            'CSRF-TOKEN': token
          }
        }
      )
      .catch(error => {
        helpers.hideLoader()
        Log.error(error.responseText)
        Log.error('Unable to restart server. Server must run under PM2 and Account must have admin rights.')
        helpers.UI.showSnackbar('Unable to restart server. Are you an Administrator?', true)
      })
      .then(() => {
        this.setState({ restarting: false })
      })
  }

  getSetting (stateName) {
    return this.props.settings.getIn(['settings', stateName, 'value'])
      ? this.props.settings.getIn(['settings', stateName, 'value'])
      : ''
  }

  updateSetting (stateName, name, value) {
    this.props.updateSetting({ stateName, name, value })
  }

  render () {
    const { active } = this.props
    return (
      <div className={active ? 'active' : 'hide'}>
        <SettingItem
          title='Allow User Registration'
          subtitle='Allow users to create accounts on the login screen.'
          component={
            <EnableSwitch
              stateName='allowUserRegistration'
              label='Enable'
              checked={this.allowUserRegistrationEnabled}
              onChange={e => {
                this.updateSetting('allowUserRegistration', 'allowUserRegistration:enable', e.target.checked)
              }}
            />
          }
        />
        <SettingItem
          title={'Password Complexity'}
          subtitle={'Require users passwords to meet minimum password complexity'}
          tooltip={'Minimum 8 characters with uppercase and numeric.'}
          component={
            <EnableSwitch
              stateName={'accountsPasswordComplexity'}
              label={'Enable'}
              checked={this.passwordComplexityEnabled}
              onChange={e => {
                this.updateSetting('accountsPasswordComplexity', 'accountsPasswordComplexity:enable', e.target.checked)
              }}
            />
          }
        />
      </div>
    )
  }
}

AccountsSettingsContainer.propTypes = {
  active: PropTypes.bool.isRequired,
  updateSetting: PropTypes.func.isRequired,
  updateMultipleSettings: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  settings: state.settings.settings
})

export default connect(mapStateToProps, { updateSetting, updateMultipleSettings })(AccountsSettingsContainer)
