import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

export default class Calendar extends React.Component {

  state = {
    days: [],
    months: [],
    years: [],
    page: moment(),
    view: 'D',
    selection: null
  }

  static propTypes = {
    visible: PropTypes.bool,
    value: PropTypes.object, // a moment
    disableTime: PropTypes.bool,
    format: PropTypes.string,
    onSubmit: PropTypes.func,
    asDropDown: PropTypes.bool
  }

  static defaultProps = {
    visible: false,
    value: null,
    disableTime: false,
    format: 'L HH:mm:ss',
    onSubmit: null,
    asDropDown: false
  }

  componentWillMount() {
    this.setState({ selection: this.props.value }, () => {
      if (this.props.visible) {
        this.updatePage(this.state.selection ? this.state.selection : this.state.page, this.state.selection, 'D')
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.selection) {
      this.setState({ selection: nextProps.value, page: nextProps.value === null ? moment() : nextProps.value }, () => {
        this.updatePage(this.state.selection ? this.state.selection : this.state.page, this.state.selection, 'D')
      })
    }

    if (nextProps.visible !== this.props.visible) {
      if (nextProps.visible) {
        this.updatePage(this.state.selection ? this.state.selection : this.state.page, this.state.selection, 'D')
      }
    }
  }

  updatePage = (newPage, value, view) => {
    const daysOfWeek = moment.weekdaysMin()
    daysOfWeek.push(daysOfWeek.shift()) // Monday 1st

    this.setState({
      dow: daysOfWeek,
      days: this.generateDays(newPage, value),
      months: this.generateMonths(newPage, value),
      years: this.generateYears(newPage, value),
      view: view,
      page: newPage,
      selection: value
    })
  }

  gen = (mo, gridSize, rowSize, stepper, selected, formatString) => {
    const result = []
    const now = moment()
    for (let i = 0; i < gridSize; i++) {
      const nextDate = moment(mo).add(i, stepper)
      if (i % rowSize === 0) {
        result.push([])
      }

      result[result.length - 1].push({
        m: nextDate,
        selected: selected && (selected.format(formatString) === nextDate.format(formatString)),
        isToday: nextDate.format(formatString) === now.format(formatString)
      })
    }
    return result
  }

  generateDays = (page, selected) => {
    const startOfMonth = moment(page).startOf('month')
    const startFillCount = startOfMonth.day()
    startOfMonth.subtract(startFillCount !== 0 ? startFillCount - 1 : 6, 'days')

    const result = this.gen(startOfMonth, 42, 7, 'days', selected, 'dWWYY')

    return result.map((d, i) => {
      return d.map(inner => {
        inner.overflow = inner.m.month() !== page.month()
        return inner
      })
    })
  }

  generateMonths = (page, selected) => {
    const startOfYear = moment(page).startOf('year')
    return this.gen(startOfYear, 12, 4, 'month', selected, 'MMMYY')
  }

  generateYears = (page, selected) => {
    const startOfYear = moment(page).year((parseInt(page.year() / 10, 10) * 10) - 1).startOf('year')
    return this.gen(startOfYear, 16, 4, 'year', selected, 'YYYY')
  }

  handleDateSelected = (selection) => {
    if (this.state.selection) {
      this.updatePage(this.state.page, moment(this.state.selection).set({ 'year': selection.m.year(), 'month': selection.m.month(), 'date': selection.m.date() }), this.state.view)
    } else {
      this.updatePage(this.state.page, selection.m, this.state.view)
    }
  }

  handleMonthSelected = (selection) => {
    this.updatePage(selection.m, this.state.selection, 'D')
  }

  handleYearSelected = (selection) => {
    this.updatePage(selection.m, this.state.selection, 'M')
  }

  handleSetTimeStartOfDay = () => {
    if (this.state.selection) {
      this.updatePage(this.state.page, moment(this.state.selection).startOf('day'), this.state.view)
    }
  }

  handleSetTimeEndOfDay = () => {
    if (this.state.selection) {
      this.updatePage(this.state.page, moment(this.state.selection).set({ 'hour': 23, 'minute': 59, 'second': 59 }), this.state.view)
    }
  }

  handleClickNow = () => {
    this.updatePage(moment(), moment(), this.state.view)
  }

  handleClickClear = () => {
    this.updatePage(moment(), null, this.state.view)
  }

  moveOn = (goForward) => {
    switch (this.state.view) {
      case 'D':
        this.updatePage(moment(this.state.page).add(goForward ? 1 : -1, 'month'), this.state.selection, this.state.view)
        break
      case 'M':
        this.updatePage(moment(this.state.page).add(goForward ? 1 : -1, 'year'), this.state.selection, this.state.view)
        break
      case 'Y':
        this.updatePage(moment(this.state.page).add(goForward ? 10 : -10, 'year'), this.state.selection, this.state.view)
        break
      default:
        break
    }
  }

  handleClickPrevious = () => {
    this.moveOn(false)
  }

  handleClickNext = () => {
    this.moveOn(true)
  }

  parseTime = (value, max) => {
    const parsed = parseInt(value || '0', 10)
    return (parsed >= 0 && parsed <= max)
  }

  handleUpdateHour = (e) => {
    if (this.parseTime(e.target.value, 23)) {
      this.updatePage(this.state.page, moment(this.state.selection).set({ 'hour': e.target.value }), this.state.view);
    }
  }

  handleUpdateMinute = (e) => {
    if (this.parseTime(e.target.value, 59)) {
      this.updatePage(this.state.page, moment(this.state.selection).set({ 'minute': e.target.value }), this.state.view);
    }
  }

  handleUpdateSecond = (e) => {
    if (this.parseTime(e.target.value, 59)) {
      this.updatePage(this.state.page, moment(this.state.selection).set({ 'second': e.target.value }), this.state.view);
    }
  }

  handleToggleView = (view) => {
    this.setState({ view: view })
  }

  handleSubmit = () => {
    if (this.props.onSubmit) {
      this.props.onSubmit(this.state.selection)
    }
  }

  render () {
    const { dow, view, page, days, months, years, selection } = this.state
    const { asDropDown, visible, format, disableTime } = this.props

    const timeDisable = !selection
    const formattedDate = selection ? selection.format(format) : ''

    const formattedTime = {
      hour: selection ? selection.format('HH') : 'HH',
      minute: selection ? selection.format('mm') : 'MM',
      second: selection ? selection.format('ss') : 'SS'
    }

    const css = !visible ? 'd-none ' : asDropDown ? ' position-absolute' : ' '
    const styles = !asDropDown ? { width: '300px' } : { zIndex: 999, right: '0px', width: '300px' }

    return (
      <div className={`picker card ${css}`} style={styles}>
        <div className='card-header py-0 px-0 d-flex justify-content-between bg-secondary'>
          <ButtonGroup>
            <HeadButton onClick={() => this.handleToggleView('M')} text={page.format('MMMM')} />
          </ButtonGroup>

          <ButtonGroup>
            <HeadButton onClick={() => this.handleToggleView('Y')} text={page.year()} />
            <HeadButton onClick={this.handleClickPrevious} icon='arrow-left' />
            <HeadButton onClick={this.handleClickNext} icon='arrow-right' />
          </ButtonGroup>
        </div>

        {view === 'D' && <Grid data={days} format='D' width={13} onClick={this.handleDateSelected}><DowHeader dow={dow} /></Grid>}
        {view === 'M' && <Grid data={months} format='MMM' width={24} onClick={this.handleMonthSelected} />}
        {view === 'Y' && <Grid data={years} format='YYYY' width={24} onClick={this.handleYearSelected} />}

        {!disableTime &&
          <div className='card-footer py-2 d-flex justify-content-center align-items-center bg-light'>
            <button disabled={timeDisable} onClick={this.handleSetTimeStartOfDay} type='button' className='btn btn-sm btn-light'><i className='fa fa-step-backward text-secondary' /></button>
            <TimeInput disabled={timeDisable} onChange={this.handleUpdateHour} value={formattedTime.hour} max={23} placeholder='HH' />&nbsp;:&nbsp;
            <TimeInput disabled={timeDisable} onChange={this.handleUpdateMinute} value={formattedTime.minute} max={59} placeholder='MM' />&nbsp;:&nbsp;
            <TimeInput disabled={timeDisable} onChange={this.handleUpdateSecond} value={formattedTime.second} max={59} placeholder='SS' />
            <button disabled={timeDisable} onClick={this.handleSetTimeEndOfDay} type='button' className='btn btn-sm btn-light'><i className='fa fa-step-forward text-secondary' /></button>
          </div>
        }

        <div className='card-footer py-0 pr-0 d-flex justify-content-between align-items-center bg-light'>
          <p className='mb-0'><small><b>{formattedDate}</b></small></p>
          <ButtonGroup>
            <button onClick={this.handleClickClear} type='button' className='btn btn-sm btn-light' disabled={timeDisable}><i className='fa fa-trash-o text-primary' /></button>
            <button onClick={this.handleClickNow} type='button' className='btn btn-sm btn-light'><i className='fa fa-circle text-primary' /></button>
            <button onClick={this.handleSubmit} type='button' className='btn btn-sm btn-light'><i className='fa fa-check text-success' /></button>
          </ButtonGroup>
        </div>
      </div>
    )
  }
}

const HeadButton = ({ onClick, icon, text }) =>
  <button type='button' className='btn btn-sm btn-secondary' onClick={onClick}><i className={`fa fa-${icon}`} /> {text}</button>

const TimeInput = (props) =>
  <input type='text' className='form-control form-control-sm w-25'
    onFocus={(e) => e.target.select()}
    {...props} />

const DowHeader = ({ dow = [], days, onClick }) =>
  <Row>
    {dow.map((d, i) => {
      return <div key={d} className='px-0 py-0 m-0 text-center' style={{ width: '13%' }}><small><strong>{d}</strong></small></div>
    })}
  </Row>

const Grid = ({ data, format, onClick, width, children }) =>
  <div className='card-body pt-1 pl-2 pr-2 pb-1'>
    {children}
    {data.map((d, i) => {
      return <GridRow key={i} dates={d} format={format} onClick={onClick} width={width} />
    })}
  </div>

const GridRow = ({ dates, format, width, onClick }) =>
  <Row>
    {dates.map(function (d, i) {
      return <GridButton key={d.m.unix()} date={d} format={format} onClick={onClick} width={width} />
    })}
  </Row>

const GridButton = ({ date, format, disabled, onClick, width }) => {
  let c = 'py-1 px-0 btn btn-sm text-center '

  if (disabled) {
    c += 'btn-secondary disabled'
  } else {
    if (date.selected) {
      c += 'btn-success'
    } else {
      c += (date.isToday) ? 'btn-outline-info ' : 'btn-light '

      if (date.overflow) {
        c += 'text-muted  '
      }
    }
  }

  return (
    <button type='button' onClick={() => onClick(date)} className={c} style={{ width: width + '%' }}>{date.m.format(format)}</button>
  )
}

const Row = ({ children }) =>
  <div className='mb-1 d-flex flex-nowrap justify-content-between align-items-center'>{children}</div>

const ButtonGroup = ({ children }) =>
  <div className='btn-group' role='group'>{children}</div>
