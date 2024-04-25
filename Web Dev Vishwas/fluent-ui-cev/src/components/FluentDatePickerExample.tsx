import * as React from "react"
import {
  DatePicker,
  IDatePickerStrings,
  mergeStyleSets,
  PrimaryButton,
} from "@fluentui/react"

const classNames = mergeStyleSets({
  datePicker: { margin: "10px 0" },
  button: { margin: "10px 0" },
})

const DayPickerStrings: IDatePickerStrings = {
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],

  shortMonths: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],

  days: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],

  shortDays: ["S", "M", "T", "W", "T", "F", "S"],

  goToToday: "Go to today",
  prevMonthAriaLabel: "Go to previous month",
  nextMonthAriaLabel: "Go to next month",
  prevYearAriaLabel: "Go to previous year",
  nextYearAriaLabel: "Go to next year",
  closeButtonAriaLabel: "Close date picker",
  isRequiredErrorMessage: "Field is required.",
  invalidInputErrorMessage: "Invalid date format.",
}

export const FluentDatePickerExample: React.FunctionComponent = () => {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)

  const handleDateChange = (date: Date | null | undefined) => {
    setSelectedDate(date)
  }

  const handleButtonClick = () => {
    if (selectedDate) {
      alert(`Selected Date: ${selectedDate.toLocaleDateString()}`)
    } else {
      alert("Please select a date.")
    }
  }

  return (
    <div>
      <DatePicker
        className={classNames.datePicker}
        firstDayOfWeek={1}
        strings={DayPickerStrings}
        placeholder="Select a date..."
        ariaLabel="Select a date"
        onSelectDate={handleDateChange}
      />
      <PrimaryButton
        className={classNames.button}
        text="Show Selected Date"
        onClick={handleButtonClick}
      />
    </div>
  )
}
