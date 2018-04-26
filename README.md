# gd-date-time-selector

A(nother) date time selector.

This one...

- Is a React Component.
- Makes use of out-of-the-box Bootstrap 4 css classes for styling.
- Uses icons from [fontawesome](http://fontawesome.io/icons/ "Font Awesome Homepage")

All internal date manipulation is achieved using [Moment.js](https://momentjs.com/docs/#/parsing/ "Moment.js Homepage")

The component renders an [input-group](https://getbootstrap.com/docs/4.0/components/input-group/)

## Getting Started
### Install

#### npm
`npm add gd-date-time-selector`

#### yarn
`yarn add gd-date-time-selector`

## Usage


### Import

`import DateTimeSelector from 'gd-date-time-selector'`

### JSX

`<DateTimeSelector> `

`<DateTimeSelector onChange={this.handleChange} placeholder="Date" value={'25/04/2018 15:49:06'} timeFormat={'DD/MM/YYYY HH:mm:ss'}></DateTimeSelector>`

## Props

| Prop | Type | Required | Description | Default |
| :--- | :--- | :---: | :--- | :--- |
| `onChange` | Function | | Will be called when a date time is selected. Arguments: [{value: /*formated date*/ '25/04/2018 15:49:06', moment: /*moment*/ mo]. Can be null. | null |
| `placeholder` | String | | Placeholder string. | '' |
| `value` | String | | Time formated string. | '' |
| `timeFormat` | String | | Moment supported time format | null |
