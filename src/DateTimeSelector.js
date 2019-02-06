import React from 'react'
import PropTypes from 'prop-types'
import Calendar from './Calendar'
import { Button, InputGroup, InputGroupAddon, Input } from 'reactstrap'
import { parseDateTime } from 'date-time-parser'
import moment from 'moment'

export default class DateTimeSelector extends React.Component {

  state = {
    moment: null,
    isValidDate: true,
    isCalendarVisible: false,
    formattedValue: ''
  }

  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    buttonClasses: PropTypes.string,
    inputClasses: PropTypes.string,
    timeFormat: PropTypes.string,
    inputTimeFormat: PropTypes.string
  }

  static defaultProps = {
    value: '',
    onChange: null,
    buttonClasses: '',
    inputClasses: '',
    timeFormat: 'DD/MM/YYYY HH:mm:ss',
    inputTimeFormat: 'YYYY-MM-DDTHH:mm:ss:SSS'
  }

  componentDidMount () {
    document.body.addEventListener('click', this.hideCalendar);
    this.setValue(this.props.value);
  }
  
  componentWillUnmount () {
    this.refs.calendar.removeEventListener('click', this.hideCalendar);
    document.body.removeEventListener('click', this.hideCalendar);    
  }

  checkEventSource = (e, potentialParent) => {

    if(e.target == potentialParent) {
      return true;
    }

    let eventTargetParent = e.target.parentNode;

    while(eventTargetParent != null) {
      if(eventTargetParent == potentialParent) {
        return true;
      }
      eventTargetParent = eventTargetParent.parentNode;
    }

    return false;
  }

  hideCalendar = (e) => {
    if(this.checkEventSource(e, this.refs.calendar)) {
      return;
    }

    if (this.state.isCalendarVisible) {
      this.setState({ isCalendarVisible: false })
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setValue(nextProps.value)
    }
  }

  handleChange = (e) => {
    this.update(e.target.value);
  }

  setValue(value) {
    const mo = moment(value, this.props.inputTimeFormat);
    const initialFormattedValue = mo ? mo.format(this.props.timeFormat) : '';
    this.setState({ isValid: mo, moment: mo, formattedValue: initialFormattedValue })
  }

  update (input) {
    const mo = input && this.props.timeFormat ? moment(input, this.props.timeFormat) : parseDateTime(input)

    this.setState({ isValid: mo, moment: mo, formattedValue: input })

    if (this.props.onChange) {
      this.props.onChange(mo ? mo.format(this.props.inputTimeFormat) : '', mo);
    }
  }

  handleToggleCalendar = () => {
    this.setState({ isCalendarVisible: !this.state.isCalendarVisible })
  }

  handleCalendarSelection = (mo) => {
    this.setState({ isCalendarVisible: false, isValid: mo }, () => {
      this.update(mo ? mo.format(this.props.timeFormat) : '');
    });
  }

  render () {

    const { isValid, isCalendarVisible, moment, formattedValue } = this.state
    const { buttonClasses, inputClasses, value, placeholder, ...rest } = this.props

    return (
      <div className='position-relative'>
        <InputGroup>
          <Input
            className={`form-control ${isValid ? '' : 'text-danger'} ${inputClasses}`}
            value={formattedValue}
            onChange={this.handleChange}
            placeholder={placeholder}
          />
          <InputGroupAddon addonType="append">
            <Button
              className={buttonClasses}
              onClick={this.handleToggleCalendar} >
              <i className='fa fa-calendar' />
            </Button>
          </InputGroupAddon>
        </InputGroup>
        <div ref="calendar">
          <Calendar asDropDown visible={isCalendarVisible} value={moment} onSubmit={this.handleCalendarSelection} />
        </div>  
      </div>
    )
  }
}
