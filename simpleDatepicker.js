(function ($) {

  $.fn.simpleDatepicker = function(options) {
    var settings = $.extend({}, {
      startYear: new Date().getFullYear(),
      startMonth: new Date().getMonth() + 1,
      labelText: 'Choose a date',
      lang: 'en',
      dateRange: false,
      fixedRange: false,
      fixedRangeInner: $(this).parent(),
      showInLabel: false
    }, options);

    var monthes = {
      ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
      en: ['Jan', 'Feb', 'March', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
    };

    var week = {
      ru: ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'],
      en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    };

    return this.each(function(){
      if ($(this).is('input[type="date"]')) {
        $(this).each(createDatePickerWrapper);
        $(this).each(createDatePicker);
        if(settings.dateRange) {
          $(this).each(createDateRangePicker);
          if(settings.fixedRange) {
            $(this).each(createFixedRange);
            $(this).each(setFixedRange);
          }
        }
        $(this).each(toggleDatePicker);
        $(this).each(controlDatePicker);
        $(this).each(chooseDate);
        if(settings.showInLabel) {
            $(this).each(changeDatepickerLabel);
        }
      } else {
        console.error('Illegal choice');
      }
    });

    function createDatePickerWrapper() {
      var inputParent = $(this).parent();
      inputParent.wrap('<div class="datepicker-wrapper">').addClass('datepicker-container');
      var inputWrapper = $(this).parents('.datepicker-wrapper');
      inputWrapper.css('display', 'inline-block');
      $('<span class="datepicker-label">' + settings.labelText + '</span>').prependTo(inputWrapper).css('cursor', 'pointer');
    }

    function createDatePicker() {
      var calendarObject = new MonthCalendar(settings.startYear, settings.startMonth);
      var calendarParent = $(this).parent();
      calendarParent.css('position', 'relative');
      $('<div class="datepicker"></div>').appendTo(calendarParent);
      var datePickerContainer = calendarParent.find('.datepicker');
      $('<div class="calendar-header"></div>').prependTo(datePickerContainer);
      $('<span class="visible-year"><span class="year-down date-control date-control-down"> < </span><span class="year-value">' +
        calendarObject.calendarYear +
        '</span><span class="year-up date-control date-control-up"> > </span></span>').prependTo(datePickerContainer.find('.calendar-header'));
      $('<span class="visible-month"><span class="month-down date-control date-control-down"> < </span><span class="month-value">' +
        calendarObject.calendarMonth +
        '</span><span class="month-up date-control date-control-up"> > </span></span>').appendTo(datePickerContainer.find('.calendar-header'));
      $('<div class="calendar-table">' + calendarObject.calendarBody + '</div>').appendTo(datePickerContainer);
      if(settings.dateRange) {
        calendarParent.css('float', 'left');
      } else {
        calendarParent.css('position', 'absolute');
        $(this).parent().hide();
      }
      calendarParent.find('.date-control').css('cursor', 'pointer');
      $(this).hide();
      $('label[for="' + $(this).attr('id') + '"]').hide();
    }

    function createDateRangePicker() {
      var initialDatePicker = $(this).parent();
      var dateRangePickerWrapper = $(this).parents('.datepicker-wrapper');
      initialDatePicker.clone().appendTo(dateRangePickerWrapper);
      var cloneDatePicker = initialDatePicker.next();
      var dateRangePickerItems = dateRangePickerWrapper.find('.datepicker-container');
      var initialDatePickerId = initialDatePicker.attr('id');
      var initialDateInput = initialDatePicker.children('input');
      var cloneDateInput = cloneDatePicker.children('input');
      var inputId = initialDatePicker.children('input').attr('id');
      dateRangePickerItems.wrapAll('<div class="date-range-picker">');
      var dateRangePicker = $('.date-range-picker');
      dateRangePicker.hide().css('position', 'absolute');
      if(initialDatePickerId) {
        initialDatePicker.attr('id', initialDatePickerId + '1');
        cloneDatePicker.attr('id', initialDatePickerId + '2');
      }
      if(inputId){
        cloneDateInput.attr('id', inputId + '-to');
      }
      cloneDatePicker.find('.date-control-down').addClass('date-control-disabled');
      initialDateInput.addClass('date-from');
      cloneDateInput.addClass('date-to');
      cloneDatePicker.find('td:not(.not-current-month)').addClass('disabled-day');
      cloneDateInput.each(controlDatePicker);
      cloneDateInput.each(chooseDate);
      if(settings.showInLabel) {
        cloneDateInput.each(changeDatepickerLabel);
      }
    }

    function createFixedRange() {
      $('<ul class="fixed-range"></ul>').appendTo(settings.fixedRangeInner);
      var fixedRangeList = settings.fixedRangeInner.children('.fixed-range');
      $('<li class="today fixed-range-item"><a href="javascript:void(0)">За сегодня</a></li>').prependTo(fixedRangeList);
      $('<li class="this-week fixed-range-item"><a href="javascript:void(0)">За неделю</a></li>').appendTo(fixedRangeList);
      $('<li class="this-month fixed-range-item"><a href="javascript:void(0)">За месяц</a></li>').appendTo(fixedRangeList);
    }

    function setFixedRange() {
      var fixedRanger = settings.fixedRangeInner.children('.fixed-range');
      var fixedRangerLink = fixedRanger.children('.fixed-range-item').children('a');
      var inputFrom = $(this);
      var inputTo = $(this).parents('.datepicker-wrapper').find('.date-to');

      fixedRangerLink.click(function() {
        var currentDate = new Date();
        var linkInner = $(this).parent();
        var currentDateString = getDateString(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        var dateStringFrom;
        $(this).addClass('current-range');
        linkInner.siblings().children().removeClass('current-range');
        setInputValue(inputTo, currentDateString);
        if(linkInner.hasClass('today')) {
          setInputValue(inputFrom, inputTo.val());
        } else if(linkInner.hasClass('this-week')){
          dateStringFrom = getDateString(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7);
          setInputValue(inputFrom, dateStringFrom);
        } else if(linkInner.hasClass('this-month')) {
          dateStringFrom = getDateString(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
          setInputValue(inputFrom, dateStringFrom);
        }

        var calendarTo = $(inputTo).next();
        var calendarToMonth = calendarTo.find('.month-value');
        var calendarToYear = calendarTo.find('.year-value');
        var calendarToTable = calendarTo.find('.calendar-table');

        switchDatepicker({
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          direction: false,
          yearInner: calendarToYear,
          monthInner: calendarToMonth,
          tableInner: calendarToTable
        });

      });
      inputFrom.change(function() {
        var dateFrom = new Date(inputFrom.val());

        var calendarFrom = $(inputFrom).next();
        var calendarFromMonth = calendarFrom.find('.month-value');
        var calendarFromYear = calendarFrom.find('.year-value');
        var calendarFromTable = calendarFrom.find('.calendar-table');

        switchDatepicker({
          year: dateFrom.getFullYear(),
          month: dateFrom.getMonth() + 1,
          direction: false,
          yearInner: calendarFromYear,
          monthInner: calendarFromMonth,
          tableInner: calendarFromTable
        });
      });
    }

    function controlDatePicker() {
      var controlSwitcher = $(this).parent();

      //Enable datepicker controls

      controlSwitcher.on('click', '.year-down:not(.date-control-disabled)', {direction: false}, changeYear);
      controlSwitcher.on('click', '.year-up', {direction: true}, changeYear);
      controlSwitcher.on('click', '.month-down:not(.date-control-disabled)', {direction: false}, changeMonth);
      controlSwitcher.on('click', '.month-up', {direction: true}, changeMonth);

      function changeYear(event) {
        var yearValue = $(this).parent().find('.year-value');
        var currentMonthValue = $(this).parents('.calendar-header').find('.month-value');
        var calendarTable = $(this).parents('.calendar-header').next();
        switchDatepicker({
          year: yearValue.text(),
          month: monthes[settings.lang].indexOf(currentMonthValue.text()),
          shiftYear: true,
          direction: event.data.direction,
          yearInner: yearValue,
          tableInner: calendarTable
        });
        if(settings.dateRange) {
          var calendarFrom = $(this).parents('.date-range-picker').find('.date-from').parent();
          var calendarTo = $(this).parents('.date-range-picker').find('.date-to').parent();
          var calendarYearFrom = calendarFrom.find('.year-value');
          var calendarYearTo = calendarTo.find('.year-value');
          var calendarMonthTo = calendarTo.find('.month-value');
          var calendarTableTo = calendarTo.find('.calendar-table');
          var switcherDown = calendarTo.find('.date-control-down');
          if(calendarYearFrom.text() >= calendarYearTo.text()) {
            switcherDown.addClass('date-control-disabled');
            switchDatepicker({
              year: calendarYearFrom.text() - 1,
              month: monthes[settings.lang].indexOf(calendarMonthTo.text()),
              shiftYear: true,
              direction: true,
              yearInner: calendarYearTo,
              monthInner: calendarMonthTo,
              tableInner: calendarTableTo
            });

            calendarTo.find('td').addClass('disabled-day');
            $(this).parents('.datepicker-wrapper').find('.datepicker-label').text(settings.labelText);
          } else {
              switcherDown.removeClass('date-control-disabled');
              calendarTo.find('td').removeClass('disabled-day');
          }
        }
      }

      function changeMonth(event) {
        var monthValue = $(this).parent().find('.month-value');
        var yearValue = $(this).parents('.calendar-header').find('.year-value');
        var calendarTable = $(this).parents('.calendar-header').next();
        switchDatepicker({
          year: yearValue.text(),
          month: monthes[settings.lang].indexOf(monthValue.text()),
          direction: event.data.direction,
          yearInner: yearValue,
          monthInner: monthValue,
          tableInner: calendarTable
        });
        if(settings.dateRange) {
          if($(this).parents('.datepicker').prev().hasClass('date-from')) {
            var controlCalendar = $(this).parents('.datepicker-container').next();
            var controlMonthValue = controlCalendar.find('.month-value');
            var controlYearValue = controlCalendar.find('.year-value');
            var controlCalendarTable = controlCalendar.find('.calendar-table');
            var initialMonthIndex = monthes[settings.lang].indexOf(monthValue.text());
            var controlMonthIndex = monthes[settings.lang].indexOf(controlMonthValue.text());
            var correction = 0;
            if(initialMonthIndex === 0) {
              correction = 1;
            }
            if((initialMonthIndex > controlMonthIndex && yearValue.text() === controlYearValue.text()) ||
              correction && yearValue.text() > controlYearValue.text()) {
              switchDatepicker({
                year: controlYearValue.text(),
                month: controlMonthIndex,
                direction: true,
                yearInner: controlYearValue,
                monthInner: controlMonthValue,
                tableInner: controlCalendarTable
              });
            }
          }
        }
        var initialCalendar = $(this).parents('.date-range-picker').find('.date-from').parent();
        var startMonthIndex = monthes[settings.lang].indexOf(initialCalendar .find('.month-value').text());
        var cloneCalendar = $(this).parents('.date-range-picker').find('.date-to').parent();
        var cloneMonthIndex = monthes[settings.lang].indexOf(cloneCalendar.find('.month-value').text());
        var initialYearValue = initialCalendar.find('.year-value').text();
        var cloneYearValue = cloneCalendar.find('.year-value').text();
        var switcherDown = cloneCalendar.find('.month-down');
        if(startMonthIndex >= cloneMonthIndex && initialYearValue === cloneYearValue) {
          switcherDown.addClass('date-control-disabled');
          cloneCalendar.find('td').addClass('disabled-day');
        } else {
          switcherDown.removeClass('date-control-disabled');
          cloneCalendar.find('td').removeClass('disabled-day');
        }
      }

    }

    function chooseDate() {
      var calendarTable = $(this).parent().find('.calendar-table');
      var monthValue = $(this).parent().find('.month-value');
      var yearValue = $(this).parent().find('.year-value');
      calendarTable.on('click', 'td:not(.not-current-month, .disabled-day)', function() {
        var chosenYear = yearValue.text();
        var chosenMonth = monthValue.text();
        var chosenDay = $(this).text();
        var dateInput = $(this).parents('.datepicker').prevAll('input');
        var chosenMonthIndexString = monthes[settings.lang].indexOf(chosenMonth);
        if(settings.fixedRange) {
          var fixedRangeLink = $('.fixed-range').find('a');
          fixedRangeLink.removeClass('current-range');
        }

        setInputValue(dateInput, getDateString(chosenYear, chosenMonthIndexString, chosenDay));

        if(settings.dateRange) {

          /*Disable unavaiable dates in date range picker*/

          if(dateInput.hasClass('date-from')) {
            var cloneCalendar = dateInput.parents('.date-range-picker').find('.date-to').parent();
            var cloneCalendarCells = cloneCalendar.find('td:not(.not-current-month)');
            for(var cell = 0; cell < cloneCalendarCells.length; cell++) {
              if(parseInt(cloneCalendarCells.eq(cell).text()) < parseInt($(this).text())) {
                cloneCalendarCells.eq(cell).addClass('disabled-day');
              } else {
                cloneCalendarCells.eq(cell).removeClass('disabled-day');
              }
            }
          }
        }
      });
    }

    function getDateString(year, monthIndex, day) {
      var monthIndexString = addZero(monthIndex + 1);
      var dayString = addZero(day);
      return year + '-' + monthIndexString + '-' + dayString;
    }

    function addZero(number) {
      if(number < 10) {
        return '0' + number.toString();
      } else {
        return number.toString();
      }
    }

    function setInputValue(input, value) {
      input.val(value).trigger('change');
    }

    function changeDatepickerLabel() {
      $(this).change(function() {
        var pickerLabel = $(this).parents('.datepicker-wrapper').children('.datepicker-label');
        var chosenDate = new Date($(this).val());
        var dateLit = chosenDate.getDate() + ' ' + monthes[settings.lang][chosenDate.getMonth()] + ' ' + chosenDate.getFullYear();

        if(settings.dateRange) {
          if(pickerLabel.text() === settings.labelText) {
            pickerLabel.html('<span class="label-from"></span>');
            $('<span class="label-to"></span>').appendTo(pickerLabel);
          }
          var labelFrom = pickerLabel.children('.label-from');
          var labelTo = pickerLabel.children('.label-to');
          switch ($(this).attr('class')) {
            case 'date-from' :
              labelFrom.text(dateLit);
              addSeparator(labelTo, labelFrom);
              break;
            case 'date-to' :
              labelTo.text(dateLit);
              addSeparator(labelFrom, labelFrom);
              break;
          }
        } else {
          pickerLabel.text(dateLit);
        }

        function addSeparator(verifiable, editable) {
          var labelSeparatorString = '<span class="calendar-label-separator"> - </span>';
          var labelSeparator = editable.nextAll('.calendar-label-separator');
          if(verifiable.text() && !labelSeparator.text()) {
            editable.after(labelSeparatorString);
          }
        }
      });
    }

    function switchDatepicker(switchSettings) {
      var calendarObject = shiftDate({
        year: switchSettings.year,
        month: switchSettings.month,
        shiftYear: switchSettings.shiftYear,
        direction: switchSettings.direction
      });

      renderCalendar({
        calendar: calendarObject,
        yearInner: switchSettings.yearInner,
        monthInner: switchSettings.monthInner,
        tableInner: switchSettings.tableInner
      });
    }

    function refreshMonthIndex(year, month) {
      switch (month) {
        case 0 :
          month += 12;
          year--;
          break;
        case 13 :
          month -= 12;
          year++;
          break;
      }
      return [year, month];
    }

    function shiftDate(shiftSettings) {
      shiftSettings.month++;
      var refreshedDate;
      if(shiftSettings.shiftYear) {
        if(shiftSettings.direction) {
          shiftSettings.year++;
        } else {
          shiftSettings.year--;
        }
      } else {
        if(shiftSettings.direction) {
          shiftSettings.month++;
          refreshedDate = refreshMonthIndex(shiftSettings.year, shiftSettings.month);
          shiftSettings.year = refreshedDate[0];
          shiftSettings.month = refreshedDate[1];
        } else {
          shiftSettings.month--;
          refreshedDate = refreshMonthIndex(shiftSettings.year, shiftSettings.month);
          shiftSettings.year = refreshedDate[0];
          shiftSettings.month = refreshedDate[1];
        }
      }
      return new MonthCalendar(shiftSettings.year, shiftSettings.month);
    }

    function renderCalendar(renderedSettings) {
      if(renderedSettings.monthInner) {
        renderedSettings.monthInner.text(renderedSettings.calendar.calendarMonth);
      }
      renderedSettings.yearInner.text(renderedSettings.calendar.calendarYear);
      renderedSettings.tableInner.html(renderedSettings.calendar.calendarBody);
    }

    function toggleDatePicker() {
      var label = $(this).parents('.datepicker-wrapper').children('.datepicker-label');
      var datePicker = label.next();
      label.click(function() {
        datePicker.fadeToggle('fast');
        datePicker.toggleClass('expanded');
      });
      $(document).click(function(event) {
        if($(event.target).closest('.datepicker-wrapper').length || $(event.target).closest('td').length) {
          return;
        }
        if(datePicker.hasClass('expanded')) {
          datePicker.removeClass('expanded');
          datePicker.fadeOut('fast');
        }
        event.stopPropagation();
      });
    }

    //Calendar object constructor

    function MonthCalendar(year, month) {
      var monthIndex = month - 1;
      var currentDate = new Date(year, monthIndex);
      var calendarTable = '<table><tr>';
      for(var weekDay = 0; weekDay < week[settings.lang].length; weekDay++) {
        calendarTable += '<td>' + week[settings.lang][weekDay] + '</td>';
      }
      calendarTable += '</tr>';
      for(var i = 0, j = getCurrentDay(currentDate) - 1; i < getCurrentDay(currentDate); i++, j--) {
        var beforeMonObj = new Date(year, monthIndex, -j);
        calendarTable +='<td class="not-current-month">' + beforeMonObj.getDate() + '</td>';
      }
      var daysInMonth = 1;
      while(currentDate.getMonth() === monthIndex) {
        calendarTable += '<td>' + currentDate.getDate() + '</td>';
        if(getCurrentDay(currentDate) % 7 === 6) {
          calendarTable += '<tr></tr>';
        }
        currentDate.setDate(currentDate.getDate() + 1);
        daysInMonth++;
      }
      if (getCurrentDay(currentDate)) {
        for (i = getCurrentDay(currentDate); i < 7; i++, daysInMonth++) {
          var afterMonObj = new Date(year, monthIndex, daysInMonth);
          calendarTable += '<td class="not-current-month">' + afterMonObj.getDate() + '</td>';
        }
      }
      function getCurrentDay(date) {
        var day = date.getDay();
        if (day === 0) day = 7;
          return day - 1;
      }
      var monthLocal = monthes[settings.lang][monthIndex];
      this.calendarYear = year;
      this.calendarMonth = monthLocal;
      this.calendarBody = calendarTable;
    }
  };
})(jQuery);